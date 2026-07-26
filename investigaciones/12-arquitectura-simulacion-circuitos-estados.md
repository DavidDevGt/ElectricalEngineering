# Arquitectura de software para simulación de circuitos y lógica de estados discretos

> Investigación de soporte para el simulador 3D de subestaciones de AT (ver `IDEA.md`, sección 8).
> Objetivo: fundamentar con rigor de ingeniería de software cómo estructurar en código el
> `SubstationModel` — el modelo de dominio eléctrico separado de la escena Three.js que ya define
> IDEA.md §8 — cubriendo las técnicas estándar de la industria (análisis nodal modificado, ECS,
> statecharts) y justificando por qué el proyecto debe usar una versión deliberadamente más simple
> de cada una.

---

## 1. Análisis nodal modificado (MNA): cómo se resuelve "de verdad" un circuito arbitrario

Cuando SPICE, LTspice, Xyce o cualquier simulador de circuitos profesional recibe un esquemático
arbitrario, no "sabe" nada de antemano sobre su topología. Lo único que tiene son componentes
(resistencias, fuentes, bobinas, capacitores, fuentes controladas) conectados a nodos. La técnica
estándar desde 1975 (Ho, Ruehli y Brennan, IBM) para convertir ese esquemático en algo que una
computadora pueda resolver es el **análisis nodal modificado (Modified Nodal Analysis, MNA)**.

La idea central, sin derivar la matriz completa:

1. **Ley de corrientes de Kirchhoff (KCL) en cada nodo**: para cada nodo del circuito (excepto el
   nodo de referencia/tierra), la suma de corrientes que salen de él es cero. Si expresamos cada
   corriente de rama en función de las tensiones de nodo (ley de Ohm: `I = G·V` para una
   resistencia de conductancia G), obtenemos una ecuación lineal por nodo. El conjunto de esas
   ecuaciones, en forma matricial, es `A·x = z`, donde `x` es el vector de tensiones de nodo
   desconocidas.
2. **El problema de las fuentes de tensión e inductores**: una fuente de tensión ideal no tiene una
   conductancia definida (impone una tensión, no relaciona corriente con tensión de forma directa),
   así que no puede eliminarse de la misma manera que una resistencia. La solución de MNA es
   **agregar la corriente por la fuente como una incógnita adicional** del sistema, y agregar una
   **ecuación de restricción** extra (`V_nodo+ − V_nodo− = V_fuente`) que amarra esa corriente al
   resto del sistema. Los inductores reciben un tratamiento análogo en análisis dinámico. Por eso
   la matriz se llama "modificada": no es puramente nodal, tiene filas/columnas extra por cada
   fuente de tensión/inductor del circuito.
3. **Resolución numérica**: el sistema lineal resultante `A·x = z` se resuelve con **eliminación
   gaussiana** (circuitos pequeños) o, más comúnmente en simuladores profesionales,
   **descomposición LU** de la matriz `A` — factorizarla como `L·U` permite resolver
   eficientemente para múltiples vectores `z` (por ejemplo, en cada paso de tiempo de una
   simulación transitoria) sin refactorizar desde cero. Para componentes no lineales (diodos,
   transistores, la curva V-I no lineal de un pararrayets ZnO — ver investigación 05), el sistema
   deja de ser lineal y se resuelve con **iteración de Newton-Raphson**, linealizando el circuito
   en cada iteración alrededor del punto de operación actual.

Esta es, sin exageración, la técnica más importante de toda la ingeniería asistida por
computadora en electrónica de potencia y circuitos — es el motor debajo de cualquier
`.cir`/`.sp` que alguien simula. Pero es fundamental entender **para qué problema existe**: MNA
resuelve un circuito **arbitrario**, uno que el usuario puede dibujar libremente conectando
cualquier componente a cualquier nodo, sin que el software conozca de antemano la topología.

