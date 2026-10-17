"use client";
import {
  createContext,
  useContext,
  useSyncExternalStore,
  useCallback,
  type ReactNode,
} from "react";
import { demoStateSchema, type DemoState } from "@/lib/model";
import { createSeed } from "@/lib/seed";
const KEY = "care-manager-demo-v1";
let cached: DemoState | null = null;
let storageError: string | null = null;
const listeners = new Set<() => void>();
function notify() {
  listeners.forEach((fn) => fn());
}
function snapshot() {
  if (cached) return cached;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = demoStateSchema.safeParse(JSON.parse(raw));
      if (parsed.success) cached = parsed.data;
      else
        storageError =
          "Saved demo data is incompatible. Reset the demo to continue.";
    }
  } catch {
    storageError =
      "Saved demo data could not be read. Changes will stay in this tab until storage is available.";
  }
  cached ||= createSeed();
  return cached;
}
function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}
const Context = createContext<{
  state: DemoState | null;
  update: (fn: (s: DemoState) => DemoState) => void;
  reset: () => void;
  error: string | null;
} | null>(null);
export function DemoProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(subscribe, snapshot, () => null);
  const update = useCallback((fn: (s: DemoState) => DemoState) => {
    cached = fn(snapshot());
    try {
      localStorage.setItem(KEY, JSON.stringify(cached));
      storageError = null;
    } catch {
      storageError =
        "Browser storage is unavailable. Changes are only retained in this tab.";
    }
    notify();
  }, []);
  const reset = useCallback(() => update(() => createSeed()), [update]);
  return (
    <Context.Provider value={{ state, update, reset, error: storageError }}>
      {children}
    </Context.Provider>
  );
}
export function useDemo() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error("DemoProvider is required");
  return ctx;
}
