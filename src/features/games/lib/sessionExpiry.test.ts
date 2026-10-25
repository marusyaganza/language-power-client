import { describe, expect, it } from "vitest";
import { ApiError } from "@/api/errors";
import { isSessionExpired, sessionExpiredMessage } from "./sessionExpiry";

describe("isSessionExpired", () => {
  it("is true for a 404 from the API", () => {
    expect(isSessionExpired(new ApiError("http", "Session not found", 404))).toBe(true);
  });

  it.each([
    ["an answered question (409)", new ApiError("http", "Already answered", 409)],
    ["a network failure", new ApiError("network", "Can't reach the server", null)],
    ["a non-API error", new Error("boom")],
  ])("is false for %s", (_, error) => {
    expect(isSessionExpired(error)).toBe(false);
  });
});

describe("sessionExpiredMessage", () => {
  it("says the answer sent after expiry is lost and earlier ones are kept", () => {
    expect(sessionExpiredMessage("answer", 2)).toBe(
      "No answer for 20 minutes, so the game ended. Your last answer came in after that, so it wasn't saved. " +
        "Your earlier answers were. Start a new game to continue.",
    );
  });

  it("doesn't mention earlier answers when there were none", () => {
    expect(sessionExpiredMessage("answer", 0)).toBe(
      "No answer for 20 minutes, so the game ended. Your answer came in after that, so it wasn't saved. " +
        "Start a new game to continue.",
    );
  });

  it("says every answer was saved when only the result was too late", () => {
    expect(sessionExpiredMessage("result", 3)).toBe(
      "No answer for 20 minutes, so the game ended. All your answers were saved. Start a new game to continue.",
    );
  });

  it("says nothing about answers when the player gave none", () => {
    expect(sessionExpiredMessage("result", 0)).toBe(
      "No answer for 20 minutes, so the game ended. Start a new game to continue.",
    );
  });
});
