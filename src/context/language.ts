// The logged-in user's study language. LanguageProvider (./LanguageProvider.tsx), mounted by RequireAuth, supplies it.
import { createContext, useContext } from "react";

export interface LanguageOption {
  value: string;
  label: string;
}

export interface LanguageContextValue {
  language: string;
  setLanguage: (value: string) => void;
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
