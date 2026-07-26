# Bucles de simulación en tiempo real e integración numérica para fenómenos eléctricos

> A diferencia de las investigaciones 01-08 (teoría eléctrica), este documento cubre la **capa de
> ingeniería de software** que debe sostener esa teoría: cómo se programa correctamente un bucle
> de simulación interactiva para que el arco eléctrico, la corriente de inrush o el offset DC no
> sean solo "animaciones que se ven bien", sino la integración numérica correcta de las ecuaciones
> diferenciales que los describen.

## 1. El problema del framerate variable

Un error común y tentador en un simulador Three.js es actualizar el estado físico/eléctrico
directamente dentro del callback de `requestAnimationFrame`, usando como paso de tiempo el delta
real entre frames:

```js
let last = performance.now();
function frame(now) {
  const dt = (now - last) / 1000; // segundos, variable: ~0.0166 en 60 Hz, pero puede saltar a 0.5+ si hay lag
  last = now;
  updatePhysics(state, dt); // ← BUG: dt entra directo a la integración
  render(state);
  requestAnimationFrame(frame);
}
```

`requestAnimationFrame` no da ninguna garantía de cadencia: normalmente entrega ~16.6 ms (60 Hz)
en una pantalla estándar, pero un frame de garbage collection, una pestaña que pierde foco y se
regulariza a 1 Hz, una carga de textura, o simplemente una GPU lenta, pueden producir un `dt` de
100 ms, 500 ms o varios segundos en el siguiente callback. El resultado de pasar ese `dt` variable
directo a la física es una simulación **no determinista**: la misma secuencia de eventos produce
trayectorias distintas según qué tan rápido corrió el hardware ese día, y — más grave para EDOs —
puede **divergir numéricamente**.

