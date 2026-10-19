// How a grammatical gender is shown: by the language's article ("el", "la"), which is what the player
// learns to use. A language without articles here (or without grammatical gender) falls back to the name.

const ARTICLES: Partial<Record<string, Partial<Record<string, string>>>> = {
  es: { masculine: "el", feminine: "la" },
};

/** The article for a gender in a language, or null if there is none to show. */
export function genderArticle(language: string, gender: string): string | null {
  return ARTICLES[language]?.[gender] ?? null;
}

/** "masculine" -> "Masculine". */
export function genderLabel(gender: string): string {
  return gender.charAt(0).toUpperCase() + gender.slice(1);
}
