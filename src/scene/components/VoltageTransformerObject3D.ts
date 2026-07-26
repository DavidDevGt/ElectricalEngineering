import * as THREE from "three";
import type { VoltageTransformer } from "../../domain/components/VoltageTransformer";

const PEDESTAL_COLOR = 0x2a2f35;
const TANK_COLOR = 0x3a4048;
const INSULATOR_COLOR = 0xcfd8dc;
const SHED_COLOR = 0xb0a89c;
const TERMINAL_COLOR = 0xb0a89c;
const PRECISION_GOOD_COLOR = 0x4caf50; // clase de medición fina (ej. 0.2/0.5)
const PRECISION_COARSE_COLOR = 0xffa726; // clase más gruesa (ej. 1, 3P)

/** Altura acumulada de cada bloque, de abajo hacia arriba. */
const PEDESTAL_HEIGHT = 0.4;
const TANK_HEIGHT = 0.35;
const COLUMN_HEIGHT = 1.9;
const TERMINAL_HEIGHT = 0.12;

const TANK_Y = PEDESTAL_HEIGHT + TANK_HEIGHT / 2;
const COLUMN_BASE_Y = PEDESTAL_HEIGHT + TANK_HEIGHT;
const COLUMN_Y = COLUMN_BASE_Y + COLUMN_HEIGHT / 2;
const TOTAL_HEIGHT = COLUMN_BASE_Y + COLUMN_HEIGHT + TERMINAL_HEIGHT;

/**
 * Representación 3D de un Transformador de Potencial (TP/VT) inductivo de patio AIS: pedestal +
 * un pequeño tanque en la base (donde vive el devanado, investigaciones/07 §4.1) + una columna
 * aislante esbelta que sube hasta un único terminal primario (conexión fase-tierra, un solo
 * bushing) — silueta clásica de un TP, bien distinta del TC (que abraza el conductor) o del
 * interruptor (tanque grande en la parte alta, ver CircuitBreakerObject3D).
 *
 * Construida solo con primitivas (docs/adr/0001-primitivas-threejs-sobre-modelos-importados.md).
 * No calcula nada eléctrico: `sync()` solo traduce la clase de precisión ya definida en el
 * dominio a un color de la luz de estado (docs/adr/0002-separacion-modelo-dominio-render.md).
 */
export class VoltageTransformerObject3D extends THREE.Group {
  private readonly voltageTransformer: VoltageTransformer;
  private readonly statusLightMaterial: THREE.MeshStandardMaterial;

  constructor(voltageTransformer: VoltageTransformer) {
    super();
    this.voltageTransformer = voltageTransformer;
    this.name = voltageTransformer.label;
    this.userData = {
      componentId: voltageTransformer.id,
      componentType: voltageTransformer.kind,
      ratings: voltageTransformer.ratings,
    };

    // Zona de click invisible: la columna real es muy delgada — sin un hitbox generoso es casi
    // imposible seleccionarla con el mouse. Mismo patrón que DisconnectorObject3D.ts.
    const hitbox = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, TOTAL_HEIGHT + 0.2, 0.55),
      new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
    );
    hitbox.position.set(0, TOTAL_HEIGHT / 2, 0);
    this.add(hitbox);

    const pedestal = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, PEDESTAL_HEIGHT, 0.5),
      new THREE.MeshStandardMaterial({ color: PEDESTAL_COLOR, roughness: 0.7 }),
    );
    pedestal.position.y = PEDESTAL_HEIGHT / 2;
    pedestal.castShadow = true;
    this.add(pedestal);

    // Tanque de la base: aquí vive el devanado primario/secundario (investigaciones/07 §4.1) —
    // a diferencia del interruptor, el "tanque" del TP es pequeño porque no maneja potencia.
    const tank = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.24, TANK_HEIGHT, 16),
      new THREE.MeshStandardMaterial({ color: TANK_COLOR, roughness: 0.5, metalness: 0.3 }),
    );
    tank.position.y = TANK_Y;
    tank.castShadow = true;
    this.add(tank);

    // Columna aislante: más delgada y más alta que la del interruptor (compárese con
    // CircuitBreakerObject3D: radio 0.12-0.16, altura 1.4) — el TP no necesita alojar una cámara
    // de extinción de arco, solo aislar el único bushing primario hasta el nivel de línea.
    const column = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.08, COLUMN_HEIGHT, 16),
      new THREE.MeshStandardMaterial({ color: INSULATOR_COLOR, roughness: 0.3 }),
    );
    column.position.y = COLUMN_Y;
    column.castShadow = true;
    this.add(column);

    // Aletas ("sheds") de porcelana a lo largo de la columna — puramente decorativas, refuerzan
    // la silueta reconocible de un aislador de patio AIS.
    const shedCount = 7;
    const shedGeometry = new THREE.TorusGeometry(0.11, 0.015, 8, 20);
    const shedMaterial = new THREE.MeshStandardMaterial({ color: SHED_COLOR, roughness: 0.35 });
    for (let i = 0; i < shedCount; i++) {
      const shed = new THREE.Mesh(shedGeometry, shedMaterial);
      const y = COLUMN_BASE_Y + 0.18 + (i * (COLUMN_HEIGHT - 0.36)) / (shedCount - 1);
      shed.position.y = y;
      shed.rotation.x = Math.PI / 2;
      this.add(shed);
    }

    // Terminal primario único en la punta (conexión fase-tierra, investigaciones/07 §4.1).
    const terminal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.06, TERMINAL_HEIGHT, 12),
      new THREE.MeshStandardMaterial({ color: TERMINAL_COLOR, metalness: 0.5, roughness: 0.3 }),
    );
    terminal.position.y = COLUMN_BASE_Y + COLUMN_HEIGHT + TERMINAL_HEIGHT / 2;
    terminal.castShadow = true;
    this.add(terminal);

    // Luz de estado: traduce la clase de precisión de placa a color (verde = clase fina de
    // medición, ámbar = clase más gruesa) — no hay cálculo eléctrico, solo lectura de dominio.
    this.statusLightMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      emissive: PRECISION_GOOD_COLOR,
      emissiveIntensity: 1,
    });
    const statusLight = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 12), this.statusLightMaterial);
    statusLight.position.set(0.3, TANK_Y, 0);
    this.add(statusLight);

    this.sync();
  }

  /**
   * Refleja el estado del modelo de dominio en la escena. El TP no tiene estados operativos
   * dinámicos (no maniobra, no cambia con la carga) — solo traduce la clase de precisión de
   * placa a un color, sin calcular nada eléctrico (docs/adr/0002-separacion-modelo-dominio-render.md).
   */
  sync(): void {
    const accuracyNumber = Number.parseFloat(this.voltageTransformer.ratings.accuracyClass);
    const isFineClass = Number.isFinite(accuracyNumber) && accuracyNumber <= 0.5;
    this.statusLightMaterial.emissive.set(isFineClass ? PRECISION_GOOD_COLOR : PRECISION_COARSE_COLOR);
  }
}
