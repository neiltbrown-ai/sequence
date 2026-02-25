import PageHeader from "@/components/portal/page-header";

const GUIDES = [
  {
    type: "Foundation",
    title: "Deals Foundation Guide",
    desc: "The core framework for understanding how deal structures map to value capture — start here if the thesis is new to you.",
    icon: (
      <svg viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1">
        <rect x="8" y="6" width="44" height="48" rx="2" />
        <line x1="16" y1="16" x2="44" y2="16" />
        <line x1="16" y1="24" x2="44" y2="24" />
        <line x1="16" y1="32" x2="36" y2="32" />
        <line x1="16" y1="40" x2="28" y2="40" />
        <circle cx="40" cy="40" r="6" />
        <line x1="40" y1="37" x2="40" y2="43" />
        <line x1="37" y1="40" x2="43" y2="40" />
      </svg>
    ),
  },
  {
    type: "Industry",
    title: "Industry Structures Guide",
    desc: "How deal structures vary across design, music, film, writing, marketing, and technology sectors.",
    icon: (
      <svg viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1">
        <rect x="6" y="10" width="20" height="40" rx="2" />
        <rect x="34" y="6" width="20" height="44" rx="2" />
        <line x1="12" y1="18" x2="20" y2="18" />
        <line x1="12" y1="24" x2="20" y2="24" />
        <line x1="12" y1="30" x2="18" y2="30" />
        <line x1="40" y1="14" x2="48" y2="14" />
        <line x1="40" y1="20" x2="48" y2="20" />
        <line x1="40" y1="26" x2="46" y2="26" />
        <path d="M26 30 L34 30" strokeDasharray="2 2" />
      </svg>
    ),
  },
  {
    type: "Negotiation",
    title: "Negotiation Playbook",
    desc: "Scripts, frameworks, and red-flag identification for real-world deal conversations.",
    icon: (
      <svg viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M10 44 L30 12 L50 44 Z" />
        <circle cx="30" cy="30" r="4" />
        <line x1="30" y1="22" x2="30" y2="26" />
        <line x1="30" y1="34" x2="30" y2="38" />
        <line x1="24" y1="30" x2="20" y2="30" />
        <line x1="36" y1="30" x2="40" y2="30" />
      </svg>
    ),
  },
  {
    type: "Strategy",
    title: "Decision Framework",
    desc: "Scoring tools and weighted criteria for evaluating any deal against your specific career stage and risk tolerance.",
    icon: (
      <svg viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1">
        <rect x="8" y="8" width="18" height="18" rx="2" />
        <rect x="34" y="8" width="18" height="18" rx="2" />
        <rect x="8" y="34" width="18" height="18" rx="2" />
        <rect x="34" y="34" width="18" height="18" rx="2" />
        <polyline points="13,18 16,21 23,14" />
        <polyline points="39,18 42,21 49,14" />
        <polyline points="13,44 16,47 23,40" />
        <line x1="39" y1="43" x2="49" y2="43" />
      </svg>
    ),
  },
  {
    type: "Planning",
    title: "Strategic Roadmap",
    desc: "Planning your progression through stages — when to make the move, what to negotiate first, and how to sequence growth.",
    icon: (
      <svg viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1">
        <circle cx="12" cy="48" r="4" />
        <circle cx="30" cy="30" r="4" />
        <circle cx="48" cy="12" r="4" />
        <path d="M16 46 Q22 40 26 34" />
        <path d="M34 26 Q38 18 44 14" />
        <line x1="8" y1="52" x2="52" y2="8" strokeDasharray="2 4" strokeWidth="0.5" />
      </svg>
    ),
  },
  {
    type: "Legal",
    title: "Rights & Ownership Primer",
    desc: "Understanding intellectual property, master rights, licensing structures, and how ownership determines long-term value.",
    icon: (
      <svg viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M30 6 L50 16 V34 C50 46 30 54 30 54 C30 54 10 46 10 34 V16 Z" />
        <circle cx="30" cy="30" r="6" />
        <line x1="30" y1="27" x2="30" y2="33" />
        <line x1="27" y1="30" x2="33" y2="30" />
      </svg>
    ),
  },
];

export default function GuidesPage() {
  return (
    <>
      <PageHeader
        title="Reference Guides"
        description="Practical guides for evaluating, negotiating, and structuring deals across creative industries."
        count={`${GUIDES.length} GUIDES`}
        backHref="/dashboard"
        backLabel="Dashboard"
      />

      <div className="guide-grid">
        {GUIDES.map((guide, i) => (
          <div
            key={guide.title}
            className={`guide-card rv vis rv-d${Math.min(i + 1, 6)}`}
          >
            <div className="guide-card-icon">{guide.icon}</div>
            <div className="guide-card-type">{guide.type}</div>
            <div className="guide-card-title">{guide.title}</div>
            <div className="guide-card-desc">{guide.desc}</div>
          </div>
        ))}
      </div>

      <div className="page-footer" />
    </>
  );
}