**Por qué es sobrediseño para este proyecto (con una salvedad importante).** El simulador de
subestación de IDEA.md no necesita resolver un circuito arbitrario dibujado a mano alzada por el
usuario — necesita representar un **número fijo y conocido de topologías de subestación**
(barra simple, principal+transferencia, doble barra, anillo, interruptor y medio, doble
barra/doble interruptor — investigación 06), donde el "circuito" en cada instante es simplemente
qué componentes quedan conectados entre sí según el estado abierto/cerrado de interruptores y
seccionadores. No hay resistencias arbitrarias que resolver con KCL nodo por nodo: hay una
pregunta binaria por rama ("¿esta arista del grafo conduce o no?") y una pregunta de continuidad
("¿estos dos nodos quedan en la misma componente conexa?"). Construir un solver MNA completo para
esto sería equivalente a construir un motor de física de colisiones para animar una puerta que
solo se abre o se cierra.

**La salvedad**: si el "modo diseñador" de topologías (investigación 06, §7) evolucionara más allá
de conectividad de grafo hacia **cálculos de flujo de carga reales** — por ejemplo, mostrar cómo
se redistribuye la corriente entre dos líneas paralelas tras la apertura de un interruptor en un
anillo, o calcular caídas de tensión reales en función de impedancias de línea — en ese punto MNA
(o, más realista para el caso de solo-AC-de-régimen-permanente, un solver de flujo de potencia
tipo Newton-Raphson o Gauss-Seidel sobre la matriz de admitancias de barra, `Y_bus`, que es un
pariente cercano de MNA especializado en redes de potencia) sí sería la herramienta correcta a
introducir. Es la técnica a la que se **escala**, no la que se implementa desde el día uno.

## 2. Por qué el grafo con estados de arista es la elección correcta hoy

La investigación 06 ya describe el "modo diseñador" como un grafo: nodos = barras/circuitos,
aristas = interruptores/seccionadores con estado (abierto/cerrado/en falla). El algoritmo que
responde "¿qué circuitos quedan energizados tras esta maniobra o esta falla?" es **componentes
conexas sobre un grafo con aristas filtradas por estado** — BFS o DFS clásico, `O(V + E)`:

```js
// Pseudocódigo: qué nodos quedan energizados a partir de las fuentes,
// dado el estado actual de cada arista (interruptor/seccionador).
function nodosEnergizados(grafo, nodosFuente) {
  const visitado = new Set();
  const cola = [...nodosFuente];
  while (cola.length) {
    const nodo = cola.shift();
    if (visitado.has(nodo)) continue;
    visitado.add(nodo);
    for (const arista of grafo.aristasDe(nodo)) {
      if (arista.estado !== 'cerrado') continue; // arista abierta o en falla no conduce
      const vecino = arista.otroExtremo(nodo);
      if (!visitado.has(vecino)) cola.push(vecino);
    }
  }
  return visitado; // conjunto de nodos (barras/circuitos) energizados
}
```

Esto es deliberadamente mucho más simple que MNA, y esa simplicidad es la elección arquitectónica
correcta, no una limitación aceptada a regañadientes, por tres razones honestas:

1. **El objetivo pedagógico es confiabilidad de topología, no flujo de potencia.** Lo que el
   proyecto quiere enseñar (investigación 06, §7) es *por qué* una barra simple deja sin servicio
   a toda la subestación ante una falla de barra, y por qué un anillo o un interruptor-y-medio no.
   Esa es una pregunta de **alcanzabilidad en un grafo**, no de cuántos amperios circulan por cada
   rama. BFS/DFS responde exactamente esa pregunta con exactitud matemática — no es una
   aproximación degradada de MNA, es la herramienta correcta para el problema correcto.
2. **El costo de implementación y mantenimiento es órdenes de magnitud menor.** Un solver MNA
   competente requiere: ensamblado de matriz dispersa, pivoteo numérico, manejo de singularidades
   (nodos flotantes, lazos de solo-fuentes-de-tensión), y para el caso no lineal, Newton-Raphson
   con control de convergencia. Nada de eso es trivial de depurar, y ninguno de esos bugs es
   visible ni interesante para el objetivo educativo del proyecto. BFS/DFS sobre un grafo con
   quizás 20-30 nodos y aristas es código que un desarrollador puede leer, testear y confiar por
   completo en una tarde.
3. **Es técnicamente honesto, no una mentira simplificada.** El proyecto no pretende ser un
   estudio de flujo de carga — es un simulador educativo de topología y protecciones. Documentar
   explícitamente esta frontera (como se hace aquí) es más honesto que envolver un algoritmo de
   grafo simple con un vocabulario que sugiera cálculo eléctrico real que no está ocurriendo.

