import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
} from "@react-pdf/renderer";
import type {
  StrategicRoadmap,
  StageNumber,
} from "@/types/assessment";

const STAGE_NAMES: Record<StageNumber, string> = {
  1: "Execution Excellence",
  2: "Judgment Positioning",
  3: "Ownership Accumulation",
  4: "Capital Formation",
};

const STAGE_RANGES: Record<StageNumber, string> = {
  1: "$75K–$200K",
  2: "$200K–$500K",
  3: "$500K–$2M+",
  4: "$2M+",
};

const s = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 48,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1a1a1a",
    lineHeight: 1.5,
  },
  // Header — two-column editorial layout
  header: {
    marginBottom: 32,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "flex-end" as const,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: "flex-end" as const,
  },
  brandName: {
    fontSize: 8,
    letterSpacing: 2,
    textTransform: "uppercase" as const,
    color: "#777",
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontFamily: "Helvetica",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 11,
    color: "#777",
    lineHeight: 1.4,
  },
  headerMetaLabel: {
    fontSize: 7,
    letterSpacing: 1,
    textTransform: "uppercase" as const,
    color: "#999",
    marginBottom: 2,
  },
  headerMetaValue: {
    fontSize: 10,
    color: "#1a1a1a",
    marginBottom: 6,
  },
  // Section — thin black rule above the label
  section: {
    marginBottom: 22,
  },
  sectionTitleWrap: {
    borderTopWidth: 1,
    borderTopColor: "#1a1a1a",
    paddingTop: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 8,
    letterSpacing: 2,
    textTransform: "uppercase" as const,
    fontFamily: "Helvetica-Bold",
    color: "#1a1a1a",
  },
  // Position card — subtle tinted background
  positionCard: {
    padding: 16,
    backgroundColor: "#fafaf7",
    borderRadius: 3,
    marginBottom: 6,
  },
  positionRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "flex-start" as const,
    marginBottom: 14,
  },
  label: {
    fontSize: 7,
    letterSpacing: 1,
    textTransform: "uppercase" as const,
    color: "#999",
    marginBottom: 4,
  },
  stageName: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  stageRange: {
    fontSize: 9,
    color: "#999",
  },
  readinessValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    textTransform: "capitalize" as const,
  },
  bodyText: {
    fontSize: 10,
    lineHeight: 1.6,
    color: "#333",
    marginBottom: 6,
  },
  industryContext: {
    fontSize: 9,
    lineHeight: 1.5,
    color: "#777",
    fontStyle: "italic" as const,
    marginTop: 6,
  },
  // Misalignments — dark card
  misalignmentCard: {
    backgroundColor: "#1a1a1a",
    borderRadius: 3,
    padding: 16,
    marginBottom: 6,
  },
  misalignmentHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ef4444",
    marginBottom: 12,
  },
  misalignmentSectionTitle: {
    fontSize: 8,
    letterSpacing: 2,
    textTransform: "uppercase" as const,
    fontFamily: "Helvetica-Bold",
    color: "#ef4444",
  },
  misalignmentCount: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#ef4444",
  },
  misalignmentItem: {
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  misalignmentItemLast: {
    paddingBottom: 0,
    marginBottom: 0,
    borderBottomWidth: 0,
  },
  misalignmentFlag: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    marginBottom: 8,
    textTransform: "capitalize" as const,
  },
  misalignmentLabel: {
    fontSize: 7,
    letterSpacing: 1,
    textTransform: "uppercase" as const,
    color: "rgba(255,255,255,0.45)",
    marginTop: 6,
    marginBottom: 2,
  },
  misalignmentText: {
    fontSize: 9,
    lineHeight: 1.5,
    color: "rgba(255,255,255,0.75)",
  },
  // Actions — numbered circle + body
  actionCard: {
    padding: 14,
    marginBottom: 12,
    backgroundColor: "#fafaf7",
    borderRadius: 3,
    flexDirection: "row" as const,
    gap: 14,
    alignItems: "flex-start" as const,
  },
  actionNumberCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#1a1a1a",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    flexShrink: 0,
  },
  actionNumber: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },
  actionBody: {
    flex: 1,
  },
  actionHeaderRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    marginBottom: 6,
  },
  actionTag: {
    fontSize: 7,
    letterSpacing: 0.8,
    textTransform: "uppercase" as const,
    fontFamily: "Helvetica-Bold",
    color: "#777",
    borderWidth: 1,
    borderColor: "#d9d6d1",
    borderRadius: 2,
    padding: "2 6",
  },
  actionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  actionFieldLabel: {
    fontSize: 7,
    letterSpacing: 1,
    textTransform: "uppercase" as const,
    fontFamily: "Helvetica-Bold",
    color: "#999",
    marginTop: 8,
    marginBottom: 2,
  },
  actionText: {
    fontSize: 9,
    lineHeight: 1.55,
    color: "#333",
    marginBottom: 4,
  },
  actionMeta: {
    flexDirection: "row" as const,
    gap: 16,
    marginTop: 8,
  },
  actionMetaItem: {
    flex: 1,
  },
  // AI Assist
  aiAssist: {
    padding: 8,
    marginTop: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d9d6d1",
    borderRadius: 3,
  },
  aiTag: {
    fontSize: 7,
    letterSpacing: 0.8,
    textTransform: "uppercase" as const,
    fontFamily: "Helvetica-Bold",
    color: "#999",
    marginBottom: 2,
  },
  // Providers
  providerRow: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 6,
    marginTop: 4,
  },
  providerLink: {
    fontSize: 9,
    color: "#1a1a1a",
    textDecoration: "underline" as const,
  },
  // Vision
  visionGrid: {
    flexDirection: "row" as const,
    gap: 14,
    marginBottom: 12,
  },
  visionCard: {
    flex: 1,
    padding: 14,
    backgroundColor: "#fafaf7",
    borderRadius: 3,
  },
  visionLabel: {
    fontSize: 7,
    letterSpacing: 1,
    textTransform: "uppercase" as const,
    color: "#999",
    marginBottom: 6,
  },
  visionText: {
    fontSize: 10,
    lineHeight: 1.6,
    color: "#333",
  },
  signalsWrap: {
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0d8",
  },
  signalItem: {
    fontSize: 9,
    lineHeight: 1.5,
    color: "#333",
    paddingLeft: 12,
    marginBottom: 3,
  },
  // Library
  libraryGroup: {
    marginBottom: 16,
  },
  libraryItem: {
    padding: 10,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  libraryItemLast: {
    borderBottomWidth: 0,
  },
  libraryTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  libraryWhy: {
    fontSize: 8,
    color: "#777",
    lineHeight: 1.4,
  },
  readingItem: {
    flexDirection: "row" as const,
    gap: 10,
    paddingBottom: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
    alignItems: "flex-start" as const,
  },
  readingNum: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#999",
    width: 16,
  },
  readingText: {
    fontSize: 9,
    color: "#333",
    flex: 1,
    lineHeight: 1.5,
  },
  // Footer
  footer: {
    position: "absolute" as const,
    bottom: 24,
    left: 48,
    right: 48,
    borderTopWidth: 1,
    borderTopColor: "#e0e0d8",
    paddingTop: 8,
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  footerText: {
    fontSize: 7,
    letterSpacing: 0.6,
    textTransform: "uppercase" as const,
    color: "#999",
  },
});

