"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { SceneConfig } from "@/lib/scene-renderer";
import { DEFAULTS } from "@/lib/scene-renderer";

export type SceneCanvasProps = Partial<SceneConfig> & {
  className?: string;
  debug?: boolean;
};

export default function SceneCanvas({
  className,
  debug = false,
  ...configProps
}: SceneCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<{
    cleanup: () => void;
    updateConfig: (c: Partial<SceneConfig>) => void;
  } | null>(null);
  const [showControls, setShowControls] = useState(debug);
  const [liveConfig, setLiveConfig] = useState<SceneConfig>({
    ...DEFAULTS,
    ...configProps,
  });

  // Keyboard toggle for debug panel
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.shiftKey && e.key === "D") {
        setShowControls((p) => !p);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Init engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let engine: typeof engineRef.current;

    (async () => {
      const { initScene } = await import("@/lib/scene-renderer");
      engine = initScene(canvas, liveConfig);
      engineRef.current = engine;
    })();

    return () => {
      engine?.cleanup();
      engineRef.current = null;
    };
    // Only re-init on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Push config updates to engine
  useEffect(() => {
    engineRef.current?.updateConfig(liveConfig);
  }, [liveConfig]);

  // Sync external prop changes
  useEffect(() => {
    setLiveConfig((prev) => ({ ...prev, ...configProps }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(configProps)]);

  const updateField = useCallback(
    <K extends keyof SceneConfig>(key: K, value: SceneConfig[K]) => {
      setLiveConfig((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <canvas ref={canvasRef} className={className} />
      {showControls && (
        <SceneControlsPanel config={liveConfig} onChange={updateField} />
      )}
    </div>
  );
}

// ─── Inline Controls Panel ───

function SceneControlsPanel({
  config,
  onChange,
}: {
  config: SceneConfig;
  onChange: <K extends keyof SceneConfig>(key: K, val: SceneConfig[K]) => void;
}) {
  const [copied, setCopied] = useState(false);

  function copyProps() {
    const lines: string[] = [];
    const def = DEFAULTS;
    for (const [k, v] of Object.entries(config)) {
      const key = k as keyof SceneConfig;
      if (JSON.stringify(v) !== JSON.stringify(def[key])) {
        if (typeof v === "string") {
          lines.push(`  ${k}="${v}"`);
        } else {
          lines.push(`  ${k}={${JSON.stringify(v)}}`);
        }
      }
    }
    const text = lines.length
      ? `<SceneCanvas\n${lines.join("\n")}\n/>`
      : `<SceneCanvas />`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div style={panelStyle}>
      <div style={panelHeaderStyle}>
        <span style={{ fontWeight: 600, fontSize: 11 }}>Scene Controls</span>
        <button onClick={copyProps} style={copyBtnStyle}>
          {copied ? "Copied!" : "Copy Props"}
        </button>
      </div>

      <Section title="Shape">
        <SelectRow
          label="Disc Shape"
          value={config.discShape}
          options={["circle", "ellipse", "rounded-rect"]}
          onChange={(v) => onChange("discShape", v as SceneConfig["discShape"])}
        />
        <SliderRow label="Disc Count" value={config.discCount} min={1} max={4} step={1} onChange={(v) => onChange("discCount", v)} />
        <SliderRow label="Sphere Count" value={config.sphereCount} min={0} max={4} step={1} onChange={(v) => onChange("sphereCount", v)} />
      </Section>

      <Section title="Colors">
        <ColorRow label="Disc A" value={config.discColorA} onChange={(v) => onChange("discColorA", v)} />
        <ColorRow label="Disc B" value={config.discColorB} onChange={(v) => onChange("discColorB", v)} />
        <ColorRow label="Sphere A" value={config.sphereColorA} onChange={(v) => onChange("sphereColorA", v)} />
        <ColorRow label="Sphere B" value={config.sphereColorB} onChange={(v) => onChange("sphereColorB", v)} />
        <ColorRow label="Background" value={config.backgroundColor === "transparent" ? "#f5f3f0" : config.backgroundColor} onChange={(v) => onChange("backgroundColor", v)} />
      </Section>

      <Section title="Opacity">
        <SliderRow label="Fill" value={config.fillOpacity} min={0} max={1} step={0.01} onChange={(v) => onChange("fillOpacity", v)} />
        <SliderRow label="Edge" value={config.edgeOpacity} min={0} max={1} step={0.01} onChange={(v) => onChange("edgeOpacity", v)} />
        <SliderRow label="Shadow" value={config.shadowOpacity} min={0} max={1} step={0.01} onChange={(v) => onChange("shadowOpacity", v)} />
      </Section>

      <Section title="Lighting">
        <SliderRow label="Angle" value={config.lightAngle} min={0} max={360} step={1} onChange={(v) => onChange("lightAngle", v)} />
        <SliderRow label="Elevation" value={config.lightElevation} min={0} max={90} step={1} onChange={(v) => onChange("lightElevation", v)} />
        <SliderRow label="Intensity" value={config.lightIntensity} min={0} max={2} step={0.05} onChange={(v) => onChange("lightIntensity", v)} />
        <SliderRow label="Ambient" value={config.ambientLight} min={0} max={1} step={0.05} onChange={(v) => onChange("ambientLight", v)} />
      </Section>

      <Section title="Motion">
        <SliderRow label="Disc Vel" value={config.discVelocity} min={0} max={3} step={0.1} onChange={(v) => onChange("discVelocity", v)} />
        <SliderRow label="Sphere Vel" value={config.sphereVelocity} min={0} max={3} step={0.1} onChange={(v) => onChange("sphereVelocity", v)} />
      </Section>

      <Section title="Spatial">
        <SliderRow label="Tension" value={config.tension} min={0} max={1} step={0.01} onChange={(v) => onChange("tension", v)} />
        <SliderRow label="Sphere Height" value={config.sphereHeight} min={0} max={1} step={0.01} onChange={(v) => onChange("sphereHeight", v)} />
        <SliderRow label="Disc Tilt" value={config.discTilt} min={0} max={45} step={1} onChange={(v) => onChange("discTilt", v)} />
      </Section>

      <Section title="Rendering">
        <SliderRow label="Resolution" value={config.resolution} min={0.15} max={1} step={0.05} onChange={(v) => onChange("resolution", v)} />
      </Section>
    </div>
  );
}

// ─── Sub-components ───

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.08em", color: "#888", marginBottom: 4 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div style={rowStyle}>
      <label style={labelStyle}>{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ flex: 1, height: 14 }}
      />
      <span style={valStyle}>{typeof value === "number" ? (Number.isInteger(step) ? value : value.toFixed(2)) : value}</span>
    </div>
  );
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div style={rowStyle}>
      <label style={labelStyle}>{label}</label>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: 24, height: 18, border: "none", padding: 0, cursor: "pointer" }}
      />
      <span style={valStyle}>{value}</span>
    </div>
  );
}

function SelectRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div style={rowStyle}>
      <label style={labelStyle}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={selectStyle}>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

// ─── Styles ───

const panelStyle: React.CSSProperties = {
  position: "absolute",
  bottom: 16,
  right: 16,
  width: 260,
  maxHeight: "80vh",
  overflowY: "auto",
  background: "rgba(20, 20, 20, 0.92)",
  color: "#ddd",
  borderRadius: 8,
  padding: "12px 14px",
  fontSize: 11,
  fontFamily: "monospace",
  zIndex: 9999,
  backdropFilter: "blur(8px)",
  border: "1px solid rgba(255,255,255,0.08)",
};

const panelHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 12,
  paddingBottom: 8,
  borderBottom: "1px solid rgba(255,255,255,0.1)",
};

const copyBtnStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.12)",
  border: "1px solid rgba(255,255,255,0.15)",
  color: "#ccc",
  fontSize: 10,
  padding: "3px 8px",
  borderRadius: 4,
  cursor: "pointer",
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  marginBottom: 3,
};

const labelStyle: React.CSSProperties = {
  width: 72,
  fontSize: 10,
  color: "#aaa",
  flexShrink: 0,
};

const valStyle: React.CSSProperties = {
  width: 44,
  fontSize: 10,
  color: "#888",
  textAlign: "right",
  flexShrink: 0,
};

const selectStyle: React.CSSProperties = {
  flex: 1,
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.12)",
  color: "#ccc",
  fontSize: 10,
  borderRadius: 3,
  padding: "2px 4px",
};
