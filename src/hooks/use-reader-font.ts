import { useCallback, useEffect, useState } from "react";

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
  { id: "mono", label: "Mono", stack: '"IBM Plex Mono", ui-monospace, SFMono-Regular, monospace' },
];

const FONT_KEY = "mdbook.font";
export const DEFAULT_FONT = "literata";

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
