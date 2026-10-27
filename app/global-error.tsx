"use client";

import "./globals.css";

/**
 * When the root layout itself fails. It replaces the whole document, so it
 * brings its own html and body. Kept bare: Next loads it on every page.
 */
export default function GlobalError({ retry }: { retry: () => void }) {
  const action = "inline-flex h-11 cursor-pointer items-center rounded-full px-5 text-[14px] outline-none focus-visible:ring-2 focus-visible:ring-ring";
  return (
    <html lang="en" data-theme="dark">
      <body className="flex min-h-dvh items-center justify-center bg-bg px-4 font-sans text-text antialiased">
        <title>Something broke · Guransh Singh Kohli</title>
        <main className="flex w-full max-w-[560px] flex-col items-start gap-5">
          <p className="font-mono text-[11px] tracking-[0.08em] text-muted-foreground uppercase">Error</p>
          <h1 className="text-[2.5rem] leading-[1.05] font-medium tracking-[-0.02em] text-text">That broke on my side.</h1>
          <p className="text-[16px] leading-[1.6] text-body">The site couldn&apos;t load. Try again, or start over in a moment.</p>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => retry()} className={`${action} bg-accent text-accent-foreground`}>
              Try again
            </button>
            {/* A full load: the app's own state is what broke. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" className={`${action} border border-line text-body`}>
              Start over
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
