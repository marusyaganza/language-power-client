import { useState, type ReactNode } from "react";
import { loadUserPrefs, saveUserPrefs } from "@/shared/lib/userPrefs";
import { LanguageContext, startingLanguage, type LanguageOption } from "./language";

interface LanguageProviderProps {
  userId: number;
  /** The languages this deployment offers (`offeredLanguages`). */
  languages: LanguageOption[];
  children: ReactNode;
}

/**
 * Mount with `key={userId}` so switching users starts from the new user's saved language. A saved language
 * the deployment doesn't offer (Korean, saved on the personal deployment, opened on the demo) gives way
 * to the default, without overwriting the saved choice.
 */
export function LanguageProvider({ userId, languages, children }: LanguageProviderProps) {
  const [language, setLanguage] = useState(() => startingLanguage(loadUserPrefs(userId).language, languages));

  function updateLanguage(value: string) {
    setLanguage(value);
    saveUserPrefs(userId, { language: value });
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: updateLanguage, SUPPORTED_LANGUAGES: languages }}>
      {children}
    </LanguageContext.Provider>
  );
}
