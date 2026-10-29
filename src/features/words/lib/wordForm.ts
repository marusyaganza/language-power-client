// Pure helpers behind WordForm: initial values, validation and the request bodies built from it.
import type { Example, Word, WordCreate, WordUpdate } from "../schemas";

export interface ExampleDraft {
  text: string;
  translation: string;
}

/** UI state of the word form. Only `create` uses name, fl and transcription. */
export interface WordFormValues {
  name: string;
  fl: string | null;
  transcription: string;
  defs: string[];
  /** Index in `defs` of the definition shown first. */
  mainDefIndex: number;
  examples: ExampleDraft[];
  audioUrl: string;
  imgUrl: string;
  imgDesc: string;
}

export function emptyWordForm(): WordFormValues {
  return {
    name: "",
    fl: null,
    transcription: "",
    defs: [""],
    mainDefIndex: 0,
    examples: [],
    audioUrl: "",
    imgUrl: "",
    imgDesc: "",
  };
}

export function wordToFormValues(word: Word): WordFormValues {
  return {
    name: word.name,
    fl: word.fl,
    transcription: word.transcription ?? "",
    defs: word.defs.length > 0 ? [...word.defs] : [""],
    mainDefIndex: 0, // the backend keeps the main definition first
    examples: word.examples.map((e) => ({ text: e.text, translation: e.translation ?? "" })),
    audioUrl: word.audio_url ?? "",
    imgUrl: word.img_url ?? "",
    imgDesc: word.img_desc ?? "",
  };
}

/** Translations are only asked for when learning a language other than English. */
export function usesTranslations(language: string): boolean {
  return language !== "en";
}

/** Main definition first, then the rest in order; trimmed, blanks dropped. */
export function orderDefs(defs: string[], mainIndex: number): string[] {
  const main = defs[mainIndex];
  const rest = defs.filter((_, i) => i !== mainIndex);
  return (main === undefined ? rest : [main, ...rest]).map((d) => d.trim()).filter(Boolean);
}

/** Trimmed examples without blank ones; an empty or hidden translation becomes null. */
export function cleanExamples(examples: ExampleDraft[], withTranslations: boolean): Example[] {
  return examples
    .map((e) => ({ text: e.text.trim(), translation: withTranslations ? e.translation.trim() || null : null }))
    .filter((e) => e.text !== "");
}

const emptyToNull = (value: string) => value.trim() || null;

export function toWordCreate(values: WordFormValues, language: string): WordCreate {
  if (values.fl === null) throw new Error("toWordCreate: part of speech is required"); // guarded by validation
  return {
    uuid: null,
    name: values.name.trim(),
    language,
    stems: [],
    fl: values.fl,
    transcription: emptyToNull(values.transcription),
    defs: orderDefs(values.defs, values.mainDefIndex),
    examples: cleanExamples(values.examples, usesTranslations(language)),
    audio_url: emptyToNull(values.audioUrl),
    img_url: emptyToNull(values.imgUrl),
    img_desc: emptyToNull(values.imgDesc),
  };
}

export function toWordUpdate(values: WordFormValues, language: string): WordUpdate {
  return {
    defs: orderDefs(values.defs, values.mainDefIndex),
    examples: cleanExamples(values.examples, usesTranslations(language)),
    audio_url: emptyToNull(values.audioUrl),
    img_url: emptyToNull(values.imgUrl),
    img_desc: emptyToNull(values.imgDesc),
  };
}

/** Blank is fine (the field is optional); otherwise an absolute http(s) link. */
export function isOptionalUrl(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed === "") return true;
  try {
    const { protocol } = new URL(trimmed);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

const URL_ERROR = "Enter a full link, starting with http:// or https://";

// Mirrors the server's limits on WordCreate/WordUpdate (words/schemas.py), so a long paste is caught
// here instead of coming back as a 422.
export const WORD_LIMITS = {
  name: 100,
  transcription: 100,
  defs: 10,
  defLength: 1000,
  examples: 50,
  exampleLength: 500,
  url: 2048,
  imgDesc: 1000,
} as const;

/** Characters as the server counts them (code points, like Python's len()), after trimming. */
function length(value: string): number {
  return [...value.trim()].length;
}

function tooLong(value: string, max: number): string | null {
  return length(value) > max ? `At most ${max.toLocaleString("en-US")} characters` : null;
}

function urlError(value: string): string | null {
  return isOptionalUrl(value) ? tooLong(value, WORD_LIMITS.url) : URL_ERROR;
}

function defsError(defs: string[]): string | null {
  const filled = defs.filter((d) => d.trim() !== "");
  if (filled.length === 0) return "Add at least one definition";
  if (filled.length > WORD_LIMITS.defs) return `At most ${WORD_LIMITS.defs} definitions`;
  if (filled.some((d) => length(d) > WORD_LIMITS.defLength)) {
    return `Each definition can be at most ${WORD_LIMITS.defLength.toLocaleString("en-US")} characters`;
  }
  return null;
}

function examplesError(examples: ExampleDraft[]): string | null {
  const filled = examples.filter((e) => e.text.trim() !== "");
  if (filled.length > WORD_LIMITS.examples) return `At most ${WORD_LIMITS.examples} examples`;
  if (filled.some((e) => length(e.text) > WORD_LIMITS.exampleLength || length(e.translation) > WORD_LIMITS.exampleLength)) {
    return `Each example and translation can be at most ${WORD_LIMITS.exampleLength} characters`;
  }
  return null;
}

export type WordFormMode = "create" | "edit";

/**
 * Mantine form validation rules. Name, part of speech and transcription are only checked in `create`,
 * the only mode that shows them: an error on a hidden field would block saving without a message.
 */
export function wordFormValidation(mode: WordFormMode) {
  const creating = mode === "create";
  return {
    name: (value: string) =>
      !creating ? null : value.trim() === "" ? "Enter the word" : tooLong(value, WORD_LIMITS.name),
    fl: (value: string | null) => (creating && value === null ? "Choose a part of speech" : null),
    transcription: (value: string) => (creating ? tooLong(value, WORD_LIMITS.transcription) : null),
    defs: defsError,
    examples: examplesError,
    audioUrl: urlError,
    imgUrl: urlError,
    imgDesc: (value: string) => tooLong(value, WORD_LIMITS.imgDesc),
  };
}
