import type { ComponentId, InspectionData, SubstationComponent } from "../types";
import { SYSTEM_VOLTAGE_KV } from "../types";

/**
 * Datos de placa de un pararrayos de óxido de zinc (ZnO / MOV), clase estación.
 * Ver investigaciones/05-coordinacion-aislamiento-sobretensiones.md §4 para la derivación de
 * cada parámetro (definiciones tomadas de IEC 60099-4 / IEEE C62.11, citadas en la investigación).
 */
export interface SurgeArresterRatings {
  /** Uc (MCOV): tensión eficaz máxima de operación continua, en kV. Debe ser ≥ tensión
   * fase-tierra máxima de servicio (§4). */
  continuousOperatingVoltageKV: number;
  /** Ur (rated voltage): tensión de referencia frente a TOV de 10 s, en kV.
   * Típicamente Ur ≈ 1.25 × Uc (§4). */
  ratedVoltageKV: number;
  /** Up,LI: nivel de protección a impulso atmosférico (rayo), tensión residual a la corriente
   * nominal de descarga (onda 8/20 µs), en kV pico. Orden de magnitud Up,LI ≈ 3.0–3.5 × Uc (§4).
   * Es la tensión que efectivamente "ve" el equipo protegido aguas abajo. */
  lightningProtectionLevelKV: number;
  /** Corriente nominal de descarga usada para definir Up,LI, en kA, onda 8/20 µs — 10 kA es
   * la clase típica de pararrayos de estación en AT/EAT (§4). */
  nominalDischargeCurrentKA: number;
  /** Capacidad de absorción de energía, en kJ por kV de Ur. Clase estación (subestaciones de
   * AT/EAT): 9–14 kJ/kV de Ur, muy por encima de la clase distribución (2.5–4.5 kJ/kV) (§4). */
  energyAbsorptionKJPerKVOfUr: number;
  /** BIL representativo del equipo protegido en esta bahía (ej. transformador), en kV pico —
   * se usa solo para calcular el margen de protección didáctico (§2 tabla, §3 fórmula). No es un
   * dato propio del pararrayos sino del equipo aguas abajo que este pararrayos coordina. */
  protectedEquipmentBIL_KV: number;
}

/**
 * Ratings representativos para un pararrayos de estación aplicado a un sistema de 230 kV
 * efectivamente puesto a tierra (investigaciones/05 §4). Deriva Ur y Up,LI a partir de Uc con
 * los factores típicos citados en la investigación, en vez de inventar valores sueltos:
 *   Uc = 144 kV  (> 230/√3 ≈ 132.8 kV, tensión fase-tierra máxima de servicio continuo)
 *   Ur = 1.25 × Uc = 180 kV
 *   Up,LI ≈ 3.2 × Uc ≈ 460 kV pico @ 10 kA, 8/20 µs (dentro del rango 3.0–3.5×Uc)
 * El BIL de equipo de referencia (950 kV pico) corresponde a la fila Um = 245 kV de la tabla de
 * IEC 60071-1 citada en investigaciones/05 §2 (nivel intermedio de los tres normalizados para ese
 * Um, aplicable a un sistema nominal de 230 kV).
 */
export function typicalStationClassRatings230kV(): SurgeArresterRatings {
  return {
    continuousOperatingVoltageKV: 144,
    ratedVoltageKV: 180,
    lightningProtectionLevelKV: 460,
    nominalDischargeCurrentKA: 10,
    energyAbsorptionKJPerKVOfUr: 10,
    protectedEquipmentBIL_KV: 950,
  };
}

/**
 * Modelo de dominio de un pararrayos de óxido de zinc (ZnO), sin explosores (gapless).
 * Sin dependencia de Three.js (ver docs/adr/0002-separacion-modelo-dominio-render.md).
 *
 * A diferencia del interruptor/seccionador, el pararrayos no tiene una FSM de maniobra: es un
 * dispositivo pasivo de protección, siempre conectado en derivación entre fase y tierra. Su
 * "comportamiento" es la curva V-I no lineal del ZnO (investigaciones/05 §4), fuera de alcance de
 * este MVP de inspección — aquí se expone solo el conjunto de parámetros de placa con los que un
 * ingeniero verificaría la coordinación de aislamiento.
 */
