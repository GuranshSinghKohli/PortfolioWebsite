"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/** About / Work: the rail toggle and composer pills share one value (DECISIONS 6). */
export type Mode = "about" | "work";

const ModeContext = createContext<{ mode: Mode; setMode: (mode: Mode) => void } | null>(null);

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>("about");
  return <ModeContext value={{ mode, setMode }}>{children}</ModeContext>;
}

export function useMode() {
  const value = useContext(ModeContext);
  if (!value) throw new Error("useMode must be used inside ModeProvider");
  return value;
}

const options: { value: Mode; label: string }[] = [
  { value: "about", label: "About" },
  { value: "work", label: "Work" },
];

/** Segmented About / Work control. Each option is a full 44px target. */
export function ModeToggle({ className, size = "md" }: { className?: string; size?: "sm" | "md" }) {
  const { mode, setMode } = useMode();

  return (
    <div role="group" aria-label="Mode" className={cn("flex", className)}>
      {options.map((option) => {
        const active = option.value === mode;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => setMode(option.value)}
            className="group/mode flex h-11 flex-1 items-center justify-center outline-none"
          >
            <span
              className={cn(
                "rounded-full border transition-colors group-focus-visible/mode:ring-2 group-focus-visible/mode:ring-ring",
                size === "md" ? "w-full py-1.5 text-[13px]" : "px-3 py-1 text-[12px]",
                active
                  ? "border-line bg-surface text-text"
                  : "border-transparent text-muted-foreground group-hover/mode:text-text",
              )}
            >
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
