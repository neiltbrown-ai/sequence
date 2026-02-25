import type { Metadata } from "next";
import Link from "next/link";
import ButtonArrow from "@/components/ui/button-arrow";
import NewsletterForm from "@/components/newsletter-form";

export const metadata: Metadata = {
  title: "The Discernment Premium — In Sequence",
};

export default function ArticlePage() {
  return (
    <>
      {/* ARTICLE HEADER */}
      <header className="art-header">
        {/* Back link */}
        <div className="art-back rv">
          <Link href="/articles">
            <svg viewBox="0 0 12 12" fill="none">
              <path
                d="M10 6H2M2 6L6 2M2 6L6 10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>{" "}
            All Articles
          </Link>
        </div>

        {/* Meta */}
        <div className="art-header-meta rv rv-d1">
          <div className="art-header-meta-grid">
            <div className="art-header-meta-inner">
              <span className="art-header-tag">[THESIS]</span>
              <span className="art-header-dot"></span>
              <span className="art-header-date">FEBRUARY 18, 2026</span>
              <span className="art-header-dot"></span>
              <span className="art-header-read">12 MIN READ</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="art-header-title rv rv-d2">
          <div className="art-header-title-grid">
            <h1>
              The Discernment Premium: Why Taste Became the Scarcest Asset in
              the Creative Economy
            </h1>
          </div>
        </div>

        {/* Hero image */}
        <div className="art-hero-img anim-reveal-down">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1400&h=560&fit=crop&crop=center"
            alt="The Discernment Premium"
          />
        </div>
      </header>

      {/* ARTICLE BODY */}
      <article className="art-body">
        {/* Lead paragraph with drop cap */}
        <div className="ab-grid">
          <p className="ab-p has-dropcap rv">
            Something shifted in the creative economy between 2022 and 2025, and
            most professionals felt it before they could name it. The tools got
            better. The output got faster. The budgets didn&apos;t follow. What
            looked like a technology story — AI replacing creative labor — was
            actually an economics story about where value concentrates when
            execution costs approach zero.
          </p>
        </div>

        <div className="ab-grid">
          <p className="ab-p rv">
            The numbers tell one version.{" "}
            <strong>
              Median creative compensation has been flat for a decade.
            </strong>{" "}
            But top-tier creative compensation — the people who decide what gets
            made, not just how it gets made — has grown by multiples. The gap
            isn&apos;t talent. The gap is discernment: the ability to see what
            matters before the market confirms it.
          </p>
        </div>

        {/* SUBHEAD */}
        <div className="ab-grid is-subhead">
          <h2 className="ab-h2 rv">The 50x Gap Is Not About Skill</h2>
        </div>

        <div className="ab-grid">
          <p className="ab-p rv">
            For decades, the creative economy rewarded execution speed and
            technical proficiency. A designer who could produce polished comps
            faster earned more than one who couldn&apos;t. A photographer who
            could light a product shoot efficiently commanded premium day rates.
            The market priced creative work the way it priced manufacturing:
            throughput times quality.
          </p>
        </div>

        <div className="ab-grid">
          <p className="ab-p rv">
            That equation broke. Not gradually — structurally. When a language
            model can generate a competent first draft of almost anything in
            seconds, the question shifts from{" "}
            <strong>&ldquo;who can make this?&rdquo;</strong> to{" "}
            <strong>&ldquo;what should we make?&rdquo;</strong> The first
            question is about execution. The second is about judgment.
          </p>
        </div>

        {/* PULL QUOTE */}
        <div className="ab-grid is-pullquote">
          <div className="ab-pullquote rv">
            The market used to pay for the ability to produce. Now it pays for
            the ability to choose. That&apos;s not a subtle distinction — it&apos;s
            a complete inversion of what creative compensation rewards.
            <div className="ab-pullquote-attr">
              — From the In Sequence Thesis, Part 3
            </div>
          </div>
        </div>

        <div className="ab-grid">
          <p className="ab-p rv">
            Consider the data. In advertising, the median creative director
            earns roughly $140,000. The executive creative directors at the top
            20 agencies — the ones who set the creative direction for entire
            portfolios — earn $400,000 to $700,000 in salary alone, with equity
            and profit-sharing often doubling that number. That&apos;s a 4-7x
            gap on salary. But when you factor in the ownership structures — the
            equity stakes, the production company back-ends, the IP
            participation — the gap between a mid-level creative and a top-tier
            creative director approaches 40-70x.
          </p>
        </div>

        {/* METRICS */}
        <div className="ab-grid is-metrics">
          <div className="ab-metrics rv">
            <div className="ab-metric">
              <span className="ab-metric-val">50x</span>
              <span className="ab-metric-lbl">
                Compensation gap between median and top creative professionals
              </span>
            </div>
            <div className="ab-metric">
              <span className="ab-metric-val">73%</span>
              <span className="ab-metric-lbl">
                Of top-tier creative comp comes from ownership, not salary
              </span>
            </div>
            <div className="ab-metric">
              <span className="ab-metric-val">8&rarr;2</span>
              <span className="ab-metric-lbl">
                Years for AI to compress the execution-to-judgment transition
              </span>
            </div>
          </div>
        </div>

        <div className="ab-grid">
          <p className="ab-p rv">
            The 50x figure sounds dramatic until you examine where the money
            actually flows. It&apos;s not flowing to the people who make things.
            It&apos;s flowing to the people who{" "}
            <strong>
              decide what gets made, set the quality standard, and own a piece of
              the outcome.
            </strong>
          </p>
        </div>

        {/* BREAKOUT IMAGE */}
        <div className="ab-grid is-img">
          <div className="ab-img-wide rv">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1000&h=500&fit=crop"
              alt="Creative economy data"
            />
            <div className="ab-img-caption">
              Source: Bureau of Labor Statistics, In Sequence Research Synthesis,
              2025
            </div>
          </div>
        </div>

        {/* SUBHEAD */}
        <div className="ab-grid is-subhead">
          <h2 className="ab-h2 rv">Three Layers of Discernment</h2>
        </div>

        <div className="ab-grid">
          <p className="ab-p rv">
            Not all judgment is created equal. The market is pricing three
            distinct forms of discernment, and they compound in value as you move
            up the stack.
          </p>
        </div>

        {/* SMALL SUBHEAD */}
        <div className="ab-grid is-subhead-sm">
          <h3 className="ab-h3 rv">1. Curatorial Taste</h3>
        </div>

        <div className="ab-grid">
          <p className="ab-p rv">
            The ability to recognize quality — to look at a body of work and
            identify what&apos;s exceptional. This is the most common form of
            discernment and the least valuable on its own. Every creative
            director has it. Most senior producers have it. It&apos;s necessary
            but no longer sufficient.{" "}
            <strong>Curation is table stakes.</strong>
          </p>
        </div>

        {/* SMALL SUBHEAD */}
        <div className="ab-grid is-subhead-sm">
          <h3 className="ab-h3 rv">2. Prognostic Ability</h3>
        </div>

        <div className="ab-grid">
          <p className="ab-p rv">
            The capacity to sense where culture is moving before the data
            confirms it. This is rarer, harder to develop, and significantly more
            valuable. A creative with prognostic ability doesn&apos;t just
            recognize a good campaign — they know which campaign will resonate
            six months from now, in a market that doesn&apos;t yet know it wants
            what they&apos;re about to make.
          </p>
        </div>

        {/* SMALL SUBHEAD */}
        <div className="ab-grid is-subhead-sm">
          <h3 className="ab-h3 rv">3. Generative Taste</h3>
        </div>

        <div className="ab-grid">
          <p className="ab-p rv">
            The ability to define new quality standards — not just to recognize
            what&apos;s good within existing frameworks but to create the
            frameworks. This is the rarest form and it&apos;s what the top of
            the market pays for disproportionately.{" "}
            <strong>
              Generative taste is what makes Virgil Abloh&apos;s approach to
              Louis Vuitton fundamentally different from a skilled luxury
              designer executing within established codes.
            </strong>
          </p>
        </div>

        {/* CHART */}
        <div className="ab-grid is-chart">
          <div className="ab-chart rv">
            <div className="ab-chart-title">
              Relative market value by discernment layer
            </div>
            <div className="ab-chart-bars">
              <div className="ab-chart-row">
                <span className="ab-chart-label">Execution</span>
                <div className="ab-chart-bar-track">
                  <div
                    className="ab-chart-bar-fill"
                    style={{ width: "12%" }}
                  ></div>
                </div>
                <span className="ab-chart-val">1x</span>
              </div>
              <div className="ab-chart-row">
                <span className="ab-chart-label">Curatorial Taste</span>
                <div className="ab-chart-bar-track">
                  <div
                    className="ab-chart-bar-fill"
                    style={{ width: "28%" }}
                  ></div>
                </div>
                <span className="ab-chart-val">3&ndash;5x</span>
              </div>
              <div className="ab-chart-row">
                <span className="ab-chart-label">Prognostic Ability</span>
                <div className="ab-chart-bar-track">
                  <div
                    className="ab-chart-bar-fill"
                    style={{ width: "56%" }}
                  ></div>
                </div>
                <span className="ab-chart-val">10&ndash;20x</span>
              </div>
              <div className="ab-chart-row">
                <span className="ab-chart-label">Generative Taste</span>
                <div className="ab-chart-bar-track">
                  <div
                    className="ab-chart-bar-fill"
                    style={{ width: "100%" }}
                  ></div>
                </div>
                <span className="ab-chart-val">40&ndash;70x</span>
              </div>
            </div>
          </div>
        </div>

        {/* PULL QUOTE */}
        <div className="ab-grid is-pullquote">
          <div className="ab-pullquote rv">
            AI commoditizes execution. It cannot commoditize the ability to see
            what no one else sees yet. That capacity — prognostic ability
            combined with generative taste — is what the next decade of creative
            compensation will reward.
          </div>
        </div>

        {/* SUBHEAD */}
        <div className="ab-grid is-subhead">
          <h2 className="ab-h2 rv">The Ownership Multiplier</h2>
        </div>

        <div className="ab-grid">
          <p className="ab-p rv">
            Here&apos;s where discernment connects to deal structures. Taste
            alone doesn&apos;t create asymmetric value — taste paired with
            ownership does. The creative professionals capturing 40-70x
            aren&apos;t just better at choosing. They&apos;ve structured their
            relationships so that their judgment generates equity, not just fees.
          </p>
        </div>

        <div className="ab-grid">
          <p className="ab-p rv">
            This is the progression we map across the In Sequence library: from
            billing for execution (Stage 1), to billing for judgment (Stage 2),
            to owning a share of what your judgment creates (Stage 3), to
            building platforms where your judgment compounds across multiple
            ventures (Stage 4). Each stage requires a different set of deal
            structures — and the professionals who understand this progression
            are the ones moving through it.
          </p>
        </div>

        {/* FULL WIDTH IMAGE */}
        <div className="ab-grid is-img-full">
          <div className="ab-img-full rv">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1400&h=480&fit=crop&crop=center"
              alt="Creative professionals collaborating"
            />
            <div
              className="ab-img-caption"
              style={{ padding: "0 calc(12.5% + var(--gutter))" }}
            >
              The four-stage progression from execution to ownership reshapes not
              just compensation but creative autonomy.
            </div>
          </div>
        </div>

        <div className="ab-grid">
          <p className="ab-p rv">
            Consider{" "}
            <strong>
              Structure 12: IP Licensing with Performance Escalator
            </strong>{" "}
            — a deal template where a creative retains intellectual property
            rights and licenses usage to clients, with compensation that scales
            based on commercial outcomes. A designer using this structure
            doesn&apos;t just earn more for better work. They earn more when
            their judgment about what to make proves correct in the market. The
            structure aligns compensation with discernment, not delivery.
          </p>
        </div>

        <div className="ab-grid">
          <p className="ab-p rv">
            Or <strong>Structure 23: Creative Equity Vesting</strong> — where a
            creative earns equity in a venture through sustained creative
            direction, vesting over time as the brand&apos;s value compounds.
            This structure doesn&apos;t just pay for taste. It converts taste
            into ownership. And ownership is where the 50x gap lives.
          </p>
        </div>

        {/* SUBHEAD */}
        <div className="ab-grid is-subhead">
          <h2 className="ab-h2 rv">
            What This Means for the Missing Middle
          </h2>
        </div>

        <div className="ab-grid">
          <p className="ab-p rv">
            If you&apos;re a creative professional earning between $75K and
            $500K — the Missing Middle — this analysis isn&apos;t academic.
            It&apos;s the map. The compression you&apos;re feeling isn&apos;t
            about the market undervaluing your work. It&apos;s about the market
            restructuring around a new scarcity.
          </p>
        </div>

        <div className="ab-grid">
          <p className="ab-p rv">
            The professionals who will thrive in this restructuring are the ones
            who recognize three things simultaneously. First, that{" "}
            <strong>
              execution skills are necessary but depreciating.
            </strong>{" "}
            Second, that discernment — particularly prognostic ability and
            generative taste — is the new leverage point. And third, that
            discernment without ownership structures is still just a better
            hourly rate.
          </p>
        </div>

        <div className="ab-grid">
          <p className="ab-p rv">
            The deal structures exist. The progression is mappable. The question
            is whether you can see the shift clearly enough to act on it —
            before the market makes the decision for you.
          </p>
        </div>
      </article>

      {/* ARTICLE FOOTER — tags + share */}
      <section className="art-footer">
        <div className="art-footer-grid">
          <div className="art-footer-inner rv">
            <div className="art-footer-tags">
              <Link href="/articles" className="art-footer-tag">
                Discernment Premium
              </Link>
              <Link href="/articles" className="art-footer-tag">
                Missing Middle
              </Link>
              <Link href="/articles" className="art-footer-tag">
                Thesis
              </Link>
              <Link href="/articles" className="art-footer-tag">
                Ownership
              </Link>
              <Link href="/articles" className="art-footer-tag">
                Deal Structures
              </Link>
            </div>
            <div className="art-footer-share">
              <span className="art-footer-share-lbl">Share</span>
              <a href="https://x.com/intent/tweet?url=https%3A%2F%2Finsequence.co%2Farticles%2Fthe-discernment-premium&text=The%20Discernment%20Premium" target="_blank" rel="noopener noreferrer">X</a>
              <a href="https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Finsequence.co%2Farticles%2Fthe-discernment-premium" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              <a href="mailto:?subject=The%20Discernment%20Premium&body=https%3A%2F%2Finsequence.co%2Farticles%2Fthe-discernment-premium">Email</a>
            </div>
          </div>
        </div>
      </section>

      {/* AUTHOR BYLINE */}
      <section className="author">
        <div className="author-grid rv">
          <div className="author-content">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="author-avatar"
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=112&h=112&fit=crop&crop=face"
              alt="Neil Brown"
            />
            <div className="author-info">
              <span className="author-name">Neil Brown</span>
              <p className="author-bio">
                <strong>Researcher and strategist</strong> studying the
                restructuring of the creative economy. Author of the In Sequence
                thesis and library of 35 deal structures. Based in Chattanooga,
                TN.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* RELATED ARTICLES */}
      <section className="related">
        <div className="related-head">
          <h2 className="anim-text-up" style={{ lineHeight: ".82" }}>
            Continue
            <br />
            Reading
          </h2>
        </div>
        <div className="related-list">
          <div className="a-row rv">
            <span className="a-num">[01]</span>
            <div className="a-title">
              <Link href="/articles/the-triple-convergence-where-creativity-cognition-and-capital-collide">
                The Triple Convergence: Where Creativity, Cognition, and Capital
                Collide
              </Link>
            </div>
            <span className="a-pub">THESIS</span>
            <span className="a-link">
              <Link
                href="/articles/the-triple-convergence-where-creativity-cognition-and-capital-collide"
                className="btn"
              >
                READ
                <ButtonArrow />
              </Link>
            </span>
          </div>
          <div className="a-row rv rv-d1">
            <span className="a-num">[02]</span>
            <div className="a-title">
              <Link href="/articles/revenue-share-vs-equity-choosing-the-right-ownership-structure">
                Revenue Share vs. Equity: Choosing the Right Ownership Structure
              </Link>
            </div>
            <span className="a-pub">DEAL STRUCTURES</span>
            <span className="a-link">
              <Link
                href="/articles/revenue-share-vs-equity-choosing-the-right-ownership-structure"
                className="btn"
              >
                READ
                <ButtonArrow />
              </Link>
            </span>
          </div>
          <div className="a-row rv rv-d2">
            <span className="a-num">[03]</span>
            <div className="a-title">
              <Link href="/articles/the-missing-middle-why-75k-500k-creatives-feel-the-squeeze">
                The Missing Middle: Why $75K&ndash;$500K Creatives Feel the
                Squeeze
              </Link>
            </div>
            <span className="a-pub">THESIS</span>
            <span className="a-link">
              <Link
                href="/articles/the-missing-middle-why-75k-500k-creatives-feel-the-squeeze"
                className="btn"
              >
                READ
                <ButtonArrow />
              </Link>
            </span>
          </div>
        </div>
        <div className="related-foot rv">
          <Link href="/articles" className="btn">
            View All Articles
            <ButtonArrow />
          </Link>
        </div>
      </section>

      {/* CTA CALLOUT */}
      <div className="art-cta rv">
        <div className="art-cta-content">
          <span className="art-cta-lbl">[THE LIBRARY]</span>
          <h3 className="art-cta-title">
            35 deal structures for creative professionals building ownership.
          </h3>
          <p className="art-cta-desc">
            This article references <strong>Structure 12</strong> and{" "}
            <strong>Structure 23</strong> from the In Sequence library. The full
            collection maps the progression from execution-based to
            ownership-based compensation.
          </p>
          <div className="art-cta-actions">
            <Link href="/resources" className="btn btn--white">
              Explore the Library
              <ButtonArrow />
            </Link>
          </div>
        </div>
        <div className="art-cta-features">
          <div className="art-cta-feat">
            <span className="art-cta-feat-title">35 Structures</span>
            <span className="art-cta-feat-desc">
              Complete deal templates with real terms
            </span>
          </div>
          <div className="art-cta-feat">
            <span className="art-cta-feat-title">4 Stages</span>
            <span className="art-cta-feat-desc">
              Mapped progression from fees to ownership
            </span>
          </div>
          <div className="art-cta-feat">
            <span className="art-cta-feat-title">Case Studies</span>
            <span className="art-cta-feat-desc">
              Practitioners who made the transition
            </span>
          </div>
          <div className="art-cta-feat">
            <span className="art-cta-feat-title">Risk Profiles</span>
            <span className="art-cta-feat-desc">
              Each structure rated for risk and leverage
            </span>
          </div>
        </div>
      </div>

      {/* NEWSLETTER */}
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
                fontSize: "clamp(44px,7vw,84px)",
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
