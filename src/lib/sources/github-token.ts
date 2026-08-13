import type { RepoRef } from "../github";

// A user-supplied personal access token, sent straight to api.github.com from the
// browser (never anywhere else). Authenticated requests get 5,000/hour instead of the
// anonymous 60/hour, so this is tried before the public, unauthenticated fallback.
const GITHUB_API = "https://api.github.com";
const TOKEN_KEY = "mdbook.githubToken";

export function getGitHubToken(): string {
  try {
    return window.localStorage.getItem(TOKEN_KEY) ?? "";
  } catch {
    return "";
  }
}

export function setGitHubToken(token: string) {
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

type GitTreeEntry = { path: string; type: "blob" | "tree" };

async function githubApi<T>(url: string, token: string): Promise<T> {
  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error("GitHub token is invalid or expired.");
    if (res.status === 403)
      throw new Error("GitHub rate limit reached. Try again in a few minutes.");
    if (res.status === 404) throw new Error("Repository not found or is private.");
    throw new Error(`GitHub request failed (${res.status}).`);
  }
  return (await res.json()) as T;
}

export async function fetchTreeFromGitHubToken(
  ref: RepoRef,
  token: string,
): Promise<{ branch: string; files: string[] }> {
  const branch =
    ref.branch ??
    (
      await githubApi<{ default_branch: string }>(
        `${GITHUB_API}/repos/${ref.owner}/${ref.repo}`,
        token,
      )
    ).default_branch;
  const data = await githubApi<{ tree: GitTreeEntry[] }>(
    `${GITHUB_API}/repos/${ref.owner}/${ref.repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
    token,
  );
  const files = data.tree
    .filter((e) => e.type === "blob" && /\.(md|mdx|markdown)$/i.test(e.path))
    .map((e) => e.path)
    .sort((a, b) => a.localeCompare(b));
  return { branch, files };
}
