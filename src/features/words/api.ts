import { apiFetch } from "@/api/http";
import {
  searchLimitsSchema,
  vocabularyPageSchema,
  wordSchema,
  wordSearchResponseSchema,
  type VocabularyParams,
  type WordCreate,
  type WordUpdate,
} from "./schemas";

export function searchWords(query: string, language: string, signal?: AbortSignal) {
  return apiFetch("/words/search", { query: { query, language }, schema: wordSearchResponseSchema, signal });
}

export function getSearchLimits(signal?: AbortSignal) {
  return apiFetch("/words/search-limits", { schema: searchLimitsSchema, signal });
}

export function getVocabulary(params: VocabularyParams, signal?: AbortSignal) {
  return apiFetch("/words/vocabulary", {
    // An empty search means "no filter"; leave it out of the URL.
    query: { ...params, query: params.query || undefined },
    schema: vocabularyPageSchema,
    signal,
  });
}

export function saveWord(word: WordCreate) {
  return apiFetch("/words/save", { method: "POST", body: word, schema: wordSchema });
}

export function updateWord(wordId: number, changes: WordUpdate) {
  return apiFetch(`/words/${wordId}`, { method: "PATCH", body: changes, schema: wordSchema });
}

export function deleteWord(wordId: number) {
  return apiFetch(`/words/${wordId}`, { method: "DELETE", schema: null });
}
