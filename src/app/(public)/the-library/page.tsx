import Link from "next/link";
import type { Metadata } from "next";
import ButtonArrow from "@/components/ui/button-arrow";
import NewsletterForm from "@/components/newsletter-form";
import BookDownloadForm from "@/components/book-download-form";
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
  title: "The Library",
  description:
    "35 deal structures, 100+ case studies, and strategic frameworks for creative professionals navigating the restructuring of the creative economy.",
};

export default function LibraryPage() {
  const { models, deals } = getStructuresTableData();
  const caseStudies = getFeaturedCaseStudies(6);
  const testimonials = getTestimonials();

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="lib-hero">
        <div className="lib-hero-title">
          <h1 className="anim-text-up">The Library</h1>
        </div>
        <div className="lib-hero-sub">
          <div className="lib-hero-sub-grid">
            <p className="lib-hero-desc rv">
              <strong>Research, structures, and case studies</strong> for
              creative professionals navigating the restructuring of the
              creative economy. The library grows regularly. Membership is{" "}
              $12 per year.
            </p>
          </div>
        </div>
        <div className="lib-hero-metrics">
          <div className="lib-metric rv">
            <span className="lib-metric-val">35+</span>
            <span className="lib-metric-lbl">DEAL STRUCTURES</span>
          </div>
          <div className="lib-metric rv rv-d1">
            <span className="lib-metric-val">100+</span>
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

      {/* ===== DEAL STRUCTURES ===== */}
      <section className="structures" id="structures">
        <div className="structures-head">
          <h2 className="anim-text-up">Deal Structures</h2>
        </div>
        <div className="structures-intro">
          <div className="structures-intro-grid">
            <p className="structures-intro-text rv">
              <strong>35 deal structures</strong> &mdash; business models and
              compensation mechanisms &mdash; for creative professionals
              shifting from time-based to outcome-based value capture. Each
              includes case studies, negotiation guidance, and
              decision checklists.
            </p>
          </div>
        </div>

        <div className="plat-structures-wrap">
          <StructuresTable models={models} deals={deals} />
        </div>

        {/* Structures CTA */}
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
              regularly.
            </p>
            <div
              className="structures-gate-cta"
              style={{ display: "flex", alignItems: "center", gap: "16px" }}
            >
              <Link href="/signup?plan=library" className="btn btn--white">
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
              <strong>100+ case studies</strong> mapping how creative
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
              className={`case-card rv${i > 0 ? ` rv-d${Math.min(i, 5)}` : ""}`}
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

        {/* Case Studies CTA */}
        <div className="cases-gate rv rv-d4">
          <div className="cases-gate-left">
            <span className="cases-gate-headline">
              Real careers.
              <br />
              Real structures.
              <br />
              Real receipts.
            </span>
            <p className="cases-gate-desc">
              <strong>100+ case studies &mdash; and growing.</strong> Each one
              documents the deal structures, the strategic reasoning behind
              them, and the outcomes that followed. Sourcing on every claim.
            </p>
            <div className="cases-gate-cta">
              <Link href="/pricing" className="btn btn--white">
                VIEW ALL CASE STUDIES
                <ButtonArrow />
              </Link>
            </div>
          </div>
          <div className="cases-gate-right">
            <div className="cases-gate-feature">
              <span className="cases-gate-feature-title">
                Structural Patterns
              </span>
              <span className="cases-gate-feature-desc">
                Equity arrangements, revenue splits, licensing terms, and
                ownership configurations &mdash; with sources cited.
              </span>
            </div>
            <div className="cases-gate-feature">
              <span className="cases-gate-feature-title">
                Career Trajectories
              </span>
              <span className="cases-gate-feature-desc">
                How each structure played out over time. What compounded. What
                didn&apos;t.
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

      {/* ===== BOOK DOWNLOAD ===== */}
      <section className="book">
        <div className="book-grid">
          <div className="book-img rv">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/in-sequence-book-mockup.jpg"
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
            <div className="book-form-wrap rv rv-d2">
              <BookDownloadForm variant="dark" />
              <Link href="/book" className="book-more-link">
                Learn more about the book <ButtonArrow />
              </Link>
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
