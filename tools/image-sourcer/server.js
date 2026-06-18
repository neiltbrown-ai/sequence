// Load .env from image-sourcer dir first, then fall back to repo root
require('dotenv').config({ path: require('path').resolve(__dirname, '.env'), override: true });
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const media = require('./lib/fetch-media');
const prompts = require('./lib/prompts');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3100;

// Internal-tooling Claude key (SEQ_INTERNAL_ANTHROPIC_API_KEY, fallback
// ANTHROPIC_API_KEY) — keeps internal spend separate from Sequence user spend.
const CLAUDE_KEY = prompts.claudeKey();

// Thin wrapper over the Anthropic messages API using the internal key.
async function callClaude({ system, messages, tools, tool_choice, max_tokens = 1024, model = prompts.CLAUDE_MODEL }) {
  if (!CLAUDE_KEY) throw new Error('No internal Anthropic key (set SEQ_INTERNAL_ANTHROPIC_API_KEY)');
  const body = { model, max_tokens, system, messages };
  if (tools) body.tools = tools;
  if (tool_choice) body.tool_choice = tool_choice;
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': CLAUDE_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`Anthropic API returned ${r.status}: ${await r.text()}`);
  return r.json();
}

const SYSTEM_PROMPT = `You are an art director for In Sequence — an editorial brand about how the creative economy is restructuring. You source imagery that feels like it belongs in Bloomberg Businessweek, Monocle, or a Sagmeister monograph — never a stock photo library.

YOUR JOB:
Read the content title and description. Then think: what VISUAL FORM represents this idea? Not "what is this article about" but "what does this article LOOK LIKE as an image." The result should feel graphic, structural, and impactful — not descriptive or on-the-nose.

QUERY STRATEGY — generate exactly 6 queries in this mix:
1. GRAPHIC / ABSTRACT (3 queries): Bold visual compositions. Search for these kinds of images:
   - Clean geometric forms: "minimal black white geometry", "abstract gradient sphere", "concentric circles minimal"
   - Architectural abstraction: "concrete brutalist staircase", "minimal facade shadow", "terrazzo floor pattern"
   - Designed surfaces: "risograph texture", "halftone gradient", "paper cut layers", "color field painting"
   - Data/structure as visual: "topographic contour lines", "wireframe render", "grid paper drawing"
   Think Dezeen, It's Nice That, or a Swiss design annual. NOT rusty metal, NOT old gears, NOT industrial decay.

2. SPATIAL / ENVIRONMENTAL (2 queries): Specific designed spaces and composed scenes. NOT generic moody hallways. Examples:
   - "gallery white cube", "modernist interior shadow", "terrazzo lobby", "neon museum sign"
   - "control room vintage", "recording studio console", "lecture hall empty", "drafting studio overhead"
   - "swimming pool geometric", "tennis court aerial", "parking structure minimal"

3. MATERIAL / TACTILE (1 query): Extreme close-up surface detail. Clean and contemporary, not grimy or decayed. Examples:
   - "marble vein detail", "folded paper shadow", "glass prism refraction", "ceramic glaze macro"
   - NOT rust, NOT gears, NOT chains, NOT old machinery

BANNED QUERIES — never generate these:
- "gears", "cogs", "machinery", "industrial", "rusty", "vintage metal"
- "stock market", "trading floor", "chart", "graph", "stock ticker"
- "handshake", "business suit", "corporate meeting", "office team"
- "dark hallway", "foggy road", "moody landscape"
- Any query that would return people in suits, stock charts, or decaying industrial scenes

WHAT WE WANT:
- Clean, contemporary, designed — feels intentional not accidental
- Strong color: single-color fields, duotone, bold palette, or crisp B&W
- Geometric precision: straight lines, curves, grids, symmetry, or deliberate asymmetry
- Negative space as a compositional tool
- The image should feel like a poster, not a photograph

QUERY FORMAT:
- 2 to 4 words per query — be specific enough to avoid stock photo results
- Add qualifiers like "minimal", "aerial", "overhead", "abstract", "close up" to steer away from generic results

RETURN FORMAT:
Raw JSON array of 6 strings only. No markdown fences, no explanation, nothing else.
Example for a piece about independent film financing: ["35mm film strip close", "projection light beam", "minimal theater seats", "storyboard grid paper", "color gel abstract", "editing timeline screen"]`;

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

// Slot-aware query generation prompt
const SLOT_QUERY_PROMPT = `You are an art director for In Sequence — an editorial brand about how the creative economy is restructuring. You source imagery that feels like Bloomberg Businessweek, Monocle, or a Sagmeister monograph — never stock photography.

YOUR JOB:
Generate targeted image search queries for SPECIFIC image slots in a content piece. Each slot includes the section heading and surrounding paragraphs — READ THIS CONTEXT CAREFULLY.

Your job is NOT to illustrate what the text says. Your job is to find the VISUAL FORM that embodies the section's idea. Ask: what does this section LOOK LIKE as an image?

HOW TO USE CONTEXT:
- If the context discusses leverage or asymmetry → "concrete cantilever minimal", "balance scale abstract"
- If the context mentions compounding or flywheels → "spiral staircase overhead", "concentric circles minimal"
- If the context describes a person's specific work → one query can reference it (e.g. "rural Japan path") — but pair with graphic/abstract queries
- If the context discusses contracts or deals → NOT "handshake" — instead: "grid paper drawing", "architectural section drawing", "paper fold layers"
- Default to clean geometry, designed spaces, and graphic surfaces over literal scenes

QUERY MIX per slot (4-6 queries each):
- 2-3 GRAPHIC/ABSTRACT: Clean geometric forms, architectural abstraction, designed surfaces, data-as-visual. Think Dezeen or Swiss design annual. Examples: "minimal black white geometry", "terrazzo pattern close", "risograph texture", "topographic contour lines", "abstract gradient sphere"
- 1-2 SPATIAL: Specific designed spaces — "gallery white cube", "modernist interior shadow", "parking structure minimal", "recording studio console", "tennis court aerial"
- 0-1 CONTEXTUAL: Only if the surrounding text references a specific place, object, or person worth searching for directly

BANNED — never use these terms in queries:
- "gears", "cogs", "machinery", "industrial", "rusty", "vintage metal"
- "stock market", "trading floor", "chart", "graph"
- "handshake", "business suit", "corporate meeting"
- "dark hallway", "foggy road", "moody landscape"

WANT: Clean and contemporary. Strong color or crisp B&W. Geometric precision. Negative space. Should feel like a poster, not a stock photo.

Keep each query 2-4 words. Add qualifiers like "minimal", "aerial", "abstract", "close up" to steer results.

RETURN FORMAT:
Raw JSON object mapping slot roles to arrays of query strings. No markdown fences, no explanation.
Example: {"hero": ["35mm film strip close", "projection light beam", "minimal theater seats", "color gel abstract"], "slot-1": ["concentric circles minimal", "terrazzo floor pattern", "paper cut layers"], "slot-2": ["gallery white cube", "glass prism refraction", "wireframe render"]}`;

