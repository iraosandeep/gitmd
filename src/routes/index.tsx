import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BookmarkCheck, X } from "lucide-react";
import { parseRepoInput, prettyName } from "@/lib/github";
import { GitHubTokenLink } from "@/components/GitHubTokenLink";
import { ReaderSettings } from "@/components/ReaderSettings";
import { useBoldText } from "@/hooks/use-bold-text";
import { useGrainBackground } from "@/hooks/use-grain-background";
import { useReaderFont } from "@/hooks/use-reader-font";
import { useReaderSize } from "@/hooks/use-reader-size";
import { useSavedForLater } from "@/hooks/use-saved-for-later";
import { useTheme } from "@/hooks/use-theme";

function AppLogo({ className = "size-4" }: { className?: string }) {
  return <img src="/favicon.svg" alt="" className={`${className} rounded-[3px]`} />;
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GitMD — Read any GitHub repo's docs like a book" },
      {
        name: "description",
        content:
          "Paste a public GitHub repo and read all of its Markdown files as a calm, e-ink styled book with the original folder structure.",
      },
      { property: "og:title", content: "GitMD — GitHub Markdown, read like a book" },
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

function Index() {
  const { theme, setTheme } = useTheme();
  const { size, setSize } = useReaderSize();
  const { font, setFont } = useReaderFont();
  const { bold, setBold } = useBoldText();
  const { enabled: grain, setEnabled: setGrain } = useGrainBackground();
  const { items: saved, remove: removeSaved } = useSavedForLater();
  const navigate = useNavigate();

  const [input, setInput] = useState("https://github.com/humanlayer/12-factor-agents");

  const load = (value: string) => {
    const parsed = parseRepoInput(value);
    if (!parsed) return;
    navigate({ to: "/$owner/$repo", params: { owner: parsed.owner, repo: parsed.repo } });
  };

  const openSaved = (owner: string, repo: string, path: string) => {
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
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl">
        <div className="mb-10 flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-muted-foreground">
            <AppLogo className="size-8" /> GitMD
          </span>
          <div className="flex items-center gap-2">
            <GitHubTokenLink />
            {readerSettings}
          </div>
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

        {saved.length > 0 && (
          <div className="mt-10 border-t border-border pt-6">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Saved for later
            </span>
            <ul className="mt-3 flex max-h-60 flex-col gap-1.5 overflow-y-auto pr-1">
              {saved.map((s) => (
                <li key={`${s.owner}/${s.repo}`} className="flex items-center gap-2">
                  <button
                    onClick={() => openSaved(s.owner, s.repo, s.path)}
                    className="flex min-w-0 flex-1 items-center gap-2 rounded-sm border border-border bg-card px-3 py-2 text-left text-sm transition-colors hover:bg-secondary"
                  >
                    <BookmarkCheck className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 truncate">
                      <span className="text-foreground">
                        {s.owner}/{s.repo}
                      </span>
                      <span className="text-muted-foreground">
                        {" "}
                        — {prettyName(s.path.split("/").pop() ?? s.path)}
                      </span>
                    </span>
                  </button>
                  <button
                    onClick={() => removeSaved(s.owner, s.repo)}
                    aria-label={`Remove ${s.owner}/${s.repo} from saved`}
                    className="rounded-sm p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
