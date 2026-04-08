/* ── Asset Inventory Types ─────────────────────────────────────────── */

export type AssetType = "ip" | "judgment" | "relationship" | "process" | "audience" | "brand";
export type OwnershipStatus = "own_fully" | "own_partially" | "work_for_hire" | "unclear" | "no_ownership";
export type LicensingPotential = "high" | "medium" | "low" | "already_licensed" | "not_applicable";
export type AnalysisStatus = "generating" | "completed" | "failed";

export type AssetInventoryItem = {
  id: string;
  user_id: string;
  asset_name: string;
  asset_type: AssetType;
  description: string | null;
  ownership_status: OwnershipStatus;
  licensing_potential: LicensingPotential;
  notes: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type AssetInventoryAnalysis = {
  id: string;
  user_id: string;
  analysis_content: InventoryAnalysisContent;
  item_count: number;
  status: AnalysisStatus;
  created_at: string;
};

export type InventoryAnalysisContent = {
  summary: {
    total_assets: number;
    estimated_total_value_range: string;
    leverage_score: string;
    key_insight: string;
  };
  asset_valuations: AssetValuation[];
  scenarios: Scenario[];
  roadmap: InventoryRoadmap;
};

export type AssetValuation = {
  asset_name: string;
  asset_type: AssetType;
  estimated_value_range: string;
  value_rationale: string;
  immediate_actions: string[];
};

export type Scenario = {
  scenario_name: string;
  description: string;
  potential_value: string;
  required_steps: string[];
  timeline: string;
  risk_level: string;
};

export type InventoryRoadmap = {
  immediate_actions: RoadmapAction[];
  medium_term: string;
  long_term_vision: string;
  recommended_structures: number[];
};

export type RoadmapAction = {
  order: number;
  action: string;
  why: string;
  timeline: string;
};

/* ── Display labels ───────────────────────────────────────────────── */

export const ASSET_TYPE_LABELS: Record<AssetType, string> = {
  ip: "IP",
  judgment: "Judgment",
  relationship: "Relationship",
  process: "Process",
  audience: "Audience",
  brand: "Brand",
};

export const OWNERSHIP_LABELS: Record<OwnershipStatus, string> = {
  own_fully: "Own Fully",
  own_partially: "Own Partially",
  work_for_hire: "Work for Hire",
  unclear: "Unclear",
  no_ownership: "No Ownership",
};

export const LICENSING_LABELS: Record<LicensingPotential, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
  already_licensed: "Already Licensed",
  not_applicable: "N/A",
};
