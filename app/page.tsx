import { Chips } from "@/components/home/Chips";
import { Composer } from "@/components/home/Composer";
import { Greeting } from "@/components/home/Greeting";
import { AppShell } from "@/components/shell/AppShell";
import { Hero } from "@/components/three/Hero";

export default function Home() {
  return (
    <AppShell>
      <div className="mx-auto flex min-h-full w-full max-w-[720px] flex-col items-center justify-center gap-8 px-4 py-12">
        <Hero />
        <div className="relative z-10 flex w-full flex-col items-center gap-8">
          <Greeting />
          <div className="flex w-full flex-col gap-4">
            <Composer />
            <Chips />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
