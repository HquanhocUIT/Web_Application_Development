const THEME_STORAGE_KEY = "theme";
const rootElement = document.documentElement;
const themeToggle = document.querySelector("#theme-toggle");

const getSavedTheme = () => {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
};

const saveTheme = (theme) => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Continue using the selected theme when storage is unavailable.
  }
};

const applyTheme = (theme) => {
  const isDarkTheme = theme === "dark";

  rootElement.dataset.theme = isDarkTheme ? "dark" : "light";
  themeToggle.setAttribute("aria-pressed", String(isDarkTheme));
  themeToggle.setAttribute(
    "aria-label",
    isDarkTheme ? "Switch to light theme" : "Switch to dark theme"
  );
  themeToggle.textContent = isDarkTheme
    ? "Use light theme"
    : "Use dark theme";
};

const savedTheme = getSavedTheme();
const initialTheme = savedTheme === "dark" ? "dark" : "light";

applyTheme(initialTheme);

themeToggle.addEventListener("click", () => {
  const nextTheme = rootElement.dataset.theme === "dark" ? "light" : "dark";

  saveTheme(nextTheme);
  applyTheme(nextTheme);
});
