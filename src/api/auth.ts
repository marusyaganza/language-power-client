const API_BASE = import.meta.env.VITE_API_BASE_URL; // e.g. http://localhost:8000

export async function fetchAuthConfig(): Promise<{ signup_enabled: boolean }> {
  const res = await fetch(`${API_BASE}/auth/config`);
  if (!res.ok) throw new Error("Failed to fetch auth config");
  return res.json();
}

export async function signup(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail ?? "Signup failed");
  }
  return res.json();
}