## 3. Máquinas de estado finito (FSM) para componentes discretos

Cada componente conmutable de la subestación tiene un ciclo de vida discreto que **no** debería
modelarse con variables booleanas sueltas (`estaAbierto`, `estaEnTransicion`, `estaBloqueado`,
...) y `if`/`else` dispersos por el código — ese patrón es exactamente el que produce bugs de
"estados imposibles" (¿qué significa `estaAbierto = true` y `estaEnTransicion = true` a la vez?).
La alternativa estándar en ingeniería de software para sistemas reactivos es una **máquina de
estado finito explícita**: un conjunto cerrado de estados nombrados, y una tabla de transiciones
válidas entre ellos, disparadas por eventos.

Para un interruptor de potencia (que, a diferencia de un seccionador, sí puede operar bajo carga —
ver investigación 02):

```
Estados: { ABIERTO, CERRADO, ABRIENDO, CERRANDO, BLOQUEADO }

Transiciones válidas:
  ABIERTO   --(comando: cerrar)-->            CERRANDO
  CERRANDO  --(fin de tiempo de operación)-->  CERRADO
  CERRADO   --(comando: abrir)-->              ABRIENDO
  CERRADO   --(disparo de protección)-->       ABRIENDO   // mismo destino, origen distinto
  ABRIENDO  --(fin de tiempo de operación)-->  ABIERTO
  cualquier estado --(falla de mecanismo)-->   BLOQUEADO
  BLOQUEADO --(reset manual autorizado)-->     ABIERTO
```

```js
const transicionesInterruptor = {
  ABIERTO:   { cerrar: 'CERRANDO' },
  CERRANDO:  { finOperacion: 'CERRADO' },
  CERRADO:   { abrir: 'ABRIENDO', disparoProteccion: 'ABRIENDO' },
  ABRIENDO:  { finOperacion: 'ABIERTO' },
  BLOQUEADO: { reset: 'ABIERTO' },
};

function transicionar(estadoActual, evento) {
  const destino = transicionesInterruptor[estadoActual]?.[evento];
  if (!destino) throw new Error(`Transición inválida: ${estadoActual} + ${evento}`);
  return destino;
}
```

Un relé de protección (investigación 03) tiene su propia FSM: `REPOSO → DETECTANDO → DISPARADO →
BLOQUEADO(lockout) → REPOSO` (tras reset), donde `DETECTANDO` es exactamente el estado que
representa el retardo de tiempo inverso de una curva TCC antes de emitir la orden de disparo.

**Beneficios concretos de hacerlo explícito, no como diseño abstracto sino aplicado a este
proyecto**:

- **Un solo lugar de verdad**: la tabla de transiciones documenta qué es legal, y cualquier código
  que intente una transición no listada falla de forma ruidosa en vez de dejar el sistema en un
  estado ambiguo silenciosamente.
- **Estados imposibles quedan estructuralmente prohibidos**: si el enclavamiento
  seccionador-interruptor se modela correctamente (ver §4), "seccionador abriéndose mientras el
  interruptor asociado está cerrado" nunca aparece como una transición disponible en la tabla del
  seccionador — no hace falta un `if` disperso que lo prevenga en tiempo de ejecución, la FSM
  simplemente no ofrece esa transición como opción.
- **Testeable de forma exhaustiva**: con un conjunto finito de estados y eventos, es viable
  escribir un test que recorra *todas* las combinaciones y verifique que solo las transiciones
  documentadas tienen efecto.

## 4. Statecharts (Harel): cuando una FSM plana no alcanza

El paper fundacional de David Harel, *"Statecharts: A Visual Formalism for Complex Systems"*
(1987), identifica el problema exacto que aparece al modelar una subestación completa con FSMs
planas: una FSM por componente es clara en aislamiento, pero el **enclavamiento** (interlocking)
entre componentes — la regla de seguridad más importante de una subestación real (investigación
02) de que un seccionador nunca debe operar mientras su interruptor asociado está cerrado — es
una relación **entre** dos máquinas de estado, no dentro de una. Modelarla ad-hoc con banderas
compartidas reproduce exactamente el problema que Harel describe: el número de estados combinados
crece de forma explosiva y "plana" (`interruptor × seccionador` = ya 25 combinaciones para 5×5
estados) y la mayoría de esas combinaciones son basura que solo existe por accidente de
implementación.

