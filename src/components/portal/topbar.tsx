"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePortalShell } from "./portal-shell-context";
import { SearchIcon } from "./icons";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/components/theme-provider";

interface SearchResult {
  title: string;
  slug: string;
  excerpt: string;
  type: "structure" | "case-study" | "article";
}

interface SearchResults {
  structures: SearchResult[];
  caseStudies: SearchResult[];
  articles: SearchResult[];
}

const ROUTE_MAP: Record<SearchResult["type"], string> = {
  structure: "/library/structures",
  "case-study": "/library/case-studies",
  article: "/library/articles",
};

interface PortalTopbarProps {
  newCount?: number;
}

export default function PortalTopbar({ newCount = 0 }: PortalTopbarProps) {
  const { openSidebar } = usePortalShell();
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [initials, setInitials] = useState("");
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Search state ── */
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchResults = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSearchResults(null);
      setSearchOpen(false);
      return;
    }
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) return;
      const data: SearchResults = await res.json();
      setSearchResults(data);
      setSearchOpen(true);
    } catch {
      /* silently ignore network errors */
    }
  }, []);

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setSearchQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim()) {
      setSearchResults(null);
      setSearchOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => fetchResults(val.trim()), 250);
  }

  function handleSearchKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setSearchOpen(false);
      (e.target as HTMLInputElement).blur();
    }
  }

  function handleSearchBlur() {
    blurTimerRef.current = setTimeout(() => setSearchOpen(false), 200);
  }

  function handleSearchFocus() {
    if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
    if (searchResults && searchQuery.length >= 2) setSearchOpen(true);
  }

  function handleResultClick() {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults(null);
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const first = user.user_metadata?.first_name;
      const last = user.user_metadata?.last_name;
      if (first) {
        setInitials(((first[0] || "") + (last?.[0] || "")).toUpperCase());
        return;
      }
      supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data?.full_name) {
            setInitials(
              data.full_name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)
            );
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
    <header className="topbar">
      <div className="mobile-topbar">
        <button className="mobile-hamburger" onClick={openSidebar}>
          <span /><span /><span />
        </button>
      </div>

      <div className="tb-search">
        <SearchIcon />
        <input
          type="text"
          className="tb-search-input"
          placeholder="Search structures, cases, guides…"
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={handleSearchKeyDown}
          onBlur={handleSearchBlur}
          onFocus={handleSearchFocus}
        />
        {searchOpen && searchResults && (
          <div className="tb-search-results">
            {searchResults.structures.length === 0 &&
             searchResults.caseStudies.length === 0 &&
             searchResults.articles.length === 0 ? (
              <div className="tb-sr-empty">No results for &ldquo;{searchQuery}&rdquo;</div>
            ) : (
              <>
                {searchResults.structures.length > 0 && (
                  <div className="tb-sr-group">
                    <div className="tb-sr-label">Structures</div>
                    {searchResults.structures.map((r) => (
                      <Link
                        key={r.slug}
                        href={`${ROUTE_MAP[r.type]}/${r.slug}`}
                        className="tb-sr-item"
                        onClick={handleResultClick}
                      >
                        <span className="tb-sr-title">{r.title}</span>
                        <span className="tb-sr-excerpt">{r.excerpt}</span>
                      </Link>
                    ))}
                  </div>
                )}
                {searchResults.caseStudies.length > 0 && (
                  <div className="tb-sr-group">
                    <div className="tb-sr-label">Case Studies</div>
                    {searchResults.caseStudies.map((r) => (
                      <Link
                        key={r.slug}
                        href={`${ROUTE_MAP[r.type]}/${r.slug}`}
                        className="tb-sr-item"
                        onClick={handleResultClick}
                      >
                        <span className="tb-sr-title">{r.title}</span>
                        <span className="tb-sr-excerpt">{r.excerpt}</span>
                      </Link>
                    ))}
                  </div>
                )}
                {searchResults.articles.length > 0 && (
                  <div className="tb-sr-group">
                    <div className="tb-sr-label">Articles</div>
                    {searchResults.articles.map((r) => (
                      <Link
                        key={r.slug}
                        href={`${ROUTE_MAP[r.type]}/${r.slug}`}
                        className="tb-sr-item"
                        onClick={handleResultClick}
                      >
                        <span className="tb-sr-title">{r.title}</span>
                        <span className="tb-sr-excerpt">{r.excerpt}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="tb-right">
        {newCount > 0 && (
          <Link href="/dashboard" className="tb-new-badge">
            <span className="tb-new-dot" />
            {newCount} New this week
          </Link>
        )}
        <div className="tb-avatar-wrap" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
          <button
            type="button"
            className="tb-avatar"
          >
            {initials}
          </button>
          {menuOpen && (
            <div className="tb-menu">
              <Link
                href="/settings"
                className="tb-menu-item"
                onClick={() => setMenuOpen(false)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={14} height={14}>
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                Settings
              </Link>
              <button
                type="button"
                className="tb-menu-item"
                onClick={() => {
                  setTheme(theme === "dark" ? "light" : "dark");
                  setMenuOpen(false);
                }}
              >
                {theme === "dark" ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={14} height={14}>
                    <circle cx="12" cy="12" r="5" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} width={14} height={14}>
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                  </svg>
                )}
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </button>
              <div className="tb-menu-divider" />
              <button
                type="button"
                className="tb-menu-item"
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
      </div>
    </header>
  );
}
