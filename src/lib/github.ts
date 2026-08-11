export type RepoRef = { owner: string; repo: string; branch?: string };

export type TreeEntry = { path: string; type: "blob" | "tree"; sha: string };

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

const API = "https://api.github.com";

async function gh<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
  if (!res.ok) {
    if (res.status === 403) throw new Error("GitHub rate limit reached. Try again in a few minutes.");
    if (res.status === 404) throw new Error("Repository not found or is private.");
    throw new Error(`GitHub request failed (${res.status}).`);
  }
  return (await res.json()) as T;
}

export async function fetchDefaultBranch(ref: RepoRef): Promise<string> {
  if (ref.branch) return ref.branch;
  const data = await gh<{ default_branch: string }>(`${API}/repos/${ref.owner}/${ref.repo}`);
  return data.default_branch;
}

export async function fetchMarkdownTree(ref: RepoRef): Promise<{ branch: string; files: string[] }> {
  const branch = await fetchDefaultBranch(ref);
  const data = await gh<{ tree: TreeEntry[]; truncated: boolean }>(
    `${API}/repos/${ref.owner}/${ref.repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
  );
  const files = data.tree
    .filter((e) => e.type === "blob" && /\.(md|mdx|markdown)$/i.test(e.path))
    .map((e) => e.path)
    .sort((a, b) => a.localeCompare(b));
  return { branch, files };
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
