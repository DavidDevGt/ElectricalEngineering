export type StepFn = (fixedDeltaSeconds: number) => void;

/** Tope de pasos de física por frame de render, para evitar la "espiral de la muerte"
 * (acumular más y más trabajo pendiente si el dispositivo no sostiene el paso fijo) —
 * ver investigaciones/09-simulacion-tiempo-real-integracion-numerica.md §2, §6 y ADR-005. */
const MAX_STEPS_PER_FRAME = 5;

/**
 * Implementa el patrón "timestep fijo + acumulador" ("Fix Your Timestep!", Glenn Fiedler):
 * desacopla la actualización del modelo de dominio (paso constante, determinista) del
 * framerate variable de `requestAnimationFrame`. Ver docs/adr/0005-timestep-fijo-con-acumulador.md.
 */
export class SimulationClock {
  private accumulatorSeconds = 0;
  private readonly fixedDeltaSeconds: number;

  constructor(fixedTimestepHz = 60) {
    this.fixedDeltaSeconds = 1 / fixedTimestepHz;
  }

  /**
   * Avanza el reloj de simulación con el tiempo real transcurrido desde el último frame,
   * invocando `step` una o más veces con un delta fijo. Devuelve el factor de interpolación
   * [0,1) restante en el acumulador, útil si la capa de render quiere suavizar el resultado
   * visual entre el estado anterior y el actual.
   */
  advance(realDeltaSeconds: number, step: StepFn): number {
    const clampedDelta = Math.min(
      realDeltaSeconds,
      this.fixedDeltaSeconds * MAX_STEPS_PER_FRAME,
    );
    this.accumulatorSeconds += clampedDelta;

    let stepsTaken = 0;
    while (
      this.accumulatorSeconds >= this.fixedDeltaSeconds &&
      stepsTaken < MAX_STEPS_PER_FRAME
    ) {
      step(this.fixedDeltaSeconds);
      this.accumulatorSeconds -= this.fixedDeltaSeconds;
      stepsTaken++;
    }

    return this.accumulatorSeconds / this.fixedDeltaSeconds;
  }
}
