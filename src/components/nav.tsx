"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavProps {
  activePage?: string;
}

export default function Nav({ activePage }: NavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const currentPage = activePage ?? pathname;

  return (
    <>
      <nav className="nav">
        <Link href="/" className="nav-logo">
          SEQUENCE
        </Link>

        <div className="nav-mid">
          <Link href="/" className={currentPage === "/" ? "active" : ""}>
            HOME
          </Link>
          <span className="s">/</span>
          <Link href="/about" className={currentPage === "/about" ? "active" : ""}>
            ABOUT
          </Link>
          <span className="s">/</span>
          <Link href="/resources" className={currentPage === "/resources" ? "active" : ""}>
            RESOURCES
          </Link>
          <span className="s">/</span>
          <Link href="/articles" className={currentPage.startsWith("/articles") ? "active" : ""}>
            ARTICLES
          </Link>
          <span className="s">/</span>
          <Link href="/contact" className={currentPage === "/contact" ? "active" : ""}>
            CONTACT
          </Link>
        </div>

        <div className="nav-right">
          <Link href="/signup" className="nav-signup">
            SIGN UP
          </Link>
          <Link href="/login" className="nav-login">
            LOGIN
          </Link>
          <button
            className={`nav-hamburger${isOpen ? " open" : ""}`}
            aria-label="Menu"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      <div className={`nav-mobile-menu${isOpen ? " open" : ""}`}>
        <Link href="/" className={currentPage === "/" ? "active" : ""} onClick={() => setIsOpen(false)}>
          Home
        </Link>
        <Link href="/about" className={currentPage === "/about" ? "active" : ""} onClick={() => setIsOpen(false)}>
          About
        </Link>
        <Link href="/resources" className={currentPage === "/resources" ? "active" : ""} onClick={() => setIsOpen(false)}>
          Resources
        </Link>
        <Link href="/articles" className={currentPage.startsWith("/articles") ? "active" : ""} onClick={() => setIsOpen(false)}>
          Articles
        </Link>
        <Link href="/contact" className={currentPage === "/contact" ? "active" : ""} onClick={() => setIsOpen(false)}>
          Contact
        </Link>
        <Link href="/signup" className={currentPage === "/signup" ? "active" : ""} onClick={() => setIsOpen(false)}>
          Sign Up
        </Link>
        <Link href="/login" className={currentPage === "/login" ? "active" : ""} onClick={() => setIsOpen(false)}>
          Login
        </Link>
      </div>
    </>
  );
}
