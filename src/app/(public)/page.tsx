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
          </div>
          <div className="hero-portrait-cell">
            <div className="hero-year-tag rv">/26</div>
            <div className="anim-reveal-down">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="hero-portrait"
                src="https://framerusercontent.com/images/zuq4iDlcKXpR8Kx3yWfaexbxrBs.jpg?width=2400&height=3600"
                alt="Desert landscape"
              />
            </div>
          </div>
          <div className="hero-meta-cell rv rv-d2">
            <span className="hero-intro-tag">[INTRO]</span>
            <p className="hero-desc">
              The creative economy is restructuring. Production commoditizes.
              Discernment becomes scarce. Capital follows scarcity. 35 deal
              structures. 37 case studies. And growing.
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

      {/* ===== THE THREE FORCES ===== */}
      <section className="forces">
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

      {/* ===== RESOURCES OVERVIEW ===== */}
      <section className="resources">
        <div className="resources-head">
          <h2 className="anim-text-up">Resources Overview</h2>
        </div>
        <div className="resources-intro">
          <div className="resources-intro-grid">
            <p className="resources-intro-text rv">
              <strong>A growing library</strong> of frameworks, structures, and
              case studies built to help creative professionals navigate the
              restructuring — and capture the value they create. Start anywhere.
              Go deep.
            </p>
          </div>
        </div>
        <div className="resources-grid">
          <Link className="rc" href="/resources">
            <div className="rc-wrap anim-scale-in anim-d1">
              <div className="rc-label-inner">
                <span className="rc-label-num">16 MODELS</span>
                Business Models
              </div>
            </div>
            <div className="rc-info rv rv-d1">
              <span className="rc-name">BUSINESS MODELS</span>
              <span className="rc-count">#1 – #16</span>
            </div>
          </Link>
          <Link className="rc" href="/resources">
            <div className="rc-wrap anim-scale-in anim-d2">
              <div className="rc-label-inner">
                <span className="rc-label-num">19 STRUCTURES</span>
                Deal Structures
              </div>
            </div>
            <div className="rc-info rv rv-d2">
              <span className="rc-name">DEAL STRUCTURES</span>
              <span className="rc-count">#17 – #35</span>
            </div>
          </Link>
          <Link className="rc" href="/resources">
            <div className="rc-wrap anim-scale-in anim-d3">
              <div className="rc-label-inner">
                <span className="rc-label-num">37 STUDIES</span>
                Case Studies
              </div>
            </div>
            <div className="rc-info rv rv-d3">
              <span className="rc-name">CASE STUDIES</span>
              <span className="rc-count">AND GROWING</span>
            </div>
          </Link>
          <Link className="rc" href="/articles">
            <div className="rc-wrap anim-scale-in anim-d4">
              <div className="rc-label-inner">
                <span className="rc-label-num">ESSAYS + ANALYSIS</span>
                Articles
              </div>
            </div>
            <div className="rc-info rv rv-d4">
              <span className="rc-name">ARTICLES</span>
              <span className="rc-count">ARCHIVE</span>
            </div>
          </Link>
        </div>
        <div className="resources-foot">
          <Link href="/resources" className="btn rv">
            EXPLORE ALL
            <ButtonArrow />
          </Link>
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
            <Link href="/about" className="btn">
              LEARN MORE
              <ButtonArrow />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== LANDSCAPE ===== */}
      <section className="landscape rv">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://framerusercontent.com/images/zuq4iDlcKXpR8Kx3yWfaexbxrBs.jpg?width=2400&height=3600"
          alt="Desert landscape"
        />
        <span className="landscape-cap">
          FUTURE OF CREATIVITY — 20,000 MILES OF PRIMARY RESEARCH
        </span>
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
          <div className="conn rv rv-d3">
            <span className="conn-num">[03]</span>
            <h3 className="conn-name">Community</h3>
            <p className="conn-desc">
              A private forum for creative professionals working through the
              restructuring together. Share deal structures, pressure-test
              strategies, and learn from others navigating the same transition.
              Peer-driven, practitioner-focused.
            </p>
            <button className="btn">
              PUBLIC CHANNEL
              <ButtonArrow />
            </button>
          </div>
          <div className="conn rv rv-d4">
            <span className="conn-num">[04]</span>
            <h3 className="conn-name">Primary Research Survey</h3>
            <p className="conn-desc">
              Help shape the research. Our ongoing survey captures how creative
              professionals are experiencing the restructuring — compensation,
              deal structures, ownership, and the forces shaping your career.
              Your data drives the framework.
            </p>
            <button className="btn">
              ONLINE SURVEY
              <ButtonArrow />
            </button>
          </div>
        </div>
      </section>

      {/* ===== GET IN SEQUENCE / NEWSLETTER ===== */}
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
