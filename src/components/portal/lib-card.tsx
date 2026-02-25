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
}: LibCardProps) {
  return (
    <Link href={href} className={`lib-card${className ? ` ${className}` : ""}`}>
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
    </Link>
  );
}
