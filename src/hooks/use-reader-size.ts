import { useCallback, useEffect, useState } from "react";

const SIZE_KEY = "mdbook.size";
export const SIZE_MIN = 0.875;
export const SIZE_MAX = 1.5;
export const SIZE_STEP = 0.025;
export const DEFAULT_SIZE = 1.125;

export function useReaderSize() {
  const [size, setSizeState] = useState<number>(DEFAULT_SIZE);

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
