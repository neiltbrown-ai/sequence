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
                            const structMatch = action.match(/\(Structure #(\d+)\)/);
                            if (structMatch) {
                              const num = parseInt(structMatch[1], 10);
                              const info = structureSlugMap[num];
                              const textBefore = action.slice(0, structMatch.index).trim();
                              return (
                                <li key={j}>
                                  {textBefore}
                                  {info ? (
                                    <Link href={`/library/structures/${info.slug}`} className="inv-structure-chip" data-cursor="arrow">
                                      {info.title}
                                    </Link>
                                  ) : (
                                    <span className="inv-structure-chip">Structure #{num}</span>
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

          {content.roadmap.medium_term && (
            <div className="inv-roadmap-horizon">
              <span className="inv-detail-label">Medium Term</span>
              <p className="inv-detail-text">{content.roadmap.medium_term}</p>
            </div>
          )}

          {content.roadmap.long_term_vision && (
            <div className="inv-roadmap-horizon">
              <span className="inv-detail-label">Long Term Vision</span>
              <p className="inv-detail-text">{content.roadmap.long_term_vision}</p>
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
