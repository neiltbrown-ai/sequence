import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getArticleBySlug, getAllArticles } from "@/lib/content";
import { mdxComponents } from "@/components/mdx";
import { ArticleProvider } from "@/components/mdx/article-context";
import SaveButton from "@/components/portal/save-button";

export function generateStaticParams() {
  return getAllArticles().map((a) => ({ slug: a.slug }));
}

function formatDate(iso: string) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = getArticleBySlug(slug);

  if (!result) notFound();

  const { frontmatter: meta, content } = result;

  // Related articles
  const allArticles = getAllArticles();
  const related = (meta.relatedArticles || [])
    .map((relSlug) => allArticles.find((a) => a.slug === relSlug))
    .filter(Boolean);

  const shareUrl = encodeURIComponent(
    `https://insequence.co/articles/${meta.slug}`
  );
  const shareTitle = encodeURIComponent(meta.title);

  return (
    <>
      {/* ── Back link ── */}
      <div className="art-p-back rv vis">
        <Link href="/library/articles">
          <svg viewBox="0 0 12 12" fill="none" width={10} height={10}>
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

      {/* ── Meta row ── */}
      <div className="art-p-meta rv vis">
        <div className="art-p-meta-tags">
          <span className="art-p-meta-tag">{meta.tag}</span>
          <span className="art-p-meta-dot" />
          <span className="art-p-meta-date">{formatDate(meta.date)}</span>
          <span className="art-p-meta-dot" />
          <span className="art-p-meta-date">{meta.readTime} min read</span>
          {meta.access === "member" && (
            <>
              <span className="art-p-meta-dot" />
              <span className="ap-early">Early Access</span>
            </>
          )}
        </div>
        <SaveButton contentType="article" slug={slug} />
      </div>

      {/* ── Title ── */}
      <h1 className="art-p-title rv vis">{meta.title}</h1>

      {/* ── Subtitle ── */}
      {meta.subtitle && (
        <p className="art-p-subtitle rv vis rv-d1">{meta.subtitle}</p>
      )}

      {/* ── Hero image ── */}
      {meta.heroImage && (
        <div className="art-p-hero rv vis rv-d1">
          <div className="art-p-hero-wrap">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="art-p-hero-img"
              src={meta.heroImage}
              alt={meta.title}
            />
          </div>
        </div>
      )}

      {/* ── MDX body ── */}
      <ArticleProvider images={meta.images}>
        <article className="art-body rv vis rv-d1">
          <MDXRemote source={content} components={mdxComponents} />
        </article>
      </ArticleProvider>

      {/* ── Tags + share ── */}
      <div className="art-p-footer rv vis">
        {meta.tags && meta.tags.length > 0 && (
          <div className="art-p-footer-tags">
            {meta.tags.map((tag) => (
              <span key={tag} className="art-p-footer-tag">
                {tag
                  .split("-")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ")}
              </span>
            ))}
          </div>
        )}
        <div className="art-p-footer-share">
          <span className="art-p-footer-share-lbl">Share</span>
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
          <a href={`mailto:?subject=${shareTitle}&body=${shareUrl}`}>Email</a>
        </div>
      </div>

      {/* ── Author ── */}
      {meta.author && (
        <div className="art-p-author rv vis">
          <span className="art-p-author-lbl">Written by</span>
          <div className="art-p-author-row">
            {meta.authorImage && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                className="art-p-author-avatar"
                src={meta.authorImage}
                alt={meta.author}
              />
            )}
            <div className="art-p-author-info">
              <span className="art-p-author-name">{meta.author}</span>
              {meta.authorBio && (
                <p className="art-p-author-bio">{meta.authorBio}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Related articles ── */}
      {related.length > 0 && (
        <div className="art-p-related rv vis">
          <span className="art-p-related-lbl">Continue Reading</span>
          <div className="art-p-related-list">
            {related.map((rel) => (
              <Link
                key={rel!.slug}
                href={`/library/articles/${rel!.slug}`}
                className="art-p-related-item"
              >
                <div className="art-p-related-item-meta">
                  <span className="art-p-related-item-tag">
                    {rel!.tag.replace(/[\[\]]/g, "")}
                  </span>
                  <span className="art-p-meta-dot" />
                  <span className="art-p-related-item-time">
                    {rel!.readTime} min
                  </span>
                </div>
                <span className="art-p-related-item-title">{rel!.title}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="page-footer" />
    </>
  );
}
