"use client";

interface ChatProgressBarProps {
  currentSection: number;
  totalSections: number;
  sectionName?: string;
}

const SECTION_NAMES: Record<number, string> = {
  1: "Identity",
  2: "Energy",
  3: "Reality",
  4: "Deep Dive",
  5: "Vision",
};

export default function ChatProgressBar({
  currentSection,
  totalSections,
  sectionName,
}: ChatProgressBarProps) {
  const progress = (currentSection / totalSections) * 100;
  const name = sectionName || SECTION_NAMES[currentSection] || `Section ${currentSection}`;

  return (
    <div className="adv-chat-progress">
      <div className="adv-chat-progress-bar">
        <div
          className="adv-chat-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="adv-chat-progress-label">
        {name} &middot; {currentSection} of {totalSections}
      </span>
    </div>
  );
}