Harel extiende la FSM clásica con tres mecanismos, y los tres son relevantes aquí:

- **Jerarquía (estados anidados)**: un estado puede contener sub-estados. Por ejemplo, el estado
  `EN_SERVICIO` de una bahía completa puede contener sub-estados `NORMAL` / `EN_MANTENIMIENTO`,
  heredando las transiciones comunes del padre y solo divergiendo donde hace falta.
- **Regiones paralelas (ortogonalidad)**: dos o más FSM que están activas simultáneamente y se
  comunican por eventos, en vez de compartir estado mutable directamente. Este es exactamente el
  caso interruptor-seccionador: cada uno es una región paralela con su propia FSM, y el
  enclavamiento se implementa como el seccionador **escuchando eventos** del interruptor
  (`interruptor.estado === 'CERRADO'` deshabilita la transición `abrir` del seccionador) en vez de
  que ambos compartan una variable booleana externa.
- **Historia**: recordar el último sub-estado activo al reingresar a un estado compuesto — útil,
  por ejemplo, si una bahía sale de "fuera de servicio" y debe volver al mismo modo (normal vs.
  transferencia) en que estaba antes de la salida, no siempre al mismo default.

```js
// Pseudocódigo conceptual de enclavamiento como comunicación entre dos FSM (no XState real):
function puedeAbrirSeccionador(seccionador, interruptorAsociado) {
  // El seccionador consulta el estado del interruptor antes de aceptar la transición;
  // esto es "comunicación entre regiones paralelas" en términos de Harel.
  return interruptorAsociado.estado === 'ABIERTO';
}

function comandarAperturaSeccionador(seccionador, interruptorAsociado) {
  if (!puedeAbrirSeccionador(seccionador, interruptorAsociado)) {
    throw new Error('Enclavamiento: el interruptor debe estar abierto primero');
  }
  seccionador.estado = transicionar(seccionador.estado, 'abrir');
}
```

**XState** (statelyai/xstate) es la implementación de referencia de este formalismo en el
ecosistema JS/TS — soporta estados jerárquicos, paralelos e historia siguiendo directamente el
modelo de Harel, y tiene herramientas de visualización (Stately) que generan el diagrama a partir
del código, útil si el proyecto quisiera documentar visualmente el enclavamiento. El trade-off
honesto para este proyecto: XState es la herramienta *correcta* si el número de componentes con
FSM entrelazadas creciera mucho (muchas bahías, cada una con su propio árbol de enclavamientos,
posiblemente con timers y actores concurrentes) — pero para el alcance actual (un puñado de tipos
de componente, con enclavamientos que se pueden contar con los dedos de una mano), añadir una
dependencia de runtime y su curva de aprendizaje es más costo que beneficio frente a implementar
las FSMs a mano como objetos JS simples (tal como en los snippets de §3) más funciones de
enclavamiento explícitas como la de arriba. La lección de Harel que sí vale la pena adoptar sin
adoptar la librería es el **patrón conceptual**: modelar el enclavamiento como comunicación
explícita entre FSMs paralelas, nunca como banderas compartidas mutables.

## 5. Entity Component System (ECS): cuándo migrar más allá de `userData`

ECS es el patrón dominante en motores de videojuegos modernos (Bevy, Unity DOTS) para manejar
grandes cantidades de objetos con combinaciones heterogéneas de comportamiento, resolviendo el
problema clásico de la herencia orientada a objetos ("¿el Interruptor hereda de
ComponenteElectrico o de ObjetoAnimable? ¿y si necesita ambos, más Interactuable?" — el problema
del diamante y las jerarquías rígidas). El principio central, **composición sobre herencia**:

- **Entidad**: no es un objeto con métodos, es literalmente solo un identificador (un número o
  UUID).
- **Componente**: datos puros, sin lógica, adjuntos a una entidad (`Posicion`, `EstadoElectrico`,
  `Animable`).
- **Sistema**: una función que itera sobre *todas* las entidades que tienen cierta combinación de
  componentes y opera sobre sus datos (`sistemaDeAnimacion` opera sobre toda entidad con
  `Posicion` + `Animable`, sin que le importe si esa entidad también es un `Interruptor` o un
  `Transformador`).

