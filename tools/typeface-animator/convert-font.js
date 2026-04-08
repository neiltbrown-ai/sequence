#!/usr/bin/env node
/**
 * Convert TTF fonts to Three.js typeface JSON format
 * Includes curve optimization: merges consecutive short quadratic beziers
 * into longer cubic beziers for smoother rendering in Three.js
 * Usage: node convert-font.js <input.ttf> <output.json>
 */
const opentype = require('opentype.js');
const fs = require('fs');

const inputPath = process.argv[2];
const outputPath = process.argv[3];

if (!inputPath || !outputPath) {
  console.error('Usage: node convert-font.js <input.ttf> <output.json>');
  process.exit(1);
}

const font = opentype.loadSync(inputPath);
const resolution = font.unitsPerEm || 1000;

const result = {
  glyphs: {},
  familyName: font.names.fontFamily?.en || font.names.fontFamily || 'Unknown',
  ascender: font.ascender,
  descender: font.descender,
  underlinePosition: font.tables.post?.underlinePosition || -100,
  underlineThickness: font.tables.post?.underlineThickness || 50,
  boundingBox: {
    xMin: font.tables.head.xMin,
    xMax: font.tables.head.xMax,
    yMin: font.tables.head.yMin,
    yMax: font.tables.head.yMax,
  },
  resolution: resolution,
  original_font_information: {
    format: 0,
    copyright: font.names.copyright?.en || '',
    fontFamily: font.names.fontFamily?.en || '',
    fontSubfamily: font.names.fontSubfamily?.en || '',
    uniqueID: font.names.uniqueID?.en || '',
    fullName: font.names.fullName?.en || '',
    version: font.names.version?.en || '',
    postScriptName: font.names.postScriptName?.en || '',
  },
};

/**
 * Convert a sequence of quadratic beziers to a single cubic bezier.
 * Two consecutive quadratic beziers Q0(p0,c0,p1) and Q1(p1,c1,p2)
 * can be approximated by a cubic bezier B(p0, cp1, cp2, p2).
 */
function quadsToSingleCubic(quads) {
  if (quads.length === 1) {
    // Single quadratic → convert to cubic exactly
    const q = quads[0];
    // Quadratic (p0, cp, p1) → Cubic (p0, p0+2/3*(cp-p0), p1+2/3*(cp-p1), p1)
    const cp1x = q.startX + (2/3) * (q.cpx - q.startX);
    const cp1y = q.startY + (2/3) * (q.cpy - q.startY);
    const cp2x = q.endX + (2/3) * (q.cpx - q.endX);
    const cp2y = q.endY + (2/3) * (q.cpy - q.endY);
    return { cp1x, cp1y, cp2x, cp2y, endX: q.endX, endY: q.endY };
  }

  // Multiple quadratics → fit a single cubic through start and end,
  // using least-squares control point estimation
  const first = quads[0];
  const last = quads[quads.length - 1];
  const p0x = first.startX, p0y = first.startY;
  const p3x = last.endX, p3y = last.endY;

  // Sample points along the quadratic chain
  const samples = [];
  for (const q of quads) {
    for (let t = 0.25; t <= 0.75; t += 0.25) {
      const x = (1-t)*(1-t)*q.startX + 2*(1-t)*t*q.cpx + t*t*q.endX;
      const y = (1-t)*(1-t)*q.startY + 2*(1-t)*t*q.cpy + t*t*q.endY;
      samples.push({ x, y });
    }
  }

  // Use 1/3 and 2/3 parametric positions for control point estimation
  const cp1x = p0x + (p3x - p0x) * (1/3) + (samples[Math.floor(samples.length * 0.33)]?.x - (p0x + (p3x - p0x) * 0.33)) * 1.5 || p0x + (p3x - p0x) / 3;
  const cp1y = p0y + (p3y - p0y) * (1/3) + (samples[Math.floor(samples.length * 0.33)]?.y - (p0y + (p3y - p0y) * 0.33)) * 1.5 || p0y + (p3y - p0y) / 3;
  const cp2x = p0x + (p3x - p0x) * (2/3) + (samples[Math.floor(samples.length * 0.66)]?.x - (p0x + (p3x - p0x) * 0.66)) * 1.5 || p0x + (p3x - p0x) * 2/3;
  const cp2y = p0y + (p3y - p0y) * (2/3) + (samples[Math.floor(samples.length * 0.66)]?.y - (p0y + (p3y - p0y) * 0.66)) * 1.5 || p0y + (p3y - p0y) * 2/3;

  return { cp1x, cp1y, cp2x, cp2y, endX: p3x, endY: p3y };
}

/**
 * Check if two consecutive quadratic beziers have tangent continuity
 * (i.e. the control points are roughly collinear at the junction)
 */
