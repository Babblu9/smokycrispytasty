import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/store/auth';

// Logged in → saved_recipes table (syncs across devices). Logged out → localStorage.
const LS_KEY = '@cookora/saved';
const SavedCtx = createContext<{ saved: Set<string>; toggle: (id: string) => void }>({
  saved: new Set(),
  toggle: () => {},
});

function lsLoad(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    return new Set(JSON.parse(window.localStorage.getItem(LS_KEY) ?? '[]'));
  } catch {
    return new Set();
  }
}

export function SavedProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [saved, setSaved] = useState<Set<string>>(lsLoad);

  // Source of truth: DB when logged in, localStorage otherwise.
  useEffect(() => {
    let alive = true;
    if (user) {
      supabase.from('saved_recipes').select('recipe_id').eq('user_id', user.id).then(({ data }) => {
        if (alive && data) setSaved(new Set(data.map((r) => r.recipe_id as string)));
      });
    } else {
      setSaved(lsLoad());
    }
    return () => { alive = false; };
  }, [user]);

  // Persist to localStorage only when logged out.
  useEffect(() => {
    if (!user) {
      try { window.localStorage.setItem(LS_KEY, JSON.stringify([...saved])); } catch {/* quota */}
    }
  }, [saved, user]);

  const toggle = (id: string) => {
    const has = saved.has(id);
    setSaved((p) => { const n = new Set(p); has ? n.delete(id) : n.add(id); return n; });
    if (user) {
      if (has) supabase.from('saved_recipes').delete().eq('user_id', user.id).eq('recipe_id', id);
      else supabase.from('saved_recipes').insert({ user_id: user.id, recipe_id: id });
    }
  };

  return <SavedCtx.Provider value={{ saved, toggle }}>{children}</SavedCtx.Provider>;
}

export const useSaved = () => useContext(SavedCtx);