En Bevy esto está optimizado a nivel de layout de memoria (arrays contiguos por tipo de
componente, para localidad de caché en simulaciones con decenas de miles de entidades) — una
motivación de *rendimiento* que, para un proyecto con quizás 30-60 componentes interactivos en
escena, simplemente no aplica: no hay problema de rendimiento que ECS-con-arrays-planos resuelva
aquí que `userData` de Three.js no resuelva igual de bien.

**Comparación concreta con `userData` (la elección ya hecha en IDEA.md §8)**:

```js
// Enfoque actual del proyecto: jerarquía Three.js + userData
const grupoInterruptor = new THREE.Group();
grupoInterruptor.userData = {
  tipo: 'interruptor',
  id: 'CB-12',
  estadoElectrico: interruptorModel, // referencia al objeto de dominio (la FSM de §3)
};
escena.add(grupoInterruptor);

// "Sistema" ad-hoc: recorrer la escena buscando por tipo
escena.traverse((obj) => {
  if (obj.userData.tipo === 'interruptor') actualizarAnimacion(obj, obj.userData.estadoElectrico);
});
```

Esto **ya es**, informalmente, una forma minimalista de ECS: el `THREE.Object3D` hace de
"entidad" (con su malla como un componente implícito de renderizado), `userData` lleva los
"componentes" de dominio, y funciones como `actualizarAnimacion` son "sistemas" que filtran por
`tipo`. La diferencia con ECS real es que no hay un motor de consultas optimizado ni separación
estricta de arrays de datos — es composición manual, no automatizada.

**¿En qué punto se justificaría migrar a ECS real (`bitecs` para rendimiento extremo con
TypedArrays, o `miniplex` — más cercano en espíritu, orientado a ergonomía sobre performance, con
buena integración a React Three Fiber)?** Señales concretas, no genéricas:

1. El número de componentes interactivos crece a **cientos** (ej. si el proyecto se expandiera a
   modelar una red de subestaciones interconectadas, no una sola), y recorrer/filtrar la escena
   con `traverse` empieza a medirse en el profiler.
2. Aparecen **muchas combinaciones distintas** de comportamiento cruzado (un componente que es a
   la vez animable, eléctrico, term­osensible, fallable) tal que la lógica de "qué sistema aplica
   a qué objeto" se vuelve difícil de rastrear manualmente vía `userData.tipo`.
3. El proyecto empieza a necesitar **serialización/deserialización** eficiente de todo el estado
   de la escena (guardar/cargar una topología diseñada en el modo diseñador con su estado
   completo) — ECS con almacenamiento en arrays planos serializa de forma más directa que un árbol
   de objetos Three.js con referencias cruzadas.

Ninguna de estas señales está presente en el alcance actual del proyecto (decenas, no cientos, de
componentes; tipos de comportamiento acotados y ya enumerados en IDEA.md §7). Por eso `userData` +
jerarquía simple de `THREE.Group` es la elección correcta hoy, con ECS real como ruta de escape
documentada si el alcance crece en esas direcciones específicas.

## 6. Separación modelo/vista: el patrón formal detrás de la decisión ya tomada

IDEA.md §8 ya decide que "Three.js solo renderiza el estado, no contiene lógica eléctrica". El
patrón de diseño formal que esto representa es una variante de **Model-View-Presenter (MVP)** —
extendido con **Observer/pub-sub** para la comunicación modelo→vista — muy usado tanto en UI
empresarial como en motores de juego/simulación donde el "modelo" (física, reglas de juego, en
este caso reglas eléctricas) debe poder testearse sin levantar el motor gráfico.

La estructura concreta para este proyecto:

- **Model** (`SubstationModel` y las FSMs de sus componentes): JS/TS puro. No importa `three` en
  ningún archivo de esta capa. Expone métodos como `comandarApertura(id)`,
  `simularFalla(nodoId)`, y un mecanismo de suscripción (`onCambioEstado(callback)`) para notificar
  cuándo algo cambió — un pub-sub simple, no necesita una librería:

