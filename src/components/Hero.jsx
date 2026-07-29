import { useEffect, useRef, useState } from 'react';
import { handleTilt, resetTilt } from '../hooks/useTilt';

const STRINGS = ['software development', 'Data Science & AI', 'innovative solutions'];

export default function Hero() {
  const [typedText, setTypedText] = useState('');
  const blob1Ref = useRef(null);
  const blob2Ref = useRef(null);

  useEffect(() => {
    let i = 0;
    let s = 0;
    let deleting = false;
    let pause = 0;
    let timer;

    const tick = () => {
      const str = STRINGS[s];
      if (!deleting) {
        i += 1;
        setTypedText(str.slice(0, i));
        if (i === str.length) {
          deleting = true;
          pause = 40;
        }
      } else if (pause > 0) {
        pause -= 1;
      } else {
        i -= 1;
        setTypedText(str.slice(0, i));
        if (i === 0) {
          deleting = false;
          s = (s + 1) % STRINGS.length;
        }
      }
      timer = setTimeout(tick, deleting ? (pause > 0 ? 30 : 40) : 55);
    };

    tick();
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      if (blob1Ref.current) blob1Ref.current.style.transform = `translate(${x * 50}px, ${y * 50}px)`;
      if (blob2Ref.current) blob2Ref.current.style.transform = `translate(${x * -40}px, ${y * -40}px)`;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <section className="hero">
      <div className="hero-bg" aria-hidden="true" />
      <div ref={blob1Ref} className="hero-blob hero-blob-1" aria-hidden="true" />
      <div ref={blob2Ref} className="hero-blob hero-blob-2" aria-hidden="true" />

      <div className="section hero-content">
        <div className="hero-text reveal-init">
          <div className="hero-pill">
            <span className="pill-dot" aria-hidden="true" />
            Open to Winter 2026 software &amp; data co-op
          </div>
          <h1>
            Building <span className="hero-typed">{typedText}</span>
            <span className="hero-cursor">|</span>
          </h1>
          <p className="hero-lead">
            Bachelor of Mathematics Co-op, double major in Statistics and Applied Math in Scientific
            Machine Learning, Computing minor, at the University of Waterloo.
          </p>
          <div className="hero-actions">
            <a href="/Guransh_Resume.pdf" download="Guransh_Resume.pdf" className="btn btn-primary">
              Download Resume
            </a>
            <a
              href="https://github.com/GuranshSinghKohli"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              View GitHub ↗
            </a>
          </div>
          <div className="hero-stats">
            <div className="stat-card" onMouseMove={handleTilt} onMouseLeave={resetTilt}>
              <strong>1,500+</strong>
              <span>users on shipped features</span>
            </div>
            <div className="stat-card" onMouseMove={handleTilt} onMouseLeave={resetTilt}>
              <strong>-17%</strong>
              <span>manual workload via LLM automation</span>
            </div>
          </div>
        </div>
        <div className="hero-visual reveal-init">
          <img
            src="/images/hero-photo.webp"
            alt="Guransh Kohli"
            className="hero-photo"
          />
        </div>
      </div>
    </section>
  );
}
