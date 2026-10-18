import { describe, expect, it } from "vitest";
import { formatIssuePath, messageFromErrorBody } from "./errors";

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
