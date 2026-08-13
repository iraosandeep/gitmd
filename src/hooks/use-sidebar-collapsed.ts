import { useCallback, useEffect, useState } from "react";

const SIDEBAR_COLLAPSED_KEY = "mdbook.sidebarCollapsed";

export function useSidebarCollapsed() {
  const [collapsed, setCollapsedState] = useState(false);

  useEffect(() => {
    setCollapsedState(window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1");
  }, []);

  const setCollapsed = useCallback((next: boolean) => {
    setCollapsedState(next);
    window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? "1" : "0");
  }, []);

  return { collapsed, setCollapsed };
}
