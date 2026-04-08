import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getCaseStudyBySlug, getAllCaseStudies } from "@/lib/content";
import { caseStudyMdxComponents } from "@/components/mdx/case-study";
import CaseStudyHeader from "@/components/case-study-header";
import CaseStudyCoachingCta from "@/components/case-study-coaching-cta";
import SaveButton from "@/components/portal/save-button";
import { CaseStudyProvider } from "@/components/mdx/case-study/case-study-context";

export function generateStaticParams() {
  return getAllCaseStudies().map((s) => ({ slug: s.slug }));
}

export default async function CaseStudyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = getCaseStudyBySlug(slug);

  if (!result) notFound();

  const { frontmatter: fm, content } = result;

  return (
    <>
      <CaseStudyHeader
        number={fm.number}
        discipline={fm.discipline}
        readTime={fm.readTime ? String(fm.readTime) : undefined}
        title={fm.title}
        subtitle={fm.subtitle}
        heroImage={fm.heroImage || fm.coverImage}
        heroAlt={fm.heroAlt}
        heroPosition={fm.heroPosition}
        stats={fm.stats}
        backHref="/library/case-studies"
        backLabel="All Case Studies"
        saveButton={<SaveButton contentType="case_study" slug={slug} />}
      />

      <CaseStudyProvider
        secondaryImage={fm.secondaryImage}
        secondaryAlt={fm.secondaryAlt}
        secondaryPosition={fm.secondaryPosition}
      >
        <div className="cs-body">
          <MDXRemote source={content} components={caseStudyMdxComponents} />
        </div>
      </CaseStudyProvider>

      <CaseStudyCoachingCta />

      <div className="page-footer" />
    </>
  );
}
