# Cómo agregar un nuevo componente 3D

Esta guía documenta el patrón ya usado por el transformador (`src/domain/components/Transformer.ts`
+ `src/scene/components/TransformerObject3D.ts`) — síguelo para el próximo componente (ej. el
interruptor de potencia) en vez de improvisar una estructura distinta.

**Prerrequisito**: el simulador corre localmente (ver
[`correr-el-simulador-localmente.md`](correr-el-simulador-localmente.md)).

## 1. Crea la clase de dominio

En `src/domain/components/<Componente>.ts`, crea una clase que:

- **No importe `three`** en ningún punto (docs/adr/0002-separacion-modelo-dominio-render.md) — debe
  poder instanciarse e inspeccionarse desde un test o un REPL de Node sin WebGL.
- Exponga sus datos de placa/ratings como una interfaz separada (ver `TransformerRatings` en
  `Transformer.ts` como ejemplo).
- Exponga el estado calculado como *getters*, no como campos mutables directamente — así el estado
  interno (ej. `loadFactor`) solo cambia a través de métodos con nombre explícito
  (`setLoadFactor`), nunca por asignación directa desde fuera.
- Cite, en comentarios cortos, la sección de la investigación de la que sale cada fórmula (ej.
  `// investigaciones/01 §3.2`) — mantiene trazable el origen de cada número, tal como exige la
  filosofía del proyecto (ver
  [`../explanation/filosofia-del-proyecto.md`](../explanation/filosofia-del-proyecto.md)).

## 2. Regístralo en `SubstationModel`

En `src/domain/SubstationModel.ts`, instancia el nuevo componente en el constructor y expón
cualquier método de mutación necesario (siguiendo el patrón de `setMainTransformerLoad`), llamando
a `this.notify()` al final para que la escena se entere del cambio.

## 3. Crea el objeto 3D

En `src/scene/components/<Componente>Object3D.ts`, crea una clase que extienda `THREE.Group` y:

- Reciba la instancia del componente de dominio por constructor (no la cree internamente).
- Construya su geometría con **primitivas de Three.js** (`BoxGeometry`, `CylinderGeometry`,
  `TorusGeometry`...), nunca con un modelo importado (docs/adr/0001-primitivas-threejs-sobre-modelos-importados.md).
- Guarde metadata técnica en `this.userData` (tipo de componente, ratings) para que un futuro
  raycaster de click pueda alimentar un panel de inspección directamente desde el objeto.
- Exponga un método `sync()` que lea el estado del dominio y actualice geometría/material — **sin
  calcular nada eléctrico dentro de `sync()`**, solo traducir números ya calculados a color,
  posición o escala.

## 4. Conéctalo en `main.ts`

```ts
const nuevoObjeto = new NuevoComponenteObject3D(model.nuevoComponente);
sceneManager.scene.add(nuevoObjeto);
model.subscribe(() => nuevoObjeto.sync());
```

Si el componente necesita un panel de inspección propio, sigue el patrón HTML del panel del
transformador en `main.ts` (un `<div class="panel">` con `<dl>` de datos y controles).

## 5. Verifica visualmente, no solo que compile

`npm run typecheck` y `npm run build` verifican que el código es válido — no prueban que el
componente se vea o se comporte bien. Antes de dar el componente por terminado:

1. Corre `npm run dev` y confirma que el objeto aparece en la escena sin errores en la consola del
   navegador.
2. Interactúa con cualquier control nuevo (slider, botón) y confirma que el panel y la escena 3D
   se actualizan juntos.
3. Si es posible, automatiza esta verificación con un script de Playwright como el usado para
   validar el transformador (navegar, interactuar, `screenshot`, revisar `console --errors`).

## Ver también

- [`../adr/0001-primitivas-threejs-sobre-modelos-importados.md`](../adr/0001-primitivas-threejs-sobre-modelos-importados.md)
- [`../adr/0002-separacion-modelo-dominio-render.md`](../adr/0002-separacion-modelo-dominio-render.md)
- [`../../investigaciones/README.md`](../../investigaciones/README.md) — para encontrar la investigación técnica del componente que vas a construir.