// POST /api/queries/slots — generate queries per image slot
app.post('/api/queries/slots', async (req, res) => {
  const { type, title, excerpt, discipline, slots } = req.body;

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'Anthropic API key not configured' });
  }

  const isCaseStudy = type === 'case-studies';
  const slotDescriptions = slots.map(s => {
    let desc = `- ${s.role} (${s.label})`;
    if (s.context) desc += `\n  Context: ${s.context}`;
    if (s.current) desc += `\n  Currently filled: yes (can replace)`;
    else desc += `\n  Currently empty`;
    return desc;
  }).join('\n');

  const userMessage = `Content type: ${type}
Title: ${title}
${discipline ? `Discipline: ${discipline}` : ''}
Description: ${excerpt || '(no excerpt)'}

IMAGE SLOTS TO FILL:
${slotDescriptions}

Generate 4-6 targeted search queries for EACH slot.${isCaseStudy ? ' For hero and secondary slots, include the real person/company name in most queries.' : ''} Return as a JSON object mapping slot role to query arrays.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 800,
        system: SLOT_QUERY_PROMPT,
        messages: [{ role: 'user', content: userMessage }]
      })
    });

    if (!response.ok) throw new Error(`Anthropic API returned ${response.status}`);
    const data = await response.json();
    const text = data.content?.[0]?.text || '';

    let slotQueries;
    try {
      slotQueries = JSON.parse(text);
    } catch {
      // Fallback: generic queries for each slot
      slotQueries = {};
      for (const s of slots) {
        const words = (title || 'editorial').split(/\s+/).filter(w => w.length > 3);
        slotQueries[s.role] = [words.slice(0, 2).join(' ') || 'editorial workspace', 'cinematic texture'];
      }
    }

    res.json({ slotQueries });
  } catch (err) {
    console.error('Slot query generation error:', err.message);
    const slotQueries = {};
    for (const s of slots) {
      slotQueries[s.role] = ['editorial workspace', 'cinematic texture'];
    }
    res.json({ slotQueries, fallback: true });
  }
});

// POST /api/queries — proxy to Anthropic API (original endpoint, still used for manual searches)
app.post('/api/queries', async (req, res) => {
  const { type, title, excerpt } = req.body;

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'Anthropic API key not configured' });
  }

  const isCaseStudy = type === 'case study';
  const systemPrompt = isCaseStudy ? CASE_STUDY_PROMPT : SYSTEM_PROMPT;
  const queryCount = isCaseStudy ? 8 : 6;

  const userMessage = [
    type ? `Content type: ${type}` : '',
    title ? `Title: ${title}` : '',
    excerpt ? `Description: ${excerpt}` : '',
    '',
    isCaseStudy
      ? `Generate ${queryCount} image search queries for this case study. Include the real person/company name in most queries. Follow the IDENTITY / WORK & PORTFOLIO / TEXTURAL mix.`
      : `Generate ${queryCount} image search queries that are editorially relevant to this specific content. Follow the LITERAL / METAPHORICAL / TEXTURAL mix.`
  ].filter((line, i) => i === 3 || line !== '').join('\n');

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: isCaseStudy ? 350 : 250,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }]
      })
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Anthropic API error:', response.status, errBody);
      throw new Error(`Anthropic API returned ${response.status}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';

    let queries;
    try {
      queries = JSON.parse(text);
      if (!Array.isArray(queries) || queries.length < 4) {
        throw new Error('Invalid format');
      }
    } catch {
      // Fallback: derive queries from the title
      const words = (title || 'editorial photography').split(/\s+/).filter(w => w.length > 3);
      queries = [
        words.slice(0, 2).join(' ') || 'editorial workspace',
        words[Math.floor(words.length / 2)] || 'dramatic light',
        'cinematic texture',
        'urban architecture'
      ];
      console.warn('Claude response parse failed, using fallback queries:', queries);
    }

    res.json({ queries });
  } catch (err) {
    console.error('Query generation error:', err.message);

    // Fallback queries on error
    const words = (title || 'editorial photography').split(/\s+/).filter(w => w.length > 3);
    const queries = [
      words.slice(0, 2).join(' ') || 'editorial workspace',
      words[Math.floor(words.length / 2)] || 'dramatic light',
      'cinematic texture',
      'urban architecture'
    ];

    res.json({ queries, fallback: true });
  }
});

// GET /api/keys — report which keys are configured (boolean flags only)
app.get('/api/keys', (req, res) => {
  res.json({
    claude: !!process.env.ANTHROPIC_API_KEY,
    unsplash: !!process.env.UNSPLASH_ACCESS_KEY,
    pexels: !!process.env.PEXELS_API_KEY,
    serper: !!process.env.SERPER_API_KEY
  });
});

// GET /api/image-keys — provide image source keys to the frontend
// These are client-side API keys meant for browser use
app.get('/api/image-keys', (req, res) => {
  res.json({
    unsplash: process.env.UNSPLASH_ACCESS_KEY || '',
    pexels: process.env.PEXELS_API_KEY || ''
  });
});

// GET /api/serper — proxy Google Image search via Serper.dev
app.get('/api/serper', async (req, res) => {
  const query = req.query.q;
  if (!query || !process.env.SERPER_API_KEY) return res.json({ results: [] });

  try {
    const serperRes = await fetch('https://google.serper.dev/images', {
      method: 'POST',
      headers: {
        'X-API-KEY': process.env.SERPER_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        q: query,
        num: 20
      })
    });

    if (!serperRes.ok) throw new Error(`Serper returned ${serperRes.status}`);
    const data = await serperRes.json();

    const results = (data.images || [])
      .filter(img => {
        if (!img.imageUrl) return false;
        const url = img.imageUrl.toLowerCase();
        if (url.includes('thumbnail') || url.includes('_thumb') || url.includes('/thumb/')) return false;
        // Use Serper's reported dimensions to filter small images
        const w = img.imageWidth || 0;
        const h = img.imageHeight || 0;
        if (w > 0 && w < 800) return false;
        if (h > 0 && h < 500) return false;
        return true;
      })
      .slice(0, 8)
      .map((img, i) => ({
        id: `google-${Date.now()}-${i}`,
        thumb: img.imageUrl,
        full: img.imageUrl,
        photographer: img.source || new URL(img.link || 'https://google.com').hostname,
        sourceUrl: img.link || img.imageUrl,
        source: 'Google'
      }));

    res.json({ results });
  } catch (err) {
    console.error('Serper search error:', err.message);
    res.json({ results: [] });
  }
});

