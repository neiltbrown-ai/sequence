import Link from "next/link";
import type { Metadata } from "next";
import ButtonArrow from "@/components/ui/button-arrow";
import BrowserFrame from "@/components/ui/browser-frame";
import NewsletterForm from "@/components/newsletter-form";
import StructuresTable from "@/components/structures-table";
import TestimonialsCarousel from "@/components/testimonials-carousel";
import {
  getStructuresTableData,
  getFeaturedCaseStudies,
  getTestimonials,
} from "@/lib/content";

const stripBr = (s: string) => s.replace(/<br\s*\/?>/gi, " ");

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Platform — In Sequence",
};

export default function PlatformPage() {
  const { models, deals } = getStructuresTableData();
  const caseStudies = getFeaturedCaseStudies(4);
  const testimonials = getTestimonials();

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="lib-hero">
        <div className="lib-hero-title">
          <h1 className="anim-text-up">The Platform</h1>
        </div>
        <div className="lib-hero-sub">
          <div className="lib-hero-sub-grid">
            <p className="lib-hero-desc rv">
              <strong>
                AI-powered strategic tools and a research-backed library
              </strong>{" "}
              for creative professionals navigating deal structures, ownership
              transitions, and value capture &mdash; personalized guidance,
              deal analysis, career mapping, and asset tracking built on 35
              structures and 70+ case studies.
            </p>
          </div>
        </div>
        <div className="lib-hero-cta rv rv-d1">
          <Link href="/pricing" className="btn">
            GET IN SEQUENCE
            <ButtonArrow />
          </Link>
        </div>
      </section>

      {/* ===== TOOLS ===== */}
      <section className="tools">
        {/* Tool 01: AI Strategic Advisor */}
        <div className="tool-card rv">
          <div className="tool-card-img">
            <BrowserFrame
              video="/videos/advisor-demo.mp4"
              src="/images/platform/advisor-flywheel.png"
              alt="AI Strategic Advisor — personalized flywheel diagram"
            />
          </div>
          <div className="tool-card-content">
            <span className="tool-card-lbl">[01] AI STRATEGIC ADVISOR</span>
            <h3 className="tool-card-title">
              Personalized strategic guidance
            </h3>
            <p className="tool-card-desc">
              A conversational advisor grounded in 35 deal structures and 70+
              case studies. Ask about specific deal terms, negotiation
              strategies, or ownership transitions &mdash; and get answers
              informed by real creative economy data, not generic business
              advice.
            </p>
            <ul className="tool-card-features">
              <li>Deal structure recommendations based on your stage</li>
              <li>Negotiation scripts and pushback language</li>
              <li>Career positioning and transition planning</li>
              <li>Structure-specific guidance with real examples</li>
            </ul>
          </div>
        </div>

        {/* Tool 02: Deal Evaluator */}
        <div className="tool-card rv">
          <div className="tool-card-img">
            <BrowserFrame
              video="/videos/evaluator-demo.mp4"
              src="/images/platform/deal-evaluator.png"
              alt="Deal Evaluator — score and analyze any deal"
            />
          </div>
          <div className="tool-card-content">
            <span className="tool-card-lbl">[02] DEAL EVALUATOR</span>
            <h3 className="tool-card-title">
              Score and analyze any deal
            </h3>
            <p className="tool-card-desc">
              Multi-dimensional assessment across financial terms, risk
              exposure, leverage position, and alignment with your career
              stage. Get a structured verdict with specific recommendations
              before you sign.
            </p>
            <ul className="tool-card-features">
              <li>Financial terms analysis and benchmarking</li>
              <li>Risk and leverage scoring</li>
              <li>Red flag detection and protective clauses</li>
              <li>Stage-appropriate deal comparison</li>
            </ul>
          </div>
        </div>

        {/* Tool 03: Career Assessment */}
        <div className="tool-card rv">
          <div className="tool-card-img">
            <BrowserFrame
              video="/videos/assessment-demo.mp4"
              src="/images/platform/career-assessment.png"
              alt="Career Assessment — map your position"
            />
          </div>
          <div className="tool-card-content">
            <span className="tool-card-lbl">[03] CAREER ASSESSMENT</span>
            <h3 className="tool-card-title">
              Map your position in the progression
            </h3>
            <p className="tool-card-desc">
              Structured assessment across the four-stage progression from
              execution to ownership. Identifies your current stage, creative
              mode, and the specific structures most relevant to where you are
              and where you&apos;re heading.
            </p>
            <ul className="tool-card-features">
              <li>Four-stage progression mapping</li>
              <li>Creative mode identification</li>
              <li>Custom strategic roadmap</li>
              <li>Structure recommendations by stage</li>
            </ul>
          </div>
        </div>

        {/* Tool 04: Asset Inventory */}
        <div className="tool-card rv">
          <div className="tool-card-img">
            <BrowserFrame
              video="/videos/inventory-demo.mp4"
              src="/images/platform/asset-inventory.png"
              alt="Asset Inventory — track and value creative assets"
            />
          </div>
          <div className="tool-card-content">
            <span className="tool-card-lbl">[04] ASSET INVENTORY</span>
            <h3 className="tool-card-title">
              Track and value your creative assets
            </h3>
            <p className="tool-card-desc">
              Catalog your IP, revenue streams, and ownership positions in one
              view. Understand what you own, what it&apos;s worth, and how
              your portfolio of assets is compounding &mdash; or where the
              gaps are.
            </p>
            <ul className="tool-card-features">
              <li>IP and ownership position tracking</li>
              <li>Revenue stream cataloging</li>
              <li>Portfolio valuation overview</li>
              <li>Gap analysis and opportunity identification</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ===== PRICING OVERVIEW ===== */}
      <section className="tier-cta">
        <div className="tier-cta-container rv">
          <div className="tier-cta-left">
            <span className="tier-cta-lbl">[MEMBERSHIP]</span>
            <h2 className="tier-cta-title">
              Two ways
              <br />
              to get in.
            </h2>
            <p className="tier-cta-desc">
              Start with the library for the research, structures, and case
              studies. Upgrade to Full Access when you&apos;re ready for
              AI-powered tools and personalized strategic guidance.
            </p>
          </div>
          <div className="tier-cta-right">
            <div className="tier-card">
              <span className="tier-card-label">Library</span>
              <div className="tier-card-price">
                <span className="tier-card-val">$12</span>
                <span className="tier-card-term">/ year</span>
              </div>
              <p className="tier-card-desc">
                Full access to every structure, case study, and framework in
                the library.
              </p>
              <Link href="/signup?plan=library" className="btn">
                GET STARTED
                <ButtonArrow />
              </Link>
            </div>
            <div className="tier-card tier-card--full">
              <div className="tier-card-header">
                <span className="tier-card-label">Full Access</span>
                <span className="tier-card-badge">INCLUDES TOOLS</span>
              </div>
              <div className="tier-card-price">
                <span className="tier-card-val">$19</span>
                <span className="tier-card-term">/ month</span>
              </div>
              <p className="tier-card-desc">
                Everything in Library plus AI Strategic Advisor, Deal
                Evaluator, Career Assessment, and Asset Inventory.
              </p>
              <Link href="/signup?plan=full_access" className="btn">
                GET FULL ACCESS
                <ButtonArrow />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== THE LIBRARY ===== */}
      <section className="structures" id="structures">
        <div className="structures-head">
          <h2 className="anim-text-up">The Library</h2>
        </div>
        <div className="structures-intro">
          <div className="structures-intro-grid">
            <p className="structures-intro-text rv">
              <strong>35 deal structures</strong> &mdash; business models and
              compensation mechanisms &mdash; for creative professionals
              shifting from time-based to outcome-based value capture. Each
              includes templates, case studies, negotiation guidance, and
              decision checklists.
            </p>
          </div>
        </div>

        {/* Metrics */}
        <div className="plat-lib-metrics rv">
          <div className="lib-metric">
            <span className="lib-metric-val">35+</span>
            <span className="lib-metric-lbl">DEAL STRUCTURES</span>
          </div>
          <div className="lib-metric">
            <span className="lib-metric-val">70+</span>
            <span className="lib-metric-lbl">CASE STUDIES</span>
          </div>
          <div className="lib-metric">
            <span className="lib-metric-val">20K+</span>
            <span className="lib-metric-lbl">MILES OF RESEARCH</span>
          </div>
          <div className="lib-metric">
            <span className="lib-metric-val">&infin;</span>
            <span className="lib-metric-lbl">AND GROWING</span>
          </div>
        </div>

        <div className="plat-structures-wrap">
          <StructuresTable models={models} deals={deals} />
        </div>

        {/* Gate callout */}
        <div className="structures-gate rv">
          <div className="structures-gate-left">
            <span className="structures-gate-headline">
              Every structure.
              <br />
              Everything you need
              <br />
              to use it.
            </span>
            <p className="structures-gate-desc">
              <strong>$12 per year</strong> for the full library &mdash; every
              structure with the depth you need to actually negotiate, protect
              yourself, and capture value. New structures and case studies added
              weekly.
            </p>
            <div
              className="structures-gate-cta"
              style={{ display: "flex", alignItems: "center", gap: "16px" }}
            >
              <Link href="/signup" className="btn btn--white">
                SIGN UP &mdash; $12/YEAR
                <ButtonArrow />
              </Link>
              <Link
                href="/structures/hybrid-fee-backend"
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "10px",
                  letterSpacing: ".1em",
                  textTransform: "uppercase" as const,
                  color: "rgba(255,255,255,.5)",
                }}
              >
                VIEW EXAMPLE STRUCTURE &rarr;
              </Link>
            </div>
          </div>
          <div className="structures-gate-right">
            <div className="structures-gate-feature">
              <span className="structures-gate-feature-title">
                Negotiation Tactics
              </span>
              <span className="structures-gate-feature-desc">
                Anchoring techniques, walk-away alternatives, phased commitment
                strategies, and specific pushback scripts.
              </span>
            </div>
            <div className="structures-gate-feature">
              <span className="structures-gate-feature-title">
                Common Manipulations
              </span>
              <span className="structures-gate-feature-desc">
                Hollywood accounting, overhead allocation abuse, dilution
                without protection, net vs. gross gaming, and rights creep.
              </span>
            </div>
            <div className="structures-gate-feature">
              <span className="structures-gate-feature-title">
                Decision Checklists
              </span>
              <span className="structures-gate-feature-desc">
                Financial readiness, career positioning, project quality, deal
                structure quality, and risk tolerance scoring.
              </span>
            </div>
            <div className="structures-gate-feature">
              <span className="structures-gate-feature-title">
                Real-World Case Studies
              </span>
              <span className="structures-gate-feature-desc">
                2&ndash;4 case studies per structure mapping deal terms,
                financial outcomes, and transferable lessons.
              </span>
            </div>
            <div className="structures-gate-feature">
              <span className="structures-gate-feature-title">
                Protective Mechanisms
              </span>
              <span className="structures-gate-feature-desc">
                Audit rights, acceleration clauses, termination provisions, and
                anti-dilution protections.
              </span>
            </div>
            <div className="structures-gate-feature">
              <span className="structures-gate-feature-title">
                Value Calculations
              </span>
              <span className="structures-gate-feature-desc">
                Real numbers showing expected returns, break-even timelines, and
                compensation modeling by structure.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CASE STUDIES ===== */}
      <section className="cases" id="case-studies">
        <div className="cases-head">
          <h2 className="anim-text-up">Case Studies</h2>
        </div>
        <div className="cases-intro">
          <div className="cases-intro-grid">
            <p className="cases-intro-text rv">
              <strong>70+ case studies</strong> mapping how creative
              professionals structured deals, captured value, and built
              ownership &mdash; from independent musicians to billion-dollar
              holding companies. Each study documents the specific terms, the
              strategic reasoning, and the transferable lessons.
            </p>
          </div>
        </div>

        <div className="cases-grid">
          {caseStudies.map((cs, i) => (
            <Link
              key={cs.slug}
              href={`/case-studies/${cs.slug}`}
              className={`case-card rv${i > 0 ? ` rv-d${i}` : ""}`}
              style={{
                backgroundImage: cs.coverImage
                  ? `url('${cs.coverImage}')`
                  : undefined,
              }}
            >
              <span className="case-lbl">
                [CASE {String(cs.number).padStart(2, "0")}]
              </span>
              <span className="case-name">{stripBr(cs.title)}</span>
              <span className="case-discipline">{cs.discipline}</span>
              <p className="case-desc">{cs.excerpt}</p>
              <div className="case-bottom">
                <span className="case-structures">
                  STRUCTURES{" "}
                  {cs.structures.map((n) => `#${n}`).join(", ")}
                </span>
                <span className="case-link">READ &rarr;</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Cases gate callout */}
        <div className="cases-gate rv rv-d4">
          <div className="cases-gate-left">
            <span className="cases-gate-headline">
              Real deals.
              <br />
              Real terms.
              <br />
              Real outcomes.
            </span>
            <p className="cases-gate-desc">
              <strong>70+ case studies &mdash; and growing.</strong> Each one
              documents the actual deal structure, the strategic reasoning
              behind it, and the financial outcomes. Not theory. Not
              inspiration. The specific mechanics of how creative professionals
              captured value.
            </p>
            <div className="cases-gate-cta">
              <Link href="/signup" className="btn btn--white">
                SEE ALL CASE STUDIES
                <ButtonArrow />
              </Link>
            </div>
          </div>
          <div className="cases-gate-right">
            <div className="cases-gate-feature">
              <span className="cases-gate-feature-title">
                Actual Deal Terms
              </span>
              <span className="cases-gate-feature-desc">
                Equity splits, revenue percentages, vesting schedules, and
                compensation structures &mdash; not vague summaries.
              </span>
            </div>
            <div className="cases-gate-feature">
              <span className="cases-gate-feature-title">
                Financial Outcomes
              </span>
              <span className="cases-gate-feature-desc">
                What the deal was worth. ROI timelines. How value compounded or
                didn&apos;t. The numbers that matter.
              </span>
            </div>
            <div className="cases-gate-feature">
              <span className="cases-gate-feature-title">
                Multiple Disciplines
              </span>
              <span className="cases-gate-feature-desc">
                Music, film, design, fashion, publishing, tech. Emerging and
                established. The patterns cross industries.
              </span>
            </div>
            <div className="cases-gate-feature">
              <span className="cases-gate-feature-title">
                Transferable Lessons
              </span>
              <span className="cases-gate-feature-desc">
                What to replicate. What to avoid. The leverage points and timing
                that made each deal work &mdash; or not.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== COMING SOON ===== */}
      <section className="coming">
        <div className="coming-head">
          <h2 className="anim-text-up">Building</h2>
        </div>
        <div className="coming-intro">
          <div className="coming-intro-grid">
            <p className="coming-intro-text rv">
              <strong>The platform keeps expanding.</strong> Next up &mdash; a
              community of creative professionals doing the work of
              restructuring their economics together, and structured
              masterclasses on advanced deal strategies.
            </p>
          </div>
        </div>
        <div className="coming-grid">
          <div className="coming-card rv">
            <div className="coming-icon">
              <svg
                viewBox="0 0 65 65"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              >
                <circle cx="32.5" cy="20" r="8" />
                <circle cx="16" cy="42" r="8" />
                <circle cx="49" cy="42" r="8" />
                <line x1="27" y1="26" x2="20" y2="36" />
                <line x1="38" y1="26" x2="45" y2="36" />
                <line x1="24" y1="42" x2="41" y2="42" />
              </svg>
            </div>
            <span className="coming-lbl">[COMMUNITY]</span>
            <span className="coming-title">Membership Community</span>
            <p className="coming-desc">
              A private space for creative professionals navigating the
              restructuring. Deal reviews, peer advisory, and structured
              accountability.
            </p>
            <span className="coming-status">COMING Q3 2026</span>
          </div>
          <div className="coming-card rv rv-d1">
            <div className="coming-icon">
              <svg
                viewBox="0 0 65 65"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              >
                <rect x="8" y="12" width="49" height="38" rx="2" />
                <line x1="8" y1="22" x2="57" y2="22" />
                <circle cx="20" cy="36" r="5" />
                <circle cx="32.5" cy="36" r="5" />
                <circle cx="45" cy="36" r="5" />
              </svg>
            </div>
            <span className="coming-lbl">[LEARNING]</span>
            <span className="coming-title">Masterclasses</span>
            <p className="coming-desc">
              Cohort-based deep dives on advanced deal structures, negotiation
              tactics, and ownership transitions. Small groups, real deals,
              expert facilitation.
            </p>
            <span className="coming-status">COMING Q4 2026</span>
          </div>
        </div>
      </section>

      {/* ===== ACCESS CTA ===== */}
      <section className="access">
        <div className="access-grid">
          <div className="access-content">
            <span className="access-lbl rv">FULL ACCESS &mdash; $19/MO</span>
            <h2 className="access-title anim-text-up">
              Get In
              <br />
              Sequence
            </h2>
            <p className="access-desc rv rv-d1">
              <strong>
                An AI advisor that knows 35 deal structures by heart.
              </strong>{" "}
              Score any deal before you sign. Map your position in the
              progression. Track your creative assets as they compound. The
              full platform &mdash; strategic tools plus the entire library.
            </p>
            <div className="access-buttons rv rv-d2">
              <Link href="/signup?plan=full_access" className="btn btn--white">
                GET FULL ACCESS &mdash; $19/MO
                <ButtonArrow />
              </Link>
            </div>
          </div>
          <div className="access-right rv rv-d3">
            <div className="access-feature">
              <span className="access-feature-num">[01]</span>
              <span className="access-feature-text">
                <strong>AI Strategic Advisor</strong> &mdash; personalized
                deal guidance
              </span>
            </div>
            <div className="access-feature">
              <span className="access-feature-num">[02]</span>
              <span className="access-feature-text">
                <strong>Deal Evaluator</strong> &mdash; score and analyze any
                deal
              </span>
            </div>
            <div className="access-feature">
              <span className="access-feature-num">[03]</span>
              <span className="access-feature-text">
                <strong>Career Assessment</strong> with custom roadmap
              </span>
            </div>
            <div className="access-feature">
              <span className="access-feature-num">[04]</span>
              <span className="access-feature-text">
                <strong>Asset Inventory</strong> tracking and valuation
              </span>
            </div>
            <div className="access-feature">
              <span className="access-feature-num">[05]</span>
              <span className="access-feature-text">
                <strong>35+ deal structures</strong> and 70+ case studies
              </span>
            </div>
            <div className="access-feature">
              <span className="access-feature-num">[06]</span>
              <span className="access-feature-text">
                <strong>New content weekly</strong> &mdash; the platform keeps
                growing
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <TestimonialsCarousel testimonials={testimonials} />

      {/* ===== NEWSLETTER ===== */}
      <section className="newsletter">
        <div className="newsletter-bg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.pexels.com/photos/33578118/pexels-photo-33578118.jpeg"
            alt=""
          />
        </div>
        <div className="newsletter-grid">
          <div className="newsletter-title-col anim-text-up">
            <h2
              style={{
                color: "var(--white)",
                fontSize: "clamp(44px, 7vw, 84px)",
              }}
            >
              Insights in Your Inbox
            </h2>
          </div>
          <div className="newsletter-text-col rv rv-d1">
            <p className="newsletter-p">
              Updates on the restructuring. Emerging trends, new structures,
              and opportunities for creative professionals building ownership.
            </p>
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  );
}