export class SurgeArrester implements SubstationComponent {
  readonly id: ComponentId;
  readonly kind = "surge-arrester" as const;
  readonly label: string;
  readonly ratings: SurgeArresterRatings;

  constructor(id: ComponentId, label: string, ratings: SurgeArresterRatings = typicalStationClassRatings230kV()) {
    this.id = id;
    this.label = label;
    this.ratings = ratings;
  }

  /** Tensión fase-tierra máxima de servicio del sistema simulado, en kV: V_LG = V_sistema/√3. */
  get systemPhaseToGroundVoltageKV(): number {
    return SYSTEM_VOLTAGE_KV / Math.sqrt(3);
  }

  /** Verifica la condición mínima de aplicación: Uc del pararrayos ≥ V fase-tierra del sistema
   * (investigaciones/05 §4). */
  get continuousVoltageAdequate(): boolean {
    return this.ratings.continuousOperatingVoltageKV >= this.systemPhaseToGroundVoltageKV;
  }

  /** Capacidad de absorción de energía en valor absoluto: kJ/kV de Ur × Ur (§4). */
  get energyAbsorptionCapacityKJ(): number {
    return this.ratings.energyAbsorptionKJPerKVOfUr * this.ratings.ratedVoltageKV;
  }

  /** Margen de protección frente al BIL del equipo protegido, en % (investigaciones/05 §3):
   * margen = (BIL_equipo − Up,LI) / Up,LI × 100. IEC 60071-2 exige un mínimo del 20%. */
  get protectionMarginPercent(): number {
    const { protectedEquipmentBIL_KV, lightningProtectionLevelKV } = this.ratings;
    return ((protectedEquipmentBIL_KV - lightningProtectionLevelKV) / lightningProtectionLevelKV) * 100;
  }

  get marginMeetsMinimum(): boolean {
    return this.protectionMarginPercent >= 20;
  }

  inspect(): InspectionData {
    const r = this.ratings;
    return {
      title: this.label,
      subtitle: `Pararrayos ZnO clase estación · Ur ${r.ratedVoltageKV} kV`,
      rows: [
        {
          label: "Tecnología",
          value: "ZnO sinterizado, sin explosores (gapless)",
          hint: "α (no linealidad) ≈ 25–50 en la región activa — SiC necesitaba gap serie, α ≈ 2–6",
        },
        {
          label: "Uc (MCOV)",
          value: `${r.continuousOperatingVoltageKV} kV`,
          tone: this.continuousVoltageAdequate ? "good" : "danger",
          hint: `Tensión fase-tierra del sistema: ${this.systemPhaseToGroundVoltageKV.toFixed(1)} kV (230/√3)`,
        },
        { label: "Ur (tensión asignada)", value: `${r.ratedVoltageKV} kV`, hint: "Ur ≈ 1.25 × Uc" },
        {
          label: "Up,LI (nivel de protección al rayo)",
          value: `${r.lightningProtectionLevelKV} kV pico`,
          hint: `Tensión residual @ ${r.nominalDischargeCurrentKA} kA, onda 8/20 µs — Up,LI ≈ 3.0–3.5 × Uc`,
        },
        {
          label: "Corriente nominal de descarga",
          value: `${r.nominalDischargeCurrentKA} kA (8/20 µs)`,
        },
        {
          label: "Capacidad de absorción de energía",
          value: `${this.energyAbsorptionCapacityKJ.toFixed(0)} kJ`,
          hint: `Clase estación: ${r.energyAbsorptionKJPerKVOfUr} kJ/kV de Ur (rango típico 9–14 kJ/kV)`,
        },
        {
          label: "Margen de protección a BIL",
          value: `${this.protectionMarginPercent.toFixed(0)}%`,
          tone: this.marginMeetsMinimum ? "good" : "danger",
          hint: `BIL de referencia del equipo protegido: ${r.protectedEquipmentBIL_KV} kV pico — IEC 60071-2 exige ≥ 20%`,
        },
      ],
      reference: {
        text: "investigaciones/05 — Coordinación de aislamiento y sobretensiones",
        href: "../investigaciones/05-coordinacion-aislamiento-sobretensiones.md",
      },
    };
  }
}
