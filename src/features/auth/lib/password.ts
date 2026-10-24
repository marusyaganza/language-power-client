// Mirrors the server's signup rules (auth/schemas.py): characters for the minimum, bytes for the maximum.
export const MIN_PASSWORD_LENGTH = 8; // characters (code points)
export const MAX_PASSWORD_BYTES = 72; // UTF-8 bytes (bcrypt's limit)

/** Returns the signup error for `pw`, or null. Not trimmed or normalized: the server doesn't either. */
export function newPasswordError(pw: string): string | null {
  // Spread counts code points like Python's len(); pw.length would count an emoji as 2.
  if ([...pw].length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }
  if (new TextEncoder().encode(pw).length > MAX_PASSWORD_BYTES) {
    return "Password is too long (max 72 bytes; some characters like é count as 2)";
  }
  return null;
}
