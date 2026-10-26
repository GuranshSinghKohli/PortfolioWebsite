import type { Metadata } from "next";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";

import { LazyToaster } from "@/components/LazyToaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { shellScript } from "@/lib/prepaint";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Guransh Singh Kohli",
  description:
    "Portfolio of Guransh Singh Kohli, a University of Waterloo mathematics student building AI systems, backends, and data pipelines.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${bricolage.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <head>
        {/* Saved theme and rail state, applied before first paint. */}
        <script dangerouslySetInnerHTML={{ __html: shellScript }} />
      </head>
      <body className="h-full bg-bg text-text">
        <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
        <LazyToaster theme="dark" position="bottom-center" />
      </body>
    </html>
  );
}
