import type { Metadata } from "next";
import BookDownloadForm from "@/components/book-download-form";

export const metadata: Metadata = {
  title: "The Book — In Sequence",
  description:
    "Download In Sequence: a framework for creative professionals navigating the restructuring of the creative economy.",
};

const THEMES = [
  {
    num: "01",
    title: "The Compression of Execution",
    desc: "Why the skills that used to command premium rates are rapidly commoditizing — and what that means for creative careers.",
  },
  {
    num: "02",
    title: "The Discernment Premium",
    desc: "Knowing what's worth making is becoming scarce. Capital follows scarcity. This is where the new leverage lives.",
  },
  {
    num: "03",
    title: "The Four-Stage Progression",
    desc: "A practical map for moving from execution to ownership — and the specific transitions most creatives miss.",
  },
  {
    num: "04",
    title: "35 Deal Structures",
    desc: "Concrete templates for capturing value: equity, royalties, profit participation, advisory arrangements, and more.",
  },
  {
    num: "05",
    title: "From Execution to Ownership",
    desc: "Case studies and frameworks for creatives structuring their work around long-term compounding, not hourly billing.",
  },
];

export default function BookPage() {
  return (
    <>
      {/* ===== PAGE HERO ===== */}
      <section className="page-hero">
        <div className="ph-title">
          <h1 className="anim-text-up">The Book</h1>
        </div>
        <div className="ph-meta rv">
          <div className="ph-meta-grid">
            <span className="ph-meta-lbl">[BOOK]</span>
            <p className="ph-meta-desc">
              <strong>In Sequence is a field manual</strong> for creative
              professionals navigating the restructuring of the creative
              economy. 35 deal structures, a four-stage progression from
              execution to ownership, and the frameworks behind capturing
              long-term value in a world where execution is being commoditized.
            </p>
          </div>
        </div>
      </section>

      {/* ===== INTRO ===== */}
      <section className="book-intro">
        <div className="book-intro-grid">
          <div className="book-intro-cover rv">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/sequence-about-hero.jpg"
              alt="In Sequence — The Book"
            />
          </div>
          <div className="book-intro-text rv rv-d1">
            <p>
              The creative economy is restructuring. AI is compressing
              execution into commodity. Taste, judgment, and discernment are
              where scarcity — and therefore capital — is moving.
            </p>
            <p>
              Most creatives aren&apos;t positioned to capture that value. This
              book is the framework for getting there: 35 deal structures, a
              four-stage progression from execution to ownership, and dozens
              of case studies showing how creative professionals across
              industries have built durable leverage.
            </p>
            <p>
              Built on 20,000+ miles of primary research, 65+ interviews with
              operators and investors, and fifteen years of building agencies,
              advising funds, and hosting creative platforms.
            </p>
          </div>
        </div>
      </section>

      {/* ===== KEY THEMES ===== */}
      <section className="book-themes">
        <div className="book-themes-head">
          <h2 className="anim-text-up">What You&apos;ll Learn</h2>
        </div>
        <div className="book-themes-grid">
          {THEMES.map((theme, i) => (
            <div
              key={theme.num}
              className={`book-theme-card rv${i > 0 ? ` rv-d${Math.min(i, 5)}` : ""}`}
            >
              <span className="book-theme-num">[{theme.num}]</span>
              <h3 className="book-theme-title">{theme.title}</h3>
              <p className="book-theme-desc">{theme.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== ABOUT THE AUTHOR ===== */}
      <section className="book-author">
        <div className="book-author-head">
          <h2 className="anim-text-up">About the Author</h2>
        </div>
        <div className="book-author-grid">
          <div className="book-author-bio rv">
            <p>
              <strong>Neil Brown</strong> is an operator, strategist, and
              investor focused on the intersection of creative work and
              capital. Over fifteen years he has built agencies, advised
              ventures and investment funds, hosted creative platforms, and
              worked directly with the practitioners shaping the creative
              economy.
            </p>
            <p>
              In Sequence is the synthesis of that work — a framework for
              creative professionals to understand the forces reshaping their
              industries and capture the value they create.
            </p>
          </div>
        </div>
      </section>

      {/* ===== DOWNLOAD CTA ===== */}
      <section className="book-cta">
        <div className="book-cta-inner">
          <h2 className="book-cta-title anim-text-up">
            Download
            <br />
            In Sequence
          </h2>
          <p className="book-cta-desc rv rv-d1">
            Free. Just enter your name and email and we&apos;ll send the PDF
            and add you to the newsletter.
          </p>
          <div className="book-cta-form rv rv-d2">
            <BookDownloadForm variant="dark" />
          </div>
        </div>
      </section>
    </>
  );
}
