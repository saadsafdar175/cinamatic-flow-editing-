/**
 * CineFlow Studio - 3D LUT (.CUBE / .3DL) Parser and Procedural LUT Generator
 */

export interface ParsedLut3D {
  title: string;
  size: number; // e.g. 17 or 33
  data: Float32Array; // size^3 * 3 entries
}

/**
 * Parses standard Adobe / DaVinci Resolve .cube 3D LUT file content
 */
export function parseCubeLut(cubeText: string): ParsedLut3D | null {
  const lines = cubeText.split(/\r?\n/);
  let size = 0;
  let title = 'Imported LUT';
  const values: number[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    if (trimmed.startsWith('TITLE')) {
      title = trimmed.replace(/TITLE\s+"?([^"]*)"?/, '$1') || 'Imported LUT';
    } else if (trimmed.startsWith('LUT_3D_SIZE')) {
      const parts = trimmed.split(/\s+/);
      size = parseInt(parts[1], 10);
    } else {
      // Data line: R G B floating point values
      const parts = trimmed.split(/\s+/);
      if (parts.length >= 3) {
        const r = parseFloat(parts[0]);
        const g = parseFloat(parts[1]);
        const b = parseFloat(parts[2]);
        if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
          values.push(r, g, b);
        }
      }
    }
  }

  if (size === 0) {
    // deduce size from number of triplets if missing header
    const totalTriplets = values.length / 3;
    size = Math.round(Math.cbrt(totalTriplets));
  }

  if (size > 0 && values.length === size * size * size * 3) {
    return {
      title,
      size,
      data: new Float32Array(values),
    };
  }

  return null;
}

/**
 * Applies a 3D LUT transformation to an RGB triplet [0..255] with trilinear interpolation
 */
export function applyLut3D(
  r: number,
  g: number,
  b: number,
  lut: ParsedLut3D,
  intensity = 1.0
): [number, number, number] {
  if (intensity <= 0) return [r, g, b];

  const s = lut.size;
  const sMax = s - 1;

  // Normalized input coordinates in LUT grid space [0..sMax]
  const rx = (r / 255) * sMax;
  const gy = (g / 255) * sMax;
  const bz = (b / 255) * sMax;

  const r0 = Math.floor(rx);
  const r1 = Math.min(sMax, r0 + 1);
  const rf = rx - r0;

  const g0 = Math.floor(gy);
  const g1 = Math.min(sMax, g0 + 1);
  const gf = gy - g0;

  const b0 = Math.floor(bz);
  const b1 = Math.min(sMax, b0 + 1);
  const bf = bz - b0;

  // Helper to sample LUT at (ir, ig, ib)
  // Standard CUBE indexing: index = (r + g * size + b * size * size) * 3
  const sample = (ir: number, ig: number, ib: number, c: number): number => {
    const idx = (ir + ig * s + ib * s * s) * 3 + c;
    return lut.data[idx];
  };

  const interpolateChannel = (c: number): number => {
    const c000 = sample(r0, g0, b0, c);
    const c100 = sample(r1, g0, b0, c);
    const c010 = sample(r0, g1, b0, c);
    const c110 = sample(r1, g1, b0, c);
    const c001 = sample(r0, g0, b1, c);
    const c101 = sample(r1, g0, b1, c);
    const c011 = sample(r0, g1, b1, c);
    const c111 = sample(r1, g1, b1, c);

    const c00 = c000 * (1 - rf) + c100 * rf;
    const c10 = c010 * (1 - rf) + c110 * rf;
    const c01 = c001 * (1 - rf) + c101 * rf;
    const c11 = c011 * (1 - rf) + c111 * rf;

    const c0 = c00 * (1 - gf) + c10 * gf;
    const c1 = c01 * (1 - gf) + c11 * gf;

    return c0 * (1 - bf) + c1 * bf;
  };

  const lutR = interpolateChannel(0) * 255;
  const lutG = interpolateChannel(1) * 255;
  const lutB = interpolateChannel(2) * 255;

  return [
    r * (1 - intensity) + lutR * intensity,
    g * (1 - intensity) + lutG * intensity,
    b * (1 - intensity) + lutB * intensity,
  ];
}

/**
 * Procedural LUT definitions for film, cinema, and photography
 */
export interface ProceduralLut {
  id: string;
  name: string;
  category: string;
  description: string;
  previewColor: string;
  curve: (r: number, g: number, b: number) => [number, number, number];
}

