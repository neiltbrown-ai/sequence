// scene-renderer.ts — 3D geometric scene with extruded discs + spheres
// Canvas 2D engine: projection, Lambertian shading, soft shadows, animation loop

export interface SceneConfig {
  discShape: "circle" | "ellipse" | "rounded-rect";
  discCount: number;
  sphereCount: number;

  discColorA: string;
  discColorB: string;
  sphereColorA: string;
  sphereColorB: string;
  backgroundColor: string;

  fillOpacity: number;
  edgeOpacity: number;
  shadowOpacity: number;

  lightAngle: number;
  lightElevation: number;
  lightIntensity: number;
  ambientLight: number;

  discVelocity: number;
  sphereVelocity: number;

  tension: number;
  sphereHeight: number;
  discTilt: number;

  resolution: number;
}

export const DEFAULTS: SceneConfig = {
  discShape: "circle",
  discCount: 2,
  sphereCount: 2,

  discColorA: "#e8edf3",
  discColorB: "#f0ebe4",
  sphereColorA: "#eef1f5",
  sphereColorB: "#f2eeea",
  backgroundColor: "transparent",

  fillOpacity: 0.95,
  edgeOpacity: 0.06,
  shadowOpacity: 0.12,

  lightAngle: 315,
  lightElevation: 40,
  lightIntensity: 0.22,
  ambientLight: 0.85,

  discVelocity: 0.3,
  sphereVelocity: 1.0,

  tension: 0.5,
  sphereHeight: 0.3,
  discTilt: 15,

  resolution: 0.5,
};

// ─── Utilities ───

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// ─── 3D Types ───

interface Vec3 {
  x: number;
  y: number;
  z: number;
}

function vec3Normalize(v: Vec3): Vec3 {
  const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z) || 1;
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

function vec3Dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

// ─── Scene Objects ───

interface Disc {
  // Base position (fraction of canvas, 0-1)
  baseX: number;
  baseY: number;
  baseZ: number;
  // Current animated position
  x: number;
  y: number;
  z: number;
  // Size (fraction of canvas min dimension)
  radius: number;
  // Extrusion depth
  depth: number;
  // Color
  rgb: [number, number, number];
  // Tilt angles (radians)
  tiltX: number;
  tiltY: number;
  // Animation phase offsets
  phaseX: number;
  phaseY: number;
  freqX: number;
  freqY: number;
  ampX: number;
  ampY: number;
}

interface Sphere {
  baseX: number;
  baseY: number;
  baseZ: number;
  x: number;
  y: number;
  z: number;
  radius: number;
  rgb: [number, number, number];
  phaseX: number;
  phaseY: number;
  freqX: number;
  freqY: number;
  ampX: number;
  ampY: number;
}

// ─── Main Engine ───

