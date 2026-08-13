import { useCallback, useEffect, useState } from "react";

const BOLD_KEY = "mdbook.bold";
export const DEFAULT_BOLD = false;

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
