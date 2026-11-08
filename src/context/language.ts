// The logged-in user's study language. LanguageProvider (./LanguageProvider.tsx), mounted by RequireAuth, supplies it.
import { createContext, useContext } from "react";

export interface LanguageOption {
  value: string;
  /** The language's name, also used in sentences ("Search the Korean dictionary"). */
  label: string;
  /** Shown next to the name in the language selector only: "Korean (beta)". */
  status?: "beta" | "new";
}

export interface LanguageContextValue {
  language: string;
  setLanguage: (value: string) => void;
  /** The languages this deployment offers: `SUPPORTED_LANGUAGES` less those the server leaves out. */
  SUPPORTED_LANGUAGES: LanguageOption[];
}

export const DEFAULT_LANGUAGE = "es";

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { value: "es", label: "Spanish" },
  { value: "en", label: "English" },
  { value: "ko", label: "Korean", status: "beta" },
];

/**
 * The languages to offer: those the server enables (`GET /auth/config`), in this app's order. All of them
 * when the server doesn't say. If none of them is one the app knows, all of them too, rather than none.
 */
export function offeredLanguages(enabled: string[] | undefined): LanguageOption[] {
  const offered = enabled ? SUPPORTED_LANGUAGES.filter((option) => enabled.includes(option.value)) : [];
  return offered.length > 0 ? offered : SUPPORTED_LANGUAGES;
}

/** The language to start with: the saved one if it's offered, else the default, else the first offered. */
export function startingLanguage(saved: string | undefined, offered: LanguageOption[]): string {
  const isOffered = (value: string | undefined) => offered.some((option) => option.value === value);
  if (isOffered(saved)) return saved!;
  return isOffered(DEFAULT_LANGUAGE) ? DEFAULT_LANGUAGE : offered[0].value;
}

/** The selector's text for a language: its name, and its status if it has one. */
export function languageOptionLabel({ label, status }: LanguageOption): string {
  return status ? `${label} (${status})` : label;
}

export const LanguageContext = createContext<LanguageContextValue | null>(null);

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
