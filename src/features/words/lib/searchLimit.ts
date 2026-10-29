/** The search counter's text, or null when searches in this language aren't limited. */
export function searchLimitText(left: number | null | undefined, limit: number | null, languageLabel: string) {
  if (left == null || limit === null) return null;
  if (left === 0) return `No ${languageLabel} searches left in this demo. You can still add your own words.`;
  return `${left} of ${limit} ${languageLabel} ${limit === 1 ? "search" : "searches"} left`;
}
