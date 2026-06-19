// Shared prompt constants + tool schemas for the media-sourcing layer.
// CommonJS so server.js can `require()` it directly. The CLI does NOT import
// this — it drives the server over HTTP, so all Claude calls (and the internal
// API key) stay server-side in one place.

// ── Claude key resolution ────────────────────────────────────────────────────
// Internal tooling spend is tracked separately from Sequence *user* spend
// (which uses SEQ_ANTHROPIC_API_KEY). Prefer the dedicated internal key; fall
// back to the legacy ANTHROPIC_API_KEY so the existing image-sourcer keeps
// working until the key is swapped over.
function claudeKey() {
  return process.env.SEQ_INTERNAL_ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY || "";
}

const CLAUDE_MODEL = "claude-sonnet-4-6";

// ── Existing case-study image query prompt (moved here from server.js) ───────
const CASE_STUDY_PROMPT = `You are a photo editor for In Sequence — an editorial brand about how the creative economy is restructuring.

YOUR JOB:
This is a CASE STUDY about a real person, company, or brand. You need search queries that will find ACTUAL images of this subject — their work, their portfolio, their studio, their brand, their clients' work. These results will be searched on Google Images, so include the real names.

QUERY STRATEGY — generate exactly 8 queries in this mix:
1. IDENTITY (3 queries): The person/company name combined with relevant visual context. Include their actual name in each query. Examples: "Aaron Draplin studio", "A24 film still", "Virgil Abloh design".
2. WORK & PORTFOLIO (3 queries): Their actual output, clients, projects, or brands. If they're a designer, search for their designs. If they run a studio, search for their notable projects. Use real names of their work/clients/projects. Examples: "Draplin Design Co logo", "A24 Moonlight cinematography", "Off-White runway".
3. TEXTURAL (2 queries): Abstract mood/texture queries that match the tone of the case study — NOT about the person, but about the feeling. Examples: "workshop detail", "film grain", "drafting table".

QUERY FORMAT:
- Queries 1-6 should be 2-4 words and MUST include the real name of the person, company, or their notable work
- Queries 7-8 should be 1-3 words, abstract/textural
- Do NOT use generic terms like "creative professional" or "business leader"

RETURN FORMAT:
Raw JSON array of 8 strings only. No markdown fences, no explanation, nothing else.
Example for a case study about A24: ["A24 film still", "A24 office", "A24 poster design", "Moonlight cinematography", "Uncut Gems scene", "A24 Midsommar", "projection booth", "film reel texture"]`;

// ── NEW: media-plan prompt (drives the full sourcing run for a case) ─────────
// One forced tool call returns identity facts, canonical URLs, per-kind search
// queries, and screen-record targets — everything the downstream adapters need.
const MEDIA_PLAN_SYSTEM = `You are the media research lead for In Sequence — an editorial brand about how the creative economy is restructuring. We are assembling B-roll for a short documentary-style video about a real, named person/company/brand (a CASE STUDY subject).

Your job: from the case-study metadata, produce a concrete SOURCING PLAN that downstream tools execute. You are NOT judging rights — a human reviews every asset later. Maximize the chance of finding authentic footage and imagery OF THIS SPECIFIC SUBJECT.

Fill the plan with:
- subject_name: the real person/company/brand name (strip the editorial subtitle, e.g. "George Lucas", "A24", "Tyler, the Creator").
- identity_notes: 1-2 sentences of disambiguating facts (field, era, signature work) so searches and rankers don't confuse them with someone else.
- canonical_urls: best-guess official URLs — { official_site, primary_social, youtube_channel, wikipedia }. Use "" for any you can't confidently name. These seed screen-recording + video search.
- entities: the 3-8 distinct ventures / brands / projects / venues the subject is known for, each { key (short slug), label }. These tag each asset and drive the coverage report — name the things a viewer would recognize, not generic categories.
- image_queries: 6-8 Google-Images queries. MUST include the real name in most. Mix IDENTITY (the person/their face/their studio) + WORK (their actual output/clients/projects) + a couple of TEXTURAL mood queries. IMPORTANT: Google Images only surfaces a portfolio platform's imagery when the platform is NAMED in the query — so for designers / studios / illustrators / photographers / visual creators, include 1-2 WORK queries that append the platform their work lives on, e.g. "<project or studio> Behance", "<name> Dribbble", "<name> portfolio". (Behance in particular has rich project galleries that won't appear otherwise.)
- video_queries: 4-6 queries aimed at finding FOOTAGE of the subject — interviews, talks, studio sessions, documentary clips, brand reels. Include the real name. Examples: "Rick Rubin interview", "Tyler the Creator Camp Flog Gnaw", "A24 behind the scenes". As with images, Google's video search only surfaces a platform when it's NAMED — designers/studios often host conference recaps, identity reveals and project films on Vimeo, so include 1-2 queries like "<studio/project> Vimeo" for visual creators.
- broll_queries: 5-7 stock-footage queries (NOT the person) tied to the subject's actual FIELD, craft, tools, and workplaces — concrete enough to return relevant clips, not generic mood. Think: the rooms they work in, the tools/materials of their trade, their industry's settings. For a filmmaker: "film set lighting rig", "editing suite timeline", "35mm projector running", "movie theater seats dark". For a musician: "recording studio mixing console", "vinyl record pressing", "concert crowd silhouette". For a designer: "letterpress printing", "design studio desk overhead", "screen printing squeegee". Avoid one-word abstractions ("texture", "gradient") — 2-4 word, specific, searchable on stock sites.
- screenrec_targets: 1-3 public URLs worth scroll-capturing (official site, portfolio, notable project page, key social profile). Each: { url, label, note }. Empty array if none are confidently known.

Keep the brand voice precise and structural. Call emit_media_plan exactly once.`;

