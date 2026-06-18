// Shared media library: download images/video, screen-record public pages, and
// manage the per-case media manifest + staging→work promotion. CommonJS so
// server.js can require() it. Downloads land in the (gitignored, local-only)
// Remotion public/cases/<slug>/work tree, which the montage/minidoc renderers
// already consume — so approving an asset makes it render-ready with zero
// renderer changes.
//
// Rights posture: we do NOT judge rights here. Every entry carries source /
// sourceUrl / licenseGuess / rightsNote, surfaced at the human review gate.

const fs = require("fs");
const path = require("path");
const os = require("os");
const { execFileSync, spawnSync } = require("child_process");

// ── Path resolution ──────────────────────────────────────────────────────────
// The Remotion tooling lives at sequence/tools/remotion (a sibling of this
// image-sourcer tool) but is gitignored + may be absent from a worktree, so
// resolve robustly: explicit env override → relative sibling → absolute
// last-resort, mirroring tools/remotion/scripts/_paths.mjs.
const REMOTION_CANDIDATES = [
  path.resolve(__dirname, "../../remotion/public"),
  "/Users/neilbrown/Documents/00-Neil/01-In-Sequence/sequence/tools/remotion/public",
];

function remotionPublicDir() {
  if (process.env.REMOTION_PUBLIC_DIR) return process.env.REMOTION_PUBLIC_DIR;
  for (const c of REMOTION_CANDIDATES) {
    // accept the first whose parent (the remotion tool) exists, creating public/ if needed
    if (fs.existsSync(path.dirname(c))) return c;
  }
  // default to the absolute last-resort even if missing — mkdir on write
  return REMOTION_CANDIDATES[REMOTION_CANDIDATES.length - 1];
}

// ffmpeg/ffprobe ship with the Remotion compositor; reuse that copy.
function compositorBin(name) {
  if (process.env[`${name.toUpperCase()}_PATH`]) return process.env[`${name.toUpperCase()}_PATH`];
  const candidates = [
    path.resolve(__dirname, `../../remotion/node_modules/@remotion/compositor-darwin-arm64/${name}`),
    `/Users/neilbrown/Documents/00-Neil/01-In-Sequence/sequence/tools/remotion/node_modules/@remotion/compositor-darwin-arm64/${name}`,
  ];
  for (const c of candidates) if (fs.existsSync(c)) return c;
  return name; // fall back to PATH
}
const FFPROBE = () => compositorBin("ffprobe");
const FFMPEG = () => compositorBin("ffmpeg");

// The Remotion compositor's ffmpeg/ffprobe need their sibling dylibs on the
// dyld path (same requirement render-montage.mjs documents). Without this they
// fail silently and probes return 0. Only set it when we resolved a real
// compositor binary (not a bare PATH fallback).
function binEnv() {
  const fp = FFPROBE();
  if (path.isAbsolute(fp) && fs.existsSync(fp)) {
    return { ...process.env, DYLD_LIBRARY_PATH: path.dirname(fp) };
  }
  return process.env;
}

function caseDir(slug) {
  return path.join(remotionPublicDir(), "cases", slug);
}
function workDir(slug) {
  return path.join(caseDir(slug), "work");
}
function stagingDir(slug) {
  return path.join(workDir(slug), "_staging");
}
function manifestPath(slug) {
  return path.join(caseDir(slug), "media-manifest.json");
}
// Persisted media plan (entities, canonical urls) — written on source, read by
// enrichment + coverage so they don't re-call Claude for the plan.
function planPath(slug) {
  return path.join(caseDir(slug), "media-plan.json");
}
// The render-input contract the video engine reads (docs/ASSETS-MANIFEST.md).
function assetsPath(slug) {
  return path.join(workDir(slug), "assets.json");
}
function coveragePath(slug) {
  return path.join(workDir(slug), "coverage.json");
}

function ensureDir(d) {
  fs.mkdirSync(d, { recursive: true });
}

