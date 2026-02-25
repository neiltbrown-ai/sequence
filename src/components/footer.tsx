import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="ft-logo">
          <Link href="/">SEQUENCE</Link>
        </div>
        <div className="ft-social">
          <span className="ft-label">[SOCIAL]</span>
          <div className="ft-links">
            <a href="#">Instagram</a>
            <a href="#">X</a>
            <a href="#">Linkedin</a>
          </div>
        </div>
        <div className="ft-contact">
          <span className="ft-label">[CONTACT]</span>
          <div className="ft-links">
            <a href="mailto:insequence@gmail.com">insequence@gmail.com</a>
          </div>
          <div className="ft-coord">35.0456&deg; N, 85.3097&deg; W</div>
        </div>
      </div>
      <div className="footer-bot">
        <span>&copy;2026. ALL RIGHTS RESERVED</span>
        <span>IN SEQUENCE</span>
      </div>
    </footer>
  );
}
