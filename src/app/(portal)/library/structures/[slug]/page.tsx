import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getStructureBySlug, getAllStructures } from "@/lib/content";
import PageHeader from "@/components/portal/page-header";
import { mdxComponents } from "@/components/mdx";

export function generateStaticParams() {
  return getAllStructures().map((s) => ({ slug: s.slug }));
}

export default async function StructureDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = getStructureBySlug(slug);

  if (!result) notFound();

  const { frontmatter: meta, content } = result;

  return (
    <>
      <PageHeader
        title={meta.title}
        description={meta.excerpt}
        backHref="/library/structures"
        backLabel="All Structures"
      />

      <div className="rv vis" style={{ paddingBottom: "16px" }}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <span className="struct-tag">{meta.stage}</span>
          <span className="struct-tag">{meta.risk}</span>
          <span className="struct-tag">#{meta.number}</span>
          {meta.tags?.map((tag: string) => (
            <span key={tag} className="struct-tag">{tag}</span>
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
