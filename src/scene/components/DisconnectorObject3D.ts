import * as THREE from "three";
import type { Disconnector } from "../../domain/components/Disconnector";

const POST_COLOR = 0xb0a89c;
const BLADE_COLOR = 0xcfd8dc;
const CLOSED_COLOR = 0x4caf50;
const OPEN_COLOR = 0x8a8f96;
const BLOCKED_COLOR = 0xef5350;

const BLADE_LENGTH = 1.1;
/** Ángulo de la cuchilla al quedar abierta (levantada), en radianes. */
const OPEN_ANGLE = Math.PI / 2.1;

/**
 * Representación 3D del seccionador: dos postes aislantes y una "cuchilla" que gira sobre un
 * pivote entre horizontal (cerrado, en contacto) y levantada (abierto) — la imagen clásica de un
 * seccionador de patio de subestación AIS (investigaciones/05 §5).
 *
 * El color del pivote refleja el estado del *enclavamiento* (investigaciones/02 §5), no solo la
 * posición de la cuchilla: en rojo cuando el interruptor asociado impide la maniobra, para que la
 * regla de seguridad sea visible incluso antes de intentar tocar el seccionador.
 */
export class DisconnectorObject3D extends THREE.Group {
  private readonly disconnector: Disconnector;
  private readonly getInterlockOk: () => boolean;
  private readonly pivotGroup: THREE.Group;
  private readonly pivotLightMaterial: THREE.MeshStandardMaterial;

  private targetAngle = 0;
  private currentAngle = 0;

  constructor(disconnector: Disconnector, getInterlockOk: () => boolean) {
    super();
    this.disconnector = disconnector;
    this.getInterlockOk = getInterlockOk;
    this.name = disconnector.label;
    this.userData = { componentId: disconnector.id, componentType: disconnector.kind };

    // Zona de click invisible: la cuchilla real mide pocos centímetros de espesor — sin esto,
    // seleccionar el seccionador (con mouse o con el dedo en una pantalla táctil) es poco
    // confiable. Mismo truco que un "hit target" ampliado en cualquier UI con controles finos.
    const hitbox = new THREE.Mesh(
      new THREE.BoxGeometry(BLADE_LENGTH + 0.3, 1.3, 0.4),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
    );
    hitbox.position.set(0, 0.65, 0);
    this.add(hitbox);

    const postMaterial = new THREE.MeshStandardMaterial({ color: POST_COLOR, roughness: 0.35 });
    const postGeometry = new THREE.CylinderGeometry(0.07, 0.09, 1.0, 12);

    const hingePost = new THREE.Mesh(postGeometry, postMaterial);
    hingePost.position.set(-BLADE_LENGTH / 2, 0.5, 0);
    hingePost.castShadow = true;
    this.add(hingePost);

    const fixedPost = new THREE.Mesh(postGeometry, postMaterial);
    fixedPost.position.set(BLADE_LENGTH / 2, 0.5, 0);
    fixedPost.castShadow = true;
    this.add(fixedPost);

    // El pivote de la cuchilla se ubica en el extremo del poste de bisagra.
    this.pivotGroup = new THREE.Group();
    this.pivotGroup.position.set(-BLADE_LENGTH / 2, 1.0, 0);
    this.add(this.pivotGroup);

    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(BLADE_LENGTH, 0.04, 0.05),
      new THREE.MeshStandardMaterial({ color: BLADE_COLOR, metalness: 0.5, roughness: 0.3 }),
    );
    blade.position.x = BLADE_LENGTH / 2;
    blade.castShadow = true;
    this.pivotGroup.add(blade);

    this.pivotLightMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      emissive: OPEN_COLOR,
      emissiveIntensity: 1,
    });
    const pivotLight = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 12), this.pivotLightMaterial);
    this.pivotGroup.add(pivotLight);

    this.sync();
    this.currentAngle = this.targetAngle;
    this.pivotGroup.rotation.z = this.currentAngle;
  }

  sync(): void {
    const closed = this.disconnector.state === "closed";
    this.targetAngle = closed ? 0 : OPEN_ANGLE;

    const interlockOk = this.getInterlockOk();
    this.pivotLightMaterial.emissive.set(
      !interlockOk ? BLOCKED_COLOR : closed ? CLOSED_COLOR : OPEN_COLOR,
    );
  }

  animate(deltaSeconds: number): void {
    const speed = 3; // rad/s aprox. — más lento que el interruptor, es una maniobra manual
    const diff = this.targetAngle - this.currentAngle;
    if (Math.abs(diff) < 0.001) {
      this.currentAngle = this.targetAngle;
    } else {
      this.currentAngle += diff * Math.min(1, speed * deltaSeconds);
    }
    this.pivotGroup.rotation.z = this.currentAngle;
  }
}