```ts
class SubstationModel {
  private listeners: Array<() => void> = [];

  onCambioEstado(callback: () => void) {
    this.listeners.push(callback);
  }

  private notificar() {
    for (const cb of this.listeners) cb();
  }

  comandarApertura(id: string) {
    const interruptor = this.interruptores.get(id);
    interruptor.estado = transicionar(interruptor.estado, 'abrir');
    this.recalcularEnergizacion(); // BFS/DFS de §2
    this.notificar();
  }
}
```

- **View** (código Three.js): se suscribe una sola vez (`model.onCambioEstado(() =>
  sincronizarEscena(model, escena))`) y, en cada notificación, lee el estado actual del modelo y
  actualiza mallas/materiales/animaciones en consecuencia. La vista **nunca** decide lógica
  eléctrica — solo traduce estado a geometría (ej. `estado === 'CERRADO'` → posición Y del
  seccionador en su punto de cierre; `energizado === true` → material emisivo rojo/naranja en la
  barra).
- **Presenter** (implícito, opcional en este proyecto): el manejador de eventos de UI/raycaster
  que traduce un click del usuario en una llamada al modelo (`model.comandarApertura(id)`) — en un
  proyecto de este tamaño puede vivir como funciones simples en la capa de vista, sin necesitar
  una clase Presenter separada; lo importante arquitectónicamente es que la *dirección* del flujo
  se mantenga siempre modelo → notifica → vista se actualiza, nunca vista modificando estado
  eléctrico directamente.

**Beneficio directo y concreto para este proyecto**: la lógica de enclavamiento
(seccionador-interruptor), la lógica de protección diferencial (investigación 01/03: comparar
corrientes primaria/secundaria de un transformador y discriminar inrush), o el cálculo de tensión
de paso/tensión de contacto (investigación 04, IEEE 80) pueden testearse por completo con
Jest/Vitest — instanciando `SubstationModel`, invocando métodos, y verificando el estado
resultante — **sin levantar un navegador ni un contexto WebGL**. Esto no es un beneficio teórico:
es la diferencia entre un test que corre en milisegundos en CI y uno que necesita un entorno
headless con soporte WebGL (frágil, lento, difícil de depurar) solo para verificar que un
seccionador no puede abrir bajo carga.

## 7. Puntos clave para el simulador de subestación

Propuesta concreta de estructura de módulos para `SubstationModel`, combinando las técnicas
correctamente dimensionadas de las secciones anteriores:

```
src/
  domain/                          # capa de modelo — cero imports de 'three'
    components/
      Interruptor.ts               # FSM a mano (§3): estados, tabla de transiciones, guardas
      Seccionador.ts               # FSM a mano + consulta de enclavamiento (§4, sin XState)
      Rele.ts                      # FSM: reposo/detectando/disparado/bloqueado
      Transformador.ts             # estado eléctrico simple (no MNA): tensión/corriente nominal,
                                    # curva de eficiencia, lógica de inrush (investigación 01)
    graph/
      ConnectivityGraph.ts         # nodos = barras/circuitos, aristas = interruptor/seccionador
      bfsEnergizacion.ts           # BFS/DFS (§2) — algoritmo central del modo maniobra y diseño
    interlocking/
      reglas.ts                    # funciones de enclavamiento explícitas entre FSMs (§4)
    SubstationModel.ts             # orquestador: agrega componentes + grafo, expone comandos,
                                    # pub-sub de cambios (§6)
    __tests__/                     # Jest/Vitest puro, sin WebGL
  scene/                           # capa de vista — sí importa 'three'
    ComponentGroupFactory.ts       # construye THREE.Group + userData por tipo de componente
    sincronizarEscena.ts           # suscrito a model.onCambioEstado(); traduce estado → geometría
    interaction/
      raycasterHandler.ts          # click → model.comandarApertura(id) ("Presenter" implícito)
```

**Por qué NO se recomienda ECS completo ni MNA completo, explícitamente**:

- **MNA/flujo de potencia real**: correcto para resolver un circuito arbitrario, pero este
  proyecto no tiene un circuito arbitrario — tiene un número fijo de topologías conocidas
  (investigación 06) donde la pregunta relevante es conectividad, no reparto de corriente. Señal
  de escalar: si el modo diseñador necesitara mostrar redistribución real de flujo de carga entre
  líneas paralelas tras una maniobra, ahí se justifica introducir un solver de `Y_bus`
  (Newton-Raphson/Gauss-Seidel), pariente de MNA especializado en redes de potencia en régimen
  permanente.
