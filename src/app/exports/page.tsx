import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UI Exports",
};

/* ─────────────────────────────────────────────
   Standalone UI vignettes for transparent PNG export.
   Each section has a white/transparent-friendly background.
   Screenshot each block individually at 2x for marketing use.
   ───────────────────────────────────────────── */

export default function ExportsPage() {
  return (
    <>
      {/* Override body background to transparent for clean exports */}
      <style>{`body { background: transparent !important; }`}</style>
      <div style={{ padding: "80px 60px", background: "transparent", display: "flex", flexDirection: "column", gap: "120px", maxWidth: "1200px" }}>

      {/* ═══════════════════════════════════════════
          1. AI ADVISOR CHAT — with diagram in response
          ═══════════════════════════════════════════ */}
      <section>
        <div style={{ fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--light)", marginBottom: "24px" }}>AI STRATEGIC ADVISOR</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "720px" }}>
          {/* User message */}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <div style={{ background: "var(--black)", color: "var(--bg)", padding: "12px 18px", borderRadius: "16px 16px 4px 16px", fontSize: "14px", lineHeight: "1.55", maxWidth: "440px" }}>
              I&apos;m a photographer with a growing commercial client base. I want to move beyond day rates — what deal structures should I be exploring?
            </div>
          </div>

          {/* AI response */}
          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--black)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: "8px", fontWeight: 600, color: "var(--bg)", letterSpacing: "0.02em" }}>IS</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1 }}>
              <div style={{ fontSize: "14px", lineHeight: "1.65", color: "var(--black)" }}>
                <p style={{ marginBottom: "16px" }}>Based on your position — established commercial work with recurring clients — you&apos;re well-positioned to layer in <strong>three structural shifts</strong>:</p>
                <p style={{ marginBottom: "16px" }}><strong>1. Licensing over buyouts.</strong> Retain copyright on your images and license usage rights by territory, medium, and duration. A single campaign shoot can generate 3–5x the revenue of a flat buyout over its lifecycle.</p>
                <p style={{ marginBottom: "16px" }}><strong>2. Revenue participation on commercial outcomes.</strong> For brand campaigns tied to product launches, negotiate a small backend — 1–3% of campaign-attributed revenue. This reframes your work as a revenue driver, not a line item.</p>
                <p style={{ marginBottom: "0" }}><strong>3. Equity-for-services with early-stage brands.</strong> For startups or emerging brands, trade a portion of your fee for equity or advisory shares. Your visual identity work becomes a founding contribution.</p>
              </div>

              {/* Visual: Value flywheel diagram */}
              <div style={{ background: "var(--white)", border: "1px solid var(--border)", borderRadius: "8px", padding: "24px" }}>
                <div style={{ fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--light)", marginBottom: "16px" }}>YOUR PHOTOGRAPHY VALUE FLYWHEEL</div>
                <div style={{ display: "flex", justifyContent: "center", gap: "32px", alignItems: "center", padding: "16px 0" }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ width: "100px", height: "100px", borderRadius: "50%", border: "1.5px solid var(--black)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontFamily: "var(--sans)", fontWeight: 500 }}>Commercial<br/>Clients</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "center" }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: "8px", color: "var(--light)" }}>LICENSES →</span>
                    <div style={{ width: "60px", height: "1px", background: "var(--border)" }} />
                    <span style={{ fontFamily: "var(--mono)", fontSize: "8px", color: "var(--light)" }}>← EQUITY</span>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ width: "100px", height: "100px", borderRadius: "50%", border: "1.5px solid var(--black)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontFamily: "var(--sans)", fontWeight: 500 }}>Ownership<br/>Portfolio</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "center" }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: "8px", color: "var(--light)" }}>ROYALTIES →</span>
                    <div style={{ width: "60px", height: "1px", background: "var(--border)" }} />
                    <span style={{ fontFamily: "var(--mono)", fontSize: "8px", color: "var(--light)" }}>← BRAND</span>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ width: "100px", height: "100px", borderRadius: "50%", border: "1.5px solid var(--black)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontFamily: "var(--sans)", fontWeight: 500 }}>Recurring<br/>Revenue</div>
                  </div>
                </div>
              </div>

              {/* Structure references */}
              <div style={{ display: "flex", gap: "8px" }}>
                {[
                  { num: "27", label: "Non-Exclusive Licensing" },
                  { num: "24", label: "Revenue Share Partnership" },
                  { num: "17", label: "Equity for Services" },
                ].map((ref) => (
                  <div key={ref.num} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 14px", background: "var(--white)", border: "1px solid var(--border)", borderRadius: "8px", cursor: "pointer" }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: "10px", letterSpacing: "0.05em", color: "var(--light)" }}>{ref.num}</span>
                    <span style={{ fontFamily: "var(--sans)", fontSize: "13px", fontWeight: 500, color: "var(--black)" }}>{ref.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          2. DEAL EVALUATION — with accordion open
          ═══════════════════════════════════════════ */}
      <section>
        <div style={{ fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--light)", marginBottom: "24px" }}>DEAL EVALUATOR</div>

        {/* Deal header */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ fontFamily: "var(--sans)", fontSize: "28px", fontWeight: 300, letterSpacing: "-0.02em", color: "var(--black)", marginBottom: "4px" }}>Brand Campaign — Revenue Share Agreement</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--light)" }}>$45,000 BASE + 2% REVENUE PARTICIPATION</div>
        </div>

        {/* Signal + Score */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#2a9d5c" }} />
            <span style={{ fontFamily: "var(--mono)", fontSize: "10px", letterSpacing: "0.1em", textTransform: "uppercase", color: "#2a9d5c" }}>GREEN — PROCEED</span>
          </div>
          <div style={{ fontFamily: "var(--sans)", fontSize: "32px", fontWeight: 300, letterSpacing: "-0.03em", color: "var(--black)" }}>7.4 <span style={{ fontSize: "16px", color: "var(--light)" }}>/ 10</span></div>
        </div>

        {/* Dimension bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "600px", marginBottom: "32px" }}>
          {[
            { label: "Financial Terms", score: 7.8, color: "#2a9d5c" },
            { label: "Creative Control", score: 8.5, color: "#2a9d5c" },
            { label: "IP & Ownership", score: 6.2, color: "#f2c12e" },
            { label: "Career Positioning", score: 7.1, color: "#2a9d5c" },
            { label: "Risk & Downside", score: 6.8, color: "#f2c12e" },
            { label: "Relationship Dynamics", score: 8.0, color: "#2a9d5c" },
          ].map((dim) => (
            <div key={dim.label}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontFamily: "var(--sans)", fontSize: "13px", fontWeight: 500, color: "var(--black)" }}>{dim.label}</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--mid)" }}>{dim.score} / 10</span>
              </div>
              <div style={{ height: "6px", background: "var(--border)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${dim.score * 10}%`, background: dim.color, borderRadius: "3px" }} />
              </div>
            </div>
          ))}
        </div>

        {/* Career Positioning accordion — OPEN */}
        <div style={{ border: "1px solid var(--border)", borderRadius: "6px", overflow: "hidden", maxWidth: "600px" }}>
          <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--white)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#2a9d5c" }} />
              <span style={{ fontFamily: "var(--sans)", fontSize: "14px", fontWeight: 500, color: "var(--black)" }}>Career Positioning</span>
            </div>
            <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "var(--mid)" }}>7.1 / 10</span>
          </div>
          <div style={{ padding: "0 20px 20px", background: "var(--white)" }}>
            <div style={{ paddingTop: "4px", borderTop: "1px solid var(--border)" }}>
              <p style={{ fontFamily: "var(--sans)", fontSize: "14px", lineHeight: "1.65", color: "var(--mid)", marginTop: "16px" }}>
                This deal positions you well for future negotiations. The brand association adds credibility to your portfolio, and the revenue share component establishes a precedent for outcome-based compensation in your work.
              </p>
              <p style={{ fontFamily: "var(--sans)", fontSize: "14px", lineHeight: "1.65", color: "var(--mid)", marginTop: "12px" }}>
                <strong style={{ color: "var(--black)" }}>Key consideration:</strong> Ensure the contract includes a portfolio usage clause — the right to showcase this work publicly. Without it, you lose the career positioning upside entirely.
              </p>
              <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: "0.08em", textTransform: "uppercase", padding: "3px 8px", border: "1px solid var(--border)", borderRadius: "3px", color: "var(--light)" }}>PORTFOLIO RIGHTS</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: "0.08em", textTransform: "uppercase", padding: "3px 8px", border: "1px solid var(--border)", borderRadius: "3px", color: "var(--light)" }}>BRAND CREDIBILITY</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: "0.08em", textTransform: "uppercase", padding: "3px 8px", border: "1px solid var(--border)", borderRadius: "3px", color: "var(--light)" }}>PRECEDENT SETTING</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          3. ROADMAP CARDS — individual cards
          ═══════════════════════════════════════════ */}
      <section>
        <div style={{ fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--light)", marginBottom: "24px" }}>CUSTOM ROADMAP</div>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>

          {/* Position card */}
          <div style={{ width: "320px", padding: "24px", background: "var(--white)", border: "1px solid var(--border)", borderRadius: "8px" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--light)", marginBottom: "12px" }}>CURRENT POSITION</div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", padding: "6px 14px", background: "var(--bg)", borderRadius: "100px", color: "var(--mid)" }}>STAGE 3</div>
              <span style={{ fontFamily: "var(--sans)", fontSize: "14px", fontWeight: 500, color: "var(--black)" }}>Strategic Growth</span>
            </div>
            <p style={{ fontFamily: "var(--sans)", fontSize: "13px", lineHeight: "1.6", color: "var(--mid)" }}>
              You&apos;ve moved beyond pure execution into strategic positioning. Your work generates recurring value through licensing and selective equity positions. The next stage requires building systems that compound without your direct involvement.
            </p>
            <div style={{ display: "flex", gap: "16px", marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
              <div>
                <div style={{ fontFamily: "var(--sans)", fontSize: "20px", fontWeight: 300, color: "var(--black)" }}>68%</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: "0.1em", color: "var(--light)", textTransform: "uppercase" }}>STAGE PROGRESS</div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--sans)", fontSize: "20px", fontWeight: 300, color: "var(--black)" }}>12–18mo</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: "0.1em", color: "var(--light)", textTransform: "uppercase" }}>TO STAGE 4</div>
              </div>
            </div>
          </div>

          {/* Vision card */}
          <div style={{ width: "320px", padding: "24px", background: "var(--white)", border: "1px solid var(--border)", borderRadius: "8px" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--light)", marginBottom: "12px" }}>VISION ALIGNMENT</div>
            <p style={{ fontFamily: "var(--sans)", fontSize: "15px", lineHeight: "1.65", color: "var(--black)", fontWeight: 500, marginBottom: "12px" }}>
              &ldquo;Build a creative holding company that generates value through IP ownership, not billable hours.&rdquo;
            </p>
            <p style={{ fontFamily: "var(--sans)", fontSize: "13px", lineHeight: "1.6", color: "var(--mid)" }}>
              Your vision aligns with a Stage 4 trajectory — platform ownership. Current structures support this direction, but you&apos;ll need to shift from individual deals to systematic IP capture within 12 months.
            </p>
            <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: "0.1em", color: "var(--light)", textTransform: "uppercase" }}>ALIGNMENT SCORE</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: "11px", color: "#2a7d2a" }}>HIGH</span>
              </div>
              <div style={{ height: "4px", background: "var(--border)", borderRadius: "2px" }}>
                <div style={{ height: "100%", width: "82%", background: "#2a7d2a", borderRadius: "2px" }} />
              </div>
            </div>
          </div>

          {/* Misalignment signals card */}
          <div style={{ width: "320px", padding: "24px", background: "var(--white)", border: "1px solid var(--border)", borderRadius: "8px" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--light)", marginBottom: "16px" }}>MISALIGNMENT SIGNALS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[
                { flag: "Revenue concentration", desc: "68% of income from 2 clients. Diversification needed before scaling.", severity: "#f2c12e" },
                { flag: "No entity structure", desc: "Operating as sole proprietor limits liability protection and deal complexity.", severity: "#e84225" },
                { flag: "IP retention gaps", desc: "3 of last 5 deals were full buyouts. Transition to licensing-first terms.", severity: "#f2c12e" },
              ].map((signal, i) => (
                <div key={i} style={{ display: "flex", gap: "10px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: signal.severity, marginTop: "5px", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontFamily: "var(--sans)", fontSize: "13px", fontWeight: 500, color: "var(--black)", marginBottom: "2px" }}>{signal.flag}</div>
                    <div style={{ fontFamily: "var(--sans)", fontSize: "12px", lineHeight: "1.5", color: "var(--mid)" }}>{signal.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Next steps card */}
          <div style={{ width: "320px", padding: "24px", background: "var(--black)", borderRadius: "8px", color: "var(--white)" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "16px" }}>PRIORITY ACTIONS</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                { num: "01", action: "Form an LLC or S-Corp", desc: "Required for equity deals and liability protection. Consult a CPA for tax structure.", timeline: "30 DAYS" },
                { num: "02", action: "Renegotiate top 2 client contracts", desc: "Shift from buyout to licensing terms. Start with the renewal coming up in Q2.", timeline: "60 DAYS" },
                { num: "03", action: "Build an IP catalog strategy", desc: "Document all existing work with reuse potential. Identify 5 assets for licensing.", timeline: "90 DAYS" },
              ].map((step) => (
                <div key={step.num}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "4px" }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: "0.1em", color: "rgba(255,255,255,0.35)" }}>{step.num}</span>
                    <span style={{ fontFamily: "var(--sans)", fontSize: "14px", fontWeight: 500, color: "var(--white)" }}>{step.action}</span>
                  </div>
                  <div style={{ fontFamily: "var(--sans)", fontSize: "12px", lineHeight: "1.5", color: "rgba(255,255,255,0.5)", paddingLeft: "24px" }}>{step.desc}</div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: "8px", letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", paddingLeft: "24px", marginTop: "4px", textTransform: "uppercase" }}>{step.timeline}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          4. ASSET INVENTORY — portfolio analysis cards
          ═══════════════════════════════════════════ */}
      <section>
        <div style={{ fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--light)", marginBottom: "24px" }}>ASSET INVENTORY</div>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>

          {/* Summary card */}
          <div style={{ width: "660px", padding: "32px", background: "var(--white)", border: "1px solid var(--border)", borderRadius: "8px" }}>
            <div style={{ fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--light)", marginBottom: "20px" }}>PORTFOLIO SUMMARY</div>
            <div style={{ display: "flex", gap: "48px", marginBottom: "24px" }}>
              <div>
                <div style={{ fontFamily: "var(--sans)", fontSize: "36px", fontWeight: 200, letterSpacing: "-0.03em", color: "var(--black)" }}>$180K–$450K</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--light)" }}>ESTIMATED PORTFOLIO VALUE</div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--sans)", fontSize: "36px", fontWeight: 200, letterSpacing: "-0.03em", color: "var(--black)" }}>Medium</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--light)" }}>LEVERAGE SCORE</div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--sans)", fontSize: "36px", fontWeight: 200, letterSpacing: "-0.03em", color: "var(--black)" }}>5</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--light)" }}>TOTAL ASSETS</div>
              </div>
            </div>
            <p style={{ fontFamily: "var(--sans)", fontSize: "14px", lineHeight: "1.65", color: "var(--mid)" }}>
              Your portfolio shows strong potential but is under-leveraged. 3 of 5 assets are generating revenue, but licensing terms could increase yield by 2–3x. The photography catalog is the highest-value asset with the most untapped potential.
            </p>
          </div>

          {/* Individual asset card */}
          <div style={{ width: "320px", padding: "24px", background: "var(--white)", border: "1px solid var(--border)", borderRadius: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--light)" }}>CREATIVE ASSET</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: "0.08em", textTransform: "uppercase", padding: "3px 8px", borderRadius: "3px", background: "rgba(42,125,42,0.06)", border: "1px solid rgba(42,125,42,0.12)", color: "#2a7d2a" }}>ACTIVE</div>
            </div>
            <div style={{ fontFamily: "var(--sans)", fontSize: "18px", fontWeight: 500, letterSpacing: "-0.01em", color: "var(--black)", marginBottom: "8px" }}>Commercial Photography Catalog</div>
            <p style={{ fontFamily: "var(--sans)", fontSize: "13px", lineHeight: "1.55", color: "var(--mid)", marginBottom: "16px" }}>
              2,400+ images across commercial, editorial, and brand campaigns. Currently licensed non-exclusively through 2 agencies.
            </p>
            <div style={{ display: "flex", gap: "24px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
              <div>
                <div style={{ fontFamily: "var(--sans)", fontSize: "18px", fontWeight: 300, color: "var(--black)" }}>$85K–$220K</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: "0.1em", color: "var(--light)", textTransform: "uppercase" }}>EST. VALUE</div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--sans)", fontSize: "18px", fontWeight: 300, color: "#2a7d2a" }}>High</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: "0.1em", color: "var(--light)", textTransform: "uppercase" }}>LEVERAGE</div>
              </div>
            </div>
          </div>

          {/* Another asset card */}
          <div style={{ width: "320px", padding: "24px", background: "var(--white)", border: "1px solid var(--border)", borderRadius: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--light)" }}>CREATIVE ASSET</div>
              <div style={{ fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: "0.08em", textTransform: "uppercase", padding: "3px 8px", borderRadius: "3px", background: "rgba(180,134,11,0.06)", border: "1px solid rgba(180,134,11,0.12)", color: "#b8860b" }}>UNDERUTILIZED</div>
            </div>
            <div style={{ fontFamily: "var(--sans)", fontSize: "18px", fontWeight: 500, letterSpacing: "-0.01em", color: "var(--black)", marginBottom: "8px" }}>Brand Identity Framework</div>
            <p style={{ fontFamily: "var(--sans)", fontSize: "13px", lineHeight: "1.55", color: "var(--mid)", marginBottom: "16px" }}>
              Proprietary brand development methodology used across 40+ client engagements. Currently delivered as a service, not licensed.
            </p>
            <div style={{ display: "flex", gap: "24px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
              <div>
                <div style={{ fontFamily: "var(--sans)", fontSize: "18px", fontWeight: 300, color: "var(--black)" }}>$45K–$120K</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: "0.1em", color: "var(--light)", textTransform: "uppercase" }}>EST. VALUE</div>
              </div>
              <div>
                <div style={{ fontFamily: "var(--sans)", fontSize: "18px", fontWeight: 300, color: "#b8860b" }}>Medium</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: "9px", letterSpacing: "0.1em", color: "var(--light)", textTransform: "uppercase" }}>LEVERAGE</div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
    </>
  );
}
