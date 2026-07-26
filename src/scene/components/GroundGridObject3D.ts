import * as THREE from "three";
import type { GroundGrid } from "../../domain/components/GroundGrid";
import { GROUND_GRID } from "../layout";

const CONDUCTOR_COLOR = 0x565c63;
const ROD_COLOR = 0x3a4048;
const CONDUCTOR_OPACITY = 0.55;
/** Espesor de cada "conductor" simulado — muy delgado, como un cable real visto a escala 1:1. */
const CONDUCTOR_THICKNESS = 0.03;

/**
 * Representación 3D de la malla de puesta a tierra (grounding grid): una rejilla de conductores
 * de cobre desnudo enterrados bajo el patio, más electrodos verticales (ground rods) en las
 * esquinas (investigaciones/04 §4.1). Construida con primitivas (BoxGeometry/CylinderGeometry —
 * docs/adr/0001-primitivas-threejs-sobre-modelos-importados.md), no con THREE.Line, para que cada
 * conductor sea un Mesh seleccionable por el raycaster del proyecto.
 *
 * El tamaño y espaciamiento de la rejilla vienen de las constantes GROUND_GRID de scene/layout.ts
 * (compartidas con el resto del patio); quien integre este objeto decide su posición final en la
 * escena (normalmente centrada bajo toda la huella de la subestación).
 *
 * No calcula nada eléctrico: no hay heatmap de potencial de superficie ni tensión de paso/contacto
 * en vivo aquí — eso es la mecánica del modo falla (investigaciones/04 §8, ADR-007), fuera de
 * alcance de este MVP. Esta clase solo dibuja la geometría física de la malla, ligeramente
 * enterrada y con opacidad reducida para sugerir "conductor bajo tierra" sin gradiente de color.
 */
export class GroundGridObject3D extends THREE.Group {
  private readonly groundGrid: GroundGrid;

  constructor(groundGrid: GroundGrid) {
    super();
    this.groundGrid = groundGrid;
    this.name = groundGrid.label;
    this.userData = { componentId: groundGrid.id, componentType: groundGrid.kind };

    const { halfWidthX, halfWidthZ, spacing, burialDepth } = GROUND_GRID;
    const conductorY = -burialDepth;

    // Zona de click invisible: los conductores reales miden 3 cm de espesor y están enterrados —
    // prácticamente imposibles de "acertar" con el mouse. Un solo hitbox cubre toda la huella de
    // la malla (mismo patrón que DisconnectorObject3D.ts).
    const hitbox = new THREE.Mesh(
      new THREE.BoxGeometry(2 * halfWidthX + 0.5, 1.2, 2 * halfWidthZ + 0.5),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
    );
    hitbox.position.set(0, conductorY - 0.3, 0);
    this.add(hitbox);

    const conductorMaterial = new THREE.MeshStandardMaterial({
      color: CONDUCTOR_COLOR,
      roughness: 0.7,
      metalness: 0.4,
      transparent: true,
      opacity: CONDUCTOR_OPACITY,
      depthWrite: false,
    });

    // Conductores paralelos al eje X (varían en Z), espaciados según GROUND_GRID.spacing
    // (investigaciones/04 §4.1: 3-7 m típico).
    const xRunGeometry = new THREE.BoxGeometry(
      2 * halfWidthX,
      CONDUCTOR_THICKNESS,
      CONDUCTOR_THICKNESS,
    );
    for (let z = -halfWidthZ; z <= halfWidthZ + 1e-6; z += spacing) {
      const run = new THREE.Mesh(xRunGeometry, conductorMaterial);
      run.position.set(0, conductorY, z);
      this.add(run);
    }

    // Conductores paralelos al eje Z (varían en X).
    const zRunGeometry = new THREE.BoxGeometry(
      CONDUCTOR_THICKNESS,
      CONDUCTOR_THICKNESS,
      2 * halfWidthZ,
    );
    for (let x = -halfWidthX; x <= halfWidthX + 1e-6; x += spacing) {
      const run = new THREE.Mesh(zRunGeometry, conductorMaterial);
      run.position.set(x, conductorY, 0);
      this.add(run);
    }

    // Electrodos verticales (ground rods) en las 4 esquinas — no reducen mucho R_g por sí solos,
    // pero estabilizan la resistencia frente a variación estacional de humedad y mitigan
    // gradientes locales en puntos de inyección de corriente (investigaciones/04 §4.1).
    const rodMaterial = new THREE.MeshStandardMaterial({
      color: ROD_COLOR,
      roughness: 0.6,
      metalness: 0.5,
      transparent: true,
      opacity: CONDUCTOR_OPACITY,
      depthWrite: false,
    });
    const rodLength = groundGrid.spec.groundRodLengthM;
    const rodGeometry = new THREE.CylinderGeometry(0.04, 0.04, rodLength, 8);
    for (const x of [-halfWidthX, halfWidthX]) {
      for (const z of [-halfWidthZ, halfWidthZ]) {
        const rod = new THREE.Mesh(rodGeometry, rodMaterial);
        rod.position.set(x, conductorY - rodLength / 2, z);
        this.add(rod);
      }
    }

    this.sync();
  }

  /**
   * La malla no tiene estado dinámico en este MVP (sin FSM, sin animación de falla) — sus
   * conductores están fijos en la geometría de diseño. Se mantiene el método por consistencia de
   * interfaz con cómo main.ts llama sync() en todos los objetos 3D del patio.
   */
  sync(): void {
    // Nada que sincronizar todavía: ver investigaciones/04 §8 / ADR-007 para el heatmap de
    // potencial de superficie que activaría este método en una versión futura del modo falla.
    void this.groundGrid;
  }
}
