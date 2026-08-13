import { Button } from "@/components/Button";
import { SavedForLaterDrawer } from "@/components/SavedForLaterDrawer";
import { SettingControl } from "@/components/SettingControl";
import { parseRepoInput } from "@/lib/github";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

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
  const navigate = useNavigate();

  const [input, setInput] = useState("https://github.com/humanlayer/12-factor-agents");

  const load = (value: string) => {
    const parsed = parseRepoInput(value);
    if (!parsed) return;
    navigate({ to: "/$owner/$repo", params: { owner: parsed.owner, repo: parsed.repo } });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl">
        <div className="mb-10 flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-muted-foreground">
            <AppLogo className="size-8" /> GitMD
          </span>
          <div className="flex items-center gap-2">
            <SettingControl />
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
          <Button type="submit" variant="primary">
            Open book
          </Button>
        </form>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-widest text-muted-foreground">Try</span>
          {EXAMPLES.map((e) => (
            <Button
              key={e.value}
              variant="outline"
              onClick={() => {
                setInput(`https://github.com/${e.value}`);
                load(e.value);
              }}
            >
              {e.label}
            </Button>
          ))}
        </div>

        <div className="mt-6">
          <SavedForLaterDrawer />
        </div>
      </div>
    </main>
  );
}
