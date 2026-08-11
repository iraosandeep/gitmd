import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Github,
  Loader2,
  Menu,
  Minus,
  Plus,
  X,
} from "lucide-react";
import { FileTree } from "@/components/FileTree";
import { MarkdownView } from "@/components/MarkdownView";
import {
  fetchFile,
  fetchMarkdownTree,
  parseRepoInput,
  prettyName,
  type RepoRef,
} from "@/lib/github";
import { SIZES, THEMES, useReaderSize, useTheme } from "@/hooks/use-reader-prefs";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gitmd — Read any GitHub repo's docs like a book" },
      {
        name: "description",
        content:
          "Paste a public GitHub repo and read all of its Markdown files as a calm, e-ink styled book with the original folder structure.",
      },
      { property: "og:title", content: "Gitmd — GitHub Markdown, read like a book" },
      {
        property: "og:description",
        content:
          "A distraction-free e-ink reader for the Markdown documentation inside any public GitHub repository.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const EXAMPLES = [
  { label: "12-Factor Agents", value: "humanlayer/12-factor-agents" },
  { label: "Awesome Python", value: "vinta/awesome-python" },
  { label: "React", value: "facebook/react" },
];

const THEME_LABEL: Record<string, string> = { paper: "Paper", sepia: "Sepia", ink: "Ink" };

