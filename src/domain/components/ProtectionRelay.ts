import type { ComponentId, InspectionData, InspectionRow, SubstationComponent } from "../types";

/**
 * Rol de este IED dentro del esquema de protección redundante de la bahía. En subestaciones de
 * EAT es común duplicar el lazo completo (protección primaria y protección de respaldo local,
 * cada una con su propio IED) para que la falla de un solo relé no deje el circuito sin
 * protección (investigaciones/03 §6).
 */
export type ProtectionRelayRole = "primary" | "backup";

/**
 * Una función de protección configurada en el chasis del IED, identificada por su número de
 * dispositivo ANSI/IEEE C37.2 (investigaciones/03 §5). Un solo chasis físico ejecuta varias
 * funciones en software — "protección multifunción" (§6) — en vez de un relé electromecánico
 * dedicado por función como en la era anterior a los IED.
 */
export interface ProtectionFunction {
  /** Código de dispositivo ANSI/IEEE C37.2, ej. "50/51", "87T" (investigaciones/03 §5). */
  ansiCode: string;
  /** Nombre descriptivo de la función. */
  name: string;
  /** Principio de operación resumido, con referencia a la sección de la investigación. */
  description: string;
}

/** Ajustes de configuración del IED (investigaciones/03 §2 y §6). */
export interface ProtectionRelaySettings {
  /** Relación de transformación del TC que alimenta la función de sobrecorriente, ej. "1200/5". */
  ctRatio: string;
  /** Corriente de arranque (pickup) de 50/51, en A del lado secundario del TC (§2). */
  overcurrentPickupA: number;
  /** Dial/multiplicador de tiempo (TDS) de la curva 51 configurada (§2). */
  timeDialSetting: number;
  /** Familia de curva tiempo-corriente IEC 60255 / IEEE C37.112 configurada (§2):
   * SI = inversa estándar, VI = muy inversa, EI = extremadamente inversa. */
  curveFamily: "SI" | "VI" | "EI";
  /** Margen de coordinación (CTI) con el relé aguas arriba/abajo, en segundos — típico 0.2-0.4 s
   * con relés microprocesados modernos, sin el sobrepaso (overtravel) de los electromecánicos
   * (investigaciones/03 §2). */
  coordinationTimeIntervalS: number;
  /** Tasa de muestreo del IED, en muestras por ciclo — típico 16-32 muestras/ciclo en IED
   * modernos (investigaciones/03 §6). */
  samplingRatePerCycle: number;
  /** Protocolo de comunicación con otros IED / SCADA, ej. "IEC 61850 (GOOSE)" (investigaciones/03 §7). */
  communicationProtocol: string;
  /** Funciones de protección configuradas en este chasis (§5, §6). Debe incluir al menos una
   * función para que el IED se considere en servicio (ver getter `inService`). */
  functions: ProtectionFunction[];
}

/**
 * Modelo de dominio de un relé de protección / IED (Intelligent Electronic Device) multifunción.
 * Sin dependencia de Three.js (docs/adr/0002-separacion-modelo-dominio-render.md) — testeable
 * sin WebGL.
 *
 * Fuera de alcance de este MVP (investigaciones/03 §8): la secuencia real falla → detección →
 * disparo (eso es "modo falla") y las curvas TCC interactivas. Aquí el IED es un componente
 * puramente inspeccionable que expone qué funciones de protección tiene configuradas y sus
 * ajustes de placa — no ejecuta ningún algoritmo de protección ni calcula corrientes de falla.
 */
export class ProtectionRelay implements SubstationComponent {
  readonly id: ComponentId;
  readonly kind = "protection-relay" as const;
  readonly label: string;
  readonly role: ProtectionRelayRole;
  readonly settings: ProtectionRelaySettings;

  constructor(
    id: ComponentId,
    label: string,
    role: ProtectionRelayRole,
    settings: ProtectionRelaySettings,
  ) {
    this.id = id;
    this.label = label;
    this.role = role;
    this.settings = settings;
  }

  /**
   * true si el chasis tiene al menos una función de protección configurada. Usado por la capa
   * de escena para colorear el LED de estado del gabinete (verde = en servicio) — no involucra
   * ningún cálculo eléctrico, solo lee la configuración ya provista.
   */
  get inService(): boolean {
    return this.settings.functions.length > 0;
  }

  inspect(): InspectionData {
    const roleLabel = this.role === "primary" ? "Primaria" : "Respaldo";

    const functionRows: InspectionRow[] = this.settings.functions.map((fn) => ({
      label: fn.ansiCode,
      value: fn.name,
      hint: fn.description,
      tone: "neutral",
    }));

    const rows: InspectionRow[] = [
      {
        label: "Rol en el esquema",
        value: roleLabel,
        hint:
          "Los lazos críticos duplican protección primaria y de respaldo, cada una con su " +
          "propio IED, para que la falla de un solo relé no deje el circuito sin protección " +
          "(investigaciones/03 §6)",
        tone: "neutral",
      },
      ...functionRows,
      {
        label: "TC de sobrecorriente",
        value: this.settings.ctRatio,
        hint: "Relación de transformación del transformador de corriente que alimenta las funciones 50/51",
      },
      {
        label: "Pickup 50/51",
        value: `${this.settings.overcurrentPickupA.toFixed(1)} A (secundario)`,
        hint: "Corriente de arranque de la función de sobrecorriente (investigaciones/03 §2)",
      },
      {
        label: "Curva TCC",
        value: `${this.settings.curveFamily} · TDS ${this.settings.timeDialSetting}`,
        hint: "Familia de curva tiempo-corriente IEC 60255 / IEEE C37.112 y dial de tiempo (investigaciones/03 §2)",
      },
      {
        label: "Margen de coordinación (CTI)",
        value: `${this.settings.coordinationTimeIntervalS.toFixed(1)} s`,
        hint: "Típico 0.2-0.4 s con relés microprocesados modernos (investigaciones/03 §2)",
      },
      {
        label: "Tasa de muestreo",
        value: `${this.settings.samplingRatePerCycle} muestras/ciclo`,
        hint: "Típico 16-32 muestras/ciclo en IED modernos (investigaciones/03 §6)",
      },
      {
        label: "Comunicación",
        value: this.settings.communicationProtocol,
        hint: "GOOSE (IEC 61850): mensajería publicador-suscriptor orientada a eventos, del orden de milisegundos (investigaciones/03 §7)",
      },
      {
        label: "Zona de protección",
        value: "Definida por los TC/TP asociados; se superpone con la zona adyacente en el interruptor",
        hint: "Superposición deliberada para que no exista ninguna zona muerta sin cobertura (investigaciones/03 §1)",
      },
      {
        label: "Estado",
        value: this.inService ? "En servicio" : "Fuera de servicio",
        tone: this.inService ? "good" : "danger",
      },
    ];

    return {
      title: this.label,
      subtitle: `IED multifunción · Protección ${roleLabel.toLowerCase()}`,
      rows,
      reference: {
        text: "investigaciones/03 — Protecciones eléctricas y coordinación",
        href: "../investigaciones/03-protecciones-electricas-coordinacion.md",
      },
    };
  }
}
