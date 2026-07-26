/**
 * Máquina de estados finitos mínima, implementada a mano (docs/adr/0004-fsm-a-mano-sobre-statecharts-libreria.md).
 * Adopta el *patrón* de statecharts de Harel — estados explícitos, transiciones declaradas en un
 * solo lugar, guardas que pueden bloquear con una razón — sin añadir XState como dependencia.
 *
 * La guarda devuelve `true` si la transición es válida, o un `string` con la razón del bloqueo.
 * Ese `string` es lo que hace posible modelar el enclavamiento interruptor-seccionador de forma
 * explicativa (investigaciones/02 §5): la máquina no solo impide la maniobra, dice por qué.
 */
export type GuardResult = true | string;

export interface Transition<S extends string, E extends string> {
  from: S;
  event: E;
  to: S;
  /** Si devuelve un string, la transición se rechaza con esa razón. */
  guard?: () => GuardResult;
  /** Efecto lateral al ejecutar la transición (ej. arrancar un temporizador). */
  action?: () => void;
}

export type TransitionOutcome<S extends string> =
  | { ok: true; from: S; to: S }
  | { ok: false; reason: string };

export class StateMachine<S extends string, E extends string> {
  private current: S;
  private readonly transitions: readonly Transition<S, E>[];

  constructor(initial: S, transitions: readonly Transition<S, E>[]) {
    this.current = initial;
    this.transitions = transitions;
  }

  get state(): S {
    return this.current;
  }

  is(state: S): boolean {
    return this.current === state;
  }

  /** ¿Existe una transición declarada para este evento desde el estado actual? */
  can(event: E): boolean {
    return this.transitions.some((t) => t.from === this.current && t.event === event);
  }

  /**
   * Intenta disparar un evento. Devuelve el resultado en vez de lanzar una excepción:
   * un bloqueo por enclavamiento es un resultado esperado del dominio, no un error de programa.
   */
  send(event: E): TransitionOutcome<S> {
    const transition = this.transitions.find(
      (t) => t.from === this.current && t.event === event,
    );

    if (!transition) {
      return {
        ok: false,
        reason: `La maniobra "${event}" no es válida en el estado "${this.current}".`,
      };
    }

    if (transition.guard) {
      const verdict = transition.guard();
      if (verdict !== true) return { ok: false, reason: verdict };
    }

    const from = this.current;
    this.current = transition.to;
    transition.action?.();
    return { ok: true, from, to: this.current };
  }

  /** Fuerza un estado sin evaluar guardas — reservado para reset del escenario, no para maniobra. */
  reset(state: S): void {
    this.current = state;
  }
}
