import type { ComponentId, InspectionData, SubstationComponent } from "../types";

/**
 * Datos de placa de un Transformador de Potencial (TP/VT) inductivo de patio AIS.
 * Ver investigaciones/07-transformadores-instrumento-medicion.md §4 para la derivación de
 * cada dato.
 */
export interface VoltageTransformerRatings {
  /** Tensión primaria nominal línea-línea del sistema, en kV (§4.1). En este simulador el TP se
   * conecta fase-tierra con un único bushing (típico en patios AIS), por lo que el devanado
   * primario en realidad ve Vp/√3, no esta cifra completa — ver `primaryVoltagePhaseNeutralKV`.
   * Para la bahía de 230 kV del simulador (SYSTEM_VOLTAGE_KV, types.ts) este valor es 230. */
  primaryVoltageLLkV: number;
  /** Tensión secundaria nominal, en V — estándar 110/115/120 V fase-fase (§4.1). */
  secondaryVoltageV: number;
  /** Carga (burden) nominal del secundario, en VA. El TP maneja "potencias muy pequeñas (decenas
   * de VA, rara vez más de unos pocos cientos de VA)" (§4.1) — a diferencia de un transformador
   * de potencia, no está optimizado para transferir energía sino para precisión. */
  ratedBurdenVA: number;
  /** Clase de precisión de medición (IEC 61869-3), ej. "0.2", "0.5" — mismo espíritu que la clase
   * de un TC de medición (§3), pero aplicada a tensión: cuanto menor el número, menor el error de
   * relación admitido a tensión nominal. */
  accuracyClass: string;
}

/**
 * Modelo de dominio de un Transformador de Potencial (TP/VT) inductivo.
 * Sin dependencia de Three.js (docs/adr/0002-separacion-modelo-dominio-render.md) — testeable
 * sin WebGL.
 *
 * Es, conceptualmente, un transformador de potencia convencional en miniatura: primario conectado
 * EN PARALELO con la línea de AT (a diferencia del TC, que va en serie con la carga), con muchas
 * espiras de alambre fino sobre un núcleo de alta permeabilidad, diseñado exclusivamente para
 * precisión y no para transferencia de energía (investigaciones/07 §4.1). Por eso, a diferencia
 * de `Transformer` (potencia), este componente no modela pérdidas ni eficiencia bajo carga: su
 * "carga" (burden) es fija y pequeña por diseño, no una variable operativa del usuario.
 *
 * Sin FSM ni acciones de maniobra: el TP no se abre ni se cierra, solo mide — sus datos de placa
 * son fijos y el panel de inspección es puramente informativo (mismo espíritu que `Transformer`,
 * que tampoco maniobra, a diferencia de `CircuitBreaker`/`Disconnector`).
 */
export class VoltageTransformer implements SubstationComponent {
  readonly id: ComponentId;
  readonly kind = "voltage-transformer" as const;
  readonly label: string;
  readonly ratings: VoltageTransformerRatings;

  constructor(id: ComponentId, label: string, ratings: VoltageTransformerRatings) {
    this.id = id;
    this.label = label;
    this.ratings = ratings;
  }

  /** Tensión primaria fase-neutro real que ve el devanado, en kV: Vp,LL/√3 (§4.1 — conexión
   * fase-tierra con bushing único, aislamiento dimensionado a esta tensión, no a la de línea). */
  get primaryVoltagePhaseNeutralKV(): number {
    return this.ratings.primaryVoltageLLkV / Math.sqrt(3);
  }

  /** Tensión secundaria fase-neutro equivalente, en V: 110/√3 ≈ 63.5 V (§4.1). */
  get secondaryVoltagePhaseNeutralV(): number {
    return this.ratings.secondaryVoltageV / Math.sqrt(3);
  }

  /** Relación de transformación nominal (Kn = V1/V2). Primario y secundario se conectan ambos
   * fase-neutro, así que el factor √3 se cancela y Kn coincide con la razón entre las tensiones
   * línea-línea de placa (§4.1) — ej. 230 kV / 110 V ≈ 2091:1. */
  get turnsRatio(): number {
    return (this.ratings.primaryVoltageLLkV * 1000) / this.ratings.secondaryVoltageV;
  }

  inspect(): InspectionData {
    return {
      title: this.label,
      subtitle: `${this.ratings.primaryVoltageLLkV} kV / ${this.ratings.secondaryVoltageV} V · clase ${this.ratings.accuracyClass}`,
      rows: [
        {
          label: "Conexión primario",
          value: "Fase-tierra (bushing único)",
          hint: `Devanado dimensionado para ${this.primaryVoltagePhaseNeutralKV.toFixed(1)} kV fase-neutro, no para los ${this.ratings.primaryVoltageLLkV} kV entre fases (investigaciones/07 §4.1)`,
        },
        {
          label: "Tensión secundaria",
          value: `${this.ratings.secondaryVoltageV} V f-f (${this.secondaryVoltagePhaseNeutralV.toFixed(1)} V f-n)`,
          hint: "Estándar 110/115/120 V fase-fase, o 110/√3 V fase-neutro (§4.1)",
        },
        { label: "Relación nominal", value: `${this.turnsRatio.toFixed(0)}:1` },
        {
          label: "Burden nominal",
          value: `${this.ratings.ratedBurdenVA} VA`,
          hint: "Decenas de VA — el TP está optimizado para precisión, no para transferir energía (§4.1), a diferencia de un transformador de potencia",
        },
        {
          label: "Clase de precisión",
          value: this.ratings.accuracyClass,
          hint: "IEC 61869-3. En la práctica suele tener núcleos/devanados adicionales de clase de protección (ej. 3P) además del de medición, igual que un TC (§3)",
        },
        {
          label: "Cortocircuito accidental en el secundario",
          value: "Riesgo térmico/de protección, no de choque",
          tone: "neutral",
          hint: "A diferencia del TC —que genera sobretensiones peligrosas al ABRIRSE el secundario—, el TP es fuente de tensión: al CORTOCIRCUITARSE su propia impedancia interna limita la corriente de falla a un valor finito y predecible, sin sobretensión letal. El riesgo real es el colapso de la señal de medición/protección y el calentamiento del devanado; se protege con fusibles de AT en el primario (investigaciones/07 §4.2)",
        },
        {
          label: "Supervisión de circuito (VT supervision)",
          value: "Recomendada",
          hint: "Bloquea funciones de protección basadas en tensión si detecta pérdida de señal (fusible fundido, corto accidental) — evita disparos intempestivos por falta de tensión que no es una falla real del sistema (§4.2)",
        },
      ],
      reference: {
        text: "investigaciones/07 — Transformadores de instrumento (TC/TP)",
        href: "../investigaciones/07-transformadores-instrumento-medicion.md",
      },
    };
  }
}
