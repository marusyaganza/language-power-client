import { describe, expect, it } from "vitest";
import { readConfig } from "./config";

describe("readConfig", () => {
  it("returns the API base URL without trailing slashes", () => {
    expect(readConfig({ VITE_API_BASE_URL: "http://localhost:8000/" })).toEqual({
      apiBaseUrl: "http://localhost:8000",
    });
  });

  it.each([undefined, "", "   "])("throws when VITE_API_BASE_URL is %j", (value) => {
    expect(() => readConfig({ VITE_API_BASE_URL: value })).toThrow(/VITE_API_BASE_URL/);
  });
});
