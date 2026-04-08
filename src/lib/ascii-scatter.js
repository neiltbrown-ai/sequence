/**
 * ASCII Art Scatter — interactive particle animation
 *
 * Usage:
 *   import { initAsciiScatter } from './ascii-scatter.js';
 *
 *   const cleanup = await initAsciiScatter(
 *     document.getElementById('my-canvas'),
 *     '/path/to/ascii-art.svg',
 *     { mouseRadius: 140, colorLighten: 0.35 } // optional overrides
 *   );
 *
 *   // Later, to tear down:
 *   cleanup();
 *
 * Requirements:
 *   - PT Mono font loaded on the page (Google Fonts link or @font-face)
 *   - A <canvas> element to render into
 *   - The SVG file accessible via fetch
 */

const DEFAULTS = {
  mouseRadius: 140,
  mouseForce: 3,
  springStiffness: 0.015,
  damping: 0.92,
  velocityThreshold: 0.01,
  colorLighten: 0.35,
  fontSize: 22,
  cellHeightRatio: 0.966,
  edgeFadeCols: 6,
  edgeFadeStrength: 0.5,
  noiseCount: 300,
  noiseFontScale: 0.7,
  noisePadding: 60,
  noiseGreyMin: 210,
  noiseGreyMax: 235,
  backgroundColor: '#f5f3f0',
  fontFamily: '"PT Mono", monospace',
  padding: 40,
  scaleFit: 'contain',   // 'contain' or 'cover'
  anchorX: 'center',     // 'left', 'center', 'right'
  anchorY: 'center',     // 'top', 'center', 'bottom'
};

const GRID_STEP_X = 19.2;
const GRID_STEP_Y = 4.8;

class Particle {
  constructor(char, homeX, homeY, color, config) {
    this.char = char;
    this.homeX = homeX;
    this.homeY = homeY;
    this.x = homeX;
    this.y = homeY;
    this.vx = 0;
    this.vy = 0;
    this.color = color;
    this.config = config;
    this.radiusJitter = 0.6 + Math.random() * 0.8;
    this.forceJitter = 0.5 + Math.random() * 1.0;
    this.angleOffset = (Math.random() - 0.5) * 0.8;
  }

  update(mouseX, mouseY, mouseActive) {
    if (mouseActive) {
      const dx = this.x - mouseX;
      const dy = this.y - mouseY;
      const distSq = dx * dx + dy * dy;
      const radius = this.config.mouseRadius * this.radiusJitter;

      if (distSq < radius * radius && distSq > 0) {
        const dist = Math.sqrt(distSq);
        const force = (1 - dist / radius) * this.config.mouseForce * this.forceJitter;
        const angle = Math.atan2(dy, dx) + this.angleOffset;
        this.vx += Math.cos(angle) * force;
        this.vy += Math.sin(angle) * force;
      }
    }

    const dx = this.homeX - this.x;
    const dy = this.homeY - this.y;
    this.vx += dx * this.config.springStiffness;
    this.vy += dy * this.config.springStiffness;

    this.vx *= this.config.damping;
    this.vy *= this.config.damping;

    const speed = this.vx * this.vx + this.vy * this.vy;
    const homeDist = dx * dx + dy * dy;
    if (speed < this.config.velocityThreshold && homeDist < 0.5) {
      this.x = this.homeX;
      this.y = this.homeY;
      this.vx = 0;
      this.vy = 0;
      return;
    }

    this.x += this.vx;
    this.y += this.vy;
  }
}

function lightenColor(fill, base, extra = 0) {
  const m = fill.match(/rgb\((\d+),(\d+),(\d+)\)/);
  if (!m) return fill;
  const t = Math.min(1, base + extra);
  const r = Math.round(parseInt(m[1]) + (255 - parseInt(m[1])) * t);
  const g = Math.round(parseInt(m[2]) + (255 - parseInt(m[2])) * t);
  const b = Math.round(parseInt(m[3]) + (255 - parseInt(m[3])) * t);
  return `rgb(${r},${g},${b})`;
}

/**
 * Initialise the ASCII scatter animation.
 *
 * @param {HTMLCanvasElement} canvas  — the canvas to render into
 * @param {string}           svgUrl  — URL to the ascii-art SVG file
 * @param {object}           [opts]  — optional config overrides (see DEFAULTS)
 * @returns {Promise<() => void>}    — cleanup function to stop the animation
 */
