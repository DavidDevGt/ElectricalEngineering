/**
 * Coordenadas compartidas del patio de la subestación (en metros, escala 1:1).
 *
 * Define un **bahía de línea** (line bay) completa, en el orden real de un diagrama unifilar,
 * recorriendo el eje X desde la línea entrante hasta el transformador. La barra colectora corre
 * a lo largo del eje Z. Todo objeto 3D del proyecto debe posicionarse usando estas constantes
 * en vez de números mágicos, para que la disposición siga siendo coherente al agregar equipos.
 *
 * Orden del unifilar (investigaciones/06 §1, bahía típica):
 *   línea → pararrayos → seccionador de línea → TC → interruptor → seccionador de barra → barra
 *   → transformador
 */

export const BAY_Z = 0;

/** Posición en X de cada equipo de la bahía. */
export const LAYOUT = {
  linePortal: -14,
  surgeArrester: -11,
  lineDisconnector: -8.5,
  currentTransformer: -6,
  circuitBreaker: -3.5,
  voltageTransformer: -1,
  busDisconnector: 1.5,
  busbar: 4,
  transformer: 8.5,
} as const;

/** Altura del conductor principal del patio (nivel de barras y conexiones aéreas), en metros. */
export const CONDUCTOR_HEIGHT = 5.2;

/** Extensión de la barra colectora a lo largo del eje Z. */
export const BUSBAR_HALF_LENGTH = 7;

/** Huella de la malla de tierra (cubre todo el patio). */
export const GROUND_GRID = {
  halfWidthX: 17,
  halfWidthZ: 9,
  /** Espaciamiento entre conductores paralelos, en metros (investigaciones/04 §4.1: 3-7 m). */
  spacing: 4,
  /** Profundidad de enterramiento, en metros (investigaciones/04 §4.1: 0.3-0.6 m). */
  burialDepth: 0.5,
} as const;

/** Altura estándar de la base de los equipos sobre el nivel del suelo. */
export const EQUIPMENT_BASE_HEIGHT = 0.4;

/** Desplazamiento en Z del gabinete de relés respecto al eje de la bahía (no está en línea con
 * el conductor — un IED vive en una caseta de control, no colgado del patio). */
export const RELAY_CABINET = { x: LAYOUT.circuitBreaker, z: BAY_Z + 4.5 } as const;

