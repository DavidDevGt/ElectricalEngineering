import * as THREE from "three";
import type { Busbar } from "../../domain/components/Busbar";
import { BUSBAR_HALF_LENGTH, CONDUCTOR_HEIGHT } from "../layout";

const TUBE_COLOR = 0xb0a89c;
const STRUCTURE_COLOR = 0x3a4048;
const INSULATOR_COLOR = 0xcfd8dc;
const ENERGIZED_COLOR = 0x4caf50;
const DE_ENERGIZED_COLOR = 0x8a8f96;

/** Radio del tubo de aluminio (≈150 mm de diámetro exterior, valor típico de barra rígida AIS
 * en 230 kV — ver comentario de material en Busbar.ts). */
const TUBE_RADIUS = 0.075;

/** Altura del tramo de aislador de poste sobre la estructura de soporte metálica. */
const INSULATOR_HEIGHT = 1.1;

/** Fracción de BUSBAR_HALF_LENGTH a la que se ubican los soportes exteriores (el tercero queda
 * en el centro, z = 0) — dos vanos de apoyo en vez de uno solo, la barra completa es demasiado
 * larga para un tubo rígido en voladizo (investigaciones/06 §1, barra colectora como tramo
 * continuo entre bahías). */
const SUPPORT_Z_FRACTION = 2 / 3;

/**
 * Representación 3D de un tramo de barra colectora rígida: un tubo horizontal de aluminio
 * corriendo a lo largo del eje Z (mismo eje que `layout.ts` reserva para la barra colectora),
 * sostenido por soportes tipo estructura metálica + aislador de poste — la silueta clásica de
 * una barra tubular AIS (investigaciones/06 §1; IDEA.md §3.7).
 *
 * Construida solo con primitivas (docs/adr/0001-primitivas-threejs-sobre-modelos-importados.md).
 * No calcula nada eléctrico: `sync()` solo traduce el estado ya resuelto por `Busbar.energized`
 * a color/emisivo (docs/adr/0002-separacion-modelo-dominio-render.md). El eje X local queda libre
 * para que quien integre esta pieza en la escena la posicione/rote según convenga.
 */
export class BusbarObject3D extends THREE.Group {
  private readonly busbar: Busbar;
  private readonly tubeMaterial: THREE.MeshStandardMaterial;
  private readonly statusLightMaterial: THREE.MeshStandardMaterial;

  constructor(busbar: Busbar) {
    super();
    this.busbar = busbar;
    this.name = busbar.label;
    this.userData = { componentId: busbar.id, componentType: busbar.kind };

    const length = BUSBAR_HALF_LENGTH * 2;

    // Zona de click invisible: el tubo mide pocos centímetros de radio y corre a
    // CONDUCTOR_HEIGHT de altura — sin un hitbox generoso que cubra toda la columna (soportes +
    // tubo), es casi imposible de seleccionar con el mouse. Mismo patrón que DisconnectorObject3D.
    const hitbox = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, CONDUCTOR_HEIGHT + 0.4, length + 0.6),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
    );
    hitbox.position.set(0, (CONDUCTOR_HEIGHT + 0.4) / 2, 0);
    this.add(hitbox);

    // Tubo principal: CylinderGeometry nace alineado al eje Y; se rota 90° sobre X para que su
    // eje quede a lo largo de Z (dirección de la barra colectora, ver layout.ts).
    this.tubeMaterial = new THREE.MeshStandardMaterial({
      color: TUBE_COLOR,
      metalness: 0.6,
      roughness: 0.35,
      emissive: DE_ENERGIZED_COLOR,
      emissiveIntensity: 0,
    });
    const tube = new THREE.Mesh(
      new THREE.CylinderGeometry(TUBE_RADIUS, TUBE_RADIUS, length, 16),
      this.tubeMaterial,
    );
    tube.rotation.x = Math.PI / 2;
    tube.position.y = CONDUCTOR_HEIGHT;
    tube.castShadow = true;
    this.add(tube);

    const structureMaterial = new THREE.MeshStandardMaterial({
      color: STRUCTURE_COLOR,
      roughness: 0.7,
      metalness: 0.4,
    });
    const insulatorMaterial = new THREE.MeshStandardMaterial({
      color: INSULATOR_COLOR,
      roughness: 0.25,
    });

    const supportZ = [-BUSBAR_HALF_LENGTH * SUPPORT_Z_FRACTION, 0, BUSBAR_HALF_LENGTH * SUPPORT_Z_FRACTION];
    for (const z of supportZ) {
      this.add(this.buildSupport(z, structureMaterial, insulatorMaterial));
    }

    // Luz de estado energizado, junto a un soporte — misma convención que TransformerObject3D /
    // DisconnectorObject3D: un indicador puntual además del cambio de color del propio conductor,
    // para que el estado sea legible incluso desde lejos.
    this.statusLightMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      emissive: DE_ENERGIZED_COLOR,
      emissiveIntensity: 1,
    });
    const statusLight = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 14), this.statusLightMaterial);
    statusLight.position.set(0, CONDUCTOR_HEIGHT + 0.2, supportZ[2]);
    this.add(statusLight);

    this.sync();
  }

  /** Construye un soporte (estructura metálica + aislador de poste con "faldones") en la
   * posición z indicada, desde el suelo (y=0) hasta la altura del tubo. */
  private buildSupport(
    z: number,
    structureMaterial: THREE.MeshStandardMaterial,
    insulatorMaterial: THREE.MeshStandardMaterial,
  ): THREE.Group {
    const support = new THREE.Group();
    support.position.z = z;

    const structureHeight = CONDUCTOR_HEIGHT - INSULATOR_HEIGHT;
    const structure = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.2, structureHeight, 8),
      structureMaterial,
    );
    structure.position.y = structureHeight / 2;
    structure.castShadow = true;
    support.add(structure);

    const insulator = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.09, INSULATOR_HEIGHT, 16),
      insulatorMaterial,
    );
    insulator.position.y = structureHeight + INSULATOR_HEIGHT / 2;
    insulator.castShadow = true;
    support.add(insulator);

    // Faldones (sheds) del aislador de poste — silueta típica de porcelana de patio AIS.
    const shedGeometry = new THREE.TorusGeometry(0.11, 0.018, 8, 16);
    const shedCount = 4;
    for (let i = 0; i < shedCount; i++) {
      const shed = new THREE.Mesh(shedGeometry, insulatorMaterial);
      shed.rotation.x = Math.PI / 2;
      shed.position.y = structureHeight + ((i + 0.5) / shedCount) * INSULATOR_HEIGHT;
      support.add(shed);
    }

    return support;
  }

  /**
   * Refleja el estado del modelo de dominio en la escena. Se llama tras cada cambio relevante
   * (patrón Observer, ver SubstationModel.subscribe) — no contiene lógica eléctrica: solo lee
   * `Busbar.energized` (que a su vez delega en la función `getEnergized` inyectada al dominio) y
   * traduce ese booleano a color/emisivo.
   */
  sync(): void {
    const energized = this.busbar.energized;
    const color = energized ? ENERGIZED_COLOR : DE_ENERGIZED_COLOR;

    this.tubeMaterial.emissive.set(color);
    this.tubeMaterial.emissiveIntensity = energized ? 0.6 : 0;

    this.statusLightMaterial.emissive.set(color);
    this.statusLightMaterial.emissiveIntensity = energized ? 1 : 0.5;
  }
}
