import { useState } from 'react';

const GOOGLE_SCRIPT = 'https://script.google.com/macros/s/AKfycbyIEi4Z79O4kTKmdJp9aPTgZEjUKbZeXRANmdbYdXCF88jN28P2jB_6-jHk0-H6mwoCYA/exec';

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const form = e.target;
    const data = {
      name: form.name.value,
      email: form.email.value,
      message: form.message.value,
    };
    try {
      const res = await fetch(GOOGLE_SCRIPT, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (json.result === 'success') setSent(true);
      else throw new Error('Failed');
    } catch {
      alert('Failed to send. Please try again.');
    }
    setLoading(false);
  }

  if (sent) {
    return (
      <section id="contact" className="contact">
        <div className="section contact-inner">
          <div className="success-box">
            <span className="success-icon">✓</span>
            <h3>Message successfully sent, thank you</h3>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="contact">
      <div className="section contact-inner">
        <span className="section-label">Get in touch</span>
        <h2>Contact</h2>
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <input type="text" name="name" placeholder="Your name" required />
            <input type="email" name="email" placeholder="Your email" required />
          </div>
          <textarea name="message" placeholder="Your message" rows="5" required></textarea>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Sending...' : 'Send message'}
          </button>
        </form>
        <div className="contact-social">
          <a href="https://github.com/GuranshSinghKohli" target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href="https://www.linkedin.com/in/guransh-singh-kohli-759a86226" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          <a href="mailto:skohliguransh@gmail.com">Email</a>
        </div>
      </div>
    </section>
  );
}