// GET /api/loc — proxy Library of Congress image search (no CORS on loc.gov)
app.get('/api/loc', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.json({ results: [] });

  try {
    const locRes = await fetch(
      `https://www.loc.gov/photos/?q=${encodeURIComponent(query)}&fo=json&c=6`
    );
    if (!locRes.ok) throw new Error(`LOC returned ${locRes.status}`);
    const data = await locRes.json();

    const results = (data.results || [])
      .filter(item => item.image_url && item.image_url.length > 0)
      .map(item => {
        // LOC image_url array: pick the largest available
        const imageUrls = item.image_url || [];
        const full = imageUrls.find(u => u.includes('/full/')) ||
                     imageUrls.find(u => u.endsWith('.jpg') || u.endsWith('.jpeg') || u.endsWith('.png')) ||
                     imageUrls[imageUrls.length - 1] || '';
        const thumb = imageUrls.find(u => u.includes('/pnp/') && u.includes('_s.')) ||
                      imageUrls.find(u => u.includes('thumb')) ||
                      full;

        return {
          id: `loc-${item.id || Math.random().toString(36).slice(2)}`,
          thumb: thumb.startsWith('//') ? `https:${thumb}` : thumb,
          full: full.startsWith('//') ? `https:${full}` : full,
          photographer: (item.creator || item.contributor || 'Library of Congress').toString(),
          sourceUrl: item.url || item.link || 'https://www.loc.gov',
          source: 'LOC'
        };
      })
      .filter(r => r.full);

    res.json({ results });
  } catch (err) {
    console.error('LOC search error:', err.message);
    res.json({ results: [] });
  }
});

// Content directory — now co-located inside the sequence repo at tools/image-sourcer/
const CONTENT_DIR = path.resolve(__dirname, '../../content');
console.log('Content directory:', CONTENT_DIR, '| exists:', fs.existsSync(CONTENT_DIR));

// Helper: parse MDX file and extract frontmatter + body
function parseMdx(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) return null;
  const fm = fmMatch[1];
  const body = content.slice(fmMatch[0].length);
  return { fm, body, raw: content };
}

// Helper: extract image slots from an MDX file
function extractImageSlots(type, fm, body) {
  const slots = [];

  // Every content type has a hero
  const heroImage = fm.match(/^heroImage:\s*"?(.+?)"?\s*$/m)?.[1] || '';
  const heroAlt = fm.match(/^heroAlt:\s*"?(.+?)"?\s*$/m)?.[1] || '';
  slots.push({ role: 'hero', label: 'Hero Image', current: heroImage, currentAlt: heroAlt });

  if (type === 'case-studies') {
    // Case studies have a secondary image (below timeline) and a cover
    const secondaryImage = fm.match(/^secondaryImage:\s*"?(.+?)"?\s*$/m)?.[1] || '';
    const secondaryAlt = fm.match(/^secondaryAlt:\s*"?(.+?)"?\s*$/m)?.[1] || '';
    const coverImage = fm.match(/^coverImage:\s*"?(.+?)"?\s*$/m)?.[1] || '';
    slots.push({ role: 'secondary', label: 'Secondary (below timeline)', current: secondaryImage, currentAlt: secondaryAlt });
    slots.push({ role: 'cover', label: 'Cover / Card Image', current: coverImage, currentAlt: '' });
  }

  if (type === 'articles') {
    // Articles have inline images via <ArticleImage slot="N" />
    const slotMatches = [...body.matchAll(/<ArticleImage\s+slot="(\d+)"/g)];
    // Also parse existing images array from frontmatter
    const existingImages = [];
    const imagesMatch = fm.match(/^(images:\n(?:[ \t]+.*\n)*)/m);
    if (imagesMatch) {
      const entries = imagesMatch[0].matchAll(/- src:\s*"([^"]+)"\s*\n\s*alt:\s*"([^"]*)"\s*\n\s*type:\s*(\w+)\s*\n\s*caption:\s*"([^"]*)"(?:\s*\n\s*credit:\s*"([^"]*)")?/g);
      for (const e of entries) {
        existingImages.push({ src: e[1], alt: e[2], type: e[3], caption: e[4], credit: e[5] || '' });
      }
    }

    // Extract rich surrounding context for each slot:
    // Nearest heading above + two paragraphs before, then heading + two paragraphs after
    const bodyLines = body.split('\n');
    const stripTags = (s) => s.replace(/<[^>]+>/g, '').trim();
    const isHeading = (l) => /^#{1,4}\s|^<Subhead>|^<Section\s/.test(l.trim());
    const isParagraph = (l) => {
      const t = l.trim();
      return t.length > 20 && !t.startsWith('<') && !t.startsWith('#') && !t.startsWith('---');
    };

    for (const match of slotMatches) {
      const slotNum = parseInt(match[1], 10);
      const lineIdx = bodyLines.findIndex(l => l.includes(match[0]));

      // Walk backward: find nearest heading, then collect up to 2 paragraphs
      let nearestHeading = '';
      const parasBefore = [];
      for (let i = lineIdx - 1; i >= 0 && parasBefore.length < 2; i--) {
        const line = bodyLines[i];
        if (isHeading(line) && !nearestHeading) {
          nearestHeading = stripTags(line);
        } else if (isParagraph(line)) {
          parasBefore.unshift(stripTags(line));
        }
      }

      // Walk forward: find next heading, then collect up to 2 paragraphs
      let nextHeading = '';
      const parasAfter = [];
      for (let i = lineIdx + 1; i < bodyLines.length && parasAfter.length < 2; i++) {
        const line = bodyLines[i];
        if (isHeading(line) && !nextHeading) {
          nextHeading = stripTags(line);
        } else if (isParagraph(line)) {
          parasAfter.push(stripTags(line));
        }
      }

      // Build rich context string
      const parts = [];
      if (nearestHeading) parts.push(`[${nearestHeading}]`);
      if (parasBefore.length) parts.push(parasBefore.join(' '));
      parts.push('[IMAGE]');
      if (nextHeading) parts.push(`[${nextHeading}]`);
      if (parasAfter.length) parts.push(parasAfter.join(' '));

      const existing = existingImages[slotNum - 1] || {};
      slots.push({
        role: `slot-${slotNum}`,
        label: `Inline Image ${slotNum}`,
        current: existing.src || '',
        currentAlt: existing.alt || '',
        imageType: existing.type || 'breakout',
        caption: existing.caption || '',
        context: parts.join(' ').slice(0, 500)
      });
    }
  }

  return slots;
}

