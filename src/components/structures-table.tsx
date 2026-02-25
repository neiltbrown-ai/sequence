"use client";

import { useState, useRef, useCallback } from "react";

export interface StructureItem {
  num: string;
  title: string;
  risk: string;
  desc: string;
  tag: string;
}

type TabKey = "models" | "deals";

export default function StructuresTable({
  models,
  deals,
}: {
  models: StructureItem[];
  deals: StructureItem[];
}) {
  const [activeTab, setActiveTab] = useState<TabKey>("models");
  const [scrolledBottom, setScrolledBottom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleTabClick = useCallback((tab: TabKey) => {
    setActiveTab(tab);
    setScrolledBottom(false);
    // Reset scroll on next render
    setTimeout(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }, 0);
  }, []);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const el = scrollRef.current;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 10;
    setScrolledBottom(atBottom);
  }, []);

  const items = activeTab === "models" ? models : deals;

  return (
    <div className={`structures-table rv vis rv-d1${scrolledBottom ? " scrolled-bottom" : ""}`}>
      <div className="structures-tabs">
        <button
          className={`structures-tab${activeTab === "models" ? " active" : ""}`}
          onClick={() => handleTabClick("models")}
        >
          BUSINESS MODELS ({models.length})
        </button>
        <button
          className={`structures-tab${activeTab === "deals" ? " active" : ""}`}
          onClick={() => handleTabClick("deals")}
        >
          COMPENSATION STRUCTURES ({deals.length})
        </button>
      </div>

      <div
        className="structures-scroll"
        ref={scrollRef}
        onScroll={handleScroll}
      >
        {items.map((item, i) => (
          <div className="str-card" key={`${activeTab}-${i}`}>
            <span className="str-num">{item.num}</span>
            <div className="str-main">
              <span className="str-title">{item.title}</span>
              <span className="str-risk">{item.risk}</span>
            </div>
            <p className="str-desc">{item.desc}</p>
            <span className="str-tag">{item.tag}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
