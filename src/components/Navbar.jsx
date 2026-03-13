import { useState } from 'react';

const links = [
  { href: '#about', label: 'About' },
  { href: '#experience', label: 'Experience' },
  { href: '#projects', label: 'Projects' },
  { href: '#contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="navbar">
      <a href="#" className="navbar-brand">Guransh Singh Kohli</a>
      <button className="nav-toggle" onClick={() => setOpen(!open)} aria-label="Menu">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <ul className={`nav-links ${open ? 'open' : ''}`}>
        {links.map(({ href, label }) => (
          <li key={href}>
            <a href={href} onClick={() => setOpen(false)}>{label}</a>
          </li>
        ))}
        <li>
          <a href="#contact" className="nav-cta" onClick={() => setOpen(false)}>Let's talk</a>
        </li>
      </ul>
    </nav>
  );
}