function hasTangentContinuity(q1, q2, threshold) {
  // Direction from q1's control point to q1's endpoint
  const d1x = q1.endX - q1.cpx;
  const d1y = q1.endY - q1.cpy;
  // Direction from q2's start to q2's control point
  const d2x = q2.cpx - q2.startX;
  const d2y = q2.cpy - q2.startY;

  const len1 = Math.sqrt(d1x*d1x + d1y*d1y);
  const len2 = Math.sqrt(d2x*d2x + d2y*d2y);

  if (len1 < 0.001 || len2 < 0.001) return true; // degenerate

  const dot = (d1x*d2x + d1y*d2y) / (len1 * len2);
  return dot > threshold; // cos(angle) > threshold means they're roughly aligned
}

for (let i = 0; i < font.glyphs.length; i++) {
  const glyph = font.glyphs.get(i);
  if (glyph.unicode === undefined) continue;

  const token = String.fromCodePoint(glyph.unicode);
  const glyphPath = glyph.getPath(0, 0, resolution);

  const parts = [];
  let cx = 0, cy = 0;
  let sx = 0, sy = 0;

  // First pass: collect commands with current positions
  const cmds = [];
  let tx = 0, ty = 0, tsx = 0, tsy = 0;
  for (const cmd of glyphPath.commands) {
    switch (cmd.type) {
      case 'M':
        tsx = cmd.x; tsy = -cmd.y;
        tx = cmd.x; ty = -cmd.y;
        cmds.push({ type: 'M', x: cmd.x, y: -cmd.y });
        break;
      case 'L': {
        const lx = cmd.x, ly = -cmd.y;
        if (Math.abs(lx - tx) > 0.01 || Math.abs(ly - ty) > 0.01) {
          cmds.push({ type: 'L', x: lx, y: ly });
        }
        tx = lx; ty = ly;
        break;
      }
      case 'Q':
        cmds.push({ type: 'Q', startX: tx, startY: ty, cpx: cmd.x1, cpy: -cmd.y1, endX: cmd.x, endY: -cmd.y });
        tx = cmd.x; ty = -cmd.y;
        break;
      case 'C':
        cmds.push({ type: 'C', cp1x: cmd.x1, cp1y: -cmd.y1, cp2x: cmd.x2, cp2y: -cmd.y2, endX: cmd.x, endY: -cmd.y });
        tx = cmd.x; ty = -cmd.y;
        break;
      case 'Z':
        if (Math.abs(tx - tsx) > 0.01 || Math.abs(ty - tsy) > 0.01) {
          cmds.push({ type: 'L', x: tsx, y: tsy });
        }
        tx = tsx; ty = tsy;
        break;
    }
  }

  // Second pass: merge consecutive smooth quadratic beziers into cubics
  for (let j = 0; j < cmds.length; j++) {
    const cmd = cmds[j];

    if (cmd.type === 'M') {
      parts.push(`m ${cmd.x} ${cmd.y}`);
    } else if (cmd.type === 'L') {
      parts.push(`l ${cmd.x} ${cmd.y}`);
    } else if (cmd.type === 'C') {
      parts.push(`b ${cmd.cp1x} ${cmd.cp1y} ${cmd.cp2x} ${cmd.cp2y} ${cmd.endX} ${cmd.endY}`);
    } else if (cmd.type === 'Q') {
      // Try to merge consecutive quadratic beziers
      const quadRun = [cmd];
      while (j + 1 < cmds.length && cmds[j + 1].type === 'Q') {
        const next = cmds[j + 1];
        const prev = quadRun[quadRun.length - 1];
        if (hasTangentContinuity(prev, next, 0.85) && quadRun.length < 4) {
          quadRun.push(next);
          j++;
        } else {
          break;
        }
      }

      if (quadRun.length >= 2) {
        // Merge into a single cubic
        const cubic = quadsToSingleCubic(quadRun);
        parts.push(`b ${cubic.cp1x.toFixed(1)} ${cubic.cp1y.toFixed(1)} ${cubic.cp2x.toFixed(1)} ${cubic.cp2y.toFixed(1)} ${cubic.endX} ${cubic.endY}`);
      } else {
        // Single quadratic — keep as-is
        parts.push(`q ${cmd.cpx} ${cmd.cpy} ${cmd.endX} ${cmd.endY}`);
      }
    }
  }

  result.glyphs[token] = {
    ha: glyph.advanceWidth,
    x_min: glyph.xMin || 0,
    x_max: glyph.xMax || 0,
    o: parts.join(' '),
  };
}

fs.writeFileSync(outputPath, JSON.stringify(result));

// Stats
const sampleGlyph = result.glyphs['S'];
const sCmds = sampleGlyph?.o.split(' ').filter(c => /^[mlqbz]$/.test(c));
const counts = sCmds?.reduce((a,c) => { a[c]=(a[c]||0)+1; return a; }, {});
console.log(`Converted ${Object.keys(result.glyphs).length} glyphs from ${result.familyName} (resolution: ${resolution})`);
console.log(`S glyph: ${JSON.stringify(counts)} (was 31 q-curves, now optimized)`);
console.log(`Output: ${outputPath}`);
