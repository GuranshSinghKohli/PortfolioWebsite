import { AskPanel } from "@/components/ask/AskPanel";
import { GraphRoot } from "@/components/graph/GraphRoot";
import { Header } from "@/components/Header";
import { edges, nodes } from "@/content/graph";

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex flex-col min-[900px]:flex-row">
        <section
          id="graph"
          className="flex min-w-0 flex-[999_1_560px] flex-col gap-6 p-8"
        >
          <h1 className="max-w-[14ch] text-[36px] leading-[1.1] font-medium tracking-[-0.02em] text-text">
            Everything I&apos;ve done, connected.
          </h1>
          <p
            className="font-mono text-[12px] tracking-[0.08em] text-muted uppercase"
            aria-live="polite"
          >
            {nodes.length} nodes · {edges.length} links
          </p>
          <GraphRoot />
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
            <p className="text-[13px] text-muted">
              Tap a node to ask about it. Hover one to see which sentences it backs up.
            </p>
            <p className="inline-flex items-center gap-2 font-mono text-[12px] tracking-[0.08em] text-muted uppercase">
              <span className="size-2 rounded-full bg-accent" aria-hidden="true" />
              in this answer
            </p>
          </div>
        </section>
        <AskPanel />
      </main>
    </>
  );
}
