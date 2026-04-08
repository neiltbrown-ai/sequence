# SEQ Image Sourcer

Local image sourcing tool for In Sequence. Searches Unsplash + Pexels
with AI-generated queries tuned to the editorial aesthetic.

## Setup
1. `npm install`
2. `cp .env.example .env` and add your keys
3. `node server.js`
4. Open http://localhost:3000

## Keys
- Anthropic: https://console.anthropic.com
- Unsplash: https://unsplash.com/developers (New Application → Access Key)
- Pexels: https://www.pexels.com/api/ (instant on signup)

## Usage
Add a content piece (title + optional description). Claude generates
4 search queries. Results from both sources appear in a grid.
Click to select, export as markdown.
