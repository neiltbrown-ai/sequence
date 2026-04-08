export function initAsciiScatter(
  canvas: HTMLCanvasElement,
  svgUrl: string,
  opts?: {
    mouseRadius?: number;
    mouseForce?: number;
    springStiffness?: number;
    damping?: number;
    colorLighten?: number;
    fontSize?: number;
    backgroundColor?: string;
    noiseCount?: number;
    fontFamily?: string;
    padding?: number;
    scaleFit?: 'contain' | 'cover';
    anchorX?: 'left' | 'center' | 'right';
    anchorY?: 'top' | 'center' | 'bottom';
  }
): Promise<() => void>;
