import { useCallback, useEffect, useState } from "react";

/* ------------------------------------------------------------------ *
 * Themes
 * ------------------------------------------------------------------ */

export type ThemeMeta = { id: string; label: string; dark: boolean };

export const THEME_LIST: ThemeMeta[] = [
  { id: "original", label: "Original", dark: false },
  { id: "quiet", label: "Quiet", dark: true },
  { id: "paper", label: "Paper", dark: false },
  { id: "bold", label: "Bold", dark: false },
  { id: "calm", label: "Calm", dark: false },
  { id: "focus", label: "Focus", dark: false },
];

export const THEMES = THEME_LIST.map((t) => t.id) as readonly string[];
export type Theme = (typeof THEME_LIST)[number]["id"];

const THEME_KEY = "mdbook.theme";
const DEFAULT_THEME = "paper";

// Map legacy theme ids to their closest current equivalent.
const LEGACY_THEME: Record<string, string> = { sepia: "calm", ink: "quiet" };

function normalizeTheme(value: string | null): Theme {
  if (!value) return DEFAULT_THEME;
  const mapped = LEGACY_THEME[value] ?? value;
  return THEMES.includes(mapped) ? mapped : DEFAULT_THEME;
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

/* ------------------------------------------------------------------ *
 * Reading font
 * ------------------------------------------------------------------ */

export type FontMeta = { id: string; label: string; stack: string };

export const FONT_LIST: FontMeta[] = [
  { id: "literata", label: "Literata", stack: '"Literata", Georgia, "Times New Roman", serif' },
  { id: "newsreader", label: "Newsreader", stack: '"Newsreader", Georgia, serif' },
  { id: "lora", label: "Lora", stack: '"Lora", Georgia, serif' },
  { id: "inter", label: "Inter", stack: '"Inter", ui-sans-serif, system-ui, sans-serif' },
  {
    id: "atkinson",
    label: "Atkinson",
    stack: '"Atkinson Hyperlegible", ui-sans-serif, system-ui, sans-serif',
  },
];

const FONT_KEY = "mdbook.font";
const DEFAULT_FONT = "literata";

function applyFont(id: string) {
  const font = FONT_LIST.find((f) => f.id === id) ?? FONT_LIST[0]!;
  document.documentElement.style.setProperty("--reader-font", font.stack);
}

export function useReaderFont() {
  const [font, setFontState] = useState<string>(DEFAULT_FONT);

  useEffect(() => {
    const stored = window.localStorage.getItem(FONT_KEY);
    const next = stored && FONT_LIST.some((f) => f.id === stored) ? stored : DEFAULT_FONT;
    setFontState(next);
    applyFont(next);
  }, []);

  const setFont = useCallback((next: string) => {
    setFontState(next);
    applyFont(next);
    window.localStorage.setItem(FONT_KEY, next);
  }, []);

  return { font, setFont };
}

/* ------------------------------------------------------------------ *
 * Bold text
 * ------------------------------------------------------------------ */

const BOLD_KEY = "mdbook.bold";

function applyBold(on: boolean) {
  document.documentElement.style.setProperty("--reader-weight", on ? "500" : "400");
}

export function useBoldText() {
  const [bold, setBoldState] = useState(false);

  useEffect(() => {
    const on = window.localStorage.getItem(BOLD_KEY) === "1";
    setBoldState(on);
    applyBold(on);
  }, []);

  const setBold = useCallback((next: boolean) => {
    setBoldState(next);
    applyBold(next);
    window.localStorage.setItem(BOLD_KEY, next ? "1" : "0");
  }, []);

  return { bold, setBold };
}

/* ------------------------------------------------------------------ *
 * Text size
 * ------------------------------------------------------------------ */

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
