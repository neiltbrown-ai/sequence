# Sequence MCP Server — v0 Implementation Spec

An MCP (Model Context Protocol) server that exposes Sequence's platform data + operations as tools any MCP-compatible AI client can call (Claude Desktop, Claude Code, Cursor, future advisor integration, etc.).

**Status:** Proposed. Not yet implemented.

**Estimated effort:** 3–4 days for a v0 Neil can use personally via Claude Desktop. 1–1.5 weeks for production with proper auth.

**Why build it:**
- Instant Claude-native admin/dev interface (query members, run ops, pull reports in conversation)
- Decouples "AI reads Sequence data" from any specific UI — one surface for all future AI features
- Foundation for a future Managed Agents advisor migration
- Open standard (MCP) — works with Claude Desktop, Claude Code, Cursor, OpenAI compatible clients, etc.

---

## 1. Scope

### v0 (this spec)

- **Read-only tools** — safe to let an AI call freely
- **Service-token auth** — single admin token used from Claude Desktop, no per-user auth yet
- **Node.js MCP server** using the official TypeScript SDK
- **Local-first deploy option** (run on your laptop) + **Vercel option** (for always-on access)
- **~10 tools** covering members, portfolio, roadmaps, deals, library content

### Out of scope for v0

- Write tools (updating actions, regenerating roadmaps, editing member profiles)
- Per-user auth flow (OAuth / Supabase auth pass-through)
- Multi-tenant / external customers using it
- Real-time subscriptions / webhooks
- Production observability + rate limiting (start minimal)

---

## 2. Why this is valuable (use cases)

### You (Neil) operationally

- Pull member segments on the fly: "How many Stage 3 full-access members haven't started a Portfolio analysis?"
- Diagnose specific user issues: "Show me the full history for neiltbrown+id2@ — assessments, roadmaps, deals, verdicts"
- Generate reports: "Give me a CSV of all deal evaluations this month grouped by dimension score"
- Reference library content in conversation without tab-switching: "Pull the Bonobo case study and summarize the three structures he used"

### Product development with Claude Code

- When building new features, Claude Code can call MCP tools to see real schema + real data shapes — no more "let me look at your types file"
- "Generate test data for 10 new users with completed CI" — AI can inspect your schemas and drive a realistic seed

### Future advisor integration

- When you eventually migrate the advisor to Managed Agents (or simply refactor the in-app one), the MCP server is the data layer. Agent calls `get_portfolio` on demand instead of you pre-fetching everything.

---

## 3. Tool surface (v0)

### Member lookup

- `get_member_profile(user_id)` — returns: profile row + subscription status + creative identity snapshot
- `find_member_by_email(email)` — returns: user_id + brief status summary
- `list_members(filter?)` — returns paged list. Filter by: subscription status, stage, archetype, has_portfolio, has_roadmap, has_completed_ci

### Creative Identity

- `get_creative_identity(user_id)` — returns: assessment row (stage, archetype, misalignments, creative_mode, discipline, etc.)

### Portfolio

- `get_portfolio(user_id)` — returns: inventory items + latest analysis (if completed)
- `get_portfolio_history(user_id)` — returns: all analyses chronologically (for audit / debugging)

### Roadmap

- `get_roadmap(user_id)` — returns: latest strategic plan (position, actions, vision, diagrams)
- `get_roadmap_history(user_id)` — returns: all plans chronologically
- `get_action_status(user_id)` — returns: progress on the current roadmap's 3 actions

### Deal Evaluations

- `get_deals(user_id, days?)` — returns: recent completed deal evaluations + their verdicts (recommended_actions, resources)
- `get_deal(deal_id)` — returns: full deal eval + verdict

### Library

- `search_case_studies(query, limit?)` — returns: top matches with excerpts (uses existing full-text search if available, else simple LIKE)
- `get_case_study(slug)` — returns: frontmatter + body
- `search_structures(query, limit?)` — same shape
- `get_structure(slug)` — returns: frontmatter + body
- `list_articles(limit?)` — recent articles

### Admin summaries (read-only)

- `get_platform_stats()` — returns: member count, active subscriptions, completed CIs, avg roadmap generation time, etc. (basic KPIs)

---