Esto es especialmente serio para integración explícita de ecuaciones diferenciales (ver §3): los
métodos explícitos (Euler explícito, y en menor medida semi-implícito o RK4) tienen una región de
estabilidad acotada en función del paso de tiempo `h` y de los autovalores del sistema. Si `h`
crece por encima de ese umbral —lo cual ocurre exactamente cuando el framerate cae, es decir, en el
peor momento posible—, el error de truncamiento no solo crece: puede **amplificarse en cada paso**
y la solución numérica "explota" a infinito o NaN, incluso si la EDO real es físicamente estable
(*"your spring simulation exploding to infinity, fast moving objects tunneling through walls"*,
[Fiedler, *Fix Your Timestep!*](https://gafferongames.com/post/fix_your_timestep/)). Es la peor
combinación posible: justo cuando el hardware está más estresado (frame largo), el motor de física
recibe el paso más grande y menos estable.

Conclusión de diseño: el paso de integración de la física/electricidad **no puede ser** el delta de
render. Necesita su propio reloj, fijo, independiente del framerate.

## 2. Patrón de timestep fijo con acumulador ("Fix Your Timestep!")

El artículo de referencia de la industria, [Glenn Fiedler — *Fix Your
Timestep!*](https://gafferongames.com/post/fix_your_timestep/) (gafferongames.com), y el capítulo
equivalente de [Robert Nystrom — *Game Loop*, Game Programming
Patterns](https://gameprogrammingpatterns.com/game-loop.html), formalizan el patrón estándar:
desacoplar la **tasa de actualización del modelo** (fija, ej. 60 Hz, o más si el fenómeno lo exige)
de la **tasa de render** (variable, la que el navegador conceda). Un acumulador de tiempo real
dispara N pasos fijos de actualización por frame de render.

```js
const DT = 1 / 60;           // paso fijo de la simulación eléctrica, en segundos de tiempo simulado
const MAX_FRAME_TIME = 0.25; // clamp defensivo (ver §6)

let accumulator = 0;
let previousState = cloneState(state);
let last = performance.now();

function frame(now) {
  let frameTime = (now - last) / 1000;
  last = now;
  frameTime = Math.min(frameTime, MAX_FRAME_TIME); // evita "spiral of death"

  accumulator += frameTime;

  while (accumulator >= DT) {
    previousState = cloneState(state);
    integrate(state, DT);      // ← EDOs avanzan siempre con el mismo h, nunca varía
    accumulator -= DT;
  }

  const alpha = accumulator / DT;               // fracción [0,1) de progreso hacia el próximo paso
  const renderState = interpolate(previousState, state, alpha);
  renderScene(renderState);                      // Three.js solo pinta esto

  requestAnimationFrame(frame);
}
```

Puntos clave del patrón:

- El `while` interno puede ejecutar 0, 1 o varios pasos por frame de render — si el frame tardó
  40 ms y `DT=16.6 ms`, se ejecutan ~2 pasos antes de renderizar; si el frame tardó 8 ms (monitor de
  120 Hz), puede ejecutarse 0 pasos ese frame y el estado renderizado es pura interpolación.
- **Interpolación de estado para el render**: el resto no consumido del acumulador (`alpha`) se usa
  para mezclar el estado físico anterior y el actual (`renderState = previousState*(1-alpha) +
  state*alpha`), evitando el *jitter* visual característico de un timestep fijo sin interpolar (el
  ojo percibe micro-paradas cuando la cadencia de render no es múltiplo exacto de `DT`). Godot
  implementa exactamente esta idea vía `Engine.get_physics_interpolation_fraction()` desde la 3.5/
  3.6 ([Godot física interpolada](https://github.com/lawnjelly/smoothing-addon); discusión de
  jitter en [godot-proposals #1936](https://github.com/godotengine/godot-proposals/issues/1936)).
- La simulación **de dominio** (el modelo eléctrico) nunca ve un `dt` distinto de `DT`. Esto es lo
  que la hace determinista (§5) y numéricamente estable frente a variaciones de hardware.

Unity formaliza el mismo patrón con `FixedUpdate()` / `Time.fixedDeltaTime` (por defecto 0.02 s,
50 Hz): *"FixedUpdate may be called zero, one, or multiple times per frame depending on the frame
rate... ensuring that physics calculations remain consistent and deterministic, regardless of how
fast the game renders frames"* ([Unity Manual — Fixed
updates](https://docs.unity3d.com/6000.1/Documentation/Manual/fixed-updates.html)). Godot expone el
equivalente como `_physics_process(delta)` a una tasa configurable (Physics FPS, 60 Hz por defecto)
separada de `_process(delta)` (tasa de render libre) — ver
[discusión técnica en Kehom's Forge](https://kehomsforge.com/tutorials/single/process-physics-process-godot/).
Es la misma arquitectura que IDEA.md §8 ya propone para este proyecto (modelo de dominio separado
de la escena Three.js): aquí se concreta *cómo* se ejecuta ese modelo en el tiempo.

## 3. Métodos de integración numérica para EDOs

El acumulador resuelve *cuándo* se llama a `integrate(state, DT)`; falta resolver *cómo* esa
función avanza el estado un paso `DT`. Todo fenómeno dinámico continuo del simulador —conductancia
del arco, corriente de inrush, offset DC, oscilación de TRV— es, en el fondo, una EDO de la forma
`dy/dt = f(y, t)` que hay que integrar numéricamente.

### 3.1 Euler explícito

```js
// dy/dt = f(y, t)
function eulerExplicit(y, t, dt, f) {
  return y + f(y, t) * dt;
}
```

Evalúa la derivada en el estado actual y avanza en línea recta durante todo el paso. Es el método
más simple (1 evaluación de `f` por paso) pero acumula error de truncamiento local `O(dt²)` y error
global `O(dt)` — orden 1. Para pasos grandes, o para sistemas con dinámica rápida frente al paso
elegido (ver "ecuaciones rígidas" abajo), el error no solo crece: la solución numérica puede
**ganar energía artificialmente** en cada paso y diverger a infinito, incluso si el sistema físico
real es estable o disipativo ([Fiedler — *Integration
Basics*](https://gafferongames.com/post/integration_basics/): un oscilador amortiguado integrado
con Euler explícito "gana energía con el tiempo" en vez de decaer).

### 3.2 Euler semi-implícito (symplectic Euler)

```js
function eulerSemiImplicit(state, dt, forces) {
  state.v += forces(state) / state.m * dt; // 1) actualizar velocidad con la aceleración actual
  state.x += state.v * dt;                  // 2) actualizar posición con la velocidad YA actualizada
}
```

El cambio es mínimo: solo se invierte el orden (se usa la velocidad *nueva* para actualizar la
posición). El costo computacional es idéntico a Euler explícito (misma cantidad de evaluaciones),
pero la propiedad cualitativa es muy distinta: al ser un **integrador simpléctico**, conserva
aproximadamente la energía del sistema en vez de inyectarla o disiparla artificialmente en cada
paso ([Wikipedia — *Semi-implicit Euler
method*](https://en.wikipedia.org/wiki/Semi-implicit_Euler_method)). Por eso es, según Fiedler, el
método "gold standard" de facto en motores de física interactivos: *"cheap and easy to implement,
much more stable than explicit Euler"* — mismo orden de precisión formal (orden 1) que Euler
explícito, pero cualitativamente mucho más estable en simulaciones largas.

### 3.3 Runge-Kutta 4 (RK4)

```js
function rk4(y, t, dt, f) {
  const a = f(y, t);
  const b = f(y + a * dt / 2, t + dt / 2);
  const c = f(y + b * dt / 2, t + dt / 2);
  const d = f(y + c * dt, t + dt);
  return y + (a + 2 * b + 2 * c + d) * (dt / 6);
}
```

RK4 evalúa la derivada 4 veces por paso, en puntos escalonados dentro del intervalo, y combina esas
pendientes con pesos que cancelan el error hasta orden 4 (`O(dt⁵)` local, `O(dt⁴)` global) —
sustancialmente más preciso que Euler para el mismo `dt`, a 4× el costo de evaluación. Cuándo se
justifica ese costo extra:

- **Se justifica**: sistemas donde la derivada cambia rápidamente *dentro* de un mismo paso (alta
  curvatura), o donde se necesita alta precisión con pasos relativamente grandes por costo de CPU
  (ej. integrar muchos cuerpos a la vez). RK4 captura mejor esa curvatura al muestrear en 4 puntos.
- **Es overkill**: para la mayoría de la dinámica de videojuego (movimiento de cámara, resortes de
  UI, partículas) donde semi-implícito ya es "indistinguible a simple vista" del resultado exacto
  con un `dt` razonable ([Fiedler, *Integration
  Basics*](https://gafferongames.com/post/integration_basics/)). Además, en simulaciones largas RK4
  **pierde energía** gradualmente (drift), mientras que semi-implícito la conserva "en promedio" —
  para animación interactiva sostenida, esa propiedad cualitativa suele importar más que la
  precisión numérica fina.

### 3.4 Ecuaciones rígidas (stiff equations) y el caso del arco eléctrico

Una EDO (o sistema de EDOs) es **rígida** cuando coexisten dentro de la misma dinámica escalas de
tiempo muy distintas: hay componentes de la solución que varían lentamente y otras (generalmente
transitorios) que varían muy rápido, de modo que un método explícito necesita pasos diminutos para
no volverse inestable, aun cuando la parte "interesante" de la solución varíe lento
([Wikipedia — *Stiff equation*](https://en.wikipedia.org/wiki/Stiff_equation); [HandWiki — *Stiff
equation*](https://handwiki.org/wiki/Stiff_equation)). Formalmente, ocurre cuando los autovalores
del sistema linealizado tienen partes reales negativas muy separadas en magnitud; los métodos
implícitos (ej. Euler implícito/backward) toleran pasos grandes en sistemas rígidos porque su región
de estabilidad es mucho mayor, a costa de resolver una ecuación (generalmente no lineal) en cada
paso ([MathWorks — *Stiff Differential
Equations*](https://www.mathworks.com/company/technical-articles/stiff-differential-equations.html)).

El modelo de **Mayr** de la investigación 02 (`dg/dt = (1/τ)·(P/P0 − 1)·g`, con colapso abrupto de
conductancia `g` cerca del cruce por cero de corriente) es un caso de manual: la conductancia cae
varios órdenes de magnitud en una ventana de tiempo mucho más corta que el período de la onda de
50/60 Hz que lo rodea — exactamente la firma de un sistema con dos escalas de tiempo muy separadas.
En software de transitorios electromagnéticos de nivel profesional (EMTP/ATP) los modelos de arco
Cassie-Mayr efectivamente se resuelven con solvers de **ecuaciones algebraico-diferenciales (DAE)
de paso variable y precisión ajustable**, precisamente por esta rigidez cerca del cruce por cero
([discusión de la dificultad de resolver las ecuaciones de conservación del arco en programas de
transitorios](https://www.researchgate.net/publication/3274972_An_Improved_Arc_Model_Before_Current_Zero_Based_on_the_Combined_Mayr_and_Cassie_Arc_Models)).
Para el simulador educativo esto no exige un solver DAE completo, pero sí dos decisiones
conscientes: (a) reducir el paso de integración específicamente en la ventana cercana al cruce por
cero (sub-stepping local, ver §4), y (b) preferir semi-implícito o RK4 sobre Euler explícito para
esta EDO en particular, porque es justo el caso donde Euler explícito con paso fijo típico (16.6 ms
a 60 Hz) es demasiado grueso frente a la escala de microsegundos del colapso.

## 4. Escalamiento de tiempo (time dilation) para fenómenos multi-escala

El simulador debe mostrar simultáneamente fenómenos en escalas radicalmente distintas: el arco y el
frente de onda de rayo (microsegundos, 1.2/50 µs), el ciclo de red y la interrupción del interruptor
(milisegundos, 3-5 ciclos ≈ 50-83 ms), y el recierre automático (segundos, tiempo muerto 0.3-3 s,
investigación 02 §7). Ningún `DT` fijo único sirve para las tres escalas a la vez: un `DT` lo
bastante fino para resolver un frente de rayo de microsegundos (que exigiría del orden de decenas
de miles de pasos por segundo simulado) desperdicia cómputo absurdo integrando un tiempo muerto de
recierre de 2 segundos a esa misma resolución, mientras que un `DT` razonable para el tiempo muerto
(decenas de ms) es completamente ciego al arco.

La solución estándar en simulación educativa/científica interactiva combina dos mecanismos:

1. **Factor de escala de tiempo (time scale) ajustable por el usuario**: el tiempo *simulado* que
   avanza en cada paso no es 1:1 con el tiempo real — se multiplica por un factor `timeScale`
   controlado por un slider ("velocidad de simulación"), típicamente >1 para expandir fenómenos de
   microsegundos a un ritmo observable (slow-motion "hacia adentro": el usuario ve en 2 segundos
   reales algo que ocurrió en 200 µs) y también <1 o "salto de tiempo" para comprimir esperas largas
   como el tiempo muerto del recierre. Esto es ortogonal al patrón de timestep fijo del §2: el
   acumulador sigue corriendo a `DT` fijo de *tiempo simulado*, pero la tasa a la que el tiempo real
   alimenta el acumulador se escala:
   ```js
   accumulator += frameTime * timeScale; // timeScale: p.ej. 0.001 para "ver" microsegundos como ms
   ```
2. **Sub-stepping variable por subsistema**: en vez de forzar un único `DT` global finísimo, cada
   subsistema dinámico corre su propio número de sub-pasos dentro del mismo paso de "reloj maestro",
   proporcional a la rapidez de su propia dinámica — el arco/TRV se subdivide en muchos más
   sub-pasos que, por ejemplo, la variable de estado del tiempo muerto del recierre, que solo
   necesita actualizarse a una cadencia gruesa (o incluso resolverse analíticamente como una cuenta
   regresiva, sin EDO real de por medio). Esto es análogo a cómo motores de física con múltiples
   dominios (rígidos vs. blandos vs. fluidos) asignan distintas tasas de sub-step a cada solver en
   vez de forzar el paso más fino globalmente.

En la práctica para este proyecto, lo pragmático es: el "reloj maestro" del modelo eléctrico corre a
un `DT` fijo moderado (ej. 1/240 s de tiempo simulado, suficiente para varios ciclos de 50/60 Hz con
buena resolución visual), y únicamente durante ventanas explícitamente marcadas como "de alta
frecuencia" (el arco en los ~1-2 ms alrededor del cruce por cero, el frente de onda de rayo durante
su propia animación dedicada) se activa un sub-stepping interno más fino solo para esa EDO
específica, sin cambiar el `DT` del resto del sistema.

## 5. Determinismo y reproducibilidad

Con timestep variable (`dt` = delta de render pasado directo a la física), la trayectoria de la
simulación depende de la secuencia exacta de tiempos de frame que entregó el navegador ese día —
irreproducible entre ejecuciones, entre máquinas, e incluso entre dos corridas en la misma máquina
si hubo jitter distinto de GC o de scheduling del sistema operativo. Con timestep fijo y
acumulador, en cambio, la secuencia de llamadas a `integrate(state, DT)` es exactamente la misma
para una misma secuencia de entradas del usuario, independientemente de cuántos frames de render
haya tomado en llegar ahí: la física ve siempre el mismo `DT`, en el mismo orden, con las mismas
entradas — la única variable posible es *dónde* cae el `alpha` de interpolación visual, que no
afecta el estado del modelo, solo su presentación. Esto es exactamente lo que Nystrom señala como
motivación para lockstep en juegos en red ([Game Programming Patterns — Game
Loop](https://gameprogrammingpatterns.com/game-loop.html)) y lo que Fiedler describe como la base
para que *"your simulation behaves exactly the same from one run to the next without any potential
for different behavior depending on the render framerate"* ([Fix Your
Timestep!](https://gafferongames.com/post/fix_your_timestep/)).

Para este proyecto, el determinismo habilita directamente una funcionalidad de valor pedagógico: un
**modo replay** de una falla simulada. Si se registra únicamente la secuencia de eventos de entrada
(cuándo se cerró un interruptor, cuándo se inyectó una falla, con qué parámetros) y el modelo es
determinista, no hace falta grabar el estado completo cuadro a cuadro — basta con re-ejecutar el
mismo log de entradas contra el mismo `integrate()` para reproducir *exactamente* la misma
secuencia de arco/TRV/despeje, útil para que el instructor o el propio estudiante repase paso a
paso una falla ya ocurrida.

## 6. Arquitectura práctica para Three.js/JS

Aplicando lo anterior a la arquitectura ya decidida en IDEA.md §8 (modelo de dominio eléctrico
separado de la escena Three.js — Three.js solo renderiza estado, no contiene lógica eléctrica):

```js
class SimulationLoop {
  constructor(model, scene, { dt = 1 / 60, maxFrameTime = 0.25 } = {}) {
    this.model = model;         // SubstationModel: EDOs, grafo, estados de protección
    this.scene = scene;         // capa de render Three.js (solo lectura del estado)
    this.dt = dt;
    this.maxFrameTime = maxFrameTime;
    this.accumulator = 0;
    this.timeScale = 1;         // slider de "velocidad de simulación" (§4)
    this.lastTime = performance.now(); // alta resolución, sub-milisegundo, monotónico
  }

  tick(now) {
    let frameTime = (now - this.lastTime) / 1000;
    this.lastTime = now;

    // Clamp defensivo: si la pestaña estuvo en background (rAF pausado por el navegador) y
    // vuelve con un frameTime de varios segundos, NO intentamos "ponernos al día" simulando
    // todo ese tiempo real de golpe — eso dispararía cientos de pasos en un solo frame y
    // congelaría la pestaña (spiral of death: cada paso tarda más en calcularse que el tiempo
    // que "resuelve", así que la deuda del acumulador crece más rápido de lo que se paga).
    frameTime = Math.min(frameTime, this.maxFrameTime);

    this.accumulator += frameTime * this.timeScale;

    let steps = 0;
    const MAX_STEPS = 8; // segundo cinturón de seguridad: tope duro de pasos por frame
    while (this.accumulator >= this.dt && steps < MAX_STEPS) {
      this.model.previous = this.model.snapshot();
      this.model.integrate(this.dt); // Euler semi-implícito / RK4 según la EDO, ver §3
      this.accumulator -= this.dt;
      steps++;
    }
    if (steps === MAX_STEPS) this.accumulator = 0; // descarta deuda residual en vez de acumularla

    const alpha = this.accumulator / this.dt;
    this.scene.render(this.model.interpolatedState(alpha));

    requestAnimationFrame((t) => this.tick(t));
  }

  start() { requestAnimationFrame((t) => this.tick(t)); }
}
```

Notas de implementación:

- `performance.now()` (no `Date.now()`) da timestamps monotónicos de alta resolución (sub-ms) no
  afectados por ajustes del reloj del sistema; el propio timestamp que recibe el callback de
  `requestAnimationFrame` ya está basado en `performance.now()`
  ([MDN — `Window.requestAnimationFrame()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame)).
- El navegador **pausa** `requestAnimationFrame` en pestañas en segundo plano para ahorrar batería;
  al volver a foco, el siguiente callback llega con un `frameTime` gigante. El doble clamp
  (`Math.min(frameTime, maxFrameTime)` + tope duro `MAX_STEPS` en el bucle) es exactamente la
  defensa contra la **espiral de la muerte** (*spiral of death*): sin él, un `frameTime` de varios
  segundos generaría cientos de pasos de física encolados; si cada paso tarda en calcularse más de
  lo que "resuelve" en tiempo simulado, la deuda del acumulador crece en vez de reducirse y el
  frame nunca termina de renderizar — la pestaña se congela.
- `model.integrate(dt)` es el único punto de entrada a las EDOs del dominio eléctrico; Three.js
  nunca llama directamente a nada relacionado con arco/inrush/offset DC — solo lee
  `interpolatedState(alpha)` para pintar.

## 7. Puntos clave para el simulador de subestación

1. **Arco Cassie-Mayr (investigación 02) como EDO integrada, no como animación keyframe**: el
   estado de conductancia `g(t)` del arco debe vivir en `SubstationModel`, avanzado por
   `integrate(dt)` con Euler semi-implícito como método por defecto (barato, estable, conserva
   bien el comportamiento cualitativo del semiciclo). En la ventana estrecha alrededor del cruce
   por cero (donde, por §3.4, el sistema se vuelve rígido y `g` colapsa en microsegundos), conviene
   activar sub-stepping local más fino, o directamente RK4 para esos pocos pasos — el costo extra
   de 4 evaluaciones es insignificante porque la ventana es corta, y la precisión ahí es justo la
   que determina si la animación de "extinción exactamente en `sin(ωt)=0`" (mecánica ya descrita en
   IDEA.md §7) se ve numéricamente limpia o con un colapso a saltos visibles.
2. **Offset DC de cortocircuito (investigación 08) — cuándo integrar vs. resolver analíticamente**:
   `i(t) = √2·I_sym·sin(ωt+α−φ) + I_dc(0)·e^(−t/τ)` tiene **solución cerrada** conocida (una
   exponencial simple más una senoidal). Para este caso concreto **no conviene integrar
   numéricamente paso a paso** — evaluar directamente `I_dc(0)·Math.exp(-t/tau)` en cada frame es
   más preciso (cero error de truncamiento, exacto para cualquier `t`), más barato, y trivialmente
   determinista sin necesidad de acumulador. La integración numérica de EDOs se reserva para
   fenómenos que *no* tienen forma cerrada simple o cuyo comportamiento depende de realimentación
   con otras variables de estado (como el arco, donde `g` depende de la propia potencia disipada,
   que depende de `g`) — el offset DC no cae en ese caso, así que usar RK4 ahí sería una
   sofisticación innecesaria que además introduce error numérico donde no había ninguno. Regla
   general útil para el resto del proyecto: **si el fenómeno tiene solución analítica cerrada
   conocida y no interactúa dinámicamente con otras EDOs del sistema, resolver analíticamente;
   integrar numéricamente solo cuando hay acoplamiento o no linealidad que lo exige** (arco, y
   potencialmente la curva de saturación del núcleo en inrush si se modela con detalle).
3. **Control de velocidad de simulación como slider de `timeScale` (§4), no como hack visual**: la
   mecánica "el usuario ve el arco extinguiéndose en el cruce por cero" (IDEA.md §7) requiere
   expandir microsegundos reales a un ritmo observable. Implementar esto como `timeScale < 1`
   real (más tiempo real por unidad de tiempo simulado) en el punto donde `frameTime * timeScale`
   alimenta el acumulador — nunca cambiando el `DT` de integración del arco ni "trucando" la curva
   de conductancia para que dure más de lo físicamente correcto. Así el usuario en verdad observa,
   en cámara lenta, la misma EDO que se ejecutaría en tiempo real — coherente con el principio ya
   establecido en IDEA.md §1 de "fidelidad de mecanismo > fidelidad de resultado".

## Fuentes

- Fiedler, Glenn, *Fix Your Timestep!*, Gaffer On Games. https://gafferongames.com/post/fix_your_timestep/
- Fiedler, Glenn, *Integration Basics*, Gaffer On Games. https://gafferongames.com/post/integration_basics/
- Nystrom, Robert, *Game Loop*, Game Programming Patterns. https://gameprogrammingpatterns.com/game-loop.html
- Wikipedia, *Semi-implicit Euler method*. https://en.wikipedia.org/wiki/Semi-implicit_Euler_method
- Wikipedia, *Stiff equation*. https://en.wikipedia.org/wiki/Stiff_equation
- HandWiki, *Stiff equation*. https://handwiki.org/wiki/Stiff_equation
- MathWorks, *Stiff Differential Equations*. https://www.mathworks.com/company/technical-articles/stiff-differential-equations.html
- Unity Technologies, *Manual: Fixed updates*. https://docs.unity3d.com/6000.1/Documentation/Manual/fixed-updates.html
- Unity Technologies, *Manual: Time and frame rate management*. https://docs.unity3d.com/2022.3/Documentation/Manual/TimeFrameManagement.html
- Kehom's Forge, *`_process()` and `_physics_process()` in Godot*. https://kehomsforge.com/tutorials/single/process-physics-process-godot/
- Godot Engine, *Fixing physics timestep vs refresh rate problems (jitter)*, godot-proposals #1936. https://github.com/godotengine/godot-proposals/issues/1936
- lawnjelly, *Fixed timestep interpolation addon for Godot*. https://github.com/lawnjelly/smoothing-addon
- MDN Web Docs, *Window: requestAnimationFrame() method*. https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
- IEEE Transactions, *Circuit breaker model for digital simulation based on Mayr's and Cassie's differential arc equations*. https://ieeexplore.ieee.org/document/400910/
- ResearchGate, *An Improved Arc Model Before Current Zero Based on the Combined Mayr and Cassie Arc Models*. https://www.researchgate.net/publication/3274972_An_Improved_Arc_Model_Before_Current_Zero_Based_on_the_Combined_Mayr_and_Cassie_Arc_Models
- Frontiers in Energy Research, *Parameter Determination Method of Cassie-Mayr Hybrid Arc Model Based on Magnetohydrodynamics Plasma Theory*. https://www.frontiersin.org/journals/energy-research/articles/10.3389/fenrg.2022.808289/full
