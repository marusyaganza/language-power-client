import { z } from "zod";
import { apiFetch } from "@/api/http";
import {
  engineVoicesSchema,
  generatedAudioSchema,
  searchLimitsSchema,
  vocabularyPageSchema,
  wordSchema,
  wordSearchResponseSchema,
  type AudioGenerateRequest,
  type VocabularyParams,
  type WordCreate,
  type WordUpdate,
} from "./schemas";

/** A POST: each search can use up one of the account's searches, so the backend doesn't accept a GET. */
export function searchWords(query: string, language: string, signal?: AbortSignal) {
  return apiFetch("/words/search", {
    method: "POST",
    body: { query, language },
    schema: wordSearchResponseSchema,
    signal,
  });
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

/** Generates audio for a word's name. Nothing is stored until the word is saved with the returned token. */
export function generateAudio(request: AudioGenerateRequest) {
  return apiFetch("/audio/generate", { method: "POST", body: request, schema: generatedAudioSchema });
}

export function getAudioVoices(language: string, signal?: AbortSignal) {
  return apiFetch("/audio/voices", { query: { language }, schema: z.array(engineVoicesSchema), signal });
}
