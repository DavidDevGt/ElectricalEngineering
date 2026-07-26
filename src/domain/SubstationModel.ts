import { Busbar } from "./components/Busbar";
import { CircuitBreaker } from "./components/CircuitBreaker";
import { CurrentTransformer } from "./components/CurrentTransformer";
import { Disconnector } from "./components/Disconnector";
import { GroundGrid } from "./components/GroundGrid";
import { ProtectionRelay } from "./components/ProtectionRelay";
import { SurgeArrester } from "./components/SurgeArrester";
import { Transformer } from "./components/Transformer";
import { VoltageTransformer } from "./components/VoltageTransformer";
import { EventBus } from "./events";
import { ConnectivityGraph } from "./topology/Graph";
import type { ComponentId, SubstationComponent } from "./types";

/**
 * Raíz del modelo de dominio eléctrico de una bahía de línea completa. No importa "three" en
 * ningún punto (docs/adr/0002-separacion-modelo-dominio-render.md).
 *
 * Comunica cambios a la capa de escena y a la UI vía `events` (EventBus, ver
 * src/domain/events.ts) en vez de que el dominio conozca cómo se renderiza o se muestra el HUD —
 * mismo patrón Observer que antes, con eventos tipados en vez de un simple callback de "algo
 * cambió", para poder distinguir un "component-changed" de un "interlock-blocked".
 */
export class SubstationModel {
  readonly events = new EventBus();
  readonly graph = new ConnectivityGraph();

  readonly lineDisconnector: Disconnector;
  readonly breaker: CircuitBreaker;
  readonly busDisconnector: Disconnector;
  readonly transformer: Transformer;
  readonly lineCurrentTransformer: CurrentTransformer;
  readonly lineVoltageTransformer: VoltageTransformer;
  readonly surgeArrester: SurgeArrester;
  readonly busbar: Busbar;
  readonly groundGrid: GroundGrid;
  readonly protectionRelay: ProtectionRelay;

  private readonly registry = new Map<ComponentId, SubstationComponent>();

  constructor() {
    this.breaker = new CircuitBreaker("breaker-1", "Interruptor de línea", this.events);
    this.lineDisconnector = new Disconnector(
      "disc-line",
      "Seccionador de línea",
      this.events,
      () => this.breaker.state,
    );
    this.busDisconnector = new Disconnector(
      "disc-bus",
      "Seccionador de barra",
      this.events,
      () => this.breaker.state,
    );
    // Datos de placa representativos (investigaciones/01 §4.3: 7-11% de %Z típico en
    // subestación 10-100 MVA); no corresponden a un equipo real específico.
    this.transformer = new Transformer("transformer-1", "Transformador de potencia", {
      ratedPowerMVA: 100,
      impedancePercent: 10,
      ironLossKW: 60,
      copperLossAtRatedLoadKW: 300,
      vectorGroup: "YNd11",
    });

    this.lineCurrentTransformer = new CurrentTransformer("ct-line", "Transformador de corriente", {
      ratedPrimaryCurrentA: 1000,
      ratedSecondaryCurrentA: 5,
      meteringAccuracyClass: "0.5",
      protectionAccuracyClass: "5P20",
      accuracyLimitFactor: 20,
      ratedBurdenVA: 15,
    });

    this.lineVoltageTransformer = new VoltageTransformer("vt-line", "Transformador de potencial", {
      primaryVoltageLLkV: 230,
      secondaryVoltageV: 110,
      ratedBurdenVA: 75,
      accuracyClass: "0.5",
    });

    // Ratings por defecto ya derivadas para un sistema de 230 kV (investigaciones/05 §4) —
    // ver SurgeArrester.typicalStationClassRatings230kV().
    this.surgeArrester = new SurgeArrester("arrester-1", "Pararrayos");

    // El busbar no calcula su propia energización: delega en el mismo grafo de conectividad
    // que ya resuelve isBusEnergized() para los conductores de la escena (investigaciones/12 §2,
    // docs/adr/0003-grafo-bfs-dfs-sobre-mna.md) — una sola fuente de verdad, no una copia.
    this.busbar = new Busbar("busbar-1", "Barra colectora", () => this.isBusEnergized());

    // Spec por defecto ya representativa (investigaciones/04 §3-4) —
    // ver GroundGrid.TYPICAL_GROUND_GRID_SPEC.
    this.groundGrid = new GroundGrid("ground-grid-1", "Malla de puesta a tierra");

    this.protectionRelay = new ProtectionRelay("relay-1", "Relé de protección (IED)", "primary", {
      ctRatio: "1000/5",
      overcurrentPickupA: 5,
      timeDialSetting: 5,
      curveFamily: "VI",
      coordinationTimeIntervalS: 0.3,
      samplingRatePerCycle: 32,
      communicationProtocol: "IEC 61850 (GOOSE)",
      functions: [
        {
          ansiCode: "50/51",
          name: "Sobrecorriente de fases",
          description:
            "Instantánea + temporizada, respaldo de la línea entrante (investigaciones/03 §2).",
        },
        {
          ansiCode: "87T",
          name: "Diferencial de transformador",
          description:
            "Compara corrientes primario/secundario del transformador; discrimina inrush por " +
            "contenido de 2º armónico (investigaciones/01 §7, investigaciones/03 §3).",
        },
      ],
    });

    this.register(
      this.lineDisconnector,
      this.breaker,
      this.busDisconnector,
      this.transformer,
      this.lineCurrentTransformer,
      this.lineVoltageTransformer,
      this.surgeArrester,
      this.busbar,
      this.groundGrid,
      this.protectionRelay,
    );
    this.buildGraph();
  }

