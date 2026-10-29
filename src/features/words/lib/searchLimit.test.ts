import { describe, expect, it } from "vitest";
import { searchLimitText } from "./searchLimit";

describe("searchLimitText", () => {
  it("counts the searches left", () => {
    expect(searchLimitText(7, 10, "English")).toBe("7 of 10 English searches left");
  });

  it("says when none are left", () => {
    expect(searchLimitText(0, 10, "Spanish")).toBe(
      "No Spanish searches left in this demo. You can still add your own words.",
    );
  });

  it("uses the singular for a limit of 1", () => {
    expect(searchLimitText(1, 1, "English")).toBe("1 of 1 English search left");
  });

  it("shows nothing when searches aren't limited", () => {
    expect(searchLimitText(null, null, "English")).toBeNull();
    expect(searchLimitText(undefined, 10, "English")).toBeNull();
  });
});
