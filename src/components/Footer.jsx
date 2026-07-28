export default function Footer() {
  return (
    <footer className="footer">
      <div className="section footer-inner">
        <p>Guransh Kohli · University of Waterloo</p>
        <p className="footer-muted">© {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
