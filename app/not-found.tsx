import type { Metadata } from "next";

import { StatusPage, statusAction } from "@/components/StatusPage";

export const metadata: Metadata = { title: "Not found" };

export default function NotFound() {
  return (
    <StatusPage
      label="404"
      title="Nothing lives at this address."
      actions={
        // A plain link: a 404 is a fresh page load anyway, and next/link would add to every page's first load.
        // eslint-disable-next-line @next/next/no-html-link-for-pages
        <a href="/" className={statusAction(true)}>
          Back to the start
        </a>
      }
    >
      <p>This whole site is one page: you ask, it answers. Head back and ask me about something I&apos;ve built.</p>
    </StatusPage>
  );
}
