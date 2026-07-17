import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Bookmark set shared across pages, persisted to localStorage so it survives refresh.
const KEY = '@cookora/saved';
const SavedCtx = createContext<{ saved: Set<string>; toggle: (id: string) => void }>({
  saved: new Set(),
  toggle: () => {},
});

function load(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    return new Set(JSON.parse(window.localStorage.getItem(KEY) ?? '[]'));
  } catch {
    return new Set();
  }
}

export function SavedProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<Set<string>>(load);

  useEffect(() => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify([...saved]));
    } catch {/* quota / private mode */}
  }, [saved]);

  const toggle = (id: string) =>
    setSaved((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  return <SavedCtx.Provider value={{ saved, toggle }}>{children}</SavedCtx.Provider>;
}

export const useSaved = () => useContext(SavedCtx);