// ── Manifest ──────────────────────────────────────────────────────────────────
function readManifest(slug) {
  const p = manifestPath(slug);
  if (!fs.existsSync(p)) return [];
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return [];
  }
}
function writeManifest(slug, entries) {
  ensureDir(caseDir(slug));
  fs.writeFileSync(manifestPath(slug), JSON.stringify(entries, null, 2));
}
function appendManifest(slug, newEntries) {
  const all = readManifest(slug);
  const bySrc = new Set(all.map((e) => e.sourceUrl));
  const added = [];
  for (const e of newEntries) {
    if (e.sourceUrl && bySrc.has(e.sourceUrl)) continue; // de-dupe by source
    all.push(e);
    bySrc.add(e.sourceUrl);
    added.push(e);
  }
  writeManifest(slug, all);
  return added;
}
function getEntry(slug, id) {
  return readManifest(slug).find((e) => e.id === id) || null;
}
function setStatus(slug, id, status, role) {
  const all = readManifest(slug);
  const e = all.find((x) => x.id === id);
  if (!e) return null;
  e.status = status;
  if (role !== undefined) e.role = role;
  writeManifest(slug, all);
  return e;
}

// ── ffprobe helpers ────────────────────────────────────────────────────────────
function probeDims(file) {
  try {
    const out = execFileSync(
      FFPROBE(),
      ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", file],
      { encoding: "utf8", env: binEnv() }
    );
    const [w, h] = out.trim().split(",").map(Number);
    return { width: w || 0, height: h || 0 };
  } catch {
    return { width: 0, height: 0 };
  }
}
function probeDuration(file) {
  try {
    const out = execFileSync(
      FFPROBE(),
      ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file],
      { encoding: "utf8", env: binEnv() }
    );
    return parseFloat(out.trim()) || 0;
  } catch {
    return 0;
  }
}
function probeFps(file) {
  try {
    const out = execFileSync(
      FFPROBE(),
      ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=r_frame_rate", "-of", "csv=p=0", file],
      { encoding: "utf8", env: binEnv() }
    );
    const [n, d] = out.trim().split("/").map(Number);
    if (n && d) return Math.round((n / d) * 100) / 100;
    return n || 0;
  } catch {
    return 0;
  }
}

// ── JSON sidecar helpers (plan / assets.json / coverage.json) ────────────────
function readJson(p, fallback) {
  if (!fs.existsSync(p)) return fallback;
  try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return fallback; }
}
function readPlan(slug) { return readJson(planPath(slug), null); }
function writePlan(slug, plan) { ensureDir(caseDir(slug)); fs.writeFileSync(planPath(slug), JSON.stringify(plan, null, 2)); }

function readAssets(slug) {
  return readJson(assetsPath(slug), { version: 1, slug, assets: [] });
}
function writeAssets(slug, doc) { ensureDir(workDir(slug)); fs.writeFileSync(assetsPath(slug), JSON.stringify(doc, null, 2)); }
// upsert by the sourcer id we stash on each entry (_sourceId), else by path
function upsertAsset(slug, entry) {
  const doc = readAssets(slug);
  const i = doc.assets.findIndex((a) => (entry._sourceId && a._sourceId === entry._sourceId) || a.path === entry.path);
  if (i >= 0) doc.assets[i] = entry; else doc.assets.push(entry);
  writeAssets(slug, doc);
  return doc;
}
function removeAsset(slug, sourceId) {
  const doc = readAssets(slug);
  doc.assets = doc.assets.filter((a) => a._sourceId !== sourceId);
  writeAssets(slug, doc);
  return doc;
}
function writeCoverage(slug, coverage) { ensureDir(workDir(slug)); fs.writeFileSync(coveragePath(slug), JSON.stringify(coverage, null, 2)); }
function readCoverage(slug) { return readJson(coveragePath(slug), null); }

