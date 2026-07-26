import type { ComponentId, FaultKind } from "./types";

/**
 * Eventos de dominio. La capa de escena y la UI se suscriben a estos en vez de sondear el
 * estado (patrón Observer / pub-sub, ADR-002) — el dominio nunca llama directamente a
 * Three.js ni al DOM.
 */
export type DomainEvent =
  /** Cambió el estado de un componente; la vista debe re-sincronizarse. */
  | { type: "component-changed"; id: ComponentId }
  /** Se intentó una maniobra prohibida por enclavamiento (investigaciones/02 §5). */
  | { type: "interlock-blocked"; id: ComponentId; reason: string }
  /** El usuario (o el sistema) inyectó una falla. */
  | { type: "fault-injected"; kind: FaultKind; locationLabel: string }
  /** Un relé detectó la falla y arrancó su temporización. */
  | { type: "relay-pickup"; relayId: ComponentId; functionCode: string; expectedDelayMs: number }
  /** Un relé emitió orden de disparo a la bobina del interruptor. */
  | { type: "trip-issued"; relayId: ComponentId; breakerId: ComponentId; functionCode: string }
  /** Los contactos del interruptor se separaron y se estableció el arco. */
  | { type: "arc-established"; breakerId: ComponentId }
  /** El arco se extinguió en un cruce por cero (investigaciones/02 §2). */
  | { type: "arc-extinguished"; breakerId: ComponentId; arcingTimeMs: number }
  /** Falla despejada: tiempo total desde inicio hasta extinción final. */
  | { type: "fault-cleared"; totalClearingMs: number }
  /** Reencendido del arco: la TRV ganó la carrera a la rigidez dieléctrica. */
  | { type: "restrike"; breakerId: ComponentId }
  /** Mensaje para el usuario (feedback educativo, investigaciones/11 §5). */
  | { type: "notice"; level: "info" | "success" | "warning" | "danger"; message: string }
  /** Cambió la topología o el estado de energización de la red. */
  | { type: "topology-changed" }
  /** Se seleccionó un componente para inspección. */
  | { type: "selection-changed"; id: ComponentId | null };

export type DomainEventListener = (event: DomainEvent) => void;

/** Bus de eventos mínimo, sin dependencias. */
export class EventBus {
  private readonly listeners = new Set<DomainEventListener>();

  subscribe(listener: DomainEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  emit(event: DomainEvent): void {
    // Se itera sobre una copia: un listener puede desuscribirse durante la emisión.
    for (const listener of [...this.listeners]) listener(event);
  }
}
