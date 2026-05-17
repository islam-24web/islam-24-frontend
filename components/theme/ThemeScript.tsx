const STORAGE_KEY = "islam24-theme";

const script = `
(function () {
  try {
    var theme = localStorage.getItem("${STORAGE_KEY}") || "dark";
    if (theme !== "light" && theme !== "dark") theme = "dark";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch (_) {
    document.documentElement.dataset.theme = "dark";
    document.documentElement.style.colorScheme = "dark";
  }
})();
`;

export default function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