export const PROCEDURAL_LUTS: ProceduralLut[] = [
  {
    id: 'kodak-portra-400',
    name: 'Kodak Portra 400',
    category: 'Film',
    description: 'Natural organic skin tones with warm highlights and gentle contrast.',
    previewColor: '#e0af68',
    curve: (r, g, b) => {
      // Gentle warm shift, lifted blacks, soft highlight roll-off
      const rOut = Math.min(255, r * 1.05 + 10);
      const gOut = Math.min(255, g * 0.98 + 8);
      const bOut = Math.min(255, b * 0.92 + 12);
      return [rOut, gOut, bOut];
    },
  },
  {
    id: 'fuji-eterna-250d',
    name: 'Fuji Eterna 250D',
    category: 'Film',
    description: 'Subtle desaturated greens, rich filmic density and soft shadow roll-off.',
    previewColor: '#7aa2f7',
    curve: (r, g, b) => {
      const avg = (r + g + b) / 3;
      const rOut = r * 0.9 + avg * 0.1 + 8;
      const gOut = g * 0.96 + avg * 0.04 + 6;
      const bOut = b * 1.04 + avg * 0.02 + 10;
      return [rOut, gOut, bOut];
    },
  },
  {
    id: 'teal-orange-hollywood',
    name: 'Teal & Orange Cinema',
    category: 'Cinema',
    description: 'Iconic blockbuster look with warm skin midtones and cool teal shadows.',
    previewColor: '#0db9d7',
    curve: (r, g, b) => {
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      let rOut = r, gOut = g, bOut = b;
      if (lum < 120) {
        // Shadows shift to teal
        const factor = (120 - lum) / 120;
        rOut = r * (1 - factor * 0.25);
        gOut = g * (1 + factor * 0.15);
        bOut = b * (1 + factor * 0.35);
      } else {
        // Highlights shift to warm amber/orange
        const factor = (lum - 120) / 135;
        rOut = Math.min(255, r * (1 + factor * 0.22));
        gOut = Math.min(255, g * (1 + factor * 0.08));
        bOut = b * (1 - factor * 0.25);
      }
      return [rOut, gOut, bOut];
    },
  },
  {
    id: 'vintage-super8-1970',
    name: 'Vintage 1970s Super 8',
    category: 'Vintage',
    description: 'Warm nostalgic glow with faded blacks and rich yellow highlights.',
    previewColor: '#d69e2e',
    curve: (r, g, b) => {
      const rOut = Math.min(255, r * 1.15 + 18);
      const gOut = Math.min(255, g * 1.05 + 14);
      const bOut = Math.max(25, b * 0.85 + 20);
      return [rOut, gOut, bOut];
    },
  },
  {
    id: 'moody-noir-contrast',
    name: 'Moody Forest & Noir',
    category: 'Moody',
    description: 'Deep crushed blacks, high micro-contrast, cold mist mood.',
    previewColor: '#394b59',
    curve: (r, g, b) => {
      const lum = (r + g + b) / 3;
      const factor = Math.pow(lum / 255, 1.25) * 255;
      const rOut = factor * 0.88;
      const gOut = factor * 0.95;
      const bOut = factor * 1.08;
      return [rOut, gOut, bOut];
    },
  },
  {
    id: 'golden-hour-glow',
    name: 'Golden Hour Sunset',
    category: 'Travel',
    description: 'Rich sunlight warmth, amber highlights, and soft cinema haze.',
    previewColor: '#f59e0b',
    curve: (r, g, b) => {
      const rOut = Math.min(255, r * 1.2 + 12);
      const gOut = Math.min(255, g * 1.05 + 6);
      const bOut = Math.max(0, b * 0.82);
      return [rOut, gOut, bOut];
    },
  },
  {
    id: 'documentary-neutral',
    name: 'Documentary True Tone',
    category: 'Documentary',
    description: 'Balanced DSLR response with accurate colors and extended dynamic range.',
    previewColor: '#10b981',
    curve: (r, g, b) => {
      return [r * 1.01, g * 1.01, b * 1.01];
    },
  },
  {
    id: 'wedding-dream-soft',
    name: 'Wedding Dream Soft',
    category: 'Wedding',
    description: 'Airy, soft, bright highlights, delicate pastel skin tones, low contrast.',
    previewColor: '#f472b6',
    curve: (r, g, b) => {
      const rOut = Math.min(255, r * 1.08 + 20);
      const gOut = Math.min(255, g * 1.04 + 18);
      const bOut = Math.min(255, b * 1.02 + 22);
      return [rOut, gOut, bOut];
    },
  },
];

/**
 * Exports current procedural or active color transform as a downloadable .cube file
 */
export function generateCubeLutFile(
  lutName: string,
  transformFn: (r: number, g: number, b: number) => [number, number, number],
  size = 17
): string {
  let output = `# CineFlow Studio 3D LUT Export\n`;
  output += `TITLE "${lutName}"\n`;
  output += `LUT_3D_SIZE ${size}\n\n`;

  for (let b = 0; b < size; b++) {
    for (let g = 0; g < size; g++) {
      for (let r = 0; r < size; r++) {
        const inR = (r / (size - 1)) * 255;
        const inG = (g / (size - 1)) * 255;
        const inB = (b / (size - 1)) * 255;

        const [outR, outG, outB] = transformFn(inR, inG, inB);
        const normR = Math.max(0, Math.min(1, outR / 255)).toFixed(6);
        const normG = Math.max(0, Math.min(1, outG / 255)).toFixed(6);
        const normB = Math.max(0, Math.min(1, outB / 255)).toFixed(6);

        output += `${normR} ${normG} ${normB}\n`;
      }
    }
  }

  return output;
}