// ── ids + filenames ─────────────────────────────────────────────────────────────
let _seq = 0;
function mkId(kind) {
  _seq += 1;
  return `${kind}-${Date.now().toString(36)}-${_seq}`;
}
function extFromUrl(url, fallback) {
  try {
    const p = new URL(url).pathname;
    const m = p.match(/\.([a-z0-9]{2,5})$/i);
    if (m) return `.${m[1].toLowerCase()}`;
  } catch {}
  return fallback;
}

// Detect the TRUE image type from magic bytes (extensions lie — e.g. WebP bytes
// saved as .jpg). Returns { ext, mime } or null. Claude vision supports
// jpeg/png/gif/webp; avif/heic are flagged so we can skip the vision block.
function sniffImageType(file) {
  let fd;
  try { fd = fs.openSync(file, "r"); } catch { return null; }
  const b = Buffer.alloc(16);
  let n = 0;
  try { n = fs.readSync(fd, b, 0, 16, 0); } finally { fs.closeSync(fd); }
  if (n < 12) return null;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { ext: ".jpg", mime: "image/jpeg" };
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return { ext: ".png", mime: "image/png" };
  if (b.slice(0, 4).toString("latin1") === "RIFF" && b.slice(8, 12).toString("latin1") === "WEBP") return { ext: ".webp", mime: "image/webp" };
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) return { ext: ".gif", mime: "image/gif" };
  if (b.slice(4, 8).toString("latin1") === "ftyp") {
    const brand = b.slice(8, 12).toString("latin1");
    if (/avif|avis/i.test(brand)) return { ext: ".avif", mime: "image/avif" };
    if (/heic|heix|mif1|hevc/i.test(brand)) return { ext: ".heic", mime: "image/heic" };
  }
  return null;
}

// Claude can natively decode these for vision; others (avif/heic/unknown) get
// text-only enrichment.
const VISION_MIMES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

// If a file's extension doesn't match its real bytes (e.g. webp-in-.jpg), rename
// it to the correct extension and update the manifest entry's path. Returns the
// (possibly updated) entry. Used before enrichment so paths + media types are honest.
function normalizeImageExt(slug, entry) {
  if (!entry || entry.kind !== "image") return entry;
  const rel = entry.workFile || entry.file;
  const abs = path.join(remotionPublicDir(), rel);
  if (!fs.existsSync(abs)) return entry;
  const sniff = sniffImageType(abs);
  if (!sniff) return entry;
  const norm = (e) => (e === ".jpeg" ? ".jpg" : e.toLowerCase());
  const curExt = path.extname(abs);
  if (norm(curExt) === norm(sniff.ext)) return entry; // already correct
  const newAbs = abs.slice(0, abs.length - curExt.length) + sniff.ext;
  try { fs.renameSync(abs, newAbs); } catch { return entry; }
  const newRel = path.relative(remotionPublicDir(), newAbs);
  const man = readManifest(slug);
  const e = man.find((x) => x.id === entry.id);
  if (e) { e.file = newRel; e.workFile = newRel; writeManifest(slug, man); }
  entry.file = newRel; entry.workFile = newRel;
  return entry;
}

// ── Downloaders ───────────────────────────────────────────────────────────────
// Each returns a manifest entry (status "candidate") or null on failure/too-small.
async function downloadImage({ url, slug, query = "", source = "", sourceUrl = "", licenseGuess = "unknown", minW = 800, minH = 500 }) {
  ensureDir(stagingDir(slug));
  const id = mkId("image");
  let file = path.join(stagingDir(slug), `${id}${extFromUrl(url, ".jpg")}`);
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    fs.writeFileSync(file, Buffer.from(await r.arrayBuffer()));
  } catch {
    return null;
  }
  // correct the extension from the real bytes (URLs/headers often lie)
  const sniff = sniffImageType(file);
  if (sniff) {
    const norm = (e) => (e === ".jpeg" ? ".jpg" : e.toLowerCase());
    if (norm(path.extname(file)) !== norm(sniff.ext)) {
      const fixed = file.slice(0, file.length - path.extname(file).length) + sniff.ext;
      try { fs.renameSync(file, fixed); file = fixed; } catch {}
    }
  }
  const { width, height } = probeDims(file);
  if (width && height && (width < minW || height < minH)) {
    fs.unlinkSync(file);
    return null;
  }
  return {
    id,
    kind: "image",
    file: path.relative(remotionPublicDir(), file),
    query,
    source,
    sourceUrl: sourceUrl || url,
    licenseGuess,
    rightsNote: "",
    width,
    height,
    durationSec: 0,
    status: "candidate",
    role: null,
  };
}