function formatFlag(flag: string): string {
  return flag.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <View style={s.sectionTitleWrap}>
      <Text style={s.sectionTitle}>{children}</Text>
    </View>
  );
}

function PageFooter() {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>In Sequence · insequence.so</Text>
      <Text
        style={s.footerText}
        render={({ pageNumber, totalPages }) =>
          `Page ${pageNumber} / ${totalPages}`
        }
      />
    </View>
  );
}

export default function RoadmapPDF({
  roadmap,
  memberName,
  memberEmail,
  date,
}: {
  roadmap: StrategicRoadmap;
  memberName: string;
  memberEmail: string;
  date: string;
}) {
  const stage = roadmap.position.detected_stage as StageNumber;
  const misalignments = roadmap.misalignment_detail?.length
    ? roadmap.misalignment_detail
    : roadmap.position?.misalignments?.length
      ? roadmap.position.misalignments
      : [];

  return (
    <Document>
      {/* Page 1: Position + Vision + Misalignments */}
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Text style={s.brandName}>In Sequence</Text>
            <Text style={s.title}>Strategic Roadmap</Text>
            <Text style={s.subtitle}>
              Personalized guidance based on your Creative Identity,
              portfolio, and recent deals.
            </Text>
          </View>
          <View style={s.headerRight}>
            <Text style={s.headerMetaLabel}>Prepared for</Text>
            <Text style={s.headerMetaValue}>{memberName}</Text>
            <Text style={s.headerMetaLabel}>Date</Text>
            <Text style={s.headerMetaValue}>{date}</Text>
          </View>
        </View>

        {/* Position */}
        <View style={s.section}>
          <SectionHeading>Your Position</SectionHeading>
          <View style={s.positionCard}>
            <View style={s.positionRow}>
              <View>
                <Text style={s.label}>Stage {stage}</Text>
                <Text style={s.stageName}>{STAGE_NAMES[stage]}</Text>
                <Text style={s.stageRange}>{STAGE_RANGES[stage]}</Text>
              </View>
              <View>
                <Text style={s.label}>Transition Readiness</Text>
                <Text style={s.readinessValue}>
                  {roadmap.position.transition_readiness}
                </Text>
              </View>
            </View>
            <Text style={s.bodyText}>{roadmap.position.stage_description}</Text>
            {roadmap.position.industry_context && (
              <Text style={s.industryContext}>
                {roadmap.position.industry_context}
              </Text>
            )}
          </View>
        </View>

        {/* Vision */}
        {roadmap.vision && (
          <View style={s.section}>
            <SectionHeading>Your Vision</SectionHeading>
            <View style={s.visionGrid}>
              <View style={s.visionCard}>
                <Text style={s.visionLabel}>12-Month Target</Text>
                <Text style={s.visionText}>
                  {roadmap.vision.twelve_month_target}
                </Text>
              </View>
              <View style={s.visionCard}>
                <Text style={s.visionLabel}>3-Year Horizon</Text>
                <Text style={s.visionText}>
                  {roadmap.vision.three_year_horizon}
                </Text>
              </View>
            </View>

            {roadmap.vision.transition_signals &&
              roadmap.vision.transition_signals.length > 0 && (
                <View style={s.signalsWrap}>
                  <Text style={s.visionLabel}>Transition Signals</Text>
                  {roadmap.vision.transition_signals.map((sig, i) => (
                    <Text key={i} style={s.signalItem}>
                      → {sig}
                    </Text>
                  ))}
                </View>
              )}
          </View>
        )}

        {/* Misalignments */}
        {misalignments.length > 0 && (
          <View style={s.section}>
            <View style={s.misalignmentCard}>
              <View style={s.misalignmentHeader}>
                <Text style={s.misalignmentSectionTitle}>Structural Misalignments</Text>
                <Text style={s.misalignmentCount}>
                  ▲ {misalignments.length}
                </Text>
              </View>
              {misalignments.map((m, i) => (
                <View
                  key={m.flag}
                  style={[
                    s.misalignmentItem,
                    i === misalignments.length - 1
                      ? s.misalignmentItemLast
                      : {},
                  ]}
                >
                  <Text style={s.misalignmentFlag}>{formatFlag(m.flag)}</Text>
                  <Text style={s.misalignmentLabel}>What it costs you</Text>
                  <Text style={s.misalignmentText}>{m.what_its_costing}</Text>
                  <Text style={s.misalignmentLabel}>Why it matters</Text>
                  <Text style={s.misalignmentText}>{m.why_it_matters}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <PageFooter />
      </Page>

      {/* Page 2: 3 Next Steps */}
      <Page size="A4" style={s.page}>
        <View style={s.section}>
          <SectionHeading>Your 3 Next Steps</SectionHeading>
          {roadmap.actions.map((action) => (
            <View key={action.order} style={s.actionCard} wrap={false}>
              <View style={s.actionNumberCircle}>
                <Text style={s.actionNumber}>{action.order}</Text>
              </View>
              <View style={s.actionBody}>
                <View style={s.actionHeaderRow}>
                  <Text style={s.actionTag}>{action.type}</Text>
                </View>
                <Text style={s.actionTitle}>{action.title}</Text>
                <Text style={s.actionText}>{action.what}</Text>

                <Text style={s.actionFieldLabel}>Why this matters</Text>
                <Text style={s.actionText}>{action.why}</Text>

                <Text style={s.actionFieldLabel}>How to do it</Text>
                <Text style={s.actionText}>{action.how}</Text>

                <View style={s.actionMeta}>
                  <View style={s.actionMetaItem}>
                    <Text style={s.actionFieldLabel}>Timeline</Text>
                    <Text style={s.actionText}>{action.timeline}</Text>
                  </View>
                  <View style={s.actionMetaItem}>
                    <Text style={s.actionFieldLabel}>Done when</Text>
                    <Text style={s.actionText}>{action.done_signal}</Text>
                  </View>
                </View>

                {action.ai_assist?.description && (
                  <View style={s.aiAssist}>
                    <Text style={s.aiTag}>AI Assist Available</Text>
                    <Text style={s.actionText}>
                      {action.ai_assist.description}
                    </Text>
                  </View>
                )}

                {action.providers && action.providers.length > 0 && (
                  <View>
                    <Text style={s.actionFieldLabel}>Recommended Providers</Text>
                    <View style={s.providerRow}>
                      {action.providers.map((p) => (
                        <Link key={p.name} src={p.url} style={s.providerLink}>
                          {p.name}
                        </Link>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>

        <PageFooter />
      </Page>

      {/* Page 3: Library */}
      <Page size="A4" style={s.page}>
        {roadmap.library && (
          <View style={s.section}>
            <SectionHeading>Recommended Reading</SectionHeading>

            {roadmap.library.recommended_structures &&
              roadmap.library.recommended_structures.length > 0 && (
                <View style={s.libraryGroup}>
                  <Text style={s.visionLabel}>Deal Structures</Text>
                  {roadmap.library.recommended_structures.map((str, i, arr) => (
                    <View
                      key={str.id}
                      style={[
                        s.libraryItem,
                        i === arr.length - 1 ? s.libraryItemLast : {},
                      ]}
                    >
                      <Text style={s.libraryTitle}>{str.title}</Text>
                      <Text style={s.libraryWhy}>{str.why}</Text>
                    </View>
                  ))}
                </View>
              )}

            {roadmap.library.recommended_cases &&
              roadmap.library.recommended_cases.length > 0 && (
                <View style={s.libraryGroup}>
                  <Text style={s.visionLabel}>Case Studies</Text>
                  {roadmap.library.recommended_cases.map((c, i, arr) => (
                    <View
                      key={c.slug}
                      style={[
                        s.libraryItem,
                        i === arr.length - 1 ? s.libraryItemLast : {},
                      ]}
                    >
                      <Text style={s.libraryTitle}>{c.title}</Text>
                      <Text style={s.libraryWhy}>{c.why}</Text>
                    </View>
                  ))}
                </View>
              )}

            {roadmap.library.reading_path &&
              roadmap.library.reading_path.length > 0 && (
                <View>
                  <Text style={s.visionLabel}>Reading Path</Text>
                  {roadmap.library.reading_path.map((item, i, arr) => (
                    <View
                      key={i}
                      style={[
                        s.readingItem,
                        i === arr.length - 1 ? s.libraryItemLast : {},
                      ]}
                    >
                      <Text style={s.readingNum}>{i + 1}</Text>
                      <Text style={s.readingText}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}
          </View>
        )}

        <PageFooter />
      </Page>
    </Document>
  );
}
