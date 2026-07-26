# Cómo agregar un nuevo componente 3D

Esta guía documenta el patrón usado por los 10 componentes existentes del patio (transformador,
interruptor, seccionador ×2, TC, TP, pararrayos, barra, malla de tierra, relé) — síguelo para el
próximo componente en vez de improvisar una estructura distinta. El patrón está probado a escala:
6 de los 10 componentes actuales los construyeron agentes en paralelo siguiendo exactamente estos
pasos, sin coordinación entre sí, y se integraron sin fricción.

**Prerrequisito**: el simulador corre localmente (ver
[`correr-el-simulador-localmente.md`](correr-el-simulador-localmente.md)).

## 1. Crea la clase de dominio

En `src/domain/components/<Componente>.ts`, crea una clase que implemente `SubstationComponent`
(`src/domain/types.ts`):

```ts
interface SubstationComponent {
  readonly id: ComponentId;
  readonly kind: ComponentKind; // ya declarado en types.ts — añade tu tipo ahí si falta
  readonly label: string;
  inspect(): InspectionData;
  step?(fixedDeltaSeconds: number): void; // opcional — solo si el componente integra una EDO
}
```

Reglas:

- **No importe `three`** en ningún punto (docs/adr/0002-separacion-modelo-dominio-render.md) — debe
  poder instanciarse e inspeccionarse desde un test o un REPL de Node sin WebGL.
- Constructor: `(id: ComponentId, label: string, ...lo que necesites)`. Si el componente necesita
  conocer el estado de OTRO componente (ej. un seccionador que depende del interruptor asociado),
  **no lo referencies directo** — inyecta una función (`() => boolean`, `() => EstadoX`), como hace
  `Disconnector.ts` con `getInterlockingBreakerState` y `Busbar.ts` con `getEnergized`. Mantiene los
  componentes desacoplados entre sí.
- Expón sus datos de placa/ratings como una interfaz separada (ver `TransformerRatings`,
  `CurrentTransformerRatings`, etc. como ejemplos) y el estado calculado como *getters*, nunca como
  campos mutables directos.
- `inspect()` devuelve `InspectionData`: `title`, `subtitle?`, `rows: InspectionRow[]` (cada una con
  `label`, `value`, `hint?`, `tone?: "neutral"|"good"|"warning"|"danger"`), `actions?:
  InspectionAction[]` (solo si el componente maniobra — botones con `label`/`run`/`disabled`), y
  `reference: { text, href }` apuntando a la investigación real que sustenta los datos.
- Cita, en comentarios cortos, la sección de la investigación de la que sale cada fórmula o valor
  (ej. `// investigaciones/07 §1.4`) — mantiene trazable el origen de cada número, tal como exige la
  filosofía del proyecto (ver
  [`../explanation/filosofia-del-proyecto.md`](../explanation/filosofia-del-proyecto.md)). No
  inventes valores: usa los órdenes de magnitud típicos que ya trae la investigación citada.
- Si el componente maniobra (abre/cierra), modélalo con una `StateMachine`
  (`src/domain/fsm/StateMachine.ts`, ver `CircuitBreaker.ts`/`Disconnector.ts`) — no con banderas
  booleanas sueltas. Emite `component-changed` y `notice` en `this.events` tras cada intento
  (exitoso o bloqueado), e `interlock-blocked` si una guarda rechaza la transición.

## 2. Regístralo en `SubstationModel`

En `src/domain/SubstationModel.ts`: instancia el componente en el constructor (con datos de placa
representativos, no inventados — ver los demás componentes para el nivel de detalle esperado),
regístralo con `this.register(...)`, y expón cualquier método de mutación necesario siguiendo el
patrón de `setMainTransformerLoad` (que termina emitiendo `this.events.emit({ type:
"component-changed", id })`).

## 3. Crea el objeto 3D

En `src/scene/components/<Componente>Object3D.ts`, crea una clase que extienda `THREE.Group` y:

- Reciba la instancia del componente de dominio por constructor (no la cree internamente).
- Construya su geometría **solo con primitivas de Three.js** (`BoxGeometry`, `CylinderGeometry`,
  `SphereGeometry`, `TorusGeometry`...), nunca con un modelo importado
  (docs/adr/0001-primitivas-threejs-sobre-modelos-importados.md).
- Fije `this.userData = { componentId: componente.id, componentType: componente.kind }` en el
  constructor — así el raycaster de selección de `main.ts` encuentra el componente subiendo por los
  `.parent` del objeto que efectivamente golpeó el rayo.