## 4. Architecture

```
┌─────────────────────┐
│  Claude Desktop     │  (or Claude Code, Cursor, future advisor)
│  MCP client         │
└──────────┬──────────┘
           │ MCP protocol (JSON-RPC over stdio or HTTP)
           ▼
┌──────────────────────────────┐
│  Sequence MCP Server         │
│  - Node.js, @modelcontext-   │
│    protocol/sdk              │
│  - Service-token auth        │
│  - ~10 tool handlers         │
└──────────┬───────────────────┘
           │ Supabase admin client
           ▼
┌──────────────────────────────┐
│  Supabase                    │
│  (profiles, assessments,     │
│   strategic_plans,           │
│   deal_evaluations, etc.)    │
└──────────────────────────────┘
```

### Tech choices

- **MCP SDK:** `@modelcontextprotocol/sdk` (official)
- **Transport:** `stdio` for local Claude Desktop, HTTP for remote deploys
- **Supabase client:** reuse the same `createAdminClient()` pattern — service role key for full read access
- **Env vars:**
  - `SEQ_MCP_TOKEN` — shared secret for HTTP auth (remote mode only)
  - `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` — reuse existing ones
- **Deploy target:** start local (stdio). Add HTTP/Vercel later as needed.

### Content access

For case studies / structures / articles, the MCP server can read the same files the Next.js site reads via `getAllCaseStudies()` etc. Either:
- **A:** Import `src/lib/content.ts` into the MCP server (simpler if they share a repo)
- **B:** Duplicate the gray-matter parsing in the MCP server

Go with **A** — MCP server lives in the same repo, shares the `src/lib/content.ts` module.

---

## 5. Repository layout

Recommendation: **add the MCP server to the existing Sequence repo** as a new package.

```
sequence/
├── src/                   # existing Next.js app
├── mcp/                   # NEW — MCP server
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts              # server entry point
│   │   ├── tools/
│   │   │   ├── members.ts        # get_member_profile, list_members, etc.
│   │   │   ├── creative-identity.ts
│   │   │   ├── portfolio.ts
│   │   │   ├── roadmap.ts
│   │   │   ├── deals.ts
│   │   │   ├── library.ts
│   │   │   └── stats.ts
│   │   ├── lib/
│   │   │   ├── supabase.ts       # admin client
│   │   │   ├── auth.ts           # token check for HTTP mode
│   │   │   └── serialize.ts      # consistent JSON shapes
│   │   └── types.ts
│   └── README.md                 # how to install + configure in Claude Desktop
└── ...
```

Alternative: separate repo (`sequence-mcp`). Prefer same-repo for v0 to share types + `content.ts`. Can extract later.

---

## 6. Claude Desktop configuration

Once built, adding the MCP server to Claude Desktop:

`~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "sequence": {
      "command": "node",
      "args": ["/Users/neilbrown/Documents/00-Neil/01-In-Sequence/sequence/mcp/dist/index.js"],
      "env": {
        "NEXT_PUBLIC_SUPABASE_URL": "https://YOUR_PROJECT.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "..."
      }
    }
  }
}
```

After adding, restart Claude Desktop. You'll see "sequence" as an available MCP connection, with tools listed.

---

## 7. Example interactions

Once wired up, Neil can in Claude Desktop:

> **Neil:** Tell me how many full-access members have completed their Creative Identity but haven't started a Portfolio analysis.
>
> *Claude calls `list_members({ subscription: "full_access", has_completed_ci: true, has_portfolio: false })`.*
>
> **Claude:** 47 members match. Here's the breakdown by stage: Stage 1 = 12, Stage 2 = 19, Stage 3 = 14, Stage 4 = 2.

> **Neil:** Grab neiltbrown+id2@gmail.com's full history. What have they done so far?
>
> *Claude calls `find_member_by_email`, then `get_creative_identity`, `get_portfolio`, `get_roadmap`, `get_deals`.*
>
> **Claude:** This user signed up Apr 16. Completed CI Apr 18 (Stage 3, Untapped Catalog archetype, 2 misalignments: ip_not_monetized + judgment_not_priced). Ran Portfolio analysis Apr 18 (3 assets, leverage score = high). Roadmap generated Apr 18 (combined source). Evaluated 1 deal Apr 19 (licensing, overall yellow). No actions marked complete yet.

