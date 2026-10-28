import { Chips } from "@/components/home/Chips";
import { Composer } from "@/components/home/Composer";
import { Greeting } from "@/components/home/Greeting";
import { StarterQuestions } from "@/components/home/StarterQuestions";
import { AppShell } from "@/components/shell/AppShell";
import { MainView } from "@/components/shell/MainView";
import { Hero } from "@/components/three/Hero";
import { railNav } from "@/lib/nav";

export default function Home() {
  return (
    <AppShell nav={railNav()}>
      <MainView>
        <div className="relative grid min-h-full grid-cols-1">
          <div className="relative mx-auto flex w-full max-w-[720px] flex-col items-center justify-center gap-8 px-4 py-12">
            <Hero />
            {/* The veil: a soft pool of background behind the text, so the 3D scene never competes with it. */}
            <div className="relative z-10 flex w-full flex-col items-center gap-8 min-[600px]:gap-14 before:pointer-events-none before:absolute before:-inset-x-28 before:-inset-y-20 before:-z-10 before:bg-[radial-gradient(closest-side,var(--bg)_62%,transparent)] before:content-['']">
              <Greeting />
              <div className="flex w-full flex-col gap-4">
                <Composer />
                <Chips />
                <StarterQuestions />
              </div>
            </div>
          </div>
        </div>
      </MainView>
    </AppShell>
  );
}
