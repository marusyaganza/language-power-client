import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/api/errors";
import { getCurrentUser, login } from "./api";

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

describe("getCurrentUser", () => {
  it("returns the user when the session is valid", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: 2, email: "a@b.c" }));

    await expect(getCurrentUser()).resolves.toEqual({ id: 2, email: "a@b.c" });
  });

  it.each([401, 403])("returns null when the backend answers %i", async (status) => {
    fetchMock.mockResolvedValue(jsonResponse({ detail: "Not authenticated" }, status));

    await expect(getCurrentUser()).resolves.toBeNull();
  });

  it("rethrows other failures", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ detail: "boom" }, 500));

    await expect(getCurrentUser()).rejects.toBeInstanceOf(ApiError);
  });
});

describe("login", () => {
  const credentials = { email: "a@b.c", password: "secret" };

  it.each([
    [401, { detail: "Invalid credentials" }],
    [422, { detail: [{ loc: ["body", "password"], msg: "Value error, Password is too long" }] }],
  ])("reports %i as incorrect credentials", async (status, body) => {
    fetchMock.mockResolvedValue(jsonResponse(body, status));

    await expect(login(credentials)).rejects.toMatchObject({
      message: "Incorrect email or password",
      status,
    });
  });

  it("keeps the server's message for other failures", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ detail: "Service unavailable" }, 503));

    await expect(login(credentials)).rejects.toMatchObject({ message: "Service unavailable", status: 503 });
  });
});
