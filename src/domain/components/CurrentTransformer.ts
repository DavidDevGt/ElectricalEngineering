import type { ComponentId, InspectionData, SubstationComponent } from "../types";

/**
 * Datos de placa de un transformador de corriente (TC/CT).
 * Ver investigaciones/07-transformadores-instrumento-medicion.md §1 para la derivación.
 */
export interface CurrentTransformerRatings {
  /** Corriente nominal primaria, en A (ej. 1000 en una relación 1000:5) — investigaciones/07 §1.1. */
  ratedPrimaryCurrentA: number;
  /** Corriente nominal secundaria, en A — estándar 5 A (IEEE) o 1 A (IEC/Latam) (§1.1). */
  ratedSecondaryCurrentA: number;
  /** Clase de precisión del núcleo de medición, IEC 61869-2 (§1.4): 0.1, 0.2(S), 0.5(S), 1, 3. */
  meteringAccuracyClass: string;
  /** Clase de precisión del núcleo de protección, notación xPy (§1.4), ej. "5P20". */
  protectionAccuracyClass: string;
  /** ALF (Accuracy Limit Factor) del núcleo de protección: múltiplo de In hasta el que mantiene
   * el error compuesto declarado sin saturarse significativamente (§1.4). */
  accuracyLimitFactor: number;
  /** Burden nominal del núcleo de medición, en VA a corriente nominal (§1.3). */
  ratedBurdenVA: number;
}

/**
 * Modelo de dominio de un transformador de corriente (TC/CT) de patio, tipo núcleo toroidal
 * independiente ("bushing"/"post-type" CT). Sin dependencia de Three.js
 * (ver docs/adr/0002-separacion-modelo-dominio-render.md) — testeable sin WebGL.
 *
 * A diferencia del interruptor o el seccionador, el TC no tiene maniobra propia: es un equipo
 * pasivo de medición/protección. En este MVP no modela el fenómeno de secundario abierto como
 * mecánica interactiva (eso pertenece al modo falla, investigaciones/07 §7.1, fuera de alcance) —
 * aquí solo se expone como dato educativo de advertencia en el panel de inspección (§2).
 */
export class CurrentTransformer implements SubstationComponent {
  readonly id: ComponentId;
  readonly kind = "current-transformer" as const;
  readonly label: string;
  readonly ratings: CurrentTransformerRatings;

  constructor(id: ComponentId, label: string, ratings: CurrentTransformerRatings) {
    this.id = id;
    this.label = label;
    this.ratings = ratings;
  }

  /** Relación de transformación nominal Kn = I1n / I2n (§1.1). */
  get ratio(): number {
    return this.ratings.ratedPrimaryCurrentA / this.ratings.ratedSecondaryCurrentA;
  }

  /** Texto de relación con el formato de placa habitual, ej. "1000:5 A" (§1.1). */
  get ratioLabel(): string {
    return `${this.ratings.ratedPrimaryCurrentA}:${this.ratings.ratedSecondaryCurrentA} A`;
  }

  /** Corriente primaria máxima que el núcleo de protección soporta manteniendo su error
   * compuesto declarado, en A: I_ALF = In × ALF (§1.4, ej. 1000 A × 20 = 20 000 A para 5P20). */
  get protectionSaturationCurrentA(): number {
    return this.ratings.ratedPrimaryCurrentA * this.ratings.accuracyLimitFactor;
  }

  inspect(): InspectionData {
    return {
      title: this.label,
      subtitle: `${this.ratioLabel} · ${this.ratings.meteringAccuracyClass} / ${this.ratings.protectionAccuracyClass}`,
      rows: [
        { label: "Relación de transformación", value: this.ratioLabel, hint: "Kn = I1n / I2n" },
        {
          label: "Núcleo de medición",
          value: `Clase ${this.ratings.meteringAccuracyClass}`,
          hint: "Se satura a propósito ante falla para proteger instrumentos (§3)",
        },
        {
          label: "Núcleo de protección",
          value: `Clase ${this.ratings.protectionAccuracyClass}`,
          hint: `ALF ${this.ratings.accuracyLimitFactor} — mantiene precisión hasta ${this.protectionSaturationCurrentA.toLocaleString("es")} A primarios`,
        },
        {
          label: "Burden nominal",
          value: `${this.ratings.ratedBurdenVA} VA`,
          hint: "Impedancia total del secundario: instrumentos + cableado (§1.3)",
        },
        {
          label: "Núcleos independientes",
          value: "Medición + protección",
          hint: "Un mismo primario, varios devanados secundarios sobre núcleos separados (§3)",
        },
        {
          label: "Peligro: secundario abierto con primario energizado",
          value: "Sobretensión de cresta — hasta varios kV",
          tone: "warning",
          hint:
            "El núcleo se satura y el flujo se invierte casi instantáneamente en cada cruce " +
            "por cero, induciendo picos de tensión muy agudos (2–5 kV típico, hasta decenas de " +
            "kV en TCs de relación alta). Riesgo letal y de incendio en el gabinete — el " +
            "secundario debe cortocircuitarse (test block) antes de desconectar cualquier " +
            "instrumento (§2).",
        },
      ],
      reference: {
        text: "investigaciones/07 — Transformadores de instrumento (TC/TP)",
        href: "../investigaciones/07-transformadores-instrumento-medicion.md",
      },
    };
  }
}
