/**
 * Grafo de conectividad de la subestación (docs/adr/0003-grafo-bfs-dfs-sobre-mna.md).
 *
 * Los nodos son barras/circuitos y las aristas son interruptores/seccionadores con estado.
 * La pregunta que responde este módulo es de **alcanzabilidad** ("¿este circuito sigue teniendo
 * camino hacia una fuente?"), no de reparto de corriente — para eso haría falta análisis nodal
 * (MNA), deliberadamente descartado por sobredimensionado para el objetivo pedagógico.
 */

export interface GraphNode {
  id: string;
  label: string;
  /** Una fuente inyecta energía en la red (línea entrante, generador). */
  isSource: boolean;
  /** Un circuito es una salida cuyo servicio nos interesa medir tras una falla. */
  isCircuit: boolean;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  /** Un elemento abierto no conduce. */
  closed: boolean;
  /** Un elemento fallado se considera fuera de servicio (y no conduce). */
  faulted: boolean;
}

export class ConnectivityGraph {
  private readonly nodes = new Map<string, GraphNode>();
  private readonly edges = new Map<string, GraphEdge>();

  addNode(node: GraphNode): this {
    this.nodes.set(node.id, node);
    return this;
  }

  addEdge(edge: GraphEdge): this {
    this.edges.set(edge.id, edge);
    return this;
  }

  getNode(id: string): GraphNode | undefined {
    return this.nodes.get(id);
  }

  getEdge(id: string): GraphEdge | undefined {
    return this.edges.get(id);
  }

  listNodes(): GraphNode[] {
    return [...this.nodes.values()];
  }

  listEdges(): GraphEdge[] {
    return [...this.edges.values()];
  }

  setEdgeClosed(id: string, closed: boolean): void {
    const edge = this.edges.get(id);
    if (edge) edge.closed = closed;
  }

  setEdgeFaulted(id: string, faulted: boolean): void {
    const edge = this.edges.get(id);
    if (edge) edge.faulted = faulted;
  }

  /** Una arista conduce solo si está cerrada y sana. */
  private conducts(edge: GraphEdge): boolean {
    return edge.closed && !edge.faulted;
  }

  /**
   * Recorrido en anchura (BFS) desde todas las fuentes: devuelve el conjunto de nodos
   * energizados. Es el cálculo de componentes conexos que reemplaza a un solver de circuito.
   */
  energizedNodes(): Set<string> {
    const energized = new Set<string>();
    const queue: string[] = [];

    for (const node of this.nodes.values()) {
      if (node.isSource) {
        energized.add(node.id);
        queue.push(node.id);
      }
    }

    // Índice de adyacencia construido en el momento: el grafo es pequeño (decenas de aristas),
    // así que no compensa mantener una estructura incremental.
    const adjacency = new Map<string, string[]>();
    const link = (a: string, b: string): void => {
      const list = adjacency.get(a);
      if (list) list.push(b);
      else adjacency.set(a, [b]);
    };
    for (const edge of this.edges.values()) {
      if (!this.conducts(edge)) continue;
      link(edge.from, edge.to);
      link(edge.to, edge.from);
    }

    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const neighbour of adjacency.get(current) ?? []) {
        if (energized.has(neighbour)) continue;
        energized.add(neighbour);
        queue.push(neighbour);
      }
    }

    return energized;
  }

  isEnergized(nodeId: string): boolean {
    return this.energizedNodes().has(nodeId);
  }

  /** Circuitos que quedaron sin ninguna trayectoria hacia una fuente. */
  deEnergizedCircuits(): GraphNode[] {
    const energized = this.energizedNodes();
    return this.listNodes().filter((n) => n.isCircuit && !energized.has(n.id));
  }

  /** Copia profunda del estado de aristas — útil para simular una falla sin mutar el original. */
  snapshot(): Map<string, { closed: boolean; faulted: boolean }> {
    const snap = new Map<string, { closed: boolean; faulted: boolean }>();
    for (const [id, edge] of this.edges) {
      snap.set(id, { closed: edge.closed, faulted: edge.faulted });
    }
    return snap;
  }

  restore(snapshot: Map<string, { closed: boolean; faulted: boolean }>): void {
    for (const [id, state] of snapshot) {
      const edge = this.edges.get(id);
      if (!edge) continue;
      edge.closed = state.closed;
      edge.faulted = state.faulted;
    }
  }
}
