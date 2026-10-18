import { createContext, useContext, useState, type ReactNode } from "react";

export interface LanguageOption {
  value: string;
  label: string;
}

interface LanguageContextValue {
  language: string;
  setLanguage: (value: string) => void;
  /** Back to the default, in memory only; callers clearing storage (e.g. logout) remove the saved value. */
  resetLanguage: () => void;
  SUPPORTED_LANGUAGES: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const DEFAULT_LANGUAGE = "es";

const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { value: "es", label: "Spanish" },
  { value: "en", label: "English" },
];

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState(localStorage.getItem("language") || DEFAULT_LANGUAGE);

  function updateLanguage(value: string) {
    setLanguage(value);
    localStorage.setItem("language", value);
  }

  function resetLanguage() {
    setLanguage(DEFAULT_LANGUAGE);
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: updateLanguage, resetLanguage, SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
