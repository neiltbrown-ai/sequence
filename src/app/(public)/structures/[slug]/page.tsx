import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getStructureBySlug, getAllStructures } from "@/lib/content";
import { structureMdxComponents } from "@/components/mdx/structure";
import Link from "next/link";
import ButtonArrow from "@/components/ui/button-arrow";
import NewsletterForm from "@/components/newsletter-form";

export function generateStaticParams() {
  return getAllStructures().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = getStructureBySlug(slug);
  if (!result) return { title: "Structure — In Sequence" };
  return { title: `${result.frontmatter.title} — In Sequence` };
}

export default async function PublicStructurePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = getStructureBySlug(slug);
  if (!result) notFound();

  const { frontmatter: meta, content } = result;
  const numPadded = String(meta.number).padStart(2, "0");

  return (
    <>
      {/* ── Header ── */}
      <section className="page-hero">
        <div className="ph-title">
          <h1 className="anim-text-up">{meta.title}</h1>
        </div>
        <div className="ph-meta rv">
          <div className="ph-meta-grid">
            <span className="ph-meta-lbl">
              [STRUCTURE {numPadded}] — {meta.risk}
            </span>
            <p className="ph-meta-desc">
              {meta.excerpt}
            </p>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      {meta.stats && meta.stats.length > 0 && (
        <div className="pub-str-stats rv">
          <div className="pub-str-stats-inner">
            {meta.stats.map((s) => (
              <div key={s.label} className="pub-str-stat">
                <span className="pub-str-stat-lbl">{s.label}</span>
                <span className="pub-str-stat-val">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MDX body ── */}
      <div className="pub-str-body rv rv-d1">
        <MDXRemote source={content} components={structureMdxComponents} />
      </div>

      {/* ── Membership gate ── */}
      <section className="pub-str-gate rv">
        <div className="pub-str-gate-inner">
          <span className="pub-str-gate-lbl">[IN SEQUENCE MEMBERSHIP]</span>
          <h2 className="pub-str-gate-title">
            Get the full library.
          </h2>
          <p className="pub-str-gate-desc">
            35 deal structures with negotiation scripts, decision checklists,
            and real-world case studies. Plus 70+ case studies across creative
            industries.
          </p>
          <Link href="/pricing" className="btn btn--white">
            GET IN SEQUENCE
            <ButtonArrow />
          </Link>
        </div>
      </section>

      {/* ── Newsletter ── */}
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
              Updates on the restructuring. Emerging trends, new structures,
              and opportunities for creative professionals building ownership.
            </p>
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  );
}