// GET /api/content — list MDX files available for image injection
app.get('/api/content', (req, res) => {
  const types = ['articles', 'case-studies', 'structures'];
  const files = [];

  for (const type of types) {
    const dir = path.join(CONTENT_DIR, type);
    if (!fs.existsSync(dir)) continue;
    const entries = fs.readdirSync(dir).filter(f => f.endsWith('.mdx'));
    for (const file of entries) {
      try {
        const parsed = parseMdx(path.join(dir, file));
        if (!parsed) continue;
        const { fm, body } = parsed;
        const title = fm.match(/^title:\s*"?(.+?)"?\s*$/m)?.[1] || file;
        const slug = fm.match(/^slug:\s*(.+)$/m)?.[1] || file.replace('.mdx', '');
        const heroImage = fm.match(/^heroImage:\s*"?(.+?)"?\s*$/m)?.[1] || '';
        const coverImage = fm.match(/^coverImage:\s*"?(.+?)"?\s*$/m)?.[1] || '';
        const excerpt = fm.match(/^excerpt:\s*"?(.+?)"?\s*$/m)?.[1] || '';
        const slots = extractImageSlots(type, fm, body);
        files.push({
          type,
          file,
          path: path.join(type, file),
          title: title.replace(/^"|"$/g, '').replace(/<br\s*\/?>/gi, ' '),
          slug,
          heroImage,
          coverImage,
          excerpt,
          slots,
          filledSlots: slots.filter(s => s.current).length,
          totalSlots: slots.length
        });
      } catch {}
    }
  }

  files.sort((a, b) => a.title.localeCompare(b.title));
  res.json({ files });
});

