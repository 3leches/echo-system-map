import { useCallback, useEffect, useState } from "react";
import type { Message, Thread } from "./types";
import { SEED_THREADS } from "./seed";

const KEY = "pgmo.research.threads.v1";

function load(): Thread[] {
  if (typeof window === "undefined") return SEED_THREADS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return SEED_THREADS;
    const parsed = JSON.parse(raw) as Thread[];
    if (!Array.isArray(parsed) || parsed.length === 0) return SEED_THREADS;
    return parsed;
  } catch {
    return SEED_THREADS;
  }
}

function save(threads: Thread[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(threads));
  } catch {
    /* ignore quota */
  }
}

// Cross-component subscriber so all consumers stay in sync within one tab.
type Listener = (threads: Thread[]) => void;
const listeners = new Set<Listener>();
let cache: Thread[] | null = null;

function getAll(): Thread[] {
  if (cache === null) cache = load();
  return cache;
}
function setAll(next: Thread[]) {
  cache = next;
  save(next);
  listeners.forEach((l) => l(next));
}

export function useThreads() {
  const [threads, setThreads] = useState<Thread[]>(() => getAll());
  useEffect(() => {
    const l: Listener = (t) => setThreads(t);
    listeners.add(l);
    setThreads(getAll());
    return () => {
      listeners.delete(l);
    };
  }, []);

  const update = useCallback((id: string, fn: (t: Thread) => Thread) => {
    setAll(getAll().map((t) => (t.id === id ? fn(t) : t)));
  }, []);

  const create = useCallback((seed?: Partial<Thread>): Thread => {
    const id = seed?.id ?? `t_${Math.random().toString(36).slice(2, 9)}`;
    const thread: Thread = {
      id,
      title: seed?.title ?? "Untitled investigation",
      time: "now",
      tag: seed?.tag ?? "Draft",
      scope: seed?.scope ?? "—",
      messages: seed?.messages ?? [],
    };
    setAll([thread, ...getAll()]);
    return thread;
  }, []);

  const remove = useCallback((id: string) => {
    setAll(getAll().filter((t) => t.id !== id));
  }, []);

  const moveToTop = useCallback((id: string) => {
    const all = getAll();
    const idx = all.findIndex((t) => t.id === id);
    if (idx <= 0) return;
    const next = [...all];
    const [m] = next.splice(idx, 1);
    setAll([{ ...m, time: "now" }, ...next]);
  }, []);

  const appendMessage = useCallback((id: string, msg: Message) => {
    update(id, (t) => ({ ...t, messages: [...t.messages, msg] }));
  }, [update]);

  return { threads, update, create, remove, moveToTop, appendMessage };
}