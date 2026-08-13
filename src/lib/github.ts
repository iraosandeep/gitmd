import { fetchTreeFromJsDelivr } from "./sources/jsdelivr";
import { fetchTreeFromGitHubPublic } from "./sources/github-public";
import { fetchTreeFromGitHubToken, getGitHubToken } from "./sources/github-token";

export type RepoRef = { owner: string; repo: string; branch?: string };

export function parseRepoInput(input: string): RepoRef | null {
  const raw = input.trim().replace(/\.git$/, "");
  if (!raw) return null;
  let owner = "";
  let repo = "";
  let branch: string | undefined;

  try {
    if (/^https?:\/\//i.test(raw)) {
      const url = new URL(raw);
      if (!/github\.com$/i.test(url.hostname)) return null;
      const parts = url.pathname.split("/").filter(Boolean);
      owner = parts[0] ?? "";
      repo = parts[1] ?? "";
      if (parts[2] === "tree" && parts[3]) branch = parts[3];
    } else {
      const parts = raw.split("/").filter(Boolean);
      owner = parts[0] ?? "";
      repo = parts[1] ?? "";
      if (parts[2]) branch = parts[2];
    }
  } catch {
    return null;
  }
  if (!owner || !repo) return null;
  return { owner, repo, ...(branch ? { branch } : {}) };
}

// Three independent data sources are tried in order, each in its own module under
// ./sources: jsDelivr (fast, keyless, but 50MB repo cap), an authenticated GitHub API
// call using a user-supplied token (if one is set, 5,000 req/hour), and finally the
// anonymous GitHub API (60 req/hour). Any source that fails — for any reason — falls
// through to the next one instead of surfacing an error immediately.
export async function fetchMarkdownTree(
  ref: RepoRef,
): Promise<{ branch: string; files: string[] }> {
  const token = getGitHubToken();
  const attempts = [
    () => fetchTreeFromJsDelivr(ref),
    ...(token ? [() => fetchTreeFromGitHubToken(ref, token)] : []),
    () => fetchTreeFromGitHubPublic(ref),
  ];

  let lastError: unknown;
  for (const attempt of attempts) {
    try {
      return await attempt();
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

export async function fetchFile(ref: RepoRef, branch: string, path: string): Promise<string> {
  const url = `https://raw.githubusercontent.com/${ref.owner}/${ref.repo}/${branch}/${path
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Could not load this file.");
  return res.text();
}

export type TreeNode = {
  name: string;
  path: string;
  children: TreeNode[];
  isFile: boolean;
};

export function buildTree(paths: string[]): TreeNode[] {
  const root: TreeNode = { name: "", path: "", children: [], isFile: false };
  for (const p of paths) {
    const segs = p.split("/");
    let node = root;
    segs.forEach((seg, i) => {
      const isFile = i === segs.length - 1;
      const path = segs.slice(0, i + 1).join("/");
      let next = node.children.find((c) => c.name === seg && c.isFile === isFile);
      if (!next) {
        next = { name: seg, path, children: [], isFile };
        node.children.push(next);
      }
      node = next;
    });
  }
  const sort = (nodes: TreeNode[]) => {
    nodes.sort((a, b) =>
      a.isFile === b.isFile ? a.name.localeCompare(b.name) : a.isFile ? 1 : -1,
    );
    nodes.forEach((n) => sort(n.children));
  };
  sort(root.children);
  return root.children;
}

export function prettyName(name: string) {
  return name.replace(/\.(md|mdx|markdown)$/i, "").replace(/[-_]/g, " ");
}
