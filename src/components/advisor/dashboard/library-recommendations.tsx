"use client";

import Link from "next/link";
import { resolveStructureSlug } from "@/lib/structure-slugs";

interface LibraryRecommendationsProps {
  structures: { id: number; slug?: string; title: string; why: string }[];
  cases: { slug: string; title: string; why: string }[];
}

export default function LibraryRecommendations({
  structures,
  cases,
}: LibraryRecommendationsProps) {
  if (structures.length === 0 && cases.length === 0) return null;

  return (
    <div className="adv-dash-library">
      <div className="adv-dash-library-grid">
        {structures.slice(0, 4).map((s) => {
          const slug = s.slug ? resolveStructureSlug(s.slug) : resolveStructureSlug(s.id);
          return (
            <Link
              key={s.id}
              href={`/library/structures/${slug}`}
              className="adv-dash-library-card"
            >
              <span className="adv-dash-library-card-type">Structure</span>
              <h4 className="adv-dash-library-card-title">
                #{s.id} {s.title}
              </h4>
              <p className="adv-dash-library-card-why">{s.why}</p>
            </Link>
          );
        })}
        {cases.slice(0, 4).map((c) => (
          <Link
            key={c.slug}
            href={`/library/case-studies/${c.slug}`}
            className="adv-dash-library-card"
          >
            <span className="adv-dash-library-card-type">Case Study</span>
            <h4 className="adv-dash-library-card-title">{c.title}</h4>
            <p className="adv-dash-library-card-why">{c.why}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
