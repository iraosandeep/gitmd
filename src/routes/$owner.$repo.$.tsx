import { createFileRoute } from "@tanstack/react-router";
import { RepoReader } from "@/components/RepoReader";

export const Route = createFileRoute("/$owner/$repo/$")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.owner}/${params.repo} — GitMD` },
      {
        name: "description",
        content: `Read the Markdown documentation of ${params.owner}/${params.repo} on GitHub in a calm, e-ink styled reader.`,
      },
      { property: "og:title", content: `${params.owner}/${params.repo} — GitMD` },
      {
        property: "og:description",
        content: `Read the Markdown documentation of ${params.owner}/${params.repo} on GitHub in a calm, e-ink styled reader.`,
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `https://gitmd.lovable.app/${params.owner}/${params.repo}/${params._splat ?? ""}` }],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { owner, repo, _splat } = Route.useParams();
  return <RepoReader owner={owner} repo={repo} activePath={_splat ?? ""} />;
}
