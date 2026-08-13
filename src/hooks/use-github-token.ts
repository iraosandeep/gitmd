import { useCallback, useEffect, useState } from "react";
import { getGitHubToken, setGitHubToken } from "@/lib/sources/github-token";

export function useGitHubToken() {
  const [token, setTokenState] = useState("");

  useEffect(() => {
    setTokenState(getGitHubToken());
  }, []);

  const setToken = useCallback((next: string) => {
    setTokenState(next);
    setGitHubToken(next);
  }, []);

  return { token, setToken };
}
