import * as THREE from "three";

const ENERGIZED_COLOR = 0x66bb6a;
const DE_ENERGIZED_COLOR = 0x3a4048;

/**
 * Tramo de conductor entre dos equipos del patio. Su único propósito es visual: propagar hasta
 * dónde llega la energización con el estado de maniobra actual (representación múltiple conectada
 * con el panel de inspección — investigaciones/11 §1, "representaciones múltiples conectadas").
 * No participa del cálculo — el dominio (`SubstationModel.energizedNodes`) ya decidió el hecho;
 * este objeto solo lo pinta.
 */
export class ConductorObject3D extends THREE.Mesh {
  constructor(from: THREE.Vector3, to: THREE.Vector3, radius = 0.035) {
    const direction = new THREE.Vector3().subVectors(to, from);
    const length = direction.length();
    const geometry = new THREE.CylinderGeometry(radius, radius, length, 10);
    const material = new THREE.MeshStandardMaterial({
      color: DE_ENERGIZED_COLOR,
      emissive: DE_ENERGIZED_COLOR,
      emissiveIntensity: 0.15,
      metalness: 0.4,
      roughness: 0.4,
    });
    super(geometry, material);

    this.position.copy(from).addScaledVector(direction, 0.5);
    this.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
    this.castShadow = true;
  }

  setEnergized(energized: boolean): void {
    const material = this.material as THREE.MeshStandardMaterial;
    const color = energized ? ENERGIZED_COLOR : DE_ENERGIZED_COLOR;
    material.color.set(color);
    material.emissive.set(color);
    material.emissiveIntensity = energized ? 0.9 : 0.15;
  }
}
