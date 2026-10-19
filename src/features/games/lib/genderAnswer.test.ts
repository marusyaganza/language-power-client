import { describe, expect, it } from "vitest";
import { decodeGenderAnswer, encodeGenderAnswer, genderOptionResult, toggleGender } from "./genderAnswer";

const OPTIONS = ["masculine", "feminine"];

describe("gender answer", () => {
  it("encodes what's ticked the way the backend expects", () => {
    expect(encodeGenderAnswer([])).toBe("");
    expect(encodeGenderAnswer(["feminine"])).toBe("feminine");
    expect(encodeGenderAnswer(["masculine", "feminine"])).toBe("both");
    expect(encodeGenderAnswer(["feminine", "masculine"])).toBe("both");
  });

  it("decodes answers back to ticked genders", () => {
    expect(decodeGenderAnswer("")).toEqual([]);
    expect(decodeGenderAnswer("masculine")).toEqual(["masculine"]);
    expect(decodeGenderAnswer("both")).toEqual(["masculine", "feminine"]);
  });

  it("toggles one gender at a time", () => {
    expect(toggleGender("", "feminine", OPTIONS)).toBe("feminine");
    expect(toggleGender("feminine", "masculine", OPTIONS)).toBe("both");
    expect(toggleGender("both", "feminine", OPTIONS)).toBe("masculine");
    expect(toggleGender("masculine", "masculine", OPTIONS)).toBe("");
  });
});

describe("genderOptionResult", () => {
  it("marks correct, missed and wrong options", () => {
    // "Almost": feminine ticked for a noun that takes both.
    expect(genderOptionResult("feminine", ["feminine"], OPTIONS)).toBe("correct");
    expect(genderOptionResult("masculine", ["feminine"], OPTIONS)).toBe("missed");
    // Both ticked for a masculine noun.
    expect(genderOptionResult("feminine", OPTIONS, ["masculine"])).toBe("wrong");
    expect(genderOptionResult("feminine", [], ["masculine"])).toBeUndefined();
  });
});
