"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";

type ShellState = {
  /** Sidebar hidden on wide screens (the button left of the business name). */
  collapsed: boolean;
  toggleCollapsed: () => void;
  /** Sidebar opened as a panel on small screens. */
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
};

const Ctx = createContext<ShellState | null>(null);
const STORAGE_KEY = "tieout.seitenleiste";

function readCollapsed(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "zu";
  } catch {
    return false;
  }
}

export function ShellProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // The stored choice is read after the first render, so the static HTML always shows the sidebar.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of a browser-only value
    if (readCollapsed()) setCollapsed(true);
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((was) => {
      try {
        window.localStorage.setItem(STORAGE_KEY, was ? "auf" : "zu");
      } catch {
        // storage blocked: the choice simply is not remembered
      }
      return !was;
    });
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setMobileOpen(false);
        setSearchOpen((open) => !open);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const value = useMemo(
    () => ({ collapsed, toggleCollapsed, mobileOpen, setMobileOpen, searchOpen, setSearchOpen }),
    [collapsed, toggleCollapsed, mobileOpen, searchOpen],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useShell(): ShellState {
  const value = useContext(Ctx);
  if (!value) throw new Error("useShell outside ShellProvider");
  return value;
}

const noSubscribe = () => () => {};

/** "⌘" on a Mac, "Strg" everywhere else; the static HTML says "Strg". */
export function useModifierLabel(): string {
  return useSyncExternalStore(
    noSubscribe,
    () => (/Mac|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Strg"),
    () => "Strg",
  );
}
