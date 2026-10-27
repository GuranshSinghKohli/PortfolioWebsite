import { Chips } from "@/components/home/Chips";
import { Composer } from "@/components/home/Composer";
import { Greeting } from "@/components/home/Greeting";
import { AppShell } from "@/components/shell/AppShell";
import { MainView } from "@/components/shell/MainView";
import { Hero } from "@/components/three/Hero";

export default function Home() {
  return (
    <AppShell>
      <MainView>
        <div className="relative grid min-h-full">
          {/* The 3D scene renders in here once it loads (components/three/Constellation.tsx). */}
          <div
            id="home-backdrop"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
          />
          <div className="relative mx-auto flex w-full max-w-[720px] flex-col items-center justify-center gap-8 px-4 py-12">
            <Hero />
            {/* The veil: a soft pool of background behind the text, so the 3D scene never competes with it. */}
            <div className="relative z-10 flex w-full flex-col items-center gap-8 before:pointer-events-none before:absolute before:-inset-x-28 before:-inset-y-20 before:-z-10 before:bg-[radial-gradient(closest-side,var(--bg)_62%,transparent)] before:content-['']">
              <Greeting />
              <div className="flex w-full flex-col gap-4">
                <Composer />
                <Chips />
              </div>
            </div>
          </div>
        </div>
      </MainView>
    </AppShell>
  );
}