async function downloadVideoFile({ url, slug, query = "", source = "", sourceUrl = "", licenseGuess = "unknown", kind = "video" }) {
  ensureDir(stagingDir(slug));
  const id = mkId(kind);
  const file = path.join(stagingDir(slug), `${id}${extFromUrl(url, ".mp4")}`);
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    fs.writeFileSync(file, Buffer.from(await r.arrayBuffer()));
  } catch {
    return null;
  }
  const durationSec = probeDuration(file);
  const { width, height } = probeDims(file);
  return {
    id,
    kind,
    file: path.relative(remotionPublicDir(), file),
    query,
    source,
    sourceUrl: sourceUrl || url,
    licenseGuess,
    rightsNote: "",
    width,
    height,
    durationSec,
    status: "candidate",
    role: null,
  };
}

function ytDlpAvailable() {
  const r = spawnSync("yt-dlp", ["--version"], { encoding: "utf8" });
  return r.status === 0;
}

// Opt-in. Caller must pass allowVideoDownload=true. Prints a TOS reminder.
async function downloadVideoYtDlp({ url, slug, query = "", source = "youtube", sourceUrl = "" }) {
  if (!ytDlpAvailable()) {
    throw new Error("yt-dlp not installed. Install with: brew install yt-dlp  (video download skipped)");
  }
  console.warn(`  ⚠ yt-dlp download — verify you have the right to use this footage (platform TOS may prohibit downloading): ${url}`);
  ensureDir(stagingDir(slug));
  const id = mkId("video");
  const outTmpl = path.join(stagingDir(slug), `${id}.%(ext)s`);
  const r = spawnSync(
    "yt-dlp",
    ["-f", "mp4/best", "--no-playlist", "--max-filesize", "200M", "-o", outTmpl, url],
    { encoding: "utf8", stdio: "inherit" }
  );
  if (r.status !== 0) throw new Error(`yt-dlp failed for ${url}`);
  // resolve the produced file
  const produced = fs
    .readdirSync(stagingDir(slug))
    .filter((f) => f.startsWith(`${id}.`))
    .map((f) => path.join(stagingDir(slug), f))[0];
  if (!produced) return null;
  const durationSec = probeDuration(produced);
  const { width, height } = probeDims(produced);
  return {
    id,
    kind: "video",
    file: path.relative(remotionPublicDir(), produced),
    query,
    source,
    sourceUrl: sourceUrl || url,
    licenseGuess: "editorial / verify",
    rightsNote: "downloaded via yt-dlp — confirm usage rights",
    width,
    height,
    durationSec,
    status: "candidate",
    role: null,
  };
}

