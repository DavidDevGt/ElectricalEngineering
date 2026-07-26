import * as THREE from "three";
import "./style.css";
import { SubstationModel } from "./domain/SubstationModel";
import { SimulationClock } from "./domain/simulation/SimulationClock";
import type { ComponentId } from "./domain/types";
import { BAY_Z, CONDUCTOR_HEIGHT, GROUND_GRID, LAYOUT, RELAY_CABINET } from "./scene/layout";
import { SceneManager } from "./scene/SceneManager";
import { BusbarObject3D } from "./scene/components/BusbarObject3D";
import { CircuitBreakerObject3D } from "./scene/components/CircuitBreakerObject3D";
import { ConductorObject3D } from "./scene/components/ConductorObject3D";
import { CurrentTransformerObject3D } from "./scene/components/CurrentTransformerObject3D";
import { DisconnectorObject3D } from "./scene/components/DisconnectorObject3D";
import { GroundGridObject3D } from "./scene/components/GroundGridObject3D";
import { ProtectionRelayObject3D } from "./scene/components/ProtectionRelayObject3D";
import { SurgeArresterObject3D } from "./scene/components/SurgeArresterObject3D";
import { TransformerObject3D } from "./scene/components/TransformerObject3D";
import { VoltageTransformerObject3D } from "./scene/components/VoltageTransformerObject3D";
import { InspectionPanel } from "./ui/InspectionPanel";
import { NoticeLog } from "./ui/NoticeLog";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("No se encontró el contenedor #app");

const model = new SubstationModel();
const sceneManager = new SceneManager(app);

// --- Construcción de la bahía (posiciones de scene/layout.ts) ---
const transformerObject = new TransformerObject3D(model.transformer);
transformerObject.position.set(LAYOUT.transformer, 0, BAY_Z);
sceneManager.scene.add(transformerObject);

const lineDisconnectorObject = new DisconnectorObject3D(
  model.lineDisconnector,
  () => model.breaker.state === "open",
);
lineDisconnectorObject.position.set(LAYOUT.lineDisconnector, 0, BAY_Z);
sceneManager.scene.add(lineDisconnectorObject);

const breakerObject = new CircuitBreakerObject3D(model.breaker);
breakerObject.position.set(LAYOUT.circuitBreaker, 0, BAY_Z);
sceneManager.scene.add(breakerObject);

const busDisconnectorObject = new DisconnectorObject3D(
  model.busDisconnector,
  () => model.breaker.state === "open",
);
busDisconnectorObject.position.set(LAYOUT.busDisconnector, 0, BAY_Z);
sceneManager.scene.add(busDisconnectorObject);

const currentTransformerObject = new CurrentTransformerObject3D(model.lineCurrentTransformer);
currentTransformerObject.position.set(LAYOUT.currentTransformer, 0, BAY_Z);
sceneManager.scene.add(currentTransformerObject);

const voltageTransformerObject = new VoltageTransformerObject3D(model.lineVoltageTransformer);
voltageTransformerObject.position.set(LAYOUT.voltageTransformer, 0, BAY_Z);
sceneManager.scene.add(voltageTransformerObject);

const surgeArresterObject = new SurgeArresterObject3D(model.surgeArrester);
surgeArresterObject.position.set(LAYOUT.surgeArrester, 0, BAY_Z);
sceneManager.scene.add(surgeArresterObject);

// La barra colectora corre a lo largo de Z y cruza el conductor de la bahía (que corre en X)
// justo en el punto donde esta línea se conecta al bus principal — intersección visualmente
// correcta para una sola bahía (investigaciones/06 §1).
const busbarObject = new BusbarObject3D(model.busbar);
busbarObject.position.set(LAYOUT.busbar, 0, BAY_Z);
sceneManager.scene.add(busbarObject);

