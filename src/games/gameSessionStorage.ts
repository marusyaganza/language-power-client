function storageKey(gameId: string) {
    return `game-session:${gameId}`
}

export function saveGameSession(gameId: string, session: string) {
    localStorage.setItem(storageKey(gameId), JSON.stringify(session))
}

export function loadGameSession(gameId: string) {
    const raw = localStorage.getItem(storageKey(gameId))
    if (!raw) return null
    try {
        return JSON.parse(raw)
    } catch {
        return null
    }
}

export function clearGameSession(gameId: string) {
    localStorage.removeItem(storageKey(gameId))
}