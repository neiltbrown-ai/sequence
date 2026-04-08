# SEQ Image Sourcer — App Context

## What It Is
A local web app for sourcing editorial photography for the In Sequence project. You enter a content title and description, Claude generates search queries tuned to the brand's visual aesthetic, and the app pulls results from five image sources simultaneously. You browse in a grid, preview full-resolution images in a lightbox, assign roles (hero/cover/saved), and either export as markdown or write directly into your MDX content files' frontmatter.

Runs entirely on localhost. No deployment, no cloud infrastructure.

## Location
```
/Users/neilbrown/Documents/• Neil/• In Sequence/seq-image-sourcer/
```

Runs on **http://localhost:3001** (port 3001 because the main In Sequence site occupies 3000).

## Architecture
```
seq-image-sourcer/
├── server.js          — Express server: proxies APIs, serves static files, reads/writes MDX
├── public/
│   └── index.html     — Single-page app: all UI, CSS, and JS inline (~1900 lines)
├── .env               — API keys (gitignored)
├── .env.example       — Template for keys
├── package.json       — express + dotenv + cors
└── README.md
```

**Stack:** Node.js + Express (server), vanilla HTML/CSS/JS (frontend, no framework). Single self-contained HTML file with inline styles and scripts.

## Image Sources (5 total)
| Source | How it's called | API Key Required | Notes |
|--------|----------------|------------------|-------|
| **Unsplash** | Browser-direct | Yes (localStorage `seq_unsplash`) | Stock/editorial, CORS-friendly |
| **Pexels** | Browser-direct | Yes (localStorage `seq_pexels`) | Stock/editorial, CORS-friendly |
| **Google Images** (via Serper.dev) | Server-proxied (`/api/serper`) | Yes (`.env` `SERPER_API_KEY`) | Best for case studies — real people/brands. Filters images <800x500 |
| **Wikimedia Commons** | Browser-direct | None | Archival/documentary, always available |
| **Library of Congress** | Server-proxied (`/api/loc`) | None | Archival photography, no CORS |

All 5 sources are queried in parallel per search query via `Promise.all`.

## Query Generation
Claude Sonnet generates search queries via `POST /api/queries`. Two distinct prompt strategies:

**Articles/Structures/Newsletters/Social** (6 queries):
- 2 LITERAL — actual nouns and concepts from the content
- 2 METAPHORICAL — visual metaphors related to the piece's themes
- 2 TEXTURAL — abstract mood/texture queries for tone

**Case Studies** (8 queries):
- 3 IDENTITY — person/company name + visual context (e.g., "Virgil Abloh studio")
- 3 WORK & PORTFOLIO — actual output, clients, projects (e.g., "Off-White runway")
- 2 TEXTURAL — abstract mood for the case study's tone

The system prompt enforces the In Sequence visual brief: high contrast, cinematic, documentary-editorial, asymmetric composition. NOT stock photography, NOT lifestyle, NOT posed.

Fallback: if the server is offline or Claude errors, users can enter comma-separated queries manually.

## Server Endpoints
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/queries` | POST | Proxy to Anthropic API for query generation |
| `/api/keys` | GET | Boolean flags for which API keys are configured |
| `/api/image-keys` | GET | Returns Unsplash/Pexels keys for browser use |
| `/api/serper` | GET | Proxy Google Image search via Serper.dev |
| `/api/loc` | GET | Proxy Library of Congress image search |
| `/api/content` | GET | Lists all MDX files from the In Sequence site (108 files across articles, case-studies, structures) |
| `/api/content/update` | POST | Writes heroImage/heroAlt/coverImage into MDX frontmatter |

## Content Integration
The app reads from and writes to the In Sequence Next.js site's content directory:
```
../sequence/content/
├── articles/       — *.mdx
├── case-studies/   — *.mdx
└── structures/     — *.mdx
```

**Note:** macOS Unicode normalization (NFC vs NFD) causes issues with the bullet characters in the path. The server discovers the real content path at startup via Spotlight (`mdfind`) to resolve this.

The `POST /api/content/update` endpoint writes `heroImage`, `heroAlt`, and `coverImage` fields into MDX frontmatter, inserting or updating as needed.

## UI Features

### Image Selection Roles
Clicking an image opens a **lightbox** showing the full-resolution image with:
- Actual pixel dimensions displayed (e.g., "2400 x 1600px")
- Photographer name, source platform, and link to source page
- Role assignment buttons: **Hero** (gold), **Cover** (blue), **Save** (green), **Remove**

First click defaults to hero if none assigned, then cover, then saved.

### Low-Res Detection
Images that load below 800x500px in the browser get a "LOW RES" badge overlay and are dimmed. This catches compressed/upscaled images that pass the server-side filter.

### Content Blocks
Each search creates a content block showing:
- Type badge, title, excerpt
- Query sections (Q1, Q2, etc.) with the query string and source count tags
- 3-column image grid per query
- Picked count badge
- Regenerate and remove buttons

### Selection Review Panel
Appears at the bottom when any images are selected. Shows:
- Thumbnail grid grouped by content piece, with role indicators (H/C/S)
- **Export** — downloads `seq-selections.md` with full URLs, credits, roles, and a ready-to-paste YAML frontmatter snippet
- **Send to Content** — opens a modal to pick an MDX file and write hero/cover images directly into its frontmatter

### Other UI
- **Prompt editor** — collapsible panel to view/edit the system prompt (persists to localStorage)
- **Keys panel** — enter Unsplash/Pexels keys (stored in localStorage, auto-populated from server on first load)
- **Key indicators** — dots in header showing which sources are active (Claude, Unsplash, Pexels, Google, Wikimedia, LOC)
- **Manual query fallback** — comma-separated query input when server is offline

## Design System
Matches the In Sequence brand:
- Dark ground (#111111 primary, #1A1A1A cards, #2A2A2A inputs)
- Accent #C8F04B (lime/chartreuse) — used sparingly on active states
- Gold #E8D5A3 — hero image badges, secondary accent
- Blue #7EB8DA — cover image badges
- Typography: Inter (UI), IBM Plex Mono (metadata/labels/mono)
- No rounded corners beyond 2-4px, no shadows except on selected cards

## .env Keys
```
ANTHROPIC_API_KEY=sk-ant-...     # Required for query generation
UNSPLASH_ACCESS_KEY=...          # Optional, also settable in browser
PEXELS_API_KEY=...               # Optional, also settable in browser
SERPER_API_KEY=...               # Required for Google Image search
PORT=3001                        # Defaults to 3000 if not set
```

## Running
```bash
cd seq-image-sourcer
npm install
node server.js
# Open http://localhost:3001
```

## Known Limitations
- Google Image results via Serper sometimes include low-res/compressed images that pass dimension filters. The frontend flags these with "LOW RES" badges but cannot pre-filter by compression quality.
- Wikimedia Commons results are inconsistent in quality — some are archival gems, some are low-res scans.
- LOC results are best for historical/archival imagery, less useful for contemporary subjects.
- The content directory path discovery uses macOS Spotlight (`mdfind`) at startup, which won't work on other OS.
