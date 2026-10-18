import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getVocabulary, searchWords } from "./api";

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });
}

const dictionaryWord = {
  uuid: "a1b2",
  name: "hola",
  language: "es",
  stems: ["hola"],
  defs: ["hello"],
  fl: "interjection",
  audio_url: null,
  transcription: null,
  img_url: null,
  examples: [{ text: "¡Hola!", translation: null }],
};

describe("getVocabulary", () => {
  it("sends paging and sorting, and leaves out an empty search", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ items: [], page: 1, page_size: 5, total: 0, total_pages: 0 }));

    await getVocabulary({ language: "es", query: "", page: 2, sort_by: "name", sort_order: "desc" });

    expect(fetchMock.mock.calls[0][0]).toBe(
      "http://api.test/words/vocabulary?language=es&page=2&sort_by=name&sort_order=desc",
    );
  });

  it("parses saved words", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ items: [{ ...dictionaryWord, id: 7, saved: true }], page: 1, page_size: 5, total: 1, total_pages: 1 }),
    );

    const page = await getVocabulary({ language: "es", page: 1, sort_by: "created_at", sort_order: "desc" });

    expect(page.items[0]).toMatchObject({ id: 7, name: "hola", saved: true });
  });
});

describe("searchWords", () => {
  it("applies the contract's defaults for `saved` and `suggestions`", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ words: [dictionaryWord] }));

    const result = await searchWords("hola", "es");

    expect(result.suggestions).toEqual([]);
    expect(result.words[0]).toMatchObject({ uuid: "a1b2", saved: false });
    expect(fetchMock.mock.calls[0][0]).toBe("http://api.test/words/search?query=hola&language=es");
  });
});
