import Link from "next/link";
import type { Metadata } from "next";
import ButtonArrow from "@/components/ui/button-arrow";
import NewsletterForm from "@/components/newsletter-form";

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
                src="https://framerusercontent.com/images/zuq4iDlcKXpR8Kx3yWfaexbxrBs.jpg?width=2400&height=3600"
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
              economy. 35 deal structures, 37 case studies, a four-stage
              progression from execution to ownership — and growing.
            </p>
          </div>
        </div>
      </section>

      {/* ===== THE THESIS ===== */}
      <section className="thesis">
        <div className="thesis-head">
          <h2 className="anim-text-up">The Thesis</h2>
        </div>
        <div className="thesis-intro">
          <div className="thesis-intro-grid">
            <p className="thesis-intro-text rv">
              <strong>Three forces are converging</strong> to reshape the
              creative economy. Those who understand the pattern — and structure
              accordingly — capture asymmetric advantage. Those who don&apos;t
              feel the squeeze from both directions.
            </p>
          </div>
        </div>
        <div className="thesis-grid">
          <div className="tf rv">
            <span className="tf-num">[01]</span>
            <span className="tf-title">Creativity Financializes</span>
            <p className="tf-desc">
              Creative output transforms from an expense line into an investable
              asset class. Music catalogs generate securities. Creators build
              billion-dollar holding companies. Private equity deploys $1.2
              trillion toward creative assets.
            </p>
          </div>
          <div className="tf rv rv-d1">
            <span className="tf-num">[02]</span>
            <span className="tf-title">Vision Becomes Scarce</span>
            <p className="tf-desc">
              AI commoditizes execution, revealing what was always valuable:
              judgment, taste, and the ability to see where culture moves before
              data confirms it. The 40–70x gap between median and top-tier
              creatives reflects vision, not skill.
            </p>
          </div>
          <div className="tf rv rv-d2">
            <span className="tf-num">[03]</span>
            <span className="tf-title">Capital Restructures</span>
            <p className="tf-desc">
              Value capture shifts from time-based to outcome-based
              compensation. Equity, profit participation, royalties, and
              licensing agreements tie compensation to value created — not time
              spent.
            </p>
          </div>
        </div>
      </section>

      {/* ===== BOOK CALLOUT ===== */}
      <section className="book">
        <div className="book-grid">
          <div className="book-img rv">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://framerusercontent.com/images/zuq4iDlcKXpR8Kx3yWfaexbxrBs.jpg?width=2400&height=3600"
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
            <div className="book-buttons rv rv-d2">
              <Link href="/contact" className="btn btn--white">
                DOWNLOAD BOOK
                <ButtonArrow />
              </Link>
              <Link href="/contact" className="btn btn--white">
                AUDIOBOOK
                <ButtonArrow />
              </Link>
            </div>
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
            <span className="num-val">37+</span>
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

      {/* ===== ARTICLES ===== */}
      <section className="articles">
        <div className="articles-head">
          <h2 className="anim-text-up">Articles</h2>
        </div>
        <div className="articles-intro">
          <div className="articles-intro-grid">
            <p className="articles-intro-text rv">
              <strong>A growing series</strong> of essays on the forces
              reshaping creative value — featuring the leaders, structures, and
              stories of the creative economy.
            </p>
          </div>
        </div>
        <div className="articles-list">
          <div className="a-row rv">
            <span className="a-num">[01]</span>
            <div className="a-title">
              <a href="https://medium.com/@neiltbrown/embrace-disruption-key-factors-shaping-the-future-of-creativity-b46ef2f76e43">
                Embrace Disruption: Key Factors Shaping the Future of Creativity
              </a>
            </div>
            <span className="a-pub">HOW MAGAZINE</span>
            <span className="a-link">
              <a
                href="https://medium.com/@neiltbrown/embrace-disruption-key-factors-shaping-the-future-of-creativity-b46ef2f76e43"
                className="btn"
              >
                READ
                <ButtonArrow />
              </a>
            </span>
          </div>
          <div className="a-row rv rv-d1">
            <span className="a-num">[02]</span>
            <div className="a-title">
              <a href="https://medium.com/@neiltbrown/jeff-jackson-the-artist-desires-to-be-understood-e8c49293c56">
                Jeff Jackson: The Artist Desires to Be Understood
              </a>
            </div>
            <span className="a-pub">HOW MAGAZINE</span>
            <span className="a-link">
              <a
                href="https://medium.com/@neiltbrown/jeff-jackson-the-artist-desires-to-be-understood-e8c49293c56"
                className="btn"
              >
                READ
                <ButtonArrow />
              </a>
            </span>
          </div>
          <div className="a-row rv rv-d2">
            <span className="a-num">[03]</span>
            <div className="a-title">
              <a href="https://medium.com/@neiltbrown/building-community-through-a-common-passion-of-the-craftsman-86946349eb5d">
                2nd Shift Design Co: Building Community Through Craft
              </a>
            </div>
            <span className="a-pub">HOW MAGAZINE</span>
            <span className="a-link">
              <a
                href="https://medium.com/@neiltbrown/building-community-through-a-common-passion-of-the-craftsman-86946349eb5d"
                className="btn"
              >
                READ
                <ButtonArrow />
              </a>
            </span>
          </div>
          <div className="a-row rv rv-d3">
            <span className="a-num">[04]</span>
            <div className="a-title">
              <a href="https://medium.com/@neiltbrown/the-future-of-creativity-work-is-forever-changed-cb9c74ed5549">
                The Future of Creativity: Work Is Forever Changed
              </a>
            </div>
            <span className="a-pub">HOW MAGAZINE</span>
            <span className="a-link">
              <a
                href="https://medium.com/@neiltbrown/the-future-of-creativity-work-is-forever-changed-cb9c74ed5549"
                className="btn"
              >
                READ
                <ButtonArrow />
              </a>
            </span>
          </div>
          <div className="a-row rv rv-d4">
            <span className="a-num">[05]</span>
            <div className="a-title">
              <a href="https://medium.com/@neiltbrown/the-future-of-creativity-understanding-value-4a3bf990fe97">
                The Future of Creativity: Understanding Value
              </a>
            </div>
            <span className="a-pub">HOW MAGAZINE</span>
            <span className="a-link">
              <a
                href="https://medium.com/@neiltbrown/the-future-of-creativity-understanding-value-4a3bf990fe97"
                className="btn"
              >
                READ
                <ButtonArrow />
              </a>
            </span>
          </div>
          <div className="a-row rv rv-d4">
            <span className="a-num">[06]</span>
            <div className="a-title">
              <a href="https://medium.com/@neiltbrown/the-future-of-creativity-the-only-constant-in-life-is-change-ed27e8cb3d47">
                The Future of Creativity: The Only Constant in Life Is Change
              </a>
            </div>
            <span className="a-pub">HOW MAGAZINE</span>
            <span className="a-link">
              <a
                href="https://medium.com/@neiltbrown/the-future-of-creativity-the-only-constant-in-life-is-change-ed27e8cb3d47"
                className="btn"
              >
                READ
                <ButtonArrow />
              </a>
            </span>
          </div>
        </div>
        <div className="articles-foot">
          <Link href="/articles" className="btn rv">
            VIEW ALL ARTICLES
            <ButtonArrow />
          </Link>
        </div>
      </section>

      {/* ===== SPEAKING ===== */}
      <section className="speaking">
        <div className="speaking-head">
          <h2 className="anim-text-up">Speaking</h2>
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

      {/* ===== THE RESEARCHER ===== */}
      <section className="researcher">
        <div className="researcher-head">
          <h2 className="anim-text-up">The Researcher</h2>
        </div>
        <div className="researcher-body">
          <span className="researcher-lbl rv">[NEIL BROWN]</span>
          <div className="researcher-txt rv rv-d1">
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
              20,000 miles across the American Southwest, 65+ interviews with
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
              capture the value they create.
            </p>
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
