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
  examples: z.array(exampleSchema),
  saved: z.boolean().default(false),
  gender: z.enum(["masculine", "feminine", "both"]).nullable().optional(),
});
export type Word = z.infer<typeof wordSchema>;

// WordSearchResponse
export const wordSearchResponseSchema = z.object({
  words: z.array(wordSchema),
  suggestions: z.array(z.string()).default([]),
});
export type WordSearchResponse = z.infer<typeof wordSearchResponseSchema>;

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
  gender?: "masculine" | "feminine" | "both" | null;
  examples?: Example[];
}

// WordUpdate — fields left out are unchanged.
export interface WordUpdate {
  defs?: string[];
  examples?: Example[];
  audio_url?: string | null;
  img_url?: string | null;
}
