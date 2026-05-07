"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  INDUSTRIES,
  INDUSTRY_GROUPS,
  DISCIPLINES,
  isIndustrySlug,
  isDisciplineSlug,
  getIndustryLabel,
  getDisciplineLabel,
  type IndustrySlug,
  type DisciplineSlug,
} from "@/lib/case-studies/taxonomy";
import type { CaseStudyMeta } from "@/lib/content";

const stripBr = (s: string) => s.replace(/<br\s*\/?>/gi, " ");

type SelectionState = {
  industries: Set<IndustrySlug>;
  disciplines: Set<DisciplineSlug>;
};

function parseUrlState(params: URLSearchParams): SelectionState {
  const industries = new Set<IndustrySlug>();
  const disciplines = new Set<DisciplineSlug>();
  const ind = params.get("industries");
  const dis = params.get("disciplines");
  if (ind) {
    for (const slug of ind.split(",").map((s) => s.trim()).filter(Boolean)) {
      if (isIndustrySlug(slug)) industries.add(slug);
    }
  }
  if (dis) {
    for (const slug of dis.split(",").map((s) => s.trim()).filter(Boolean)) {
      if (isDisciplineSlug(slug)) disciplines.add(slug);
    }
  }
  return { industries, disciplines };
}

function studyMatches(
  s: CaseStudyMeta,
  selection: SelectionState
): boolean {
  if (selection.industries.size > 0) {
    const hit = s.industries.some((slug) => selection.industries.has(slug));
    if (!hit) return false;
  }
  if (selection.disciplines.size > 0) {
    const hit = s.disciplines.some((slug) => selection.disciplines.has(slug));
    if (!hit) return false;
  }
  return true;
}

interface Props {
  studies: CaseStudyMeta[];
}

