"use client";

import { useState, useRef, useCallback } from "react";

/* ── Business Models data (16) ── */
const models = [
  { num: "[01/16]", title: "Premium Service Model", risk: "CONSERVATIVE", desc: "Positioning for higher fees through specialization and reputation. Value-based pricing vs. hourly.", tag: "STAGE 1" },
  { num: "[02/16]", title: "Retainer + Bonus Model", risk: "CONSERVATIVE", desc: "Guaranteed monthly income with performance incentives. Combines security with upside potential.", tag: "STAGE 1" },
  { num: "[03/16]", title: "Project Equity Model", risk: "MODERATE", desc: "Trading reduced fees for ownership in client companies. Building a portfolio of equity positions over time.", tag: "STAGE 2" },
  { num: "[04/16]", title: "Advisory / Consultant Model", risk: "MODERATE", desc: "Transitioning from hands-on work to strategic guidance. Charging premium for judgment, not execution.", tag: "STAGE 2" },
  { num: "[05/16]", title: "Co-Creation Joint Venture", risk: "MODERATE", desc: "Forming new legal entity for specific product or project. Both parties contribute \u2014 ownership reflects value.", tag: "STAGE 3" },
  { num: "[06/16]", title: "Product Partnership Model", risk: "MODERATE", desc: "Co-developing products with established brands. Revenue sharing or equity with creator audience and brand infrastructure.", tag: "STAGE 3" },
  { num: "[07/16]", title: "Platform Cooperative Model", risk: "MODERATE", desc: "Worker-owned cooperative structure. Shared decision-making and profit distribution. Alternative to employment or freelancing.", tag: "STAGE 2" },
  { num: "[08/16]", title: "Creative Collective / Studio", risk: "MODERATE", desc: "Group of creatives pooling resources and relationships. Shared overhead, cross-referrals, and collaborative projects.", tag: "STAGE 2" },
  { num: "[09/16]", title: "Holding Company Model", risk: "AGGRESSIVE", desc: "Parent company owning multiple subsidiaries. Diversified revenue building enterprise value beyond personal brand.", tag: "STAGE 3" },
  { num: "[10/16]", title: "Diversified Revenue Streams", risk: "MODERATE", desc: "Systematically building 4\u20136 distinct revenue channels. Reducing platform and client dependency.", tag: "STAGE 3" },
  { num: "[11/16]", title: "Franchise / Licensing Model", risk: "MODERATE\u2013AGGRESSIVE", desc: "Licensing your methodology, brand, or IP to others. Geographic expansion without direct operation.", tag: "STAGE 3" },
  { num: "[12/16]", title: "Creator-as-Platform Model", risk: "AGGRESSIVE", desc: "Creating tools, systems, or platforms for other creatives. Transitioning from practitioner to infrastructure provider.", tag: "STAGE 4" },
  { num: "[13/16]", title: "Constraint-Based Production", risk: "AGGRESSIVE", desc: "Artificial constraints driving creativity. Profit participation replacing guaranteed fees. The Blumhouse approach.", tag: "EMERGING" },
  { num: "[14/16]", title: "Catalog / IP Securitization", risk: "AGGRESSIVE", desc: "Using creative IP as collateral for financing. Selling bonds backed by future royalties. Creative work as financial asset.", tag: "STAGE 4" },
  { num: "[15/16]", title: "DAO / Web3 Governance", risk: "AGGRESSIVE", desc: "Token-based ownership and governance. Community-owned creative projects with blockchain-enabled rights and royalties.", tag: "EMERGING" },
  { num: "[16/16]", title: "AI-Augmented Studio Model", risk: "AGGRESSIVE", desc: "AI handling execution, humans providing strategy and curation. 10x output at premium quality.", tag: "EMERGING" },
];

