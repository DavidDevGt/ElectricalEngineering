import type { ComponentId, InspectionData, SubstationComponent } from "../types";
import { SYSTEM_VOLTAGE_KV } from "../types";

/**
 * Parámetros de diseño de la malla de puesta a tierra (grounding grid).
 * Ver investigaciones/04-puesta-a-tierra-ieee80.md §3-§4 para la derivación de cada rango.
 */
export interface GroundGridSpec {
  /** Resistividad del suelo nativo, en Ω·m. Arena/grava típico: 100-1000 Ω·m (§3). */
  soilResistivityOhmM: number;
  /** Espaciamiento entre conductores paralelos de la rejilla, en m (§4.1: rango típico 3-7 m,
   * más denso cerca del perímetro y frente a equipos de alto riesgo). */
  conductorSpacingM: number;
  /** Profundidad de enterramiento de los conductores, en m (§4.1: rango típico 0.3-0.6 m). */
  burialDepthM: number;
  /** Número de electrodos verticales (ground rods) en esquinas/perímetro (§4.1). */
  groundRodCount: number;
  /** Longitud de cada electrodo vertical, en m (§4.1: típico 2.4-3 m). */
  groundRodLengthM: number;
}

/**
 * Valores representativos de una malla de subestación de transmisión en suelo de arena/grava,
 * consistentes con investigaciones/04 §3-§4. No son "la" malla correcta para cualquier sitio —
 * IEEE 80 exige medir la resistividad real del terreno (método de Wenner, §3.1) antes de diseñar.
 */
export const TYPICAL_GROUND_GRID_SPEC: GroundGridSpec = {
  soilResistivityOhmM: 200,
  conductorSpacingM: 4,
  burialDepthM: 0.5,
  groundRodCount: 4,
  groundRodLengthM: 3,
};

/**
 * Modelo de dominio de la malla de puesta a tierra. Sin dependencia de Three.js
 * (docs/adr/0002-separacion-modelo-dominio-render.md).
 *
 * A diferencia de otros componentes del patio, la malla no tiene una FSM de maniobra ni un
 * "estado" que cambie durante la operación normal — es infraestructura pasiva. Este MVP la
 * expone solo como componente inspeccionable con sus parámetros de diseño reales; el cálculo en
 * vivo del potencial de superficie (heatmap 3D, tensión de paso/contacto real bajo un avatar) es
 * la mecánica del modo falla descrita en investigaciones/04 §8 y queda fuera de alcance aquí.
 */
export class GroundGrid implements SubstationComponent {
  readonly id: ComponentId;
  readonly kind = "ground-grid" as const;
  readonly label: string;
  readonly spec: GroundGridSpec;

  constructor(id: ComponentId, label: string, spec: GroundGridSpec = TYPICAL_GROUND_GRID_SPEC) {
    this.id = id;
    this.label = label;
    this.spec = spec;
  }

  inspect(): InspectionData {
    return {
      title: this.label,
      subtitle: `Malla de puesta a tierra · IEEE Std 80 · patio de ${SYSTEM_VOLTAGE_KV} kV`,
      rows: [
        {
          label: "Resistividad del suelo (ρ)",
          value: `${this.spec.soilResistivityOhmM} Ω·m`,
          hint: "Arena/grava típico: 100-1000 Ω·m; varía fuertemente con humedad y estación (investigaciones/04 §3)",
        },
        {
          label: "Espaciamiento de conductores (D)",
          value: `${this.spec.conductorSpacingM} m`,
          hint: "Rango típico de diseño: 3-7 m — más denso cerca del perímetro (investigaciones/04 §4.1)",
        },
        {
          label: "Profundidad de enterramiento (h)",
          value: `${this.spec.burialDepthM} m`,
          hint: "Rango típico: 0.3-0.6 m, por debajo de la capa superficial de grava (investigaciones/04 §4.1)",
        },
        {
          label: "Conductor",
          value: "Cobre desnudo, 2/0 – 500 kcmil AWG",
          hint: "Calibre dimensionado térmicamente para soportar I_g durante el tiempo de despeje (investigaciones/04 §4.1)",
        },
        {
          label: "Electrodos verticales (varillas)",
          value: `${this.spec.groundRodCount} × ${this.spec.groundRodLengthM} m`,
          hint: "Su función principal es estabilizar R_g frente a variaciones estacionales de humedad, no reducir R_g por sí solas (investigaciones/04 §4.1)",
        },
        {
          label: "Capa superficial (grava)",
          value: "0.10 – 0.15 m, ρs ≈ 2000-5000 Ω·m",
          hint: "Sube la resistencia de contacto del pie y por tanto el umbral de tensión tolerable — barata y muy eficaz (investigaciones/04 §4.2)",
        },
        {
          label: "Resistencia global de tierra (R_g)",
          value: "0.1 – 1 Ω (orden típico)",
          tone: "neutral",
          hint: "Depende de ρ, área y longitud total de conductor (fórmula de Sverak); GPR = I_g · R_g (investigaciones/04 §1)",
        },
        {
          label: "GPR esperado ante falla a tierra",
          value: "de varios kV a decenas de kV",
          tone: "warning",
          hint: "Con I_g del orden de 10-30 kA típico de transmisión; peligroso solo por el GRADIENTE local, no por el GPR uniforme (investigaciones/04 §1)",
        },
        {
          label: "Regla central IEEE 80",
          value: "R_g baja NO garantiza seguridad",
          tone: "danger",
          hint: "La seguridad depende del perfil de potencial en superficie: E_m (tensión de malla) y E_s (tensión de paso) deben verificarse independientemente de R_g (investigaciones/04 §5)",
        },
      ],
      reference: {
        text: "investigaciones/04 — Puesta a tierra (IEEE 80)",
        href: "../investigaciones/04-puesta-a-tierra-ieee80.md",
      },
    };
  }
}
