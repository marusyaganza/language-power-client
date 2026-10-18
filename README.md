# Language Power — client

A vocabulary-learning app: search a dictionary, save words to your vocabulary, edit them, and practice them in games driven by spaced repetition.

This repository is the React frontend. It talks to a FastAPI backend that lives in a separate repository; the two are deployed and versioned independently.

## Stack

- **React 19** + **TypeScript** (strict), built with **Vite**
- **TanStack Query** for all server state, **React Router** (data router, lazy-loaded routes)
- **Mantine** UI with a custom dark theme, **Zod** for validating API responses
- **Vitest** for unit tests, **ESLint** (typescript-eslint, React Hooks rules)

## Getting started

Requires Node 24 (pinned with [Volta](https://volta.sh)) and a running backend.

```bash
npm install
cp .env.example .env        # point VITE_API_BASE_URL at the backend
npm run dev
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build into `dist/` |
| `npm run typecheck` | `tsc` with strict settings |
| `npm run lint` | ESLint |
| `npm test` | Vitest (unit tests) |
| `npm run preview` | Serve the production build |

## Architecture

Feature folders over a thin shared layer. Each feature owns its slice of the backend contract and everything built on it.

```
src/
  app/            entry point, providers, router, layouts, auth guard, error/404 screens
  api/            apiFetch (fetch + Zod validation) and ApiError
  config.ts       the only place that reads environment variables
  context/        study language (the only React context)
  shared/         components and hooks used by more than one feature, route paths
  theme/          Mantine theme, design tokens, global styles
  features/
    auth/         login, signup, current user
    words/        dictionary search, vocabulary list, add/edit words
    games/        games list, game session, results
      schemas.ts    Zod schemas for this feature's API responses (types are inferred)
      api.ts        endpoint functions
      queries.ts    query keys + React Query hooks
      lib/          pure logic, unit-tested
      components/   pages/   index.ts (public surface for other features)
```

Dependencies point one way: `app → features → shared / api / theme / context`. Features use each other only through `index.ts`.

### Decisions worth knowing

- **The API contract is checked at runtime.** Frontend and backend live in separate repos with no shared types or code generation, so every response is parsed with Zod in `apiFetch`. A mismatch fails loudly with the request and field (`Unexpected response from GET /games: … at [0].due_word_count`) instead of surfacing as `undefined` deep in a component. Request bodies are plain TypeScript types; the backend validates those.
- **React Query is the only store for server data.** Components never call `fetch`; every query and mutation is a named hook with keys from a per-feature key factory. Mutation hooks own cache updates and toasts; pages own navigation.
- **Shareable view state lives in the URL** — vocabulary search, page and sort, game mode — so it survives reloads and links.
- **Expired sessions are re-checked, not guessed.** Any 401/403 makes the app ask `/auth/me`; if the session is gone, the auth guard redirects to login. 4xx responses are never retried.
- **Starting a game is a side effect,** so its query is fetched once per visit (no background refetch, no retry, not abortable) and dropped when the page unmounts. A copy in `sessionStorage` lets a reload resume the game; opening the games list clears it so a card click always starts fresh.
- **Pure logic is unit-tested** (form → request transforms, URL state, game progress, availability rules, error parsing); UI is verified by driving the real app.
- **Dark-first theming.** All colors are tokens defined in `theme/theme.ts`; a light theme only needs the `light` block of the CSS variables resolver.