> **Neil:** Find three case studies relevant to someone with unmonetized IP and judgment-pricing issues.
>
> *Claude calls `search_case_studies("unmonetized IP judgment pricing")`.*
>
> **Claude:** [returns 3 relevant case studies with excerpts]

---

## 8. Implementation plan (phased)

### Phase 1: Skeleton (1 day)

1. `mcp/package.json` with `@modelcontextprotocol/sdk`
2. `mcp/src/index.ts` — minimal MCP server, 1 dummy tool, stdio transport
3. `mcp/src/lib/supabase.ts` — admin client (reuse env vars from main app)
4. `mcp/README.md` — Claude Desktop config template
5. Verify connection from Claude Desktop, dummy tool callable

**Deliverable:** Claude Desktop shows "sequence" MCP with 1 working tool.

### Phase 2: Core member tools (1 day)

1. `get_member_profile(user_id)`
2. `find_member_by_email(email)`
3. `list_members(filter)` — supports at least: subscription status + completed_ci boolean
4. Shared JSON serialization helpers (consistent field naming, camelCase)

**Deliverable:** Neil can query member data from Claude Desktop.

### Phase 3: Content tools (1 day)

5. `get_creative_identity(user_id)`
6. `get_portfolio(user_id)` + `get_portfolio_history(user_id)`
7. `get_roadmap(user_id)` + `get_roadmap_history(user_id)`
8. `get_action_status(user_id)`
9. `get_deals(user_id, days?)` + `get_deal(deal_id)`

**Deliverable:** Full member journey queryable.

### Phase 4: Library + stats (0.5–1 day)

10. `search_case_studies` + `get_case_study`
11. `search_structures` + `get_structure`
12. `list_articles`
13. `get_platform_stats`

**Deliverable:** v0 feature-complete.

### Phase 5 (optional): HTTP mode + Vercel deploy (1–2 days)

Only if Neil wants always-on access (e.g., from Cursor on a work laptop without the Sequence repo checked out):

1. Add HTTP transport + bearer-token auth
2. Deploy as a Vercel serverless function
3. Update Claude Desktop config to point at the remote URL
4. Add basic rate limiting + request logging

---

## 9. Tool definition example

For each tool, the MCP SDK expects a handler + schema. Example for `find_member_by_email`:

```ts
// mcp/src/tools/members.ts
import { z } from "zod";
import type { McpTool } from "../types";

export const findMemberByEmail: McpTool = {
  name: "find_member_by_email",
  description:
    "Look up a member by email address. Returns the user's ID, display name, subscription status, and a brief progress summary (whether they have completed their Creative Identity, Portfolio analysis, and Roadmap).",
  inputSchema: z.object({
    email: z.string().email(),
  }),
  async handler({ email }, { admin }) {
    const { data: authUser } = await admin.auth.admin.listUsers({
      email,
    });
    if (!authUser || authUser.users.length === 0) {
      return { found: false };
    }
    const user = authUser.users[0];

    const [{ data: profile }, { data: assessment }, { data: portfolio }, { data: plan }] =
      await Promise.all([
        admin.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        admin.from("assessments").select("id, status, detected_stage, archetype_primary")
          .eq("user_id", user.id).eq("status", "completed")
          .order("completed_at", { ascending: false }).limit(1).maybeSingle(),
        admin.from("asset_inventory_analyses").select("id, status")
          .eq("user_id", user.id).eq("status", "completed")
          .order("created_at", { ascending: false }).limit(1).maybeSingle(),
        admin.from("strategic_plans").select("id, status, source")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }).limit(1).maybeSingle(),
      ]);

    return {
      found: true,
      userId: user.id,
      email: user.email,
      name: profile?.full_name ?? null,
      creativeIdentity: assessment
        ? {
            stage: assessment.detected_stage,
            archetype: assessment.archetype_primary,
          }
        : null,
      hasPortfolioAnalysis: !!portfolio,
      hasRoadmap: !!plan,
      roadmapSource: plan?.source ?? null,
    };
  },
};
```

Register tools in `mcp/src/index.ts`:

```ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createAdminClient } from "./lib/supabase.js";
import { findMemberByEmail, getMemberProfile, listMembers } from "./tools/members.js";
// ... other tool imports

const TOOLS = [
  findMemberByEmail,
  getMemberProfile,
  listMembers,
  // ...
];

const server = new Server(
  { name: "sequence-mcp", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

// ... wire up tool list + call handlers using TOOLS array

await server.connect(new StdioServerTransport());
```

---

## 10. Auth model

### Local stdio (v0 default)

No auth at the MCP layer — Claude Desktop runs the server as a subprocess, and the Supabase service role key is in the env vars of that subprocess. Keep the service role key in a local `.env` that only you have.

### Remote HTTP (Phase 5)

Simple shared secret:

```ts
// mcp/src/lib/auth.ts
export function checkAuth(req: Request): boolean {
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${process.env.SEQ_MCP_TOKEN}`;
  return authHeader === expected;
}
```

Set `SEQ_MCP_TOKEN` in Vercel env + Claude Desktop config header. Rotate if ever leaked.

**For future multi-user:** when any non-admin ever needs MCP access, swap to OAuth + per-user Supabase tokens. Not v0 scope.

---

## 11. Testing plan

- **Manual smoke test per tool:** call each tool from Claude Desktop with a known test account (e.g., `neiltbrown+id1@`). Verify shape + content.
- **Schema drift check:** if Supabase schema changes (e.g., a new migration), run the tools once to verify none silently break. The `updated_at` episode (CLAUDE.md "Schema gotchas") is a reminder.
- **Offline test harness:** `mcp/src/__tests__/` with a `vitest` setup that mocks the admin client and tests serializers. Worth it once there are more than ~5 tools.
- **Neil's weekly dogfood:** use the MCP actively for one week of ops work. Track: which tools do you use? Which feel missing? Tune v0 based on real usage before committing to v1.

---

## 12. Risks + open questions

- **Schema drift.** If a migration changes a column name or shape, tools silently break. Mitigation: add shared types from `src/types/` to MCP tool definitions, run build on both packages in CI.
- **Tool proliferation.** Easy to add 30 tools. Keep v0 to ~10 and see which are actually used. An LLM with too many tools gets confused.
- **Cost.** MCP itself is free. The only cost is infra to host it (free locally; ~$0 on Vercel for personal use).
- **Data sensitivity.** Service-role key access means the MCP server can read everything. Keep the `.env` / Vercel secrets tight. Don't ship this MCP config to anyone you wouldn't give a DB admin password.
- **Future advisor integration.** When the advisor migrates to Managed Agents (or just refactors), this MCP becomes its tool source. Tool shapes designed for "human operator via Claude Desktop" may need slight adjustment for "advisor for an end-user" (e.g., `list_members` doesn't make sense for an end-user, but `get_portfolio` does). Plan for a second "user-scoped" tool set later — don't over-engineer for v0.
- **MCP ecosystem maturity.** The protocol is young. Some client / SDK features may still be rough edges. Watch for breaking changes in 2026.

---

## 13. Handoff to future Claude session

If you're picking this up from a fresh session:

1. Read `CLAUDE.md` top section (current platform architecture)
2. Read this spec
3. Read the MCP SDK docs at https://modelcontextprotocol.io/ if unfamiliar
4. Start with Phase 1 — get a dummy tool working in Claude Desktop before anything else
5. Build one tool at a time, test manually from Claude Desktop after each
6. Reuse `src/lib/content.ts` for library tools (don't re-implement gray-matter parsing)
7. Reuse `src/lib/supabase/admin.ts` — or copy the pattern minus Next.js cookies
8. Don't add HTTP transport until stdio is rock-solid
9. Update `CLAUDE.md` with a new section once v0 is usable, pointing to this spec + README

### Companion reading

- `CLAUDE.md` — platform architecture + schema gotchas
- `design.md` — digital design system (not relevant for MCP but useful for consistent JSON response shapes)
- `content/reference/troubleshooting.md` — resilient JSON parse pattern (reuse for tool output sanitization)
- `content/reference/advisor-memory-spec.md` — the sister doc; this MCP server may eventually be how advisor memory is accessed
