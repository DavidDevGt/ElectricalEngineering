/**
 * Colormap perceptualmente uniforme (viridis) para todo dato científico continuo del proyecto
 * — investigaciones/10 §2: "jet"/arcoíris está prohibido en este proyecto por no ser
 * perceptualmente uniforme, introducir bandas falsas y ser ilegible para daltonismo.
 *
 * Viridis fue diseñado por Stéfan van der Walt y Nathaniel Smith para matplotlib 2.0,
 * optimizado para uniformidad en CIELAB y legibilidad en escala de grises.
 */

/** Puntos de control de viridis (submuestreo de la tabla oficial de 256 entradas). */
const VIRIDIS_STOPS: ReadonlyArray<readonly [number, number, number]> = [
  [0.267, 0.005, 0.329],
  [0.283, 0.141, 0.458],
  [0.254, 0.265, 0.53],
  [0.207, 0.372, 0.553],
  [0.164, 0.471, 0.558],
  [0.128, 0.567, 0.551],
  [0.135, 0.659, 0.518],
  [0.267, 0.749, 0.441],
  [0.478, 0.821, 0.318],
  [0.741, 0.873, 0.15],
  [0.993, 0.906, 0.144],
];

/** Interpola viridis en t ∈ [0,1]. Devuelve componentes RGB normalizados [0,1]. */
export function viridis(t: number): [number, number, number] {
  const clamped = Math.min(1, Math.max(0, t));
  const scaled = clamped * (VIRIDIS_STOPS.length - 1);
  const index = Math.min(VIRIDIS_STOPS.length - 2, Math.floor(scaled));
  const frac = scaled - index;

  const a = VIRIDIS_STOPS[index]!;
  const b = VIRIDIS_STOPS[index + 1]!;

  return [
    a[0] + (b[0] - a[0]) * frac,
    a[1] + (b[1] - a[1]) * frac,
    a[2] + (b[2] - a[2]) * frac,
  ];
}

/** Igual que `viridis`, en bytes [0,255] — formato que espera THREE.DataTexture. */
export function viridisBytes(t: number): [number, number, number] {
  const [r, g, b] = viridis(t);
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/** Igual que `viridis`, como color CSS — para leyendas y gráficos 2D del overlay. */
export function viridisCss(t: number): string {
  const [r, g, b] = viridisBytes(t);
  return `rgb(${r}, ${g}, ${b})`;
}
