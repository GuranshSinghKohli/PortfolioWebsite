"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";

import { RAIL_STORAGE_KEY as STORAGE_KEY } from "./prepaint";

/**
 * Rail collapse lives on <html data-rail>. The pre-paint script in the root
 * layout restores it from localStorage, CSS styles it, and this store lets
 * React read and change it.
 */
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return document.documentElement.dataset.rail === "collapsed";
}

function getServerSnapshot() {
  return false;
}

function apply(collapsed: boolean) {
  if (collapsed) document.documentElement.dataset.rail = "collapsed";
  else delete document.documentElement.dataset.rail;
  listeners.forEach((listener) => listener());
}

export function setRailCollapsed(collapsed: boolean) {
  apply(collapsed);
  try {
    localStorage.setItem(STORAGE_KEY, collapsed ? "collapsed" : "expanded");
  } catch {}
}

export function useRailCollapsed() {
  // Strict Mode's dev remount clears attributes on <html>; restore them.
  useLayoutEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "collapsed") apply(true);
    } catch {}
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
