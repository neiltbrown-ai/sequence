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
  return (
    <div className="ptl-filter-bar rv vis">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          className={`ptl-filter-tab${activeTab === tab.value ? " active" : ""}`}
          onClick={() => onTabChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
