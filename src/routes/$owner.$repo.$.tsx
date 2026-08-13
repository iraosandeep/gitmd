import { createFileRoute } from "@tanstack/react-router";
import { RepoReader } from "@/components/RepoReader";

export const Route = createFileRoute("/$owner/$repo/$")({
  component: RouteComponent,
});

function RouteComponent() {
  const { owner, repo, _splat } = Route.useParams();
  return <RepoReader owner={owner} repo={repo} activePath={_splat ?? ""} />;
}
