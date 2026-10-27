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
import { TopActions } from "./TopActions";

/**
 * App frame (PRD §7, §13): a 248px rail that collapses to 64px at 860px and
 * up, and a drawer over a scrim below 860px.
 */
/** First and last name, so the phone header fits beside the quick links. */
const shortName = `${profile.name.split(" ")[0]} ${profile.name.split(" ").at(-1)}`;

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

          <div className="relative flex min-w-0 flex-1 flex-col">
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
                <span className="ml-1.5 min-w-0 truncate text-[15px] font-medium text-text">{shortName}</span>
                <TopActions className="ml-auto shrink-0 pl-2" />
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
            <TopActions className="absolute top-4 right-6 z-30 hidden shell:flex" />
          </div>
        </div>
        <BootOverlay />
        <Intro />
      </ModeProvider>
    </MotionProvider>
  );
}
