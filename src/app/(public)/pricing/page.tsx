import Link from "next/link";
import type { Metadata } from "next";
import ButtonArrow from "@/components/ui/button-arrow";
import FaqAccordion from "@/components/faq-accordion";

export const metadata: Metadata = {
  title: "Pricing — In Sequence",
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
              <strong>One membership. The full library.</strong> Every structure,
              case study, and framework — plus new content added weekly. $89 per
              year.
            </p>
          </div>
        </div>
      </section>

      {/* ===== PLAN CARD ===== */}
      <section className="pr-plan">
        <div className="pr-plan-grid">
          <div className="pr-plan-card rv">
            <span className="pr-plan-label">Annual Membership</span>
            <div className="pr-plan-price">
              <span className="pr-plan-price-val">$89</span>
              <span className="pr-plan-price-term">/ year</span>
            </div>
            <ul className="pr-plan-features">
              <li>35+ deal structures with negotiation scripts</li>
              <li>50+ case studies across creative industries</li>
              <li>Decision frameworks and strategic roadmaps</li>
              <li>Weekly new content and library updates</li>
              <li>Full access to the complete resource library</li>
            </ul>
            <div className="pr-plan-cta">
              <Link href="/signup" className="btn">
                GET STARTED — $89/YEAR
                <ButtonArrow />
              </Link>
            </div>
          </div>
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
            <span className="pr-item-num">50+</span>
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
            <span className="pr-cta-lbl rv">FULL LIBRARY ACCESS</span>
            <h2 className="pr-cta-title anim-text-up">
              Get In
              <br />
              Sequence
            </h2>
            <p className="pr-cta-desc rv rv-d1">
              <strong>$89 per year.</strong> Every structure, case study, and
              framework — plus new content added weekly. The library grows. You
              grow with it.
            </p>
            <div className="pr-cta-buttons rv rv-d2">
              <Link href="/signup" className="btn btn--white">
                SIGN UP — $89/YEAR
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
                <strong>50+ case studies</strong> across creative industries
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
                <strong>Decision frameworks</strong> and scoring tools
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
