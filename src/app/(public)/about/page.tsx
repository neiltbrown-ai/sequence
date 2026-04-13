import Link from "next/link";
import type { Metadata } from "next";
import ButtonArrow from "@/components/ui/button-arrow";
import NewsletterForm from "@/components/newsletter-form";
import BookDownloadForm from "@/components/book-download-form";
import AsciiScatterCanvas from "@/components/ascii-scatter-canvas";

export const metadata: Metadata = {
  title: "About — In Sequence",
};

export default function AboutPage() {
  return (
    <>
      {/* ===== PAGE HERO ===== */}
      <section className="page-hero">
        <div className="ph-title">
          <h1 className="anim-text-up">About</h1>
        </div>
        <div className="ph-wide">
          <div className="ph-wide-grid">
            <div className="ph-wide-img anim-reveal-down">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/sequence-about-hero.jpg"
                alt="In Sequence"
              />
            </div>
          </div>
        </div>
        <div className="ph-meta rv">
          <div className="ph-meta-grid">
            <span className="ph-meta-lbl">[ABOUT]</span>
            <p className="ph-meta-desc">
              <strong>In Sequence is a research-backed framework</strong> for
              creative professionals navigating the restructuring of the creative
              economy. 35 deal structures, 70+ case studies, a four-stage
              progression from execution to ownership — and growing.
            </p>
          </div>
        </div>
      </section>

      {/* ===== BY THE NUMBERS ===== */}
      <section className="numbers">
        <div className="numbers-statement">
          <div className="numbers-statement-grid">
            <p className="numbers-statement-text rv">
              Built on <strong>20,000+ miles</strong> traveling the country for
              primary research, <strong>65+ interviews</strong> with creatives,
              entrepreneurs, and investors, and more than{" "}
              <strong>fifteen years</strong> building agencies, advising ventures
              and funds, and hosting creative platforms — the library keeps
              growing.
            </p>
          </div>
        </div>
        <div className="numbers-grid">
          <div className="numbers-cta rv">
            <Link href="/pricing" className="btn">
              GET IN SEQUENCE
              <ButtonArrow />
            </Link>
          </div>
          <div className="num rv">
            <span className="num-val">35+</span>
            <span className="num-lbl">DEAL STRUCTURES</span>
          </div>
          <div className="num rv rv-d1">
            <span className="num-val">70+</span>
            <span className="num-lbl">CASE STUDIES</span>
          </div>
          <div className="num rv rv-d2">
            <span className="num-val">20K</span>
            <span className="num-lbl">MILES OF RESEARCH</span>
          </div>
          <div className="num rv rv-d3">
            <span className="num-val">65+</span>
            <span className="num-lbl">INTERVIEWS CONDUCTED</span>
          </div>
          <div className="num rv rv-d4">
            <span className="num-val">15+</span>
            <span className="num-lbl">YEARS BUILDING AGENCIES</span>
          </div>
          <div className="num rv rv-d5">
            <span className="num-val">12</span>
            <span className="num-lbl">VENTURES ADVISED</span>
          </div>
          <div className="num rv rv-d6">
            <span className="num-val">5</span>
            <span className="num-lbl">FUNDS ADVISED</span>
          </div>
          <div className="num rv rv-d7">
            <span className="num-val">50+</span>
            <span className="num-lbl">COLLABORATIONS</span>
          </div>
          <div className="num rv" style={{ transitionDelay: ".48s" }}>
            <span className="num-val">&infin;</span>
            <span className="num-lbl">AND GROWING</span>
          </div>
        </div>
      </section>

      {/* ===== BOOK CALLOUT ===== */}
      <section className="book">
        <div className="book-grid">
          <div className="book-img rv">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/in-sequence-book.jpg"
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
              from execution to ownership. Built on 20,000 miles of primary
              research and years of practitioner experience.
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

      {/* ===== ADVISORY EXPERIENCE ===== */}
      <section className="advisory-exp">
        <div className="advisory-exp-head">
          <h2 className="anim-text-up">Advisory<br />Experience</h2>
        </div>
        <div className="advisory-exp-statement">
          <div className="advisory-exp-statement-grid">
            <p className="advisory-exp-statement-text rv">
              As an <strong>advisor, operator, strategist, and investor</strong>{" "}
              — working across ventures, investment funds, family offices, and
              agencies to structure deals, build ownership, and capture value in
              the creative economy.
            </p>
          </div>
        </div>
        <div className="advisory-exp-grid">
          <div className="num rv">
            <span className="num-val">50+</span>
            <span className="num-lbl">VENTURES</span>
          </div>
          <div className="num rv rv-d1">
            <span className="num-val">8</span>
            <span className="num-lbl">AGENCIES</span>
          </div>
          <div className="num rv rv-d2">
            <span className="num-val">$100M+</span>
            <span className="num-lbl">PROJECT PROPOSALS</span>
          </div>
          <div className="num rv rv-d3">
            <span className="num-val">5</span>
            <span className="num-lbl">INVESTMENT FUNDS</span>
          </div>
          <div className="num rv rv-d4">
            <span className="num-val">3</span>
            <span className="num-lbl">FAMILY OFFICES</span>
          </div>
          <div className="num rv rv-d5">
            <span className="num-val">$250M+</span>
            <span className="num-lbl">REVENUE / CAPITAL</span>
          </div>
        </div>
      </section>

      {/* ===== SPEAKING ENGAGEMENTS ===== */}
      <section className="speaking">
        <div className="speaking-head">
          <h2 className="anim-text-up">Speaking<br />Engagements</h2>
        </div>
        <div className="speaking-intro">
          <div className="speaking-intro-grid">
            <p className="speaking-intro-text rv">
              Conferences, universities, and workshops on entrepreneurship, the
              future of work, and the shifting economics of the creative class.
              Institutions include Yale, RISD, Parsons, Art Center College of
              Design, and more.
            </p>
          </div>
        </div>
        <div className="speaking-list">
          <div className="sp-row rv">
            <span className="sp-venue">
              American Advertising Federation NM
            </span>
            <span className="sp-topic">The Future of Creativity</span>
            <span className="sp-loc">ALBUQUERQUE, NM — 2016</span>
          </div>
          <div className="sp-row rv rv-d1">
            <span className="sp-venue">The Combine</span>
            <span className="sp-topic">The Future of Creativity</span>
            <span className="sp-loc">BLOOMINGTON, IN — 2016</span>
          </div>
          <div className="sp-row rv rv-d2">
            <span className="sp-venue">Art Center College of Design</span>
            <span className="sp-topic">The Future of Creativity</span>
            <span className="sp-loc">PASADENA, CA — 2015</span>
          </div>
          <div className="sp-row rv">
            <span className="sp-venue">72U at 72andSunny</span>
            <span className="sp-topic">The Future of Creativity</span>
            <span className="sp-loc">LOS ANGELES, CA — 2015</span>
          </div>
          <div className="sp-row rv rv-d1">
            <span className="sp-venue">Bitspiration</span>
            <span className="sp-topic">The Power of Story</span>
            <span className="sp-loc">KRAKOW, POLAND — 2014</span>
          </div>
          <div className="sp-row rv rv-d2">
            <span className="sp-venue">Better World by Design</span>
            <span className="sp-topic">Transforming Ideas into Enterprise</span>
            <span className="sp-loc">PROVIDENCE, RI — 2013</span>
          </div>
          <div className="sp-row rv">
            <span className="sp-venue">Parsons / The New School</span>
            <span className="sp-topic">Entrepreneurship and Design</span>
            <span className="sp-loc">NEW YORK, NY — 2013</span>
          </div>
          <div className="sp-row rv rv-d1">
            <span className="sp-venue">ADC Global StartUP Series</span>
            <span className="sp-topic">Entrepreneurship and Passion</span>
            <span className="sp-loc">NEW YORK, NY — 2013</span>
          </div>
          <div className="sp-row rv rv-d2">
            <span className="sp-venue">RISD Art of Business Conference</span>
            <span className="sp-topic">
              Transforming Inspiration into Enterprise
            </span>
            <span className="sp-loc">PROVIDENCE, RI — 2013</span>
          </div>
          <div className="sp-row rv">
            <span className="sp-venue">IncubateNYC</span>
            <span className="sp-topic">Founders Stories</span>
            <span className="sp-loc">NEW YORK, NY — 2012</span>
          </div>
          <div className="sp-row rv rv-d1">
            <span className="sp-venue">Perkins + Will</span>
            <span className="sp-topic">
              Transforming Inspiration into Enterprise
            </span>
            <span className="sp-loc">NEW YORK, NY — 2012</span>
          </div>
          <div className="sp-row rv rv-d2">
            <span className="sp-venue">Better World by Design</span>
            <span className="sp-topic">Transforming Ideas into Enterprise</span>
            <span className="sp-loc">PROVIDENCE, RI — 2012</span>
          </div>
          <div className="sp-row rv">
            <span className="sp-venue">Yale College of Art / AIGA</span>
            <span className="sp-topic">Living Principles for Design</span>
            <span className="sp-loc">NEW HAVEN, CT — 2011</span>
          </div>
          <div className="sp-row rv rv-d1">
            <span className="sp-venue">Better World by Design</span>
            <span className="sp-topic">Business and Design</span>
            <span className="sp-loc">PROVIDENCE, RI — 2010</span>
          </div>
        </div>
      </section>

      {/* ===== THE OPERATOR ===== */}
      <section className="operator">
        <div className="operator-canvas rv rv-d2">
          <AsciiScatterCanvas className="operator-canvas-el" />
        </div>
        <div className="operator-head">
          <h2 className="anim-text-up">The Operator</h2>
        </div>
        <div className="operator-body">
          <span className="operator-lbl rv">[NEIL BROWN]</span>
          <div className="operator-txt rv rv-d1">
            <p>
              <strong>Practitioner first, researcher second.</strong> More than
              fifteen years building and leading creative agencies, coaching
              startups, advising ventures, and recruiting global creative talent.
              A blue-collar background — wood shops, manufacturing floors, fork
              trucks at sixteen — that shaped a bias toward making things, not
              theorizing about them.
            </p>
            <p>
              <strong>The research started on the road.</strong> In 2016, a
              greenfield research project on the future of the creative economy:
              20,000 miles across the U.S., 65+ interviews with
              entrepreneurs, creatives, investors, artists, agencies, and
              professors. The methodology was inductive — conclusions emerged
              from evidence, not the other way around. That research became the
              thesis. The thesis became the framework. The framework became In
              Sequence.
            </p>
            <p>
              Today the work continues — expanding the library of deal
              structures and case studies, advising creative professionals on
              ownership transitions, and building the tools that help creatives
              capture the value they create. All while partnering with private
              capital partners to invest in and impact the future of
              creativity.
            </p>
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
