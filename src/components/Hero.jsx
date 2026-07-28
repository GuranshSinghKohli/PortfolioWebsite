import { useEffect } from 'react';
import Typed from 'typed.js';

export default function Hero() {
  useEffect(() => {
    const typed = new Typed('#typed', {
      strings: ['AI systems', 'backend services', 'multi-agent platforms', 'intelligent products'],
      typeSpeed: 48,
      backSpeed: 28,
      backDelay: 1400,
      startDelay: 400,
      loop: true,
      showCursor: true,
    });
    return () => typed.destroy();
  }, []);

  return (
    <section className="hero">
      <div className="hero-bg" aria-hidden="true"></div>
      <div className="section hero-content">
        <p className="hero-brand">Guransh <em>Kohli</em></p>
        <h1>Building <span id="typed"></span></h1>
        <p className="hero-lead">
          Bachelor of Mathematics (Co-op) at the University of Waterloo. Double major in Applied Math
          in Machine Learning and Statistics, with a Computing minor.
        </p>
        <div className="hero-actions">
          <a href="/Guransh_Resume.pdf" download="Guransh_Resume.pdf" className="btn btn-primary">
            Download Resume
          </a>
          <a href="#projects" className="btn btn-outline">View projects</a>
        </div>
        <div className="hero-meta">
          <span><i></i> AI Engineer @ Windscribe</span>
          <span><i></i> Founding Engineer @ Wanderers.ai</span>
          <span><i></i> Waterloo · Expected 2030</span>
        </div>
      </div>
    </section>
  );
}
