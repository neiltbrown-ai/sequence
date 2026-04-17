"use client";

import { useState } from "react";
import type { StrategicRoadmap } from "@/types/assessment";
import RoadmapEntityDiagram from "./roadmap-entity-diagram";
import RoadmapFlywheel from "./roadmap-flywheel";

interface Props {
  entityStructure?: StrategicRoadmap["entity_structure"];
  valueFlywheel?: StrategicRoadmap["value_flywheel"];
  /**
   * Layout mode:
   *   "side-by-side" (default) — both diagrams visible, 2-col on desktop,
   *                              stacked on mobile
   *   "tabs"                   — legacy single-view with tab switcher
   */
  layout?: "side-by-side" | "tabs";
}

export default function RoadmapDiagrams({
  entityStructure,
  valueFlywheel,
  layout = "side-by-side",
}: Props) {
  const hasEntity = !!entityStructure && entityStructure.children.length > 0;
  const hasFlywheel = !!valueFlywheel && valueFlywheel.nodes.length > 0;

  if (!hasEntity && !hasFlywheel) return null;

  if (layout === "tabs") {
    return <TabsLayout entity={entityStructure} flywheel={valueFlywheel} />;
  }

  return (
    <div className={`rdmp-diagrams-split${hasEntity && hasFlywheel ? "" : " rdmp-diagrams-split--single"}`}>
      {hasEntity && (
        <div className="rdmp-diagram-panel">
          <div className="rdmp-diagram-panel-head">
            <span className="rdmp-diagram-label">Entity Structure</span>
            <span className="rdmp-diagram-sub">Current → Target</span>
          </div>
          <div className="rdmp-diagram-panel-body">
            <RoadmapEntityDiagram data={entityStructure!} />
          </div>
        </div>
      )}
      {hasFlywheel && (
        <div className="rdmp-diagram-panel">
          <div className="rdmp-diagram-panel-head">
            <span className="rdmp-diagram-label">Value Flywheel</span>
            <span className="rdmp-diagram-sub">How value compounds</span>
          </div>
          <div className="rdmp-diagram-panel-body">
            <RoadmapFlywheel data={valueFlywheel!} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Legacy tabs layout ────────────────────────────────────────────
function TabsLayout({
  entity,
  flywheel,
}: {
  entity?: StrategicRoadmap["entity_structure"];
  flywheel?: StrategicRoadmap["value_flywheel"];
}) {
  const hasEntity = !!entity && entity.children.length > 0;
  const hasFlywheel = !!flywheel && flywheel.nodes.length > 0;

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
          <RoadmapEntityDiagram data={entity!} />
        )}
        {tabs[activeTab]?.key === "flywheel" && hasFlywheel && (
          <RoadmapFlywheel data={flywheel!} />
        )}
      </div>
    </div>
  );
}
