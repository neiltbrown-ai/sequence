import Link from "next/link";
import type { Metadata } from "next";
import ButtonArrow from "@/components/ui/button-arrow";
import NewsletterForm from "@/components/newsletter-form";

export const metadata: Metadata = {
  title: { absolute: "Sequence — Own What You Create" },
  description: "Turn a portfolio of projects into a portfolio of assets.",
};

const TOOLS = [
  {
    num: "01",
    name: "Portfolio Analysis",
    desc: "See what your body of work is actually worth, and where your leverage is hiding.",
    tier: "Full Access",
  },
  {
    num: "02",
    name: "Deal Evaluator",
    desc: "Drop in any deal. Get the terms, the red flags, and what to push back on — before you sign.",
    tier: "Full Access",
  },
  {
    num: "03",
    name: "Roadmap",
    desc: "Your next real move toward ownership, based on where you actually are.",
    tier: "Full Access",
  },
  {
    num: "04",
    name: "AI Advisor",
    desc: "A strategist who knows your work and your stage. Not generic business advice.",
    tier: "Full Access",
  },
  {
    num: "05",
    name: "The Library",
    desc: "35 deal structures and 100+ case studies. Actual terms, actual outcomes.",
    tier: "Library",
  },
];

// "What You Get" table — aligned to the page's 8-col grid (table spans cols 1-6)
const wygRow = {
  display: "grid",
  gridTemplateColumns: "repeat(6, 1fr)",
  gap: "var(--gutter)",
  alignItems: "start",
  padding: "22px 0",
  borderBottom: "1px solid var(--border)",
} as const;
const wygNum = {
  gridColumn: "1",
  fontFamily: "var(--mono)",
  fontSize: "10px",
  letterSpacing: ".1em",
  textTransform: "uppercase",
  color: "var(--light)",
  paddingTop: "6px",
} as const;
const wygTitle = {
  gridColumn: "2",
  fontFamily: "var(--sans)",
  fontSize: "15px",
  fontWeight: 500,
  letterSpacing: "-.015em",
  color: "var(--black)",
  lineHeight: 1.3,
} as const;
const wygDesc = {
  gridColumn: "3 / 6",
  fontFamily: "var(--sans)",
  fontSize: "14px",
  lineHeight: 1.6,
  color: "var(--mid)",
  paddingTop: "3px",
  margin: 0,
} as const;
const wygTag = {
  gridColumn: "6",
  fontFamily: "var(--mono)",
  fontSize: "9px",
  letterSpacing: ".1em",
  textTransform: "uppercase",
  color: "var(--light)",
  paddingTop: "7px",
  textAlign: "right",
} as const;