function Index() {
  const { theme, setTheme } = useTheme();
  const { size, setSize } = useReaderSize();

  const [input, setInput] = useState("https://github.com/humanlayer/12-factor-agents");
  const [repo, setRepo] = useState<RepoRef | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [sidebar, setSidebar] = useState(false);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const [r, p] = hash.split("|");
      const parsed = r ? parseRepoInput(r) : null;
      if (parsed) {
        setRepo(parsed);
        setInput(`https://github.com/${parsed.owner}/${parsed.repo}`);
        if (p) setActive(decodeURIComponent(p));
      }
    }
  }, []);

  const treeQuery = useQuery({
    queryKey: ["tree", repo?.owner, repo?.repo, repo?.branch],
    queryFn: () => fetchMarkdownTree(repo as RepoRef),
    enabled: !!repo,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const files = treeQuery.data?.files ?? [];
  const branch = treeQuery.data?.branch ?? "main";

  useEffect(() => {
    if (!active && files.length) {
      const readme =
        files.find((f) => /^readme\.mdx?$/i.test(f)) ??
        files.find((f) => f.toLowerCase().endsWith("readme.md")) ??
        files[0]!;
      setActive(readme);
    }
  }, [files, active]);

  useEffect(() => {
    if (repo && active) {
      window.history.replaceState(
        null,
        "",
        `#${repo.owner}/${repo.repo}|${encodeURIComponent(active)}`,
      );
    }
  }, [repo, active]);

  const fileQuery = useQuery({
    queryKey: ["file", repo?.owner, repo?.repo, branch, active],
    queryFn: () => fetchFile(repo as RepoRef, branch, active as string),
    enabled: !!repo && !!active && !!treeQuery.data,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const index = active ? files.indexOf(active) : -1;
  const prev = index > 0 ? files[index - 1]! : null;
  const next = index >= 0 && index < files.length - 1 ? files[index + 1]! : null;

  const rawBase = useMemo(
    () => (repo ? `https://raw.githubusercontent.com/${repo.owner}/${repo.repo}/${branch}` : ""),
    [repo, branch],
  );

  const open = (path: string) => {
    setActive(path);
    setSidebar(false);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  };

  const load = (value: string) => {
    const parsed = parseRepoInput(value);
    if (!parsed) return;
    setActive(null);
    setRepo(parsed);
    setSidebar(false);
  };

  const themeSwitcher = (
    <div className="flex items-center gap-0.5 rounded-sm border border-border bg-card p-0.5">
      {THEMES.map((t) => (
        <button
          key={t}
          onClick={() => setTheme(t)}
          className={`rounded-[3px] px-2 py-1 text-[0.7rem] uppercase tracking-widest transition-colors ${
            theme === t
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {THEME_LABEL[t]}
        </button>
      ))}
    </div>
  );

  if (!repo) {
    return (
      <main className="paper-grain flex min-h-screen flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl">
          <div className="mb-10 flex items-center justify-between">
            <span className="flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-muted-foreground">
              <BookOpen className="size-4" /> Gitmd
            </span>
            {themeSwitcher}
          </div>
          <h1 className="font-[family-name:var(--font-serif-read)] text-4xl leading-tight tracking-tight sm:text-5xl">
            Read any GitHub repo like a book.
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
            Paste a public repository. Every Markdown file becomes a chapter — folder structure
            intact, typeset for e-ink calm.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              load(input);
            }}
            className="mt-8 flex flex-col gap-2 sm:flex-row"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="github.com/owner/repo"
              className="flex-1 rounded-sm border border-border bg-card px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-ring"
            />
            <button
              type="submit"
              className="rounded-sm bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Open book
            </button>
          </form>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Try</span>
            {EXAMPLES.map((e) => (
              <button
                key={e.value}
                onClick={() => {
                  setInput(`https://github.com/${e.value}`);
                  load(e.value);
                }}
                className="rounded-sm border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {e.label}
              </button>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-background/95 px-3 py-2 backdrop-blur sm:px-4">
        <button
          onClick={() => setSidebar((v) => !v)}
          className="rounded-sm p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground lg:hidden"
          aria-label="Toggle contents"
        >
          {sidebar ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>

        <button
          onClick={() => {
            setRepo(null);
            setActive(null);
            window.history.replaceState(null, "", " ");
          }}
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <BookOpen className="size-4" />
          <span className="hidden font-medium sm:inline">Gitmd</span>
        </button>

        <span className="truncate text-sm text-foreground/80">
          {repo.owner}/<span className="font-medium text-foreground">{repo.repo}</span>
        </span>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-0.5 rounded-sm border border-border bg-card p-0.5 sm:flex">
            <button
              onClick={() => setSize(SIZES[Math.max(0, SIZES.indexOf(size as never) - 1)]!)}
              className="rounded-[3px] px-1.5 py-1 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Decrease text size"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="px-1 text-[0.7rem] uppercase tracking-widest text-muted-foreground">
              Aa
            </span>
            <button
              onClick={() =>
                setSize(SIZES[Math.min(SIZES.length - 1, SIZES.indexOf(size as never) + 1)]!)
              }
              className="rounded-[3px] px-1.5 py-1 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Increase text size"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
          {themeSwitcher}
          <a
            href={`https://github.com/${repo.owner}/${repo.repo}`}
            target="_blank"
            rel="noreferrer noopener"
            className="hidden rounded-sm p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:block"
            aria-label="View on GitHub"
          >
            <Github className="size-4" />
          </a>
        </div>
      </header>

      <div className="flex flex-1">
        <aside
          className={`fixed inset-y-0 left-0 top-[49px] z-20 w-72 border-r border-border bg-card transition-transform lg:sticky lg:top-[49px] lg:h-[calc(100vh-49px)] lg:translate-x-0 ${
            sidebar ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {treeQuery.isLoading ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
            </div>
          ) : (
            <FileTree files={files} activePath={active} onSelect={open} />
          )}
        </aside>

        {sidebar && (
          <button
            aria-label="Close contents"
            onClick={() => setSidebar(false)}
            className="fixed inset-0 top-[49px] z-10 bg-foreground/20 lg:hidden"
          />
        )}

        <main className="min-w-0 flex-1 px-5 py-10 sm:px-10 lg:px-16">
          <div className="mx-auto w-full max-w-[46rem]">
            {treeQuery.isError && (
              <p className="rounded-sm border border-border bg-card p-4 text-sm text-destructive">
                {(treeQuery.error as Error).message}
              </p>
            )}

            {(treeQuery.isLoading || fileQuery.isLoading) && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Loading chapter…
              </div>
            )}

            {fileQuery.isError && (
              <p className="text-sm text-destructive">{(fileQuery.error as Error).message}</p>
            )}

            {fileQuery.data && active && (
              <>
                <p className="mb-6 text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground">
                  {active.includes("/") ? active.slice(0, active.lastIndexOf("/")) : "Root"}
                </p>
                <MarkdownView
                  content={fileQuery.data}
                  currentPath={active}
                  rawBase={rawBase}
                  files={files}
                  onNavigate={open}
                />

                <nav className="mt-16 flex items-stretch gap-3 border-t border-border pt-6">
                  {prev ? (
                    <button
                      onClick={() => open(prev)}
                      className="flex flex-1 items-center gap-2 rounded-sm border border-border bg-card px-4 py-3 text-left text-sm transition-colors hover:bg-secondary"
                    >
                      <ChevronLeft className="size-4 shrink-0 text-muted-foreground" />
                      <span className="min-w-0">
                        <span className="block text-[0.65rem] uppercase tracking-widest text-muted-foreground">
                          Previous
                        </span>
                        <span className="block truncate capitalize">
                          {prettyName(prev.split("/").pop()!)}
                        </span>
                      </span>
                    </button>
                  ) : (
                    <span className="flex-1" />
                  )}
                  {next ? (
                    <button
                      onClick={() => open(next)}
                      className="flex flex-1 items-center justify-end gap-2 rounded-sm border border-border bg-card px-4 py-3 text-right text-sm transition-colors hover:bg-secondary"
                    >
                      <span className="min-w-0">
                        <span className="block text-[0.65rem] uppercase tracking-widest text-muted-foreground">
                          Next
                        </span>
                        <span className="block truncate capitalize">
                          {prettyName(next.split("/").pop()!)}
                        </span>
                      </span>
                      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                    </button>
                  ) : (
                    <span className="flex-1" />
                  )}
                </nav>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
