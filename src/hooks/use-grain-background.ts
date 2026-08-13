import { useCallback, useEffect, useState } from "react";

const GRAIN_KEY = "mdbook.grain";

export function useGrainBackground() {
  const [enabled, setEnabledState] = useState(true);

  useEffect(() => {
    const on = window.localStorage.getItem(GRAIN_KEY) !== "0";
    setEnabledState(on);
    document.documentElement.setAttribute("data-grain", on ? "on" : "off");
  }, []);

  const setEnabled = useCallback((next: boolean) => {
    setEnabledState(next);
    document.documentElement.setAttribute("data-grain", next ? "on" : "off");
    window.localStorage.setItem(GRAIN_KEY, next ? "1" : "0");
  }, []);

  return { enabled, setEnabled };
}
