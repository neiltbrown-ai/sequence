import Link from "next/link";
import type { Metadata } from "next";
import ButtonArrow from "@/components/ui/button-arrow";
import BrowserFrame from "@/components/ui/browser-frame";
import NewsletterForm from "@/components/newsletter-form";
import TestimonialsCarousel from "@/components/testimonials-carousel";
import { getTestimonials } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Platform",
};

export default function PlatformPage() {
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
                Transform your portfolio of projects into a portfolio of assets.
              </strong>{" "}
              Understand the economic value of your creativity &mdash; value
              your assets, score any deal, map your progression, and get
              personalized strategic guidance built on 35 structures and 70+
              case studies.
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
        {/* Tool 01: Portfolio / Assets */}
        <div className="tool-card rv">
          <div className="tool-card-img">
            <BrowserFrame
              video="/videos/inventory-demo.mp4"
              src="/images/platform/asset-inventory.png"
              alt="Portfolio — value your creative assets"
            />
          </div>
          <div className="tool-card-content">
            <span className="tool-card-lbl">[01] PORTFOLIO</span>
            <h3 className="tool-card-title">
              Value your creative assets
            </h3>
            <p className="tool-card-desc">
              Catalog your IP, revenue streams, and ownership positions in one
              view. Understand what you own, what it&apos;s worth, and how
              your portfolio of assets is compounding &mdash; or where the
              gaps are. AI-powered valuations and leverage scenarios.
            </p>
            <ul className="tool-card-features">
              <li>IP and ownership position tracking</li>
              <li>Revenue stream cataloging</li>
              <li>AI-powered portfolio valuation</li>
              <li>Gap analysis and opportunity identification</li>
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
              Analyze and score any deal
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

        {/* Tool 03: Roadmap */}
        <div className="tool-card rv">
          <div className="tool-card-img">
            <BrowserFrame
              video="/videos/assessment-demo.mp4"
              src="/images/platform/career-assessment.png"
              alt="Roadmap — map your position in the progression"
            />
          </div>
          <div className="tool-card-content">
            <span className="tool-card-lbl">[03] ROADMAP</span>
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

        {/* Tool 04: AI Advisor */}
        <div className="tool-card rv">
          <div className="tool-card-img">
            <BrowserFrame
              video="/videos/advisor-demo.mp4"
              src="/images/platform/advisor-flywheel.png"
              alt="AI Advisor — personalized strategic guidance"
            />
          </div>
          <div className="tool-card-content">
            <span className="tool-card-lbl">[04] AI ADVISOR</span>
            <h3 className="tool-card-title">
              Personalized strategic guidance
            </h3>
            <p className="tool-card-desc">
              A strategic advisor trained on your portfolio, 35 deal structures,
              and 70+ case studies. Ask about specific deal terms, negotiation
              strategies, or ownership transitions &mdash; and get answers
              specific to your creative work, your stage, and your assets. Not
              generic business advice.
            </p>
            <ul className="tool-card-features">
              <li>Guidance specific to your portfolio and stage</li>
              <li>Negotiation scripts and pushback language</li>
              <li>Career positioning and transition planning</li>
              <li>Structure-specific guidance with real examples</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ===== PRICING OVERVIEW — hidden temporarily ===== */}
      {false && (
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
      )}

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
                Transform your portfolio of projects into a portfolio of assets.
              </strong>{" "}
              Value your creative work, score any deal before you sign, map your
              position in the progression, and get strategic guidance built on
              real creative economy data.
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
                <strong>Portfolio</strong> &mdash; value your creative assets
              </span>
            </div>
            <div className="access-feature">
              <span className="access-feature-num">[02]</span>
              <span className="access-feature-text">
                <strong>Deal Evaluator</strong> &mdash; analyze and score any
                deal
              </span>
            </div>
            <div className="access-feature">
              <span className="access-feature-num">[03]</span>
              <span className="access-feature-text">
                <strong>Roadmap</strong> &mdash; map your position in the
                progression
              </span>
            </div>
            <div className="access-feature">
              <span className="access-feature-num">[04]</span>
              <span className="access-feature-text">
                <strong>AI Advisor</strong> &mdash; personalized strategic
                guidance
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
                <strong>New content regularly</strong> &mdash; the platform
                keeps growing
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
              Issues go out when there&apos;s something worth saying &mdash; no
              fixed cadence. Expect deal structures, case studies, and patterns
              in how creative value is shifting.
            </p>
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  );
}