- **Agregue una zona de click invisible (hitbox)**: un `Mesh` con geometría que cubra holgadamente
  todo el componente y `new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite:
  false })`. La mayoría de las piezas reales (cuchillas, columnas aislantes, tubos) son demasiado
  delgadas para seleccionarlas con precisión sin esto — copia el patrón exacto de
  `DisconnectorObject3D.ts`.
- Exponga un método `sync(): void` que lea el estado del dominio y actualice
  color/posición/escala — **sin calcular nada eléctrico dentro de `sync()`**, solo traducir números
  ya calculados. Si el componente no tiene estado dinámico (ej. la malla de tierra en este MVP),
  `sync()` puede no hacer nada, pero debe existir igual por consistencia de interfaz.
- Si el componente anima una transición continua (ej. la apertura de un interruptor), separa esa
  lógica en un método `animate(deltaSeconds: number): void` distinto de `sync()` — `sync()` reacciona
  a un cambio de estado del dominio, `animate()` corre cada frame independientemente de si algo
  cambió (ver `CircuitBreakerObject3D.ts`).

## 4. Posiciónalo usando `scene/layout.ts`

No uses coordenadas sueltas en `main.ts`. Si tu componente va en el patio principal, añade (o
reutiliza) una entrada en `LAYOUT` (`src/scene/layout.ts`); si va en una caseta de control aparte,
sigue el patrón de `RELAY_CABINET`. Esto mantiene la disposición de la bahía coherente al agregar
equipos nuevos sin tener que reajustar la cámara cada vez.

## 5. Conéctalo en `main.ts`

```ts
const nuevoObjeto = new NuevoComponenteObject3D(model.nuevoComponente);
nuevoObjeto.position.set(LAYOUT.nuevoComponente, 0, BAY_Z);
sceneManager.scene.add(nuevoObjeto);

// Agrégalo a los arrays que ya recorre el bucle principal — no dupliques la suscripción:
syncableObjects.push(nuevoObjeto); // sync() tras cada "component-changed"
pickableRoots.push(nuevoObjeto); // selección por raycaster
// animatedObjects.push(nuevoObjeto); // solo si expone animate()
```

El panel de inspección **ya es genérico** (`src/ui/InspectionPanel.ts`) — no crees un panel HTML a
mano como se hacía en versiones tempranas del proyecto: cualquier componente que implemente
`inspect()` correctamente ya se muestra automáticamente al seleccionarlo. Si tu componente necesita
un control interactivo que no encaja como `InspectionAction` (ej. el slider de carga del
transformador), sigue el patrón de `buildLoadSliderControl()` en `main.ts` +
`inspectionPanel.setExtra(...)` — pero **solo llames `setExtra` al cambiar la selección**, nunca en
cada refresco de datos, o perderás el nodo DOM a mitad de una interacción (ver el comentario en
`InspectionPanel.show()`).

## 6. Verifica visualmente, no solo que compile

`npm run typecheck` y `npm run build` verifican que el código es válido — no prueban que el
componente se vea o se comporte bien. Antes de dar el componente por terminado:

1. Corre `npm run dev` y confirma que el objeto aparece en la escena sin errores en la consola del
   navegador.
2. Haz click sobre el componente en el navegador (o automatiza el click — ver el hook de depuración
   `window.__debug` disponible solo en desarrollo, que expone `THREE`, `model`, `sceneManager` y
   `pickableRoots` para proyectar coordenadas mundo→pantalla desde un script de Playwright) y
   confirma que el panel muestra los datos esperados.
3. Interactúa con cualquier control nuevo (slider, botón de maniobra) y confirma que el panel, la
   escena 3D y (si aplica) el registro de notices se actualizan juntos.
4. Toma una captura de pantalla y **mírala** — no asumas que "sin errores de consola" equivale a
   "se ve bien". El proyecto ya encontró y corrigió así dos problemas reales: shadow acne en la base
   de un objeto, y un componente completamente invisible por quedar enterrado bajo el plano de
   suelo opaco.

## Ver también

- [`../adr/0001-primitivas-threejs-sobre-modelos-importados.md`](../adr/0001-primitivas-threejs-sobre-modelos-importados.md)
- [`../adr/0002-separacion-modelo-dominio-render.md`](../adr/0002-separacion-modelo-dominio-render.md)
- [`../adr/0004-fsm-a-mano-sobre-statecharts-libreria.md`](../adr/0004-fsm-a-mano-sobre-statecharts-libreria.md) — si tu componente maniobra.
- [`../../investigaciones/README.md`](../../investigaciones/README.md) — para encontrar la investigación técnica del componente que vas a construir.
