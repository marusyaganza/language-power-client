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

export type WordFormMode = "create" | "edit";

/** Mantine form validation rules; `create` also requires name and part of speech. */
export function wordFormValidation(mode: WordFormMode) {
  return {
    name: (value: string) => (mode === "create" && value.trim() === "" ? "Enter the word" : null),
    fl: (value: string | null) => (mode === "create" && value === null ? "Choose a part of speech" : null),
    defs: (value: string[]) => (value.some((d) => d.trim() !== "") ? null : "Add at least one definition"),
    audioUrl: (value: string) => (isOptionalUrl(value) ? null : URL_ERROR),
    imgUrl: (value: string) => (isOptionalUrl(value) ? null : URL_ERROR),
  };
}
