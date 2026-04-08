import Link from "next/link";
import type { Metadata } from "next";
import ButtonArrow from "@/components/ui/button-arrow";
import NewsletterForm from "@/components/newsletter-form";

export const metadata: Metadata = {
  title: "In Sequence — Own What You Build",
};

export default function HomePage() {
  return (
    <>
      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="g8 hero-grid">
          <div className="hero-title-cell">
            <h1 className="hero-title anim-text-up">
              Sequence<sup>&copy;</sup>
            </h1>
            <p className="hero-subtitle rv">
              <strong>Own your future.</strong> Transform your portfolio of
              projects into a portfolio of assets.
            </p>
          </div>
          <div className="hero-portrait-cell">
            <div className="hero-year-tag rv">/26</div>
            <div className="anim-reveal-down">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="hero-portrait"
                src="/images/hero-portrait.png"
                alt="Abstract circles"
              />
            </div>
          </div>
          <div className="hero-meta-cell rv rv-d2">
            <span className="hero-intro-tag">[INTRO]</span>
            <p className="hero-desc">
              The creative economy is restructuring. Production commoditizes.
              Discernment becomes scarce. Capital follows scarcity. Design the
              sequence for your transition and future.
            </p>
            <div className="hero-subscribe">
              <Link href="/pricing" className="btn">
                GET IN SEQUENCE
                <ButtonArrow />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== THESIS CALLOUT — 50X ===== */}
      <section className="callout">
        <div className="callout-grid">
          <span className="callout-label rv">
            THESIS / VALUE OF CREATIVE VISION
          </span>
          <div className="callout-number anim-text-up">50X</div>
          <p className="callout-text rv rv-d1">
            The difference between a{" "}
            <strong>portfolio of projects vs a portfolio of assets</strong> is
            simply the deal structure. Not talent. Not effort. Not your network.
            It is the deal structure — one that is not a work-for-hire agreement.
          </p>
        </div>
      </section>

      {/* ===== INTRODUCTION ===== */}
      <section className="intro">
        <div className="intro-head">
          <h2 className="anim-text-up">Introduction</h2>
        </div>
        <div className="intro-body-grid">
          <span className="intro-lbl rv">[ABOUT]</span>
          <div className="intro-txt rv rv-d1">
            <p>
              <strong>The creative economy is restructuring.</strong> AI
              commoditizes execution, revealing that the real value was never in
              production — it was in vision, taste, and judgment. Creative output
              is becoming an investable asset class. Capital is following that
              scarcity, shifting from hourly rates to ownership structures. Most
              creative professionals are on the wrong side of all three forces —
              generating massive value and capturing almost none of it.
            </p>
            <p>
              <strong>In Sequence maps the restructuring</strong> and provides
              the tools to navigate it. Case studies of creatives who changed
              their economics. A four-stage progression from execution to
              ownership. 35 deal structures — and counting — with the terms, the
              negotiation guidance, and the red flags for each. The research
              keeps growing. The library keeps expanding. Get in sequence.
            </p>
          </div>
          <div className="intro-btn rv rv-d2">
            <Link href="/platform" className="btn">
              LEARN MORE
              <ButtonArrow />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== THE THREE FORCES ===== */}
      <section className="forces">
        <div className="forces-visual rv">
          <svg className="forces-icon" viewBox="0 0 400 280" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Outer triangle — base spans full width with padding for dots */}
            <polygon points="200,30 10,270 390,270" fill="var(--bg)" stroke="none" />
            <polygon points="200,30 10,270 390,270" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.15" />
            {/* Inner triangles — concentric */}
            <polygon points="200,75 70,240 330,240" stroke="currentColor" strokeWidth="0.75" fill="none" opacity="0.1" />
            <polygon points="200,120 130,210 270,210" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.08" />
            {/* Nodes at vertices */}
            <circle cx="200" cy="30" r="5" fill="currentColor" opacity="0.4" />
            <circle cx="10" cy="270" r="5" fill="currentColor" opacity="0.4" />
            <circle cx="390" cy="270" r="5" fill="currentColor" opacity="0.4" />
            {/* Center point */}
            <circle cx="200" cy="190" r="6" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5" />
            <circle cx="200" cy="190" r="2.5" fill="currentColor" opacity="0.4" />
            {/* Lines from center to vertices */}
            <line x1="200" y1="190" x2="200" y2="30" stroke="currentColor" strokeWidth="0.5" opacity="0.1" strokeDasharray="4 4" />
            <line x1="200" y1="190" x2="10" y2="270" stroke="currentColor" strokeWidth="0.5" opacity="0.1" strokeDasharray="4 4" />
            <line x1="200" y1="190" x2="390" y2="270" stroke="currentColor" strokeWidth="0.5" opacity="0.1" strokeDasharray="4 4" />
            {/* Labels */}
            <text x="200" y="20" textAnchor="middle" fill="currentColor" opacity="0.3" fontSize="8" fontFamily="var(--mono)" letterSpacing="0.1em">01</text>
            <text x="10" y="284" textAnchor="middle" fill="currentColor" opacity="0.3" fontSize="8" fontFamily="var(--mono)" letterSpacing="0.1em">02</text>
            <text x="390" y="284" textAnchor="middle" fill="currentColor" opacity="0.3" fontSize="8" fontFamily="var(--mono)" letterSpacing="0.1em">03</text>
          </svg>
        </div>
        <div className="forces-head">
          <h2 className="anim-text-up">The Three Forces</h2>
        </div>
        <div className="forces-intro">
          <div className="forces-intro-grid">
            <p className="forces-intro-text rv">
              <strong>Asymmetric advantage emerges</strong> when all three
              forces align: vision plus creative capacity plus ownership
              structure. Remove any element and returns collapse to linear.
              Combine all three and exponential becomes possible.
            </p>
          </div>
        </div>
        <div className="forces-grid">
          <div className="force rv">
            <span className="force-num">[01]</span>
            <span className="force-title">Creativity Financializes</span>
            <p className="force-desc">
              Creative output transforms from an expense line into an investable
              asset class. Music catalogs generate securities. Creators build
              billion-dollar holding companies. Private equity deploys $1.2
              trillion toward creative assets.
            </p>
          </div>
          <div className="force rv rv-d1">
            <span className="force-num">[02]</span>
            <span className="force-title">Vision Becomes Scarce</span>
            <p className="force-desc">
              AI commoditizes execution, revealing what was always valuable:
              judgment, taste, and the ability to see where culture moves before
              data confirms it. The 40–70x gap between median and top-tier
              creatives reflects vision, not skill.
            </p>
          </div>
          <div className="force rv rv-d2">
            <span className="force-num">[03]</span>
            <span className="force-title">Capital Restructures</span>
            <p className="force-desc">
              Value capture shifts from time-based to outcome-based
              compensation. Equity, profit participation, royalties, and
              licensing agreements tie compensation to value created — not time
              spent.
            </p>
          </div>
        </div>
      </section>

      {/* ===== PLATFORM CTA BANNER ===== */}
      <section className="platform-cta">
        <div className="platform-cta-grid">
          <div className="platform-cta-left">
            <span className="platform-cta-lbl rv">FULL ACCESS &mdash; $19/MO</span>
            <h2 className="platform-cta-title anim-text-up">
              Get In
              <br />
              Sequence
            </h2>
            <p className="platform-cta-desc rv rv-d1">
              <strong>
                An AI advisor that knows 35 deal structures by heart.
              </strong>{" "}
              Score any deal before you sign. Map your position in the
              progression. Track your creative assets as they compound. The full
              platform &mdash; strategic tools plus the entire library.
            </p>
            <div className="platform-cta-btn rv rv-d2">
              <Link href="/signup?plan=full_access" className="btn btn--white">
                GET FULL ACCESS &mdash; $19/MO
                <ButtonArrow />
              </Link>
            </div>
          </div>
          <div className="platform-cta-right rv rv-d3">
            <div className="platform-cta-feature">
              <span className="platform-cta-feature-num">[01]</span>
              <span className="platform-cta-feature-text">
                <strong>AI Strategic Advisor</strong> &mdash; personalized deal
                guidance
              </span>
            </div>
            <div className="platform-cta-feature">
              <span className="platform-cta-feature-num">[02]</span>
              <span className="platform-cta-feature-text">
                <strong>Deal Evaluator</strong> &mdash; score and analyze any
                deal
              </span>
            </div>
            <div className="platform-cta-feature">
              <span className="platform-cta-feature-num">[03]</span>
              <span className="platform-cta-feature-text">
                <strong>Career Assessment</strong> with custom roadmap
              </span>
            </div>
            <div className="platform-cta-feature">
              <span className="platform-cta-feature-num">[04]</span>
              <span className="platform-cta-feature-text">
                <strong>Asset Inventory</strong> tracking and valuation
              </span>
            </div>
            <div className="platform-cta-feature">
              <span className="platform-cta-feature-num">[05]</span>
              <span className="platform-cta-feature-text">
                <strong>35+ deal structures</strong> and 70+ case studies
              </span>
            </div>
            <div className="platform-cta-feature">
              <span className="platform-cta-feature-num">[06]</span>
              <span className="platform-cta-feature-text">
                <strong>New content weekly</strong> &mdash; the platform keeps
                growing
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CONNECTION OPPORTUNITIES ===== */}
      <section className="connections">
        <div className="connections-head">
          <h2 className="anim-text-up">Connection Opportunities</h2>
        </div>
        <div className="conn-grid">
          <div className="conn rv rv-d1">
            <span className="conn-num">[01]</span>
            <h3 className="conn-name">Advisory</h3>
            <p className="conn-desc">
              Strategic guidance for creative professionals navigating deal
              structures, ownership transitions, and value capture. One-on-one
              sessions grounded in the framework — not generic business advice.
            </p>
            <Link href="/contact" className="btn">
              CONTACT
              <ButtonArrow />
            </Link>
          </div>
          <div className="conn rv rv-d2">
            <span className="conn-num">[02]</span>
            <h3 className="conn-name">Coaching</h3>
            <p className="conn-desc">
              One-on-one and small cohort coaching designed to move you through
              the four-stage progression. Structured sessions, real deal
              analysis, and accountability for creative professionals ready to
              shift from execution to ownership.
            </p>
            <Link href="/contact" className="btn">
              CONTACT
              <ButtonArrow />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== GET IN SEQUENCE / NEWSLETTER ===== */}
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
