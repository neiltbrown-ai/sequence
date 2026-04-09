import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="ft-logo">
          <Link href="/">SEQUENCE</Link>
        </div>
        <div className="ft-nav">
          <span className="ft-label">[NAVIGATE]</span>
          <div className="ft-links">
            <Link href="/about">About</Link>
            <Link href="/platform">Platform</Link>
            <Link href="/articles">Articles</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/coaching">Advisory</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/faq">FAQ</Link>
          </div>
        </div>
        <div className="ft-social">
          <span className="ft-label">[SOCIAL]</span>
          <div className="ft-links">
            <a href="#">Instagram</a>
            <a href="#">Linkedin</a>
          </div>
        </div>
        <div className="ft-contact">
          <span className="ft-label">[CONTACT]</span>
          <div className="ft-links">
            <Link href="/contact">Contact</Link>
          </div>
          <div className="ft-coord">35.0456&deg; N, 85.3097&deg; W</div>
        </div>
      </div>
      <div className="footer-bot">
        <span>&copy;2026. ALL RIGHTS RESERVED</span>
        <span><Link href="/legal" style={{ textDecoration: "none", color: "inherit" }}>PRIVACY POLICY</Link></span>
        <span>IN SEQUENCE</span>
      </div>
    </footer>
  );
}
