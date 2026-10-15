import type { Metadata } from "next";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
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
      className={`${bricolage.variable} ${jetbrains.variable} dark h-full antialiased`}
    >
      <body className="min-h-full bg-bg text-text">{children}</body>
    </html>
  );
}
