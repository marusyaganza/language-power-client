// The selected study language. LanguageProvider (./LanguageProvider.tsx) supplies it.
import { createContext, useContext } from "react";

export interface LanguageOption {
  value: string;
  label: string;
}

export interface LanguageContextValue {
  language: string;
  setLanguage: (value: string) => void;
  /** Back to the default, in memory only; callers clearing storage (e.g. logout) remove the saved value. */
  resetLanguage: () => void;
  SUPPORTED_LANGUAGES: LanguageOption[];
}

export const DEFAULT_LANGUAGE = "es";

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { value: "es", label: "Spanish" },
  { value: "en", label: "English" },
];

export const LanguageContext = createContext<LanguageContextValue | null>(null);

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