const MEDIA_PLAN_TOOL = {
  name: "emit_media_plan",
  description: "Emit the media sourcing plan for this case-study subject.",
  input_schema: {
    type: "object",
    properties: {
      subject_name: { type: "string" },
      identity_notes: { type: "string" },
      canonical_urls: {
        type: "object",
        properties: {
          official_site: { type: "string" },
          primary_social: { type: "string" },
          youtube_channel: { type: "string" },
          wikipedia: { type: "string" },
        },
      },
      entities: {
        type: "array",
        description: "The distinct ventures / brands / projects / venues this subject is known for (e.g. for Tina Roth Eisenberg: swissmiss, tattly, teuxdeux, creativemornings, friends-work-here). Used to tag each asset + to score coverage per entity. 3-8 entries.",
        items: {
          type: "object",
          properties: {
            key: { type: "string", description: "short lowercase slug, e.g. \"tattly\"" },
            label: { type: "string", description: "human label, e.g. \"Tattly\"" },
          },
          required: ["key", "label"],
        },
      },
      image_queries: { type: "array", items: { type: "string" } },
      video_queries: { type: "array", items: { type: "string" } },
      broll_queries: { type: "array", items: { type: "string" } },
      screenrec_targets: {
        type: "array",
        items: {
          type: "object",
          properties: { url: { type: "string" }, label: { type: "string" }, note: { type: "string" } },
          required: ["url"],
        },
      },
    },
    required: ["subject_name", "image_queries", "video_queries", "broll_queries"],
  },
};

// ── NEW: per-asset enrichment (Tier B) — fills the assets.json contract fields ──
// the video engine cares about most: entity, caption/tags, focalPoint, plus a
// refined semantic kind + era. Image assets are sent to Claude vision; video/
// screen-rec assets get a lighter text-only pass (no frame).
const ASSET_ENRICH_SYSTEM = `You label one media asset for a case-study video about a named subject. Output feeds a render engine that matches assets to script beats and crops on the subject. Be accurate and conservative — if unsure, leave a field empty rather than guessing.

Fill:
- kind: the asset's role. One of: portrait (the subject's headshot/face, title-card material) · person (the subject in context — working, on stage) · work (their output: designs, screenshots, products shown in use) · b-roll (atmospheric/stock motion or texture, not the subject) · screen-recording (a captured screen/site scroll) · logo (a bare logomark) · product (an isolated product shot). Use the hint provided but correct it from what you actually see.
- caption: one tight line describing the asset (alt-text style). For the subject, name them.
- tags: 3-6 lowercase keywords for beat-matching (entities, objects, settings). Include any matching entity key.
- entity: if the asset clearly depicts one of the provided entities, return its key; else "".
- era: a year or short era if evident (e.g. "2008", "1970s"), else "".
- focalPoint: normalized {x,y} (0..1, top-left origin) of the main subject/face so cover-crop centers there. Default {0.5,0.5} if unclear.
- quality: 0..1 sharpness/resolution/composition score for ranking.

Call emit_asset_meta exactly once.`;

const ASSET_ENRICH_TOOL = {
  name: "emit_asset_meta",
  description: "Emit the descriptive metadata for this single asset.",
  input_schema: {
    type: "object",
    properties: {
      kind: { type: "string", enum: ["portrait", "person", "work", "b-roll", "screen-recording", "logo", "product"] },
      caption: { type: "string" },
      tags: { type: "array", items: { type: "string" } },
      entity: { type: "string" },
      era: { type: "string" },
      focalPoint: {
        type: "object",
        properties: { x: { type: "number" }, y: { type: "number" } },
        required: ["x", "y"],
      },
      quality: { type: "number" },
    },
    required: ["kind", "caption", "tags"],
  },
};

// ── NEW: auto-rank prompt (used only for `--auto` runs) ──────────────────────
// Given candidate thumbnails + metadata, pick the best portrait + stills + clips.
const RANK_SYSTEM = `You are the photo/video editor for an In Sequence case-study video about a named subject. From the candidate assets, pick the strongest set for a fast-cut montage opener. Rules:
- portrait: ONE clear, well-composed shot of the subject's face/persona (the title card). Prefer high resolution, editorial quality.
- stills: 4-8 strong supporting images (their work, studio, projects). Avoid duplicates, logos-on-white, tiny/low-res, and obvious wrong-person matches.
- clips: 0-4 short video/screen-recording assets that show motion or the subject's work.
Reject anything that looks like the wrong person, a stock-photo cliché, or is too low quality. Call emit_ranking exactly once.`;

const RANK_TOOL = {
  name: "emit_ranking",
  description: "Emit role assignments for the candidate assets.",
  input_schema: {
    type: "object",
    properties: {
      portrait_id: { type: "string", description: "id of the single best portrait, or \"\" if none" },
      still_ids: { type: "array", items: { type: "string" } },
      clip_ids: { type: "array", items: { type: "string" } },
      reject_ids: { type: "array", items: { type: "string" } },
    },
    required: ["still_ids", "clip_ids"],
  },
};

module.exports = {
  claudeKey,
  CLAUDE_MODEL,
  CASE_STUDY_PROMPT,
  MEDIA_PLAN_SYSTEM,
  MEDIA_PLAN_TOOL,
  RANK_SYSTEM,
  RANK_TOOL,
  ASSET_ENRICH_SYSTEM,
  ASSET_ENRICH_TOOL,
};
