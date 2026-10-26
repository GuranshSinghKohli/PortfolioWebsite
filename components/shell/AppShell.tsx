"use client";

import { Menu } from "lucide-react";
import { useState, type ReactNode } from "react";

import { profile } from "@/content/profile";
import { LogoMark } from "@/components/LogoMark";
import { BootOverlay, Intro } from "@/components/motion/Intro";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useRailCollapsed } from "@/lib/rail";
import { ModeProvider } from "./mode";
import { Rail } from "./Rail";

/**
 * App frame (PRD §7, §13): a 248px rail that collapses to 64px at 860px and
 * up, and a drawer over a scrim below 860px.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const collapsed = useRailCollapsed();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <MotionProvider>
      <ModeProvider>
        <div data-shell className="flex h-dvh">
          <aside
            data-rail-collapsible
            aria-label="Sidebar"
            className="hidden w-[248px] shrink-0 border-r border-line-soft bg-rail shell:block collapsed:w-16"
          >
            <Rail variant="rail" collapsed={collapsed} />
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
              <header className="flex h-14 shrink-0 items-center gap-1 border-b border-line-soft px-2 shell:hidden">
                {/* SheetTrigger, so Radix returns focus here when the drawer closes. */}
                <SheetTrigger
                  aria-label="Open menu"
                  className="flex size-11 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-text focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Menu className="size-5" strokeWidth={1.5} aria-hidden="true" />
                </SheetTrigger>
                <LogoMark className="text-text" />
                <span className="ml-1.5 text-[15px] font-medium text-text">{profile.name}</span>
              </header>
              <SheetContent
                side="left"
                showCloseButton={false}
                className="w-[min(85vw,300px)] gap-0 border-line-soft bg-rail p-0 shell:hidden"
              >
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <SheetDescription className="sr-only">Topics, roles, projects and links</SheetDescription>
                <Rail variant="drawer" onAsk={() => setDrawerOpen(false)} />
              </SheetContent>
            </Sheet>

            <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>
          </div>
        </div>
        <BootOverlay />
        <Intro />
      </ModeProvider>
    </MotionProvider>
  );
}
