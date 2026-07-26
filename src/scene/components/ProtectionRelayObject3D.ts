import * as THREE from "three";
import type { ProtectionRelay } from "../../domain/components/ProtectionRelay";

const CABINET_COLOR = 0x2a2f35;
const PLINTH_COLOR = 0x1f2327;
const BEZEL_COLOR = 0x3a4048;
const SCREEN_COLOR = 0x10151a;
const SCREEN_EMISSIVE = 0x29b6f6;
const LED_IN_SERVICE = 0x4caf50;
const LED_OUT_OF_SERVICE = 0xef5350;

const CABINET_WIDTH = 0.9;
const CABINET_HEIGHT = 1.8;
const CABINET_DEPTH = 0.6;

/**
 * Representación 3D del relé de protección / IED, construida con primitivas geométricas
 * (docs/adr/0001-primitivas-threejs-sobre-modelos-importados.md): un gabinete de control (no es
 * un equipo de patio como el resto de la bahía — vive en una caseta de control, ver
 * `RELAY_CABINET` en scene/layout.ts), con un panel/pantalla frontal simulando la HMI del IED y
 * un LED de estado.
 *
 * No ejecuta ningún algoritmo de protección ni calcula corrientes de falla: solo lee el estado
 * ya calculado por el `ProtectionRelay` de dominio (aquí, únicamente si tiene funciones
 * configuradas) y lo traduce a color (docs/adr/0002-separacion-modelo-dominio-render.md).
 */
export class ProtectionRelayObject3D extends THREE.Group {
  private readonly relay: ProtectionRelay;
  private readonly statusLightMaterial: THREE.MeshStandardMaterial;

  constructor(relay: ProtectionRelay) {
    super();
    this.relay = relay;
    this.name = relay.label;
    this.userData = { componentId: relay.id, componentType: relay.kind };

    // Zona de click invisible: el gabinete es sólido, pero la pantalla y el LED que lo hacen
    // reconocible como IED sobresalen apenas unos centímetros del frente — sin un hitbox que
    // cubra todo el conjunto, apuntar justo a esos detalles finos con el mouse es poco confiable.
    // Mismo patrón que DisconnectorObject3D.
    const hitbox = new THREE.Mesh(
      new THREE.BoxGeometry(CABINET_WIDTH + 0.3, CABINET_HEIGHT + 0.2, CABINET_DEPTH + 0.3),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
    );
    hitbox.position.set(0, CABINET_HEIGHT / 2, 0);
    this.add(hitbox);

    // Base/plinto: el gabinete de control se instala sobre un zócalo, no directamente en tierra.
    const plinth = new THREE.Mesh(
      new THREE.BoxGeometry(CABINET_WIDTH + 0.1, 0.1, CABINET_DEPTH + 0.1),
      new THREE.MeshStandardMaterial({ color: PLINTH_COLOR, roughness: 0.8 }),
    );
    plinth.position.y = 0.05;
    plinth.castShadow = true;
    this.add(plinth);

    // Cuerpo del gabinete de control (caseta de relés).
    const cabinet = new THREE.Mesh(
      new THREE.BoxGeometry(CABINET_WIDTH, CABINET_HEIGHT, CABINET_DEPTH),
      new THREE.MeshStandardMaterial({ color: CABINET_COLOR, roughness: 0.55, metalness: 0.25 }),
    );
    cabinet.position.y = 0.1 + CABINET_HEIGHT / 2;
    cabinet.castShadow = true;
    this.add(cabinet);

    // Marco/bisel de la puerta frontal — puramente decorativo, remarca dónde está el panel HMI.
    const bezel = new THREE.Mesh(
      new THREE.BoxGeometry(CABINET_WIDTH * 0.7, CABINET_HEIGHT * 0.4, 0.03),
      new THREE.MeshStandardMaterial({ color: BEZEL_COLOR, roughness: 0.4, metalness: 0.4 }),
    );
    bezel.position.set(0, 0.1 + CABINET_HEIGHT * 0.62, CABINET_DEPTH / 2 + 0.01);
    this.add(bezel);

    // Panel/pantalla frontal del IED (HMI): simula la pequeña pantalla LCD donde el relé real
    // muestra medidas, eventos y menús de ajuste — aquí es solo un plano coloreado, sin texto.
    const screen = new THREE.Mesh(
      new THREE.BoxGeometry(CABINET_WIDTH * 0.55, CABINET_HEIGHT * 0.22, 0.02),
      new THREE.MeshStandardMaterial({
        color: SCREEN_COLOR,
        emissive: SCREEN_EMISSIVE,
        emissiveIntensity: 0.35,
        roughness: 0.3,
      }),
    );
    screen.position.set(0, 0.1 + CABINET_HEIGHT * 0.62, CABINET_DEPTH / 2 + 0.02);
    this.add(screen);

    // LED de estado: verde mientras el IED tenga funciones de protección configuradas
    // ("en servicio"); rojo si el chasis quedara sin ninguna función activa.
    this.statusLightMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      emissive: LED_IN_SERVICE,
      emissiveIntensity: 1,
    });
    const statusLight = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 12), this.statusLightMaterial);
    statusLight.position.set(
      CABINET_WIDTH * 0.3,
      0.1 + CABINET_HEIGHT * 0.62 + CABINET_HEIGHT * 0.22,
      CABINET_DEPTH / 2 + 0.03,
    );
    this.add(statusLight);

    this.sync();
  }

  /**
   * Refleja el estado actual del modelo de dominio en la escena. No contiene lógica eléctrica ni
   * de protección: solo traduce `relay.inService` (derivado de la configuración de funciones) a
   * un color de LED.
   */
  sync(): void {
    this.statusLightMaterial.emissive.set(
      this.relay.inService ? LED_IN_SERVICE : LED_OUT_OF_SERVICE,
    );
  }
}
