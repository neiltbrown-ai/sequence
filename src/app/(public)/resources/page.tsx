import Link from "next/link";
import type { Metadata } from "next";
import ButtonArrow from "@/components/ui/button-arrow";
import NewsletterForm from "@/components/newsletter-form";
import StructuresTable from "@/components/structures-table";
import TestimonialsCarousel from "@/components/testimonials-carousel";

export const metadata: Metadata = {
  title: "Resources \u2014 In Sequence",
};

export default function ResourcesPage() {
  return (
    <>
      {/* ===== HERO -- THE LIBRARY ===== */}
      <section className="lib-hero">
        <div className="lib-hero-title">
          <h1 className="anim-text-up">The Library</h1>
        </div>
        <div className="lib-hero-sub">
          <div className="lib-hero-sub-grid">
            <p className="lib-hero-desc rv">
              <strong>Research, structures, and case studies</strong> for
              creative professionals navigating the restructuring of the
              creative economy. The library grows every week. Membership is $89
              per year.
            </p>
          </div>
        </div>
        <div className="lib-hero-metrics">
          <div className="lib-metric rv">
            <span className="lib-metric-val">35+</span>
            <span className="lib-metric-lbl">DEAL STRUCTURES</span>
          </div>
          <div className="lib-metric rv rv-d1">
            <span className="lib-metric-val">37+</span>
            <span className="lib-metric-lbl">CASE STUDIES</span>
          </div>
          <div className="lib-metric rv rv-d2">
            <span className="lib-metric-val">20K+</span>
            <span className="lib-metric-lbl">MILES OF RESEARCH</span>
          </div>
          <div className="lib-metric rv rv-d3">
            <span className="lib-metric-val">&infin;</span>
            <span className="lib-metric-lbl">AND GROWING</span>
          </div>
        </div>
        <div className="lib-hero-cta rv rv-d4">
          <Link href="/pricing" className="btn">
            GET IN SEQUENCE
            <ButtonArrow />
          </Link>
        </div>
      </section>

      {/* ===== PLATFORM CALLOUT ===== */}
      <section className="platform">
        <div className="platform-grid">
          <div className="platform-img rv">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://placehold.co/800x480/1a1a1a/333?text=Platform+Dashboard"
              alt="In Sequence Platform"
            />
          </div>
          <div className="platform-content">
            <span className="platform-lbl rv">IN SEQUENCE / THE PLATFORM</span>
            <h2 className="platform-title anim-text-up">
              The structures
              <br />
              that change your
              <br />
              economics.
            </h2>
            <p className="platform-desc rv rv-d1">
              <strong>
                35 deal structures. 37 case studies. Decision checklists.
                Negotiation scripts.
              </strong>{" "}
              A research-backed library built for creative professionals who are
              done trading time for money &mdash; with new structures, case
              studies, and tools added every week.
            </p>
            <div className="platform-price rv rv-d2">
              <span className="platform-price-val">$89</span>
              <span className="platform-price-term">/ YEAR</span>
            </div>
            <div className="platform-buttons rv rv-d3">
              <Link href="/signup" className="btn btn--white">
                SIGN UP &mdash; $89/YEAR
                <ButtonArrow />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STRUCTURES -- SCROLLABLE TABLE WITH TABS ===== */}
      <section className="structures" id="structures">
        <div className="structures-head">
          <h2 className="anim-text-up">Structures</h2>
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

        <StructuresTable />

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
              <strong>$89 per year</strong> for the full library &mdash; every
              structure with the depth you need to actually negotiate, protect
              yourself, and capture value. New structures and case studies added
              weekly.
            </p>
            <div
              className="structures-gate-cta"
              style={{ display: "flex", alignItems: "center", gap: "16px" }}
            >
              <Link href="/signup" className="btn btn--white">
                SIGN UP &mdash; $89/YEAR
                <ButtonArrow />
              </Link>
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "10px",
                  letterSpacing: ".1em",
                  textTransform: "uppercase" as const,
                  color: "rgba(255,255,255,.5)",
                }}
              >
                VIEW EXAMPLE STRUCTURE &rarr;
              </span>
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

      {/* ===== CASE STUDIES -- ASYMMETRIC DARK CARDS ===== */}
      <section className="cases" id="case-studies">
        <div className="cases-head">
          <h2 className="anim-text-up">Case Studies</h2>
        </div>
        <div className="cases-intro">
          <div className="cases-intro-grid">
            <p className="cases-intro-text rv">
              <strong>37 case studies</strong> mapping how creative
              professionals structured deals, captured value, and built
              ownership &mdash; from independent musicians to billion-dollar
              holding companies. Each study documents the specific terms, the
              strategic reasoning, and the transferable lessons.
            </p>
          </div>
        </div>

        <div className="cases-grid">
          <a
            href="#"
            className="case-card rv"
            style={{
              backgroundImage:
                "url('https://placehold.co/800x600/1a1a1a/333?text=A24')",
            }}
          >
            <span className="case-lbl">[CASE 01]</span>
            <span className="case-name">A24</span>
            <span className="case-discipline">Film / Production</span>
            <p className="case-desc">
              From indie distributor to cultural institution. Constraint-based
              production, profit participation, and catalog value that rewrote
              how independent film captures returns.
            </p>
            <div className="case-bottom">
              <span className="case-structures">STRUCTURES #13, #9, #14</span>
              <span className="case-link">READ &rarr;</span>
            </div>
          </a>
          <a
            href="#"
            className="case-card rv rv-d1"
            style={{
              backgroundImage:
                "url('https://placehold.co/800x600/1a1a1a/333?text=Virgil+Abloh')",
            }}
          >
            <span className="case-lbl">[CASE 02]</span>
            <span className="case-name">Virgil Abloh</span>
            <span className="case-discipline">Fashion / Design</span>
            <p className="case-desc">
              Off-White to Louis Vuitton. Building a $500M brand through
              co-creation joint ventures, product partnerships, and a holding
              company that transcended any single role.
            </p>
            <div className="case-bottom">
              <span className="case-structures">STRUCTURES #5, #9, #11</span>
              <span className="case-link">READ &rarr;</span>
            </div>
          </a>
          <a
            href="#"
            className="case-card rv rv-d2"
            style={{
              backgroundImage:
                "url('https://placehold.co/800x600/1a1a1a/333?text=Temi+Coker')",
            }}
          >
            <span className="case-lbl">[CASE 03]</span>
            <span className="case-name">Temi Coker</span>
            <span className="case-discipline">Design / Product</span>
            <p className="case-desc">
              From freelance designer to Apple, Adobe, and Google
              collaborations. Product partnerships and licensing deals that
              turned a personal aesthetic into scalable IP.
            </p>
            <div className="case-bottom">
              <span className="case-structures">
                STRUCTURES #6, #27, #28
              </span>
              <span className="case-link">READ &rarr;</span>
            </div>
          </a>
          <a
            href="#"
            className="case-card rv rv-d3"
            style={{
              backgroundImage:
                "url('https://placehold.co/800x600/1a1a1a/333?text=Tash+Sultana')",
            }}
          >
            <span className="case-lbl">[CASE 04]</span>
            <span className="case-name">Tash Sultana</span>
            <span className="case-discipline">Music</span>
            <p className="case-desc">
              Self-produced, self-managed, self-owned. From bedroom loops to
              arena tours and a label &mdash; retaining master rights and
              building a catalog with full creative and financial control.
            </p>
            <div className="case-bottom">
              <span className="case-structures">
                STRUCTURES #1, #25, #30
              </span>
              <span className="case-link">READ &rarr;</span>
            </div>
          </a>
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
              <strong>37 case studies &mdash; and growing.</strong> Each one
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

      {/* ===== MORE COMING -- FORWARD-LOOKING ===== */}
      <section className="coming">
        <div className="coming-head">
          <h2 className="anim-text-up">Building</h2>
        </div>
        <div className="coming-intro">
          <div className="coming-intro-grid">
            <p className="coming-intro-text rv">
              <strong>The library is the foundation.</strong> What&apos;s coming
              next turns knowledge into action &mdash; tactical playbooks,
              interactive tools, competitive advantage research, and a community
              of creative professionals doing the work of restructuring their
              economics together.
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
                <rect x="8" y="12" width="49" height="38" rx="2" />
                <line x1="8" y1="22" x2="57" y2="22" />
                <line x1="18" y1="30" x2="40" y2="30" />
                <line x1="18" y1="37" x2="47" y2="37" />
                <line x1="18" y1="44" x2="33" y2="44" />
              </svg>
            </div>
            <span className="coming-lbl">[PLAYBOOKS]</span>
            <span className="coming-title">90-Day Tactical Plans</span>
            <p className="coming-desc">
              Step-by-step playbooks for creatives, investors, and
              organizations. Stage-specific. Actionable within 90 days.
            </p>
            <span className="coming-status">COMING Q2 2026</span>
          </div>
          <div className="coming-card rv rv-d1">
            <div className="coming-icon">
              <svg
                viewBox="0 0 65 65"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              >
                <circle cx="32.5" cy="32.5" r="22" />
                <line x1="32.5" y1="18" x2="32.5" y2="32.5" />
                <line x1="32.5" y1="32.5" x2="44" y2="38" />
                <circle cx="32.5" cy="32.5" r="3" />
                <line x1="14" y1="52" x2="22" y2="52" />
                <line x1="43" y1="52" x2="51" y2="52" />
              </svg>
            </div>
            <span className="coming-lbl">[TOOLS]</span>
            <span className="coming-title">Decision Frameworks</span>
            <p className="coming-desc">
              Interactive checklists and calculators for evaluating deals,
              assessing career stage, and modeling compensation structures.
            </p>
            <span className="coming-status">COMING Q2 2026</span>
          </div>
          <div className="coming-card rv rv-d2">
            <div className="coming-icon">
              <svg
                viewBox="0 0 65 65"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              >
                <path d="M12 50 L22 28 L32.5 38 L42 15 L53 30" />
                <circle cx="42" cy="15" r="3" />
                <line x1="12" y1="54" x2="53" y2="54" />
                <line x1="12" y1="54" x2="12" y2="12" />
              </svg>
            </div>
            <span className="coming-lbl">[COMPETITIVE ADVANTAGES]</span>
            <span className="coming-title">
              Strategic Moats for Creatives
            </span>
            <p className="coming-desc">
              Research on the advantages that compound &mdash; taste, network
              effects, switching costs, and other durable edges in creative
              work.
            </p>
            <span className="coming-status">COMING Q3 2026</span>
          </div>
          <div className="coming-card rv rv-d3">
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
            <span className="coming-title">In Sequence Community</span>
            <p className="coming-desc">
              A private space for creative professionals navigating the
              restructuring. Deal reviews, peer advisory, and structured
              accountability.
            </p>
            <span className="coming-status">COMING Q3 2026</span>
          </div>
        </div>
      </section>

      {/* ===== ACCESS CTA -- THE CONVERSION SECTION ===== */}
      <section className="access">
        <div className="access-grid">
          <div className="access-content">
            <span className="access-lbl rv">FULL LIBRARY ACCESS</span>
            <h2 className="access-title anim-text-up">
              Get In
              <br />
              Sequence
            </h2>
            <p className="access-desc rv rv-d1">
              <strong>$89 per year.</strong> Every structure, case study, and
              framework &mdash; plus new content added weekly. The library
              grows. You grow with it.
            </p>
            <div className="access-buttons rv rv-d2">
              <Link href="/signup" className="btn btn--white">
                SIGN UP &mdash; $89/YEAR
                <ButtonArrow />
              </Link>
            </div>
          </div>
          <div className="access-right rv rv-d3">
            <div className="access-feature">
              <span className="access-feature-num">[01]</span>
              <span className="access-feature-text">
                <strong>35+ deal structures</strong> with templates and guidance
              </span>
            </div>
            <div className="access-feature">
              <span className="access-feature-num">[02]</span>
              <span className="access-feature-text">
                <strong>37+ case studies</strong> across disciplines
              </span>
            </div>
            <div className="access-feature">
              <span className="access-feature-num">[03]</span>
              <span className="access-feature-text">
                <strong>Decision checklists</strong> for every structure
              </span>
            </div>
            <div className="access-feature">
              <span className="access-feature-num">[04]</span>
              <span className="access-feature-text">
                <strong>Negotiation scripts</strong> and pushback language
              </span>
            </div>
            <div className="access-feature">
              <span className="access-feature-num">[05]</span>
              <span className="access-feature-text">
                <strong>Four-stage progression</strong> framework
              </span>
            </div>
            <div className="access-feature">
              <span className="access-feature-num">[06]</span>
              <span className="access-feature-text">
                <strong>New content weekly</strong> &mdash; the library keeps
                growing
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS CAROUSEL ===== */}
      <TestimonialsCarousel />

      {/* ===== BOOK CALLOUT ===== */}
      <section className="book">
        <div className="book-grid">
          <div className="book-img rv">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://framerusercontent.com/images/zuq4iDlcKXpR8Kx3yWfaexbxrBs.jpg?width=2400&height=3600"
              alt="In Sequence — The Book"
            />
          </div>
          <div className="book-content">
            <span className="book-lbl rv">IN SEQUENCE / THE BOOK</span>
            <h2 className="book-title anim-text-up">In Sequence</h2>
            <p className="book-desc rv rv-d1">
              <strong>The creative economy is restructuring.</strong> This book
              maps the forces reshaping creative value, provides 35 deal
              structures for capturing it, and lays out a four-stage progression
              from execution to ownership.
            </p>
            <div className="book-buttons rv rv-d2">
              <Link href="#" className="btn btn--white">
                DOWNLOAD BOOK
                <ButtonArrow />
              </Link>
              <Link href="#" className="btn btn--white">
                AUDIOBOOK
                <ButtonArrow />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== NEWSLETTER ===== */}
      <section className="newsletter">
        <div className="newsletter-bg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://framerusercontent.com/images/UmfC1Xw7ephKTN4uul1c2ojX4JY.jpg"
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
              Get In Sequence
            </h2>
          </div>
          <div className="newsletter-text-col rv rv-d1">
            <p className="newsletter-p">
              One structure per week. Case studies, frameworks, and the deals
              that change creative economics.{" "}
              <strong>The library keeps growing.</strong>
            </p>
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  );
}
