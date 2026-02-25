import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getCaseStudyBySlug, getAllCaseStudies } from "@/lib/content";
import PageHeader from "@/components/portal/page-header";
import { mdxComponents } from "@/components/mdx";

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

  const { frontmatter: meta, content } = result;

  return (
    <>
      <PageHeader
        title={meta.title}
        description={meta.excerpt}
        backHref="/library/case-studies"
        backLabel="All Case Studies"
      />

      <div className="rv vis" style={{ paddingBottom: "16px" }}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <span className="struct-tag">{meta.discipline}</span>
          <span className="struct-tag">Case Study #{meta.number}</span>
          {meta.tags?.map((tag: string) => (
            <span key={tag} className="struct-tag">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <article className="mdx-content rv vis rv-d1">
        <MDXRemote source={content} components={mdxComponents} />
      </article>

      <div className="page-footer" />
    </>
  );
}
