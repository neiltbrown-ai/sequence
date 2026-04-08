"use client";

interface FilterTab {
  label: string;
  value: string;
}

interface FilterBarProps {
  tabs: FilterTab[];
  activeTab: string;
  onTabChange: (value: string) => void;
}

export default function FilterBar({ tabs, activeTab, onTabChange }: FilterBarProps) {
  const safeTabs = (tabs ?? []).filter((t): t is FilterTab => t != null);
  return (
    <div className="ptl-filter-bar rv vis">
      {safeTabs.map((tab) => (
        <button
          key={tab.value}
          className={`ptl-filter-tab${activeTab === tab.value ? " active" : ""}`}
          onClick={() => onTabChange(tab.value)}
          data-cursor="expand"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
