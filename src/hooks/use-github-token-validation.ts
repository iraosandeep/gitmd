import { useCallback, useState } from "react";

export type GitHubTokenValidation =
  | { status: "idle" }
  | { status: "checking" }
  | { status: "valid"; limit: number }
  | { status: "invalid" };

// /rate_limit works for any authenticated token regardless of scope, so it doubles as
// a scope-agnostic "is this token even valid" check and reports the real limit it grants.
// Validation only runs when `validate` is called explicitly (on Save) — never automatically.
export function useGitHubTokenValidation() {
  const [validation, setValidation] = useState<GitHubTokenValidation>({ status: "idle" });

  const validate = useCallback(async (token: string): Promise<boolean> => {
    if (!token) {
      setValidation({ status: "idle" });
      return false;
    }
    setValidation({ status: "checking" });
    try {
      const res = await fetch("https://api.github.com/rate_limit", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        setValidation({ status: "invalid" });
        return false;
      }
      const data = (await res.json()) as { resources?: { core?: { limit?: number } } };
      setValidation({ status: "valid", limit: data.resources?.core?.limit ?? 5000 });
      return true;
    } catch {
      setValidation({ status: "invalid" });
      return false;
    }
  }, []);

  const reset = useCallback(() => setValidation({ status: "idle" }), []);

  return { validation, validate, reset };
}
