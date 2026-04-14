import Link from "next/link";
import type { Metadata } from "next";
import ButtonArrow from "@/components/ui/button-arrow";
import FaqAccordion from "@/components/faq-accordion";

export const metadata: Metadata = {
  title: "Pricing",
};

export default function PricingPage() {
  return (
    <>
      {/* ===== HERO ===== */}
      <section className="pr-hero">
        <div className="pr-hero-title">
          <h1 className="anim-text-up">Pricing</h1>
        </div>
        <div className="pr-hero-sub">
          <div className="pr-hero-sub-grid">
            <p className="pr-hero-desc rv">
              <strong>
                The complete playbook for building ownership in the creative
                economy.
              </strong>{" "}
              Choose the level of access that fits where you are right now.
            </p>
          </div>
        </div>
      </section>

      {/* ===== PLAN CARDS ===== */}
      <section className="pr-plan">
        <div className="pr-plan-grid">
          {/* Card 1: Library — $12/yr */}
          <div className="pr-plan-card rv">
            <span className="pr-plan-label">Library</span>
            <div className="pr-plan-price">
              <span className="pr-plan-price-val">$12</span>
              <span className="pr-plan-price-term">/ year</span>
            </div>
            <p className="pr-plan-desc">
              Full access to every structure, case study, and framework in the library.
            </p>
            <ul className="pr-plan-features">
              <li>35+ deal structures with negotiation scripts</li>
              <li>70+ case studies across creative industries</li>
              <li>Decision frameworks and strategic roadmaps</li>
              <li>Weekly new content and library updates</li>
              <li>Save and organize content in your library</li>
            </ul>
            <div className="pr-plan-cta">
              <Link href="/signup?plan=library" className="btn pr-plan-cta-secondary">
                GET STARTED — $12/YEAR
                <ButtonArrow />
              </Link>
            </div>
          </div>

          {/* Card 2: Full Access — $19/mo or $190/yr */}
          <div className="pr-plan-card pr-plan-card--featured rv rv-d1">
            <div className="pr-plan-title-row">
              <span className="pr-plan-label">Full Access</span>
              <span className="pr-plan-badge">Most Popular</span>
            </div>
            <div className="pr-plan-price">
              <span className="pr-plan-price-val">$19</span>
              <span className="pr-plan-price-term">/ month</span>
            </div>
            <p className="pr-plan-desc">
              or <strong>$190/year</strong> (save $38). Everything in Library plus AI-powered tools.
            </p>
            <ul className="pr-plan-features">
              <li>Everything in Library</li>
              <li>AI Strategic Advisor — personalized guidance</li>
              <li>Deal Evaluator — score and analyze any deal</li>
              <li>Career Assessment with custom roadmap</li>
              <li>Asset Inventory tracking and valuation</li>
            </ul>
            <div className="pr-plan-cta">
              <Link href="/signup?plan=full_access" className="btn pr-plan-cta-primary">
                GET FULL ACCESS
                <ButtonArrow />
              </Link>
            </div>
          </div>

          {/* Card 3: 1:1 Coaching — $5K/mo waitlist */}
          <div className="pr-plan-card rv rv-d2">
            <div className="pr-plan-title-row">
              <span className="pr-plan-label">1:1 Coaching</span>
              <span className="pr-plan-badge">Waitlist</span>
            </div>
            <div className="pr-plan-price">
              <span className="pr-plan-price-val">$5,000</span>
              <span className="pr-plan-price-term">/ month</span>
            </div>
            <p className="pr-plan-desc">
              3, 6, or 9 month engagements. Everything in Full Access plus dedicated advisory.
            </p>
            <ul className="pr-plan-features">
              <li>Everything in Full Access</li>
              <li>Dedicated strategic advisor</li>
              <li>Custom deal structure analysis</li>
              <li>Negotiation preparation and review</li>
              <li>Direct access via email and scheduled calls</li>
            </ul>
            <div className="pr-plan-cta">
              <Link href="/coaching" className="btn pr-plan-waitlist">
                JOIN WAITLIST
                <ButtonArrow />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== COMPARISON GRID ===== */}
      <section className="pr-compare">
        <div className="pr-compare-head">
          <h2 className="anim-text-up">Compare Plans</h2>
        </div>
        <div className="pr-compare-table-wrap">
          <table className="pr-compare-table">
            <colgroup>
              <col />
              <col />
              <col />
              <col />
            </colgroup>
            <thead>
              <tr>
                <th></th>
                <th>Library</th>
                <th>Full Access</th>
                <th>Coaching</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Deal Structures (35+)</td>
                <td>&#10003;</td>
                <td>&#10003;</td>
                <td>&#10003;</td>
              </tr>
              <tr>
                <td>Case Studies (70+)</td>
                <td>&#10003;</td>
                <td>&#10003;</td>
                <td>&#10003;</td>
              </tr>
              <tr>
                <td>Reference Guides</td>
                <td>&#10003;</td>
                <td>&#10003;</td>
                <td>&#10003;</td>
              </tr>
              <tr>
                <td>Negotiation Playbooks</td>
                <td>&#10003;</td>
                <td>&#10003;</td>
                <td>&#10003;</td>
              </tr>
              <tr>
                <td>Weekly Content Updates</td>
                <td>&#10003;</td>
                <td>&#10003;</td>
                <td>&#10003;</td>
              </tr>
              <tr>
                <td>AI Strategic Advisor</td>
                <td>&mdash;</td>
                <td>&#10003;</td>
                <td>&#10003;</td>
              </tr>
              <tr>
                <td>Deal Evaluator</td>
                <td>&mdash;</td>
                <td>&#10003;</td>
                <td>&#10003;</td>
              </tr>
              <tr>
                <td>Career Assessment + Roadmap</td>
                <td>&mdash;</td>
                <td>&#10003;</td>
                <td>&#10003;</td>
              </tr>
              <tr>
                <td>Asset Inventory</td>
                <td>&mdash;</td>
                <td>&#10003;</td>
                <td>&#10003;</td>
              </tr>
              <tr>
                <td>Dedicated Strategic Advisor</td>
                <td>&mdash;</td>
                <td>&mdash;</td>
                <td>&#10003;</td>
              </tr>
              <tr>
                <td>Custom Deal Analysis</td>
                <td>&mdash;</td>
                <td>&mdash;</td>
                <td>&#10003;</td>
              </tr>
              <tr>
                <td>Negotiation Prep &amp; Review</td>
                <td>&mdash;</td>
                <td>&mdash;</td>
                <td>&#10003;</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ===== WHAT'S INCLUDED ===== */}
      <section className="pr-included">
        <div className="pr-included-head">
          <h2 className="anim-text-up">What&apos;s Included</h2>
        </div>
        <div className="pr-included-grid">
          <div className="pr-item rv">
            <span className="pr-item-num">35+</span>
            <span className="pr-item-title">Deal Structures</span>
            <p className="pr-item-desc">
              Business models and compensation mechanisms with templates,
              negotiation guidance, and decision checklists for every scenario.
            </p>
          </div>
          <div className="pr-item rv rv-d1">
            <span className="pr-item-num">70+</span>
            <span className="pr-item-title">Case Studies</span>
            <p className="pr-item-desc">
              Real deals across creative industries — actual terms, financial
              outcomes, and transferable lessons from practitioners who&apos;ve
              done it.
            </p>
          </div>
          <div className="pr-item rv rv-d2">
            <span className="pr-item-num">[03]</span>
            <span className="pr-item-title">Reference Guides</span>
            <p className="pr-item-desc">
              Deep dives on rights, royalties, equity structures, and the
              protective mechanisms that matter most in creative deals.
            </p>
          </div>
          <div className="pr-item rv rv-d3">
            <span className="pr-item-num">[04]</span>
            <span className="pr-item-title">Negotiation Playbooks</span>
            <p className="pr-item-desc">
              Scripts, anchoring techniques, walk-away alternatives, and specific
              pushback language tailored to every structure type.
            </p>
          </div>
          <div className="pr-item rv rv-d4">
            <span className="pr-item-num">[05]</span>
            <span className="pr-item-title">Decision Frameworks</span>
            <p className="pr-item-desc">
              Financial readiness scoring, career positioning assessments, and
              risk tolerance evaluation tools to guide every major move.
            </p>
          </div>
          <div className="pr-item rv rv-d5">
            <span className="pr-item-num">[06]</span>
            <span className="pr-item-title">Strategic Roadmaps</span>
            <p className="pr-item-desc">
              Stage-specific guidance for moving from execution to ownership
              across the four-stage creative career progression.
            </p>
          </div>
          <div className="pr-item rv rv-d6">
            <span className="pr-item-num">[07]</span>
            <span className="pr-item-title">AI Strategic Advisor</span>
            <p className="pr-item-desc">
              A conversational advisor grounded in the full library &mdash;
              personalized deal guidance, negotiation strategies, and career
              positioning informed by real creative economy data.
            </p>
          </div>
          <div className="pr-item rv rv-d7">
            <span className="pr-item-num">[08]</span>
            <span className="pr-item-title">Portfolio Analysis</span>
            <p className="pr-item-desc">
              Track and value your creative assets, deal positions, and revenue
              streams. Identify gaps, model outcomes, and see how your
              portfolio compounds over time.
            </p>
          </div>
        </div>
      </section>

      {/* ===== COMING SOON ===== */}
      <section className="pr-coming">
        <div className="pr-coming-head">
          <h2 className="anim-text-up">Coming Soon<br />to the Platform</h2>
        </div>
        <div className="pr-coming-grid">
          <div className="pr-coming-item rv">
            <div className="pr-coming-icon">
              <svg viewBox="0 0 32 32" fill="none" width={58} height={58}>
                <circle cx="10" cy="12" r="3" stroke="currentColor" strokeWidth="1" />
                <circle cx="22" cy="12" r="3" stroke="currentColor" strokeWidth="1" />
                <circle cx="16" cy="22" r="3" stroke="currentColor" strokeWidth="1" />
                <path d="M12.5 14l2 5.5M19.5 14l-2 5.5M13 12h6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              </svg>
            </div>
            <span className="pr-coming-title">Membership Community</span>
            <p className="pr-coming-desc">
              Connect with creative professionals navigating similar deal
              structures. Share experiences, ask questions, and learn from peers
              across industries.
            </p>
          </div>
          <div className="pr-coming-item rv rv-d1">
            <div className="pr-coming-icon">
              <svg viewBox="0 0 32 32" fill="none" width={58} height={58}>
                <rect x="4" y="6" width="24" height="20" rx="2" stroke="currentColor" strokeWidth="1" />
                <path d="M4 12h24" stroke="currentColor" strokeWidth="1" />
                <circle cx="10" cy="20" r="2" stroke="currentColor" strokeWidth="1" />
                <path d="M14 19h10M14 22h7" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              </svg>
            </div>
            <span className="pr-coming-title">Cohort Programs</span>
            <p className="pr-coming-desc">
              Small-group advisory with 5 creatives max. Facilitated sessions,
              peer accountability, and monthly masterclasses on advanced
              structures.
            </p>
          </div>
          <div className="pr-coming-item rv rv-d2">
            <div className="pr-coming-icon">
              <svg viewBox="0 0 32 32" fill="none" width={58} height={58}>
                <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1" />
                <path d="M16 8v8l5 3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="16" cy="16" r="3" stroke="currentColor" strokeWidth="1" />
              </svg>
            </div>
            <span className="pr-coming-title">Masterclasses</span>
            <p className="pr-coming-desc">
              Deep-dive sessions on advanced deal structures, negotiation
              tactics, and career transitions — taught by practitioners who&apos;ve
              done the deals.
            </p>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="pr-faq">
        <div className="pr-faq-head">
          <h2 className="anim-text-up">Questions</h2>
        </div>
        <FaqAccordion />
      </section>

      {/* ===== CTA ===== */}
      <section className="pr-cta">
        <div className="pr-cta-grid">
          <div className="pr-cta-content">
            <span className="pr-cta-lbl rv">START WITH THE LIBRARY</span>
            <h2 className="pr-cta-title anim-text-up">
              Get In
              <br />
              Sequence
            </h2>
            <p className="pr-cta-desc rv rv-d1">
              <strong>From $12 per year.</strong> Every structure, case study, and
              framework — plus new content added weekly. The library grows. Your
              leverage grows with it.
            </p>
            <div className="pr-cta-buttons rv rv-d2">
              <Link href="/signup?plan=library" className="btn btn--white">
                LIBRARY — $12/YEAR
                <ButtonArrow />
              </Link>
              <Link href="/signup?plan=full_access" className="btn btn--outline-white" style={{ marginLeft: "12px" }}>
                FULL ACCESS — $19/MO
                <ButtonArrow />
              </Link>
            </div>
          </div>
          <div className="pr-cta-right rv rv-d3">
            <div className="pr-cta-feature">
              <span className="pr-cta-feature-num">[01]</span>
              <span className="pr-cta-feature-text">
                <strong>35+ deal structures</strong> with templates and guidance
              </span>
            </div>
            <div className="pr-cta-feature">
              <span className="pr-cta-feature-num">[02]</span>
              <span className="pr-cta-feature-text">
                <strong>70+ case studies</strong> across creative industries
              </span>
            </div>
            <div className="pr-cta-feature">
              <span className="pr-cta-feature-num">[03]</span>
              <span className="pr-cta-feature-text">
                <strong>Reference guides</strong> on rights, royalties, and
                equity
              </span>
            </div>
            <div className="pr-cta-feature">
              <span className="pr-cta-feature-num">[04]</span>
              <span className="pr-cta-feature-text">
                <strong>Negotiation playbooks</strong> with pushback scripts
              </span>
            </div>
            <div className="pr-cta-feature">
              <span className="pr-cta-feature-num">[05]</span>
              <span className="pr-cta-feature-text">
                <strong>AI tools</strong> for deal evaluation and career planning
              </span>
            </div>
            <div className="pr-cta-feature">
              <span className="pr-cta-feature-num">[06]</span>
              <span className="pr-cta-feature-text">
                <strong>Strategic roadmaps</strong> for every career stage
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
