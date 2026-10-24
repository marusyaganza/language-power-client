import { Center, Loader } from "@mantine/core";
import { Navigate, createBrowserRouter } from "react-router-dom";
import { paths } from "@/shared/paths";
import { GuestOnly } from "./GuestOnly";
import { AppShellLayout } from "./layouts/AppShellLayout";
import { NotFoundPage } from "./NotFoundPage";
import { RequireAuth } from "./RequireAuth";
import { RouteError } from "./RouteError";

// Pages are lazy-loaded so each one is its own chunk.
export const router = createBrowserRouter([
  {
    errorElement: <RouteError />,
    // Shown while the first page's chunk loads.
    hydrateFallbackElement: (
      <Center mih="100vh">
        <Loader />
      </Center>
    ),
    children: [
      // Logged out only
      {
        element: <GuestOnly />,
        children: [
          { path: paths.login, lazy: async () => ({ Component: (await import("@/features/auth/pages/LoginPage")).LoginPage }) },
          { path: paths.signup, lazy: async () => ({ Component: (await import("@/features/auth/pages/SignUpPage")).SignUpPage }) },
        ],
      },

      {
        element: <RequireAuth />,
        children: [
          // Logged in, with the top navigation
          {
            element: <AppShellLayout />,
            errorElement: <RouteError />,
            children: [
              { index: true, element: <Navigate to={paths.search} replace /> },
              { path: paths.search, lazy: async () => ({ Component: (await import("@/features/words/pages/SearchPage")).SearchPage }) },
              { path: paths.vocabulary, lazy: async () => ({ Component: (await import("@/features/words/pages/VocabularyPage")).VocabularyPage }) },
              { path: paths.newWord, lazy: async () => ({ Component: (await import("@/features/words/pages/NewWordPage")).NewWordPage }) },
              { path: paths.games, lazy: async () => ({ Component: (await import("@/features/games/pages/GamesPage")).GamesPage }) },
            ],
          },
          // Logged in, full screen (a game in progress)
          { path: paths.game(":gameId"), lazy: async () => ({ Component: (await import("@/features/games/pages/GamePage")).GamePage }) },
        ],
      },

      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
