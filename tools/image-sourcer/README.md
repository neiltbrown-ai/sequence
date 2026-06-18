# SEQ Image Sourcer

Local media sourcing tool for In Sequence. Two modes:

- **Image Sourcer** (`/index.html`) — AI-generated queries → Unsplash / Pexels /
  Google Images / Library of Congress, written into content MDX frontmatter.
- **Media Sourcer** (`/media.html`) — sources real **imagery, video,
  screen-recordings and stock B-roll OF a case-study subject**, downloads the
  files into the Remotion `public/cases/<slug>/work/` pile, behind a human
  review gate. Approved assets are consumed directly by the Remotion montage /
  minidoc renderers (no renderer changes needed).

## Setup
1. `npm install`
2. (screen recording) `npx playwright install chromium`
3. (optional video download) `brew install yt-dlp`
4. `cp .env.example .env` and add your keys
5. `node server.js`
6. Open http://localhost:3100

## Keys
- Anthropic (internal tooling): `SEQ_INTERNAL_ANTHROPIC_API_KEY` (falls back to
  `ANTHROPIC_API_KEY`). Kept separate from Sequence *user* spend.
- Serper (Google Images): https://serper.dev — stills of the subject
- Unsplash / Pexels: https://unsplash.com/developers · https://www.pexels.com/api/
  (Pexels key also powers B-roll video search)
- YouTube Data API (optional): https://console.cloud.google.com — video search

## Media Sourcer — usage

UI: open `/media.html` (or click "video / media →" in the Image Sourcer header),
enter a case slug. Two ways to find assets:

- **Source media** (one-click auto): plans + downloads a curated handful per type
  into `work/_staging/`.
- **Browse & pick** (broad, Google-style): the search panel returns 20-130
  thumbnail results **without downloading** — type your own term, or click a plan
  query chip (Claude's queries, editable). Click a result to add just that one;
  videos are screen-recorded on click. A **paste-URL** box adds a specific
  image/video/page you found elsewhere. This is the way to get breadth + control
  matching a manual Google search (Serper *is* Google Images — the difference is
  seeing all results and picking, vs. a curated few).

Either way, picks land in the **Review queue**: **Approve** (Portrait / Still /
Clip) promotes a file into `work/{featured,images,video}/`; **Reject** deletes it.

CLI (batch / headless — start the server first):

```bash
node ../remotion/scripts/source-media.mjs <slug> \
  [--kinds=stills,broll,screen,rec-video,video] [--max=8] [--auto] [--allow-video-download]
```

Media kinds: `stills` (Google/Commons images) · `broll` (Pexels stock video) ·
`screen` (scroll-capture the subject's sites) · `rec-video` (find interviews/talks
via Serper video search and **screen-record the playing video**, silent — skips
the first ~15s of intros and grabs several spread ~20s clips from longer videos;
most rights-defensible way to get footage of the person) · `video` (direct Commons
video; + YouTube via yt-dlp only with `--allow-video-download`).

**Browse & pick** has three modes: **images**, **videos** (web footage of the
subject → screen-recorded on click), and **b-roll** (stock clips from Pexels +
Pixabay → downloaded on click, with hover-to-play previews). Add `PIXABAY_API_KEY`
to widen b-roll beyond Pexels. Note: there's no reliable automatic filter for
podcast/slideshow videos that are just a static cover image — reject those in the
review queue.

`--auto` lets Claude vision-rank candidates and auto-promote the best. Then render:
`node ../remotion/scripts/render-montage.mjs <slug>`.

### Output for the video engine (`assets.json` contract)

On approve, each asset is enriched (Claude vision for images) and written to
`work/assets.json` per [`docs/ASSETS-MANIFEST.md`](../remotion/docs/ASSETS-MANIFEST.md):
deterministic fields (`path`, `type`, `kind`, `license`, dims, `fps`, `orientation`)
plus the high-value descriptive ones the engine matches on — `entity`, `caption`,
`tags`, `focalPoint`, `era`, `quality`. A `work/coverage.json` is also written
(per-entity image/video counts + `needsPortrait`/`needsBRoll`) so you can spot thin
beats before rendering. The media-plan step proposes the case's entity list; it's
persisted to `media-plan.json` and reused by enrichment + coverage.

The **Finalize → assets.json** button (and re-approving) rebuilds these from all
currently-approved assets — use it to backfill a case approved before enrichment
existed. Approved clips live in `work/video/` (singular), stills in `work/images/`,
the subject hero at `work/featured/portrait.*`.

### External storage (large asset libraries)

Downloaded media lives under `tools/remotion/public/cases/` and grows fast. To
keep it off internal disk, move it to an external SSD and symlink:

```bash
cd tools/remotion
./scripts/link-assets-external.sh "/Volumes/YourSSD" "subdir/here"
```

This rsyncs `public/cases` to the SSD, keeps a `.bak` of the originals (delete
after you verify a render), and replaces `public/cases` with a symlink. No code
changes are needed:

- **Sourcer** writes through the symlink → assets land on the SSD.
- **Render** — Remotion *forwards the symlink into the bundle* (no copy), so
  files stream from the SSD on demand; the final video still writes to internal
  `out/`. `fonts/` + audio stay on internal storage.
- **Unplugged** → `public/cases` dangles and the tool/render can't find assets
  until you replug (macOS remounts at the same `/Volumes/<name>` path, so the
  symlink reconnects automatically — no re-run).

### Rights
Nothing here judges rights. Every asset is tagged with `source` / `licenseGuess`
/ `rightsNote`, surfaced at the review gate. `--allow-video-download` uses yt-dlp
(platform TOS may prohibit downloading) and is **off by default**; prefer
Wikimedia Commons, Pexels, official press kits, and screen-recordings of public
pages.
