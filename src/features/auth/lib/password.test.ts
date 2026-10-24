import { describe, expect, it } from "vitest";
import { newPasswordError } from "./password";

const tooShort = "Password must be at least 8 characters";
const tooLong = "Password is too long (max 72 bytes; some characters like é count as 2)";

describe("newPasswordError", () => {
  it("requires at least 8 characters", () => {
    expect(newPasswordError("a".repeat(7))).toBe(tooShort);
    expect(newPasswordError("a".repeat(8))).toBeNull();
  });

  it("counts an emoji as one character, like the server", () => {
    // 7 code points but 8 UTF-16 units: pw.length would wrongly accept it.
    expect(newPasswordError("a".repeat(6) + "😀")).toBe(tooShort);
    expect(newPasswordError("a".repeat(7) + "😀")).toBeNull();
  });

  it("limits the password to 72 UTF-8 bytes", () => {
    expect(newPasswordError("a".repeat(72))).toBeNull();
    expect(newPasswordError("a".repeat(73))).toBe(tooLong);
    // 40 characters but 80 bytes: maxLength={72} would let it through.
    expect(newPasswordError("é".repeat(40))).toBe(tooLong);
    expect(newPasswordError("é".repeat(36))).toBeNull();
  });

  it("allows spaces and has no character-class rules", () => {
    expect(newPasswordError("        ")).toBeNull();
    expect(newPasswordError("all lowercase words")).toBeNull();
  });
});