// GET /api/content/analyze/:type/:file — deep analysis of a single content file
app.get('/api/content/analyze/:type/:file', (req, res) => {
  const { type, file } = req.params;
  const fullPath = path.join(CONTENT_DIR, type, file);
  if (!fullPath.startsWith(CONTENT_DIR)) return res.status(403).json({ error: 'Invalid path' });
  if (!fs.existsSync(fullPath)) return res.status(404).json({ error: 'File not found' });

  try {
    const parsed = parseMdx(fullPath);
    if (!parsed) return res.status(400).json({ error: 'No frontmatter' });
    const { fm, body } = parsed;
    const title = fm.match(/^title:\s*"?(.+?)"?\s*$/m)?.[1] || file;
    const excerpt = fm.match(/^excerpt:\s*"?(.+?)"?\s*$/m)?.[1] || '';
    const discipline = fm.match(/^discipline:\s*"?(.+?)"?\s*$/m)?.[1] || '';
    const slots = extractImageSlots(type, fm, body);

    res.json({ type, file, title, excerpt, discipline, slots });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Helper: remove a frontmatter field entirely
function removeFmField(fm, field) {
  const regex = new RegExp(`^${field}:.*\n?`, 'm');
  return fm.replace(regex, '');
}

// Helper: update or insert a frontmatter field
function upsertFmField(fm, field, value) {
  const regex = new RegExp(`^${field}:.*$`, 'm');
  if (regex.test(fm)) {
    return fm.replace(regex, `${field}: "${value}"`);
  }
  return fm + `\n${field}: "${value}"`;
}

// Helper: insert a field after another field in frontmatter (upserts if exists)
function insertFmAfter(fm, afterField, field, value) {
  // If field already exists, update it
  const existsRegex = new RegExp(`^${field}:.*$`, 'm');
  if (existsRegex.test(fm)) {
    return fm.replace(existsRegex, `${field}: "${value}"`);
  }
  // Otherwise insert after the target field
  const afterRegex = new RegExp(`^(${afterField}:.*)$`, 'm');
  if (afterRegex.test(fm)) {
    return fm.replace(afterRegex, `$1\n${field}: "${value}"`);
  }
  return fm + `\n${field}: "${value}"`;
}

// Helper: build or replace the images: array in article frontmatter
function upsertImagesArray(fm, images) {
  // Build the YAML array
  const yamlEntries = images.map(img => {
    let entry = `  - src: "${img.src}"\n    alt: "${img.alt || ''}"\n    type: ${img.type || 'breakout'}\n    caption: "${img.caption || ''}"`;
    if (img.credit) entry += `\n    credit: "${img.credit}"`;
    return entry;
  }).join('\n');
  const yamlBlock = `images:\n${yamlEntries}`;

  // Replace existing images: block or append
  const imagesRegex = /^images:\n(?:[ \t]+.*\n)*/m;
  if (imagesRegex.test(fm)) {
    return fm.replace(imagesRegex, yamlBlock + '\n');
  }
  return fm + '\n' + yamlBlock;
}

// POST /api/content/update — write image URLs into MDX frontmatter
// Now supports: heroImage, heroAlt, coverImage, secondaryImage, secondaryAlt, and images[] array
app.post('/api/content/update', (req, res) => {
  const { filePath, slots } = req.body;

  if (!filePath) return res.status(400).json({ error: 'filePath required' });

  const fullPath = path.join(CONTENT_DIR, filePath);
  if (!fullPath.startsWith(CONTENT_DIR)) {
    return res.status(403).json({ error: 'Invalid path' });
  }

  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    const fmMatch = content.match(/^(---\n)([\s\S]*?)(\n---)/);
    if (!fmMatch) {
      return res.status(400).json({ error: 'No frontmatter found' });
    }

    let fm = fmMatch[2];

    // Also support the old API shape for backwards compatibility
    if (!slots && (req.body.heroImage || req.body.coverImage)) {
      if (req.body.heroImage) {
        fm = upsertFmField(fm, 'heroImage', req.body.heroImage);
        if (req.body.heroAlt) fm = insertFmAfter(fm, 'heroImage', 'heroAlt', req.body.heroAlt);
      }
      if (req.body.coverImage) fm = upsertFmField(fm, 'coverImage', req.body.coverImage);
      content = fmMatch[1] + fm + fmMatch[3] + content.slice(fmMatch[0].length);
      fs.writeFileSync(fullPath, content, 'utf8');
      return res.json({ success: true, updated: filePath });
    }

    if (!slots || !Array.isArray(slots)) {
      return res.status(400).json({ error: 'slots array required' });
    }

    // Collect inline image slots for articles
    const inlineImages = [];

    for (const slot of slots) {
      if (!slot.src) continue;

      switch (slot.role) {
        case 'hero':
          fm = upsertFmField(fm, 'heroImage', slot.src);
          if (slot.credit) fm = insertFmAfter(fm, 'heroImage', 'heroCredit', slot.credit);
          if (slot.alt) fm = insertFmAfter(fm, 'heroImage', 'heroAlt', slot.alt);
          if (slot.position) {
            fm = insertFmAfter(fm, 'heroAlt', 'heroPosition', slot.position);
          } else {
            fm = removeFmField(fm, 'heroPosition');
          }
          break;
        case 'secondary':
          fm = upsertFmField(fm, 'secondaryImage', slot.src);
          if (slot.credit) fm = insertFmAfter(fm, 'secondaryImage', 'secondaryCredit', slot.credit);
          if (slot.alt) fm = insertFmAfter(fm, 'secondaryImage', 'secondaryAlt', slot.alt);
          if (slot.position) {
            fm = insertFmAfter(fm, 'secondaryAlt', 'secondaryPosition', slot.position);
          } else {
            fm = removeFmField(fm, 'secondaryPosition');
          }
          break;
        case 'cover':
          fm = upsertFmField(fm, 'coverImage', slot.src);
          break;
        default:
          // slot-1, slot-2, etc. — inline article images
          if (slot.role.startsWith('slot-')) {
            const idx = parseInt(slot.role.split('-')[1], 10) - 1;
            inlineImages[idx] = {
              src: slot.src,
              alt: slot.alt || '',
              type: slot.imageType || 'breakout',
              caption: slot.caption || '',
              credit: slot.credit || ''
            };
          }
      }
    }

    // Write inline images array if any
    if (inlineImages.length > 0) {
      // Merge with existing images that weren't updated
      const existingImages = [];
      // Match images: block up to next top-level field (non-indented line starting with a letter), or end of string
      const existingMatch = fm.match(/^images:\n((?:[ \t]+.*\n?)*)/m);
      if (existingMatch) {
        const entries = [...existingMatch[0].matchAll(/- src:\s*"([^"]+)"\s*\n\s*alt:\s*"([^"]*)"\s*\n\s*type:\s*(\w+)\s*\n\s*caption:\s*"([^"]*)"(?:\s*\n\s*credit:\s*"([^"]*)")?/g)];
        for (const e of entries) {
          existingImages.push({ src: e[1], alt: e[2], type: e[3], caption: e[4], credit: e[5] || '' });
        }
      }
      // Merge: new images override, existing fill gaps
      const maxSlot = Math.max(inlineImages.length, existingImages.length);
      const merged = [];
      for (let i = 0; i < maxSlot; i++) {
        merged.push(inlineImages[i] || existingImages[i] || { src: '', alt: '', type: 'breakout', caption: '' });
      }
      fm = upsertImagesArray(fm, merged.filter(img => img.src));
    }

    content = fmMatch[1] + fm + fmMatch[3] + content.slice(fmMatch[0].length);
    fs.writeFileSync(fullPath, content, 'utf8');

    res.json({ success: true, updated: filePath, slotCount: slots.filter(s => s.src).length });
  } catch (err) {
    console.error('Content update error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// MEDIA SOURCING — download real imagery / video / screen-recordings of a
// case-study subject into the Remotion work/ pile, behind a human review gate.
// ─────────────────────────────────────────────────────────────────────────────

// ── Search adapters (normalized → { full, thumb, kind, source, sourceUrl, licenseGuess, width, height }) ──
async function searchSerper(query, num = 6, minW = 800, minH = 500) {
  if (!process.env.SERPER_API_KEY) return [];
  try {
    const r = await fetch('https://google.serper.dev/images', {
      method: 'POST',
      headers: { 'X-API-KEY': process.env.SERPER_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query, num: Math.max(20, num) }),
    });
    if (!r.ok) return [];
    const data = await r.json();
    return (data.images || [])
      .filter((img) => {
        if (!img.imageUrl) return false;
        const u = img.imageUrl.toLowerCase();
        if (u.includes('thumbnail') || u.includes('_thumb') || u.includes('/thumb/')) return false;
        const w = img.imageWidth || 0, h = img.imageHeight || 0;
        if (w > 0 && w < minW) return false;
        if (h > 0 && h < minH) return false;
        return true;
      })
      .slice(0, num)
      .map((img) => ({
        full: img.imageUrl,
        thumb: img.imageUrl,
        kind: 'image',
        source: img.source || 'Google',
        sourceUrl: img.link || img.imageUrl,
        licenseGuess: 'editorial / unverified',
        width: img.imageWidth || 0,
        height: img.imageHeight || 0,
      }));
  } catch { return []; }
}

async function searchCommons(query, num = 6) {
  try {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=${num}&prop=imageinfo&iiprop=url|size|mime|extmetadata&iiurlwidth=400`;
    const r = await fetch(url, { headers: { 'User-Agent': 'SeqImageSourcer/1.0 (editorial research)' } });
    if (!r.ok) return [];
    const data = await r.json();
    const pages = data.query?.pages ? Object.values(data.query.pages) : [];
    return pages
      .map((p) => p.imageinfo?.[0])
      .filter(Boolean)
      .map((ii) => ({
        full: ii.url,
        thumb: ii.thumburl || ii.url,
        kind: (ii.mime || '').startsWith('video') ? 'video' : 'image',
        source: 'Wikimedia Commons',
        sourceUrl: ii.descriptionurl || ii.url,
        licenseGuess: ii.extmetadata?.LicenseShortName?.value || 'Wikimedia Commons',
        width: ii.width || 0,
        height: ii.height || 0,
      }));
  } catch { return []; }
}

async function searchPexelsVideo(query, num = 24) {
  if (!process.env.PEXELS_API_KEY) return [];
  try {
    const r = await fetch(`https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${Math.min(80, num)}`, {
      headers: { Authorization: process.env.PEXELS_API_KEY },
    });
    if (!r.ok) return [];
    const data = await r.json();
    return (data.videos || []).map((v) => {
      // prefer an HD file that isn't oversized (≤1920w) for fast hover-preview
      const files = (v.video_files || []).filter((f) => f.file_type === 'video/mp4').sort((a, b) => (a.width || 0) - (b.width || 0));
      const pick = files.find((f) => (f.width || 0) >= 1280 && (f.width || 0) <= 1920) || files[files.length - 1] || files[0];
      return pick && {
        full: pick.link, thumb: v.image, kind: 'video', previewable: true,
        source: 'Pexels', sourceUrl: v.url, licenseGuess: 'Pexels (free, no attribution required)',
        width: pick.width || 0, height: pick.height || 0,
      };
    }).filter(Boolean);
  } catch { return []; }
}

// Second free stock-video source (broadens b-roll beyond Pexels). Gated on
// PIXABAY_API_KEY (free at https://pixabay.com/api/docs/). No key → returns [].
async function searchPixabayVideo(query, num = 16) {
  if (!process.env.PIXABAY_API_KEY) return [];
  try {
    const r = await fetch(`https://pixabay.com/api/videos/?key=${process.env.PIXABAY_API_KEY}&q=${encodeURIComponent(query)}&per_page=${Math.min(50, Math.max(3, num))}`);
    if (!r.ok) return [];
    const data = await r.json();
    return (data.hits || []).map((h) => {
      const f = h.videos?.medium || h.videos?.large || h.videos?.small;
      return f && f.url && {
        full: f.url,
        thumb: `https://i.vimeocdn.com/video/${h.picture_id}_295x166.jpg`,
        kind: 'video', previewable: true,
        source: 'Pixabay', sourceUrl: h.pageURL || f.url, licenseGuess: 'Pixabay (free, no attribution required)',
        width: f.width || 0, height: f.height || 0,
      };
    }).filter(Boolean);
  } catch { return []; }
}

async function searchYouTube(query, num = 3) {
  if (!process.env.YOUTUBE_API_KEY) return [];
  try {
    const r = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=${num}&q=${encodeURIComponent(query)}&key=${process.env.YOUTUBE_API_KEY}`);
    if (!r.ok) return [];
    const data = await r.json();
    return (data.items || []).filter((it) => it.id?.videoId).map((it) => ({
      full: `https://www.youtube.com/watch?v=${it.id.videoId}`,
      thumb: it.snippet?.thumbnails?.medium?.url || '',
      kind: 'video',
      source: `YouTube · ${it.snippet?.channelTitle || ''}`.trim(),
      sourceUrl: `https://www.youtube.com/watch?v=${it.id.videoId}`,
      licenseGuess: 'YouTube — verify rights (TOS prohibits download)',
      width: 0,
      height: 0,
    }));
  } catch { return []; }
}

// Serper video search — finds video pages (YouTube/Vimeo/news) to SCREEN-RECORD
// (no YouTube API needed). Used by the 'rec-video' kind.
async function searchSerperVideos(query, num = 4) {
  if (!process.env.SERPER_API_KEY) return [];
  try {
    const r = await fetch('https://google.serper.dev/videos', {
      method: 'POST',
      headers: { 'X-API-KEY': process.env.SERPER_API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query, num: 10 }),
    });
    if (!r.ok) return [];
    const data = await r.json();
    return (data.videos || []).filter((v) => v.link).slice(0, num).map((v) => ({
      full: v.link,
      thumb: v.imageUrl || '',
      kind: 'video',
      source: v.source || v.channel || 'video',
      sourceUrl: v.link,
      licenseGuess: 'screen capture of published video',
    }));
  } catch { return []; }
}

