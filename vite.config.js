import process from "node:process";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { sentryVitePlugin } from "@sentry/vite-plugin";

const uploadSourceMaps = Boolean(process.env.SENTRY_AUTH_TOKEN);

/**
 * Writes dist/_redirects with the Netlify proxy rule for Sentry's `tunnel`: /sentry → the project's
 * envelope endpoint, built from the DSN (https://<key>@<host>/<project id>). Generated so the DSN
 * comes from Netlify's environment instead of the repo. Without a DSN, reporting is off: no rule.
 */
function sentryTunnelRedirect() {
  return {
    name: "sentry-tunnel-redirect",
    apply: "build",
    generateBundle() {
      const dsn = process.env.VITE_SENTRY_DSN?.trim();
      if (!dsn) return;
      const { host, pathname } = new URL(dsn);
      const projectId = pathname.replace(/^\//, "");
      this.emitFile({
        type: "asset",
        fileName: "_redirects",
        source: `/sentry  https://${host}/api/${projectId}/envelope/  200!\n`,
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    sentryTunnelRedirect(),
    // Uploads source maps to Sentry so reported stack traces point at the original code, then deletes
    // them from dist so they aren't public. Runs only where SENTRY_AUTH_TOKEN is set (Netlify builds).
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      disable: !uploadSourceMaps,
      sourcemaps: { filesToDeleteAfterUpload: ["dist/**/*.map"] },
      telemetry: false,
    }),
  ],
  build: {
    // Only for the upload ("hidden": the bundles don't link to them), so a build without the token never ships maps.
    sourcemap: uploadSourceMaps ? "hidden" : false,
  },
  // Lets the bundler drop Sentry code this app never uses (debug logging, tracing).
  define: {
    __SENTRY_DEBUG__: false,
    __SENTRY_TRACING__: false,
  },
  resolve: {
    alias: {
      "@": `${import.meta.dirname}/src`,
    },
  },
  server: {
    // Same mapping as the Netlify proxy (netlify.toml): /api/auth/me → http://localhost:8000/auth/me.
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
