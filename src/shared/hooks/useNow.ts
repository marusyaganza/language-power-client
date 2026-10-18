import { useEffect, useState } from "react";

/** Current time in ms, refreshed every `intervalMs` so relative labels ("due in 5m") stay current. */
export function useNow(intervalMs: number): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
