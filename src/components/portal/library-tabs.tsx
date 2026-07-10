/**
 * Library tabs — Phase 1d nav collapse.
 *
 * The Library nav item points at /library/case-studies; the sibling list
 * pages (Structures, Articles) and Saved lost their own nav rows, so this
 * shared tab row is the way between them. Rendered near the top of all
 * four pages.
 *
 * Reuses the Settings `.set-tabs` / `.set-tab` pattern from portal.css —
 * same mono uppercase labels + bottom-rule active state — with plain <a>
 * links (server-component friendly; also used inside the client-side
 * SavedItems component).
 */

export type LibraryTab = "case-studies" | "structures" | "articles" | "saved";

const TABS: { key: LibraryTab; href: string; label: string }[] = [
  { key: "case-studies", href: "/library/case-studies", label: "Case Studies" },
  { key: "structures", href: "/library/structures", label: "Structures" },
  { key: "articles", href: "/library/articles", label: "Articles" },
  { key: "saved", href: "/saved", label: "Saved" },
];

export default function LibraryTabs({ active }: { active: LibraryTab }) {
  return (
    <nav className="set-tabs lib-tabs" aria-label="Library sections">
      {TABS.map((tab) => (
        <a
          key={tab.key}
          href={tab.href}
          className={`set-tab${active === tab.key ? " set-tab--active" : ""}`}
          aria-current={active === tab.key ? "page" : undefined}
        >
          {tab.label}
        </a>
      ))}
    </nav>
  );
}
