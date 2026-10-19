import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { clearStoredGame, clearStoredGames, loadStoredGame, saveStoredGame } from "./gameStorage";

// Minimal in-memory sessionStorage for the node test environment.
function createStorage(): Storage {
  const data = new Map<string, string>();
  const storage = {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (key: string) => data.get(key) ?? null,
    key: (i: number) => [...data.keys()][i] ?? null,
    removeItem: (key: string) => void data.delete(key),
    setItem: (key: string, value: string) => void data.set(key, String(value)),
  };
  // Object.keys(sessionStorage) lists stored keys in browsers; mirror that.
  return new Proxy(storage, {
    ownKeys: () => [...data.keys()],
    getOwnPropertyDescriptor: (target, key) =>
      typeof key === "string" && data.has(key)
        ? { enumerable: true, configurable: true, value: data.get(key) }
        : Reflect.getOwnPropertyDescriptor(target, key),
  }) as unknown as Storage;
}

// Each game passes the schema of what it stores.
const storedGameSchema = z.object({
  session: z.object({ session_id: z.string(), questions: z.array(z.object({ id: z.number() })) }),
  progress: z.object({ index: z.number() }),
});
const game: z.infer<typeof storedGameSchema> = {
  session: { session_id: "s-1", questions: [{ id: 4 }] },
  progress: { index: 0 },
};

function load(gameId: number) {
  return loadStoredGame(gameId, storedGameSchema);
}

beforeEach(() => {
  vi.stubGlobal("sessionStorage", createStorage());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("game storage", () => {
  it("round-trips a game by id", () => {
    saveStoredGame(4, game);
    expect(load(4)).toEqual(game);
    expect(load(5)).toBeNull();
  });

  it("ignores unreadable or outdated data", () => {
    sessionStorage.setItem("game:4", "{not json");
    expect(load(4)).toBeNull();
    sessionStorage.setItem("game:4", JSON.stringify({ sessionId: "old-format", currentIndex: 2 }));
    expect(load(4)).toBeNull();
  });

  it("clears one game or all of them, leaving other keys alone", () => {
    saveStoredGame(4, game);
    saveStoredGame(6, game);
    sessionStorage.setItem("other", "keep");

    clearStoredGame(4);
    expect(load(4)).toBeNull();
    expect(load(6)).toEqual(game);

    clearStoredGames();
    expect(load(6)).toBeNull();
    expect(sessionStorage.getItem("other")).toBe("keep");
  });
});
