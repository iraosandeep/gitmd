import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { fetchMarkdownTree } from "@/lib/github";

export const Route = createFileRoute("/$owner/$repo/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { owner, repo } = Route.useParams();
  const navigate = useNavigate();

  const treeQuery = useQuery({
    queryKey: ["tree", owner, repo, undefined],
    queryFn: () => fetchMarkdownTree({ owner, repo }),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    const files = treeQuery.data?.files;
    if (!files || !files.length) return;
    const readme =
      files.find((f) => /^readme\.mdx?$/i.test(f)) ??
      files.find((f) => f.toLowerCase().endsWith("readme.md")) ??
      files[0]!;
    navigate({
      to: "/$owner/$repo/$",
      params: { owner, repo, _splat: readme },
      replace: true,
    });
  }, [treeQuery.data, owner, repo, navigate]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      {treeQuery.isError ? (
        <p className="max-w-sm rounded-sm border border-border bg-card p-4 text-sm text-destructive">
          {(treeQuery.error as Error).message}
        </p>
      ) : (
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      )}
    </main>
  );
}
