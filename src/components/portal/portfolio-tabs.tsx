"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";

interface PortfolioTabsProps {
  children: ReactNode; // The full InventoryPage component
  assetCount: number;
  hasAnalysis: boolean;
}

export default function PortfolioTabs({
  children,
  assetCount,
  hasAnalysis,
}: PortfolioTabsProps) {
  const [tab, setTab] = useState<"assets" | "valuation">("assets");

  return (
    <>
      {/* Page header */}
      <div className="dash-header rv vis">
        <h1 className="dash-title" style={{ fontFamily: "var(--sans)", fontWeight: 300, fontSize: "clamp(28px, 4vw, 40px)", letterSpacing: "-.02em" }}>
          Portfolio
        </h1>
      </div>

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

      {/* Tab content */}
      {tab === "assets" && children}

      {tab === "valuation" && (
        <div>
          {assetCount === 0 ? (
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
          ) : !hasAnalysis ? (
            <div className="dash-section rv vis">
              <div className="dash-cta-card" style={{ textAlign: "center", padding: "60px 32px" }}>
                <h3 style={{ fontFamily: "var(--sans)", fontSize: "18px", fontWeight: 500, marginBottom: "8px" }}>
                  {assetCount} asset{assetCount === 1 ? "" : "s"} cataloged
                </h3>
                <p style={{ fontFamily: "var(--sans)", fontSize: "14px", color: "var(--mid)", lineHeight: 1.6, maxWidth: "400px", margin: "0 auto 24px" }}>
                  Run an AI analysis to get valuations, leverage scenarios, and a strategic roadmap for your portfolio.
                </p>
                <Link href="/inventory" className="btn btn--filled">
                  Analyze Portfolio
                </Link>
              </div>
            </div>
          ) : (
            <div className="dash-section rv vis">
              <p style={{ fontFamily: "var(--sans)", fontSize: "14px", color: "var(--mid)", marginBottom: "16px" }}>
                Your latest AI analysis is displayed in the Assets tab alongside your inventory. Switch to the Assets tab to view the full analysis.
              </p>
              <button
                type="button"
                className="btn btn--filled"
                onClick={() => setTab("assets")}
              >
                View Analysis
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
