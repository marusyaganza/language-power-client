import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { isApiError } from "@/api/errors";
import { deleteWord, getSearchLimits, getVocabulary, saveWord, searchWords, updateWord } from "./api";
import type { VocabularyParams, WordCreate, WordSearchResponse, WordUpdate } from "./schemas";

export const wordKeys = {
  all: ["words"] as const,
  searches: () => [...wordKeys.all, "search"] as const,
  search: (query: string, language: string) => [...wordKeys.searches(), { query, language }] as const,
  searchLimits: () => [...wordKeys.all, "search-limits"] as const,
  vocabularies: () => [...wordKeys.all, "vocabulary"] as const,
  vocabulary: (params: VocabularyParams) => [...wordKeys.vocabularies(), params] as const,
};

export function useWordSearch(query: string, language: string) {
  return useQuery({
    queryKey: wordKeys.search(query, language),
    queryFn: ({ signal }) => searchWords(query, language, signal),
    enabled: query !== "",
  });
}

/** Searches left per language, for every language at once. */
export function useSearchLimits() {
  return useQuery({
    queryKey: wordKeys.searchLimits(),
    queryFn: ({ signal }) => getSearchLimits(signal),
  });
}

export function useVocabulary(params: VocabularyParams) {
  return useQuery({
    queryKey: wordKeys.vocabulary(params),
    queryFn: ({ signal }) => getVocabulary(params, signal),
    placeholderData: keepPreviousData,
  });
}

/** Saves a dictionary search result to the vocabulary. */
export function useSaveWord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveWord,
    onSuccess: (savedWord, word) => {
      queryClient.setQueriesData<WordSearchResponse>({ queryKey: wordKeys.searches() }, (old) =>
        old && { ...old, words: old.words.map((w) => (w.uuid === word.uuid ? { ...w, saved: true } : w)) },
      );
      queryClient.invalidateQueries({ queryKey: wordKeys.vocabularies() });
      notifications.show({ message: `"${savedWord.name}" saved to vocabulary`, color: "green" });
    },
    onError: (error) => {
      notifications.show(
        isApiError(error) && error.status === 409
          ? { message: "This word is already in your vocabulary", color: "yellow" }
          : { message: "Something went wrong saving this word", color: "red" },
      );
    },
  });
}

/** Saves a word the user wrote themselves. */
export function useCreateWord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (word: WordCreate) => saveWord(word),
    onSuccess: (word) => {
      queryClient.invalidateQueries({ queryKey: wordKeys.vocabularies() });
      notifications.show({ message: `"${word.name}" added to vocabulary`, color: "green" });
    },
    onError: () => {
      notifications.show({ message: "Failed to save word", color: "red" });
    },
  });
}

export function useEditWord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ wordId, changes }: { wordId: number; changes: WordUpdate }) => updateWord(wordId, changes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wordKeys.vocabularies() });
      notifications.show({ message: "Word updated", color: "green" });
    },
    onError: () => {
      notifications.show({ message: "Failed to update word", color: "red" });
    },
  });
}

export function useDeleteWord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteWord,
    onSuccess: () => {
      // Deletes only happen from the vocabulary list; refetch every page/filter combination.
      queryClient.invalidateQueries({ queryKey: wordKeys.vocabularies() });
      notifications.show({ message: "Word deleted", color: "green" });
    },
    onError: (error) => {
      notifications.show({
        message: isApiError(error) && error.status === 404 ? "Word already deleted" : "Failed to delete word",
        color: "red",
      });
    },
  });
}
