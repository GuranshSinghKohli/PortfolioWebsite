import { useState } from 'react';

const links = [
  { href: '#about', label: 'About' },
  { href: '#experience', label: 'Experience' },
  { href: '#projects', label: 'Projects' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="navbar">
      <a href="#" className="navbar-brand" onClick={() => setOpen(false)}>
        <span className="brand-dot" aria-hidden="true" />
        Guransh Singh Kohli
      </a>
      <button className="nav-toggle" aria-label="Menu" onClick={() => setOpen(!open)}>
        ☰
      </button>
      <div className={`nav-links${open ? ' open' : ''}`}>
        {links.map(({ href, label }) => (
          <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>
        ))}
        <a href="#contact" className="nav-cta" onClick={() => setOpen(false)}>Let's talk</a>
      </div>
    </nav>
  );
}
