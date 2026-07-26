import * as THREE from "three";
import type { SurgeArrester } from "../../domain/components/SurgeArrester";

const PEDESTAL_COLOR = 0xb0a89c;
const DISC_COLOR_A = 0xcfd8dc;
const DISC_COLOR_B = 0xb0a89c;
const GRADING_RING_COLOR = 0x9aa0a6;
const CAP_COLOR = 0xcfd8dc;
const MARGIN_OK_COLOR = 0x4caf50;
const MARGIN_LOW_COLOR = 0xef5350;

const DISC_COUNT = 5;
const DISC_RADIUS = 0.14;
const DISC_HEIGHT = 0.28;
const DISC_GAP = 0.03;
const PEDESTAL_HEIGHT = 0.5;

/**
 * Representación 3D del pararrayos de óxido de zinc: pedestal aislante, columna de "discos"
 * apilados (varistores de ZnO dentro de una envolvente de porcelana/polímero — investigaciones/05
 * §4) y anillo de gradiente de campo (corona ring) en el extremo superior, cerca del terminal de
 * línea. Se simula la apariencia de discos individuales con varios cilindros cortos separados por
 * un gap pequeño en vez de una columna lisa, para que sea visualmente distinguible del seccionador
 * o del pasatapas de un transformador.
 *
 * No calcula nada eléctrico: solo traduce el margen de protección ya calculado por el
 * `SurgeArrester` de dominio a un color de estado (docs/adr/0002-separacion-modelo-dominio-render.md).
 */
export class SurgeArresterObject3D extends THREE.Group {
  private readonly arrester: SurgeArrester;
  private readonly statusLight: THREE.Mesh;
  private readonly statusLightMaterial: THREE.MeshStandardMaterial;

  constructor(arrester: SurgeArrester) {
    super();
    this.arrester = arrester;
    this.name = arrester.label;
    this.userData = { componentId: arrester.id, componentType: arrester.kind };

    const stackHeight = DISC_COUNT * DISC_HEIGHT + (DISC_COUNT - 1) * DISC_GAP;
    const totalHeight = PEDESTAL_HEIGHT + stackHeight + 0.15;

    // Zona de click invisible: la columna real es esbelta (radio ~14 cm) — sin una hitbox
    // ampliada, seleccionar el pararrayos con el mouse es poco confiable (mismo patrón que
    // DisconnectorObject3D).
    const hitbox = new THREE.Mesh(
      new THREE.CylinderGeometry(DISC_RADIUS + 0.25, DISC_RADIUS + 0.25, totalHeight + 0.2, 8),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
    );
    hitbox.position.y = totalHeight / 2;
    this.add(hitbox);

    // Pedestal aislante de soporte.
    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.16, 0.19, PEDESTAL_HEIGHT, 16),
      new THREE.MeshStandardMaterial({ color: PEDESTAL_COLOR, roughness: 0.4 }),
    );
    pedestal.position.y = PEDESTAL_HEIGHT / 2;
    pedestal.castShadow = true;
    this.add(pedestal);

    // Columna de discos apilados (varistores de ZnO en su envolvente aislante). Alternar el tono
    // entre dos grises de porcelana da la lectura visual de "discos" individuales sin modelar cada
    // uno como una pieza geométricamente distinta.
    const discMaterialA = new THREE.MeshStandardMaterial({ color: DISC_COLOR_A, roughness: 0.3 });
    const discMaterialB = new THREE.MeshStandardMaterial({ color: DISC_COLOR_B, roughness: 0.3 });
    const discGeometry = new THREE.CylinderGeometry(DISC_RADIUS, DISC_RADIUS, DISC_HEIGHT, 20);

    let y = PEDESTAL_HEIGHT + DISC_HEIGHT / 2;
    for (let i = 0; i < DISC_COUNT; i++) {
      const disc = new THREE.Mesh(discGeometry, i % 2 === 0 ? discMaterialA : discMaterialB);
      disc.position.y = y;
      disc.castShadow = true;
      this.add(disc);
      y += DISC_HEIGHT + DISC_GAP;
    }
    const stackTopY = y - DISC_GAP;

    // Anillo de gradiente de campo (corona ring): mitiga la concentración de campo eléctrico en
    // el terminal superior, práctica estándar en pararrayos y bushings de AT/EAT.
    const gradingRing = new THREE.Mesh(
      new THREE.TorusGeometry(DISC_RADIUS + 0.08, 0.02, 8, 24),
      new THREE.MeshStandardMaterial({ color: GRADING_RING_COLOR, metalness: 0.6, roughness: 0.3 }),
    );
    gradingRing.rotation.x = Math.PI / 2;
    gradingRing.position.y = stackTopY + 0.05;
    this.add(gradingRing);

    // Terminal superior de conexión a la línea.
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, DISC_RADIUS * 0.9, 0.1, 16),
      new THREE.MeshStandardMaterial({ color: CAP_COLOR, metalness: 0.4, roughness: 0.25 }),
    );
    cap.position.y = stackTopY + 0.1;
    cap.castShadow = true;
    this.add(cap);

    // Luz de estado: verde cuando el margen de protección frente al BIL del equipo protegido
    // cumple el mínimo de IEC 60071-2 (≥ 20%, investigaciones/05 §3), rojo en caso contrario —
    // traduce un valor ya calculado por el dominio, no calcula nada aquí.
    this.statusLightMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      emissive: MARGIN_OK_COLOR,
      emissiveIntensity: 1,
    });
    this.statusLight = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), this.statusLightMaterial);
    this.statusLight.position.set(0, PEDESTAL_HEIGHT * 0.5, 0.22);
    this.add(this.statusLight);

    this.sync();
  }

  /**
   * Refleja el estado actual del modelo de dominio en la escena. El pararrayos es un equipo
   * pasivo (sin FSM de maniobra), por lo que aquí no hay nada que animar más allá del color de la
   * luz de estado — se mantiene el método por consistencia de interfaz con el resto de objetos 3D
   * (así main.ts puede llamar sync() de manera uniforme tras cualquier cambio del modelo).
   */
  sync(): void {
    this.statusLightMaterial.emissive.set(
      this.arrester.marginMeetsMinimum ? MARGIN_OK_COLOR : MARGIN_LOW_COLOR,
    );
  }
}