export async function initAsciiScatter(canvas, svgUrl, opts = {}) {
  const config = { ...DEFAULTS, ...opts };
  const ctx = canvas.getContext('2d');

  // Ensure font is loaded
  const fontPreload = document.createElement('span');
  fontPreload.style.cssText = `font-family: ${config.fontFamily}; font-size: ${config.fontSize}px; position: absolute; left: -9999px; visibility: hidden;`;
  fontPreload.textContent = '@#%*+=-:.ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  document.body.appendChild(fontPreload);

  try {
    await document.fonts.load(`${config.fontSize}px ${config.fontFamily}`);
  } catch (_) { /* fall through */ }
  await document.fonts.ready;
  fontPreload.remove();

  // Load and parse SVG
  const response = await fetch(svgUrl);
  const svgText = await response.text();
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
  const textElements = svgDoc.querySelectorAll('text');

  const rawChars = [];
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  textElements.forEach(el => {
    const x = parseFloat(el.getAttribute('x'));
    const y = parseFloat(el.getAttribute('y'));
    const fill = el.getAttribute('fill');
    const char = el.textContent;
    rawChars.push({ x, y, fill, char });
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  });

  // Cell dimensions
  ctx.font = `${config.fontSize}px ${config.fontFamily}`;
  const cellWidth = ctx.measureText('M').width;
  const cellHeight = config.fontSize * config.cellHeightRatio;

  const numCols = Math.round((maxX - minX) / GRID_STEP_X) + 1;
  const numRows = Math.round((maxY - minY) / GRID_STEP_Y) + 1;
  const contentWidth = numCols * cellWidth;
  const contentHeight = numRows * cellHeight;

  // Build image particles
  const particles = [];
  rawChars.forEach(({ x, y, fill, char }) => {
    const col = (x - minX) / GRID_STEP_X;
    const row = (y - minY) / GRID_STEP_Y;
    const visualX = col * cellWidth;
    const visualY = row * cellHeight;
    const edgeExtra = col < config.edgeFadeCols
      ? (1 - col / config.edgeFadeCols) * config.edgeFadeStrength
      : 0;
    particles.push(new Particle(char, visualX, visualY, lightenColor(fill, config.colorLighten, edgeExtra), config));
  });

  // Build noise particles
  const noiseChars = ['.', ':', '-', '+', '*', '\u00B7', '\u00B0', '`', "'", ','];
  const noiseParticles = [];
  for (let i = 0; i < config.noiseCount; i++) {
    const nx = -config.noisePadding + Math.random() * (contentWidth + config.noisePadding * 2);
    const ny = -config.noisePadding + Math.random() * (contentHeight + config.noisePadding * 2);
    const char = noiseChars[Math.floor(Math.random() * noiseChars.length)];
    const g = config.noiseGreyMin + Math.floor(Math.random() * (config.noiseGreyMax - config.noiseGreyMin));
    noiseParticles.push(new Particle(char, nx, ny, `rgb(${g},${g},${g})`, config));
  }

  // Layout
  let scale = 1, offsetX = 0, offsetY = 0;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.parentElement?.clientWidth || window.innerWidth;
    const h = canvas.parentElement?.clientHeight || window.innerHeight;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';

    const availW = w - config.padding * 2;
    const availH = h - config.padding * 2;
    scale = config.scaleFit === 'cover'
      ? Math.max(availW / contentWidth, availH / contentHeight)
      : Math.min(availW / contentWidth, availH / contentHeight);

    const totalW = contentWidth * scale;
    const totalH = contentHeight * scale;

    if (config.anchorX === 'right') offsetX = w - totalW;
    else if (config.anchorX === 'left') offsetX = config.padding;
    else offsetX = (w - totalW) / 2;

    if (config.anchorY === 'bottom') offsetY = h - totalH;
    else if (config.anchorY === 'top') offsetY = config.padding;
    else offsetY = (h - totalH) / 2;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resize();
  window.addEventListener('resize', resize);

  // Mouse / touch tracking
  let mouseX = 0, mouseY = 0, mouseActive = false;

  function onMouseMove(e) {
    mouseActive = true;
    mouseX = (e.clientX - canvas.getBoundingClientRect().left - offsetX) / scale;
    mouseY = (e.clientY - canvas.getBoundingClientRect().top - offsetY) / scale;
  }
  function onMouseLeave() { mouseActive = false; }
  function onTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    mouseActive = true;
    mouseX = (touch.clientX - canvas.getBoundingClientRect().left - offsetX) / scale;
    mouseY = (touch.clientY - canvas.getBoundingClientRect().top - offsetY) / scale;
  }
  function onTouchEnd() { mouseActive = false; }

  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseleave', onMouseLeave);
  canvas.addEventListener('touchmove', onTouchMove, { passive: false });
  canvas.addEventListener('touchend', onTouchEnd);

  // Animation loop
  let rafId;
  const canvasEl = canvas;

  function draw() {
    const w = parseFloat(canvasEl.style.width);
    const h = parseFloat(canvasEl.style.height);

    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);
    ctx.textBaseline = 'alphabetic';

    // Noise layer
    ctx.font = `${config.fontSize * config.noiseFontScale}px ${config.fontFamily}`;
    for (let i = 0; i < noiseParticles.length; i++) {
      const p = noiseParticles[i];
      p.update(mouseX, mouseY, mouseActive);
      ctx.fillStyle = p.color;
      ctx.fillText(p.char, p.x, p.y);
    }

    // Image layer
    ctx.font = `${config.fontSize}px ${config.fontFamily}`;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.update(mouseX, mouseY, mouseActive);
      ctx.fillStyle = p.color;
      ctx.fillText(p.char, p.x, p.y);
    }

    ctx.restore();
    rafId = requestAnimationFrame(draw);
  }

  rafId = requestAnimationFrame(draw);

  // Return cleanup function
  return function destroy() {
    cancelAnimationFrame(rafId);
    window.removeEventListener('resize', resize);
    canvas.removeEventListener('mousemove', onMouseMove);
    canvas.removeEventListener('mouseleave', onMouseLeave);
    canvas.removeEventListener('touchmove', onTouchMove);
    canvas.removeEventListener('touchend', onTouchEnd);
  };
}
