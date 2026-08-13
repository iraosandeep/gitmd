import { useNavigate } from "@tanstack/react-router";
import { BookmarkCheck, X } from "lucide-react";
import { Button } from "@/components/Button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { prettyName } from "@/lib/github";
import { useSavedForLater } from "@/hooks/use-saved-for-later";

export function SavedForLaterDrawer() {
  const { items: saved, remove: removeSaved } = useSavedForLater();
  const navigate = useNavigate();

  if (saved.length === 0) return null;

  const openSaved = (owner: string, repo: string, path: string) => {
    navigate({ to: "/$owner/$repo/$", params: { owner, repo, _splat: path } });
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">
          <BookmarkCheck className="size-3.5" />
          Saved for later ({saved.length})
        </Button>
      </DrawerTrigger>
      <DrawerContent className="mx-auto max-w-2xl">
        <div className="paper-grain">
          <DrawerHeader>
            <DrawerTitle>Saved for later</DrawerTitle>
          </DrawerHeader>
          <ul className="flex max-h-[60vh] flex-col gap-1.5 overflow-y-auto px-4 pb-6">
            {saved.map((s) => (
              <li key={`${s.owner}/${s.repo}`} className="flex items-center gap-2">
                <DrawerClose asChild>
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
                </DrawerClose>
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
      </DrawerContent>
    </Drawer>
  );
}
