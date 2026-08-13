import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Github,
  Loader2,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "lucide-react";
import { FileTree } from "@/components/FileTree";
import { GitHubTokenLink } from "@/components/GitHubTokenLink";
import { MarkdownView } from "@/components/MarkdownView";
import { ReaderSettings } from "@/components/ReaderSettings";
import { fetchFile, fetchMarkdownTree, prettyName } from "@/lib/github";
import { useBoldText } from "@/hooks/use-bold-text";
import { useGrainBackground } from "@/hooks/use-grain-background";
import { useReaderFont } from "@/hooks/use-reader-font";
import { useReaderSize } from "@/hooks/use-reader-size";
import { useSavedForLater } from "@/hooks/use-saved-for-later";
import { useSidebarCollapsed } from "@/hooks/use-sidebar-collapsed";
import { useTheme } from "@/hooks/use-theme";

function AppLogo({ className = "size-4" }: { className?: string }) {
  return <img src="/favicon.svg" alt="" className={`${className} rounded-[3px]`} />;
}

export function RepoReader({
  owner,
  repo,
  activePath,
}: {
  owner: string;
  repo: string;
  activePath: string;
}) {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { size, setSize } = useReaderSize();
  const { font, setFont } = useReaderFont();
  const { bold, setBold } = useBoldText();
  const { collapsed, setCollapsed } = useSidebarCollapsed();
  const { enabled: grain, setEnabled: setGrain } = useGrainBackground();
  const { isSaved, save, toggle: toggleSaved } = useSavedForLater();

  const [sidebar, setSidebar] = useState(false);

  const treeQuery = useQuery({
    queryKey: ["tree", owner, repo, undefined],
    queryFn: () => fetchMarkdownTree({ owner, repo }),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const files = treeQuery.data?.files ?? [];
  const branch = treeQuery.data?.branch ?? "main";

  const fileQuery = useQuery({
    queryKey: ["file", owner, repo, branch, activePath],
    queryFn: () => fetchFile({ owner, repo }, branch, activePath),
    enabled: !!activePath && !!treeQuery.data,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [activePath]);

  useEffect(() => {
    if (activePath && isSaved(owner, repo)) save(owner, repo, activePath);
    // Only re-run when the chapter changes; re-saving on every `items` update would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owner, repo, activePath]);

  const index = activePath ? files.indexOf(activePath) : -1;
  const prev = index > 0 ? files[index - 1]! : null;
  const next = index >= 0 && index < files.length - 1 ? files[index + 1]! : null;

  const rawBase = useMemo(
    () => `https://raw.githubusercontent.com/${owner}/${repo}/${branch}`,
    [owner, repo, branch],
  );

  const open = (path: string) => {
    setSidebar(false);
    navigate({ to: "/$owner/$repo/$", params: { owner, repo, _splat: path } });
  };

  const readerSettings = (
    <ReaderSettings
      theme={theme}
      setTheme={setTheme}
      font={font}
      setFont={setFont}
      bold={bold}
      setBold={setBold}
      size={size}
      setSize={setSize}
      grain={grain}
      setGrain={setGrain}
    />
  );

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
          onClick={() => setCollapsed(!collapsed)}
          className="hidden rounded-sm p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground lg:block"
          aria-label={collapsed ? "Show contents" : "Hide contents"}
          title={collapsed ? "Show contents" : "Hide contents"}
        >
          {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
        </button>

        <button
          onClick={() => navigate({ to: "/" })}
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <AppLogo className="size-6" />
          {/*<span className="hidden font-medium sm:inline">GitMD</span>*/}
        </button>

        <span className="truncate text-sm text-foreground/80">
          {owner}/<span className="font-medium text-foreground">{repo}</span>
        </span>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => toggleSaved(owner, repo, activePath)}
            className="rounded-sm p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label={isSaved(owner, repo) ? "Remove from saved" : "Save for later"}
            aria-pressed={isSaved(owner, repo)}
            title={isSaved(owner, repo) ? "Remove from saved" : "Save for later"}
          >
            {isSaved(owner, repo) ? (
              <BookmarkCheck className="size-4" />
            ) : (
              <Bookmark className="size-4" />
            )}
          </button>
          <GitHubTokenLink />
          {readerSettings}
          <a
            href={`https://github.com/${owner}/${repo}`}
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
          className={`fixed inset-y-0 left-0 top-[49px] z-20 w-72 shrink-0 overflow-hidden border-r border-border bg-card transition-transform lg:sticky lg:top-[49px] lg:h-[calc(100vh-49px)] lg:translate-x-0 lg:transition-all ${
            sidebar ? "translate-x-0" : "-translate-x-full"
          } ${collapsed ? "lg:w-0 lg:border-r-0" : "lg:w-72"}`}
        >
          {treeQuery.isLoading ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
            </div>
          ) : (
            <FileTree files={files} activePath={activePath} onSelect={open} />
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

            {fileQuery.data && activePath && (
              <>
                <p className="mb-6 text-[0.7rem] uppercase tracking-[0.25em] text-muted-foreground">
                  {activePath.includes("/")
                    ? activePath.slice(0, activePath.lastIndexOf("/"))
                    : "Root"}
                </p>
                <MarkdownView
                  content={fileQuery.data}
                  currentPath={activePath}
                  rawBase={rawBase}
                  files={files}
                  owner={owner}
                  repo={repo}
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
