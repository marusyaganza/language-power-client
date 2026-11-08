/**
 * A word's pronunciation as its dictionary writes it: Korean in Hangul between brackets ([가ː게]), the
 * others as a phonetic transcription between slashes (/ˈwēl/).
 */
export function formatTranscription(transcription: string, language: string): string {
  return language === "ko" ? `[${transcription}]` : `/${transcription}/`;
}
