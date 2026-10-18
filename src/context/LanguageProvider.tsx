import { useState, type ReactNode } from "react";
import { DEFAULT_LANGUAGE, LanguageContext, SUPPORTED_LANGUAGES } from "./language";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState(() => localStorage.getItem("language") || DEFAULT_LANGUAGE);

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
