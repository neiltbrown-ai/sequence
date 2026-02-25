"use client";

import { useState } from "react";
import Link from "next/link";
import FilterBar from "./filter-bar";
import StagePills from "./stage-pills";
import type { StructureMeta } from "@/lib/content";

const TABS = [
  { label: "All", value: "all" },
  { label: "Business Models", value: "business-model" },
  { label: "Compensation", value: "compensation" },
];

const STAGES = ["Stage 1", "Stage 2", "Stage 3", "Stage 4"];

interface StructuresFiltersProps {
  models: StructureMeta[];
  compensation: StructureMeta[];
  all: StructureMeta[];
}

export default function StructuresFilters({
  models,
  compensation,
  all,
}: StructuresFiltersProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [activeStage, setActiveStage] = useState("all");

  let filtered = activeTab === "all"
    ? all
    : activeTab === "business-model"
    ? models
    : compensation;

  if (activeStage !== "all") {
    filtered = filtered.filter((s) =>
      s.stage.toLowerCase().includes(activeStage.toLowerCase())
    );
  }

  return (
    <>
      <FilterBar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      <StagePills stages={STAGES} activeStage={activeStage} onStageChange={setActiveStage} />

      <div className="struct-list">
        {filtered.map((s, i) => (
          <Link
            key={s.slug}
            href={`/library/structures/${s.slug}`}
            className={`struct-row rv vis rv-d${Math.min(i + 1, 6)}`}
          >
            <span className="struct-num">{String(s.number).padStart(2, "0")}</span>
            <div className="struct-info">
              <div className="struct-name">{s.title}</div>
              <div className="struct-sub">{s.excerpt}</div>
            </div>
            <div className="struct-tags">
              <span className="struct-tag">{s.stage}</span>
              <span className="struct-tag">{s.risk}</span>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
