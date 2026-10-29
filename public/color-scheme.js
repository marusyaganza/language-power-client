// Mantine's ColorSchemeScript: apply the last used scheme before first paint (no flash).
// A file, not inline in index.html, so the Content-Security-Policy can allow scripts from 'self' only.
try {
  var stored = localStorage.getItem("mantine-color-scheme-value");
  var scheme = stored === "light" || stored === "dark" ? stored
    : matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  document.documentElement.setAttribute("data-mantine-color-scheme", scheme);
} catch (e) {}
