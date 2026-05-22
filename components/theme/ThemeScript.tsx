const STORAGE_KEY = "islam24-theme";

const script = `
(function () {
  try {
    var theme = localStorage.getItem("${STORAGE_KEY}") || "light";
    if (theme !== "light" && theme !== "dark") theme = "light";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch (_) {
    document.documentElement.dataset.theme = "light";
    document.documentElement.style.colorScheme = "light";
  }
})();
`;

export default function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
