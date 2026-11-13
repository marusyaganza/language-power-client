import { z } from "zod";

// ExampleItem
export const exampleSchema = z.object({
  text: z.string(),
  translation: z.string().nullable().optional(),
});
export type Example = z.infer<typeof exampleSchema>;

// WordOut — search results have `uuid` (dictionary id) and no `id`; saved words have `id`.
export const wordSchema = z.object({
  id: z.number().nullable().optional(),
  uuid: z.string().nullable().optional(),
  name: z.string(),
  language: z.string(),
  stems: z.array(z.string()),
  defs: z.array(z.string()),
  fl: z.string(),
  audio_url: z.string().nullable(),
  transcription: z.string().nullable(),
  img_url: z.string().nullable(),
  img_desc: z.string().nullable(),
  examples: z.array(exampleSchema),
  saved: z.boolean().default(false),
  gender: z.enum(["masculine", "feminine", "both"]).nullable().optional(),
  offensive: z.boolean().default(false),
});
export type Word = z.infer<typeof wordSchema>;

// WordSearchResponse
export const wordSearchResponseSchema = z.object({
  words: z.array(wordSchema),
  suggestions: z.array(z.string()).default([]),
  /** Filled only when the backend runs with mocked dictionaries and the query isn't one of them. */
  mock_queries: z.array(z.string()).default([]),
  /** Searches left in this language after this one; null when searches aren't limited. */
  searches_left: z.number().nullable().default(null),
});
export type WordSearchResponse = z.infer<typeof wordSearchResponseSchema>;

// SearchLimits — `searches_left` is keyed by language; null values mean unlimited.
export const searchLimitsSchema = z.object({
  limit: z.number().nullable(),
  searches_left: z.record(z.string(), z.number().nullable()),
});
export type SearchLimits = z.infer<typeof searchLimitsSchema>;

// VocabularyPage
export const vocabularyPageSchema = z.object({
  items: z.array(wordSchema),
  page: z.number(),
  page_size: z.number(),
  total: z.number(),
  total_pages: z.number(),
});
export type VocabularyPage = z.infer<typeof vocabularyPageSchema>;

// VocabularySortBy / SortOrder
export type VocabularySortBy = "created_at" | "name";
export type SortOrder = "asc" | "desc";

export interface VocabularyParams {
  language: string;
  query?: string;
  page: number;
  sort_by: VocabularySortBy;
  sort_order: SortOrder;
}

// WordCreate
export interface WordCreate {
  uuid?: string | null;
  name: string;
  language: string;
  stems?: string[];
  defs: string[];
  fl: string;
  audio_url?: string | null;
  transcription?: string | null;
  img_url?: string | null;
  img_desc?: string | null;
  gender?: "masculine" | "feminine" | "both" | null;
  examples?: Example[];
  offensive?: boolean;
}

// WordUpdate — fields left out are unchanged.
export interface WordUpdate {
  defs?: string[];
  examples?: Example[];
  audio_url?: string | null;
  /** From POST /audio/generate: the server stores that audio and sets `audio_url`. Never sent with `audio_url`. */
  audio_token?: string;
  img_url?: string | null;
  img_desc?: string | null;
}

// AudioGenerateRequest
export interface AudioGenerateRequest {
  language: string;
  /** The word's name. */
  text: string;
  engine?: string;
  voice?: string;
}

// GeneratedAudio — held by the server for 24 hours; saving the word with `token` keeps it.
export const generatedAudioSchema = z.object({
  token: z.string(),
  /** A `data:audio/mpeg` URL: plays right away, nothing is stored yet. */
  preview: z.string(),
  engine: z.string(),
  voice: z.string(),
});
export type GeneratedAudio = z.infer<typeof generatedAudioSchema>;

// GET /audio/voices — one item per engine.
export const engineVoicesSchema = z.object({
  engine: z.string(),
  voices: z.array(z.string()),
  default: z.string(),
});
export type EngineVoices = z.infer<typeof engineVoicesSchema>;
