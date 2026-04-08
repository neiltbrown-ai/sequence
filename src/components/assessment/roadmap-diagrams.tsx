"use client";

import { useState } from "react";
import type { StrategicRoadmap } from "@/types/assessment";
import RoadmapEntityDiagram from "./roadmap-entity-diagram";
import RoadmapFlywheel from "./roadmap-flywheel";

interface Props {
  entityStructure?: StrategicRoadmap["entity_structure"];
  valueFlywheel?: StrategicRoadmap["value_flywheel"];
}

export default function RoadmapDiagrams({ entityStructure, valueFlywheel }: Props) {
  const hasEntity = entityStructure && entityStructure.children.length > 0;
  const hasFlywheel = valueFlywheel && valueFlywheel.nodes.length > 0;

  const tabs: { label: string; key: string }[] = [];
  if (hasEntity) tabs.push({ label: "Entity Structure", key: "entity" });
  if (hasFlywheel) tabs.push({ label: "Value Flywheel", key: "flywheel" });

  const [activeTab, setActiveTab] = useState(0);

  if (tabs.length === 0) return null;

  return (
    <div className="rdmp-diagrams-tabs">
      {tabs.length > 1 && (
        <div className="cb-tiers-tabs">
          {tabs.map((tab, i) => (
            <button
              key={tab.key}
              type="button"
              className={`cb-tier-tab${i === activeTab ? " active" : ""}`}
              onClick={() => setActiveTab(i)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
      {tabs.length === 1 && (
        <div className="rdmp-diagrams-single-title">
          <span className="str-stat-lbl">{tabs[0].label}</span>
        </div>
      )}
      <div className="rdmp-diagrams-panel">
        {tabs[activeTab]?.key === "entity" && hasEntity && (
          <RoadmapEntityDiagram data={entityStructure!} />
        )}
        {tabs[activeTab]?.key === "flywheel" && hasFlywheel && (
          <RoadmapFlywheel data={valueFlywheel!} />
        )}
      </div>
    </div>
  );
}