// Headless scroll-capture of a public page → mp4. Playwright is lazy-required so
// it's an optional dependency; falls back with guidance if absent.
async function screenRecord({ url, slug, label = "", scrollSec = 10, source = "screen-recording" }) {
  let chromium;
  try {
    ({ chromium } = require("playwright"));
  } catch {
    throw new Error("playwright not installed. Run: npm install playwright && npx playwright install chromium");
  }
  ensureDir(stagingDir(slug));
  const id = mkId("screenrec");
  const recDir = fs.mkdtempSync(path.join(os.tmpdir(), "seq-screenrec-"));
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: recDir, size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();
  let webm;
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 }).catch(() => {});
    // slow autoscroll across the page over ~scrollSec seconds
    const steps = Math.max(8, scrollSec * 2);
    for (let i = 0; i < steps; i++) {
      await page.evaluate((frac) => {
        const h = document.body.scrollHeight - window.innerHeight;
        window.scrollTo({ top: h * frac, behavior: "smooth" });
      }, i / (steps - 1)).catch(() => {});
      await page.waitForTimeout((scrollSec * 1000) / steps);
    }
    webm = await page.video().path();
    await context.close(); // flush video
    await browser.close();
  } catch (e) {
    await browser.close().catch(() => {});
    throw e;
  }
  // normalize webm → mp4 via the compositor ffmpeg
  const file = path.join(stagingDir(slug), `${id}.mp4`);
  const r = spawnSync(FFMPEG(), ["-y", "-i", webm, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-an", file], {
    encoding: "utf8",
    env: binEnv(),
  });
  fs.rmSync(recDir, { recursive: true, force: true });
  if (r.status !== 0 || !fs.existsSync(file)) throw new Error(`ffmpeg normalize failed for screen recording of ${url}`);
  const durationSec = probeDuration(file);
  const { width, height } = probeDims(file);
  return {
    id,
    kind: "screenrec",
    file: path.relative(remotionPublicDir(), file),
    query: label || url,
    source,
    sourceUrl: url,
    licenseGuess: "screen capture of public page",
    rightsNote: "editorial use of publicly displayed work",
    width,
    height,
    durationSec,
    status: "candidate",
    role: null,
  };
}

// Normalize a video page URL to an autoplay+muted embed the headless browser can
// actually play. Falls back to the raw page (we try to play its first <video>).
function toEmbed(url) {
  try {
    const u = new URL(url);
    let id;
    if (u.hostname.includes("youtu.be")) id = u.pathname.slice(1);
    else if (u.hostname.includes("youtube.com")) {
      if (u.pathname.startsWith("/watch")) id = u.searchParams.get("v");
      else if (u.pathname.startsWith("/shorts/")) id = u.pathname.split("/")[2];
      else if (u.pathname.startsWith("/embed/")) id = u.pathname.split("/")[2];
    }
    // NOTE: YouTube embeds frequently return Error 150/153 in headless (embedding
    // disabled / origin check). The watch page plays reliably — we record it and
    // crop to the <video> element's box to drop the surrounding YouTube chrome.
    if (id) return `https://www.youtube.com/watch?v=${id}`;
    if (u.hostname.includes("vimeo.com")) {
      const vid = u.pathname.split("/").filter(Boolean)[0];
      if (/^\d+$/.test(vid)) return `https://player.vimeo.com/video/${vid}?autoplay=1&muted=1`;
    }
  } catch {}
  return url;
}

// True for URLs we can drive directly (YouTube watch/embed/short, Vimeo).
function isKnownPlayer(url) {
  return /youtube\.com\/(watch|embed|shorts)|youtu\.be\/|vimeo\.com\//.test(url);
}

