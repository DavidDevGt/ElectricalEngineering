import * as THREE from "three";
import type { Transformer } from "../../domain/components/Transformer";

const TANK_COLOR = 0x3a4048;
const BUSHING_COLOR = 0xcfd8dc;
const RADIATOR_COLOR = 0x262b31;
const LIGHT_ON_OPTIMUM = 0x4caf50;
const LIGHT_OFF_OPTIMUM = 0xffa726;

/**
 * Representación 3D del transformador, construida con primitivas geométricas
 * (docs/adr/0001-primitivas-threejs-sobre-modelos-importados.md) en vez de un modelo
 * importado — permite nombrar y animar cada pieza individualmente vía `userData`.
 *
 * No calcula nada eléctrico: solo lee el estado ya calculado por el `Transformer` de dominio
 * y lo traduce a geometría/material (docs/adr/0002-separacion-modelo-dominio-render.md).
 */
export class TransformerObject3D extends THREE.Group {
  private readonly transformer: Transformer;
  private readonly statusLight: THREE.Mesh;
  private readonly statusLightMaterial: THREE.MeshStandardMaterial;

  constructor(transformer: Transformer) {
    super();
    this.transformer = transformer;
    this.name = "Transformador de potencia";
    this.userData = {
      componentType: "transformer",
      ratings: transformer.ratings,
    };

    const tank = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 1.6, 1.4),
      new THREE.MeshStandardMaterial({ color: TANK_COLOR, roughness: 0.6, metalness: 0.3 }),
    );
    tank.position.y = 0.8;
    tank.castShadow = true;
    this.add(tank);

    // Pasatapas (bushings) del lado de alta tensión, 3 fases — investigaciones/01 no cubre
    // bushings en detalle; geometría orientativa (ver investigaciones/06 sobre aisladores/AIS).
    const bushingGeometry = new THREE.CylinderGeometry(0.06, 0.09, 0.9, 12);
    const bushingMaterial = new THREE.MeshStandardMaterial({
      color: BUSHING_COLOR,
      roughness: 0.2,
    });
    for (const x of [-0.6, 0, 0.6]) {
      const bushing = new THREE.Mesh(bushingGeometry, bushingMaterial);
      bushing.position.set(x, 2.05, -0.3);
      bushing.castShadow = true;
      this.add(bushing);
    }

    // Radiadores laterales (enfriamiento ONAN — investigaciones/01 §5). Estáticos en este
    // MVP; una versión futura podría activar etapas ONAF progresivamente con la carga.
    const radiatorGeometry = new THREE.BoxGeometry(0.06, 1.2, 0.9);
    const radiatorMaterial = new THREE.MeshStandardMaterial({ color: RADIATOR_COLOR });
    for (const x of [1.35, 1.5]) {
      const radiator = new THREE.Mesh(radiatorGeometry, radiatorMaterial);
      radiator.position.set(x, 0.8, 0);
      radiator.castShadow = true;
      this.add(radiator);
    }

    // Luz de estado: verde cerca del punto de eficiencia óptima (investigaciones/01 §3.3),
    // ámbar fuera de él — primer ejemplo de "representación múltiple conectada"
    // (investigaciones/11 §1) entre el panel numérico y la escena 3D.
    this.statusLightMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      emissive: LIGHT_ON_OPTIMUM,
      emissiveIntensity: 1,
    });
    this.statusLight = new THREE.Mesh(new THREE.SphereGeometry(0.07, 16, 16), this.statusLightMaterial);
    this.statusLight.position.set(0, 1.75, 0.75);
    this.add(this.statusLight);

    this.sync();
  }

  /**
   * Refleja el estado actual del modelo de dominio en la escena. Se llama tras cada cambio
   * del modelo (patrón Observer, ver SubstationModel.subscribe) — no contiene lógica eléctrica.
   */
  sync(): void {
    const load = this.transformer.getLoadFactor();
    const optimal = this.transformer.optimalLoadFactor;
    const closeToOptimal = Math.abs(load - optimal) < 0.15;
    this.statusLightMaterial.emissive.set(closeToOptimal ? LIGHT_ON_OPTIMUM : LIGHT_OFF_OPTIMUM);

    // Pulso sutil de la luz proporcional a la carga — puramente visual, sin nuevo cálculo.
    this.statusLightMaterial.emissiveIntensity = 0.6 + load * 0.8;
  }
}
