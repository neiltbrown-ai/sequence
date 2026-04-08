"use client";

import { useEffect, useRef } from "react";

interface AsciiScatterCanvasProps {
  className?: string;
}

export default function AsciiScatterCanvas({
  className,
}: AsciiScatterCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cleanup: (() => void) | undefined;

    (async () => {
      const { initAsciiScatter } = await import("@/lib/ascii-scatter.js");
      cleanup = await initAsciiScatter(canvas, "/ascii-art.svg", {
        backgroundColor: "#f5f3f0",
        scaleFit: "cover",
        anchorX: "right",
        anchorY: "bottom",
        padding: 0,
      });
    })();

    return () => {
      cleanup?.();
    };
  }, []);

  return <canvas ref={canvasRef} className={className} />;
}
