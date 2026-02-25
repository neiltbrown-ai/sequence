import Link from "next/link";
import { getAllStructures } from "@/lib/content";
import PageHeader from "@/components/portal/page-header";
import StructuresFilters from "@/components/portal/structures-filters";

export default function PortalStructuresPage() {
  const structures = getAllStructures();

  const models = structures.filter((s) => s.subtype === "business-model");
  const compensation = structures.filter((s) => s.subtype === "compensation");

  return (
    <>
      <PageHeader
        title="Deal Structures"
        description="35+ structures for creative professionals — from premium service models to equity partnerships."
        count={`${structures.length} STRUCTURES`}
        backHref="/dashboard"
        backLabel="Dashboard"
      />
      <StructuresFilters
        models={models}
        compensation={compensation}
        all={structures}
      />
      <div className="page-footer" />
    </>
  );
}