// La malla se centra bajo el tramo de patio expuesto (entre la línea entrante y el
// transformador), no bajo la bahía completa — es infraestructura común a todo el patio.
// GroundGridObject3D dibuja sus conductores a "-burialDepth" respecto a su propio origen (para
// ser físicamente honesto: están enterrados) — el plano de suelo opaco de SceneManager vive en
// y=0, así que sin este desplazamiento la malla quedaría completamente oculta bajo tierra
// (seguiría siendo clickeable — pickableRoots no depende del plano de suelo — pero invisible,
// mala UX para un componente pensado para inspeccionarse). Subir el grupo por su propia
// profundidad de enterramiento la deja apenas a nivel de superficie, visible sin dejar de
// representar "conductores enterrados" con su opacidad reducida.
const groundGridObject = new GroundGridObject3D(model.groundGrid);
groundGridObject.position.set(
  (LAYOUT.linePortal + LAYOUT.transformer) / 2,
  GROUND_GRID.burialDepth + 0.02,
  BAY_Z,
);
sceneManager.scene.add(groundGridObject);

// El gabinete de relés vive en una caseta de control, no en el patio — desplazado en Z
// respecto al eje de la bahía (scene/layout.ts: RELAY_CABINET).
const protectionRelayObject = new ProtectionRelayObject3D(model.protectionRelay);
protectionRelayObject.position.set(RELAY_CABINET.x, 0, RELAY_CABINET.z);
sceneManager.scene.add(protectionRelayObject);

const animatedObjects = [breakerObject, lineDisconnectorObject, busDisconnectorObject];
const syncableObjects = [
  transformerObject,
  breakerObject,
  lineDisconnectorObject,
  busDisconnectorObject,
  currentTransformerObject,
  voltageTransformerObject,
  surgeArresterObject,
  busbarObject,
  groundGridObject,
  protectionRelayObject,
];

// Conductores: visualizan hasta dónde llega la energización con la maniobra actual
// (investigaciones/11 §1 — representación múltiple conectada con el panel de inspección).
function conductorPoint(x: number): THREE.Vector3 {
  return new THREE.Vector3(x, CONDUCTOR_HEIGHT, BAY_Z);
}

const conductorSegments: { mesh: ConductorObject3D; toNodeId: string }[] = [
  {
    mesh: new ConductorObject3D(conductorPoint(LAYOUT.linePortal), conductorPoint(LAYOUT.circuitBreaker)),
    toNodeId: "junction-a",
  },
  {
    mesh: new ConductorObject3D(conductorPoint(LAYOUT.circuitBreaker), conductorPoint(LAYOUT.busDisconnector)),
    toNodeId: "junction-b",
  },
  {
    mesh: new ConductorObject3D(conductorPoint(LAYOUT.busDisconnector), conductorPoint(LAYOUT.transformer)),
    toNodeId: "busbar",
  },
];
for (const { mesh } of conductorSegments) sceneManager.scene.add(mesh);

function syncConductors(): void {
  const energized = model.energizedNodes();
  for (const segment of conductorSegments) {
    segment.mesh.setEnergized(energized.has(segment.toNodeId));
  }
}

// --- UI: panel de inspección genérico + registro de notices ---
const inspectionPanel = new InspectionPanel();
app.appendChild(inspectionPanel.element);

const noticeLog = new NoticeLog();
app.appendChild(noticeLog.element);

const hintBadge = document.createElement("div");
hintBadge.className = "hint-badge";
hintBadge.textContent =
  "Click en un equipo del patio para inspeccionarlo. El seccionador solo se maniobra con el interruptor abierto.";
app.appendChild(hintBadge);

let selectedId: ComponentId | null = null;

// En pantallas angostas, una card con la tabla completa de datos (9-11 filas en componentes como
// la malla de tierra o el relé) tapa buena parte de la escena e interfiere con arrastrar la
// cámara — arranca colapsada ahí y expandida en desktop, donde el espacio no es un problema.
const MOBILE_QUERY = window.matchMedia("(max-width: 640px)");