// thin pass-through endpoints (re-search from the UI / manual use)
app.get('/api/commons', async (req, res) => res.json({ results: await searchCommons(req.query.q || '', 8) }));
app.get('/api/pexels-video', async (req, res) => res.json({ results: await searchPexelsVideo(req.query.q || '', 6) }));
app.get('/api/youtube', async (req, res) => res.json({ results: await searchYouTube(req.query.q || '', 6) }));
app.get('/api/serper-video', async (req, res) => res.json({ results: await searchSerperVideos(req.query.q || '', 8) }));

// Build a sourcing plan for a case-study subject (Claude, one forced tool call).
async function buildMediaPlan(slug) {
  const file = path.join(CONTENT_DIR, 'case-studies', `${slug}.mdx`);
  if (!fs.existsSync(file)) throw new Error(`case study not found: ${slug}`);
  const parsed = parseMdx(file);
  const fm = parsed.fm;
  const title = (fm.match(/^title:\s*"?(.+?)"?\s*$/m)?.[1] || slug).replace(/<br\s*\/?>(?=)/gi, ' ');
  const excerpt = fm.match(/^excerpt:\s*"?(.+?)"?\s*$/m)?.[1] || '';
  const discipline = fm.match(/^discipline:\s*"?(.+?)"?\s*$/m)?.[1] || '';
  const data = await callClaude({
    system: prompts.MEDIA_PLAN_SYSTEM,
    tools: [prompts.MEDIA_PLAN_TOOL],
    tool_choice: { type: 'tool', name: 'emit_media_plan' },
    max_tokens: 1500,
    messages: [{ role: 'user', content: `Title: ${title}\nDiscipline: ${discipline}\nDescription: ${excerpt}` }],
  });
  const plan = data.content?.find((b) => b.type === 'tool_use')?.input;
  if (!plan) throw new Error('Claude returned no media plan');
  media.writePlan(slug, plan); // persist for enrichment + coverage
  return plan;
}

// ── Tier-B enrichment: describe one approved asset to the assets.json contract ──
async function enrichAsset(slug, manifestEntry) {
  const base = media.toAssetBase(slug, manifestEntry);
  if (!CLAUDE_KEY) return base; // graceful: deterministic-only entry
  const plan = media.readPlan(slug) || {};
  const entities = plan.entities || [];
  const isImg = manifestEntry.kind === 'image';
  const content = [{
    type: 'text',
    text: [
      `Subject: ${plan.subject_name || slug}.`,
      entities.length ? `Known entities (use these keys for "entity"): ${entities.map((e) => `${e.key} (${e.label})`).join(', ')}.` : '',
      `Asset hint — kind:${base.kind}, source:${manifestEntry.source || ''}, search query:"${manifestEntry.query || ''}".`,
      isImg ? 'Image follows.' : 'This is a VIDEO/screen-recording asset (no frame provided) — infer from the query/source; focalPoint can stay {0.5,0.5}.',
    ].filter(Boolean).join('\n'),
  }];
  if (isImg) {
    try {
      const abs = path.join(media.remotionPublicDir(), manifestEntry.workFile || manifestEntry.file);
      const buf = fs.readFileSync(abs);
      const ext = path.extname(abs).toLowerCase();
      const mt = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
      content.push({ type: 'image', source: { type: 'base64', media_type: mt, data: buf.toString('base64') } });
    } catch { /* fall through to text-only */ }
  }
  try {
    const data = await callClaude({
      system: prompts.ASSET_ENRICH_SYSTEM,
      tools: [prompts.ASSET_ENRICH_TOOL],
      tool_choice: { type: 'tool', name: 'emit_asset_meta' },
      max_tokens: 600,
      messages: [{ role: 'user', content }],
    });
    const m = data.content?.find((b) => b.type === 'tool_use')?.input;
    if (m) {
      if (m.kind) base.kind = m.kind;            // portrait role wins only if vision agrees; otherwise refine
      if (manifestEntry.role === 'portrait') base.kind = 'portrait';
      if (m.caption) base.caption = m.caption;
      if (m.tags?.length) base.tags = m.tags;
      if (m.entity) base.entity = m.entity;
      if (m.era) base.era = m.era;
      if (m.focalPoint && typeof m.focalPoint.x === 'number') base.focalPoint = { x: m.focalPoint.x, y: m.focalPoint.y };
      if (typeof m.quality === 'number') base.quality = m.quality;
    }
  } catch (err) {
    console.warn('  enrich skipped:', err.message);
  }
  return base;
}

// Recompute coverage.json from the current assets.json + plan entities.
function recomputeCoverage(slug) {
  const plan = media.readPlan(slug) || {};
  const assets = media.readAssets(slug).assets || [];
  const entities = {};
  for (const e of (plan.entities || [])) {
    const imgs = assets.filter((a) => a.entity === e.key && a.type === 'image').length;
    const vids = assets.filter((a) => a.entity === e.key && a.type === 'video').length;
    const total = imgs + vids;
    entities[e.key] = { images: imgs, videos: vids, strength: total === 0 ? 'missing' : total === 1 ? 'thin' : 'good' };
  }
  const coverage = {
    entities,
    needsPortrait: !assets.some((a) => a.kind === 'portrait'),
    needsBRoll: !assets.some((a) => a.kind === 'b-roll'),
  };
  media.writeCoverage(slug, coverage);
  return coverage;
}

