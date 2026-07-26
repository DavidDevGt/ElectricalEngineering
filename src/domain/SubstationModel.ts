import { Transformer } from "./components/Transformer";

type Listener = () => void;

/**
 * Raíz del modelo de dominio eléctrico de la subestación. No importa "three" en ningún punto
 * (ver docs/adr/0002-separacion-modelo-dominio-render.md) — la capa de escena se suscribe a
 * sus cambios (patrón Observer) en vez de que el dominio conozca cómo se renderiza.
 */
export class SubstationModel {
  readonly mainTransformer: Transformer;

  private readonly listeners = new Set<Listener>();

  constructor() {
    // Datos de placa representativos (investigaciones/01 §4.3: 7-11% de %Z típico en
    // subestación 10-100 MVA); no corresponden a un equipo real específico.
    this.mainTransformer = new Transformer({
      ratedPowerMVA: 100,
      impedancePercent: 10,
      ironLossKW: 60,
      copperLossAtRatedLoadKW: 300,
      vectorGroup: "YNd11",
    });
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) listener();
  }

  setMainTransformerLoad(loadFactor: number): void {
    this.mainTransformer.setLoadFactor(loadFactor);
    this.notify();
  }

  /**
   * Paso de simulación de dominio, invocado con timestep fijo desde SimulationClock
   * (docs/adr/0005-timestep-fijo-con-acumulador.md). Vacío en este MVP: el transformador es
   * cuasi-estático (sin EDOs) — el gancho queda listo para cuando se agregue el arco
   * (Cassie-Mayr, ADR-006) u otras dinámicas que sí necesiten integrarse en el tiempo.
   */
  step(_fixedDeltaSeconds: number): void {
    // Intencionalmente vacío en este MVP.
  }
}
