"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface NavProps {
  activePage?: string;
}

export default function Nav({ activePage }: NavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [initials, setInitials] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

  const currentPage = activePage ?? pathname;

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setIsLoggedIn(true);
      const first = user.user_metadata?.first_name;
      const last = user.user_metadata?.last_name;
      if (first) {
        setInitials(((first[0] || "") + (last?.[0] || "")).toUpperCase());
        return;
      }
      supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle()
        .then(({ data }) => {
          if (data?.full_name) {
            setInitials(data.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2));
          }
        });
    });
  }, []);

  function handleEnter() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMenuOpen(true);
  }
  function handleLeave() {
    closeTimer.current = setTimeout(() => setMenuOpen(false), 150);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

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
          <Link href="/platform" className={currentPage === "/platform" ? "active" : ""}>
            PLATFORM
          </Link>
          <span className="s">/</span>
          <Link href="/articles" className={currentPage.startsWith("/articles") ? "active" : ""}>
            ARTICLES
          </Link>
          <span className="s">/</span>
          <Link href="/pricing" className={currentPage === "/pricing" ? "active" : ""}>
            PRICING
          </Link>
          <span className="s">/</span>
          <Link href="/contact" className={currentPage === "/contact" ? "active" : ""}>
            CONTACT
          </Link>
        </div>

        <div className="nav-right">
          {isLoggedIn ? (
            <div className="nav-avatar-wrap" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
              <button type="button" className="nav-avatar">
                {initials || "—"}
              </button>
              {menuOpen && (
                <div className="nav-avatar-menu">
                  <Link
                    href="/dashboard"
                    className="nav-avatar-menu-item"
                    onClick={() => setMenuOpen(false)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={14} height={14}>
                      <rect x="3" y="3" width="7" height="7" />
                      <rect x="14" y="3" width="7" height="7" />
                      <rect x="3" y="14" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" />
                    </svg>
                    Dashboard
                  </Link>
                  <Link
                    href="/settings"
                    className="nav-avatar-menu-item"
                    onClick={() => setMenuOpen(false)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={14} height={14}>
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    Settings
                  </Link>
                  <div className="nav-avatar-menu-divider" />
                  <button
                    type="button"
                    className="nav-avatar-menu-item"
                    onClick={handleLogout}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={14} height={14}>
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/signup" className="nav-signup">
                SIGN UP
              </Link>
              <Link href="/login" className="nav-login">
                LOGIN
              </Link>
            </>
          )}
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
        <Link href="/platform" className={currentPage === "/platform" ? "active" : ""} onClick={() => setIsOpen(false)}>
          Platform
        </Link>
        <Link href="/articles" className={currentPage.startsWith("/articles") ? "active" : ""} onClick={() => setIsOpen(false)}>
          Articles
        </Link>
        <Link href="/pricing" className={currentPage === "/pricing" ? "active" : ""} onClick={() => setIsOpen(false)}>
          Pricing
        </Link>
        <Link href="/contact" className={currentPage === "/contact" ? "active" : ""} onClick={() => setIsOpen(false)}>
          Contact
        </Link>
        {isLoggedIn ? (
          <>
            <Link href="/dashboard" onClick={() => setIsOpen(false)}>
              Dashboard
            </Link>
            <Link href="/settings" onClick={() => setIsOpen(false)}>
              Settings
            </Link>
            <button type="button" onClick={() => { setIsOpen(false); handleLogout(); }}>
              Log Out
            </button>
          </>
        ) : (
          <>
            <Link href="/signup" className={currentPage === "/signup" ? "active" : ""} onClick={() => setIsOpen(false)}>
              Sign Up
            </Link>
            <Link href="/login" className={currentPage === "/login" ? "active" : ""} onClick={() => setIsOpen(false)}>
              Login
            </Link>
          </>
        )}
      </div>
    </>
  );
}