- **ECS completo**: correcto cuando el número de entidades y la heterogeneidad de combinaciones de
  comportamiento crecen a cientos de objetos con necesidades de rendimiento y serialización que
  `userData` deja de resolver limpiamente (§5). Con decenas de componentes de tipos ya acotados,
  `THREE.Group` + `userData` referenciando objetos de dominio es composición suficiente sin la
  sobrecarga conceptual de un motor de consultas ECS.
- **XState/statecharts como librería**: el *patrón* de Harel (FSMs paralelas comunicándose por
  eventos, no banderas compartidas) sí se adopta desde el día uno como disciplina de diseño; la
  *librería* se pospone hasta que el árbol de enclavamientos crezca lo suficiente (muchas bahías,
  timers concurrentes, necesidad de visualización automática) para que el costo de la dependencia
  se pague solo.

El principio que atraviesa las tres decisiones: elegir, para cada problema, la técnica cuya
complejidad coincide con la complejidad real del problema tal como está definido *hoy* en
IDEA.md — documentando explícitamente la señal futura que justificaría escalar, en vez de
sobre-construir por anticipación especulativa o de subestimar y acumular deuda técnica silenciosa.

---

## Fuentes

- [The Modified Nodal Analysis (MNA) Method — Dr. José Ernesto Rayas-Sánchez, ITESO](https://desi.iteso.mx/erayas/documents/cad_course/lectures/FORMULATION_CIR_EQ/MNA_method.pdf)
- [The Modified Nodal Approach to Network Analysis — UCSD CSE245 course reading](https://cseweb.ucsd.edu/classes/fa04/cse245/Reading/MNA.pdf)
- [ASTAP and the history of nodal/modified-nodal circuit simulation — Wikipedia](https://en.wikipedia.org/wiki/ASTAP)
- [Statecharts: A Visual Formalism for Complex Systems — David Harel, original PDF (dubroy.com mirror)](https://dubroy.com/refs/Statecharts_a_visual_formalism_for_complex_systems.pdf)
- [Statecharts: A visual formalism for complex systems — course reading, University of Waterloo](https://cs.uwaterloo.ca/~jmatlee/Teaching/CS846/Schedule/Jan23/Taha.pdf)
- [Paper of the Week: Statecharts — Recurse Center blog (resumen accesible)](https://www.recurse.com/blog/59-paper-of-the-week-statecharts-a-visual-formalism-for-complex-systems)
- [XState — JavaScript/TypeScript state machines and statecharts, documentación oficial](https://xstate.js.org/)
- [XState: Parallel states — Stately docs](https://stately.ai/docs/parallel-states)
- [statelyai/xstate — repositorio oficial en GitHub](https://github.com/statelyai/xstate)
- [Parallel State — Statecharts glossary (statecharts.dev)](https://statecharts.dev/glossary/parallel-state.html)
- [Entity Component System — Bevy engine, guía oficial "Getting Started"](https://bevy.org/learn/quick-start/getting-started/ecs/)
- [bevy_ecs — documentación de la crate en docs.rs](https://docs.rs/bevy_ecs/latest/bevy_ecs/)
- [Entities, Components — Unofficial Bevy Cheat Book](https://bevy-cheatbook.github.io/programming/ec.html)
- [bitECS — Flexible, minimal, data-oriented ECS library para TypeScript/JavaScript](https://github.com/NateTheGreatt/bitECS)
- [Miniplex 2.0 — ECS ergonómico para JS/TS con integración a React Three Fiber](https://www.hmans.dev/posts/miniplex-2-beta/)
- [Entity Component System (ECS) — guía conceptual, Web Game Dev](https://www.webgamedev.com/code-architecture/ecs)
- [Model-View-Presenter Pattern — Java Design Patterns (referencia general del patrón)](https://java-design-patterns.com/patterns/model-view-presenter/)
- [The Model-View-Presenter (MVP) Pattern — Microsoft Learn / patterns & practices](https://learn.microsoft.com/en-us/previous-versions/msp-n-p/ff649571(v=pandp.10))
- [Model-view-controller architecture in Unity — David Oliver, aplicación del patrón a motores de juego](https://davidjohnoliver.com/2017/02/16/model-view-controller-architecture-in-unity/)
