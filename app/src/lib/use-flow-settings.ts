"use client";

import { useEffect, useState } from "react";

import { appendSetting, localTime, onStorageChange, readSettings, type Setting } from "./decisions";

/** The settings of the Abläufe blocks in this browser; empty in the static page and before the first read. */
export function useFlowSettings(): Setting[] {
  const [list, setList] = useState<Setting[]>([]);
  useEffect(() => {
    const load = () => setList(readSettings());
    load();
    return onStorageChange(load);
  }, []);
  return list;
}

export function saveSetting(block: string, feld: Setting["feld"], wert: string): void {
  appendSetting({ block, feld, wert, zeit: localTime() });
}
