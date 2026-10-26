import { describe, expect, it } from "vitest";
import { ApiError, formatIssuePath, messageFromErrorBody, shouldReport } from "./errors";

describe("messageFromErrorBody", () => {
  it("uses a string detail as is", () => {
    expect(messageFromErrorBody({ detail: "Word not found" }, "fallback")).toBe("Word not found");
  });

  it("joins FastAPI validation errors with their field names", () => {
    const body = {
      detail: [
        { loc: ["body", "password"], msg: "String should have at least 8 characters", type: "string_too_short" },
        { loc: ["query", "page"], msg: "Input should be greater than or equal to 1", type: "greater_than_equal" },
      ],
    };
    expect(messageFromErrorBody(body, "fallback")).toBe(
      "password: String should have at least 8 characters; page: Input should be greater than or equal to 1",
    );
  });

  it("keeps nested field paths", () => {
    const body = { detail: [{ loc: ["body", "examples", 0, "text"], msg: "Field required" }] };
    expect(messageFromErrorBody(body, "fallback")).toBe("examples.0.text: Field required");
  });

  it.each([undefined, null, "Internal Server Error", {}, { detail: 42 }, { detail: [] }])(
    "falls back for %j",
    (body) => {
      expect(messageFromErrorBody(body, "fallback")).toBe("fallback");
    },
  );
});

describe("formatIssuePath", () => {
  it("formats object keys and array indexes", () => {
    expect(formatIssuePath(["games", 0, "due_word_count"])).toBe("games[0].due_word_count");
    expect(formatIssuePath([1, "name"])).toBe("[1].name");
  });

  it("names the root", () => {
    expect(formatIssuePath([])).toBe("(root)");
  });
});

describe("shouldReport", () => {
  it.each([
    ["a contract error", new ApiError("contract", "Unexpected response", 200), true],
    ["a server error", new ApiError("http", "Internal Server Error", 500), true],
    ["a proxy timeout", new ApiError("http", "Request failed (504)", 504), true],
    ["a client bug", new TypeError("Cannot read properties of undefined"), true],
    ["the dictionary outage", new ApiError("http", "Dictionary is unavailable, try again later", 503), false],
    ["a 4xx answer", new ApiError("http", "Word not found", 404), false],
    ["a missing session", new ApiError("http", "Not authenticated", 403), false],
    ["a network error", new ApiError("network", "Can't reach the server", null), false],
  ])("%s → %s", (_, error, expected) => {
    expect(shouldReport(error)).toBe(expected);
  });
});
