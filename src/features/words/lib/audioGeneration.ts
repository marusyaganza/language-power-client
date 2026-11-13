// When the edit form offers to generate a word's audio (server: audio/router.py, personal deployment only).

/** The server's limit on the text (audio/schemas.py MAX_AUDIO_TEXT_LENGTH), in code points like Python's len(). */
export const MAX_AUDIO_TEXT_LENGTH = 40;

// Where the server stores generated audio: audio/<language>/<engine>/<sha256>.mp3, in the bucket or,
// in local development, its own /media folder (audio/service.py store_generation).
const GENERATED_AUDIO_PATH = /\/audio\/[a-z]{2}\/[a-z_]+\/[0-9a-f]{64}\.mp3$/;

/** Whether `url` is audio the server generated, as opposed to a dictionary's or a pasted link. */
export function isGeneratedAudioUrl(url: string): boolean {
  try {
    return GENERATED_AUDIO_PATH.test(new URL(url.trim()).pathname);
  } catch {
    return false;
  }
}

interface AudioGenerationContext {
  /** The deployment's engines (GET /auth/config `audio_engines`); empty where generation is off. */
  engines: string[];
  /** The word's name: the text that is spoken. */
  name: string;
  /** The audio link in the form right now. */
  audioUrl: string;
}

/**
 * Offered for words without audio or with generated audio, never to replace a dictionary's recording.
 * Clearing a dictionary link in the form makes the word "without audio", so it's offered then.
 */
export function canGenerateAudio({ engines, name, audioUrl }: AudioGenerationContext): boolean {
  const length = [...name.trim()].length;
  if (engines.length === 0 || length === 0 || length > MAX_AUDIO_TEXT_LENGTH) return false;
  return audioUrl.trim() === "" || isGeneratedAudioUrl(audioUrl);
}