/* ── Compensation Structures data (19) ── */
const deals = [
  { num: "[17/35]", title: "Equity-for-Services", risk: "MODERATE\u2013AGGRESSIVE", desc: "Trading 40\u201370% of normal fee for equity stake. Building a portfolio of company ownership over time.", tag: "EQUITY" },
  { num: "[18/35]", title: "Founder / Co-Founder Equity", risk: "AGGRESSIVE", desc: "Major ownership position (10\u201350%) in new venture. Active operational involvement beyond creative contribution.", tag: "EQUITY" },
  { num: "[19/35]", title: "Vesting Equity", risk: "MODERATE", desc: "Equity that unlocks over 2\u20134 years. Standard schedule with cliff. Protection for both parties in long-term relationships.", tag: "EQUITY" },
  { num: "[20/35]", title: "Performance Equity", risk: "MODERATE", desc: "Additional equity earned by hitting specific goals. Revenue targets, product launches, fundraising milestones.", tag: "EQUITY" },
  { num: "[21/35]", title: "Convertible Notes", risk: "MODERATE\u2013AGGRESSIVE", desc: "Loan that converts to equity at future fundraising. Bridge financing with discount and/or valuation cap for early risk.", tag: "EQUITY" },
  { num: "[22/35]", title: "Gross Participation", risk: "MODERATE", desc: "Percentage of revenue before most costs deducted. Protects against Hollywood accounting. Requires significant leverage.", tag: "REVENUE" },
  { num: "[23/35]", title: "Net Profit Participation", risk: "MODERATE", desc: "Percentage of profits after all costs deducted. Often manipulated to show zero profit. Proceed with extreme caution.", tag: "REVENUE" },
  { num: "[24/35]", title: "Revenue Share Partnership", risk: "MODERATE", desc: "Percentage of gross revenue (not profit). Cleaner than profit participation. Often combined with reduced upfront fee.", tag: "REVENUE" },
  { num: "[25/35]", title: "Royalty Structures", risk: "CONSERVATIVE\u2013MODERATE", desc: "Payment per unit sold or usage instance. Ongoing income stream from past work. Common in publishing, music, product design.", tag: "RIGHTS" },
  { num: "[26/35]", title: "Hybrid Fee + Backend", risk: "MODERATE", desc: "Guaranteed fee plus percentage of revenue or profit. Balances security with upside. Most common for established creatives.", tag: "HYBRID" },
  { num: "[27/35]", title: "Non-Exclusive Licensing", risk: "CONSERVATIVE", desc: "License same work to multiple clients simultaneously. Retain ownership and control. Scale revenue from single creative asset.", tag: "RIGHTS" },
  { num: "[28/35]", title: "Exclusive Licensing", risk: "CONSERVATIVE\u2013MODERATE", desc: "Grant exclusive use to single buyer for defined period. Higher fees than non-exclusive. Rights revert after term expires.", tag: "RIGHTS" },
  { num: "[29/35]", title: "Rights Reversion Clauses", risk: "CONSERVATIVE", desc: "Automatic return of rights if conditions not met. Critical protection against shelving or underutilization of your work.", tag: "RIGHTS" },
  { num: "[30/35]", title: "Subsidiary Rights Retention", risk: "CONSERVATIVE", desc: "Retain rights to future exploitations \u2014 sequels, derivatives, adaptations. Compound value from single creative work over time.", tag: "RIGHTS" },
  { num: "[31/35]", title: "Territory / Media Rights Splitting", risk: "MODERATE", desc: "Divide rights by geography or medium. Multiple revenue streams from single work. Maximize total value through segmentation.", tag: "RIGHTS" },
  { num: "[32/35]", title: "Royalty + Equity Hybrid", risk: "MODERATE", desc: "Small equity stake plus per-unit royalty. Immediate income plus long-term upside. Common in product partnerships.", tag: "HYBRID" },
  { num: "[33/35]", title: "Milestone Payment Structures", risk: "MODERATE", desc: "Payment tied to completion stages or outcomes. De-risks projects for both parties. Aligns payment with value delivery.", tag: "HYBRID" },
  { num: "[34/35]", title: "Profit Participation + Mgmt Fee", risk: "MODERATE", desc: "Base fee for management or oversight plus additional percentage of profits generated. Used in fund management and ongoing advisory.", tag: "HYBRID" },
  { num: "[35/35]", title: "Option Agreements", risk: "CONSERVATIVE\u2013MODERATE", desc: "Right but not obligation to purchase future work at set terms. Locks in terms for both parties. Common in entertainment.", tag: "HYBRID" },
];

type TabKey = "models" | "deals";

export default function StructuresTable() {
  const [activeTab, setActiveTab] = useState<TabKey>("models");
  const [scrolledBottom, setScrolledBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleTabClick = useCallback((tab: TabKey) => {
    setActiveTab(tab);
    setScrolledBottom(false);
    // Reset scroll on next render
    setTimeout(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }, 0);
  }, []);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
    setScrolledBottom(atBottom);
  }, []);

  const items = activeTab === "models" ? models : deals;

  return (
    <div className={`structures-table rv rv-d1${scrolledBottom ? " scrolled-bottom" : ""}`}>
      <div className="structures-tabs">
        <button
          className={`structures-tab${activeTab === "models" ? " active" : ""}`}
          onClick={() => handleTabClick("models")}
        >
          BUSINESS MODELS (16)
        </button>
        <button
          className={`structures-tab${activeTab === "deals" ? " active" : ""}`}
          onClick={() => handleTabClick("deals")}
        >
          COMPENSATION STRUCTURES (19)
        </button>
      </div>

      <div
        className="structures-scroll"
        ref={scrollRef}
        onScroll={handleScroll}
      >
        {items.map((item, i) => (
          <div className="str-card" key={`${activeTab}-${i}`}>
            <span className="str-num">{item.num}</span>
            <div className="str-main">
              <span className="str-title">{item.title}</span>
              <span className="str-risk">{item.risk}</span>
            </div>
            <p className="str-desc">{item.desc}</p>
            <span className="str-tag">{item.tag}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
