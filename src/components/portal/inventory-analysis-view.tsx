"use client";

import { useState } from "react";
import Link from "next/link";
import type { InventoryAnalysisContent } from "@/types/inventory";
import { ASSET_TYPE_LABELS } from "@/types/inventory";
import { PortalTabs, PortalTabPanel } from "@/components/portal/portal-tabs";
import { toTitleCase } from "@/lib/utils";

export default function AnalysisView({
  content,
  structureSlugMap = {},
}: {
  content: InventoryAnalysisContent;
  structureSlugMap?: Record<number, { slug: string; title: string }>;
}) {
  const [expandedVals, setExpandedVals] = useState<Set<number>>(new Set());

  const toggleVal = (i: number) => {
    setExpandedVals((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div className="inv-analysis rv vis rv-d1">
      {/* Summary */}
      <div className="inv-analysis-header">
        <div className="set-section-title">Portfolio Analysis</div>
      </div>

      <div className="inv-summary-card">
        <div className="inv-summary-metrics">
          <div className="inv-summary-metric">
            <span className="inv-summary-metric-value">{content.summary.total_assets}</span>
            <span className="inv-summary-metric-label">Total Assets</span>
          </div>
          <div className="inv-summary-metric">
            <span className="inv-summary-metric-value">{content.summary.estimated_total_value_range}</span>
            <span className="inv-summary-metric-label">Estimated Value</span>
          </div>
          <div className="inv-summary-metric">
            <span className={`inv-summary-metric-value inv-leverage--${content.summary.leverage_score}`}>
              {content.summary.leverage_score.charAt(0).toUpperCase() + content.summary.leverage_score.slice(1)}
            </span>
            <span className="inv-summary-metric-label">Leverage Score</span>
          </div>
        </div>
        <div className="inv-summary-insight">
          {content.summary.key_insight}
        </div>
      </div>

      {/* Asset Valuations */}
      {content.asset_valuations.length > 0 && (
        <div className="inv-section">
          <div className="set-section-title">Asset Valuations</div>
          <div className="inv-val-list">
            {content.asset_valuations.map((val, i) => (
              <div key={i} className={`inv-val-card${expandedVals.has(i) ? " expanded" : ""}`}>
                <button
                  type="button"
                  className="inv-val-header"
                  onClick={() => toggleVal(i)}
                  data-cursor="expand"
                >
                  <div>
                    <span className="inv-val-name">{toTitleCase(val.asset_name)}</span>
                    <span className="inv-badge inv-badge--type">{ASSET_TYPE_LABELS[val.asset_type]}</span>
                  </div>
                  <div className="inv-val-right">
                    <span className="inv-val-range">{val.estimated_value_range}</span>
                    <span className={`inv-val-chevron${expandedVals.has(i) ? " is-open" : ""}`}>›</span>
                  </div>
                </button>
                {expandedVals.has(i) && (
                  <div className="inv-val-details">
                    <p className="inv-val-rationale">{val.value_rationale}</p>
                    {val.immediate_actions.length > 0 && (
                      <div className="inv-val-actions">
                        <span className="inv-detail-label">Immediate Actions</span>
                        <ul className="inv-action-list">
                          {val.immediate_actions.map((action, j) => {
                            // Match Structure #N in two common AI output shapes:
                            //   "Structure #29: Rights reversion clauses…"   (prefix form)
                            //   "Use rights reversion (Structure #29)"       (parenthetical)
                            //   "Rights reversion — Structure #29"           (suffix dash)
                            const structMatch = action.match(
                              /(?:\(Structure #(\d+)\)|Structure #(\d+))/i
                            );
                            if (structMatch) {
                              const num = parseInt(
                                structMatch[1] ?? structMatch[2],
                                10
                              );
                              const info = structureSlugMap[num];
                              // Strip the full structure reference (with its
                              // leading colon/dash) to get the description
                              let description = action
                                .replace(/\(Structure #\d+\)/i, "")
                                .replace(/Structure #\d+\s*[:—-]?\s*/i, "")
                                .trim();
                              description = description.replace(/^[:—-]\s*/, "");
                              const href = info
                                ? `/library/structures/${info.slug}`
                                : null;
                              const badge = (
                                <>
                                  Structure #{num}
                                  <svg
                                    viewBox="0 0 12 12"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={1}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M2 10L10 2M10 2H4M10 2V8" />
                                  </svg>
                                </>
                              );
                              return (
                                <li key={j}>
                                  {description && (
                                    <span className="inv-action-text">
                                      {description}
                                    </span>
                                  )}
                                  {href ? (
                                    <Link
                                      href={href}
                                      className="cs-struct-badge"
                                      data-cursor="arrow"
                                    >
                                      {badge}
                                    </Link>
                                  ) : (
                                    <span className="cs-struct-badge">
                                      {badge}
                                    </span>
                                  )}
                                </li>
                              );
                            }
                            return <li key={j}>{action}</li>;
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leverage Scenarios — tabbed layout */}
      {content.scenarios.length > 0 && (
        <div className="inv-section">
          <div className="set-section-title">Leverage Scenarios</div>
          <PortalTabs
            tabs={content.scenarios.map((s) => s.scenario_name)}
            summaryBar={
              <>
                <span className="ptl-tabs-summary-label">Estimated Total Value</span>
                <span className="ptl-tabs-summary-value">{content.summary.estimated_total_value_range}</span>
              </>
            }
          >
            {content.scenarios.map((scenario, i) => (
              <PortalTabPanel key={i}>
                <p className="inv-scenario-desc">{scenario.description}</p>
                <div className="inv-scenario-meta">
                  <div className="inv-scenario-stat">
                    <span className="inv-scenario-stat-label">Potential Value</span>
                    <span className="inv-scenario-stat-value">{scenario.potential_value}</span>
                  </div>
                  <div className="inv-scenario-stat">
                    <span className="inv-scenario-stat-label">Timeline</span>
                    <span className="inv-scenario-stat-value">{scenario.timeline}</span>
                  </div>
                  <div className="inv-scenario-stat">
                    <span className="inv-scenario-stat-label">Risk</span>
                    <span className="inv-scenario-stat-value">{toTitleCase(scenario.risk_level)}</span>
                  </div>
                </div>
                {scenario.required_steps.length > 0 && (
                  <div className="inv-scenario-steps">
                    {scenario.required_steps.map((step, j) => (
                      <div key={j} className="inv-scenario-step">
                        <span className="inv-scenario-step-num">{j + 1}</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                )}
              </PortalTabPanel>
            ))}
          </PortalTabs>
        </div>
      )}

      {/* Roadmap */}
      {content.roadmap && (
        <div className="inv-section">
          <div className="set-section-title">Action Roadmap</div>

          <div className="inv-roadmap-actions">
            {content.roadmap.immediate_actions.map((action) => (
              <div key={action.order} className="inv-roadmap-step">
                <div className="inv-roadmap-num">{action.order}</div>
                <div className="inv-roadmap-content">
                  <div className="inv-roadmap-action">{action.action}</div>
                  <p className="inv-roadmap-why">{action.why}</p>
                  <span className="inv-roadmap-timeline">{action.timeline}</span>
                </div>
              </div>
            ))}
          </div>

          {(content.roadmap.medium_term || content.roadmap.long_term_vision) && (
            <div className="inv-roadmap-horizons">
              {content.roadmap.medium_term && (
                <div className="inv-roadmap-horizon">
                  <div className="inv-roadmap-horizon-icon" aria-hidden>
                    {/* Medium term — clock with two hands at ~6 months */}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.25} width={28} height={28}>
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <span className="inv-detail-label">Medium Term</span>
                  <p className="inv-detail-text">{content.roadmap.medium_term}</p>
                </div>
              )}

              {content.roadmap.long_term_vision && (
                <div className="inv-roadmap-horizon">
                  <div className="inv-roadmap-horizon-icon" aria-hidden>
                    {/* Long term — horizon / mountain peak */}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.25} width={28} height={28}>
                      <path d="M3 18l5-8 4 6 3-4 6 6" strokeLinejoin="round" />
                      <circle cx="17" cy="6" r="1.5" />
                    </svg>
                  </div>
                  <span className="inv-detail-label">Long Term Vision</span>
                  <p className="inv-detail-text">{content.roadmap.long_term_vision}</p>
                </div>
              )}
            </div>
          )}

          {content.roadmap.recommended_structures.length > 0 && (
            <div className="inv-roadmap-structures">
              <span className="inv-detail-label">Recommended Structures</span>
              <div className="inv-structure-links">
                {content.roadmap.recommended_structures.map((num) => {
                  const info = structureSlugMap[num];
                  return (
                    <Link
                      key={num}
                      href={info ? `/library/structures/${info.slug}` : `/library/structures`}
                      className="inv-structure-link"
                    >
                      {info ? info.title : `Structure #${num}`}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
