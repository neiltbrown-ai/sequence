import type { Metadata } from "next";
import NewsletterForm from "@/components/newsletter-form";
import ArticlesFilter from "@/components/articles-filter";
import type { ArticleCard } from "@/components/articles-filter";
import { getAllArticles } from "@/lib/content";

export const metadata: Metadata = {
  title: "Articles",
};

export default function ArticlesPage() {
  // Read article listing data from MDX frontmatter at build time
  const allArticles = getAllArticles();

  const articles: ArticleCard[] = allArticles.map((a) => ({
    slug: a.slug,
    category: a.category,
    tag: a.tag,
    date: a.date,
    title: a.title,
    excerpt: a.excerpt,
    image: a.heroImage,
  }));

  return (
    <>
      {/* PAGE HERO */}
      <section className="page-hero">
        <div className="ph-title">
          <h1 className="anim-text-up">Articles</h1>
        </div>
        <div className="ph-meta">
          <div className="ph-meta-grid">
            <span className="ph-meta-lbl rv">[THE SERIES]</span>
            <p className="ph-meta-desc rv rv-d1">
              <strong>Essays on the forces reshaping creative value</strong> —
              featuring the leaders, structures, and stories behind the creative
              economy&apos;s restructuring. New articles published weekly.
            </p>
          </div>
        </div>
      </section>

      {/* FILTER + ARTICLE CARDS + LOAD MORE (client component) */}
      <ArticlesFilter articles={articles} />

      {/* NEWSLETTER */}
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
                fontSize: "clamp(44px,7vw,84px)",
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
