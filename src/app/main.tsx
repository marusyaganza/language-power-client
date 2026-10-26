import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@/theme/global.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { Providers } from "./providers";
import { router } from "./router";
import { initSentry, reactErrorHandler } from "./sentry";

// First, so errors during startup are reported too.
initSentry();

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element in index.html");

// Errors inside routes are reported by RouteError; these catch the rest (providers, outside the router).
createRoot(root, {
  onUncaughtError: reactErrorHandler(),
  onRecoverableError: reactErrorHandler(),
}).render(
  <StrictMode>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </StrictMode>,
);
