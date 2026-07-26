import * as THREE from "three";
import type { CircuitBreaker } from "../../domain/components/CircuitBreaker";

const PEDESTAL_COLOR = 0x2a2f35;
const INSULATOR_COLOR = 0xb0a89c;
const TANK_COLOR = 0x3a4048;
const CLOSED_COLOR = 0x4caf50;
const OPEN_COLOR = 0x8a8f96;

/**
 * Representación 3D del interruptor de potencia: pedestal + columna aislante + "tanque" de SF6
 * con un contacto que se separa visiblemente al abrir (docs/adr/0001-primitivas-threejs-sobre-modelos-importados.md).
 *
 * El arco de plasma real (investigaciones/02 §1-2) es una mecánica del modo falla, fuera de
 * alcance de este MVP — aquí el "hueco" entre contactos es la señal visual de que el interruptor
 * está abierto, sin animación de arco.
 */
export class CircuitBreakerObject3D extends THREE.Group {
  private readonly breaker: CircuitBreaker;
  private readonly movingContact: THREE.Mesh;
  private readonly statusLightMaterial: THREE.MeshStandardMaterial;

  /** 0 = cerrado (contacto tocando), 1 = abierto (contacto separado). */
  private targetOpenness = 0;
  private currentOpenness = 0;

  constructor(breaker: CircuitBreaker) {
    super();
    this.breaker = breaker;
    this.name = breaker.label;
    this.userData = { componentId: breaker.id, componentType: breaker.kind };

    // Zona de click invisible, más generosa que la columna real — ver la misma nota en
    // DisconnectorObject3D.ts.
    const hitbox = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 2.9, 0.7),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
    );
    hitbox.position.set(0, 1.45, 0);
    this.add(hitbox);

    const pedestal = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.5, 0.6),
      new THREE.MeshStandardMaterial({ color: PEDESTAL_COLOR, roughness: 0.7 }),
    );
    pedestal.position.y = 0.25;
    pedestal.castShadow = true;
    this.add(pedestal);

    const insulator = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.16, 1.4, 16),
      new THREE.MeshStandardMaterial({ color: INSULATOR_COLOR, roughness: 0.35 }),
    );
    insulator.position.y = 1.2;
    insulator.castShadow = true;
    this.add(insulator);

    const tank = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.28, 0.9, 16),
      new THREE.MeshStandardMaterial({ color: TANK_COLOR, roughness: 0.5, metalness: 0.3 }),
    );
    tank.position.y = 2.35;
    tank.castShadow = true;
    this.add(tank);

    // Contacto fijo (parte inferior del tanque) — punto de referencia del "hueco" de apertura.
    const fixedContact = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.3, 12),
      new THREE.MeshStandardMaterial({ color: 0xcfd8dc, metalness: 0.6, roughness: 0.3 }),
    );
    fixedContact.position.y = 2.95;
    this.add(fixedContact);

    // Contacto móvil: se desplaza hacia arriba al abrir, dejando un hueco visible.
    this.movingContact = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.3, 12),
      new THREE.MeshStandardMaterial({ color: 0xcfd8dc, metalness: 0.6, roughness: 0.3 }),
    );
    this.movingContact.position.y = 3.15;
    this.add(this.movingContact);

    this.statusLightMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      emissive: OPEN_COLOR,
      emissiveIntensity: 1,
    });
    const statusLight = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 12), this.statusLightMaterial);
    statusLight.position.set(0.35, 2.35, 0);
    this.add(statusLight);

    this.sync();
    this.currentOpenness = this.targetOpenness;
    this.applyOpenness();
  }

  /** Refleja el estado de dominio — no calcula nada eléctrico, solo fija el objetivo visual. */
  sync(): void {
    const closed = this.breaker.state === "closed";
    this.targetOpenness = closed ? 0 : 1;
    this.statusLightMaterial.emissive.set(closed ? CLOSED_COLOR : OPEN_COLOR);
  }

  /** Interpola la apertura visual hacia el objetivo — separado de sync() por ser dependiente
   * del tiempo, no del estado del dominio (mismo principio que TransformerObject3D.animate). */
  animate(deltaSeconds: number): void {
    const speed = 6; // 1/s — transición completa en ~170ms, perceptible pero no lenta
    const diff = this.targetOpenness - this.currentOpenness;
    if (Math.abs(diff) < 0.001) {
      this.currentOpenness = this.targetOpenness;
    } else {
      this.currentOpenness += diff * Math.min(1, speed * deltaSeconds);
    }
    this.applyOpenness();
  }

  private applyOpenness(): void {
    this.movingContact.position.y = 3.15 + this.currentOpenness * 0.35;
  }
}
