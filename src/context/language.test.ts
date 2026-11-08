import { describe, expect, it } from "vitest";
import { languageOptionLabel, offeredLanguages, startingLanguage, SUPPORTED_LANGUAGES } from "./language";

const values = (options: { value: string }[]) => options.map((option) => option.value);

describe("offeredLanguages", () => {
  it("keeps only the languages the server enables, in the app's order", () => {
    expect(values(offeredLanguages(["en", "es"]))).toEqual(["es", "en"]);
  });

  it("offers every language when the server doesn't say", () => {
    expect(offeredLanguages(undefined)).toEqual(SUPPORTED_LANGUAGES);
  });

  it("ignores languages the app doesn't know, and never offers none", () => {
    expect(values(offeredLanguages(["es", "fr"]))).toEqual(["es"]);
    expect(offeredLanguages(["fr"])).toEqual(SUPPORTED_LANGUAGES);
  });
});

describe("startingLanguage", () => {
  const demo = offeredLanguages(["en", "es"]);

  it("starts with the saved language when it's offered", () => {
    expect(startingLanguage("en", demo)).toBe("en");
  });

  it("falls back to the default when the saved language isn't offered here", () => {
    expect(startingLanguage("ko", demo)).toBe("es");
    expect(startingLanguage(undefined, demo)).toBe("es");
  });

  it("takes the first offered language when even the default isn't offered", () => {
    expect(startingLanguage("ko", offeredLanguages(["en"]))).toBe("en");
  });
});

describe("languageOptionLabel", () => {
  it("adds a language's status after its name", () => {
    expect(languageOptionLabel({ value: "ko", label: "Korean", status: "beta" })).toBe("Korean (beta)");
    expect(languageOptionLabel({ value: "ko", label: "Korean", status: "new" })).toBe("Korean (new)");
  });

  it("is the name alone without a status", () => {
    expect(languageOptionLabel({ value: "en", label: "English" })).toBe("English");
  });

  it("marks Korean as beta, keeping its name plain for sentences", () => {
    const korean = SUPPORTED_LANGUAGES.find((option) => option.value === "ko");
    expect(korean && [korean.label, languageOptionLabel(korean)]).toEqual(["Korean", "Korean (beta)"]);
  });
});
