import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": `${import.meta.dirname}/src`,
    },
  },
  test: {
    // Fixed base URL so tests don't depend on the developer's .env.
    env: { VITE_API_BASE_URL: "http://api.test" },
  },
});