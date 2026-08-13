import { useCallback, useEffect, useState } from "react";

export type SavedItem = { owner: string; repo: string; path: string; savedAt: number };

const SAVED_KEY = "mdbook.saved";

function readSaved(): SavedItem[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(SAVED_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useSavedForLater() {
  const [items, setItems] = useState<SavedItem[]>([]);

  useEffect(() => {
    setItems(readSaved());
  }, []);

  const persist = useCallback((next: SavedItem[]) => {
    setItems(next);
    window.localStorage.setItem(SAVED_KEY, JSON.stringify(next));
  }, []);

  const isSaved = useCallback(
    (owner: string, repo: string) => items.some((i) => i.owner === owner && i.repo === repo),
    [items],
  );

  const save = useCallback(
    (owner: string, repo: string, path: string) => {
      const rest = items.filter((i) => !(i.owner === owner && i.repo === repo));
      persist([{ owner, repo, path, savedAt: Date.now() }, ...rest]);
    },
    [items, persist],
  );

  const remove = useCallback(
    (owner: string, repo: string) => {
      persist(items.filter((i) => !(i.owner === owner && i.repo === repo)));
    },
    [items, persist],
  );

  const toggle = useCallback(
    (owner: string, repo: string, path: string) => {
      if (isSaved(owner, repo)) remove(owner, repo);
      else save(owner, repo, path);
    },
    [isSaved, save, remove],
  );

  return { items, isSaved, save, remove, toggle };
}
