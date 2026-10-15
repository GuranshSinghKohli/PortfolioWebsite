import { nodes } from "@/content/graph";
import { LogoMark } from "./LogoMark";

const links = [
  { href: "/#graph", label: "Graph" },
  { href: "/resume", label: "Résumé" },
  { href: "/#ask", label: "Contact" },
];

export function Header() {
  const owner = nodes.find((node) => node.id === "me");

  return (
    <header className="flex items-center justify-between gap-4 border-b border-line-soft px-8">
      <a href="/" className="inline-flex min-h-11 items-center gap-3 text-text">
        <LogoMark />
        <span className="font-mono text-[12px] tracking-[0.08em] uppercase">
          {owner?.label ?? "[Your name]"}
        </span>
      </a>
      <nav aria-label="Primary" className="flex items-center gap-2">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="inline-flex min-h-11 items-center px-2 font-mono text-[12px] tracking-[0.08em] text-muted uppercase hover:text-text"
          >
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
