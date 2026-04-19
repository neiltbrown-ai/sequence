import Link from "next/link";

interface LibCardProps {
  href: string;
  type: string;
  number?: string;
  title: string;
  description: string;
  tags: string[];
  isNew?: boolean;
  className?: string;
  dark?: boolean;
  matchReason?: string;
  coverImage?: string;
}

export default function LibCard({
  href,
  type,
  number,
  title,
  description,
  tags,
  isNew,
  className = "",
  dark,
  matchReason,
  coverImage,
}: LibCardProps) {
  const hasCover = !!coverImage;
  // Use a CSS custom property for the cover image URL. The CSS rule
  // `.lib-card--cover { background-image: var(--cover-image) !important }`
  // applies it, which unconditionally overrides the conic-gradient from
  // nth-child rules. Setting `backgroundImage` directly inline was being
  // shadowed in some cascade paths (bug: gradient still showed through).
  return (
    <Link
      href={href}
      className={`lib-card${dark ? " lib-card--dark" : ""}${hasCover ? " lib-card--cover" : ""}${className ? ` ${className}` : ""}`}
      style={
        hasCover
          ? ({ "--cover-image": `url('${coverImage}')` } as React.CSSProperties)
          : undefined
      }
    >
      {isNew && <span className="lib-card-new" />}
      <div className="lib-card-type">
        {number && <span className="card-num">[{number}]</span>}
        {type}
      </div>
      <div className="lib-card-title">{title}</div>
      <div className="lib-card-desc">{description}</div>
      <div className="lib-card-meta">
        {tags.map((tag) => (
          <span key={tag} className="lib-card-tag">
            {tag}
          </span>
        ))}
      </div>
      {matchReason && (
        <div className="lib-card-match">Matches: {matchReason}</div>
      )}
    </Link>
  );
}
