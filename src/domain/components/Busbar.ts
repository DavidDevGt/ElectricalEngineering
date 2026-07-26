import type { ComponentId, InspectionData, SubstationComponent } from "../types";
import { SYSTEM_VOLTAGE_KV } from "../types";

/**
 * Factor de pico normalizado (corriente de cresta / corriente simétrica de cortocircuito),
 * según IEC 62271-100 / IEEE C37.010 — investigaciones/08 §3.2-3.3. El offset DC asimétrico del
 * primer medio ciclo de falla hace que el esfuerzo mecánico real sobre el tubo y sus soportes sea
 * mayor que I·√2; la norma cubre ese margen con un factor de pico de 2.7 (para X/R típicos de
 * subestación, 15-50).
 */
const PEAK_CURRENT_FACTOR = 2.7;

/**
 * Datos de placa de un tramo de barra colectora rígida (rigid/tubular bus) — el conductor que
 * agrupa e interconecta los circuitos de una subestación (IDEA.md §3.7: "conductores rígidos tipo
 * tubo o flexibles tipo cable... agrupan e interconectan los distintos circuitos"). Este MVP
 * modela una sola bahía, sin el grafo de topologías de barras de investigaciones/06 (§1, "seis
 * topologías") — aquí la barra es un único tramo con datos de placa típicos de un patio AIS de
 * 230 kV, no un nodo conmutable de una topología mayor.
 */
export interface BusbarRatings {
  /** Corriente nominal continua, en A. Se dimensiona por la suma de las corrientes de todos los
   * circuitos que confluyen en la barra (no solo un circuito) — típicamente 2000-3000 A en
   * patios de 230 kV; 2500 A cae en los valores normalizados usuales de la industria
   * (1250/1600/2000/2500/3150/4000 A, IEC 62271-1). */
  ratedCurrentA: number;
  /** Corriente simétrica de cortocircuito que la barra debe soportar 1 s sin daño térmico ni
   * deformación mecánica permanente, en kA rms. Debe igualar o superar la corriente de
   * interrupción nominal de los interruptores conectados a ella (investigaciones/02 §2) — la
   * barra nunca puede ser el eslabón más débil de la cadena de protección. */
  shortTimeWithstandKA: number;
  /** Tensión máxima de diseño del sistema (Um, IEC 60071-1), en kV — investigaciones/05 §2,
   * tabla de valores normalizados (fila Um = 245 kV, la que cubre un sistema nominal de 230 kV). */
  ratedVoltageKV: number;
  /** Nivel básico de aislamiento a impulso tipo rayo, en kV pico (investigaciones/05 §2, misma
   * tabla — 850/950/1050 kV son las opciones normalizadas para Um = 245 kV; se toma 950 kV como
   * valor representativo). */
  bilKVPeak: number;
  /** Material y forma constructiva del conductor. */
  material: string;
}

const DEFAULT_RATINGS: BusbarRatings = {
  ratedCurrentA: 2500,
  shortTimeWithstandKA: 40,
  ratedVoltageKV: 245,
  bilKVPeak: 950,
  material: "Tubo de aluminio (aleación 6101-T6)",
};

/**
 * Modelo de dominio de un tramo de barra colectora. Sin dependencia de Three.js
 * (docs/adr/0002-separacion-modelo-dominio-render.md) — testeable sin WebGL.
 *
 * A diferencia del interruptor/seccionador, la barra es un elemento pasivo: no tiene FSM ni
 * acciones de maniobra propias. Su único estado dinámico observable es si está energizada, y ese
 * hecho lo decide el grafo de conectividad del modelo general (fuera de esta clase — la barra no
 * tiene noción propia de "circuito"), no la barra misma. Se inyecta como función, igual que
 * `Disconnector.ts` inyecta `getInterlockingBreakerState` en vez de acoplarse directo a
 * `CircuitBreaker`: mantiene el componente desacoplado de quien resuelve la conectividad.
 */
export class Busbar implements SubstationComponent {
  readonly id: ComponentId;
  readonly kind = "busbar" as const;
  readonly label: string;
  readonly ratings: BusbarRatings = DEFAULT_RATINGS;

  constructor(
    id: ComponentId,
    label: string,
    private readonly getEnergized: () => boolean,
  ) {
    this.id = id;
    this.label = label;
  }

  /** Corriente de cresta (pico asimétrico) que la barra y sus soportes deben resistir
   * mecánicamente en el primer medio ciclo de una falla (investigaciones/08 §3.2-3.3). */
  get peakWithstandKA(): number {
    return this.ratings.shortTimeWithstandKA * PEAK_CURRENT_FACTOR;
  }

  /**
   * Si la barra está energizada ahora mismo. Delega en la función inyectada — la capa de escena
   * (`BusbarObject3D`) lee este getter en vez de recibir su propia copia de `getEnergized`, para
   * no duplicar la inyección entre dominio y render.
   */
  get energized(): boolean {
    return this.getEnergized();
  }

  inspect(): InspectionData {
    const energized = this.energized;
    return {
      title: this.label,
      subtitle: `Barra rígida AIS · ${this.ratings.ratedCurrentA} A · ${SYSTEM_VOLTAGE_KV} kV`,
      rows: [
        {
          label: "Estado",
          value: energized ? "Energizada" : "Desenergizada",
          tone: energized ? "good" : "neutral",
          hint: "Depende de la trayectoria de interruptores/seccionadores cerrados hasta una fuente",
        },
        { label: "Tensión del sistema", value: `${SYSTEM_VOLTAGE_KV} kV` },
        { label: "Tensión máxima (Um)", value: `${this.ratings.ratedVoltageKV} kV` },
        { label: "Corriente nominal", value: `${this.ratings.ratedCurrentA} A` },
        {
          label: "Corriente cortocircuito (1 s)",
          value: `${this.ratings.shortTimeWithstandKA} kA rms`,
          hint: "Debe igualar o superar la del interruptor más exigente conectado a la barra",
        },
        {
          label: "Corriente pico (cresta)",
          value: `${this.peakWithstandKA.toFixed(0)} kA`,
          hint: `Factor de pico ${PEAK_CURRENT_FACTOR}× (IEC 62271-100 / IEEE C37.010)`,
        },
        { label: "BIL", value: `${this.ratings.bilKVPeak} kV pico` },
        { label: "Material", value: this.ratings.material },
        { label: "Tipo de patio", value: "AIS (aislado en aire)" },
      ],
      reference: {
        text: "investigaciones/06 — Topologías y confiabilidad de subestaciones",
        href: "../investigaciones/06-topologias-confiabilidad-subestaciones.md",
      },
    };
  }
}