// For a generic web page (e.g. a CreativeMornings page that embeds the video in
// an iframe), find the underlying player so we record THAT, not the static page.
// Returns a YouTube/Vimeo URL, a direct video-file URL, or null.
async function resolveEmbedSource(browser, url) {
  const ctx = await browser.newContext({
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });
  const page = await ctx.newPage();
  let found = null;
  try {
    await page.goto(url, { waitUntil: "load", timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(2500);
    found = await page.evaluate(() => {
      const ifr = [...document.querySelectorAll("iframe")]
        .map((f) => f.src)
        .filter(Boolean)
        .find((s) => /youtube\.com\/embed|youtube-nocookie\.com\/embed|youtu\.be|player\.vimeo\.com|youtube\.com\/watch/.test(s));
      if (ifr) return ifr;
      const v = document.querySelector("video");
      const src = v && (v.currentSrc || v.src || (v.querySelector("source") && v.querySelector("source").src));
      return src && /^https?:/.test(src) ? src : null;
    });
  } catch {}
  await ctx.close().catch(() => {});
  return found;
}

// Capture ONE clip of a playing video starting at `startSec`. Seeks the player
// past intros, then keeps the LAST `captureSec` of the recording (-sseof) so the
// trim is deterministic regardless of how long the page took to load. Returns
// { entry, duration } (duration of the source video, for clip planning).
async function _captureClip({ browser, embed, url, slug, startSec, captureSec, label }) {
  const id = mkId("screenrec");
  const recDir = fs.mkdtempSync(path.join(os.tmpdir(), "seq-recvid-"));
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: recDir, size: { width: 1280, height: 720 } },
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();
  let webm, crop = null, duration = 0;
  try {
    await page.goto(embed, { waitUntil: "load", timeout: 30000 }).catch(() => {});
    await page.evaluate(() => {
      const v = document.querySelector("video");
      if (v) { v.muted = true; const p = v.play && v.play(); if (p && p.catch) p.catch(() => {}); }
    }).catch(() => {});
    await page.waitForTimeout(4000); // let the player load + autoplay begin
    // read source duration + seek past the intro
    try {
      duration = await page.$eval("video", (el, s) => { if (el.duration && isFinite(el.duration) && el.duration > s + 1) el.currentTime = s; return el.duration || 0; }, startSec);
    } catch {}
    // adaptive buffer: wait until the player is actually playing at/near the seek
    // target (far seeks on long videos need much longer than a fixed delay)
    await page.waitForFunction((s) => {
      const v = document.querySelector("video");
      return v && !v.seeking && v.readyState >= 3 && v.currentTime >= s - 2;
    }, startSec, { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(800);
    try {
      const box = await page.$eval("video", (el) => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
      if (box && box.w > 200 && box.h > 150) crop = box;
    } catch {}
    await page.waitForTimeout(captureSec * 1000 + 600); // the window we keep
    webm = await page.video().path();
    await context.close();
  } catch (e) {
    await context.close().catch(() => {});
    throw e;
  }
  const file = path.join(stagingDir(slug), `${id}.mp4`);
  // keep the LAST captureSec (the post-seek content); deterministic vs load time
  const args = ["-y", "-sseof", `-${captureSec}`, "-i", webm, "-t", String(captureSec)];
  if (crop) {
    const cw = Math.max(2, Math.floor(crop.w / 2) * 2);
    const ch = Math.max(2, Math.floor(crop.h / 2) * 2);
    args.push("-vf", `crop=${cw}:${ch}:${Math.max(0, Math.round(crop.x))}:${Math.max(0, Math.round(crop.y))}`);
  }
  args.push("-c:v", "libx264", "-pix_fmt", "yuv420p", "-an", file);
  const r = spawnSync(FFMPEG(), args, { encoding: "utf8", env: binEnv() });
  fs.rmSync(recDir, { recursive: true, force: true });
  if (r.status !== 0 || !fs.existsSync(file)) throw new Error(`ffmpeg normalize failed for video screen-record of ${url}`);
  const durationSec = probeDuration(file);
  const { width, height } = probeDims(file);
  const entry = {
    id, kind: "screenrec", file: path.relative(remotionPublicDir(), file),
    // sourceUrl is per-clip-unique (encodes the offset) so multiple clips from the
    // same video survive the manifest's de-dupe-by-sourceUrl.
    query: `${label || url} @${Math.round(startSec)}s`, source: "video-screencap",
    sourceUrl: `${url}#t=${Math.round(startSec)}`, videoUrl: url,
    licenseGuess: "screen capture of published video", rightsNote: "editorial use — verify rights to source footage",
    width, height, durationSec, status: "candidate", role: null,
  };
  return { entry, duration };
}

// Screen-RECORD a playing video (interview/talk) — silent, cropped to the player.
// Skips the first `startSec` (intros), and for longer videos grabs several spread
// clips of `captureSec` each. Returns an ARRAY of manifest entries (one per clip).
async function screenRecordVideo({ url, slug, label = "", captureSec = 20, startSec = 15, maxClips = 4 }) {
  let chromium;
  try {
    ({ chromium } = require("playwright"));
  } catch {
    throw new Error("playwright not installed. Run: npm install playwright && npx playwright install chromium");
  }
  ensureDir(stagingDir(slug));
  const browser = await chromium.launch({ headless: true });
  const entries = [];
  try {
    // If this is a generic page (video embedded in an iframe / native player),
    // resolve the underlying player so we record IT, not the static page. If we
    // can't find a real player (bot-walled page, click-to-play, etc.), skip with
    // a clear message instead of recording a page where nothing plays.
    let target = url;
    if (!isKnownPlayer(url)) {
      const resolved = await resolveEmbedSource(browser, url);
      if (!resolved) {
        throw new Error("no playable video found on this page (bot-protected or click-to-play) — try the YouTube version of this video");
      }
      target = resolved;
    }
    const embed = toEmbed(target);
    // first clip at startSec — also tells us the source duration
    const first = await _captureClip({ browser, embed, url, slug, startSec, captureSec, label });
    if (first.entry) entries.push(first.entry);
    const dur = first.duration || 0;
    // long enough for more? spread additional clips across the remainder
    if (dur > startSec + captureSec * 2 + 10) {
      const usableEnd = dur - captureSec - 5;
      const n = Math.min(maxClips, Math.max(2, Math.round(dur / 180))); // ~1 clip / 3 min
      for (let i = 1; i < n; i++) {
        const off = startSec + ((usableEnd - startSec) * i) / (n - 1);
        try {
          const c = await _captureClip({ browser, embed, url, slug, startSec: off, captureSec, label });
          if (c.entry) entries.push(c.entry);
        } catch (e) { console.warn(`  clip @${Math.round(off)}s skipped:`, e.message); }
      }
    }
  } finally {
    await browser.close().catch(() => {});
  }
  if (!entries.length) throw new Error(`no clips captured for ${url}`);
  return entries;
}

// True if a hero portrait file (featured/portrait.<ext>) already exists.
function heroPortraitExists(slug) {
  const dir = path.join(workDir(slug), "featured");
  return fs.existsSync(dir) && fs.readdirSync(dir).some((f) => /^portrait\.[a-z0-9]+$/i.test(f));
}

// ── Promotion: staging → work/ ──────────────────────────────────────────────────
// role: "portrait" → work/featured/. The FIRST portrait becomes the hero
// (portrait.<ext>, title card); additional portraits get unique names
// (portrait-<id>.<ext>) so several can coexist for a portrait-montage beat.
// "still" → work/images/; "clip" → work/video/ (folders match docs/ASSETS-MANIFEST.md).
function approve(slug, id, role) {
  const e = getEntry(slug, id);
  if (!e) throw new Error(`no manifest entry ${id}`);
  const abs = path.join(remotionPublicDir(), e.file);
  if (!fs.existsSync(abs)) throw new Error(`staged file missing: ${e.file}`);
  const ext = path.extname(abs);
  let destDir;
  let destName;
  if (role === "portrait") {
    destDir = path.join(workDir(slug), "featured");
    destName = heroPortraitExists(slug) ? `portrait-${id}${ext}` : `portrait${ext}`;
  } else if (role === "clip") {
    destDir = path.join(workDir(slug), "video");
    destName = `${id}${ext}`;
  } else {
    role = "still";
    destDir = path.join(workDir(slug), "images");
    destName = `${id}${ext}`;
  }
  ensureDir(destDir);
  const dest = path.join(destDir, destName);
  fs.renameSync(abs, dest);
  e.status = "approved";
  e.role = role;
  e.workFile = path.relative(remotionPublicDir(), dest);
  e.file = e.workFile;
  writeManifest(slug, readManifest(slug).map((x) => (x.id === id ? e : x)));
  return e;
}

// Build the deterministic part of an assets.json AssetEntry from an approved
// manifest entry. The server adds the Claude-enriched fields (caption, tags,
// entity, era, focalPoint, refined kind, quality) on top.
function toAssetBase(slug, e) {
  const isImg = e.kind === "image";
  const type = isImg ? "image" : "video";
  // path relative to work/ (strip the leading cases/<slug>/work/)
  const rel = (e.workFile || e.file).replace(new RegExp(`^cases/${slug}/work/`), "");
  // semantic kind (the engine's enum) — refined later by vision for images
  let kind;
  if (e.role === "portrait") kind = "portrait";
  else if (e.kind === "screenrec") kind = "screen-recording";
  else if (e.kind === "broll") kind = "b-roll";
  else if (isImg) kind = "work";
  else kind = "b-roll";
  const license = mapLicense(e.licenseGuess);
  // dims: trust the manifest, but re-probe if missing/0 (e.g. a file that was
  // mislabeled at download time but is now a readable JPEG). Stays 0 → omitted
  // for genuinely un-probeable formats (some VP8X WebP).
  let width = e.width || 0, height = e.height || 0;
  if (!width || !height) {
    const d = probeDims(path.join(remotionPublicDir(), e.workFile || e.file));
    if (d.width && d.height) { width = d.width; height = d.height; }
  }
  const orientation = width && height ? (width > height ? "landscape" : width < height ? "portrait" : "square") : undefined;
  // hero portrait (featured/portrait.<ext>) → priority 100 (title card);
  // extra portraits (featured/portrait-<id>.<ext>) → 70 (portrait-beat set).
  const isHeroPortrait = e.role === "portrait" && /(^|\/)portrait\.[a-z0-9]+$/i.test(rel);
  const priority = e.role === "portrait" ? (isHeroPortrait ? 100 : 70) : 50;
  const entry = {
    _sourceId: e.id,
    path: rel,
    type,
    kind,
    featured: e.role === "portrait",
    priority,
    width: width || undefined,
    height: height || undefined,
    orientation,
    source: e.sourceUrl || undefined,
    license,
  };
  if (!isImg) {
    const abs = path.join(remotionPublicDir(), e.workFile || e.file);
    entry.durationSec = e.durationSec || probeDuration(abs) || undefined;
    entry.fps = probeFps(abs) || undefined;
    entry.motion = e.kind === "broll" ? "calm" : "busy";
  }
  return entry;
}

function mapLicense(guess) {
  const g = (guess || "").toLowerCase();
  if (g.includes("pexels") || g.includes("stock")) return "stock";
  if (g.includes("commons") || g.includes("cc ") || g.includes("creative commons") || g.startsWith("cc")) return "cc";
  if (g.includes("screen capture") || g.includes("editorial")) return "editorial";
  if (g.includes("owned")) return "owned";
  return "unknown";
}

function reject(slug, id) {
  const e = getEntry(slug, id);
  if (!e) return null;
  const abs = path.join(remotionPublicDir(), e.file);
  if (fs.existsSync(abs)) fs.unlinkSync(abs);
  setStatus(slug, id, "rejected");
  removeAsset(slug, id); // drop from assets.json if it had been approved
  return e;
}

module.exports = {
  remotionPublicDir,
  caseDir,
  workDir,
  stagingDir,
  manifestPath,
  readManifest,
  writeManifest,
  appendManifest,
  getEntry,
  setStatus,
  probeDims,
  probeDuration,
  probeFps,
  sniffImageType,
  normalizeImageExt,
  VISION_MIMES,
  downloadImage,
  downloadVideoFile,
  downloadVideoYtDlp,
  ytDlpAvailable,
  screenRecord,
  screenRecordVideo,
  resolveEmbedSource,
  isKnownPlayer,
  approve,
  reject,
  // plan + assets.json + coverage.json
  readPlan,
  writePlan,
  readAssets,
  writeAssets,
  upsertAsset,
  removeAsset,
  writeCoverage,
  readCoverage,
  toAssetBase,
};
