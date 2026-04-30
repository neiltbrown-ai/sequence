/**
 * Seed script: creates test + demo users with realistic data at various lifecycle stages.
 *
 * Usage:
 *   npx tsx scripts/seed-test-users.ts          # seed all users
 *   npx tsx scripts/seed-test-users.ts --reset   # delete all test users then re-seed
 *   npx tsx scripts/seed-test-users.ts --delete   # delete all test users only
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env (or .env.local).
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { randomUUID } from "crypto";

// ---------------------------------------------------------------------------
// ENV (load .env.local / .env manually — no dotenv dependency)
// ---------------------------------------------------------------------------

function loadEnvFile(path: string) {
  try {
    const content = readFileSync(path, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // file doesn't exist — that's fine
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
  );
  process.exit(1);
}

const supabase: SupabaseClient = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ---------------------------------------------------------------------------
// SHARED CONSTANTS
// ---------------------------------------------------------------------------

const TEST_PASSWORD = "TestPass123!";
const EMAIL_DOMAIN = "insequence.so";

const ALL_EMAILS = [
  `test-fresh@${EMAIL_DOMAIN}`,
  `test-assessed@${EMAIL_DOMAIN}`,
  `test-maker@${EMAIL_DOMAIN}`,
  `test-service@${EMAIL_DOMAIN}`,
  `test-performer@${EMAIL_DOMAIN}`,
  `test-lapsed@${EMAIL_DOMAIN}`,
  `test-admin@${EMAIL_DOMAIN}`,
  `test-library@${EMAIL_DOMAIN}`,
  `demo-sales@${EMAIL_DOMAIN}`,
  `demo-onboard@${EMAIL_DOMAIN}`,
];

// ---------------------------------------------------------------------------
// HELPERS
// ---------------------------------------------------------------------------

async function createUser(
  email: string,
  fullName: string
): Promise<string | null> {
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find((u) => u.email === email);
  if (existing) {
    console.log(`  ✓ User ${email} already exists (${existing.id})`);
    return existing.id;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: TEST_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (error) {
    console.error(`  ✗ Failed to create ${email}:`, error.message);
    return null;
  }

  console.log(`  + Created ${email} (${data.user.id})`);
  return data.user.id;
}

async function updateProfile(userId: string, fields: Record<string, unknown>) {
  const { error } = await supabase
    .from("profiles")
    .update(fields)
    .eq("id", userId);
  if (error) console.error(`  ✗ Profile update failed:`, error.message);
}

async function upsertSubscription(
  userId: string,
  fields: Record<string, unknown>
) {
  const { data: existing } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("subscriptions")
      .update(fields)
      .eq("id", existing.id);
    if (error)
      console.error(`  ✗ Subscription update failed:`, error.message);
  } else {
    const { error } = await supabase.from("subscriptions").insert({
      id: randomUUID(),
      user_id: userId,
      ...fields,
    });
    if (error)
      console.error(`  ✗ Subscription insert failed:`, error.message);
  }
}

async function insertRow(table: string, data: Record<string, unknown>) {
  const { data: result, error } = await supabase
    .from(table)
    .insert(data)
    .select("id")
    .single();
  if (error) {
    console.error(`  ✗ Insert into ${table} failed:`, error.message);
    return null;
  }
  return result.id as string;
}

function activeSub(userId: string) {
  return {
    stripe_customer_id: `cus_test_${userId.slice(0, 8)}`,
    stripe_subscription_id: `sub_test_${userId.slice(0, 8)}`,
    plan: "full_access",
    status: "active",
    current_period_start: new Date("2026-01-01").toISOString(),
    current_period_end: new Date("2027-01-01").toISOString(),
  };
}

async function addBookmarks(userId: string, count: number) {
  const { data: contentItems } = await supabase
    .from("library_content")
    .select("id")
    .eq("published", true)
    .limit(count);

  if (contentItems?.length) {
    for (const item of contentItems) {
      await insertRow("bookmarks", {
        id: randomUUID(),
        user_id: userId,
        content_id: item.id,
      });
    }
    console.log(`  + Bookmarked ${contentItems.length} items`);
  }
}

// ---------------------------------------------------------------------------
// 1. FRESH USER — signed up, active sub, nothing else
// ---------------------------------------------------------------------------

async function seedFreshUser() {
  console.log("\n— Fresh User (test-fresh) —");
  const id = await createUser(`test-fresh@${EMAIL_DOMAIN}`, "Fresh Tester");
  if (!id) return;

  await updateProfile(id, {
    role: "member",
    status: "active",
    onboarding_completed: true,
  });

  await upsertSubscription(id, activeSub(id));
  console.log("  ✓ Fresh user seeded");
}

// ---------------------------------------------------------------------------
// 1b. LIBRARY USER — library-tier subscription (no AI tools)
// ---------------------------------------------------------------------------

function librarySub(userId: string) {
  return {
    stripe_customer_id: `cus_test_lib_${userId.slice(0, 8)}`,
    stripe_subscription_id: `sub_test_lib_${userId.slice(0, 8)}`,
    plan: "library",
    status: "active",
    current_period_start: new Date("2026-01-01").toISOString(),
    current_period_end: new Date("2027-01-01").toISOString(),
  };
}

async function seedLibraryUser() {
  console.log("\n— Library User (test-library) —");
  const id = await createUser(`test-library@${EMAIL_DOMAIN}`, "Library Tester");
  if (!id) return;

  await updateProfile(id, {
    role: "member",
    status: "active",
    onboarding_completed: true,
  });

  await upsertSubscription(id, librarySub(id));
  console.log("  ✓ Library user seeded");
}

// ---------------------------------------------------------------------------
// 2. ASSESSED USER — completed assessment + roadmap, no deals/inventory
// ---------------------------------------------------------------------------

async function seedAssessedUser() {
  console.log("\n— Assessed User (test-assessed) —");
  const id = await createUser(
    `test-assessed@${EMAIL_DOMAIN}`,
    "Assessed Tester"
  );
  if (!id) return;

  await updateProfile(id, {
    role: "member",
    status: "active",
    onboarding_completed: true,
    creative_mode: "service",
    detected_stage: 2,
    archetype_primary: "established_practitioner",
    assessment_completed_at: new Date("2026-02-20").toISOString(),
    disciplines: ["design", "branding"],
    career_stage: "mid-career",
    income_range: "100k_150k",
  });

  await upsertSubscription(id, activeSub(id));

  const assessmentId = await insertRow("assessments", {
    id: randomUUID(),
    user_id: id,
    version: 1,
    status: "completed",
    discipline: "design",
    sub_discipline: "brand_identity",
    creative_mode: "service",
    energy_ranking: ["design_systems", "brand_strategy", "client_collaboration"],
    drains: ["invoicing", "scope_creep", "admin"],
    dream_response:
      "Running a boutique studio where I only take projects that excite me and own equity in the brands I help build.",
    income_range: "100k_150k",
    income_structure: {
      salary: 0,
      fees_sales: 70,
      retainer_commission: 20,
      royalties: 5,
      equity: 0,
      products: 5,
    },
    what_they_pay_for: "elevation",
    equity_positions: "none",
    demand_level: "steady",
    business_structure: "llc",
    stage_questions: { "Q-STAGE-1": "specialist", "Q-STAGE-2": "elevation" },
    industry_questions: {},
    discernment_questions: { "Q-DISC-1": "emerging", "Q-DISC-2": "selective" },
    three_year_goal:
      "Transition from project fees to retainer + equity model with 3-5 anchor clients.",
    risk_tolerance: "moderate",
    constraints: ["solo_operator", "capacity"],
    specific_question:
      "How do I start asking for equity when clients only expect to pay project fees?",
    detected_stage: 2,
    stage_score: 2.25,
    transition_readiness: "moderate",
    misalignment_flags: ["judgment_not_priced", "demand_exceeds_capacity"],
    archetype_primary: "established_practitioner",
    archetype_secondary: "high_earner_no_ownership",
    current_section: 5,
    current_question: 0,
    started_at: new Date("2026-02-18").toISOString(),
    completed_at: new Date("2026-02-20").toISOString(),
  });

  if (assessmentId) {
    await insertRow("strategic_plans", {
      id: randomUUID(),
      user_id: id,
      assessment_id: assessmentId,
      status: "published",
      published_at: new Date("2026-02-21").toISOString(),
      plan_content: {
        position: {
          detected_stage: 2,
          stage_name: "Positioning",
          stage_description:
            "Established expertise, steady demand, but income still tied to time.",
          transition_readiness:
            "Moderate — ready for first equity conversation.",
          industry_context: "Design/Branding — strategic work creates equity entry points.",
          misalignments: [
            {
              flag: "judgment_not_priced",
              what_its_costing: "$30K-$60K annually in underpriced strategic work.",
              why_it_matters: "Clients pay for deliverables but get strategic direction worth 3-5x the fee.",
            },
          ],
        },
        actions: [
          {
            order: 1,
            type: "foundation",
            title: "Separate strategy from execution in pricing",
            what: "Create a standalone strategy engagement priced at 2-3x your hourly equivalent.",
            why: "Fastest way to capture the value gap.",
            how: "Use Structure #1 (Premium Service Model).",
            timeline: "3 weeks",
            done_signal: "One strategy-only proposal sent.",
          },
          {
            order: 2,
            type: "positioning",
            title: "Propose equity to your strongest client",
            what: "Propose hybrid fee + equity for your next engagement.",
            why: "This relationship has the trust for your first equity ask.",
            how: "Use Structure #17 (Equity-for-Services).",
            timeline: "6 weeks",
            done_signal: "Equity proposal sent; conversation completed.",
          },
          {
            order: 3,
            type: "momentum",
            title: "Build a waitlist and referral system",
            what: "Formalize excess demand into a waitlist with referral structure.",
            why: "Visible waitlist signals value; referrals build network equity.",
            how: "Intake form + quarterly capacity updates. 10% referral fee.",
            timeline: "4 weeks",
            done_signal: "Waitlist live; 2+ referral partners.",
          },
        ],
        vision: {
          twelve_month_target:
            "Strategy fees at 40% of revenue; one equity deal closed.",
          three_year_horizon:
            "Boutique studio with 3-5 equity clients; $250K+ revenue, 30% from equity.",
          transition_signals: [
            "First equity deal closes",
            "Strategy engagement exceeds $20K",
          ],
          structures_to_study: [1, 2, 4, 17, 18, 26],
          relevant_cases: ["jessica_walsh", "collins", "tobias_van_schneider"],
        },
        library: {
          recommended_structures: [
            { id: 1, title: "Premium Service Model", why: "Price strategy at true value." },
            { id: 17, title: "Equity-for-Services Model", why: "Framework for first equity ask." },
          ],
          recommended_cases: [
            { slug: "jessica-walsh", title: "Jessica Walsh", why: "Designer to studio owner." },
          ],
          reading_path: ["Structures 1-4", "Structures 17, 18, 26", "Case studies"],
        },
      },
    });
  }

  console.log("  ✓ Assessed user seeded");
}

// ---------------------------------------------------------------------------
// 3A. POWER USER — FILMMAKER (maker, stage 3, platform_builder)
// ---------------------------------------------------------------------------

async function seedMakerUser() {
  console.log("\n— Filmmaker / Maker (test-maker) — Jordan Rivera —");
  const id = await createUser(`test-maker@${EMAIL_DOMAIN}`, "Jordan Rivera");
  if (!id) return;

  await updateProfile(id, {
    role: "member",
    status: "active",
    onboarding_completed: true,
    bio: "Independent filmmaker and producer building a multi-venture creative business. Two features released, building a production company.",
    creative_mode: "maker",
    detected_stage: 3,
    archetype_primary: "platform_builder",
    assessment_completed_at: new Date("2026-02-15").toISOString(),
    disciplines: ["film", "production", "writing"],
    career_stage: "established",
    income_range: "200k_300k",
    interests: ["equity_deals", "ip_ownership", "entity_structure"],
  });

  await upsertSubscription(id, activeSub(id));

  // Assessment
  const assessmentId = await insertRow("assessments", {
    id: randomUUID(),
    user_id: id,
    version: 1,
    status: "completed",
    discipline: "directing",
    creative_mode: "maker",
    energy_ranking: ["directing", "storytelling", "team_leadership"],
    drains: ["post_production", "logistics", "administrative_tasks"],
    dream_response:
      "Creating films that shape cultural conversation while owning the IP and building lasting equity.",
    income_range: "200k_300k",
    income_structure: {
      salary: 0,
      fees_sales: 40,
      retainer_commission: 20,
      royalties: 15,
      equity: 20,
      products: 5,
    },
    what_they_pay_for: "direction",
    equity_positions: "few",
    demand_level: "overflow",
    business_structure: "llc_scorp",
    stage_questions: {
      "Q-STAGE-1": "partnership",
      "Q-STAGE-2": "direction",
      "Q-STAGE-3": "strategic",
    },
    industry_questions: {},
    discernment_questions: { "Q-DISC-1": "defines", "Q-DISC-2": "influential" },
    three_year_goal:
      "Build a production company with multiple revenue streams and passive income exceeding active.",
    risk_tolerance: "high",
    constraints: ["family_commitments"],
    specific_question:
      "How do I structure equity deals with collaborators so everyone stays aligned?",
    detected_stage: 3,
    stage_score: 3.15,
    transition_readiness: "high",
    misalignment_flags: ["relationships_not_converted", "ip_not_monetized"],
    archetype_primary: "platform_builder",
    archetype_secondary: "untapped_catalog",
    current_section: 5,
    current_question: 0,
    started_at: new Date("2026-02-10").toISOString(),
    completed_at: new Date("2026-02-15").toISOString(),
  });

  // Roadmap
  let planId: string | null = null;
  if (assessmentId) {
    planId = await insertRow("strategic_plans", {
      id: randomUUID(),
      user_id: id,
      assessment_id: assessmentId,
      status: "published",
      published_at: new Date("2026-02-16").toISOString(),
      plan_content: {
        position: {
          detected_stage: 3,
          stage_name: "Momentum",
          stage_description:
            "Multiple revenue streams, strategic relationships, ownership positions.",
          transition_readiness: "Positioned for Stage 4 with structural refinement.",
          industry_context:
            "Film/Production — directorial reputation creates leverage for IP ownership deals.",
          misalignments: [
            {
              flag: "relationships_not_converted",
              what_its_costing: "Estimated $150K-$300K annually in unpaid advisory value.",
              why_it_matters: "Collaborators generating strategic value should participate in ownership upside.",
            },
            {
              flag: "ip_not_monetized",
              what_its_costing: "Back catalog of 12+ scripts generating <$25K/yr when potential is $200K+.",
              why_it_matters: "IP sitting idle while you trade time for fees.",
            },
          ],
        },
        actions: [
          {
            order: 1,
            type: "foundation",
            title: "Design your entity architecture",
            what: "Map holding company owning subsidiaries for production, licensing, advisory.",
            why: "Clean separation enables optimization, liability protection, future investment.",
            how: "Initial sketch, validate with creative-industry attorney.",
            timeline: "4 weeks",
            done_signal: "Entity structure diagram with attorney consultation scheduled.",
          },
          {
            order: 2,
            type: "positioning",
            title: "Convert one relationship to ownership",
            what: "Propose equity/profit participation to longest-standing collaborator.",
            why: "Ownership conversion demonstrates partnership commitment.",
            how: "Use Structure #17 (Equity-for-Services).",
            timeline: "6 weeks",
            done_signal: "Signed term sheet with restructured engagement.",
          },
          {
            order: 3,
            type: "momentum",
            title: "License 3 scripts from your catalog",
            what: "Identify highest-potential scripts; approach indie producers and streaming platforms.",
            why: "Your IP catalog is your most underutilized asset.",
            how: "Create 1-page pitch decks; approach 5-10 producers per script.",
            timeline: "8 weeks",
            done_signal: "At least 1 licensing deal signed.",
          },
        ],
        vision: {
          twelve_month_target:
            "Holding company operational; 1 equity partnership; 2+ scripts licensed.",
          three_year_horizon:
            "Portfolio of 3-4 ventures; $500K+ passive income; recognized as investor/founder.",
          transition_signals: [
            "First equity deal closes",
            "Holding company operational",
            "Passive income exceeds active income",
          ],
          structures_to_study: [5, 9, 12, 14, 17, 18, 19, 20, 21, 27, 28],
          relevant_cases: ["george-lucas", "ryan-reynolds", "jordan-peele", "a24"],
        },
        library: {
          recommended_structures: [
            { id: 9, title: "Holding Company Model", why: "Multi-venture architecture." },
            { id: 17, title: "Equity-for-Services Model", why: "Convert advisory to ownership." },
            { id: 28, title: "Exclusive Licensing Model", why: "IP licensing template." },
          ],
          recommended_cases: [
            { slug: "jordan-peele", title: "Jordan Peele", why: "Services to ownership via holding company." },
            { slug: "george-lucas", title: "George Lucas", why: "Retained IP; built empire through licensing." },
          ],
          reading_path: [
            "Structures 9, 12, 14: Multi-venture",
            "Structures 17-21: Equity models",
            "Structures 27-28: Licensing",
          ],
        },
      },
    });
  }

  // Roadmap actions — action 1 completed, action 2 in progress
  if (planId) {
    await insertRow("assessment_actions", {
      id: randomUUID(),
      user_id: id,
      plan_id: planId,
      action_order: 1,
      action_type: "foundation",
      status: "completed",
      completed_at: new Date("2026-03-01").toISOString(),
      notes: "Met with entertainment attorney. Entity diagram finalized — holding co + production sub.",
    });
    await insertRow("assessment_actions", {
      id: randomUUID(),
      user_id: id,
      plan_id: planId,
      action_order: 2,
      action_type: "positioning",
      status: "in_progress",
      notes: "Drafted equity proposal for DP collaborator. Meeting scheduled next week.",
    });
    await insertRow("assessment_actions", {
      id: randomUUID(),
      user_id: id,
      plan_id: planId,
      action_order: 3,
      action_type: "momentum",
      status: "pending",
    });
  }

  // Deal 1 — equity deal, green signal, accepted
  const evalId = await insertRow("deal_evaluations", {
    id: randomUUID(),
    user_id: id,
    status: "completed",
    creative_mode: "maker",
    creative_mode_source: "assessment",
    deal_type: "equity",
    deal_name: "Streaming Series Production Deal",
    mapped_structures: [17, 18, 19],
    assessment_id: assessmentId,
    assessment_stage: 3,
    assessment_flags: ["relationships_not_converted", "ip_not_monetized"],
    archetype_primary: "platform_builder",
    answers_financial: {
      F1: { value: 75000, source: "evaluator" },
      F2: { value: 120000, source: "evaluator" },
      F4: { value: 18, source: "evaluator" },
    },
    answers_career: { C1: { value: "creative_control", source: "evaluator" } },
    answers_partner: { P1: { value: "established_studio", source: "evaluator" } },
    answers_structure: { D1: { value: "detailed", source: "evaluator" } },
    answers_risk: { R1: { value: "funded", source: "evaluator" } },
    answers_legal: { L1: { value: "entertainment_attorney", source: "evaluator" } },
    scores: {
      financial: { score: 8.2, signal: "green", flags: [] },
      career: { score: 9.1, signal: "green", flags: [] },
      partner: { score: 8.5, signal: "green", flags: [] },
      structure: { score: 8.8, signal: "green", flags: [] },
      risk: { score: 8.0, signal: "green", flags: [] },
      legal: { score: 9.2, signal: "green", flags: [] },
      overall: { score: 8.6, signal: "green" },
    },
    overall_score: 8.6,
    overall_signal: "green",
    red_flags: [],
    current_dimension: 6,
    deal_outcome: "accepted",
    outcome_notes:
      "5% equity vesting over 3 years with IP ownership carve-out for sequels.",
    outcome_recorded_at: new Date("2026-03-05").toISOString(),
    started_at: new Date("2026-03-01").toISOString(),
    completed_at: new Date("2026-03-03").toISOString(),
  });

  // Deal 2 — licensing deal, yellow signal, pending
  await insertRow("deal_evaluations", {
    id: randomUUID(),
    user_id: id,
    status: "completed",
    creative_mode: "maker",
    creative_mode_source: "assessment",
    deal_type: "licensing",
    deal_name: "Documentary Distribution Deal (Netflix)",
    mapped_structures: [27, 28, 31],
    assessment_id: assessmentId,
    assessment_stage: 3,
    answers_financial: { F1: { value: 25000, source: "evaluator" } },
    answers_career: { C1: { value: "visibility", source: "evaluator" } },
    answers_partner: { P1: { value: "major_platform", source: "evaluator" } },
    answers_structure: { D1: { value: "template", source: "evaluator" } },
    answers_risk: { R1: { value: "self_funded", source: "evaluator" } },
    answers_legal: { L1: { value: "entertainment_attorney", source: "evaluator" } },
    scores: {
      financial: { score: 5.5, signal: "yellow", flags: ["below_market_rate"] },
      career: { score: 8.5, signal: "green", flags: [] },
      partner: { score: 7.0, signal: "green", flags: [] },
      structure: { score: 5.0, signal: "yellow", flags: ["template_terms"] },
      risk: { score: 6.0, signal: "yellow", flags: [] },
      legal: { score: 7.5, signal: "green", flags: [] },
      overall: { score: 6.6, signal: "yellow" },
    },
    overall_score: 6.6,
    overall_signal: "yellow",
    red_flags: ["below_market_rate", "template_terms"],
    current_dimension: 6,
    deal_outcome: "pending",
    started_at: new Date("2026-03-08").toISOString(),
    completed_at: new Date("2026-03-09").toISOString(),
  });

  // Verdict for deal 1
  if (evalId) {
    await insertRow("deal_verdicts", {
      id: randomUUID(),
      user_id: id,
      evaluation_id: evalId,
      status: "published",
      verdict_content: {
        signal: {
          color: "green",
          headline: "Strong deal with solid protective architecture",
          summary:
            "Equity stake is fairly valued, studio is reputable, agreement protects creative control and IP.",
        },
        dimension_summaries: {
          financial: "Below market rate, but equity compensates if series succeeds.",
          career: "Exceptional positioning. Creative control + sequel rights.",
          partner: "Proven track record, aligned incentives.",
          structure: "Well-defined with clear performance triggers.",
          risk: "Funded production with completion insurance.",
          legal: "Clarify IP ownership for derivative works before signing.",
        },
        recommended_actions: [
          {
            order: 1,
            action: "Confirm IP ownership carve-outs",
            detail: "Protect ability to exploit core IP for sequels/derivatives.",
            structure_ref: { id: 28, slug: "exclusive-licensing", title: "Exclusive Licensing Model" },
          },
          {
            order: 2,
            action: "Negotiate equity acceleration",
            detail: "Faster vesting if series hits viewership benchmarks.",
            structure_ref: { id: 20, slug: "performance-equity", title: "Performance-Based Equity" },
          },
        ],
        resources: {
          structures: [
            { id: 17, slug: "equity-for-services", title: "Equity-for-Services", why: "Direction converts to equity." },
          ],
          case_studies: [
            { slug: "jordan-peele", title: "Jordan Peele", why: "Equity deals into production company." },
          ],
        },
      },
    });
  }

  // Inventory — filmmaker assets
  const items = [
    { asset_name: "Original screenplay catalog (12 scripts)", asset_type: "ip", description: "12 original screenplays: drama, thriller, sci-fi. 3 currently optioned.", ownership_status: "own_fully", licensing_potential: "high", sort_order: 1 },
    { asset_name: "Film footage archive (20+ years)", asset_type: "ip", description: "BTS footage, unused takes, documentary material from 8 productions.", ownership_status: "own_fully", licensing_potential: "medium", sort_order: 2 },
    { asset_name: "Production methodology framework", asset_type: "process", description: "Proprietary pre-production and direction methodology. Teachable and licensable.", ownership_status: "own_fully", licensing_potential: "high", sort_order: 3 },
    { asset_name: "Industry relationships (studios, talent)", asset_type: "relationship", description: "30+ strategic relationships with studio execs, A-list talent, distributors.", ownership_status: "own_fully", licensing_potential: "not_applicable", sort_order: 4 },
    { asset_name: "Social audience (150K followers)", asset_type: "audience", description: "Engaged following of creative professionals and cinephiles.", ownership_status: "own_fully", licensing_potential: "medium", sort_order: 5 },
    { asset_name: "Creative direction judgment", asset_type: "judgment", description: "Recognized strategic eye. Collaborators cite this as primary reason for partnership.", ownership_status: "own_fully", licensing_potential: "high", notes: "Advisory potential $50K-$150K per engagement.", sort_order: 6 },
  ];

  for (const item of items) {
    await insertRow("asset_inventory_items", { id: randomUUID(), user_id: id, ...item });
  }

  // Portfolio analysis — gives the dashboard Valuation + Drivers + Risk Flags cards
  // something to render. Mirrors the depth of Marcus's analysis but scaled to a
  // Stage-3 maker's asset mix (catalog of films, audience, creative judgment).
  await insertRow("asset_inventory_analyses", {
    id: randomUUID(),
    user_id: id,
    item_count: items.length,
    status: "completed",
    analysis_content: {
      summary: {
        total_assets: items.length,
        estimated_total_value_range: "$600K - $1.4M",
        leverage_score: "medium",
        leverage_rationale: "Strong creative judgment and audience, but no formal IP or licensing infrastructure to monetize them.",
        key_insight: "Your catalog of completed films + creative direction judgment are independently valuable. Together with the right entity structure, they could underwrite consulting + licensing income that doubles project revenue.",
      },
      asset_valuations: [
        { asset_name: "Film catalog (4 features)", asset_type: "ip", estimated_value_range: "$200K - $500K", value_rationale: "Indie films with festival placement command licensing fees of $40-150K per territory. Catalog value depends on rights clarity.", immediate_actions: ["Audit each film for retained rights", "Quantify gross participation owed", "Package for streaming licensing"] },
        { asset_name: "Creative direction judgment", asset_type: "judgment", estimated_value_range: "$150K - $400K (annualized)", value_rationale: "Advisory engagements at $50-150K reflect rare directorial judgment. Currently unpriced in deals.", immediate_actions: ["Define advisory tier offering", "Convert one collab into paid creative-director role"] },
      ],
      scenarios: [
        { scenario_name: "Rights audit + licensing (12 months)", description: "Audit catalog rights and pursue 2-3 streaming/territory licenses.", potential_value: "$80K - $200K additional annual revenue", required_steps: ["Rights audit", "Sign sales agent", "Submit to 3 streaming buyers"], timeline: "12 months", risk_level: "Low" },
      ],
      roadmap: {
        immediate_actions: [
          { order: 1, action: "Audit film catalog for retained rights", why: "Can't license what you don't formally own.", timeline: "6 weeks" },
          { order: 2, action: "Form production LLC with IP assignment provisions", why: "Future projects need clean rights from day one.", timeline: "4 weeks" },
          { order: 3, action: "Define paid creative-director offering", why: "Convert advisory work into structured engagement with deliverables and equity.", timeline: "3 weeks" },
        ],
        medium_term: "Production LLC operating. 2 catalog titles licensed. Advisory revenue exceeds project revenue.",
        long_term_vision: "Director-driven production company with backend on every project.",
        recommended_structures: [9, 17, 22, 27, 28],
      },
      value_drivers: [
        { name: "IP Strength",         score: "medium", pct: 65, rationale: "4 completed features with festival pedigree, but rights clarity is uneven across the catalog." },
        { name: "Market Demand",       score: "high",   pct: 82, rationale: "Indie streaming licensing demand is structurally strong; festival pedigree opens doors." },
        { name: "Differentiation",     score: "high",   pct: 88, rationale: "Distinctive directorial voice — collaborators cite this as the primary reason for partnership." },
        { name: "Execution Readiness", score: "medium", pct: 55, rationale: "Strong on creative; weak on legal and licensing infrastructure to commercialize at scale." },
        { name: "Financial Upside",    score: "medium", pct: 70, rationale: "Real upside on licensing + advisory tracks if rights and offerings are structured." },
      ],
      risks: [
        { name: "IP ownership clarity",      severity: "high",   rationale: "Multiple film projects lack documented chain-of-title; can't be licensed until cleared." },
        { name: "Single-project income",     severity: "medium", rationale: "Income concentrates around one feature at a time; gaps between films create cashflow stress." },
        { name: "Dependency on key talent",  severity: "medium", rationale: "All revenue tied to founder's direction time; no scalable layer beneath." },
        { name: "Brand-as-judgment opacity", severity: "low",    rationale: "Creative judgment is the asset, but it's not packaged for buyers — invisible market value." },
      ],
    },
  });

  await addBookmarks(id, 5);
  console.log("  ✓ Filmmaker seeded (assessment + roadmap + 2 deals + verdict + 6 assets + analysis + bookmarks)");
}

// ---------------------------------------------------------------------------
// 3B. POWER USER — PRODUCT DESIGNER (service, stage 2, established_practitioner)
// ---------------------------------------------------------------------------

async function seedServiceUser() {
  console.log("\n— Product Designer / Service (test-service) — Priya Sharma —");
  const id = await createUser(`test-service@${EMAIL_DOMAIN}`, "Priya Sharma");
  if (!id) return;

  await updateProfile(id, {
    role: "member",
    status: "active",
    onboarding_completed: true,
    bio: "Product design lead turned independent consultant. Helping startups build design systems and product strategy.",
    creative_mode: "service",
    detected_stage: 2,
    archetype_primary: "high_earner_no_ownership",
    assessment_completed_at: new Date("2026-02-28").toISOString(),
    disciplines: ["product_design", "ux", "design_systems"],
    career_stage: "established",
    income_range: "150k_200k",
    interests: ["premium_pricing", "advisory_roles", "equity_deals"],
  });

  await upsertSubscription(id, activeSub(id));

  // Assessment — service professional, stage 2, high-earner-no-ownership
  const assessmentId = await insertRow("assessments", {
    id: randomUUID(),
    user_id: id,
    version: 1,
    status: "completed",
    discipline: "design",
    sub_discipline: "product_design",
    creative_mode: "service",
    energy_ranking: ["design_systems", "product_strategy", "mentorship"],
    drains: ["pixel_pushing", "scope_creep", "stakeholder_management"],
    dream_response:
      "Advisory-level consulting at $30K+ per engagement, plus equity stakes in the startups I design for. Four clients max, rest of time is mine.",
    income_range: "150k_200k",
    income_structure: {
      salary: 0,
      fees_sales: 80,
      retainer_commission: 15,
      royalties: 0,
      equity: 0,
      products: 5,
    },
    what_they_pay_for: "solution",
    equity_positions: "offered",
    demand_level: "overflow",
    business_structure: "llc",
    stage_questions: {
      "Q-STAGE-1": "specialist",
      "Q-STAGE-2": "solution",
    },
    industry_questions: {},
    discernment_questions: { "Q-DISC-1": "curates", "Q-DISC-2": "selective" },
    three_year_goal:
      "Four anchor advisory clients with equity, plus a design systems course generating passive income.",
    risk_tolerance: "moderate",
    constraints: ["solo_operator", "capacity", "geographic"],
    specific_question:
      "I keep getting offered equity but don't know how to evaluate whether the terms are fair.",
    detected_stage: 2,
    stage_score: 2.50,
    transition_readiness: "high",
    misalignment_flags: [
      "judgment_not_priced",
      "demand_exceeds_capacity",
      "talent_without_structure",
    ],
    archetype_primary: "high_earner_no_ownership",
    archetype_secondary: "established_practitioner",
    current_section: 5,
    current_question: 0,
    started_at: new Date("2026-02-25").toISOString(),
    completed_at: new Date("2026-02-28").toISOString(),
  });

  // Roadmap
  let planId: string | null = null;
  if (assessmentId) {
    planId = await insertRow("strategic_plans", {
      id: randomUUID(),
      user_id: id,
      assessment_id: assessmentId,
      status: "published",
      published_at: new Date("2026-03-01").toISOString(),
      plan_content: {
        position: {
          detected_stage: 2,
          stage_name: "Positioning",
          stage_description:
            "High demand, recognized expertise, but all income is fee-for-service with no ownership positions.",
          transition_readiness: "High — overflow demand gives immediate negotiation leverage.",
          industry_context:
            "Product design consulting — startups routinely offer equity but most designers don't know how to evaluate or structure it.",
          misalignments: [
            {
              flag: "judgment_not_priced",
              what_its_costing: "$50K-$100K annually. Your strategic direction is priced as execution.",
              why_it_matters: "Clients get product strategy worth 5x your fee — you're leaving money on the table.",
            },
            {
              flag: "demand_exceeds_capacity",
              what_its_costing: "Turning away $100K+ annually.",
              why_it_matters: "Excess demand is unused leverage for premium pricing and equity asks.",
            },
            {
              flag: "talent_without_structure",
              what_its_costing: "No legal entity separation; personal liability exposure.",
              why_it_matters: "As you take equity positions, you need proper entity structure.",
            },
          ],
        },
        actions: [
          {
            order: 1,
            type: "foundation",
            title: "Create a strategy-only engagement tier",
            what: "Separate product strategy from execution. Price strategy audits at $20K-$35K.",
            why: "Captures the value gap immediately.",
            how: "Structure #1 (Premium Service Model). Pilot with your next inquiry.",
            timeline: "3 weeks",
            done_signal: "One strategy-only proposal sent at $20K+.",
          },
          {
            order: 2,
            type: "positioning",
            title: "Evaluate and accept your first equity offer",
            what: "Use the deal evaluator on the next equity offer. Negotiate terms using Structure #17.",
            why: "You've been offered equity before but never taken it. Time to start.",
            how: "Run the evaluator, review the verdict, use recommended negotiation points.",
            timeline: "6 weeks",
            done_signal: "One equity deal evaluated, terms negotiated, signed.",
          },
          {
            order: 3,
            type: "momentum",
            title: "Set up proper entity structure",
            what: "Form an LLC (or upgrade to S-Corp) with operating agreement that supports equity holdings.",
            why: "You need a legal container before accumulating equity positions.",
            how: "Consult business attorney. In Sequence provides referrals.",
            timeline: "4 weeks",
            done_signal: "Entity formed; operating agreement signed.",
          },
        ],
        vision: {
          twelve_month_target: "Strategy tier active; 1 equity deal closed; entity formed.",
          three_year_horizon: "4 anchor clients with equity; $300K+ revenue; 25% from equity/passive.",
          transition_signals: ["First equity deal closes", "Strategy engagement > $25K", "Passive income starts"],
          structures_to_study: [1, 2, 4, 17, 18, 19, 26],
          relevant_cases: ["jessica-walsh", "chris-do", "tobias-van-schneider"],
        },
        library: {
          recommended_structures: [
            { id: 1, title: "Premium Service Model", why: "Price strategy at its value." },
            { id: 17, title: "Equity-for-Services Model", why: "First equity conversation template." },
            { id: 19, title: "Vesting Equity", why: "Understand how startup equity vesting works." },
          ],
          recommended_cases: [
            { slug: "chris-do", title: "Chris Do", why: "Designer who built advisory practice + education." },
            { slug: "jessica-walsh", title: "Jessica Walsh", why: "Service to studio ownership." },
          ],
          reading_path: ["Structures 1-4: Service pricing", "Structures 17-21: Equity", "Case studies: Designer evolution"],
        },
      },
    });
  }

  // Actions — all pending (she just got her roadmap)
  if (planId) {
    await insertRow("assessment_actions", {
      id: randomUUID(), user_id: id, plan_id: planId,
      action_order: 1, action_type: "foundation", status: "in_progress",
      notes: "Drafting strategy engagement proposal for a Series B fintech client.",
    });
    await insertRow("assessment_actions", {
      id: randomUUID(), user_id: id, plan_id: planId,
      action_order: 2, action_type: "positioning", status: "pending",
    });
    await insertRow("assessment_actions", {
      id: randomUUID(), user_id: id, plan_id: planId,
      action_order: 3, action_type: "momentum", status: "pending",
    });
  }

  // Deal — service deal with equity component, yellow (needs restructure)
  await insertRow("deal_evaluations", {
    id: randomUUID(),
    user_id: id,
    status: "completed",
    creative_mode: "service",
    creative_mode_source: "assessment",
    deal_type: "service",
    deal_name: "Fintech Startup Design System + Advisory",
    mapped_structures: [1, 2, 17, 26],
    assessment_id: assessmentId,
    assessment_stage: 2,
    assessment_flags: ["judgment_not_priced", "demand_exceeds_capacity"],
    archetype_primary: "high_earner_no_ownership",
    answers_financial: {
      F1: { value: 10000, source: "evaluator" },
      F2: { value: 15000, source: "evaluator" },
    },
    answers_career: { C1: { value: "portfolio_value", source: "evaluator" } },
    answers_partner: { P1: { value: "funded_startup", source: "evaluator" } },
    answers_structure: { D1: { value: "sow", source: "evaluator" } },
    answers_risk: { R1: { value: "funded", source: "evaluator" } },
    answers_legal: { L1: { value: "no_attorney", source: "evaluator" } },
    scores: {
      financial: { score: 6.0, signal: "yellow", flags: ["below_market"] },
      career: { score: 8.5, signal: "green", flags: [] },
      partner: { score: 7.5, signal: "green", flags: [] },
      structure: { score: 5.5, signal: "yellow", flags: ["no_equity_terms"] },
      risk: { score: 7.0, signal: "green", flags: [] },
      legal: { score: 4.5, signal: "yellow", flags: ["no_legal_review"] },
      overall: { score: 6.5, signal: "yellow" },
    },
    overall_score: 6.5,
    overall_signal: "yellow",
    red_flags: ["below_market", "no_legal_review"],
    current_dimension: 6,
    deal_outcome: "renegotiated",
    outcome_notes: "Renegotiated from $10K/mo flat to $8K/mo + 0.75% equity vesting 24mo. Added attorney review.",
    outcome_recorded_at: new Date("2026-03-08").toISOString(),
    started_at: new Date("2026-03-05").toISOString(),
    completed_at: new Date("2026-03-06").toISOString(),
  });

  // Second deal — advisory, red signal, declined
  await insertRow("deal_evaluations", {
    id: randomUUID(),
    user_id: id,
    status: "completed",
    creative_mode: "service",
    creative_mode_source: "assessment",
    deal_type: "advisory",
    deal_name: "Pre-Seed Startup Advisory (Design)",
    mapped_structures: [4, 17],
    assessment_id: assessmentId,
    assessment_stage: 2,
    answers_financial: { F1: { value: 0, source: "evaluator" } },
    answers_career: { C1: { value: "network", source: "evaluator" } },
    answers_partner: { P1: { value: "pre_seed", source: "evaluator" } },
    answers_structure: { D1: { value: "verbal", source: "evaluator" } },
    answers_risk: { R1: { value: "unfunded", source: "evaluator" } },
    answers_legal: { L1: { value: "no_attorney", source: "evaluator" } },
    scores: {
      financial: { score: 2.0, signal: "red", flags: ["no_compensation"] },
      career: { score: 5.0, signal: "yellow", flags: [] },
      partner: { score: 3.5, signal: "red", flags: ["unfunded", "no_track_record"] },
      structure: { score: 2.0, signal: "red", flags: ["verbal_only"] },
      risk: { score: 3.0, signal: "red", flags: ["unfunded"] },
      legal: { score: 2.5, signal: "red", flags: ["no_agreement"] },
      overall: { score: 3.0, signal: "red" },
    },
    overall_score: 3.0,
    overall_signal: "red",
    red_flags: ["no_compensation", "unfunded", "verbal_only", "no_agreement"],
    current_dimension: 6,
    deal_outcome: "declined",
    outcome_notes: "Declined after evaluator flagged zero compensation, no written agreement, and unfunded company. Offered to revisit post-funding with proper terms.",
    outcome_recorded_at: new Date("2026-03-10").toISOString(),
    started_at: new Date("2026-03-09").toISOString(),
    completed_at: new Date("2026-03-09").toISOString(),
  });

  // Inventory — designer assets
  const items = [
    { asset_name: "Design systems framework (proprietary)", asset_type: "process", description: "Modular design system methodology used across 15+ startup engagements. Teachable.", ownership_status: "own_fully", licensing_potential: "high", sort_order: 1 },
    { asset_name: "Case study portfolio (20+ projects)", asset_type: "ip", description: "Documented case studies with measurable outcomes. Foundation for course or book.", ownership_status: "own_partially", licensing_potential: "medium", sort_order: 2 },
    { asset_name: "Startup ecosystem network", asset_type: "relationship", description: "Deep relationships with 25+ founders, 10+ VCs, design community leaders.", ownership_status: "own_fully", licensing_potential: "not_applicable", sort_order: 3 },
    { asset_name: "Newsletter audience (12K subscribers)", asset_type: "audience", description: "Weekly design strategy newsletter. High-value startup founder demographic.", ownership_status: "own_fully", licensing_potential: "medium", sort_order: 4 },
    { asset_name: "Product strategy judgment", asset_type: "judgment", description: "Consistently cited by founders as the reason they hire me. Pattern recognition across 50+ products.", ownership_status: "own_fully", licensing_potential: "high", notes: "Advisory potential: $25K-$75K per engagement.", sort_order: 5 },
  ];

  for (const item of items) {
    await insertRow("asset_inventory_items", { id: randomUUID(), user_id: id, ...item });
  }

  // Portfolio analysis — Stage-2 service provider (designer) with strong network
  // and judgment IP but no entity structure or licensing layer.
  await insertRow("asset_inventory_analyses", {
    id: randomUUID(),
    user_id: id,
    item_count: items.length,
    status: "completed",
    analysis_content: {
      summary: {
        total_assets: items.length,
        estimated_total_value_range: "$300K - $750K",
        leverage_score: "medium",
        leverage_rationale: "Strong judgment + network with no structural framing to convert into equity or recurring revenue.",
        key_insight: "You're trading judgment for fees. With one entity restructure and a productized advisory tier, that same judgment becomes equity in 3-4 portfolio companies.",
      },
      asset_valuations: [
        { asset_name: "Newsletter audience (12K subscribers)", asset_type: "audience", estimated_value_range: "$60K - $180K", value_rationale: "Founder-skewed list with strong open rates. Sponsorship rates $1-3K per send.", immediate_actions: ["Audit current sponsor pipeline", "Define content licensing tier"] },
        { asset_name: "Product strategy judgment", asset_type: "judgment", estimated_value_range: "$200K - $500K (annualized)", value_rationale: "Founders consistently cite this as the reason they hire. Currently un-priced in fixed-fee deals.", immediate_actions: ["Convert one client to advisory + equity", "Productize as standalone offering"] },
      ],
      scenarios: [
        { scenario_name: "Equity-for-services pivot (12 months)", description: "Restructure 2-3 client engagements to include equity component.", potential_value: "$150K-$400K paper equity within 12 months", required_steps: ["Form advisory LLC", "Draft equity-for-services template", "Renegotiate 2-3 active engagements"], timeline: "12 months", risk_level: "Low" },
      ],
      roadmap: {
        immediate_actions: [
          { order: 1, action: "Form S-Corp / LLC for advisory income", why: "Currently sole-proprietor; missing tax efficiency and equity-receipt vehicle.", timeline: "3 weeks" },
          { order: 2, action: "Draft equity-for-services contract template", why: "Baseline for converting any future client to equity participation.", timeline: "4 weeks" },
          { order: 3, action: "Pitch one current client on advisor-with-equity restructure", why: "First proof point to learn pricing and structure.", timeline: "6 weeks" },
        ],
        medium_term: "Active in 2-3 portfolio companies via equity-for-services. Newsletter generating $30K+/yr in sponsorships.",
        long_term_vision: "Pure advisory practice + portfolio of equity stakes; project work becomes optional.",
        recommended_structures: [4, 17, 18, 22, 24],
      },
      value_drivers: [
        { name: "IP Strength",         score: "medium", pct: 60, rationale: "Strategy frameworks have value but aren't documented as licensable IP." },
        { name: "Market Demand",       score: "high",   pct: 85, rationale: "Founder demand for product strategy advisors is structurally rising — every YC batch needs this." },
        { name: "Differentiation",     score: "high",   pct: 80, rationale: "Founder-cited as the reason for engagement; track record across 50+ products." },
        { name: "Execution Readiness", score: "high",   pct: 78, rationale: "Engaged, organized, and in-demand — ready to convert to advisory + equity model." },
        { name: "Financial Upside",    score: "medium", pct: 65, rationale: "Equity-for-services portfolio can compound, but takes 3-5 years before exits materialize." },
      ],
      risks: [
        { name: "Single-buyer dependency",  severity: "high",   rationale: "Top client represents 60%+ of revenue. If they pause, income halves." },
        { name: "No equity participation",  severity: "high",   rationale: "All judgment given for fees; no upside on the products you help build." },
        { name: "IP ownership clarity",     severity: "medium", rationale: "Strategy frameworks delivered to clients without explicit retention clauses." },
        { name: "Sole-proprietor exposure", severity: "medium", rationale: "No entity structure means personal liability and tax-inefficient income flow." },
      ],
    },
  });

  await addBookmarks(id, 4);
  console.log("  ✓ Product designer seeded (assessment + roadmap + 2 deals [yellow + red] + 5 assets + analysis + bookmarks)");
}

// ---------------------------------------------------------------------------
// 3C. POWER USER — MUSICIAN (performer, stage 3, untapped_catalog)
// ---------------------------------------------------------------------------

async function seedPerformerUser() {
  console.log("\n— Musician / Performer (test-performer) — Marcus Cole —");
  const id = await createUser(`test-performer@${EMAIL_DOMAIN}`, "Marcus Cole");
  if (!id) return;

  await updateProfile(id, {
    role: "member",
    status: "active",
    onboarding_completed: true,
    bio: "Independent musician and producer with 3 albums, 200+ sync placements, and a growing catalog. Transitioning from touring income to ownership and licensing.",
    creative_mode: "performer",
    detected_stage: 3,
    archetype_primary: "untapped_catalog",
    assessment_completed_at: new Date("2026-02-20").toISOString(),
    disciplines: ["music", "production", "songwriting"],
    career_stage: "established",
    income_range: "100k_150k",
    interests: ["royalty_structures", "licensing", "catalog_monetization"],
  });

  await upsertSubscription(id, activeSub(id));

  // Assessment — performer, stage 3, untapped catalog
  const assessmentId = await insertRow("assessments", {
    id: randomUUID(),
    user_id: id,
    version: 1,
    status: "completed",
    discipline: "music",
    sub_discipline: "production",
    creative_mode: "performer",
    energy_ranking: ["songwriting", "production", "collaboration"],
    drains: ["touring_logistics", "social_media", "contract_negotiation"],
    dream_response:
      "My catalog generates $30K+ per month in sync and licensing income while I focus only on projects I love. Maybe a label or publishing company for other artists.",
    income_range: "100k_150k",
    income_structure: {
      salary: 0,
      fees_sales: 30,
      retainer_commission: 5,
      royalties: 35,
      equity: 5,
      products: 25,
    },
    what_they_pay_for: "direction",
    equity_positions: "one",
    demand_level: "steady",
    business_structure: "llc_scorp",
    stage_questions: {
      "Q-STAGE-1": "catalog",
      "Q-STAGE-2": "direction",
    },
    industry_questions: {},
    discernment_questions: { "Q-DISC-1": "curates", "Q-DISC-2": "influential" },
    three_year_goal:
      "Catalog income exceeds touring income. Own a small publishing company for emerging artists.",
    risk_tolerance: "moderate",
    constraints: ["touring_schedule", "family_commitments"],
    specific_question:
      "Should I sell a portion of my catalog or keep licensing it piece by piece?",
    detected_stage: 3,
    stage_score: 2.85,
    transition_readiness: "moderate",
    misalignment_flags: [
      "ip_not_monetized",
      "income_exceeds_structure",
    ],
    archetype_primary: "untapped_catalog",
    archetype_secondary: "platform_builder",
    current_section: 5,
    current_question: 0,
    started_at: new Date("2026-02-18").toISOString(),
    completed_at: new Date("2026-02-20").toISOString(),
  });

  // Roadmap
  let planId: string | null = null;
  if (assessmentId) {
    planId = await insertRow("strategic_plans", {
      id: randomUUID(),
      user_id: id,
      assessment_id: assessmentId,
      status: "published",
      published_at: new Date("2026-02-21").toISOString(),
      plan_content: {
        position: {
          detected_stage: 3,
          stage_name: "Momentum",
          stage_description:
            "Multiple income streams including royalties, but catalog significantly under-leveraged.",
          transition_readiness: "Moderate — catalog value is there but structural work needed.",
          industry_context:
            "Music — sync licensing market is booming. Catalog owners with organized, cleared catalogs command premium placement fees.",
          misalignments: [
            {
              flag: "ip_not_monetized",
              what_its_costing: "Catalog of 200+ tracks generating $40K/yr when market potential is $150K-$300K.",
              why_it_matters: "Your back catalog is your most valuable asset. Every month it's under-licensed is lost revenue.",
            },
            {
              flag: "income_exceeds_structure",
              what_its_costing: "Tax inefficiency of $15K-$30K annually.",
              why_it_matters: "S-Corp + publishing entity structure would capture significant tax savings on royalty income.",
            },
          ],
        },
        actions: [
          {
            order: 1,
            type: "foundation",
            title: "Audit and organize your catalog for licensing",
            what: "Create a master catalog spreadsheet: track title, splits, clearance status, sync potential, existing placements.",
            why: "Sync supervisors and licensing agents need organized, cleared catalogs. Yours is scattered across drives and emails.",
            how: "Start with top 50 tracks. Use catalog management template from In Sequence.",
            timeline: "3 weeks",
            done_signal: "Master spreadsheet complete for top 50 tracks with clearance status.",
          },
          {
            order: 2,
            type: "positioning",
            title: "Sign with a sync licensing agent or agency",
            what: "Pitch your organized catalog to 3-5 sync licensing agencies. Negotiate non-exclusive terms.",
            why: "A dedicated agent can 3-5x your sync income by actively pitching to music supervisors.",
            how: "Use Structure #27 (Non-Exclusive Licensing). Negotiate 70/30 or 75/25 split in your favor.",
            timeline: "6 weeks",
            done_signal: "Signed with at least one sync agent; first batch of tracks submitted.",
          },
          {
            order: 3,
            type: "momentum",
            title: "Explore catalog securitization or partial sale",
            what: "Get a professional catalog valuation. Decide whether to sell a minority stake or securitize future royalties.",
            why: "A $500K-$1M lump sum could fund your publishing company while you retain majority ownership.",
            how: "Use Structure #14 (Catalog/IP Securitization). Consult entertainment attorney + music business advisor.",
            timeline: "12 weeks",
            done_signal: "Professional catalog valuation received; term sheet drafted for partial sale or securitization.",
          },
        ],
        vision: {
          twelve_month_target: "Catalog organized; sync agent active; licensing income doubles to $80K+.",
          three_year_horizon: "Publishing company operational; catalog generating $200K+/yr; touring optional not required.",
          transition_signals: [
            "Sync income exceeds touring income",
            "Publishing company signs first artist",
            "Catalog valuation completed",
          ],
          structures_to_study: [14, 25, 27, 28, 29, 30, 31],
          relevant_cases: ["tash-sultana", "chance-the-rapper", "pomplamoose", "taylor-swift"],
        },
        library: {
          recommended_structures: [
            { id: 27, title: "Non-Exclusive Licensing", why: "Sync agent deal structure." },
            { id: 14, title: "Catalog/IP Securitization", why: "Understand catalog sale/financing options." },
            { id: 25, title: "Royalty Structures", why: "Optimize your existing royalty streams." },
          ],
          recommended_cases: [
            { slug: "tash-sultana", title: "Tash Sultana", why: "Independent artist, retained masters, built licensing machine." },
            { slug: "chance-the-rapper", title: "Chance the Rapper", why: "Independent distribution, ownership-first model." },
            { slug: "taylor-swift", title: "Taylor Swift", why: "Catalog ownership strategy and re-recording economics." },
          ],
          reading_path: [
            "Structures 25, 27, 28: Royalties and licensing",
            "Structure 14: Catalog securitization",
            "Structures 29-31: Rights and territory splitting",
            "Case studies: Music ownership",
          ],
        },
      },
    });
  }

  // Actions — action 1 completed, others pending
  if (planId) {
    await insertRow("assessment_actions", {
      id: randomUUID(), user_id: id, plan_id: planId,
      action_order: 1, action_type: "foundation", status: "completed",
      completed_at: new Date("2026-03-08").toISOString(),
      notes: "Cataloged top 50 tracks. Found 12 with unclear splits that need resolution. 38 cleared and ready.",
    });
    await insertRow("assessment_actions", {
      id: randomUUID(), user_id: id, plan_id: planId,
      action_order: 2, action_type: "positioning", status: "in_progress",
      notes: "Reached out to 3 sync agencies. One meeting scheduled, two reviewing catalog package.",
    });
    await insertRow("assessment_actions", {
      id: randomUUID(), user_id: id, plan_id: planId,
      action_order: 3, action_type: "momentum", status: "pending",
    });
  }

  // Deal 1 — licensing deal with sync agency, green
  const evalId = await insertRow("deal_evaluations", {
    id: randomUUID(),
    user_id: id,
    status: "completed",
    creative_mode: "performer",
    creative_mode_source: "assessment",
    deal_type: "licensing",
    deal_name: "Sync Licensing Agency Agreement",
    mapped_structures: [27, 25],
    assessment_id: assessmentId,
    assessment_stage: 3,
    assessment_flags: ["ip_not_monetized", "income_exceeds_structure"],
    archetype_primary: "untapped_catalog",
    answers_financial: {
      F1: { value: 0, source: "evaluator" },
      F2: { value: 50000, source: "evaluator" },
    },
    answers_career: { C1: { value: "passive_income", source: "evaluator" } },
    answers_partner: { P1: { value: "established_agency", source: "evaluator" } },
    answers_structure: { D1: { value: "standard_agency", source: "evaluator" } },
    answers_risk: { R1: { value: "no_upfront", source: "evaluator" } },
    answers_legal: { L1: { value: "entertainment_attorney", source: "evaluator" } },
    scores: {
      financial: { score: 7.5, signal: "green", flags: [] },
      career: { score: 8.0, signal: "green", flags: [] },
      partner: { score: 8.5, signal: "green", flags: [] },
      structure: { score: 7.0, signal: "green", flags: [] },
      risk: { score: 8.0, signal: "green", flags: [] },
      legal: { score: 7.5, signal: "green", flags: [] },
      overall: { score: 7.8, signal: "green" },
    },
    overall_score: 7.8,
    overall_signal: "green",
    red_flags: [],
    current_dimension: 6,
    deal_outcome: "accepted",
    outcome_notes: "Signed non-exclusive 2-year deal, 75/25 split in my favor. 38 tracks in first batch.",
    outcome_recorded_at: new Date("2026-03-10").toISOString(),
    started_at: new Date("2026-03-06").toISOString(),
    completed_at: new Date("2026-03-07").toISOString(),
  });

  // Deal 2 — catalog partial sale offer, yellow (complex, needs thought)
  await insertRow("deal_evaluations", {
    id: randomUUID(),
    user_id: id,
    status: "completed",
    creative_mode: "performer",
    creative_mode_source: "assessment",
    deal_type: "revenue_share",
    deal_name: "Catalog Partial Sale — Hipgnosis Offer",
    mapped_structures: [14, 22, 25],
    assessment_id: assessmentId,
    assessment_stage: 3,
    answers_financial: {
      F1: { value: 750000, source: "evaluator" },
      F2: { value: 0, source: "evaluator" },
    },
    answers_career: { C1: { value: "capital", source: "evaluator" } },
    answers_partner: { P1: { value: "catalog_fund", source: "evaluator" } },
    answers_structure: { D1: { value: "detailed", source: "evaluator" } },
    answers_risk: { R1: { value: "irrevocable", source: "evaluator" } },
    answers_legal: { L1: { value: "entertainment_attorney", source: "evaluator" } },
    scores: {
      financial: { score: 7.0, signal: "green", flags: [] },
      career: { score: 5.5, signal: "yellow", flags: ["loss_of_control"] },
      partner: { score: 7.0, signal: "green", flags: [] },
      structure: { score: 6.0, signal: "yellow", flags: ["irrevocable_terms"] },
      risk: { score: 5.0, signal: "yellow", flags: ["permanent_rights_transfer"] },
      legal: { score: 7.5, signal: "green", flags: [] },
      overall: { score: 6.3, signal: "yellow" },
    },
    overall_score: 6.3,
    overall_signal: "yellow",
    red_flags: ["permanent_rights_transfer", "irrevocable_terms"],
    current_dimension: 6,
    deal_outcome: "pending",
    outcome_notes: "Reviewing with attorney. Considering counter-offer: sell 30% instead of 50%, retain sync approval rights.",
    started_at: new Date("2026-03-09").toISOString(),
    completed_at: new Date("2026-03-10").toISOString(),
  });

  // Deal 3 — brand partnership, red (exploitative terms)
  await insertRow("deal_evaluations", {
    id: randomUUID(),
    user_id: id,
    status: "completed",
    creative_mode: "performer",
    creative_mode_source: "assessment",
    deal_type: "partnership",
    deal_name: "Headphone Brand Ambassador Deal",
    mapped_structures: [1, 24],
    assessment_id: assessmentId,
    assessment_stage: 3,
    answers_financial: { F1: { value: 5000, source: "evaluator" } },
    answers_career: { C1: { value: "visibility", source: "evaluator" } },
    answers_partner: { P1: { value: "consumer_brand", source: "evaluator" } },
    answers_structure: { D1: { value: "template", source: "evaluator" } },
    answers_risk: { R1: { value: "exclusivity_clause", source: "evaluator" } },
    answers_legal: { L1: { value: "no_attorney", source: "evaluator" } },
    scores: {
      financial: { score: 3.0, signal: "red", flags: ["severely_below_market"] },
      career: { score: 4.0, signal: "yellow", flags: [] },
      partner: { score: 5.0, signal: "yellow", flags: [] },
      structure: { score: 2.5, signal: "red", flags: ["perpetual_usage_rights"] },
      risk: { score: 2.0, signal: "red", flags: ["exclusivity", "perpetual_image_rights"] },
      legal: { score: 3.0, signal: "red", flags: ["no_legal_review", "one_sided_terms"] },
      overall: { score: 3.3, signal: "red" },
    },
    overall_score: 3.3,
    overall_signal: "red",
    red_flags: [
      "severely_below_market",
      "perpetual_usage_rights",
      "exclusivity",
      "no_legal_review",
    ],
    current_dimension: 6,
    deal_outcome: "declined",
    outcome_notes: "Declined. $5K for 2 years exclusivity + perpetual image rights is exploitative. Evaluator confirmed — red across the board.",
    outcome_recorded_at: new Date("2026-03-11").toISOString(),
    started_at: new Date("2026-03-10").toISOString(),
    completed_at: new Date("2026-03-10").toISOString(),
  });

  // Verdict for sync agency deal
  if (evalId) {
    await insertRow("deal_verdicts", {
      id: randomUUID(),
      user_id: id,
      evaluation_id: evalId,
      status: "published",
      verdict_content: {
        signal: {
          color: "green",
          headline: "Well-structured non-exclusive licensing agreement",
          summary: "The 75/25 split is favorable, non-exclusivity preserves your options, and the agency has strong sync placement track record.",
        },
        dimension_summaries: {
          financial: "No upfront cost; revenue-share only model is low-risk with high upside potential.",
          career: "Sync placements build passive income and expand your audience in film/TV.",
          partner: "Agency has placed 500+ tracks in major productions. Strong industry relationships.",
          structure: "Non-exclusive 2-year term is ideal. You can work with multiple agents simultaneously.",
          risk: "Low risk — no upfront investment, non-exclusive, 2-year term with exit clause.",
          legal: "Standard agency agreement. Have attorney confirm ownership isn't transferred.",
        },
        recommended_actions: [
          {
            order: 1,
            action: "Confirm no ownership transfer clauses",
            detail: "Ensure the agency agreement doesn't include any language that transfers ownership or grants exclusive rights to your masters.",
            structure_ref: { id: 27, slug: "non-exclusive-licensing", title: "Non-Exclusive Licensing" },
          },
          {
            order: 2,
            action: "Set up quarterly performance reviews",
            detail: "Build in check-ins to evaluate placement activity and renegotiate terms if placements exceed projections.",
            structure_ref: null,
          },
        ],
        resources: {
          structures: [
            { id: 27, slug: "non-exclusive-licensing", title: "Non-Exclusive Licensing", why: "Your deal structure — understand the nuances." },
            { id: 25, slug: "royalty-structures", title: "Royalty Structures", why: "Optimize how your sync royalties flow." },
          ],
          case_studies: [
            { slug: "tash-sultana", title: "Tash Sultana", why: "Independent licensing success story." },
          ],
        },
      },
    });
  }

  // Inventory — musician assets
  const items = [
    { asset_name: "Music catalog (200+ original tracks, 3 albums)", asset_type: "ip", description: "Full master + publishing rights on 180 tracks. 20 tracks with co-writer splits. 3 released albums + singles.", ownership_status: "own_fully", licensing_potential: "high", sort_order: 1 },
    { asset_name: "200+ sync placements (film, TV, ads)", asset_type: "ip", description: "Documented placement history across major networks, streaming, and advertising. Generates $40K/yr currently.", ownership_status: "own_fully", licensing_potential: "already_licensed", sort_order: 2 },
    { asset_name: "Production workflow + sample library", asset_type: "process", description: "Custom Ableton templates, sample packs, and production methodology. Could be packaged as course or product.", ownership_status: "own_fully", licensing_potential: "high", sort_order: 3 },
    { asset_name: "Fan base (85K Spotify listeners, 45K social)", asset_type: "audience", description: "Dedicated listener base with high save rates. Email list of 8K fans. Strong in indie/electronic space.", ownership_status: "own_fully", licensing_potential: "medium", sort_order: 4 },
    { asset_name: "Music industry relationships", asset_type: "relationship", description: "Active connections with 15+ sync supervisors, 10 music producers, 5 label A&Rs, 3 music attorneys.", ownership_status: "own_fully", licensing_potential: "not_applicable", sort_order: 5 },
    { asset_name: "Artist brand — indie electronic identity", asset_type: "brand", description: "Recognized in indie electronic community. Festival circuit presence. Press coverage in Pitchfork, Stereogum.", ownership_status: "own_fully", licensing_potential: "medium", sort_order: 6 },
    { asset_name: "Unreleased tracks vault (50+ demos)", asset_type: "ip", description: "50+ unreleased demos and works-in-progress. Some have sync potential if finished.", ownership_status: "own_fully", licensing_potential: "high", notes: "Need to audit and finish top 10-15 for sync submissions.", sort_order: 7 },
  ];

  for (const item of items) {
    await insertRow("asset_inventory_items", { id: randomUUID(), user_id: id, ...item });
  }

  // Inventory analysis
  await insertRow("asset_inventory_analyses", {
    id: randomUUID(),
    user_id: id,
    item_count: items.length,
    status: "completed",
    analysis_content: {
      summary: {
        total_assets: 7,
        estimated_total_value_range: "$1.5M - $3.5M",
        leverage_score: "high",
        leverage_rationale: "Catalog is the primary asset with significant untapped licensing potential.",
        key_insight: "Your catalog generates $40K/yr but market potential is $150K-$300K. The gap is distribution and organization, not quality.",
      },
      asset_valuations: [
        {
          asset_name: "Music catalog (200+ tracks)",
          asset_type: "ip",
          estimated_value_range: "$1M - $2.5M",
          value_rationale: "Comparable indie catalogs with 200+ tracks and active sync history sell for 8-15x annual royalty income. At $40K/yr current, that's $320K-$600K floor. Optimized licensing could push annual to $150K+ → valuation $1.2M-$2.25M.",
          immediate_actions: ["Complete catalog audit for top 50", "Clear splits on 12 disputed tracks", "Package catalog for agency submissions"],
        },
        {
          asset_name: "Production workflow + sample library",
          asset_type: "process",
          estimated_value_range: "$50K - $200K",
          value_rationale: "Production course market is $50-$200 per course. With 85K Spotify listeners as funnel, even 2% conversion = $85K-$340K gross revenue potential.",
          immediate_actions: ["Document production methodology", "Create sample pack MVP", "Test pricing with email list"],
        },
      ],
      scenarios: [
        {
          scenario_name: "Optimize Existing (12 months)",
          description: "Organize catalog, sign sync agent, finish 15 unreleased tracks.",
          potential_value: "$80K - $120K additional annual sync/licensing revenue",
          required_steps: ["Complete catalog audit", "Sign sync agent", "Finish and submit 15 tracks"],
          timeline: "12 months",
          risk_level: "Low",
        },
        {
          scenario_name: "Monetize & Diversify (24 months)",
          description: "Sync optimization + sample pack product + production course.",
          potential_value: "$200K - $350K additional annual revenue",
          required_steps: ["Sync agent active", "Launch sample pack ($29-$49)", "Launch production course ($149-$299)", "Grow email list to 15K"],
          timeline: "24 months",
          risk_level: "Medium",
        },
      ],
      roadmap: {
        immediate_actions: [
          { order: 1, action: "Finish catalog audit (remaining 150 tracks)", why: "Agent can't pitch what isn't organized.", timeline: "4 weeks" },
          { order: 2, action: "Clear disputed splits", why: "12 tracks with unclear ownership are money left on the table.", timeline: "3 weeks" },
          { order: 3, action: "Finish top 10 unreleased tracks", why: "Fresh material for sync agent; demonstrates active catalog.", timeline: "6 weeks" },
        ],
        medium_term: "Sync agent generating $8K+/mo. Sample pack launched. Production course in development.",
        long_term_vision: "Catalog income > touring income. Publishing company operational. Passive income enables creative freedom.",
        recommended_structures: [14, 25, 27, 28, 29, 31],
      },
      value_drivers: [
        { name: "IP Strength",         score: "high",   pct: 88, rationale: "200+ owned tracks with active sync history. Splits mostly clear; 12 tracks need cleanup." },
        { name: "Market Demand",       score: "high",   pct: 85, rationale: "Indie catalog sync demand is structurally rising; placements doubled YoY in similar genres." },
        { name: "Differentiation",     score: "medium", pct: 65, rationale: "Distinctive sound but undifferentiated metadata; competing with creators who tag better." },
        { name: "Execution Readiness", score: "medium", pct: 60, rationale: "Material exists; organization and packaging gap blocks agent submission." },
        { name: "Financial Upside",    score: "high",   pct: 90, rationale: "Current $40K/yr vs. market potential $150K-$300K. 3-7x upside on existing catalog alone." },
      ],
      risks: [
        { name: "IP ownership clarity", severity: "medium", rationale: "12 tracks have disputed or undocumented splits; can't be pitched until cleared." },
        { name: "Single-agent dependency", severity: "medium", rationale: "Sync revenue routes through one agent. Loss of relationship would interrupt income." },
        { name: "Catalog organization", severity: "high", rationale: "150 of 200 tracks lack metadata sufficient for agent submission. Largest unlock blocker." },
        { name: "Touring income concentration", severity: "low", rationale: "Touring is dominant income today; capacity-bounded and not scalable without team." },
      ],
    },
  });

  await addBookmarks(id, 6);
  console.log("  ✓ Musician seeded (assessment + roadmap + 3 deals [green/yellow/red] + verdict + 7 assets + analysis + bookmarks)");
}

// ---------------------------------------------------------------------------
// 4. LAPSED USER — expired subscription
// ---------------------------------------------------------------------------

async function seedLapsedUser() {
  console.log("\n— Lapsed User (test-lapsed) —");
  const id = await createUser(`test-lapsed@${EMAIL_DOMAIN}`, "Lapsed Tester");
  if (!id) return;

  await updateProfile(id, {
    role: "member",
    status: "active",
    onboarding_completed: true,
    creative_mode: "hybrid",
    detected_stage: 1,
    assessment_completed_at: new Date("2025-08-15").toISOString(),
  });

  await upsertSubscription(id, {
    stripe_customer_id: `cus_test_lapsed_${id.slice(0, 8)}`,
    stripe_subscription_id: `sub_test_lapsed_${id.slice(0, 8)}`,
    plan: "full_access",
    status: "canceled",
    current_period_start: new Date("2025-03-01").toISOString(),
    current_period_end: new Date("2026-03-01").toISOString(),
    cancel_at_period_end: true,
  });

  console.log("  ✓ Lapsed user seeded");
}

// ---------------------------------------------------------------------------
// 5. ADMIN USER
// ---------------------------------------------------------------------------

async function seedAdminUser() {
  console.log("\n— Admin User (test-admin) —");
  const id = await createUser(`test-admin@${EMAIL_DOMAIN}`, "Admin Tester");
  if (!id) return;

  await updateProfile(id, { role: "admin", status: "active", onboarding_completed: true });
  await upsertSubscription(id, activeSub(id));
  console.log("  ✓ Admin user seeded");
}

// ---------------------------------------------------------------------------
// 6. DEMO — SALES (polished service archetype for live demos)
// ---------------------------------------------------------------------------

async function seedDemoSales() {
  console.log("\n— Demo Sales User (demo-sales) — Maya Chen —");
  const id = await createUser(`demo-sales@${EMAIL_DOMAIN}`, "Maya Chen");
  if (!id) return;

  await updateProfile(id, {
    role: "member",
    status: "active",
    onboarding_completed: true,
    bio: "Brand strategist and designer building equity positions in the companies I help shape.",
    creative_mode: "service",
    detected_stage: 2,
    archetype_primary: "established_practitioner",
    assessment_completed_at: new Date("2026-02-25").toISOString(),
    disciplines: ["design", "branding", "strategy"],
    career_stage: "established",
    income_range: "150k_200k",
    interests: ["equity_deals", "premium_pricing", "studio_building"],
  });

  await upsertSubscription(id, activeSub(id));

  const assessmentId = await insertRow("assessments", {
    id: randomUUID(),
    user_id: id,
    version: 1,
    status: "completed",
    discipline: "design",
    sub_discipline: "brand_strategy",
    creative_mode: "service",
    energy_ranking: ["brand_strategy", "design_direction", "client_partnership"],
    drains: ["production_work", "project_management", "invoicing"],
    dream_response:
      "A studio where I take 4-5 anchor clients a year, own equity in each, and spend the rest on personal projects.",
    income_range: "150k_200k",
    income_structure: {
      salary: 0, fees_sales: 65, retainer_commission: 25, royalties: 5, equity: 0, products: 5,
    },
    what_they_pay_for: "solution",
    equity_positions: "offered",
    demand_level: "overflow",
    business_structure: "llc",
    detected_stage: 2,
    stage_score: 2.65,
    transition_readiness: "high",
    misalignment_flags: ["judgment_not_priced", "demand_exceeds_capacity"],
    archetype_primary: "established_practitioner",
    archetype_secondary: "high_earner_no_ownership",
    current_section: 5,
    current_question: 0,
    started_at: new Date("2026-02-23").toISOString(),
    completed_at: new Date("2026-02-25").toISOString(),
  });

  if (assessmentId) {
    await insertRow("strategic_plans", {
      id: randomUUID(),
      user_id: id,
      assessment_id: assessmentId,
      status: "published",
      published_at: new Date("2026-02-26").toISOString(),
      plan_content: {
        position: {
          detected_stage: 2,
          stage_name: "Positioning",
          stage_description: "Strong demand and recognized expertise, income still tied to deliverables.",
          transition_readiness: "High — overflow demand gives negotiation leverage.",
          industry_context: "Brand strategy is uniquely positioned for equity because you shape the value others capture.",
          misalignments: [
            { flag: "judgment_not_priced", what_its_costing: "$40K-$80K annually.", why_it_matters: "Strategic judgment priced as deliverables." },
            { flag: "demand_exceeds_capacity", what_its_costing: "$75K-$150K declined annually.", why_it_matters: "Unused leverage." },
          ],
        },
        actions: [
          { order: 1, type: "foundation", title: "Price your thinking separately", what: "$15K-$25K strategy engagements.", why: "Fastest value capture.", how: "Structure #1.", timeline: "3 weeks", done_signal: "One strategy proposal sent." },
          { order: 2, type: "positioning", title: "Propose equity to anchor client", what: "Hybrid fee + 3% equity.", why: "Client depends on your judgment.", how: "Structure #17.", timeline: "6 weeks", done_signal: "Equity proposal discussed." },
          { order: 3, type: "momentum", title: "Formalize your waitlist", what: "Referral revenue from declined work.", why: "Network equity.", how: "10% referral structure.", timeline: "4 weeks", done_signal: "Waitlist live." },
        ],
        vision: {
          twelve_month_target: "Strategy 40% of revenue; one equity deal; waitlist active.",
          three_year_horizon: "Studio with 4-5 equity clients; $300K+; 30% from equity.",
          transition_signals: ["First equity deal", "Strategy > $20K", "Passive income starts"],
          structures_to_study: [1, 2, 4, 17, 18, 26],
          relevant_cases: ["jessica-walsh", "collins", "tobias-van-schneider"],
        },
        library: {
          recommended_structures: [
            { id: 1, title: "Premium Service Model", why: "Price strategy at value." },
            { id: 17, title: "Equity-for-Services Model", why: "First equity template." },
          ],
          recommended_cases: [
            { slug: "jessica-walsh", title: "Jessica Walsh", why: "Designer to studio owner." },
          ],
          reading_path: ["Structures 1-4", "Structures 17, 18, 26", "Case studies"],
        },
      },
    });
  }

  // Inventory
  const demoAssets = [
    { asset_name: "Brand strategy framework (proprietary)", asset_type: "process", description: "6-phase methodology. 40+ clients.", ownership_status: "own_fully", licensing_potential: "high", sort_order: 1 },
    { asset_name: "Client portfolio (case study rights)", asset_type: "ip", description: "Permission to showcase 25+ brand projects.", ownership_status: "own_partially", licensing_potential: "medium", sort_order: 2 },
    { asset_name: "Design industry network", asset_type: "relationship", description: "20+ founders, VCs, creative directors.", ownership_status: "own_fully", licensing_potential: "not_applicable", sort_order: 3 },
    { asset_name: "Thought leadership brand", asset_type: "brand", description: "Conference speaker, 45K newsletter subscribers.", ownership_status: "own_fully", licensing_potential: "medium", sort_order: 4 },
  ];

  for (const item of demoAssets) {
    await insertRow("asset_inventory_items", { id: randomUUID(), user_id: id, ...item });
  }

  // Portfolio analysis — Stage-2 brand strategist (Maya). Polished, demo-friendly
  // example of the dashboard cards in their richest state.
  await insertRow("asset_inventory_analyses", {
    id: randomUUID(),
    user_id: id,
    item_count: demoAssets.length,
    status: "completed",
    analysis_content: {
      summary: {
        total_assets: demoAssets.length,
        estimated_total_value_range: "$800K - $2.2M",
        leverage_score: "high",
        leverage_rationale: "Strong brand-strategy IP and a positioned audience; ready to convert from retainer to equity participation.",
        key_insight: "Three of your last five engagements would have qualified for backend participation. You're sitting on $200K-$500K in unrealized equity from work already shipped.",
      },
      asset_valuations: [
        { asset_name: "Brand strategy frameworks (5 productized)", asset_type: "ip", estimated_value_range: "$300K - $800K", value_rationale: "Documented frameworks command licensing fees of $25-75K per deployment; productized version unlocks recurring revenue.", immediate_actions: ["Trademark framework names", "Build licensing tier pricing"] },
        { asset_name: "Founder advisory judgment", asset_type: "judgment", estimated_value_range: "$200K - $500K (annualized)", value_rationale: "Repeat founders cite Maya as the reason they re-engage. Currently fee-only.", immediate_actions: ["Convert top client to equity component", "Define formal advisor role"] },
        { asset_name: "Conference / speaking platform", asset_type: "audience", estimated_value_range: "$80K - $200K", value_rationale: "Recurring keynote slots at top brand strategy conferences = ongoing pipeline + premium positioning.", immediate_actions: ["Lock in 2026 keynote calendar"] },
      ],
      scenarios: [
        { scenario_name: "Equity conversion (12 months)", description: "Restructure 2-3 retainer engagements to include 1-2% equity stakes.", potential_value: "$300K-$700K paper equity within 12 months", required_steps: ["Form advisory LLC", "Equity-for-services template", "Renegotiate top 3 engagements"], timeline: "12 months", risk_level: "Low" },
        { scenario_name: "IP licensing (24 months)", description: "License brand strategy frameworks to agencies and consultancies.", potential_value: "$200K-$500K annual licensing revenue", required_steps: ["Trademark frameworks", "Build licensing kit", "Sign 3-5 licensee agencies"], timeline: "24 months", risk_level: "Medium" },
      ],
      roadmap: {
        immediate_actions: [
          { order: 1, action: "Form advisory LLC for equity engagements", why: "Currently sole-prop; need entity to receive equity.", timeline: "3 weeks" },
          { order: 2, action: "Trademark top 3 framework names", why: "Foundation for licensing tier; protects IP from agency knockoffs.", timeline: "8 weeks" },
          { order: 3, action: "Convert top retainer client to advisor + equity", why: "First proof point. Use to learn pricing for the next 4-5.", timeline: "6 weeks" },
        ],
        medium_term: "3+ active equity stakes. 2 framework licenses live. Retainer income is 50% of total (was 90%).",
        long_term_vision: "Pure advisory + IP licensing practice. Project work is optional. Equity portfolio compounds independently.",
        recommended_structures: [4, 17, 18, 22, 24, 27],
      },
      value_drivers: [
        { name: "IP Strength",         score: "high",   pct: 88, rationale: "5 productized frameworks with documented case studies. Trademark + license-ready." },
        { name: "Market Demand",       score: "high",   pct: 85, rationale: "Brand strategy demand from Series A/B founders is structurally rising; pipeline is 2x capacity." },
        { name: "Differentiation",     score: "medium", pct: 70, rationale: "Distinctive frameworks but competitive category; speaking platform is the moat." },
        { name: "Execution Readiness", score: "medium", pct: 65, rationale: "Strong on delivery; weak on entity structure and licensing infrastructure." },
        { name: "Financial Upside",    score: "high",   pct: 90, rationale: "Equity-for-services portfolio + IP licensing both have multi-million-dollar upside paths." },
      ],
      risks: [
        { name: "Market concentration",     severity: "high",   rationale: "70% of revenue from fintech / SaaS founders. A category downturn would hit hard." },
        { name: "IP ownership clarity",     severity: "medium", rationale: "Frameworks delivered to clients without explicit retention clauses; competitors could copy." },
        { name: "Dependency on key talent", severity: "medium", rationale: "All advisory revenue depends on Maya's calendar; no scalable layer beneath her." },
        { name: "Seasonality of revenue",   severity: "low",    rationale: "Q1 and Q4 are strong; summer dips reliably 30%. Predictable but not yet smoothed." },
      ],
    },
  });

  // Deal 1 — Fintech retainer, yellow, renegotiated (her first evaluator win)
  const deal1Id = await insertRow("deal_evaluations", {
    id: randomUUID(),
    user_id: id,
    status: "completed",
    creative_mode: "service",
    creative_mode_source: "assessment",
    deal_type: "service",
    deal_name: "Fintech Startup Brand Retainer",
    mapped_structures: [1, 2, 26],
    assessment_id: assessmentId,
    assessment_stage: 2,
    assessment_flags: ["judgment_not_priced", "demand_exceeds_capacity"],
    archetype_primary: "established_practitioner",
    answers_financial: {
      F1: { value: 8000, source: "evaluator" },
      F2: { value: 12000, source: "evaluator" },
      F4: { value: 12, source: "evaluator" },
    },
    answers_career: {
      C1: { value: "portfolio_value", source: "evaluator" },
      C2: { value: ["ongoing_work", "case_study"], source: "evaluator" },
      C3: { value: "creative_lead", source: "evaluator" },
    },
    answers_partner: {
      P1: { value: "funded_startup", source: "evaluator" },
      P2: { value: "one_year", source: "evaluator" },
      P4: { value: "aligned", source: "evaluator" },
    },
    answers_structure: {
      D1: { value: "sow", source: "evaluator" },
      D2: { value: "no", source: "evaluator" },
    },
    answers_risk: {
      R1: { value: "funded", source: "evaluator" },
      R2: { value: "basic", source: "evaluator" },
    },
    answers_legal: {
      L1: { value: "no_attorney", source: "evaluator" },
      L2: { value: "client_only", source: "evaluator" },
    },
    scores: {
      financial: { score: 6.5, signal: "yellow", flags: ["below_market"] },
      career: { score: 8.0, signal: "green", flags: [] },
      partner: { score: 7.5, signal: "green", flags: [] },
      structure: { score: 6.0, signal: "yellow", flags: ["no_equity_terms"] },
      risk: { score: 7.0, signal: "green", flags: [] },
      legal: { score: 5.5, signal: "yellow", flags: ["no_legal_review"] },
      overall: { score: 6.8, signal: "yellow" },
    },
    overall_score: 6.8,
    overall_signal: "yellow",
    red_flags: ["below_market", "no_legal_review"],
    current_dimension: 6,
    current_question: 0,
    deal_outcome: "renegotiated",
    outcome_notes: "Renegotiated from $8K/mo flat to $6K/mo + 0.5% equity vesting 24mo. Added attorney review. This was my first time using the evaluator — it gave me the confidence to push back.",
    outcome_recorded_at: new Date("2026-03-07").toISOString(),
    started_at: new Date("2026-03-04").toISOString(),
    completed_at: new Date("2026-03-05").toISOString(),
  });

  // Verdict for Deal 1
  if (deal1Id) {
    await insertRow("deal_verdicts", {
      id: randomUUID(),
      user_id: id,
      evaluation_id: deal1Id,
      status: "published",
      verdict_content: {
        signal: {
          color: "yellow",
          headline: "Good opportunity, but you're underpricing your strategic value",
          summary: "The client relationship is strong and the work is portfolio-worthy, but $8K/mo for brand strategy + design system execution significantly undervalues your contribution. Restructure to separate strategy from execution and add equity.",
        },
        dimension_summaries: {
          financial: "At $8K/mo for 12 months, you're billing ~$50/hr for strategy-level work. Comparable consultants charge $150-$250/hr. The gap is real.",
          career: "Strong portfolio piece. Series B fintech with recognizable brand potential. Worth doing — at the right price.",
          partner: "Funded (Series B), aligned vision, good working relationship. The partner isn't the problem — the deal structure is.",
          structure: "SOW covers deliverables but has no equity component, no performance bonus, no IP retention clause for the design system you're building.",
          risk: "Low risk operationally — funded company, clear scope. Financial risk is opportunity cost: 12 months at below-market rate.",
          legal: "No attorney review is a yellow flag. At minimum, get IP ownership clarified for your design system methodology.",
        },
        recommended_actions: [
          {
            order: 1,
            action: "Split the engagement into strategy + execution tiers",
            detail: "Propose a $15K strategy phase (brand audit, positioning framework) followed by $6K/mo execution retainer. This prices your thinking separately from your doing.",
            structure_ref: { id: 1, slug: "01-premium-service-model", title: "Premium Service Model" },
          },
          {
            order: 2,
            action: "Add equity vesting to the retainer",
            detail: "Propose 0.25-0.75% equity vesting over 24 months as part of the retainer. You're building their brand system — you should participate in the upside.",
            structure_ref: { id: 26, slug: "26-hybrid-fee-backend", title: "Hybrid Fee + Backend Model" },
          },
          {
            order: 3,
            action: "Retain IP rights to your design system framework",
            detail: "The design system methodology is yours. License it to the client for their use, but retain the right to use the underlying framework with other clients.",
            structure_ref: { id: 27, slug: "27-non-exclusive-licensing", title: "Non-Exclusive Licensing" },
          },
        ],
        resources: {
          structures: [
            { id: 1, slug: "01-premium-service-model", title: "Premium Service Model", why: "Separate strategy pricing from execution." },
            { id: 26, slug: "26-hybrid-fee-backend", title: "Hybrid Fee + Backend Model", why: "Add equity component to service retainers." },
            { id: 17, slug: "17-equity-for-services", title: "Equity-for-Services Model", why: "Framework for proposing equity to clients." },
          ],
          case_studies: [
            { slug: "jessica-walsh", title: "Jessica Walsh", why: "Transitioned from project fees to equity partnerships with clients." },
            { slug: "collins", title: "Collins", why: "Design studio that evolved from execution to strategic partnership model." },
          ],
        },
      },
    });
  }

  // Deal 2 — DTC brand strategy, green, accepted (her confidence-builder)
  const deal2Id = await insertRow("deal_evaluations", {
    id: randomUUID(),
    user_id: id,
    status: "completed",
    creative_mode: "service",
    creative_mode_source: "assessment",
    deal_type: "service",
    deal_name: "DTC Skincare Brand — Strategy + Creative Direction",
    mapped_structures: [1, 4, 26],
    assessment_id: assessmentId,
    assessment_stage: 2,
    assessment_flags: ["judgment_not_priced", "demand_exceeds_capacity"],
    archetype_primary: "established_practitioner",
    answers_financial: {
      F1: { value: 25000, source: "evaluator" },
      F2: { value: 30000, source: "evaluator" },
      F4: { value: 6, source: "evaluator" },
    },
    answers_career: {
      C1: { value: "creative_control", source: "evaluator" },
      C2: { value: ["portfolio", "case_study", "ongoing_work"], source: "evaluator" },
      C3: { value: "creative_director", source: "evaluator" },
    },
    answers_partner: {
      P1: { value: "funded_startup", source: "evaluator" },
      P2: { value: "new_relationship", source: "evaluator" },
      P4: { value: "strongly_aligned", source: "evaluator" },
      P5: { value: "founder_direct", source: "evaluator" },
    },
    answers_structure: {
      D1: { value: "detailed", source: "evaluator" },
      D2: { value: "yes", source: "evaluator" },
      D3: { value: ["brand_strategy", "visual_identity", "packaging"], source: "evaluator" },
    },
    answers_risk: {
      R1: { value: "funded", source: "evaluator" },
      R2: { value: "comprehensive", source: "evaluator" },
    },
    answers_legal: {
      L1: { value: "business_attorney", source: "evaluator" },
      L2: { value: "both", source: "evaluator" },
    },
    scores: {
      financial: { score: 8.5, signal: "green", flags: [] },
      career: { score: 9.0, signal: "green", flags: [] },
      partner: { score: 8.0, signal: "green", flags: [] },
      structure: { score: 8.5, signal: "green", flags: [] },
      risk: { score: 8.0, signal: "green", flags: [] },
      legal: { score: 8.5, signal: "green", flags: [] },
      overall: { score: 8.4, signal: "green" },
    },
    overall_score: 8.4,
    overall_signal: "green",
    red_flags: [],
    current_dimension: 6,
    current_question: 0,
    deal_outcome: "accepted",
    outcome_notes: "Accepted. $25K strategy phase + $5K/mo creative direction retainer for 6 months. First time I priced strategy separately — felt right. Retained design system IP.",
    outcome_recorded_at: new Date("2026-03-12").toISOString(),
    started_at: new Date("2026-03-09").toISOString(),
    completed_at: new Date("2026-03-10").toISOString(),
  });

  // Verdict for Deal 2
  if (deal2Id) {
    await insertRow("deal_verdicts", {
      id: randomUUID(),
      user_id: id,
      evaluation_id: deal2Id,
      status: "published",
      verdict_content: {
        signal: {
          color: "green",
          headline: "Well-structured engagement that properly values your strategic contribution",
          summary: "This deal reflects a significant step forward in how you price your work. The $25K strategy phase captures the strategic value, the retainer covers ongoing direction, and the IP retention protects your framework.",
        },
        dimension_summaries: {
          financial: "Strong pricing. $25K strategy phase is 3x your previous engagement rate. Monthly retainer is fair for creative direction scope.",
          career: "Excellent portfolio opportunity. DTC beauty/skincare is a high-visibility category. Full creative control means this will showcase your best work.",
          partner: "Founder-direct relationship with aligned vision. Funded and committed. This is the kind of client you want to build long-term with.",
          structure: "Well-defined scope with separate strategy and execution phases. IP retention clause protects your framework. Clean.",
          risk: "Low. Funded company, detailed agreement, reasonable scope, attorney-reviewed.",
          legal: "Both parties have legal counsel. Agreement is balanced and protects your interests.",
        },
        recommended_actions: [
          {
            order: 1,
            action: "Use this as your new pricing benchmark",
            detail: "This engagement proves you can command $25K for strategy. Don't go back to flat monthly retainers that bundle strategy with execution.",
            structure_ref: { id: 1, slug: "01-premium-service-model", title: "Premium Service Model" },
          },
          {
            order: 2,
            action: "Propose equity if the relationship extends beyond 6 months",
            detail: "If the retainer renews, propose adding 0.5-1% equity vesting. You'll have proven your value by then — the conversation will be natural.",
            structure_ref: { id: 17, slug: "17-equity-for-services", title: "Equity-for-Services Model" },
          },
        ],
        resources: {
          structures: [
            { id: 1, slug: "01-premium-service-model", title: "Premium Service Model", why: "Your new pricing template for strategy engagements." },
            { id: 4, slug: "04-advisory-consultant-model", title: "Advisory/Consultant Model", why: "Evolution path as this relationship matures." },
          ],
          case_studies: [
            { slug: "jessica-walsh", title: "Jessica Walsh", why: "Built studio around high-value brand strategy engagements." },
          ],
        },
      },
    });
  }

  // Deal 3 — Startup equity-only advisory, red, declined
  const deal3Id = await insertRow("deal_evaluations", {
    id: randomUUID(),
    user_id: id,
    status: "completed",
    creative_mode: "service",
    creative_mode_source: "assessment",
    deal_type: "advisory",
    deal_name: "Social Commerce Startup — Brand Advisor (Equity Only)",
    mapped_structures: [4, 17, 19],
    assessment_id: assessmentId,
    assessment_stage: 2,
    assessment_flags: ["judgment_not_priced", "demand_exceeds_capacity"],
    archetype_primary: "established_practitioner",
    answers_financial: {
      F1: { value: 0, source: "evaluator" },
      F2: { value: 0, source: "evaluator" },
    },
    answers_career: {
      C1: { value: "network", source: "evaluator" },
      C3: { value: "advisor", source: "evaluator" },
    },
    answers_partner: {
      P1: { value: "pre_seed", source: "evaluator" },
      P2: { value: "new_relationship", source: "evaluator" },
      P4: { value: "unclear", source: "evaluator" },
    },
    answers_structure: {
      D1: { value: "verbal", source: "evaluator" },
      D2: { value: "no", source: "evaluator" },
    },
    answers_risk: {
      R1: { value: "unfunded", source: "evaluator" },
      R2: { value: "none", source: "evaluator" },
    },
    answers_legal: {
      L1: { value: "no_attorney", source: "evaluator" },
      L2: { value: "neither", source: "evaluator" },
    },
    scores: {
      financial: { score: 1.5, signal: "red", flags: ["no_compensation", "equity_only_unfunded"] },
      career: { score: 4.5, signal: "yellow", flags: ["low_visibility"] },
      partner: { score: 3.0, signal: "red", flags: ["unfunded", "no_track_record", "unclear_vision"] },
      structure: { score: 1.5, signal: "red", flags: ["verbal_only", "no_vesting_terms"] },
      risk: { score: 2.0, signal: "red", flags: ["unfunded", "no_protection"] },
      legal: { score: 2.0, signal: "red", flags: ["no_agreement", "no_attorney"] },
      overall: { score: 2.4, signal: "red" },
    },
    overall_score: 2.4,
    overall_signal: "red",
    red_flags: ["no_compensation", "equity_only_unfunded", "verbal_only", "no_agreement", "no_vesting_terms"],
    current_dimension: 6,
    current_question: 0,
    deal_outcome: "declined",
    outcome_notes: "Declined. Zero cash, pre-seed with no funding, verbal agreement only, and unclear equity terms. The founder said 'we'll figure out the equity later' — that's exactly the kind of deal I would have said yes to six months ago. The evaluator made the red flags impossible to ignore.",
    outcome_recorded_at: new Date("2026-03-14").toISOString(),
    started_at: new Date("2026-03-13").toISOString(),
    completed_at: new Date("2026-03-13").toISOString(),
  });

  // Verdict for Deal 3 — red
  if (deal3Id) {
    await insertRow("deal_verdicts", {
      id: randomUUID(),
      user_id: id,
      evaluation_id: deal3Id,
      status: "published",
      verdict_content: {
        signal: {
          color: "red",
          headline: "This deal asks for your expertise while offering nothing concrete in return",
          summary: "Zero compensation, no written agreement, unfunded company, and undefined equity terms. Every dimension flags serious concerns. This is the kind of deal that costs creative professionals hundreds of hours and produces nothing.",
        },
        dimension_summaries: {
          financial: "No cash compensation at all. The equity offered has no defined percentage, no vesting schedule, and no valuation basis. You'd be working for a promise of a promise.",
          career: "Limited visibility upside. Pre-seed social commerce is a crowded space. Advisory role without a public-facing component doesn't build your portfolio or reputation.",
          partner: "New relationship with an unfunded founder. No track record of building or shipping. Vision is unclear and keeps shifting in conversations. These are warning signs, not opportunities.",
          structure: "Verbal agreement only. No written terms, no defined scope, no equity specifics. 'We'll figure it out later' is not a deal structure — it's a setup for conflict.",
          risk: "Maximum risk with no protection. If this company never raises funding, you've donated your time. If it does raise, you have no written claim to anything.",
          legal: "No attorney on either side. No agreement to review. This isn't a legal gap — it's the absence of any legal foundation whatsoever.",
        },
        recommended_actions: [
          {
            order: 1,
            action: "Decline this deal as currently structured",
            detail: "There is nothing to negotiate here because there is nothing written down. A verbal promise of undefined equity in an unfunded company is not a deal — it's a favor.",
            structure_ref: null,
          },
          {
            order: 2,
            action: "If the founder raises funding, revisit with proper terms",
            detail: "Tell them: 'I'd love to revisit this once you've raised a seed round. At that point, let's put together a proper advisory agreement with defined equity, vesting, and scope.' This preserves the relationship without giving away your time.",
            structure_ref: { id: 4, slug: "04-advisory-consultant-model", title: "Advisory/Consultant Model" },
          },
          {
            order: 3,
            action: "Use this as your benchmark for what to say no to",
            detail: "This deal has every red flag in the book. Save this evaluation. Next time someone approaches you with a similar offer, you'll have a clear reference point for why you walk away.",
            structure_ref: { id: 17, slug: "17-equity-for-services", title: "Equity-for-Services Model" },
          },
        ],
        resources: {
          structures: [
            { id: 4, slug: "04-advisory-consultant-model", title: "Advisory/Consultant Model", why: "What a real advisory deal looks like — compare to this one." },
            { id: 17, slug: "17-equity-for-services", title: "Equity-for-Services Model", why: "How to properly structure equity-for-services when the opportunity is real." },
            { id: 19, slug: "19-vesting-equity", title: "Vesting Equity", why: "Understand what vesting terms should look like so you can spot when they're missing." },
          ],
          case_studies: [
            { slug: "chris-do", title: "Chris Do", why: "Learned to say no to free advisory work; built paid advisory practice instead." },
          ],
        },
      },
    });
  }

  // Deal 4 — Sustainable fashion partnership, yellow, pending (active decision)
  const deal4Id = await insertRow("deal_evaluations", {
    id: randomUUID(),
    user_id: id,
    status: "completed",
    creative_mode: "service",
    creative_mode_source: "assessment",
    deal_type: "partnership",
    deal_name: "Sustainable Fashion Brand — Co-Creative Director + Revenue Share",
    mapped_structures: [5, 24, 26],
    assessment_id: assessmentId,
    assessment_stage: 2,
    assessment_flags: ["judgment_not_priced", "demand_exceeds_capacity"],
    archetype_primary: "established_practitioner",
    answers_financial: {
      F1: { value: 3000, source: "evaluator" },
      F2: { value: 8000, source: "evaluator" },
      F5: { value: 5, source: "evaluator" },
    },
    answers_career: {
      C1: { value: "creative_control", source: "evaluator" },
      C2: { value: ["portfolio", "ongoing_work", "co_founder_credit"], source: "evaluator" },
      C3: { value: "co_creative_director", source: "evaluator" },
    },
    answers_partner: {
      P1: { value: "bootstrapped", source: "evaluator" },
      P2: { value: "two_years", source: "evaluator" },
      P4: { value: "strongly_aligned", source: "evaluator" },
      P5: { value: "founder_direct", source: "evaluator" },
    },
    answers_structure: {
      D1: { value: "template", source: "evaluator" },
      D2: { value: "yes", source: "evaluator" },
      D3: { value: ["brand_identity", "packaging", "campaign_direction"], source: "evaluator" },
    },
    answers_risk: {
      R1: { value: "bootstrapped", source: "evaluator" },
      R2: { value: "basic", source: "evaluator" },
    },
    answers_legal: {
      L1: { value: "no_attorney", source: "evaluator" },
      L2: { value: "client_only", source: "evaluator" },
    },
    scores: {
      financial: { score: 5.0, signal: "yellow", flags: ["below_market", "revenue_share_unproven"] },
      career: { score: 8.5, signal: "green", flags: [] },
      partner: { score: 7.5, signal: "green", flags: [] },
      structure: { score: 5.5, signal: "yellow", flags: ["template_agreement", "revenue_share_undefined"] },
      risk: { score: 5.0, signal: "yellow", flags: ["bootstrapped", "revenue_dependent"] },
      legal: { score: 4.5, signal: "yellow", flags: ["no_legal_review", "need_revenue_share_terms"] },
      overall: { score: 6.0, signal: "yellow" },
    },
    overall_score: 6.0,
    overall_signal: "yellow",
    red_flags: ["below_market", "revenue_share_undefined", "no_legal_review"],
    current_dimension: 6,
    current_question: 0,
    deal_outcome: "pending",
    outcome_notes: "This is my most interesting deal right now. The founder is someone I genuinely respect, the brand is aligned with my values, and the co-creative director title is meaningful. But $3K/mo base is low and the 5% revenue share has no floor, no cap, and no defined measurement. I want to say yes — but I need to restructure the terms first.",
    outcome_recorded_at: null,
    started_at: new Date("2026-03-15").toISOString(),
    completed_at: new Date("2026-03-16").toISOString(),
  });

  // Verdict for Deal 4 — yellow
  if (deal4Id) {
    await insertRow("deal_verdicts", {
      id: randomUUID(),
      user_id: id,
      evaluation_id: deal4Id,
      status: "published",
      verdict_content: {
        signal: {
          color: "yellow",
          headline: "A meaningful opportunity that needs significant structural work before you sign",
          summary: "The creative alignment and partnership potential are real, but the financial terms undervalue your contribution and the revenue share is undefined. This deal is worth doing — just not at these terms. Restructure before committing.",
        },
        dimension_summaries: {
          financial: "At $3K/mo, you're earning less than a junior freelancer. The 5% revenue share could be valuable long-term, but it has no floor (minimum guarantee), no cap, no measurement definition, and no payment timeline. Revenue share without specifics is a wish, not compensation.",
          career: "This is the strongest dimension. Co-Creative Director title with full creative control on a brand you believe in. The portfolio value is high, the category (sustainable fashion) is culturally relevant, and the founder relationship is genuine. This is why you're tempted.",
          partner: "Two-year relationship, aligned values, founder-direct access. The human side of this deal is strong. The founder isn't trying to exploit you — they just don't know how to structure a fair creative partnership. That's fixable.",
          structure: "Template agreement from the founder's side. Revenue share is mentioned but undefined: no percentage basis (gross vs. net), no reporting cadence, no audit rights, no minimum threshold. The co-creative director role needs a written scope, deliverables, and decision-making authority.",
          risk: "Bootstrapped company means your revenue share depends entirely on their growth. If the brand doesn't scale, your 5% is worth nothing. You need a minimum guarantee or a fallback fee structure to protect your downside.",
          legal: "No attorney has reviewed this on your side. The template agreement likely favors the founder. Before signing, you need an attorney to draft proper revenue share terms, IP ownership clauses, and an exit provision.",
        },
        recommended_actions: [
          {
            order: 1,
            action: "Define the revenue share with precision",
            detail: "Specify: 5% of what (gross revenue? net profit? DTC sales only?), measured how (monthly reporting with audit rights), paid when (quarterly, 30 days after close), with a minimum guarantee ($2K/mo floor regardless of revenue). Without these terms, '5% revenue share' is meaningless.",
            structure_ref: { id: 24, slug: "24-revenue-share-partnership", title: "Revenue Share Partnership" },
          },
          {
            order: 2,
            action: "Raise the base fee or add a milestone bonus",
            detail: "Propose $5K/mo base (still below your market rate) with the revenue share on top. Alternatively, keep $3K/mo but add milestone bonuses: $5K when the brand hits $50K/mo revenue, $10K at $100K/mo. This aligns incentives and protects your floor.",
            structure_ref: { id: 26, slug: "26-hybrid-fee-backend", title: "Hybrid Fee + Backend Model" },
          },
          {
            order: 3,
            action: "Get an attorney to draft the partnership agreement",
            detail: "This cannot be a template SOW. You need a co-creation agreement that covers: your role and authority as co-creative director, IP ownership (do you co-own the brand identity you create?), revenue share mechanics, exit terms if either party wants out, and what happens if the company raises funding or sells.",
            structure_ref: { id: 5, slug: "05-co-creation-joint-venture", title: "Co-Creation Joint Venture" },
          },
          {
            order: 4,
            action: "Add an IP co-ownership clause",
            detail: "If you're co-creative director building the brand from the ground up, you should co-own the brand identity and design system. This is your most valuable long-term asset in this deal. If the brand sells for $10M someday, your design work is part of that value.",
            structure_ref: { id: 28, slug: "28-exclusive-licensing", title: "Exclusive Licensing Model" },
          },
        ],
        resources: {
          structures: [
            { id: 5, slug: "05-co-creation-joint-venture", title: "Co-Creation Joint Venture", why: "The right framework for this type of creative partnership." },
            { id: 24, slug: "24-revenue-share-partnership", title: "Revenue Share Partnership", why: "How to define revenue share terms that actually protect you." },
            { id: 26, slug: "26-hybrid-fee-backend", title: "Hybrid Fee + Backend Model", why: "Base fee + upside structure for when you believe in the project." },
          ],
          case_studies: [
            { slug: "jessica-walsh", title: "Jessica Walsh", why: "Built co-creative partnerships with brands, transitioned from fees to equity/ownership." },
            { slug: "virgil-abloh", title: "Virgil Abloh", why: "Creative director model with ownership stakes in the brands he shaped." },
          ],
        },
      },
    });
  }

  console.log("  ✓ Demo sales user seeded (Maya Chen — 4 deals with verdicts)");
}

// ---------------------------------------------------------------------------
// 7. DEMO — ONBOARDING (fresh for live walkthroughs)
// ---------------------------------------------------------------------------

async function seedDemoOnboard() {
  console.log("\n— Demo Onboard User (demo-onboard) —");
  const id = await createUser(`demo-onboard@${EMAIL_DOMAIN}`, "Demo User");
  if (!id) return;

  await updateProfile(id, { role: "member", status: "active", onboarding_completed: true });
  await upsertSubscription(id, {
    ...activeSub(id),
    current_period_start: new Date("2026-03-01").toISOString(),
    current_period_end: new Date("2027-03-01").toISOString(),
  });

  console.log("  ✓ Demo onboard user seeded");
}

// ---------------------------------------------------------------------------
// CLEANUP
// ---------------------------------------------------------------------------

async function deleteAllTestUsers() {
  console.log("\n— Deleting all test/demo users —");

  const { data: allUsers } = await supabase.auth.admin.listUsers();
  if (!allUsers?.users) {
    console.log("  No users found");
    return;
  }

  const testUsers = allUsers.users.filter((u) =>
    ALL_EMAILS.includes(u.email ?? "")
  );

  if (!testUsers.length) {
    console.log("  No test users to delete");
    return;
  }

  for (const user of testUsers) {
    const tables = [
      "deal_verdicts",
      "deal_evaluations",
      "asset_inventory_analyses",
      "asset_inventory_items",
      "assessment_actions",
      "strategic_plans",
      "assessments",
      "partial_assessments",
      "ai_conversations",
      "bookmarks",
      "reading_progress",
      "subscriptions",
    ];

    for (const table of tables) {
      await supabase.from(table).delete().eq("user_id", user.id);
    }

    await supabase.from("profiles").delete().eq("id", user.id);

    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) {
      console.error(`  ✗ Delete ${user.email}:`, error.message);
    } else {
      console.log(`  - Deleted ${user.email}`);
    }
  }
}

// ---------------------------------------------------------------------------
// MAIN
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const shouldReset = args.includes("--reset");
  const shouldDelete = args.includes("--delete");

  console.log("=== In Sequence — Test User Seeder ===");
  console.log(`Supabase: ${SUPABASE_URL}`);
  console.log(`Password for all test users: ${TEST_PASSWORD}\n`);

  if (shouldDelete || shouldReset) {
    await deleteAllTestUsers();
    if (shouldDelete) {
      console.log("\n✓ Done (delete only)");
      return;
    }
  }

  await seedFreshUser();
  await seedLibraryUser();
  await seedAssessedUser();
  await seedMakerUser();
  await seedServiceUser();
  await seedPerformerUser();
  await seedLapsedUser();
  await seedAdminUser();
  await seedDemoSales();
  await seedDemoOnboard();

  console.log("\n=== Summary ===");
  console.log(`
All test users use password: ${TEST_PASSWORD}

TEST USERS:
  test-fresh@${EMAIL_DOMAIN}       — Fresh signup, full_access sub, no assessment
  test-library@${EMAIL_DOMAIN}     — Library-tier user (content only, no AI tools)
  test-assessed@${EMAIL_DOMAIN}    — Completed assessment + roadmap, nothing else
  test-maker@${EMAIL_DOMAIN}       — "Jordan Rivera" — Filmmaker, Stage 3, platform_builder
                                     2 deals (green equity + yellow licensing), 6 assets, verdict
  test-service@${EMAIL_DOMAIN}     — "Priya Sharma" — Product Designer, Stage 2, high_earner_no_ownership
                                     2 deals (yellow service + red advisory), 5 assets
  test-performer@${EMAIL_DOMAIN}   — "Marcus Cole" — Musician, Stage 3, untapped_catalog
                                     3 deals (green licensing + yellow catalog sale + red brand), 7 assets, analysis, verdict
  test-lapsed@${EMAIL_DOMAIN}      — Canceled/expired subscription
  test-admin@${EMAIL_DOMAIN}       — Admin role

DEMO USERS:
  demo-sales@${EMAIL_DOMAIN}       — "Maya Chen" — Polished Stage 2 brand strategist for sales demos
  demo-onboard@${EMAIL_DOMAIN}     — Clean slate for live onboarding walkthroughs

COMMANDS:
  node --experimental-strip-types scripts/seed-test-users.ts          — Seed all
  node --experimental-strip-types scripts/seed-test-users.ts --reset  — Delete + re-seed
  node --experimental-strip-types scripts/seed-test-users.ts --delete — Delete only
`);
}

main().catch(console.error);
