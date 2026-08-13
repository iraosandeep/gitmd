import { useCallback, useEffect, useState } from "react";

export type ThemeMeta = { id: string; label: string; dark: boolean };

export const THEME_LIST: ThemeMeta[] = [
  { id: "original", label: "Original", dark: false },
  { id: "paper", label: "Paper", dark: false },
  { id: "sepia", label: "Sepia", dark: false },
  { id: "calm", label: "Calm", dark: false },
  { id: "focus", label: "Focus", dark: false },
  { id: "quiet", label: "Quiet", dark: true },
  { id: "ink", label: "Ink", dark: true },
];

export const THEMES = THEME_LIST.map((t) => t.id) as readonly string[];
export type Theme = (typeof THEME_LIST)[number]["id"];

const THEME_KEY = "mdbook.theme";
export const DEFAULT_THEME = "paper";

function normalizeTheme(value: string | null): Theme {
  if (!value) return DEFAULT_THEME;
  return THEMES.includes(value) ? value : DEFAULT_THEME;
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);

  useEffect(() => {
    const next = normalizeTheme(window.localStorage.getItem(THEME_KEY));
    setThemeState(next);
    document.documentElement.setAttribute("data-theme", next);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    document.documentElement.setAttribute("data-theme", next);
    window.localStorage.setItem(THEME_KEY, next);
  }, []);

  return { theme, setTheme };
}
