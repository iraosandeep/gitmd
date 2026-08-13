import type { RepoRef } from "../github";

// Falls back to the official, unauthenticated GitHub REST API. No size cap (unlike
// jsDelivr), but limited to 60 requests/hour per IP — easy to exhaust with real usage.
const GITHUB_API = "https://api.github.com";

type GitTreeEntry = { path: string; type: "blob" | "tree" };

async function githubApi<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
  if (!res.ok) {
    if (res.status === 403)
      throw new Error("GitHub rate limit reached. Try again in a few minutes.");
    if (res.status === 404) throw new Error("Repository not found or is private.");
    throw new Error(`GitHub request failed (${res.status}).`);
  }
  return (await res.json()) as T;
}

export async function fetchTreeFromGitHubPublic(
  ref: RepoRef,
): Promise<{ branch: string; files: string[] }> {
  const branch =
    ref.branch ??
    (await githubApi<{ default_branch: string }>(`${GITHUB_API}/repos/${ref.owner}/${ref.repo}`))
      .default_branch;
  const data = await githubApi<{ tree: GitTreeEntry[] }>(
    `${GITHUB_API}/repos/${ref.owner}/${ref.repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
  );
  const files = data.tree
    .filter((e) => e.type === "blob" && /\.(md|mdx|markdown)$/i.test(e.path))
    .map((e) => e.path)
    .sort((a, b) => a.localeCompare(b));
  return { branch, files };
}