  /** Registra un componente en el índice genérico (usado por el panel de inspección vía id). */
  register(...components: SubstationComponent[]): void {
    for (const component of components) this.registry.set(component.id, component);
  }

  getComponent(id: ComponentId): SubstationComponent | undefined {
    return this.registry.get(id);
  }

  listComponents(): SubstationComponent[] {
    return [...this.registry.values()];
  }

  private buildGraph(): void {
    this.graph
      .addNode({ id: "source", label: "Línea entrante", isSource: true, isCircuit: false })
      .addNode({ id: "junction-a", label: "Entre seccionador y TC", isSource: false, isCircuit: false })
      .addNode({ id: "junction-b", label: "Entre TC e interruptor", isSource: false, isCircuit: false })
      .addNode({ id: "busbar", label: "Barra / transformador", isSource: false, isCircuit: true })
      .addEdge({ id: this.lineDisconnector.id, from: "source", to: "junction-a", closed: false, faulted: false })
      .addEdge({ id: this.breaker.id, from: "junction-a", to: "junction-b", closed: false, faulted: false })
      .addEdge({ id: this.busDisconnector.id, from: "junction-b", to: "busbar", closed: false, faulted: false });
  }

  private syncGraphFromComponentStates(): void {
    this.graph.setEdgeClosed(this.lineDisconnector.id, this.lineDisconnector.state === "closed");
    this.graph.setEdgeClosed(this.breaker.id, this.breaker.state === "closed");
    this.graph.setEdgeClosed(this.busDisconnector.id, this.busDisconnector.state === "closed");
  }

  /** Nodos del patio alcanzables desde la fuente con el estado actual de maniobra (BFS,
   * docs/adr/0003-grafo-bfs-dfs-sobre-mna.md) — usado para propagar el color de "energizado"
   * por los conductores en la escena. */
  energizedNodes(): Set<string> {
    this.syncGraphFromComponentStates();
    return this.graph.energizedNodes();
  }

  /** ¿Llega energía hasta la barra/transformador con el estado actual de maniobra? */
  isBusEnergized(): boolean {
    return this.energizedNodes().has("busbar");
  }

  setMainTransformerLoad(loadFactor: number): void {
    this.transformer.setLoadFactor(loadFactor);
    this.events.emit({ type: "component-changed", id: this.transformer.id });
  }

  /**
   * Paso de simulación de dominio, invocado con timestep fijo desde SimulationClock
   * (docs/adr/0005-timestep-fijo-con-acumulador.md). Llama a `step()` en cada componente que lo
   * implemente — hoy ninguno lo necesita (todos son cuasi-estáticos), pero el gancho queda listo
   * para cuando se agregue el arco (Cassie-Mayr, ADR-006) u otras dinámicas continuas.
   */
  step(fixedDeltaSeconds: number): void {
    for (const component of this.registry.values()) {
      component.step?.(fixedDeltaSeconds);
    }
  }
}
