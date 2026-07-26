import type { EventBus } from "../events";
import { StateMachine } from "../fsm/StateMachine";
import type { ComponentId, InspectionData, SubstationComponent } from "../types";

export type BreakerState = "open" | "closed";
type BreakerEvent = "close" | "open";

/**
 * Interruptor de potencia (circuit breaker). A diferencia del seccionador, SÍ puede maniobrar
 * bajo carga — su cámara de extinción (SF6/vacío) está diseñada exactamente para eso
 * (investigaciones/02 §3). Por eso su FSM no tiene guardas: puede abrir/cerrar siempre.
 *
 * El arco, la TRV y el tiempo de despeje real (investigaciones/02 §2, §6) son mecánicas del modo
 * falla, fuera de alcance de este MVP (inspección + maniobra) — aquí el interruptor es una FSM
 * de dos estados con una transición visual animada en la capa de escena.
 */
export class CircuitBreaker implements SubstationComponent {
  readonly id: ComponentId;
  readonly kind = "circuit-breaker" as const;
  readonly label: string;

  private readonly fsm: StateMachine<BreakerState, BreakerEvent>;
  private readonly events: EventBus;

  constructor(id: ComponentId, label: string, events: EventBus) {
    this.id = id;
    this.label = label;
    this.events = events;
    this.fsm = new StateMachine<BreakerState, BreakerEvent>("open", [
      { from: "open", event: "close", to: "closed" },
      { from: "closed", event: "open", to: "open" },
    ]);
  }

  get state(): BreakerState {
    return this.fsm.state;
  }

  close(): void {
    this.attempt("close");
  }

  open(): void {
    this.attempt("open");
  }

  private attempt(event: BreakerEvent): void {
    const outcome = this.fsm.send(event);
    if (outcome.ok) {
      this.events.emit({ type: "component-changed", id: this.id });
      this.events.emit({
        type: "notice",
        level: "success",
        message: `${this.label}: ${this.state === "closed" ? "cerrado" : "abierto"}.`,
      });
    } else {
      this.events.emit({ type: "interlock-blocked", id: this.id, reason: outcome.reason });
      this.events.emit({ type: "notice", level: "danger", message: outcome.reason });
    }
  }

  inspect(): InspectionData {
    return {
      title: this.label,
      subtitle: "Interruptor de potencia (SF6)",
      actions: [
        { label: "Cerrar", run: () => this.close(), disabled: this.state === "closed" },
        { label: "Abrir", run: () => this.open(), disabled: this.state === "open" },
      ],
      rows: [
        {
          label: "Estado",
          value: this.state === "closed" ? "Cerrado" : "Abierto",
          tone: this.state === "closed" ? "good" : "neutral",
        },
        { label: "Medio de extinción", value: "SF6 (puffer)" },
        { label: "Corriente nominal", value: "1200 A" },
        { label: "Interrupción simétrica", value: "40 kA" },
        {
          label: "Puede maniobrar bajo carga",
          value: "Sí",
          hint: "A diferencia del seccionador — tiene cámara de extinción de arco",
        },
      ],
      reference: {
        text: "investigaciones/02 — Interruptores y arco eléctrico",
        href: "../investigaciones/02-interruptores-arco-electrico.md",
      },
    };
  }
}
