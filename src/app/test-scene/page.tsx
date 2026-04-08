import SceneCanvas from "@/components/scene-canvas";

export default function TestScenePage() {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#f5f3f0" }}>
      <SceneCanvas
        debug
        backgroundColor="transparent"
        className="scene-canvas"
      />
      <style>{`
        .scene-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }
      `}</style>
    </div>
  );
}