function buildLoadSliderControl(): HTMLElement {
  const wrapper = document.createElement("div");
  wrapper.className = "control";
  wrapper.innerHTML = `
    <label>Factor de carga: <span data-role="value">${Math.round(model.transformer.getLoadFactor() * 100)}%</span></label>
    <input type="range" min="0" max="120" step="1" value="${Math.round(model.transformer.getLoadFactor() * 100)}" />
  `;
  const input = wrapper.querySelector("input")!;
  const valueLabel = wrapper.querySelector("[data-role='value']")!;
  input.addEventListener("input", () => {
    const percent = Number(input.value);
    valueLabel.textContent = `${percent}%`;
    model.setMainTransformerLoad(percent / 100);
  });
  return wrapper;
}

function renderInspection(): void {
  if (!selectedId) {
    inspectionPanel.clear();
    return;
  }
  const component = model.getComponent(selectedId);
  if (!component) {
    inspectionPanel.clear();
    return;
  }
  inspectionPanel.show(component.inspect());
}

function selectComponent(id: ComponentId): void {
  selectedId = id;
  renderInspection();
  inspectionPanel.setExtra(id === model.transformer.id ? buildLoadSliderControl() : null);
  inspectionPanel.setCollapsed(MOBILE_QUERY.matches);

  // El badge ya cumplió su función en cuanto el usuario inspecciona algo por primera vez — lo
  // ocultamos para que no siga compitiendo por el mismo espacio que la card (en mobile ambos
  // colapsan a la franja superior completa, ver src/style.css).
  hintBadge.hidden = true;
}

function findComponentId(object: THREE.Object3D): ComponentId | null {
  let current: THREE.Object3D | null = object;
  while (current) {
    const id = current.userData?.["componentId"];
    if (typeof id === "string") return id;
    current = current.parent;
  }
  return null;
}

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const pickableRoots = [
  transformerObject,
  lineDisconnectorObject,
  breakerObject,
  busDisconnectorObject,
  currentTransformerObject,
  voltageTransformerObject,
  surgeArresterObject,
  busbarObject,
  groundGridObject,
  protectionRelayObject,
];

sceneManager.renderer.domElement.addEventListener("pointerdown", (event) => {
  const rect = sceneManager.renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(pointer, sceneManager.camera);

  const intersections = raycaster.intersectObjects(pickableRoots, true);
  if (intersections.length === 0) return;

  const id = findComponentId(intersections[0]!.object);
  if (id) selectComponent(id);
});

// --- Eventos de dominio → escena + UI (patrón Observer, ADR-002) ---
model.events.subscribe((event) => {
  switch (event.type) {
    case "component-changed": {
      for (const object of syncableObjects) object.sync();
      syncConductors();
      renderInspection();
      break;
    }
    case "notice": {
      noticeLog.push(event.level, event.message);
      break;
    }
    default:
      break;
  }
});

syncConductors();

// Hook de depuración solo-en-desarrollo: permite a los scripts de verificación (Playwright)
// proyectar coordenadas mundo→pantalla y leer el estado del dominio sin duplicar lógica de
// clicking. `import.meta.env.DEV` se reemplaza por `false` en el build de producción y Vite
// elimina esta rama por dead-code elimination — no viaja al bundle final.
if (import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>)["__debug"] = {
    THREE,
    model,
    sceneManager,
    pickableRoots,
  };
}

// --- Bucle principal: timestep fijo + acumulador (ADR-005 / investigaciones/09) ---
const clock = new SimulationClock(60);
let lastTimeMs = performance.now();

function frame(nowMs: number): void {
  const realDeltaSeconds = (nowMs - lastTimeMs) / 1000;
  lastTimeMs = nowMs;

  clock.advance(realDeltaSeconds, (fixedDelta) => model.step(fixedDelta));

  for (const object of animatedObjects) object.animate(realDeltaSeconds);

  sceneManager.update();
  sceneManager.render();

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
