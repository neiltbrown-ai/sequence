"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import InventoryPage from "@/components/portal/inventory-page";
import AnalysisView from "@/components/portal/inventory-analysis-view";
import type { AssetInventoryItem, AssetInventoryAnalysis } from "@/types/inventory";

interface PortfolioTabsProps {
  initialItems: AssetInventoryItem[];
  initialAnalysis: AssetInventoryAnalysis | null;
  structureSlugMap?: Record<number, { slug: string; title: string }>;
}

const ANALYSIS_EXPECTED_MS = 75000; // ~75 seconds expected
const PROGRESS_TICK_MS = 200;
const ANALYSIS_TIMEOUT_MS = 180000; // 3 minute hard timeout

const PROGRESS_STAGES = [
  { at: 0, label: "Loading your portfolio assets" },
  { at: 12, label: "Analyzing asset types and ownership" },
  { at: 28, label: "Estimating value ranges" },
  { at: 48, label: "Building leverage scenarios" },
  { at: 68, label: "Designing your action roadmap" },
  { at: 85, label: "Finalizing analysis" },
];

export default function PortfolioTabs({
  initialItems,
  initialAnalysis,
  structureSlugMap = {},
}: PortfolioTabsProps) {
  const [tab, setTab] = useState<"assets" | "valuation">("assets");
  const [items, setItems] = useState<AssetInventoryItem[]>(initialItems);
  const [analysis, setAnalysis] = useState<AssetInventoryAnalysis | null>(initialAnalysis);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState("");
  const [timedOut, setTimedOut] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stageLabel, setStageLabel] = useState(PROGRESS_STAGES[0].label);
  const [showRoadmapToast, setShowRoadmapToast] = useState(false);
  const startTimeRef = useRef<number>(0);

  const assetCount = items.length;
  const isStale =
    !!analysis &&
    items.some((item) => new Date(item.updated_at) > new Date(analysis.created_at));

  // Animate progress while analyzing
  useEffect(() => {
    if (!analyzing) {
      setProgress(0);
      return;
    }

    startTimeRef.current = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const raw = elapsed / ANALYSIS_EXPECTED_MS;
      // Ease-out, cap at 90% so it doesn't show 100% before completion
      const eased = 1 - Math.pow(1 - Math.min(raw, 1), 2.5);
      const next = Math.min(eased * 90, 90);
      setProgress(next);

      // Update stage label based on progress
      const currentStage = PROGRESS_STAGES.slice().reverse().find((s) => next >= s.at);
      if (currentStage) setStageLabel(currentStage.label);
    }, PROGRESS_TICK_MS);

    return () => clearInterval(interval);
  }, [analyzing]);

  const handleAnalyze = async () => {
    if (items.length === 0) return;

    // Switch to Valuation tab immediately
    setTab("valuation");
    setAnalyzing(true);
    setAnalyzeError("");
    setTimedOut(false);

    const startedAt = Date.now();

    try {
      const res = await fetch("/api/inventory/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) throw new Error("Failed to start analysis");

      const { analysisId } = await res.json();

      // Poll for completion with hard timeout
      const poll = async () => {
        if (Date.now() - startedAt > ANALYSIS_TIMEOUT_MS) {
          setTimedOut(true);
          setAnalyzing(false);
          return;
        }
        const check = await fetch(`/api/inventory/analysis/${analysisId}`);
        if (!check.ok) throw new Error("Failed to check analysis status");
        const result = await check.json();

        if (result.status === "completed") {
          setProgress(100);
          // Brief pause at 100% before showing analysis
          setTimeout(() => {
            setAnalysis(result as AssetInventoryAnalysis);
            setAnalyzing(false);
            // Roadmap regeneration is kicked off server-side when the analysis
            // completes. Surface a toast with a deep link.
            setShowRoadmapToast(true);
          }, 400);
        } else if (result.status === "failed") {
          throw new Error("Analysis failed");
        } else {
          setTimeout(poll, 2000);
        }
      };

      await poll();
    } catch {
      setAnalyzeError("Something went wrong. Please try again.");
      setAnalyzing(false);
    }
  };

  return (
    <>
      {/* Roadmap regenerated toast — shown after portfolio analysis completes */}
      {showRoadmapToast && (
        <div className="ptl-roadmap-toast" role="status">
          <div className="ptl-roadmap-toast-icon" aria-hidden>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="20" height="20">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12l3 3 5-6" />
            </svg>
          </div>
          <div className="ptl-roadmap-toast-content">
            <strong>Your roadmap has been updated.</strong>{" "}
            The new Portfolio signal is being woven into your strategic plan.
          </div>
          <Link href="/roadmap" className="ptl-roadmap-toast-link">
            View Roadmap →
          </Link>
          <button
            type="button"
            className="ptl-roadmap-toast-dismiss"
            aria-label="Dismiss"
            onClick={() => setShowRoadmapToast(false)}
          >
            ×
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="ptl-filter-bar" style={{ marginBottom: "24px" }}>
        <button
          className={`ptl-filter-tab${tab === "assets" ? " active" : ""}`}
          onClick={() => setTab("assets")}
        >
          Assets
        </button>
        <button
          className={`ptl-filter-tab${tab === "valuation" ? " active" : ""}`}
          onClick={() => setTab("valuation")}
        >
          Valuation
        </button>
      </div>

      {/* Assets tab */}
      {tab === "assets" && (
        <InventoryPage
          initialItems={items}
          onItemsChange={setItems}
          onAnalyze={handleAnalyze}
          analyzing={analyzing}
          analyzeError={analyzeError}
          hasAnalysis={!!analysis}
          isStale={isStale}
        />
      )}

      {/* Valuation tab */}
      {tab === "valuation" && (
        <div>
          {/* Loading state — shown while analyzing */}
          {analyzing && (
            <div className="inv-analyzing-card rv vis">
              <div className="inv-analyzing-spinner" />
              <h3 className="inv-analyzing-title">Analyzing your portfolio</h3>
              <p className="inv-analyzing-stage">{stageLabel}</p>
              <div className="inv-analyzing-bar">
                <div
                  className="inv-analyzing-bar-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="inv-analyzing-note">
                This typically takes 60&ndash;90 seconds.
              </p>
            </div>
          )}

          {/* Timeout state */}
          {!analyzing && timedOut && (
            <div className="inv-analyzing-card rv vis">
              <h3 className="inv-analyzing-title">Analysis is taking longer than expected</h3>
              <p style={{ fontFamily: "var(--sans)", fontSize: "14px", color: "var(--mid)", lineHeight: 1.6, margin: "0 0 24px" }}>
                Your portfolio analysis is still processing in the background.
                Try refreshing this page in a minute or two, or run a new
                analysis.
              </p>
              <button
                type="button"
                className="btn btn--filled"
                onClick={() => { setTimedOut(false); handleAnalyze(); }}
              >
                Try Again
              </button>
            </div>
          )}

          {/* No assets yet */}
          {!analyzing && !timedOut && assetCount === 0 && (
            <div className="dash-section rv vis">
              <div className="dash-cta-card" style={{ textAlign: "center", padding: "60px 32px" }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--light)", marginBottom: "20px" }}>
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
                <h3 style={{ fontFamily: "var(--sans)", fontSize: "18px", fontWeight: 500, marginBottom: "8px" }}>
                  Audit your unmonetized assets
                </h3>
                <p style={{ fontFamily: "var(--sans)", fontSize: "14px", color: "var(--mid)", lineHeight: 1.6, maxWidth: "400px", margin: "0 auto 24px" }}>
                  Add your creative assets first, then run an AI analysis to get valuations, leverage scenarios, and a strategic roadmap.
                </p>
                <button
                  type="button"
                  className="btn btn--filled"
                  onClick={() => setTab("assets")}
                >
                  Go to Assets
                </button>
              </div>
            </div>
          )}

          {/* Assets exist but no analysis yet */}
          {!analyzing && !timedOut && assetCount > 0 && !analysis && (
            <div className="dash-section rv vis">
              <div className="dash-cta-card" style={{ textAlign: "center", padding: "60px 32px" }}>
                <h3 style={{ fontFamily: "var(--sans)", fontSize: "18px", fontWeight: 500, marginBottom: "8px" }}>
                  {assetCount} asset{assetCount === 1 ? "" : "s"} cataloged
                </h3>
                <p style={{ fontFamily: "var(--sans)", fontSize: "14px", color: "var(--mid)", lineHeight: 1.6, maxWidth: "400px", margin: "0 auto 24px" }}>
                  Run an AI analysis to get valuations, leverage scenarios, and a strategic roadmap for your portfolio.
                </p>
                <button
                  type="button"
                  className="btn btn--filled"
                  onClick={handleAnalyze}
                >
                  Analyze Portfolio
                </button>
                {analyzeError && (
                  <p style={{ marginTop: "12px", color: "#c0392b", fontSize: "13px" }}>{analyzeError}</p>
                )}
              </div>
            </div>
          )}

          {/* Analysis exists */}
          {!analyzing && !timedOut && analysis && analysis.status === "completed" && analysis.analysis_content && (
            <>
              {isStale && (
                <p className="inv-stale-notice" style={{ marginBottom: "16px" }}>
                  Your inventory has changed since the last analysis.{" "}
                  <button
                    type="button"
                    onClick={handleAnalyze}
                    style={{ background: "none", border: "none", color: "var(--black)", textDecoration: "underline", cursor: "pointer", padding: 0, font: "inherit" }}
                  >
                    Re-analyze
                  </button>{" "}
                  to get updated insights.
                </p>
              )}
              <AnalysisView
                content={analysis.analysis_content}
                structureSlugMap={structureSlugMap}
              />
            </>
          )}
        </div>
      )}
    </>
  );
}
