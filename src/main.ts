import "./style.css";
import { SubstationModel } from "./domain/SubstationModel";
import { SimulationClock } from "./domain/simulation/SimulationClock";
import { SceneManager } from "./scene/SceneManager";
import { TransformerObject3D } from "./scene/components/TransformerObject3D";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("No se encontró el contenedor #app");

const model = new SubstationModel();
const sceneManager = new SceneManager(app);

const transformerObject = new TransformerObject3D(model.mainTransformer);
sceneManager.scene.add(transformerObject);

// Capa de escena suscrita a cambios del modelo (patrón Observer, ADR-002) — el dominio no
// conoce Three.js, la vista se entera de los cambios y se sincroniza.
model.subscribe(() => transformerObject.sync());

// --- Panel HTML de inspección (overlay HTML/CSS sobre el canvas, IDEA.md §8) ---
const panel = document.createElement("div");
panel.className = "panel";
panel.innerHTML = `
  <h1>Transformador de potencia</h1>
  <dl>
    <dt>Potencia nominal</dt><dd id="rated">-</dd>
    <dt>Grupo de conexión</dt><dd id="vector-group">-</dd>
    <dt>%Z</dt><dd id="impedance">-</dd>
    <dt>Pérdidas hierro</dt><dd id="iron-loss">-</dd>
    <dt>Pérdidas cobre</dt><dd id="copper-loss">-</dd>
    <dt>Eficiencia</dt><dd id="efficiency">-</dd>
    <dt>Carga óptima</dt><dd id="optimal-load">-</dd>
    <dt>I falla (x nominal)</dt><dd id="fault-current">-</dd>
  </dl>
  <div class="control">
    <label for="load-slider">Factor de carga: <span id="load-value">0%</span></label>
    <input id="load-slider" type="range" min="0" max="120" value="0" step="1" />
  </div>
`;
app.appendChild(panel);

function query<T extends HTMLElement>(selector: string): T {
  const el = panel.querySelector<T>(selector);
  if (!el) throw new Error(`No se encontró "${selector}" en el panel`);
  return el;
}

const ratings = model.mainTransformer.ratings;
query("#rated").textContent = `${ratings.ratedPowerMVA} MVA`;
query("#vector-group").textContent = ratings.vectorGroup;
query("#impedance").textContent = `${ratings.impedancePercent}%`;
query("#iron-loss").textContent = `${ratings.ironLossKW} kW`;

const slider = query<HTMLInputElement>("#load-slider");
const loadValueLabel = query("#load-value");

function updatePanel(): void {
  const t = model.mainTransformer;
  loadValueLabel.textContent = `${Math.round(t.getLoadFactor() * 100)}%`;
  query("#copper-loss").textContent = `${t.copperLossKW.toFixed(1)} kW`;
  query("#efficiency").textContent = `${(t.efficiency * 100).toFixed(2)}%`;
  query("#optimal-load").textContent = `${(t.optimalLoadFactor * 100).toFixed(0)}%`;
  query("#fault-current").textContent = `${t.faultCurrentMultipleOfRated.toFixed(1)}x`;
}

slider.addEventListener("input", () => {
  model.setMainTransformerLoad(Number(slider.value) / 100);
  updatePanel();
});

updatePanel();

// --- Bucle principal: timestep fijo + acumulador (ADR-005 / investigaciones/09) ---
const clock = new SimulationClock(60);
let lastTimeMs = performance.now();

function frame(nowMs: number): void {
  const realDeltaSeconds = (nowMs - lastTimeMs) / 1000;
  lastTimeMs = nowMs;

  clock.advance(realDeltaSeconds, (fixedDelta) => model.step(fixedDelta));

  sceneManager.update();
  sceneManager.render();

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
