import type { RepoRef } from "../github";

// jsDelivr mirrors public GitHub repos with generous, keyless rate limits — unlike
// api.github.com's 60 req/hour anonymous cap, which real usage exhausts in minutes.
// "HEAD" is a valid git ref here that always resolves to the repo's default branch,
// so we never need a separate lookup for it. The one gap: jsDelivr refuses to mirror
// repos over 50MB, which is why this is tried first and not relied on exclusively.
const JSDELIVR_DATA = "https://data.jsdelivr.com/v1/packages/gh";

type JsDelivrNode =
  { type: "file"; name: string } | { type: "directory"; name: string; files: JsDelivrNode[] };

function flattenTree(nodes: JsDelivrNode[], prefix = ""): string[] {
  const out: string[] = [];
  for (const node of nodes) {
    const path = prefix ? `${prefix}/${node.name}` : node.name;
    if (node.type === "directory") out.push(...flattenTree(node.files, path));
    else out.push(path);
  }
  return out;
}

export async function fetchTreeFromJsDelivr(
  ref: RepoRef,
): Promise<{ branch: string; files: string[] }> {
  const branch = ref.branch ?? "HEAD";
  const res = await fetch(
    `${JSDELIVR_DATA}/${ref.owner}/${ref.repo}@${encodeURIComponent(branch)}`,
  );
  if (!res.ok) {
    if (res.status === 404) throw new Error("Repository not found or is private.");
    throw new Error(`Could not load repository contents (${res.status}).`);
  }
  const data = (await res.json()) as { files: JsDelivrNode[] };
  const files = flattenTree(data.files)
    .filter((p) => /\.(md|mdx|markdown)$/i.test(p))
    .sort((a, b) => a.localeCompare(b));
  return { branch, files };
}
