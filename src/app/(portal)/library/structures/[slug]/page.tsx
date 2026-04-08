import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getStructureBySlug, getAllStructures } from "@/lib/content";
import { structureMdxComponents } from "@/components/mdx/structure";
import Link from "next/link";
import StructureNav from "@/components/portal/structure-nav";
import SaveButton from "@/components/portal/save-button";

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

  /* Build prev/next data for sequential nav */
  const all = getAllStructures();
  const idx = all.findIndex((s) => s.slug === slug);
  const total = all.length;
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx < total - 1 ? all[idx + 1] : null;
  const numPadded = String(meta.number).padStart(2, "0");

  return (
    <>
      {/* ── Back link ── */}
      <div className="str-back rv vis">
        <Link href="/library/structures">
          <svg viewBox="0 0 12 12" fill="none" width={10} height={10}>
            <path
              d="M10 6H2M2 6L6 2M2 6L6 10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>{" "}
          All Structures
        </Link>
      </div>

      {/* ── Meta row — tags left, save button right ── */}
      <div className="str-meta rv vis">
        <div className="str-meta-tags">
          <span className="str-meta-num">[{numPadded}/{total}]</span>
          <span className="str-meta-dot" />
          <span className="str-meta-cat">{meta.category || meta.stage}</span>
          <span className="str-meta-dot" />
          <span className="str-meta-cat">{meta.risk}</span>
        </div>
        <SaveButton contentType="structure" slug={slug} />
      </div>

      {/* ── Title ── */}
      <h1 className="str-title rv vis">{meta.title}</h1>

      {/* ── Tagline ── */}
      {meta.tagline && (
        <p className="str-tagline rv vis rv-d1">{meta.tagline}</p>
      )}

      {/* ── Sequential nav ── */}
      <StructureNav
        current={meta.number}
        total={total}
        prev={prev ? { slug: prev.slug, title: prev.title, number: prev.number } : null}
        next={next ? { slug: next.slug, title: next.title, number: next.number } : null}
      />

      {/* ── Stats bar ── */}
      {meta.stats && meta.stats.length > 0 && (
        <div className="str-stats-inner rv vis rv-d1">
          {meta.stats.map((s) => (
            <div key={s.label} className="str-stat">
              <span className="str-stat-lbl">{s.label}</span>
              <span className="str-stat-val">{s.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── MDX body ── */}
      <div className="str-body rv vis rv-d2">
        <MDXRemote source={content} components={structureMdxComponents} />
      </div>

      {/* ── Footer nav ── */}
      <div className="str-footer-nav">
        {prev ? (
          <Link href={`/library/structures/${prev.slug}`}>
            <svg viewBox="0 0 12 12" fill="none" width={10} height={10}>
              <path
                d="M10 6H2M2 6L6 2M2 6L6 10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>{" "}
            #{String(prev.number).padStart(2, "0")} {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={`/library/structures/${next.slug}`}>
            #{String(next.number).padStart(2, "0")} {next.title}{" "}
            <svg viewBox="0 0 12 12" fill="none" width={10} height={10}>
              <path
                d="M2 6H10M10 6L6 2M10 6L6 10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        ) : (
          <span />
        )}
      </div>

      <div className="page-footer" />
    </>
  );
}
