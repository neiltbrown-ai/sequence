import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllCaseStudies, getCaseStudyBySlug } from "@/lib/content";
import { caseStudyMdxComponents } from "@/components/mdx/case-study";
import CaseStudyHeader from "@/components/case-study-header";
import CaseStudySidenav from "@/components/case-study-sidenav";
import CaseStudyGate from "@/components/case-study-gate";
import { CaseStudyProvider } from "@/components/mdx/case-study/case-study-context";
import NewsletterForm from "@/components/newsletter-form";

export async function generateStaticParams() {
  return getAllCaseStudies().map((cs) => ({ slug: cs.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cs = getCaseStudyBySlug(slug);
  if (!cs) return { title: "Case Study" };
  const cleanTitle = cs.frontmatter.title.replace(/<br\s*\/?>/gi, " ");
  const title = `${cleanTitle}`;
  const description = cs.frontmatter.excerpt || "";
  const image = cs.frontmatter.heroImage || cs.frontmatter.coverImage || "/images/hero-portrait.png";
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: [{ url: image, width: 1200, height: 630, alt: cleanTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function PublicCaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cs = getCaseStudyBySlug(slug);
  if (!cs) notFound();

  const { frontmatter: fm, content } = cs;

  return (
    <>
      {/* Header + Hero + Stats */}
      <CaseStudyHeader
        number={fm.number}
        discipline={fm.discipline}
        readTime={fm.readTime ? String(fm.readTime) : undefined}
        title={fm.title}
        subtitle={fm.subtitle}
        heroImage={fm.heroImage || fm.coverImage}
        heroAlt={fm.heroAlt}
        heroPosition={fm.heroPosition}
        heroCredit={fm.heroCredit}
        stats={fm.stats}
        backHref="/platform"
        backLabel="Platform"
      />

      {/* Scroll-spy sidenav (public only) */}
      {fm.sections && fm.sections.length > 0 && (
        <CaseStudySidenav sections={fm.sections} />
      )}

      {/* MDX content body */}
      <CaseStudyProvider
        secondaryImage={fm.secondaryImage}
        secondaryAlt={fm.secondaryAlt}
        secondaryPosition={fm.secondaryPosition}
      >
        <div className="cs-body">
          <MDXRemote source={content} components={caseStudyMdxComponents} />
        </div>
      </CaseStudyProvider>

      {/* Membership gate CTA */}
      <CaseStudyGate ctaHref="/signup" />

      {/* Newsletter */}
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
