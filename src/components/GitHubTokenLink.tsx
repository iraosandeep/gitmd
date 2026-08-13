import { Link } from "@tanstack/react-router";
import { Gauge } from "lucide-react";
import { useGitHubToken } from "@/hooks/use-github-token";

export function GitHubTokenLink() {
  const { token } = useGitHubToken();

  return (
    <Link
      to="/settings/github-token"
      className="relative rounded-sm p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      aria-label={token ? "GitHub token saved — manage" : "Set up a GitHub token"}
      title={token ? "GitHub token saved — manage" : "Set up a GitHub token"}
    >
      <Gauge className="size-4" />
      {token && (
        <span
          className="absolute right-1 top-1 size-1.5 rounded-full bg-primary"
          aria-hidden="true"
        />
      )}
    </Link>
  );
}
