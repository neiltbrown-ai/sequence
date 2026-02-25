import type { Metadata } from "next";
import NewsletterForm from "@/components/newsletter-form";
import ArticlesFilter from "@/components/articles-filter";
import type { ArticleCard } from "@/components/articles-filter";
import { getAllArticles } from "@/lib/content";

export const metadata: Metadata = {
  title: "Articles — In Sequence",
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
