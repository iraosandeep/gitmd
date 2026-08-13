import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/Button";
import { useGitHubToken } from "@/hooks/use-github-token";
import { useGitHubTokenValidation } from "@/hooks/use-github-token-validation";

function AppLogo({ className = "size-4" }: { className?: string }) {
  return <img src="/favicon.svg" alt="" className={`${className} rounded-[3px]`} />;
}

export const Route = createFileRoute("/settings/github-token")({
  head: () => ({
    meta: [
      { title: "GitHub token — GitMD" },
      {
        name: "description",
        content:
          "Optionally add a GitHub personal access token to raise the rate limit when reading very large public repositories in GitMD.",
      },
      { property: "og:title", content: "GitHub token — GitMD" },
      {
        property: "og:description",
        content:
          "Optionally add a GitHub personal access token to raise the rate limit when reading very large public repositories in GitMD.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://gitmd.lovable.app/settings/github-token" }],
  }),
  component: GitHubTokenSettings,
});

function GitHubTokenSettings() {
  const { token, setToken } = useGitHubToken();
  const { validation, validate, reset } = useGitHubTokenValidation();
  const [draft, setDraft] = useState(token);

  useEffect(() => {
    setDraft(token);
  }, [token]);

  const handleSave = async () => {
    if (!draft) {
      setToken("");
      reset();
      return;
    }
    const ok = await validate(draft);
    if (ok) setToken(draft);
  };

  const handleClear = () => {
    setDraft("");
    setToken("");
    reset();
  };

  return (
    <main className="flex min-h-screen flex-col items-center px-6 py-16">
      <div className="w-full max-w-xl">
        <div className="mb-10 flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm uppercase tracking-[0.3em] text-muted-foreground">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <AppLogo className="size-8" /> GitMD
            </Link>
          </span>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            Back
          </Link>
        </div>

        <h1 className="font-[family-name:var(--font-serif-read)] text-3xl leading-tight tracking-tight sm:text-4xl">
          GitHub personal access token
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          GitMD reads public repos through jsDelivr first, which has no rate limit for normal use.
          It only falls back to GitHub's own API for very large repos (over jsDelivr's 50MB mirror
          cap), and that API allows just 60 requests/hour without a token. Adding a token here
          raises that fallback limit to 5,000/hour.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          This is entirely optional — most repos never need it.
        </p>

        {/* Token input */}
        <div className="mt-8 rounded-md border border-border bg-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="github-token"
              className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-muted-foreground"
            >
              Your token
            </label>
            {validation.status === "checking" && (
              <span className="flex items-center gap-1 text-[0.65rem] text-muted-foreground">
                <Loader2 className="size-3 animate-spin" /> Checking token…
              </span>
            )}
            {validation.status === "valid" && (
              <span className="flex items-center gap-1 text-[0.65rem] text-muted-foreground">
                <Check className="size-3" />
                {`Valid — ${validation.limit.toLocaleString()} requests/hour`}
              </span>
            )}
            {validation.status === "invalid" && (
              <span className="flex items-center gap-1 text-[0.65rem] text-destructive">
                <X className="size-3" /> Invalid or expired token
              </span>
            )}
            {validation.status === "idle" && token && draft === token && (
              <span className="flex items-center gap-1 text-[0.65rem] text-muted-foreground">
                <Check className="size-3" /> Saved in this browser
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <input
              id="github-token"
              type="password"
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value);
                reset();
              }}
              placeholder="ghp_... or github_pat_..."
              autoComplete="off"
              spellCheck={false}
              className={`flex-1 rounded-sm border bg-background px-2.5 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring ${
                validation.status === "invalid" ? "border-destructive" : "border-border"
              }`}
            />
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={validation.status === "checking" || (!draft && !token)}
              className="px-3 py-2"
            >
              {validation.status === "checking" ? "Checking…" : "Save"}
            </Button>
            {token && (
              <Button
                variant="outline"
                onClick={handleClear}
                className="bg-transparent py-2 text-sm hover:bg-secondary"
              >
                Clear
              </Button>
            )}
          </div>
          <p className="mt-2 text-[0.7rem] leading-relaxed text-muted-foreground">
            Stored only in this browser's local storage. Sent only to api.github.com, never anywhere
            else.
          </p>
        </div>

        {/* Recommended: fine-grained */}
        <section className="mt-10">
          <h2 className="text-lg font-medium text-foreground">Recommended: a fine-grained token</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Scoped to public read access only — it can never touch your private repos or account
            settings, even by accident.
          </p>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-foreground">
            <li>
              Open{" "}
              <a
                href="https://github.com/settings/personal-access-tokens/new"
                target="_blank"
                rel="noreferrer noopener"
                className="text-primary underline underline-offset-2"
              >
                github.com/settings/personal-access-tokens/new
              </a>{" "}
              (or Generate new token → <em>Fine-grained</em>).
            </li>
            <li>Give it any name and expiration you like.</li>
            <li>
              Under <strong>Repository access</strong>, choose{" "}
              <strong>Public Repositories (read-only)</strong>.
            </li>
            <li>
              Leave <strong>Permissions</strong> as-is — nothing needs to be checked for public read
              access.
            </li>
            <li>Click Generate token, paste it into the field above, then hit Save.</li>
          </ol>
        </section>

        {/* Alternative: classic */}
        <section className="mt-10 border-t border-border pt-8">
          <h2 className="text-lg font-medium text-foreground">Alternative: a classic token</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Simpler, but scopes apply to your whole account — the important part is to select
            nothing.
          </p>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-foreground">
            <li>
              Open{" "}
              <a
                href="https://github.com/settings/tokens/new"
                target="_blank"
                rel="noreferrer noopener"
                className="text-primary underline underline-offset-2"
              >
                github.com/settings/tokens/new
              </a>{" "}
              (or Generate new token → <em>Classic</em>).
            </li>
            <li>Give it any note and expiration you like.</li>
            <li>
              Leave <strong>every scope checkbox unchecked</strong>. A token with zero scopes still
              gets the higher rate limit for reading public data — no access is needed beyond that.
            </li>
            <li>Click Generate token, paste it into the field above, then hit Save.</li>
          </ol>
          <p className="mt-4 rounded-sm border border-border bg-card p-3 text-sm text-destructive">
            Don't check <strong>repo</strong>. That scope grants full read/write access to all of
            your private repositories — GitMD only ever reads the public repo you point it at, so it
            never needs that.
          </p>
        </section>
      </div>
    </main>
  );
}
