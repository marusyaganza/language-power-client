import { useState, type ReactNode } from "react";
import { loadUserPrefs, saveUserPrefs } from "@/shared/lib/userPrefs";
import { DEFAULT_LANGUAGE, LanguageContext, SUPPORTED_LANGUAGES } from "./language";

/** Mount with `key={userId}` so switching users starts from the new user's saved language. */
export function LanguageProvider({ userId, children }: { userId: number; children: ReactNode }) {
  const [language, setLanguage] = useState(() => {
    const saved = loadUserPrefs(userId).language;
    return saved && SUPPORTED_LANGUAGES.some((option) => option.value === saved) ? saved : DEFAULT_LANGUAGE;
  });

  function updateLanguage(value: string) {
    setLanguage(value);
    saveUserPrefs(userId, { language: value });
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: updateLanguage, SUPPORTED_LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}
