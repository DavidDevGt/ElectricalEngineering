import type { EventBus } from "../events";
import { StateMachine, type GuardResult } from "../fsm/StateMachine";
import type { ComponentId, InspectionData, SubstationComponent } from "../types";
import type { BreakerState } from "./CircuitBreaker";

export type DisconnectorState = "open" | "closed";
type DisconnectorEvent = "close" | "open";

/**
 * Seccionador (disconnect switch). No tiene cámara de extinción de arco — solo puede maniobrar
 * con el interruptor asociado ABIERTO (investigaciones/02 §5, IDEA.md §3.3). Esta es la regla de
 * enclavamiento real que el modo maniobra del proyecto existe para enseñar.
 *
 * La guarda recibe el estado del interruptor por una función inyectada (no una referencia directa
 * a la clase `CircuitBreaker`), para mantener el componente desacoplado — el mismo patrón que
 * "regiones paralelas que se comunican por eventos/consultas" en vez de banderas compartidas
 * (docs/adr/0004-fsm-a-mano-sobre-statecharts-libreria.md).
 */
export class Disconnector implements SubstationComponent {
  readonly id: ComponentId;
  readonly kind = "disconnector" as const;
  readonly label: string;

  private readonly fsm: StateMachine<DisconnectorState, DisconnectorEvent>;
  private readonly events: EventBus;

  constructor(
    id: ComponentId,
    label: string,
    events: EventBus,
    private readonly getInterlockingBreakerState: () => BreakerState,
  ) {
    this.id = id;
    this.label = label;
    this.events = events;

    const guard = (): GuardResult => {
      if (this.getInterlockingBreakerState() === "closed") {
        return `${this.label}: el interruptor asociado está cerrado. Un seccionador nunca se maniobra bajo carga (investigaciones/02 §5) — abre primero el interruptor.`;
      }
      return true;
    };

    this.fsm = new StateMachine<DisconnectorState, DisconnectorEvent>("open", [
      { from: "open", event: "close", to: "closed", guard },
      { from: "closed", event: "open", to: "open", guard },
    ]);
  }

  get state(): DisconnectorState {
    return this.fsm.state;
  }

  close(): void {
    this.attempt("close");
  }

  open(): void {
    this.attempt("open");
  }

  private attempt(event: DisconnectorEvent): void {
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
      subtitle: "Seccionador — sin capacidad de interrupción de arco",
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
        {
          label: "Enclavamiento",
          value:
            this.getInterlockingBreakerState() === "open"
              ? "Habilitado (interruptor abierto)"
              : "Bloqueado (interruptor cerrado)",
          tone: this.getInterlockingBreakerState() === "open" ? "good" : "warning",
        },
        { label: "Función", value: "Aislamiento visible sin carga" },
      ],
      reference: {
        text: "investigaciones/02 §5 — Interruptor vs. seccionador",
        href: "../investigaciones/02-interruptores-arco-electrico.md",
      },
    };
  }
}
