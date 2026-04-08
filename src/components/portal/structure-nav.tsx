import Link from "next/link";

interface StructureNavProps {
  current: number;
  total: number;
  prev: { slug: string; title: string; number: number } | null;
  next: { slug: string; title: string; number: number } | null;
}

export default function StructureNav({
  current,
  total,
  prev,
  next,
}: StructureNavProps) {
  return (
    <div className="str-seq">
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

      <span className="str-seq-current">
        {String(current).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </span>

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
  );
}