app.post('/api/media/plan', async (req, res) => {
  try {
    res.json({ plan: await buildMediaPlan(req.body.slug) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Read the persisted plan (entities + queries) WITHOUT a Claude call — for the
// UI query chips. Returns { plan: null } if the case hasn't been planned yet.
app.get('/api/media/plan/:slug', (req, res) => {
  res.json({ plan: media.readPlan(req.params.slug) });
});

// Browse search — return MANY candidate results (thumbnails) WITHOUT downloading,
// so you can pick like a Google Images grid. `query` searches that term; omit it
// (with slug) to run the plan's queries. kind: 'image' | 'video'.
app.post('/api/media/search', async (req, res) => {
  const { query, kind = 'image', slug } = req.body || {};
  try {
    let queries = [];
    if (query && query.trim()) queries = [query.trim()];
    else if (slug) {
      const p = media.readPlan(slug) || {};
      queries = (kind === 'video' ? p.video_queries : kind === 'broll' ? p.broll_queries : p.image_queries) || [];
    }
    queries = queries.slice(0, 8);
    const seen = new Set((slug ? media.readManifest(slug) : []).map((e) => e.sourceUrl).filter(Boolean));
    const dedup = new Set();
    const out = [];
    for (const q of queries) {
      let rows;
      if (kind === 'broll') {
        // stock-only: Pexels + Pixabay (both direct files, downloaded on click)
        const px = (await searchPexelsVideo(q, 24)).map((r) => ({ ...r, addAction: 'video-file' }));
        const pb = (await searchPixabayVideo(q, 16)).map((r) => ({ ...r, addAction: 'video-file' }));
        rows = [...px, ...pb];
      } else if (kind === 'video') {
        // web videos of the subject → screen-record on click
        rows = (await searchSerperVideos(q, 12)).map((r) => ({ ...r, addAction: 'screenrec-video' }));
      } else {
        rows = [...(await searchSerper(q, 20, 500, 350)), ...(await searchCommons(q, 4)).filter((r) => r.kind === 'image')]
          .map((r) => ({ ...r, addAction: 'image' }));
      }
      for (const r of rows) {
        if (!r.sourceUrl || dedup.has(r.sourceUrl)) continue;
        dedup.add(r.sourceUrl);
        out.push({ ...r, query: q, inManifest: seen.has(r.sourceUrl) });
      }
    }
    res.json({ kind, count: out.length, results: out });
  } catch (err) {
    console.error('media/search error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Add ONE picked/pasted item: download or screen-record it into staging +
// manifest. Covers grid picks AND manual URL paste. action:
//   image · screenrec-video (capture a playing video) · screenrec-page (scroll a
//   site) · video-file (direct download).
app.post('/api/media/add', async (req, res) => {
  const { slug, url, action = 'image', query = '', source = '', sourceUrl = '', licenseGuess = '' } = req.body || {};
  if (!slug || !url) return res.status(400).json({ error: 'slug + url required' });
  const manifest = media.readManifest(slug);
  // de-dupe: screenrec-video produces several clips per video (unique per-clip
  // sourceUrls), so match on the original video URL; everything else by sourceUrl.
  const dup = action === 'screenrec-video'
    ? manifest.some((e) => e.videoUrl === url || (e.sourceUrl || '').startsWith(url + '#'))
    : new Set(manifest.map((e) => e.sourceUrl)).has(sourceUrl || url);
  if (dup) return res.json({ success: true, duplicate: true });
  try {
    let entries; // screenRecordVideo returns several clips; others one
    if (action === 'image') {
      // deliberate pick → don't reject on size
      const e = await media.downloadImage({ url, slug, query, source, sourceUrl, licenseGuess: licenseGuess || 'editorial / unverified', minW: 0, minH: 0 });
      entries = e ? [e] : [];
    } else if (action === 'screenrec-video') {
      entries = await media.screenRecordVideo({ url, slug, label: query || url, captureSec: 20, startSec: 15 });
    } else if (action === 'screenrec-page') {
      const e = await media.screenRecord({ url, slug, label: query || url, scrollSec: 10 });
      entries = e ? [e] : [];
    } else if (action === 'video-file') {
      const e = await media.downloadVideoFile({ url, slug, query, source, sourceUrl, licenseGuess: licenseGuess || 'unknown' });
      entries = e ? [e] : [];
    } else {
      return res.status(400).json({ error: `unknown action: ${action}` });
    }
    if (!entries || !entries.length) return res.status(422).json({ error: 'could not fetch (unavailable, blocked, or failed to play)' });
    const persisted = media.appendManifest(slug, entries);
    res.json({ success: true, count: persisted.length, entries: persisted, entry: persisted[0], manifest: media.readManifest(slug) });
  } catch (err) {
    console.error('media/add error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Run the full sourcing pass: search → download into work/_staging/ → manifest.
app.post('/api/media/source', async (req, res) => {
  const { slug, kinds = ['stills', 'broll'], max = 8, allowVideoDownload = false } = req.body || {};
  if (!slug) return res.status(400).json({ error: 'slug required' });
  try {
    const want = new Set(kinds);
    const plan = req.body.plan || (await buildMediaPlan(slug));
    const added = [];
    // Skip sources already in the manifest BEFORE downloading — avoids re-fetching
    // dupes that appendManifest would discard, leaving orphan files in _staging.
    const seen = new Set(media.readManifest(slug).map((e) => e.sourceUrl).filter(Boolean));
    const fresh = (url) => url && !seen.has(url) && (seen.add(url), true);

    // STILLS — Google Images (Serper) + Wikimedia Commons (free)
    if (want.has('stills')) {
      const cands = [];
      for (const q of (plan.image_queries || []).slice(0, 6)) {
        for (const r of (await searchSerper(q, 2))) cands.push({ ...r, query: q });
        for (const r of (await searchCommons(q, 1))) if (r.kind === 'image') cands.push({ ...r, query: q });
        if (cands.length >= max * 2) break;
      }
      for (const c of cands.slice(0, max)) {
        if (!fresh(c.sourceUrl)) continue;
        const e = await media.downloadImage({ url: c.full, slug, query: c.query, source: c.source, sourceUrl: c.sourceUrl, licenseGuess: c.licenseGuess });
        if (e) added.push(e);
      }
    }

    // B-ROLL — Pexels video (free, licensed)
    if (want.has('broll')) {
      for (const q of (plan.broll_queries || []).slice(0, 3)) {
        for (const r of (await searchPexelsVideo(q, 2))) {
          if (!fresh(r.sourceUrl)) continue;
          const e = await media.downloadVideoFile({ url: r.full, slug, query: q, source: r.source, sourceUrl: r.sourceUrl, licenseGuess: r.licenseGuess, kind: 'broll' });
          if (e) added.push(e);
        }
      }
    }

    // VIDEO — Commons video (direct) always; YouTube via yt-dlp only when opted-in
    if (want.has('video')) {
      for (const q of (plan.video_queries || []).slice(0, 4)) {
        for (const r of (await searchCommons(q, 2))) {
          if (r.kind !== 'video') continue;
          if (!fresh(r.sourceUrl)) continue;
          const e = await media.downloadVideoFile({ url: r.full, slug, query: q, source: r.source, sourceUrl: r.sourceUrl, licenseGuess: r.licenseGuess });
          if (e) added.push(e);
        }
      }
      if (allowVideoDownload) {
        for (const q of (plan.video_queries || []).slice(0, 2)) {
          for (const r of (await searchYouTube(q, 1))) {
            if (!fresh(r.sourceUrl)) continue;
            try {
              const e = await media.downloadVideoYtDlp({ url: r.full, slug, query: q, source: r.source, sourceUrl: r.sourceUrl });
              if (e) added.push(e);
            } catch (err) { console.warn('  video download skipped:', err.message); }
          }
        }
      }
    }

    // SCREEN RECORDINGS — scroll-capture the subject's public pages
    if (want.has('screen')) {
      for (const t of (plan.screenrec_targets || []).slice(0, 3)) {
        if (!t.url || !fresh(t.url)) continue;
        try {
          const e = await media.screenRecord({ url: t.url, slug, label: t.label || t.url, scrollSec: 10 });
          if (e) added.push(e);
        } catch (err) { console.warn('  screen recording skipped:', err.message); }
      }
    }

    // REC-VIDEO — find video pages via Serper, screen-RECORD the playing embed
    // (~20s, silent). Capped at 3 videos regardless of `max` (each is slow).
    if (want.has('rec-video')) {
      for (const q of (plan.video_queries || []).slice(0, 3)) {
        for (const r of (await searchSerperVideos(q, 1))) {
          if (!fresh(r.sourceUrl)) continue;
          try {
            const clips = await media.screenRecordVideo({ url: r.full, slug, label: q, captureSec: 20, startSec: 15 });
            added.push(...clips);
          } catch (err) { console.warn('  rec-video skipped:', err.message); }
        }
      }
    }

    const persisted = media.appendManifest(slug, added);
    res.json({ slug, plan, added: persisted, manifest: media.readManifest(slug) });
  } catch (err) {
    console.error('media/source error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/media/manifest/:slug', (req, res) => {
  res.json({ slug: req.params.slug, manifest: media.readManifest(req.params.slug), coverage: media.readCoverage(req.params.slug) });
});

app.post('/api/media/approve', async (req, res) => {
  const { slug, id, role } = req.body || {};
  try {
    // Single portrait: there's one featured/portrait.* slot, so a new portrait
    // demotes any existing approved portrait to a still (keeps the image; avoids
    // the filename collision that left stale entries pointing at an overwritten file).
    if (role === 'portrait') {
      for (const old of media.readManifest(slug).filter((x) => x.id !== id && x.status === 'approved' && x.role === 'portrait')) {
        try {
          const demoted = media.approve(slug, old.id, 'still'); // featured/portrait.* → images/<id>
          media.upsertAsset(slug, await enrichAsset(slug, demoted));
        } catch {
          media.setStatus(slug, old.id, 'rejected'); // file already gone → drop it
          media.removeAsset(slug, old.id);
        }
      }
    }
    const entry = media.approve(slug, id, role);          // move file → work/
    const asset = await enrichAsset(slug, entry);          // Claude vision → contract fields
    media.upsertAsset(slug, asset);                        // write into work/assets.json
    const coverage = recomputeCoverage(slug);              // refresh work/coverage.json
    res.json({ success: true, entry, asset, coverage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/media/reject', (req, res) => {
  const { slug, id } = req.body || {};
  try {
    const entry = media.reject(slug, id);                  // delete file + drop from assets.json
    const coverage = recomputeCoverage(slug);
    res.json({ success: true, entry, coverage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Rebuild work/assets.json + coverage.json from ALL currently-approved assets
// (re-enriches each). Use to backfill cases approved before enrichment existed.
app.post('/api/media/finalize', async (req, res) => {
  const { slug } = req.body || {};
  try {
    const approved = media.readManifest(slug).filter((e) => e.status === 'approved');
    media.writeAssets(slug, { version: 1, slug, assets: [] });
    for (const e of approved) {
      const asset = await enrichAsset(slug, e);
      media.upsertAsset(slug, asset);
    }
    const coverage = recomputeCoverage(slug);
    res.json({ success: true, count: approved.length, assets: media.readAssets(slug), coverage });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Claude vision-ranks the pending candidates → role assignments (used by --auto).
app.post('/api/media/rank', async (req, res) => {
  const { slug } = req.body || {};
  try {
    const pending = media.readManifest(slug).filter((e) => e.status === 'candidate');
    if (!pending.length) return res.json({ ranking: { portrait_id: '', still_ids: [], clip_ids: [], reject_ids: [] } });

    const content = [{ type: 'text', text: `Subject slug: ${slug}. Candidate assets follow. Assign roles by id.` }];
    let imgCount = 0;
    for (const e of pending) {
      content.push({ type: 'text', text: `id=${e.id} kind=${e.kind} dims=${e.width}x${e.height} dur=${e.durationSec}s source=${e.source} query="${e.query}"` });
      // include up to 12 image thumbnails for vision; videos/screenrecs by metadata only
      if (e.kind === 'image' && imgCount < 12) {
        try {
          const abs = path.join(media.remotionPublicDir(), e.file);
          const buf = fs.readFileSync(abs);
          const ext = path.extname(abs).toLowerCase();
          const mt = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
          content.push({ type: 'image', source: { type: 'base64', media_type: mt, data: buf.toString('base64') } });
          imgCount += 1;
        } catch {}
      }
    }
    const data = await callClaude({
      system: prompts.RANK_SYSTEM,
      tools: [prompts.RANK_TOOL],
      tool_choice: { type: 'tool', name: 'emit_ranking' },
      max_tokens: 1024,
      messages: [{ role: 'user', content }],
    });
    const ranking = data.content?.find((b) => b.type === 'tool_use')?.input || { still_ids: [], clip_ids: [] };
    res.json({ ranking });
  } catch (err) {
    console.error('media/rank error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Serve staged + work media files to the review UI. `path` is the manifest
// `file` value (relative to the Remotion public dir, e.g. cases/<slug>/work/...).
app.get('/api/media/file', (req, res) => {
  const rel = req.query.path || '';
  const root = media.remotionPublicDir();
  const target = path.resolve(root, rel);
  if (!target.startsWith(path.resolve(root))) return res.status(403).end();
  if (!fs.existsSync(target)) return res.status(404).end();
  res.sendFile(target);
});

app.listen(PORT, () => {
  console.log(`SEQ Image Sourcer running at http://localhost:${PORT}`);
  console.log(`  Claude key: ${CLAUDE_KEY ? 'configured' : 'MISSING (set SEQ_INTERNAL_ANTHROPIC_API_KEY)'}`);
  console.log(`  Remotion public dir: ${media.remotionPublicDir()}`);
});
