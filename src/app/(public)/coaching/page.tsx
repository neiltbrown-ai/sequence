import Link from "next/link";
import type { Metadata } from "next";
import ButtonArrow from "@/components/ui/button-arrow";

export const metadata: Metadata = {
  title: "Advisory — In Sequence",
};

export default function CoachingPage() {
  return (
    <>
      {/* ===== HERO ===== */}
      <section className="page-hero">
        <div className="ph-title">
          <h1 className="anim-text-up">Advisory</h1>
        </div>
        <div className="ph-meta rv">
          <div className="ph-meta-grid">
            <span className="ph-meta-lbl">[ADVISORY]</span>
            <p className="ph-meta-desc">
              <strong>Strategic advisory for creative professionals</strong>{" "}
              navigating complex deal structures, ownership transitions, and
              career positioning. Also advising investment firms, family
              offices, and angel investors on creative economy opportunities.
              Limited availability — two engagement formats designed for depth.
            </p>
          </div>
        </div>
      </section>

      {/* ===== TWO TIERS ===== */}
      <section className="coach-tiers">
        <div className="coach-tiers-grid">
          {/* 1:1 Advisory */}
          <div className="coach-tier rv">
            <span className="coach-tier-label">[01]</span>
            <h2 className="coach-tier-title">1:1 Coaching Advisory</h2>
            <div className="coach-tier-price">
              <span className="coach-tier-val">$5,000</span>
              <span className="coach-tier-term">/ month</span>
            </div>
            <span className="coach-tier-duration">
              Typically 3, 6, or 9 months depending on goals
            </span>
            <ul className="coach-tier-features">
              <li>Dedicated strategic advisor</li>
              <li>Custom deal structure analysis</li>
              <li>Negotiation preparation and review</li>
              <li>Career positioning and transition planning</li>
              <li>Direct access via email and scheduled calls</li>
              <li>Full library membership included</li>
            </ul>
            <div className="coach-tier-cta">
              <Link href="/contact" className="btn">
                CONTACT
                <ButtonArrow />
              </Link>
            </div>
          </div>

          {/* 5:1 Group Advisory */}
          <div className="coach-tier rv rv-d1">
            <span className="coach-tier-label">[02]</span>
            <h2 className="coach-tier-title">5:1 Group Advisory</h2>
            <div className="coach-tier-price">
              <span className="coach-tier-val">$2,250</span>
              <span className="coach-tier-term">/ month</span>
            </div>
            <span className="coach-tier-duration">
              3, 6, or 9 month cycles — grouped by industry, stage, and goals
            </span>
            <ul className="coach-tier-features">
              <li>Small peer cohort (5 creatives max)</li>
              <li>Facilitated group sessions + individual check-ins</li>
              <li>Monthly masterclass on advanced structures</li>
              <li>Peer accountability and deal review</li>
              <li>Shared case study library and templates</li>
              <li>Full library membership included</li>
            </ul>
            <div className="coach-tier-cta">
              <Link href="/contact" className="btn">
                CONTACT
                <ButtonArrow />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="coach-how">
        <div className="coach-how-head">
          <h2 className="anim-text-up">How It Works</h2>
        </div>
        <div className="coach-how-grid">
          <div className="coach-step rv">
            <span className="coach-step-num">[01]</span>
            <h3 className="coach-step-title">Initial Consultation</h3>
            <p className="coach-step-desc">
              A 30-minute introductory call to understand your goals, current
              deal landscape, and what success looks like. No commitment.
            </p>
          </div>
          <div className="coach-step rv rv-d1">
            <span className="coach-step-num">[02]</span>
            <h3 className="coach-step-title">Strategic Assessment</h3>
            <p className="coach-step-desc">
              We map your current deal structures, identify gaps, and design a
              personalized engagement plan aligned to your timeline.
            </p>
          </div>
          <div className="coach-step rv rv-d2">
            <span className="coach-step-num">[03]</span>
            <h3 className="coach-step-title">Ongoing Advisory</h3>
            <p className="coach-step-desc">
              Regular sessions focused on active deals, negotiation prep,
              positioning strategy, and building toward ownership milestones.
            </p>
          </div>
        </div>
      </section>

      {/* ===== WHO IT'S FOR ===== */}
      <section className="coach-who">
        <div className="coach-who-head">
          <h2 className="anim-text-up">Who This Is For</h2>
        </div>
        <div className="coach-who-grid">
          <div className="coach-who-item rv">
            <strong>Creative professionals</strong> negotiating equity, revenue
            share, or ownership stakes for the first time.
          </div>
          <div className="coach-who-item rv rv-d1">
            <strong>Agency founders</strong> transitioning from service delivery
            to strategic advisory or portfolio ownership.
          </div>
          <div className="coach-who-item rv rv-d2">
            <strong>Independent creators</strong> building sustainable revenue
            structures beyond project-based income.
          </div>
          <div className="coach-who-item rv rv-d3">
            <strong>Executives</strong> navigating career transitions from
            corporate creative roles to founder or advisory positions.
          </div>
          <div className="coach-who-item rv rv-d4">
            <strong>Investment firms and RIAs</strong> seeking strategic insight
            into creative economy deal structures, asset valuation, and
            portfolio allocation across emerging creative asset classes.
          </div>
          <div className="coach-who-item rv rv-d5">
            <strong>Angel investors and family offices</strong> evaluating
            direct investments in creative ventures, IP-backed deals, and
            creator-led businesses at the intersection of culture and capital.
          </div>
        </div>
      </section>

      {/* ===== STRUCTURE THE SEQUENCE CTA ===== */}
      <section className="coach-structure-cta">
        <div className="coach-structure-grid">
          <div className="coach-structure-left rv">
            <h2 className="coach-structure-title">
              Structure the sequence to own your future
            </h2>
            <p className="coach-structure-desc">
              Dedicated advisory is built for creative professionals ready to
              stop trading execution for invoices and start structuring the
              deals, assets, and ownership that compound over time. Work
              directly with a strategic advisor to design your sequence.
            </p>
            <div className="coach-structure-buttons">
              <Link href="/contact" className="btn btn--white">
                CONTACT
                <ButtonArrow />
              </Link>
            </div>
          </div>
          <div className="coach-structure-right rv rv-d1">
            <div className="coach-structure-benefit">
              <span className="coach-structure-benefit-num">[01]</span>
              <div>
                <h3 className="coach-structure-benefit-title">Strategic clarity on your next move</h3>
                <p className="coach-structure-benefit-desc">
                  Stop second-guessing. Get a framework for deciding which
                  deals to take, which to walk from, and which to restructure.
                </p>
              </div>
            </div>
            <div className="coach-structure-benefit">
              <span className="coach-structure-benefit-num">[02]</span>
              <div>
                <h3 className="coach-structure-benefit-title">Deal structures built for ownership</h3>
                <p className="coach-structure-benefit-desc">
                  Move beyond hourly and project-based work. Design equity,
                  royalty, and revenue share structures that capture long-term
                  value.
                </p>
              </div>
            </div>
            <div className="coach-structure-benefit">
              <span className="coach-structure-benefit-num">[03]</span>
              <div>
                <h3 className="coach-structure-benefit-title">Negotiation prep for high-stakes conversations</h3>
                <p className="coach-structure-benefit-desc">
                  Walk into every deal conversation with leverage, language,
                  and a clear sense of what you&apos;re willing to accept.
                </p>
              </div>
            </div>
            <div className="coach-structure-benefit">
              <span className="coach-structure-benefit-num">[04]</span>
              <div>
                <h3 className="coach-structure-benefit-title">A sequence designed around your goals</h3>
                <p className="coach-structure-benefit-desc">
                  Every engagement is personalized. Your situation, your
                  timeline, your definition of ownership — all mapped into a
                  deliberate sequence.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== RECOMMENDED READING ===== */}
      <section className="coach-reading">
        <div className="coach-reading-head">
          <h2 className="anim-text-up">Recommended<br />Reading</h2>
        </div>
        <div className="coach-reading-grid">
          <Link
            href="/articles/misdefined-intelligence"
            className="coach-reading-item rv"
          >
            <span className="coach-reading-num">[01]</span>
            <span className="coach-reading-tag">THESIS</span>
            <span className="coach-reading-title">
              We Built the Entire Economy on the Wrong Definition of
              Intelligence
            </span>
            <span className="coach-reading-subtitle">Buckle up.</span>
          </Link>
          <Link
            href="/articles/the-asset-class-youre-ignoring"
            className="coach-reading-item rv rv-d1"
          >
            <span className="coach-reading-num">[02]</span>
            <span className="coach-reading-tag">THESIS</span>
            <span className="coach-reading-title">
              The Asset Class You&apos;re Ignoring
            </span>
            <span className="coach-reading-subtitle">
              A Case for Creative Capital
            </span>
          </Link>
          <Link
            href="/articles/your-diligence-model-has-a-taste-problem"
            className="coach-reading-item rv rv-d2"
          >
            <span className="coach-reading-num">[03]</span>
            <span className="coach-reading-tag">CAPITAL ALLOCATOR SERIES</span>
            <span className="coach-reading-title">
              Your Diligence Model Has a Taste Problem
            </span>
            <span className="coach-reading-subtitle">Part 1 of 4</span>
          </Link>
          <Link
            href="/articles/the-creator-holdco"
            className="coach-reading-item rv rv-d3"
          >
            <span className="coach-reading-num">[04]</span>
            <span className="coach-reading-tag">CAPITAL ALLOCATOR SERIES</span>
            <span className="coach-reading-title">The Creator HoldCo</span>
            <span className="coach-reading-subtitle">Part 2 of 4</span>
          </Link>
          <Link
            href="/articles/aligned-capital"
            className="coach-reading-item rv rv-d4"
          >
            <span className="coach-reading-num">[05]</span>
            <span className="coach-reading-tag">CAPITAL ALLOCATOR SERIES</span>
            <span className="coach-reading-title">Aligned Capital</span>
            <span className="coach-reading-subtitle">Part 3 of 4</span>
          </Link>
          <Link
            href="/articles/sixty-year-yield"
            className="coach-reading-item rv rv-d5"
          >
            <span className="coach-reading-num">[06]</span>
            <span className="coach-reading-tag">CAPITAL ALLOCATOR SERIES</span>
            <span className="coach-reading-title">Sixty-Year Yield</span>
            <span className="coach-reading-subtitle">Part 4 of 4</span>
          </Link>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="coach-cta">
        <div className="coach-cta-inner">
          <h2 className="coach-cta-title anim-text-up">
            Own Your
            <br />
            Future
          </h2>
          <p className="coach-cta-desc rv rv-d1">
            Advisory engagements are limited to ensure depth. Submit your
            interest to learn more and discuss availability.
          </p>
          <div className="coach-cta-buttons rv rv-d2">
            <Link href="/contact" className="btn btn--white">
              GET IN TOUCH
              <ButtonArrow />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
