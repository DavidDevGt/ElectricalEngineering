/**
 * Métodos de integración numérica para las EDOs del dominio
 * (docs/adr/0006-euler-semi-implicito-por-defecto.md, investigaciones/09 §3).
 *
 * Regla del proyecto: integrar numéricamente solo lo que tiene no linealidad o acoplamiento real.
 * Lo que tiene solución analítica cerrada (ej. el offset DC de cortocircuito) se evalúa
 * directamente — ver docs/adr/0009-offset-dc-solucion-analitica.md.
 */

/** dy/dt = f(t, y) */
export type Derivative = (t: number, y: number) => number;

/**
 * Euler semi-implícito (symplectic Euler) — método por defecto del proyecto.
 * Casi el mismo costo que Euler explícito, con mucha mejor estabilidad en simulación
 * interactiva prolongada.
 */
export function eulerSemiImplicit(t: number, y: number, dt: number, f: Derivative): number {
  // Se evalúa la derivada con el estado ya avanzado en el tiempo, lo que da la propiedad
  // de estabilidad frente al Euler explícito puro (que evalúa en el instante anterior).
  const predicted = y + dt * f(t, y);
  return y + dt * f(t + dt, predicted);
}

/**
 * Runge-Kutta de 4º orden — 4 evaluaciones por paso.
 * Reservado a la ventana rígida del colapso de conductancia del arco cerca del cruce por cero
 * (investigaciones/02 §1, modelo de Mayr), no como método general.
 */
export function rk4(t: number, y: number, dt: number, f: Derivative): number {
  const k1 = f(t, y);
  const k2 = f(t + dt / 2, y + (dt / 2) * k1);
  const k3 = f(t + dt / 2, y + (dt / 2) * k2);
  const k4 = f(t + dt, y + dt * k3);
  return y + (dt / 6) * (k1 + 2 * k2 + 2 * k3 + k4);
}

/**
 * Integra con sub-pasos: divide `dt` en `substeps` tramos.
 * Es la herramienta para la ventana rígida — mantener el `dt` global del sistema y solo
 * refinar localmente donde la dinámica lo exige (investigaciones/09 §4).
 */
export function integrateSubstepped(
  t: number,
  y: number,
  dt: number,
  substeps: number,
  f: Derivative,
  method: (t: number, y: number, dt: number, f: Derivative) => number = rk4,
): number {
  const h = dt / substeps;
  let state = y;
  let time = t;
  for (let i = 0; i < substeps; i++) {
    state = method(time, state, h, f);
    time += h;
  }
  return state;
}
