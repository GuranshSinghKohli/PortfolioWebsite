import { useEffect } from 'react';
import Typed from 'typed.js';

export default function Hero() {
  useEffect(() => {
    const typed = new Typed('#typed', {
      strings: ['software development', 'Data Science & AI', 'innovative solutions'],
      typeSpeed: 50,
      backSpeed: 30,
      backDelay: 1200,
      startDelay: 300,
      loop: true,
      showCursor: true,
    });
    return () => typed.destroy();
  }, []);

  return (
    <section className="hero">
      <div className="hero-bg"></div>
      <div className="hero-content section">
        <div className="hero-text">
          <h1>Building <span id="typed"></span></h1>
          <p>Bachelor in Maths Co-op, double major in Statistics and Applied Math in Scientific Machine Learning with Computing minor.</p>
          <div className="hero-actions">
            <a href="/Guransh_Resume.pdf" download="Guransh_Resume.pdf" className="btn btn-primary">Download Resume</a>
            <a href="https://github.com/GuranshSinghKohli" target="_blank" rel="noopener noreferrer" className="btn btn-outline">View GitHub</a>
          </div>
        </div>
        <div className="hero-visual">
          <img src="/images/hero-coding.png" alt="Developer at work" className="hero-img" />
        </div>
      </div>
    </section>
  );
}