export default function HomePage() {
  return (
    <>
      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="g8 hero-grid">
          <div className="hero-title-cell">
            <h1 className="hero-title anim-text-up">Own what you create</h1>
            <p className="hero-subtitle rv">
              Your creativity generates enormous value, but{" "}
              <strong>how much of that value do you keep?</strong> Sequence helps
              you transform a portfolio of projects into a portfolio of assets.
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
              Value your work. Score a deal before you sign it. See your next
              move toward ownership &mdash; built on 35 deal structures and 100+
              real case studies. Not generic business advice.
            </p>
            <div className="hero-subscribe">
              <Link href="/platform" className="btn">
                PLATFORM OVERVIEW
                <ButtonArrow />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== THESIS — 50X ===== */}
      <section className="callout">
        <div className="callout-grid">
          <span className="callout-label rv">THESIS / THE 50X GAP</span>
          <div className="callout-number anim-text-up">50X</div>
          <p className="callout-text rv rv-d1">
            The difference between a portfolio of projects and a portfolio of
            assets isn&apos;t talent, effort, or your network.{" "}
            <strong>It&apos;s the deal structure.</strong>
          </p>
          <p className="callout-text rv rv-d2" style={{ marginTop: "28px" }}>
            <strong>Work-for-hire is a wealth transfer program.</strong> You
            build the asset; someone else keeps it. The deal structure is how you
            stop giving it away.
          </p>
        </div>
      </section>

      {/* ===== WHAT YOU GET — features (deal-structures table pattern) ===== */}
      <section className="forces">
        <div className="forces-head">
          <h2 className="anim-text-up">What You Get</h2>
        </div>
        <div className="forces-intro">
          <div className="forces-intro-grid">
            <p className="forces-intro-text rv" style={{ gridColumn: "2 / 7" }}>
              Five tools for the long game &mdash; turning a portfolio of
              projects into a portfolio of assets,{" "}
              <strong>a year or a decade at a time.</strong>
            </p>
          </div>
        </div>
        <div className="g8">
          <div
            className="rv"
            style={{ gridColumn: "1 / 7", borderTop: "1px solid var(--border)" }}
          >
            {TOOLS.map((t) => (
              <div style={wygRow} key={t.num}>
                <span style={wygNum}>{t.num}</span>
                <span style={wygTitle}>{t.name}</span>
                <p style={wygDesc}>{t.desc}</p>
                <span style={wygTag}>{t.tier}</span>
              </div>
            ))}
          </div>
          <div className="rv" style={{ gridColumn: "1 / 7", paddingTop: "32px" }}>
            <Link href="/platform" className="btn">
              PLATFORM OVERVIEW
              <ButtonArrow />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== TWO WAYS IN (reuses .pr-plan-card; absorbs Advisory) ===== */}
      <section className="pr-plan" style={{ marginTop: "80px" }}>
        <div className="forces-head">
          <h2 className="anim-text-up">Two Ways In</h2>
        </div>
        <div className="forces-intro">
          <div className="forces-intro-grid">
            <p className="forces-intro-text rv">
              Sequence exists to help you make better choices about how your work
              is structured &mdash; so the value you create doesn&apos;t quietly
              end up on someone else&apos;s balance sheet.{" "}
              <strong>
                Pick the level of access that fits where you are, and start
                owning your future.
              </strong>
            </p>
          </div>
        </div>
        <div className="pr-plan-grid pr-plan-grid--two">
          {/* Library — $12/yr */}
          <div className="pr-plan-card rv">
            <span className="pr-plan-label">Library</span>
            <div className="pr-plan-price">
              <span className="pr-plan-price-val">$12</span>
              <span className="pr-plan-price-term">/ year</span>
            </div>
            <p className="pr-plan-desc">
              Start here. The whole playbook &mdash; every structure, case study,
              and negotiation script &mdash; to read at your own pace.{" "}
              <strong>For the self-directed.</strong>
            </p>
            <ul className="pr-plan-features">
              <li>35 deal structures with negotiation scripts</li>
              <li>100+ case studies, with real terms and outcomes</li>
              <li>Decision frameworks and strategic roadmaps</li>
              <li>New content every week</li>
              <li>Save and organize your own library</li>
            </ul>
            <div className="pr-plan-cta">
              <Link
                href="/signup?plan=library"
                className="btn pr-plan-cta-secondary"
              >
                START WITH THE LIBRARY
                <ButtonArrow />
              </Link>
            </div>
          </div>

          {/* Full Access — $19/mo */}
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
              Everything in the Library, plus the tools that make it personal.
              They walk the whole road with you &mdash; whether it takes a year
              or a decade &mdash; as a portfolio of projects becomes a portfolio
              of assets.{" "}
              <strong>For creatives who mean to own what they build.</strong>
            </p>
            <ul className="pr-plan-features">
              <li>Everything in the Library</li>
              <li>Portfolio Analysis &mdash; value your work, find your leverage</li>
              <li>Deal Evaluator &mdash; score any deal before you sign</li>
              <li>Roadmap &mdash; your next move toward ownership</li>
              <li>AI Advisor &mdash; a strategist who knows your work</li>
            </ul>
            <div className="pr-plan-cta">
              <Link
                href="/signup?plan=full_access"
                className="btn pr-plan-cta-primary"
              >
                GET FULL ACCESS
                <ButtonArrow />
              </Link>
            </div>
          </div>
        </div>
        <p
          style={{
            padding: "28px var(--margin) 0",
            textAlign: "center",
            fontFamily: "var(--sans)",
            fontSize: "16px",
            color: "var(--mid)",
          }}
        >
          Want someone in your corner? Advisory &amp; coaching is available via
          waitlist.{" "}
          <Link href="/coaching" style={{ color: "var(--black)", fontWeight: 500 }}>
            Learn more →
          </Link>
        </p>
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
              Issues go out when there&apos;s something worth saying &mdash; no
              fixed cadence. Deal structures, case studies, and the patterns
              I&apos;m seeing in how creative value moves.
            </p>
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  );
}
