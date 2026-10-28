import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { apiFetch, parseRetryAfter } from "./http";
import { ApiError } from "./errors";

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  fetchMock.mockReset();
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

async function expectApiError(promise: Promise<unknown>): Promise<ApiError> {
  const error = await promise.then(
    () => expect.unreachable("expected the request to fail"),
    (e: unknown) => e,
  );
  expect(error).toBeInstanceOf(ApiError);
  return error as ApiError;
}

const userSchema = z.object({ id: z.number(), email: z.string() });

describe("apiFetch", () => {
  it("sends a GET with query params, and returns parsed data", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: 1, email: "a@b.c", extra: true }));

    const user = await apiFetch("/auth/me", {
      schema: userSchema,
      query: { language: "es", page: 2, query: undefined, sort_order: null },
    });

    expect(user).toEqual({ id: 1, email: "a@b.c" });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/auth/me?language=es&page=2");
    expect(init).toMatchObject({ method: "GET", body: undefined });
    expect(init?.headers).not.toHaveProperty("Content-Type");
  });

  it("sends a JSON body", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: 1, email: "a@b.c" }, 201));

    await apiFetch("/auth/signup", {
      method: "POST",
      body: { email: "a@b.c", password: "secret123" },
      schema: userSchema,
    });

    const [, init] = fetchMock.mock.calls[0];
    expect(init?.method).toBe("POST");
    expect(init?.headers).toMatchObject({ "Content-Type": "application/json" });
    expect(init?.body).toBe(JSON.stringify({ email: "a@b.c", password: "secret123" }));
  });

  it("resolves to undefined for no-content endpoints", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(apiFetch("/words/1", { method: "DELETE", schema: null })).resolves.toBeUndefined();
  });

  it("throws an http error with FastAPI's string detail", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ detail: "Word not found" }, 404));

    const error = await expectApiError(apiFetch("/words/1", { method: "DELETE", schema: null }));

    expect(error).toMatchObject({ kind: "http", status: 404, message: "Word not found" });
  });

  it("throws an http error with readable validation messages", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ detail: [{ loc: ["query", "page"], msg: "Input should be greater than or equal to 1" }] }, 422),
    );

    const error = await expectApiError(apiFetch("/words/vocabulary", { schema: userSchema }));

    expect(error).toMatchObject({
      kind: "http",
      status: 422,
      message: "page: Input should be greater than or equal to 1",
    });
  });

  it("keeps Retry-After on an http error", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ detail: "Sorry, registration is closed for today, try again tomorrow" }), {
        status: 429,
        headers: { "Content-Type": "application/json", "Retry-After": "3600" },
      }),
    );

    const error = await expectApiError(apiFetch("/auth/signup", { method: "POST", body: {}, schema: userSchema }));

    expect(error).toMatchObject({ kind: "http", status: 429, retryAfter: 3600 });
  });

  it("has no retryAfter when the header isn't sent", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ detail: "Word not found" }, 404));

    const error = await expectApiError(apiFetch("/words/1", { method: "DELETE", schema: null }));

    expect(error.retryAfter).toBeNull();
  });

  it("falls back to the status when the error body isn't JSON", async () => {
    fetchMock.mockResolvedValue(new Response("Internal Server Error", { status: 500 }));

    const error = await expectApiError(apiFetch("/games", { schema: userSchema }));

    expect(error).toMatchObject({ kind: "http", status: 500, message: "Request failed (500)" });
  });

  it("throws a contract error naming the request and the mismatched field", async () => {
    fetchMock.mockResolvedValue(jsonResponse([{ id: 1, due_word_count: "3" }]));
    const gamesSchema = z.array(z.object({ id: z.number(), due_word_count: z.number() }));

    const error = await expectApiError(apiFetch("/games", { schema: gamesSchema }));

    expect(error.kind).toBe("contract");
    expect(error.status).toBe(200);
    expect(error.message).toMatch(/^Unexpected response from GET \/games: .* at \[0\]\.due_word_count$/);
    expect(console.error).toHaveBeenCalled();
  });

  it("throws a contract error when a success response has no JSON body", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    const error = await expectApiError(apiFetch("/auth/me", { schema: userSchema }));

    expect(error).toMatchObject({ kind: "contract", status: 204 });
  });

  it("throws a network error when the request fails", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    const error = await expectApiError(apiFetch("/auth/me", { schema: userSchema }));

    expect(error).toMatchObject({ kind: "network", status: null });
  });

  it("rethrows aborts unchanged", async () => {
    const abort = new DOMException("The operation was aborted.", "AbortError");
    fetchMock.mockRejectedValue(abort);

    await expect(apiFetch("/auth/me", { schema: userSchema })).rejects.toBe(abort);
  });
});

describe("parseRetryAfter", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("reads seconds", () => {
    expect(parseRetryAfter("120")).toBe(120);
  });

  it("reads an HTTP date as seconds from now", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-28T23:00:00Z"));

    expect(parseRetryAfter("Thu, 29 Oct 2026 00:00:00 GMT")).toBe(3600);
  });

  it("returns null for a missing or invalid header", () => {
    expect(parseRetryAfter(null)).toBeNull();
    expect(parseRetryAfter("")).toBeNull();
    expect(parseRetryAfter("soon")).toBeNull();
  });
});
