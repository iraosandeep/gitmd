import { useMemo, useState } from "react";
import { ChevronRight, FileText, Folder, FolderOpen, Search } from "lucide-react";
import { buildTree, prettyName, type TreeNode } from "@/lib/github";

function NodeRow({
  node,
  depth,
  activePath,
  onSelect,
  forceOpen,
}: {
  node: TreeNode;
  depth: number;
  activePath: string | null;
  onSelect: (path: string) => void;
  forceOpen: boolean;
}) {
  const [open, setOpen] = useState(depth < 1 || node.children.some((c) => c.path === activePath));
  const isOpen = forceOpen || open;

  if (node.isFile) {
    const active = node.path === activePath;
    return (
      <button
        onClick={() => onSelect(node.path)}
        style={{ paddingLeft: `${depth * 0.85 + 0.6}rem` }}
        className={`group flex w-full items-center gap-2 rounded-sm py-1.5 pr-2 text-left text-[0.84rem] leading-snug transition-colors ${
          active
            ? "bg-accent font-medium text-accent-foreground"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        }`}
      >
        <FileText className="size-3.5 shrink-0 opacity-60" />
        <span className="truncate capitalize">{prettyName(node.name)}</span>
      </button>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{ paddingLeft: `${depth * 0.85 + 0.6}rem` }}
        className="flex w-full items-center gap-1.5 rounded-sm py-1.5 pr-2 text-left text-[0.8rem] font-medium tracking-wide text-foreground/80 transition-colors hover:bg-secondary"
      >
        <ChevronRight
          className={`size-3 shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`}
        />
        {isOpen ? (
          <FolderOpen className="size-3.5 shrink-0 opacity-60" />
        ) : (
          <Folder className="size-3.5 shrink-0 opacity-60" />
        )}
        <span className="truncate">{node.name}</span>
      </button>
      {isOpen && (
        <div>
          {node.children.map((child) => (
            <NodeRow
              key={child.path}
              node={child}
              depth={depth + 1}
              activePath={activePath}
              onSelect={onSelect}
              forceOpen={forceOpen}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileTree({
  files,
  activePath,
  onSelect,
}: {
  files: string[];
  activePath: string | null;
  onSelect: (path: string) => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () =>
      query.trim()
        ? files.filter((f) => f.toLowerCase().includes(query.trim().toLowerCase()))
        : files,
    [files, query],
  );
  const tree = useMemo(() => buildTree(filtered), [filtered]);

  return (
    <div className="flex h-full flex-col paper-grain">
      <div className="relative border-b border-border px-3 py-2.5">
        <Search className="pointer-events-none absolute left-5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search chapters"
          className="w-full rounded-sm border border-border bg-card py-1.5 pl-7 pr-2 text-[0.82rem] text-foreground outline-none placeholder:text-muted-foreground focus:border-ring"
        />
      </div>
      <nav className="flex-1 overflow-y-auto px-2 py-2">
        {tree.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-muted-foreground">No matching files.</p>
        ) : (
          tree.map((node) => (
            <NodeRow
              key={node.path}
              node={node}
              depth={0}
              activePath={activePath}
              onSelect={onSelect}
              forceOpen={query.trim().length > 0}
            />
          ))
        )}
      </nav>
      <div className="border-t border-border px-4 py-2 text-[0.7rem] uppercase tracking-widest text-muted-foreground">
        {files.length} documents
      </div>
    </div>
  );
}
