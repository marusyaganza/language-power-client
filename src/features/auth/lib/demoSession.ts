// Remembers that this browser was logged in to a demo account, so the login page can explain why the
// user is back there. The backend answers an expired account with a plain 401 (it doesn't say which
// sessions or accounts existed), so the client keeps this hint itself. Logging out clears it: a user
// who left on purpose needs no explanation.

const KEY = "demo-session";

export function markDemoSession(): void {
  try {
    localStorage.setItem(KEY, "1");
  } catch {
    // Storage unavailable: the login page just won't show the hint.
  }
}

export function clearDemoSession(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nothing to clear.
  }
}

export function hadDemoSession(): boolean {
  try {
    return localStorage.getItem(KEY) !== null;
  } catch {
    return false;
  }
}
