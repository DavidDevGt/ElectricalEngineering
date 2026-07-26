/**
 * Tipos compartidos del modelo de dominio eléctrico.
 * Este módulo no importa "three" ni ningún módulo de escena (ADR-002).
 */

export type ComponentId = string;

export type ComponentKind =
  | "transformer"
  | "circuit-breaker"
  | "disconnector"
  | "current-transformer"
  | "voltage-transformer"
  | "surge-arrester"
  | "busbar"
  | "protection-relay"
  | "ground-grid";

/** Una fila del panel de inspección: etiqueta, valor ya formateado, y pista opcional. */
export interface InspectionRow {
  label: string;
  value: string;
  /** Texto corto que explica el dato (se muestra como tooltip / línea secundaria). */
  hint?: string;
  /** Marca visual del estado del valor (colorea la fila). */
  tone?: "neutral" | "good" | "warning" | "danger";
}

/** Una acción de maniobra ofrecida por el componente (ej. "Abrir", "Cerrar"). */
export interface InspectionAction {
  label: string;
  run: () => void;
  disabled?: boolean;
}

/** Contrato uniforme de inspección: permite que un solo panel HTML sirva a todo componente. */
export interface InspectionData {
  title: string;
  subtitle?: string;
  rows: InspectionRow[];
  /** Botones de maniobra, si el componente admite acciones (interruptor, seccionador...). */
  actions?: InspectionAction[];
  /** Enlace a la investigación que fundamenta los datos de este componente. */
  reference?: { text: string; href: string };
}

/** Todo componente del dominio implementa esto. */
export interface SubstationComponent {
  readonly id: ComponentId;
  readonly kind: ComponentKind;
  readonly label: string;
  /** Datos para el panel de inspección (modo inspección, IDEA.md §7). */
  inspect(): InspectionData;
  /** Avance de simulación con timestep fijo (ADR-005). Opcional: los componentes
   * cuasi-estáticos (transformador, barra) no necesitan implementarlo. */
  step?(fixedDeltaSeconds: number): void;
}

/** Tipos de falla que el modo falla puede inyectar (investigaciones/08 §5). */
export type FaultKind =
  | "three-phase"
  | "line-to-line"
  | "double-line-to-ground"
  | "single-line-to-ground";

export const FAULT_LABELS: Record<FaultKind, string> = {
  "three-phase": "Trifásica (LLL)",
  "line-to-line": "Bifásica (LL)",
  "double-line-to-ground": "Bifásica a tierra (LLG)",
  "single-line-to-ground": "Monofásica a tierra (SLG)",
};

/**
 * Severidad y frecuencia relativas de cada tipo de falla
 * (investigaciones/08 §5 — valores típicos de industria para líneas aéreas).
 */
export const FAULT_STATISTICS: Record<
  FaultKind,
  { relativeFrequency: number; severityFactor: number; involvesGround: boolean }
> = {
  "three-phase": { relativeFrequency: 0.05, severityFactor: 1.0, involvesGround: false },
  "line-to-line": { relativeFrequency: 0.15, severityFactor: 0.87, involvesGround: false },
  "double-line-to-ground": { relativeFrequency: 0.1, severityFactor: 0.92, involvesGround: true },
  "single-line-to-ground": { relativeFrequency: 0.7, severityFactor: 0.65, involvesGround: true },
};

/** Frecuencia nominal del sistema simulado, en Hz. */
export const SYSTEM_FREQUENCY_HZ = 60;

/** Duración de un ciclo de red, en segundos. */
export const CYCLE_SECONDS = 1 / SYSTEM_FREQUENCY_HZ;

/** Tensión nominal del lado de alta del patio simulado, en kV (AT según IEC 60038). */
export const SYSTEM_VOLTAGE_KV = 230;
