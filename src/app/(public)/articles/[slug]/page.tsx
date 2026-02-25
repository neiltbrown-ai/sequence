import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllArticles, getArticleBySlug } from "@/lib/content";
import { mdxComponents } from "@/components/mdx";
import ButtonArrow from "@/components/ui/button-arrow";
import NewsletterForm from "@/components/newsletter-form";

export async function generateStaticParams() {
  return getAllArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return { title: "Article — In Sequence" };
  return { title: `${article.frontmatter.title} — In Sequence` };
}

function formatDateLong(iso: string) {
  const d = new Date(iso + "T12:00:00");
  return d
    .toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const { frontmatter: fm, content } = article;

  // Related articles
  const allArticles = getAllArticles();
  const related = (fm.relatedArticles || [])
    .map((relSlug) => allArticles.find((a) => a.slug === relSlug))
    .filter(Boolean);

  // Display-friendly tag names
  const displayTags = (fm.tags || []).map((t) =>
    t
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
  );

  const shareUrl = encodeURIComponent(
    `https://insequence.co/articles/${fm.slug}`
  );
  const shareTitle = encodeURIComponent(fm.title);

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
              <span className="art-header-tag">{fm.tag}</span>
              <span className="art-header-dot"></span>
              <span className="art-header-date">
                {formatDateLong(fm.date)}
              </span>
              <span className="art-header-dot"></span>
              <span className="art-header-read">{fm.readTime} MIN READ</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="art-header-title rv rv-d2">
          <div className="art-header-title-grid">
            <h1>{fm.title}</h1>
          </div>
        </div>

        {/* Hero image */}
        {fm.heroImage && (
          <div className="art-hero-img anim-reveal-down">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={fm.heroImage} alt={fm.title} />
          </div>
        )}
      </header>

      {/* ARTICLE BODY — rendered from MDX */}
      <article className="art-body">
        <MDXRemote source={content} components={mdxComponents} />
      </article>

      {/* ARTICLE FOOTER — tags + share */}
      <section className="art-footer">
        <div className="art-footer-grid">
          <div className="art-footer-inner rv">
            <div className="art-footer-tags">
              {displayTags.map((tag) => (
                <Link key={tag} href="/articles" className="art-footer-tag">
                  {tag}
                </Link>
              ))}
            </div>
            <div className="art-footer-share">
              <span className="art-footer-share-lbl">Share</span>
              <a
                href={`https://x.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                X
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
              <a href={`mailto:?subject=${shareTitle}&body=${shareUrl}`}>
                Email
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* AUTHOR BYLINE */}
      {fm.author && (
        <section className="author">
          <div className="author-grid rv">
            <div className="author-content">
              {fm.authorImage && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  className="author-avatar"
                  src={fm.authorImage}
                  alt={fm.author}
                />
              )}
              <div className="author-info">
                <span className="author-name">{fm.author}</span>
                {fm.authorBio && (
                  <p className="author-bio">{fm.authorBio}</p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* RELATED ARTICLES */}
      {related.length > 0 && (
        <section className="related">
          <div className="related-head">
            <h2 className="anim-text-up" style={{ lineHeight: ".82" }}>
              Continue
              <br />
              Reading
            </h2>
          </div>
          <div className="related-list">
            {related.map((rel, i) => (
              <div
                className={`a-row rv${i > 0 ? ` rv-d${i}` : ""}`}
                key={rel!.slug}
              >
                <span className="a-num">
                  [{String(i + 1).padStart(2, "0")}]
                </span>
                <div className="a-title">
                  <Link href={`/articles/${rel!.slug}`}>{rel!.title}</Link>
                </div>
                <span className="a-pub">
                  {rel!.tag.replace(/[\[\]]/g, "")}
                </span>
                <span className="a-link">
                  <Link href={`/articles/${rel!.slug}`} className="btn">
                    READ
                    <ButtonArrow />
                  </Link>
                </span>
              </div>
            ))}
          </div>
          <div className="related-foot rv">
            <Link href="/articles" className="btn">
              View All Articles
              <ButtonArrow />
            </Link>
          </div>
        </section>
      )}

      {/* CTA CALLOUT */}
      {fm.relatedStructures && fm.relatedStructures.length > 0 && (
        <div className="art-cta rv">
          <div className="art-cta-content">
            <span className="art-cta-lbl">[THE LIBRARY]</span>
            <h3 className="art-cta-title">
              35 deal structures for creative professionals building ownership.
            </h3>
            <p className="art-cta-desc">
              This article references{" "}
              {fm.relatedStructures.map((n, i) => (
                <span key={n}>
                  {i > 0 && " and "}
                  <strong>Structure {n}</strong>
                </span>
              ))}{" "}
              from the In Sequence library. The full collection maps the
              progression from execution-based to ownership-based compensation.
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
      )}

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
