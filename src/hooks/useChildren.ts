import { useCallback, useEffect, useRef, useState } from "react";
import { load, type Store } from "@tauri-apps/plugin-store";
import { Child, makeEmptyChild } from "../types";

const STORE_PATH = "roster.json";
const STORE_KEY = "children";

// Older saved rosters predate the processingStatus/pocketMoney fields.
type StoredChild = Omit<Child, "processingStatus" | "pocketMoney"> &
  Partial<Pick<Child, "processingStatus" | "pocketMoney">>;

export function useChildren() {
  const [children, setChildren] = useState<Map<string, Child>>(new Map());
  const [isLoaded, setIsLoaded] = useState(false);
  const storeRef = useRef<Store | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const store = await load(STORE_PATH, { autoSave: false });
      storeRef.current = store;
      const saved = (await store.get<StoredChild[]>(STORE_KEY)) ?? [];
      const normalized: Child[] = saved.map(child => ({
        ...child,
        processingStatus: child.processingStatus ?? "not_started",
        pocketMoney: child.pocketMoney ?? 0,
      }));
      if (!cancelled) {
        setChildren(new Map(normalized.map(child => [child.id, child])));
        setIsLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(async (next: Map<string, Child>) => {
    setChildren(next);
    const store = storeRef.current;
    if (!store) return;
    await store.set(STORE_KEY, Array.from(next.values()));
    await store.save();
  }, []);

  const addChild = useCallback(
    (name: string) => {
      const child = makeEmptyChild(name);
      const next = new Map(children);
      next.set(child.id, child);
      void persist(next);
      return child;
    },
    [children, persist]
  );

  const removeChild = useCallback(
    (id: string) => {
      const next = new Map(children);
      next.delete(id);
      void persist(next);
    },
    [children, persist]
  );

  const updateChild = useCallback(
    (id: string, patch: Partial<Child>) => {
      const current = children.get(id);
      if (!current) return;
      const next = new Map(children);
      next.set(id, { ...current, ...patch });
      void persist(next);
    },
    [children, persist]
  );

  const bulkAddChildren = useCallback(
    (rows: { name: string; phoneNumber: string }[]) => {
      const next = new Map(children);
      for (const row of rows) {
        const child = makeEmptyChild(row.name);
        child.phoneNumber = row.phoneNumber;
        next.set(child.id, child);
      }
      void persist(next);
    },
    [children, persist]
  );

  return { children, isLoaded, addChild, removeChild, updateChild, bulkAddChildren };
}
