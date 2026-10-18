// App routes, in one place. The router (src/app/router.tsx) maps them to pages.

export const paths = {
  login: "/login",
  signup: "/signup",
  search: "/words/search",
  vocabulary: "/words/vocabulary",
  newWord: "/words/new",
  games: "/games",
  game: (gameId: number | string) => `/games/${gameId}`,
} as const;