export default function CaseStudiesFiltersSidebar({ studies }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const selection: SelectionState = useMemo(
    () => parseUrlState(new URLSearchParams(searchParams.toString())),
    [searchParams]
  );

  const totalCount = studies.length;

  const filtered = useMemo(
    () => studies.filter((s) => studyMatches(s, selection)),
    [studies, selection]
  );

  // Counts shown next to each facet option update dynamically: each option
  // count reflects the matching studies if THIS facet's selection were just
  // {option}, while OTHER facets stay constrained. That gives the user a
  // useful preview of what each toggle would do without faking that other
  // filters disappear.
  const industryCounts = useMemo(() => {
    const result = new Map<IndustrySlug, number>();
    for (const ind of INDUSTRIES) {
      const probe: SelectionState = {
        industries: new Set([ind.slug]),
        disciplines: selection.disciplines,
      };
      result.set(
        ind.slug,
        studies.filter((s) => studyMatches(s, probe)).length
      );
    }
    return result;
  }, [studies, selection.disciplines]);

  const disciplineCounts = useMemo(() => {
    const result = new Map<DisciplineSlug, number>();
    for (const d of DISCIPLINES) {
      const probe: SelectionState = {
        industries: selection.industries,
        disciplines: new Set([d.slug]),
      };
      result.set(d.slug, studies.filter((s) => studyMatches(s, probe)).length);
    }
    return result;
  }, [studies, selection.industries]);

  const writeUrl = useCallback(
    (next: SelectionState) => {
      const params = new URLSearchParams();
      if (next.industries.size > 0) {
        params.set(
          "industries",
          INDUSTRIES.filter((i) => next.industries.has(i.slug))
            .map((i) => i.slug)
            .join(",")
        );
      }
      if (next.disciplines.size > 0) {
        params.set(
          "disciplines",
          DISCIPLINES.filter((d) => next.disciplines.has(d.slug))
            .map((d) => d.slug)
            .join(",")
        );
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname]
  );

  const toggleIndustry = (slug: IndustrySlug) => {
    const next = {
      industries: new Set(selection.industries),
      disciplines: new Set(selection.disciplines),
    };
    if (next.industries.has(slug)) next.industries.delete(slug);
    else next.industries.add(slug);
    writeUrl(next);
  };

  const toggleDiscipline = (slug: DisciplineSlug) => {
    const next = {
      industries: new Set(selection.industries),
      disciplines: new Set(selection.disciplines),
    };
    if (next.disciplines.has(slug)) next.disciplines.delete(slug);
    else next.disciplines.add(slug);
    writeUrl(next);
  };

  const clearAll = () => {
    writeUrl({ industries: new Set(), disciplines: new Set() });
  };

  const anyActive =
    selection.industries.size > 0 || selection.disciplines.size > 0;

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  // Featured layout preserved (matches the prior tab-bar behavior):
  // when the filtered set has ≥1 entries, first is the hero, next two
  // are the medium cards, the rest fall through into the grid.
  const featuredMain = filtered[0];
  const featuredSub = filtered.slice(1, 3);
  const rest = filtered.slice(3);

  const grouped = INDUSTRY_GROUPS.map((g) => ({
    group: g,
    industries: INDUSTRIES.filter((i) => i.group === g.slug),
  }));

  const renderFacets = (
    <>
      <div className="csf-facet">
        <div className="csf-facet-head">
          <span className="csf-facet-title">Industries</span>
          {selection.industries.size > 0 && (
            <span className="csf-facet-count-active">
              {selection.industries.size}
            </span>
          )}
        </div>
        <div className="csf-facet-body">
          {grouped.map(({ group, industries }) => (
            <div key={group.slug} className="csf-facet-group">
              <div className="csf-facet-group-label">{group.label}</div>
              <ul className="csf-facet-list">
                {industries.map((ind) => {
                  const count = industryCounts.get(ind.slug) ?? 0;
                  const checked = selection.industries.has(ind.slug);
                  const disabled = count === 0 && !checked;
                  return (
                    <li key={ind.slug}>
                      <label
                        className={`csf-facet-opt${
                          disabled ? " csf-facet-opt--disabled" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={disabled}
                          onChange={() => toggleIndustry(ind.slug)}
                        />
                        <span className="csf-facet-opt-label">
                          {ind.label}
                        </span>
                        <span className="csf-facet-opt-count">{count}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="csf-facet">
        <div className="csf-facet-head">
          <span className="csf-facet-title">Disciplines</span>
          {selection.disciplines.size > 0 && (
            <span className="csf-facet-count-active">
              {selection.disciplines.size}
            </span>
          )}
        </div>
        <div className="csf-facet-body">
          <ul className="csf-facet-list">
            {DISCIPLINES.map((d) => {
              const count = disciplineCounts.get(d.slug) ?? 0;
              const checked = selection.disciplines.has(d.slug);
              const disabled = count === 0 && !checked;
              return (
                <li key={d.slug}>
                  <label
                    className={`csf-facet-opt${
                      disabled ? " csf-facet-opt--disabled" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggleDiscipline(d.slug)}
                    />
                    <span className="csf-facet-opt-label">{d.label}</span>
                    <span className="csf-facet-opt-count">{count}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );

  return (
    <div className="csf-shell">
      {/* Mobile filter button + result-count summary */}
      <div className="csf-mobile-bar">
        <button
          type="button"
          className="csf-mobile-btn"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open filters"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="7" y1="12" x2="17" y2="12" />
            <line x1="10" y1="18" x2="14" y2="18" />
          </svg>
          Filters
          {anyActive && (
            <span className="csf-mobile-btn-pill">
              {selection.industries.size + selection.disciplines.size}
            </span>
          )}
        </button>
        <span className="csf-mobile-count">
          {filtered.length} of {totalCount}
        </span>
      </div>

      {/* Desktop sidebar */}
      <aside className="csf-sidebar" aria-label="Filter case studies">
        <div className="csf-sidebar-head">
          <div className="csf-sidebar-title">Filter</div>
          {anyActive && (
            <button
              type="button"
              className="csf-clear"
              onClick={clearAll}
            >
              Clear all
            </button>
          )}
        </div>
        <div className="csf-sidebar-summary">
          {filtered.length} of {totalCount} case {totalCount === 1 ? "study" : "studies"}
        </div>
        {renderFacets}
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div
          className="csf-drawer-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Filter case studies"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="csf-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="csf-drawer-head">
              <div className="csf-sidebar-title">Filter</div>
              <button
                type="button"
                className="csf-drawer-close"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close filters"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              </button>
            </div>
            <div className="csf-drawer-body">{renderFacets}</div>
            <div className="csf-drawer-foot">
              {anyActive && (
                <button
                  type="button"
                  className="csf-clear"
                  onClick={clearAll}
                >
                  Clear all
                </button>
              )}
              <button
                type="button"
                className="csf-drawer-apply"
                onClick={() => setDrawerOpen(false)}
              >
                View {filtered.length} {filtered.length === 1 ? "result" : "results"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="csf-results">
        {anyActive && (
          <div className="csf-chips">
            {INDUSTRIES.filter((i) => selection.industries.has(i.slug)).map(
              (i) => (
                <button
                  key={`ind-${i.slug}`}
                  type="button"
                  className="csf-chip"
                  onClick={() => toggleIndustry(i.slug)}
                  aria-label={`Remove filter ${i.label}`}
                >
                  <span className="csf-chip-axis">Industry</span>
                  <span className="csf-chip-label">{getIndustryLabel(i.slug)}</span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <line x1="6" y1="6" x2="18" y2="18" />
                    <line x1="18" y1="6" x2="6" y2="18" />
                  </svg>
                </button>
              )
            )}
            {DISCIPLINES.filter((d) => selection.disciplines.has(d.slug)).map(
              (d) => (
                <button
                  key={`dis-${d.slug}`}
                  type="button"
                  className="csf-chip"
                  onClick={() => toggleDiscipline(d.slug)}
                  aria-label={`Remove filter ${d.label}`}
                >
                  <span className="csf-chip-axis">Discipline</span>
                  <span className="csf-chip-label">{getDisciplineLabel(d.slug)}</span>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <line x1="6" y1="6" x2="18" y2="18" />
                    <line x1="18" y1="6" x2="6" y2="18" />
                  </svg>
                </button>
              )
            )}
            <button
              type="button"
              className="csf-chip-clear"
              onClick={clearAll}
            >
              Clear all
            </button>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="csf-empty">
            <div className="csf-empty-title">No case studies match these filters.</div>
            <button type="button" className="csf-empty-btn" onClick={clearAll}>
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            {featuredMain && (
              <Link
                href={`/library/case-studies/${featuredMain.slug}`}
                className="cs-featured rv vis rv-d2"
              >
                {featuredMain.coverImage && (
                  <img
                    className="cs-featured-img"
                    src={featuredMain.coverImage}
                    alt={stripBr(featuredMain.title)}
                  />
                )}
                {!featuredMain.coverImage && (
                  <div
                    className="cs-featured-img"
                    style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #555 100%)" }}
                  />
                )}
                <div className="cs-featured-overlay" />
                <div className="cs-featured-content">
                  <div className="cs-featured-label">{featuredMain.discipline}</div>
                  <div className="cs-featured-name">{stripBr(featuredMain.title)}</div>
                  <div className="cs-featured-desc">{featuredMain.excerpt}</div>
                  <div className="cs-featured-tags">
                    {featuredMain.tags?.slice(0, 3).map((tag) => (
                      <span key={tag} className="cs-featured-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            )}

            {featuredSub.length > 0 && (
              <div className="cs-featured-sub-grid">
                {featuredSub.map((s, i) => (
                  <Link
                    key={s.slug}
                    href={`/library/case-studies/${s.slug}`}
                    className={`cs-featured-sub rv vis rv-d${i + 3}`}
                  >
                    {s.coverImage && (
                      <img
                        className="cs-featured-sub-img"
                        src={s.coverImage}
                        alt={stripBr(s.title)}
                      />
                    )}
                    {!s.coverImage && (
                      <div
                        className="cs-featured-sub-img"
                        style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #555 100%)" }}
                      />
                    )}
                    <div className="cs-featured-sub-overlay" />
                    <div className="cs-featured-sub-content">
                      <div className="cs-featured-sub-label">{s.discipline}</div>
                      <div className="cs-featured-sub-name">{stripBr(s.title)}</div>
                      <div className="cs-featured-sub-desc">{s.excerpt}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <div className="ptl-case-grid">
              {rest.map((s, i) => (
                <Link
                  key={s.slug}
                  href={`/library/case-studies/${s.slug}`}
                  className={`ptl-case-card rv vis rv-d${Math.min(i + 1, 6)}`}
                >
                  <div className="ptl-case-card-name">{stripBr(s.title)}</div>
                  <div className="ptl-case-card-desc">{s.excerpt}</div>
                  <div className="ptl-case-card-meta">{s.discipline}</div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
