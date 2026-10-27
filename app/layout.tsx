import type { Metadata } from "next";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";

import { profile } from "@/content/profile";
import { Analytics } from "@/components/Analytics";
import { TooltipProvider } from "@/components/ui/tooltip";
import { shellScript } from "@/lib/prepaint";
import { siteUrl } from "@/lib/site";
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

const description = `${profile.subLines[0]} ${profile.subLines[1]} Ask this portfolio anything about my work.`;

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: { default: profile.name, template: `%s · ${profile.name}` },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: profile.name,
    title: profile.name,
    description,
    locale: "en_CA",
  },
  twitter: { card: "summary_large_image", title: profile.name, description },
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
        <Analytics />
      </body>
    </html>
  );
}
