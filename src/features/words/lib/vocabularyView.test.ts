import { describe, expect, it } from "vitest";
import { parseVocabularyView, updateVocabularyView, vocabularyViewToParams, type VocabularyView } from "./vocabularyView";

const parse = (search: string) => parseVocabularyView(new URLSearchParams(search));

describe("parseVocabularyView", () => {
  it("uses defaults for an empty URL", () => {
    expect(parse("")).toEqual({ query: "", page: 1, sortBy: "created_at", sortOrder: "desc" });
  });

  it("reads every param", () => {
    expect(parse("?q=ser&page=3&sort=name&order=desc")).toEqual({
      query: "ser",
      page: 3,
      sortBy: "name",
      sortOrder: "desc",
    });
  });

  it("gives each sort field its natural default order", () => {
    expect(parse("?sort=name").sortOrder).toBe("asc");
  });

  it.each(["?page=0", "?page=-2", "?page=1.5", "?page=abc"])("ignores an invalid page in %s", (search) => {
    expect(parse(search).page).toBe(1);
  });

  it("ignores unknown sort values", () => {
    expect(parse("?sort=rating&order=sideways")).toMatchObject({ sortBy: "created_at", sortOrder: "desc" });
  });
});

describe("vocabularyViewToParams", () => {
  it("leaves defaults out", () => {
    expect(vocabularyViewToParams({ query: "", page: 1, sortBy: "created_at", sortOrder: "desc" }).toString()).toBe("");
    expect(vocabularyViewToParams({ query: "", page: 1, sortBy: "name", sortOrder: "asc" }).toString()).toBe(
      "sort=name",
    );
  });

  it("round-trips a non-default view", () => {
    const view: VocabularyView = { query: "ser", page: 2, sortBy: "name", sortOrder: "desc" };
    expect(parseVocabularyView(vocabularyViewToParams(view))).toEqual(view);
  });
});

describe("updateVocabularyView", () => {
  const view: VocabularyView = { query: "a", page: 4, sortBy: "created_at", sortOrder: "desc" };

  it("keeps the page when only the page changes", () => {
    expect(updateVocabularyView(view, { page: 5 }).page).toBe(5);
  });

  it.each([{ query: "ab" }, { sortBy: "name" as const }, { sortOrder: "asc" as const }])(
    "goes back to page 1 on %j",
    (change) => {
      expect(updateVocabularyView(view, change).page).toBe(1);
    },
  );

  it("keeps the page when a value is set to what it already is", () => {
    expect(updateVocabularyView(view, { query: "a" }).page).toBe(4);
  });
});
