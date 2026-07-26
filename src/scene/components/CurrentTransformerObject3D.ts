import * as THREE from "three";
import type { CurrentTransformer } from "../../domain/components/CurrentTransformer";

const PORCELAIN_COLOR = 0xb0a89c;
const CONDUCTOR_COLOR = 0xcfd8dc;
const CORE_COLOR = 0x9aa2ab;
const JUNCTION_BOX_COLOR = 0x2a2f35;

const PEDESTAL_HEIGHT = 0.9;
const PEDESTAL_RADIUS_BOTTOM = 0.16;
const PEDESTAL_RADIUS_TOP = 0.12;
const CONDUCTOR_LENGTH = 1.1;
const CONDUCTOR_RADIUS = 0.035;

/**
 * Representación 3D de un transformador de corriente (TC/CT) tipo "post" independiente:
 * pedestal aislante de porcelana soportando un tramo corto de conductor vertical que atraviesa
 * dos núcleos toroidales apilados (docs/adr/0001-primitivas-threejs-sobre-modelos-importados.md).
 *
 * Se modelan **dos** anillos porque en la práctica un TC de patio aloja varios núcleos
 * secundarios independientes bajo la misma envolvente — típicamente uno de medición y uno (o
 * más) de protección, cada uno con su propia clase de precisión (investigaciones/07 §3). El
 * anillo superior (protección) se dibuja algo más grande, reflejando que suele requerir mayor
 * sección de núcleo para mantener precisión hasta el ALF (§1.4). No representa a escala real: es
 * una simplificación educativa de una construcción que en la vida real está sellada dentro de una
 * envolvente de porcelana o resina y no es visible desde afuera.
 *
 * El TC es un equipo pasivo: no tiene maniobra ni estado operativo propio (a diferencia del
 * interruptor o el seccionador), por lo que no hay nada dinámico que este objeto deba animar.
 * `sync()` existe solo por consistencia de interfaz con el resto de los objetos de escena
 * (docs/adr/0002-separacion-modelo-dominio-render.md) — no calcula ni traduce nada porque el
 * dominio no expone estado variable.
 */
export class CurrentTransformerObject3D extends THREE.Group {
  private readonly currentTransformer: CurrentTransformer;

  constructor(currentTransformer: CurrentTransformer) {
    super();
    this.currentTransformer = currentTransformer;
    this.name = currentTransformer.label;
    this.userData = {
      componentId: currentTransformer.id,
      componentType: currentTransformer.kind,
      ratings: currentTransformer.ratings,
    };

    // Zona de click invisible: el conductor y los anillos son piezas delgadas, difíciles de
    // acertar con el mouse — mismo patrón que DisconnectorObject3D.ts.
    const hitbox = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 2.3, 0.6),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
    );
    hitbox.position.set(0, 1.1, 0);
    this.add(hitbox);

    const pedestalMaterial = new THREE.MeshStandardMaterial({
      color: PORCELAIN_COLOR,
      roughness: 0.35,
    });

    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(PEDESTAL_RADIUS_TOP, PEDESTAL_RADIUS_BOTTOM, PEDESTAL_HEIGHT, 16),
      pedestalMaterial,
    );
    pedestal.position.y = PEDESTAL_HEIGHT / 2;
    pedestal.castShadow = true;
    this.add(pedestal);

    // Aletas ("sheds") del aislador de porcelana — puramente decorativas, aumentan la línea de
    // fuga real del aislador (investigaciones/05 trata coordinación de aislamiento en general).
    const shedGeometry = new THREE.TorusGeometry(0.17, 0.025, 8, 20);
    const shedHeights = [0.15, 0.35, 0.55, 0.75];
    for (const y of shedHeights) {
      const taper = 1 - y / (PEDESTAL_HEIGHT + 0.3);
      const shed = new THREE.Mesh(shedGeometry, pedestalMaterial);
      shed.scale.set(taper, taper, 1);
      shed.position.y = y;
      shed.rotation.x = Math.PI / 2;
      shed.castShadow = true;
      this.add(shed);
    }

    // Tramo corto de conductor primario que atraviesa la ventana de ambos núcleos — el TC ve el
    // paso de este conductor como su devanado primario de 1 espira (investigaciones/07 §1.1).
    const conductorMaterial = new THREE.MeshStandardMaterial({
      color: CONDUCTOR_COLOR,
      metalness: 0.6,
      roughness: 0.3,
    });
    const conductor = new THREE.Mesh(
      new THREE.CylinderGeometry(CONDUCTOR_RADIUS, CONDUCTOR_RADIUS, CONDUCTOR_LENGTH, 12),
      conductorMaterial,
    );
    conductor.position.y = PEDESTAL_HEIGHT + CONDUCTOR_LENGTH / 2;
    conductor.castShadow = true;
    this.add(conductor);

    // Terminales (pads) en los extremos del conductor, punto de empalme con el resto del bus.
    const capGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.06, 12);
    const bottomCap = new THREE.Mesh(capGeometry, conductorMaterial);
    bottomCap.position.y = PEDESTAL_HEIGHT;
    this.add(bottomCap);
    const topCap = new THREE.Mesh(capGeometry, conductorMaterial);
    topCap.position.y = PEDESTAL_HEIGHT + CONDUCTOR_LENGTH;
    this.add(topCap);

    const coreMaterial = new THREE.MeshStandardMaterial({
      color: CORE_COLOR,
      metalness: 0.4,
      roughness: 0.5,
    });

    // Núcleo de medición (inferior): se satura a propósito ante una falla para proteger los
    // instrumentos conectados (clase 0.2/0.5, investigaciones/07 §1.4 y §3).
    const meteringCore = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.05, 10, 24), coreMaterial);
    meteringCore.position.y = PEDESTAL_HEIGHT + 0.35;
    meteringCore.rotation.x = Math.PI / 2;
    meteringCore.castShadow = true;
    this.add(meteringCore);

    // Núcleo de protección (superior, algo mayor): debe mantener precisión hasta el ALF —p. ej.
    // 20× In en un TC 5P20— para que el relé no subestime la corriente de falla (§1.4 y §3).
    const protectionCore = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.06, 10, 24), coreMaterial);
    protectionCore.position.y = PEDESTAL_HEIGHT + 0.75;
    protectionCore.rotation.x = Math.PI / 2;
    protectionCore.castShadow = true;
    this.add(protectionCore);

    // Caja de bornes secundarios ("terminal/marshalling box"): aquí termina el cableado hacia
    // instrumentos y relés cuya resistencia forma parte del burden del TC (§1.3). Se dibuja al
    // pie del pedestal, como en una instalación real.
    const junctionBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.22, 0.18, 0.16),
      new THREE.MeshStandardMaterial({ color: JUNCTION_BOX_COLOR, roughness: 0.6, metalness: 0.2 }),
    );
    junctionBox.position.set(PEDESTAL_RADIUS_BOTTOM + 0.13, 0.3, 0);
    junctionBox.castShadow = true;
    this.add(junctionBox);
  }

  /**
   * El TC es un equipo pasivo sin estado operativo variable (no hay "abierto/cerrado" ni carga
   * que fijar desde afuera — la corriente primaria la impone el sistema, investigaciones/07
   * §1.1). No hay nada que este método deba traducir hoy; existe para que `main.ts` pueda tratar
   * a todos los objetos de escena de forma uniforme tras cada cambio del modelo.
   */
  sync(): void {
    void this.currentTransformer;
  }
}
