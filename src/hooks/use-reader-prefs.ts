import { useCallback, useEffect, useState } from "react";

export const THEMES = ["paper", "sepia", "ink"] as const;
export type Theme = (typeof THEMES)[number];

const KEY = "mdbook.theme";

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("paper");

  useEffect(() => {
    const stored = window.localStorage.getItem(KEY) as Theme | null;
    if (stored && (THEMES as readonly string[]).includes(stored)) {
      setThemeState(stored);
      document.documentElement.setAttribute("data-theme", stored);
    } else {
      document.documentElement.setAttribute("data-theme", "paper");
    }
  }, []);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    document.documentElement.setAttribute("data-theme", next);
    window.localStorage.setItem(KEY, next);
  }, []);

  return { theme, setTheme };
}

const SIZE_KEY = "mdbook.size";
export const SIZES = [1, 1.125, 1.25, 1.4] as const;

export function useReaderSize() {
  const [size, setSizeState] = useState<number>(1.125);

  useEffect(() => {
    const stored = Number(window.localStorage.getItem(SIZE_KEY));
    if (stored) {
      setSizeState(stored);
      document.documentElement.style.setProperty("--reader-size", `${stored}rem`);
    }
  }, []);

  const setSize = useCallback((next: number) => {
    setSizeState(next);
    document.documentElement.style.setProperty("--reader-size", `${next}rem`);
    window.localStorage.setItem(SIZE_KEY, String(next));
  }, []);

  return { size, setSize };
}
