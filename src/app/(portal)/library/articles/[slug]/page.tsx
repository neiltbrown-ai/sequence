import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getArticleBySlug, getAllArticles } from "@/lib/content";
import PageHeader from "@/components/portal/page-header";
import { mdxComponents } from "@/components/mdx";

export function generateStaticParams() {
  return getAllArticles().map((a) => ({ slug: a.slug }));
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

  return (
    <>
      <PageHeader
        title={meta.title}
        description={meta.excerpt}
        backHref="/library/articles"
        backLabel="All Articles"
      />

      <div className="rv vis" style={{ paddingBottom: "16px" }}>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          {meta.access === "member" && (
            <span className="ap-early">Early Access</span>
          )}
          <span className="struct-tag">{meta.category}</span>
          <span className="struct-tag">{meta.readTime} min read</span>
          <span className="struct-tag">
            {new Date(meta.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      <article className="mdx-content rv vis rv-d1">
        <MDXRemote source={content} components={mdxComponents} />
      </article>

      <div className="page-footer" />
    </>
  );
}
