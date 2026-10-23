# Language Power Frontend

React + TypeScript client for the current version of the Language Power application.

Language Power is a web app for language learners. Users look up words, save them to a personal vocabulary, edit them, and practise them in small learning games scheduled with spaced repetition. This is the React client for Language Power v4, built with Vite and TypeScript. It consumes the v4 FastAPI backend ([py-lp](https://github.com/marusyaganza/py-lp)), which owns data, accounts, dictionary lookups and game scheduling. Everything except the login and sign-up screens requires a signed-in user.

## Status

- Active development
- Private app, not publicly deployed yet
- Built and tested against the v4 FastAPI backend
- UI and API may still change

## Features

- Sign up, log in and log out with a server-side session (cookie-based). The backend can turn sign-up off
- Switch the study language (Spanish or English)
- Search the dictionary, with spelling suggestions when a word isn't found
- Save words from search results or add your own, then edit definitions, examples, pronunciation audio and image
- Browse the vocabulary with search, sorting and pagination kept in the URL
- Practise saved words in six games: Pick the Meaning, Pick the Word, Type the Word, Listen & Type, Name the Picture and Noun Gender (Spanish only)
- Two game modes: spaced repetition (only words that are due) and review (any saved word)
- Adjust the spaced repetition settings: learning steps, review intervals, strict mode, with presets
- Pronunciation audio in games, with a mute option
- Light and dark theme. Theme, study language and sound are remembered per user on the device

In demo mode the backend mocks the dictionary, and search only works for a fixed list of words. The search page shows that list when a query isn't available.

## Tech stack

- React 19
- TypeScript (strict)
- Vite
- React Router 7 (data router, lazy-loaded routes)
- TanStack React Query 5
- Mantine 9 (core, form, modals, notifications)
- Zod
- Vitest
- ESLint (typescript-eslint, React Hooks rules)
- Volta with Node `24.19.0`

## Project structure

Code is organised by feature over a thin shared layer.

| Path             | Responsibility                                                                     |
| ---------------- | ---------------------------------------------------------------------------------- |
| `src/app`        | Entry point, providers, router, layouts, auth guard, error and 404 screens         |
| `src/api`        | `apiFetch` (fetch + Zod validation) and `ApiError`                                 |
| `src/config.ts`  | The only module that reads environment variables                                   |
| `src/context`    | Study language (the only React context)                                            |
| `src/features`   | Feature modules: `auth`, `words` (search and vocabulary), `games`                  |
| `src/shared`     | Components, hooks and helpers used by more than one feature, route paths          |
| `src/theme`      | Mantine theme, design tokens, global styles                                        |

Each feature has the same layout:

```
features/games/
  schemas.ts     Zod schemas for this feature's API responses (types are inferred)
  api.ts         endpoint functions
  queries.ts     query keys and React Query hooks
  lib/           pure logic, unit-tested
  components/
  pages/
  index.ts       public surface for other features
```

Dependencies point one way: `app → features → shared / api / theme / context`. Features use each other only through `index.ts`.

## Requirements

- [Volta](https://volta.sh/)
- Node.js `24.19.0`
- npm
- A running instance of the [v4 backend](https://github.com/marusyaganza/py-lp)

The Node version is pinned in the `volta` field of `package.json`, so Volta selects it automatically inside the project directory.

## Local development

1. Install [Volta](https://volta.sh/).
2. Install dependencies from the lockfile:

   ```bash
   npm ci
   ```

3. Create a `.env` file and point it at the backend:

   ```bash
   cp .env.example .env
   ```

4. Start the [backend](https://github.com/marusyaganza/py-lp) locally. The frontend expects it on `http://localhost:8000`.
5. Start the frontend:

   ```bash
   npm run dev
   ```

   The dev server runs on `http://localhost:5173`. Open the app on `localhost`, not `127.0.0.1` (see [Configuration](#configuration)).

To check a production build locally, run `npm run build` and then `npm run preview`.

## Configuration

The app reads one environment variable, through Vite's `import.meta.env`:

| Variable            | Required | Notes                                                                 |
| ------------------- | -------- | --------------------------------------------------------------------- |
| `VITE_API_BASE_URL` | Yes      | Base URL of the backend API, e.g. `http://localhost:8000`. Trailing slash is optional |

`src/config.ts` is the only module that reads it, and the app fails at startup with a clear error if it is missing. Like all `VITE_*` variables, it is built into the bundle, so changing it needs a restart of the dev server or a new build.

There are no feature flags in the client. Runtime settings that belong to the backend are fetched from it: `/auth/config` says whether sign-up is enabled, and the backend decides whether dictionary search runs in demo mode.

### Auth and cookies

Authentication uses a server-side session. The backend sets an `HttpOnly` session cookie on login, and every request is sent with `credentials: "include"`. The client never reads or stores a token.

This puts a few requirements on the setup:

- The backend's CORS settings must allow the frontend origin with credentials. The backend currently allows `http://localhost:5173`, which is Vite's default port. If the dev server starts on another port, the requests are blocked.
- The cookie is `SameSite=Lax`, so the frontend and the API must be on the same site. `localhost:5173` and `localhost:8000` work. Mixing `localhost` and `127.0.0.1` does not.
- When the backend runs with secure cookies on, the session works only over HTTPS.

Any 401 or 403 response makes the app re-check `/auth/me`. If the session is gone, the auth guard redirects to the login page.

## Data flow

- **React Router** handles navigation. Routes are lazy-loaded, and everything behind the auth guard requires a session.
- **React Query is the only store for server data.** Components never call `fetch`. Every query and mutation is a named hook with keys from a per-feature key factory. Mutation hooks own cache updates and toasts, pages own navigation. 4xx responses are not retried.
- **Zod checks the API contract at runtime.** Frontend and backend live in separate repositories with no shared types or code generation, so `apiFetch` parses every response with the feature's schema. A mismatch fails loudly with the request and the field (`Unexpected response from GET /games: … at [0].due_word_count`) instead of turning into `undefined` deep in a component. Request bodies are plain TypeScript types, and the backend validates them.
- **Mantine** provides the UI components, forms, modals and notifications. All colors are tokens defined in `src/theme/theme.ts`.
- **Shareable view state lives in the URL**: vocabulary search, page and sort, and game mode survive reloads and can be linked.
- **Per-user preferences** (theme, study language, sound) are kept in `localStorage`, keyed by user id.

Starting a game is a side effect on the backend, so its query is fetched once per visit: no background refetch, no retry, not abortable. It is dropped when the page unmounts. A copy in `sessionStorage` lets a reload resume the game, and opening the games list clears it, so clicking a game card always starts a new session.

## Scripts

| Script              | Description                                       |
| ------------------- | ------------------------------------------------- |
| `npm run dev`       | Start the Vite dev server                         |
| `npm run build`     | Production build into `dist/`                     |
| `npm run preview`   | Serve the production build locally                |
| `npm run lint`      | Run ESLint                                        |
| `npm run typecheck` | Run TypeScript checks (`tsc`, strict settings)    |
| `npm test`          | Run Vitest unit tests                             |

Unit tests cover pure logic: form-to-request transforms, URL state, game progress and availability rules, settings forms, error parsing and the API client. They don't need a running backend. UI is checked by running the app against a real backend.

## Related backend

Backend repository: [py-lp](https://github.com/marusyaganza/py-lp) (FastAPI, PostgreSQL, Redis).

Almost every flow depends on this API: accounts, dictionary search, vocabulary and games. Without it the frontend loads, but only shows the login page and request errors.

## Limitations

- Private app, no public demo yet
- Requires a running backend. There is no mock API on the client side
- Most features require a signed-in user
- The dictionary is mocked in demo mode, so search only covers a fixed list of words
- No end-to-end tests yet. Automated tests cover pure logic only
- UI and API may still change during active development