export function initScene(
  canvas: HTMLCanvasElement,
  initialConfig?: Partial<SceneConfig>
): { cleanup: () => void; updateConfig: (c: Partial<SceneConfig>) => void } {
  const ctx = canvas.getContext("2d", { alpha: true })!;
  let cfg = { ...DEFAULTS, ...initialConfig };
  let w = 0;
  let h = 0;
  let dpr = 1;
  let offscreen: HTMLCanvasElement;
  let offCtx: CanvasRenderingContext2D;
  let ow = 0;
  let oh = 0;
  let running = true;
  let rafId = 0;

  // Create offscreen buffer
  offscreen = document.createElement("canvas");
  offCtx = offscreen.getContext("2d", { alpha: true })!;

  // ─── Light direction from angle + elevation ───
  function getLightDir(): Vec3 {
    const a = degToRad(cfg.lightAngle);
    const e = degToRad(cfg.lightElevation);
    return vec3Normalize({
      x: Math.cos(a) * Math.cos(e),
      y: -Math.sin(e),
      z: Math.sin(a) * Math.cos(e),
    });
  }

  // ─── Build scene objects ───
  function buildDiscs(): Disc[] {
    const colors = [hexToRgb(cfg.discColorA), hexToRgb(cfg.discColorB)];
    const tilt = degToRad(cfg.discTilt);
    const discs: Disc[] = [];

    // Tension controls overlap: 0 = far apart, 1 = heavily overlapping
    const spread = lerp(0.55, 0.15, cfg.tension);

    // Discs extend off-screen: top-left and bottom-right, like the reference image
    const positions = [
      { bx: 0.28 - spread * 0.3, by: 0.25, tiltX: tilt, tiltY: tilt * 0.3 },
      { bx: 0.72 + spread * 0.3, by: 0.75, tiltX: -tilt * 0.5, tiltY: -tilt * 0.4 },
      { bx: 0.25, by: 0.55, tiltX: tilt * 0.7, tiltY: -tilt * 0.2 },
      { bx: 0.75, by: 0.35, tiltX: -tilt * 0.3, tiltY: tilt * 0.5 },
    ];

    const count = clamp(cfg.discCount, 1, 4);
    for (let i = 0; i < count; i++) {
      const p = positions[i];
      discs.push({
        baseX: p.bx,
        baseY: p.by,
        baseZ: 0,
        x: p.bx,
        y: p.by,
        z: 0,
        radius: 0.55 - i * 0.03, // larger discs that extend off-screen
        depth: 0.04,
        rgb: colors[i % colors.length],
        tiltX: p.tiltX,
        tiltY: p.tiltY,
        phaseX: i * 1.7,
        phaseY: i * 2.3,
        freqX: 0.15 + i * 0.05,
        freqY: 0.12 + i * 0.04,
        ampX: 0.015,
        ampY: 0.012,
      });
    }
    return discs;
  }

  function buildSpheres(): Sphere[] {
    const colors = [hexToRgb(cfg.sphereColorA), hexToRgb(cfg.sphereColorB)];
    const spheres: Sphere[] = [];
    const count = clamp(cfg.sphereCount, 0, 4);

    const positions = [
      { bx: 0.46, by: 0.44 },
      { bx: 0.50, by: 0.52 },
      { bx: 0.55, by: 0.38 },
      { bx: 0.40, by: 0.60 },
    ];

    for (let i = 0; i < count; i++) {
      const p = positions[i];
      spheres.push({
        baseX: p.bx,
        baseY: p.by,
        baseZ: cfg.sphereHeight,
        x: p.bx,
        y: p.by,
        z: cfg.sphereHeight,
        radius: 0.04 - i * 0.012,
        rgb: colors[i % colors.length],
        phaseX: i * 2.1 + 0.5,
        phaseY: i * 1.4 + 0.8,
        freqX: 0.3 + i * 0.1,
        freqY: 0.25 + i * 0.08,
        ampX: 0.035,
        ampY: 0.028,
      });
    }
    return spheres;
  }

  let discs = buildDiscs();
  let spheres = buildSpheres();

  // ─── Resize ───
  function resize() {
    const parent = canvas.parentElement;
    if (!parent) return;
    dpr = window.devicePixelRatio || 1;
    w = parent.clientWidth;
    h = parent.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const res = clamp(cfg.resolution, 0.15, 1);
    ow = Math.ceil(w * res);
    oh = Math.ceil(h * res);
    offscreen.width = ow;
    offscreen.height = oh;
  }

  // ─── Render a single disc ───
  function renderDisc(
    imgData: Uint8ClampedArray,
    disc: Disc,
    lightDir: Vec3,
    minDim: number
  ) {
    // Project disc center to offscreen pixel coords
    const cx = disc.x * ow;
    const cy = disc.y * oh;
    const r = disc.radius * minDim * (ow / w); // scale to offscreen

    // Axes from tilt + shape variant
    const cosTx = Math.cos(disc.tiltX);
    let rx = r;
    let ry = r * Math.max(0.3, cosTx);
    if (cfg.discShape === "ellipse") {
      rx *= 1.3;
      ry *= 0.8;
    }
    const isRoundedRect = cfg.discShape === "rounded-rect";
    const rrRadius = r * 0.15; // corner radius for rounded-rect

    // Bounding box
    const x0 = Math.max(0, Math.floor(cx - rx - 4));
    const x1 = Math.min(ow - 1, Math.ceil(cx + rx + 4));
    const y0 = Math.max(0, Math.floor(cy - ry - 4));
    const y1 = Math.min(oh - 1, Math.ceil(cy + ry + 4));

    // Surface normal for the flat top face (tilted slightly)
    // Keep mostly pointing up (z) with subtle tilt influence for shading variation
    const topNormal = vec3Normalize({
      x: Math.sin(disc.tiltY) * 0.3,
      y: -Math.sin(disc.tiltX) * 0.3,
      z: 1,
    });

    const edgeWidth = r * 0.15; // width of the rounded edge zone (wider = softer)

    for (let py = y0; py <= y1; py++) {
      for (let px = x0; px <= x1; px++) {
        const dx = (px - cx) / rx;
        const dy = (py - cy) / ry;

        // Distance depends on shape
        let dist: number;
        if (isRoundedRect) {
          // Rounded rectangle SDF in normalized coords
          const rr = rrRadius / r;
          const qx = Math.abs(dx) - (1.0 - rr);
          const qy = Math.abs(dy) - (1.0 - rr);
          dist =
            Math.sqrt(Math.max(qx, 0) ** 2 + Math.max(qy, 0) ** 2) +
            Math.min(Math.max(qx, qy), 0);
          // Remap so 0 = center, ~1 = edge (matching the circle convention)
          dist = dist / rr + (1.0 - 1.0); // normalize: dist=0 at edge, <0 inside
          // Actually, simpler: convert SDF to 0-1 range where 1 = edge
          const sdf =
            Math.sqrt(Math.max(qx, 0) ** 2 + Math.max(qy, 0) ** 2) +
            Math.min(Math.max(qx, qy), 0);
          dist = 1.0 + sdf / rr;
        } else {
          dist = Math.sqrt(dx * dx + dy * dy);
        }

        if (dist > 1.05) continue; // outside disc

        let normal: Vec3;
        let alpha: number;

        if (dist < 1.0 - edgeWidth / r) {
          // Flat top face
          normal = topNormal;
          alpha = 1;
        } else if (dist < 1.0) {
          // Rounded edge: gentle blend from top to rim (keep mostly facing up)
          const edgeT = (dist - (1.0 - edgeWidth / r)) / (edgeWidth / r);
          const rimNormal = vec3Normalize({
            x: dx * 0.5,
            y: dy * 0.2,
            z: 0.8,
          });
          normal = vec3Normalize({
            x: lerp(topNormal.x, rimNormal.x, edgeT),
            y: lerp(topNormal.y, rimNormal.y, edgeT),
            z: lerp(topNormal.z, rimNormal.z, edgeT),
          });
          alpha = 1;
        } else {
          // Anti-alias fringe
          const fringe = smoothstep(1.05, 1.0, dist);
          normal = vec3Normalize({ x: dx * 0.4, y: dy * 0.2, z: 0.6 });
          alpha = fringe;
        }

        if (alpha < 0.01) continue;

        // Lambertian diffuse
        const ndotl = Math.max(0, vec3Dot(normal, lightDir));
        const brightness = cfg.ambientLight + ndotl * cfg.lightIntensity;

        // Edge highlight (fresnel-like)
        const edgeFactor =
          dist > 0.85
            ? smoothstep(0.85, 1.0, dist) * cfg.edgeOpacity
            : 0;

        const finalR = clamp(disc.rgb[0] * brightness + edgeFactor * 255, 0, 255);
        const finalG = clamp(disc.rgb[1] * brightness + edgeFactor * 255, 0, 255);
        const finalB = clamp(disc.rgb[2] * brightness + edgeFactor * 255, 0, 255);
        const finalA = alpha * cfg.fillOpacity * 255;

        const idx = (py * ow + px) * 4;

        // Alpha-composite over existing pixels
        const srcA = finalA / 255;
        const dstA = imgData[idx + 3] / 255;
        const outA = srcA + dstA * (1 - srcA);
        if (outA > 0) {
          imgData[idx] = (finalR * srcA + imgData[idx] * dstA * (1 - srcA)) / outA;
          imgData[idx + 1] = (finalG * srcA + imgData[idx + 1] * dstA * (1 - srcA)) / outA;
          imgData[idx + 2] = (finalB * srcA + imgData[idx + 2] * dstA * (1 - srcA)) / outA;
          imgData[idx + 3] = outA * 255;
        }
      }
    }
  }

  // ─── Render a shadow on the disc surface ───
  function renderShadow(
    imgData: Uint8ClampedArray,
    sphere: Sphere,
    disc: Disc,
    lightDir: Vec3,
    minDim: number
  ) {
    // Project shadow: sphere pos + lightDir offset onto disc plane
    const shadowScale = 0.6; // how far the shadow is offset
    const sx = (sphere.x - lightDir.x * shadowScale * 0.1) * ow;
    const sy = (sphere.y + Math.abs(lightDir.y) * shadowScale * 0.05) * oh;
    const sr = sphere.radius * minDim * (ow / w) * 1.5; // shadow slightly larger than sphere

    const x0 = Math.max(0, Math.floor(sx - sr * 2));
    const x1 = Math.min(ow - 1, Math.ceil(sx + sr * 2));
    const y0 = Math.max(0, Math.floor(sy - sr * 2));
    const y1 = Math.min(oh - 1, Math.ceil(sy + sr * 2));

    for (let py = y0; py <= y1; py++) {
      for (let px = x0; px <= x1; px++) {
        const idx = (py * ow + px) * 4;
        // Only darken existing pixels (the disc surface)
        if (imgData[idx + 3] < 10) continue;

        const dx = px - sx;
        const dy = py - sy;
        const dist = Math.sqrt(dx * dx + dy * dy) / sr;
        if (dist > 2) continue;

        // Gaussian falloff
        const shadow = Math.exp(-dist * dist * 1.5) * cfg.shadowOpacity;
        imgData[idx] = clamp(imgData[idx] * (1 - shadow), 0, 255);
        imgData[idx + 1] = clamp(imgData[idx + 1] * (1 - shadow), 0, 255);
        imgData[idx + 2] = clamp(imgData[idx + 2] * (1 - shadow), 0, 255);
      }
    }
  }

  // ─── Render a sphere ───
  function renderSphere(
    imgData: Uint8ClampedArray,
    sphere: Sphere,
    lightDir: Vec3,
    minDim: number
  ) {
    const cx = sphere.x * ow;
    const cy = sphere.y * oh;
    const r = sphere.radius * minDim * (ow / w);

    const x0 = Math.max(0, Math.floor(cx - r - 2));
    const x1 = Math.min(ow - 1, Math.ceil(cx + r + 2));
    const y0 = Math.max(0, Math.floor(cy - r - 2));
    const y1 = Math.min(oh - 1, Math.ceil(cy + r + 2));

    for (let py = y0; py <= y1; py++) {
      for (let px = x0; px <= x1; px++) {
        const dx = (px - cx) / r;
        const dy = (py - cy) / r;
        const dist2 = dx * dx + dy * dy;

        if (dist2 > 1.1) continue;

        let alpha: number;
        if (dist2 > 1.0) {
          alpha = smoothstep(1.1, 1.0, Math.sqrt(dist2));
        } else {
          alpha = 1;
        }
        if (alpha < 0.01) continue;

        // Sphere normal
        const nz = Math.sqrt(Math.max(0, 1 - dist2));
        const normal = vec3Normalize({ x: dx, y: dy, z: nz });

        // Diffuse
        const ndotl = Math.max(0, vec3Dot(normal, lightDir));
        const brightness = cfg.ambientLight + ndotl * cfg.lightIntensity;

        // Specular (Blinn-Phong)
        const halfVec = vec3Normalize({
          x: lightDir.x,
          y: lightDir.y,
          z: lightDir.z + 1, // view direction is (0,0,1)
        });
        const spec = Math.pow(Math.max(0, vec3Dot(normal, halfVec)), 32) * 0.3;

        const finalR = clamp(sphere.rgb[0] * brightness + spec * 255, 0, 255);
        const finalG = clamp(sphere.rgb[1] * brightness + spec * 255, 0, 255);
        const finalB = clamp(sphere.rgb[2] * brightness + spec * 255, 0, 255);
        const finalA = alpha * cfg.fillOpacity * 255;

        const idx = (py * ow + px) * 4;
        const srcA = finalA / 255;
        const dstA = imgData[idx + 3] / 255;
        const outA = srcA + dstA * (1 - srcA);
        if (outA > 0) {
          imgData[idx] = (finalR * srcA + imgData[idx] * dstA * (1 - srcA)) / outA;
          imgData[idx + 1] = (finalG * srcA + imgData[idx + 1] * dstA * (1 - srcA)) / outA;
          imgData[idx + 2] = (finalB * srcA + imgData[idx + 2] * dstA * (1 - srcA)) / outA;
          imgData[idx + 3] = outA * 255;
        }
      }
    }
  }

  // ─── Animation ───
  function updatePositions(time: number) {
    const t = time * 0.001; // seconds

    for (const disc of discs) {
      disc.x =
        disc.baseX +
        Math.sin(t * disc.freqX * cfg.discVelocity + disc.phaseX) * disc.ampX;
      disc.y =
        disc.baseY +
        Math.cos(t * disc.freqY * cfg.discVelocity + disc.phaseY) * disc.ampY;
    }

    for (const sphere of spheres) {
      sphere.x =
        sphere.baseX +
        Math.sin(t * sphere.freqX * cfg.sphereVelocity + sphere.phaseX) *
          sphere.ampX;
      sphere.y =
        sphere.baseY +
        Math.cos(t * sphere.freqY * cfg.sphereVelocity + sphere.phaseY) *
          sphere.ampY;
    }
  }

  function render(time: number) {
    if (!running) return;

    updatePositions(time);

    const lightDir = getLightDir();
    const minDim = Math.min(w, h);

    // Clear offscreen
    offCtx.clearRect(0, 0, ow, oh);
    const imageData = offCtx.createImageData(ow, oh);
    const data = imageData.data;

    // Render back-to-front: discs first, then shadows, then spheres
    // Discs (back disc first based on z or index)
    for (let i = discs.length - 1; i >= 0; i--) {
      renderDisc(data, discs[i], lightDir, minDim);
    }

    // Shadows from spheres onto discs
    for (const sphere of spheres) {
      for (const disc of discs) {
        renderShadow(data, sphere, disc, lightDir, minDim);
      }
    }

    // Spheres (smaller/farther first)
    for (let i = spheres.length - 1; i >= 0; i--) {
      renderSphere(data, spheres[i], lightDir, minDim);
    }

    offCtx.putImageData(imageData, 0, 0);

    // Draw to main canvas
    ctx.clearRect(0, 0, w, h);
    if (cfg.backgroundColor !== "transparent") {
      ctx.fillStyle = cfg.backgroundColor;
      ctx.fillRect(0, 0, w, h);
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(offscreen, 0, 0, ow, oh, 0, 0, w, h);

    rafId = requestAnimationFrame(render);
  }

  // ─── Lifecycle ───
  function start() {
    running = true;
    rafId = requestAnimationFrame(render);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(rafId);
  }

  // Intersection observer — pause when not visible
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        if (!running) start();
      } else {
        stop();
      }
    },
    { threshold: 0.05 }
  );
  observer.observe(canvas);

  // Visibility change — pause when tab hidden
  function onVisibility() {
    if (document.hidden) {
      stop();
    } else if (canvas.getBoundingClientRect().top < window.innerHeight) {
      start();
    }
  }
  document.addEventListener("visibilitychange", onVisibility);

  // Resize
  function onResize() {
    resize();
  }
  window.addEventListener("resize", onResize);

  // Config update
  function updateConfig(partial: Partial<SceneConfig>) {
    cfg = { ...cfg, ...partial };

    // Rebuild objects if structural props changed
    const structuralKeys: (keyof SceneConfig)[] = [
      "discCount",
      "sphereCount",
      "discColorA",
      "discColorB",
      "sphereColorA",
      "sphereColorB",
      "tension",
      "discTilt",
      "sphereHeight",
    ];
    if (structuralKeys.some((k) => k in partial)) {
      discs = buildDiscs();
      spheres = buildSpheres();
    }

    // Resolution change needs resize
    if ("resolution" in partial) {
      resize();
    }
  }

  // Initial setup
  resize();
  start();

  function cleanup() {
    stop();
    observer.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("resize", onResize);
  }

  return { cleanup, updateConfig };
}
