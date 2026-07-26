# Análisis de cortocircuito y flujo de carga en sistemas de potencia — per-unit y componentes simétricas

> Investigación de soporte para el simulador 3D de subestaciones (ver `IDEA.md`, sección 4:
> "Estudios de ingeniería"). Cubre el andamiaje matemático detrás de los dos estudios que
> dimensionan casi todo lo demás en una subestación: **flujo de carga** (operación normal) y
> **cortocircuito** (condición de falla).

---

## 1. El sistema por unidad (per-unit, pu)

### 1.1 Por qué existe

Una subestación real conecta equipos con tensiones nominales completamente distintas: un
generador a 13.8 kV, un transformador elevador 13.8/230 kV, una línea de transmisión a 230 kV, y
transformadores de distribución que bajan a 34.5 kV o 13.2 kV. Si se trabajara con ohmios,
amperios y voltios "absolutos", cada vez que una impedancia cruza un transformador habría que
referirla al lado contrario multiplicando por el cuadrado de la relación de transformación
(`Z' = Z · (N1/N2)²`) — un proceso propenso a errores cuando hay varios transformadores en
cascada.

El sistema por unidad resuelve esto expresando **todas** las magnitudes (tensión, corriente,
impedancia, potencia) como una fracción adimensional de un valor de referencia ("base") común a
todo el sistema. La ventaja central, documentada en el capítulo introductorio de Grainger &
Stevenson *Power System Analysis* y en Glover/Sarma/Overbye *Power System Analysis and Design*,
es que **la impedancia en por unidad de un transformador es la misma vista desde cualquiera de
sus dos lados**, siempre que las tensiones base a ambos lados se elijan con la misma relación
que la relación de transformación nominal del equipo. Esto permite dibujar el circuito
equivalente de todo un sistema de potencia con múltiples niveles de tensión como una sola red
sin transformadores ideales explícitos.

Beneficios adicionales bien documentados en la literatura:

- **Comparabilidad entre equipos de tamaños distintos**: un transformador de 10 MVA y otro de
  500 MVA pueden tener impedancias óhmicas radicalmente distintas, pero típicamente ambos caen
  en el rango de 6–14% en por unidad — el valor pu es un indicador de diseño normalizado,
  independiente de la potencia nominal del equipo (de ahí que las placas de transformadores
  siempre indiquen "%Z", que es la impedancia en pu multiplicada por 100).
- **Estabilidad numérica**: en cálculos con computador (flujo de carga, cortocircuito), trabajar
  con valores cercanos a 1.0 en vez de magnitudes que van de fracciones de ohm a cientos de kV
  reduce error de redondeo.
- **Eliminación del factor √3**: al definir bases trifásicas de forma consistente, las
  ecuaciones de potencia trifásica se simplifican a la misma forma que las monofásicas.

### 1.2 Definición de las bases

Se eligen **dos** cantidades base independientes por zona de tensión del sistema — típicamente
`S_base` (potencia aparente trifásica, un valor común a todo el sistema, ej. 100 MVA) y `V_base`
(tensión línea-línea nominal de esa zona). Las otras dos bases se derivan:

```
S_base   [MVA] — elegida arbitrariamente (valor redondo común a todo el sistema)
V_base   [kV]  — tensión nominal línea-línea de cada zona de tensión
I_base   [A]   = S_base / (√3 · V_base)
Z_base   [Ω]   = V_base² / S_base   =  V_base / (√3 · I_base)
```

Cualquier magnitud real se convierte a pu dividiéndola por su base correspondiente:

```
V_pu = V_real / V_base
I_pu = I_real / I_base
Z_pu = Z_real / Z_base
```

Cuando una impedancia está dada en pu sobre una base distinta a la del estudio (por ejemplo, la
%Z de placa de un transformador suele estar referida a su propia potencia nominal, no a la
`S_base` del sistema), se convierte con:

```
Z_pu(nueva base) = Z_pu(base propia) · (S_base_nueva / S_base_propia) · (V_base_propia / V_base_nueva)²
```

### 1.3 Ejemplo numérico

Transformador trifásico de subestación: **100 MVA, 230/13.8 kV, %Z = 10%** (placa, valor típico
dentro del rango 8–14% mencionado en `IDEA.md` §3.1).

Con `S_base = 100 MVA` (la misma potencia nominal del equipo, caso trivial):

**Lado de alta (230 kV):**
```
Z_base,AT = 230² / 100 = 529 Ω
I_base,AT = 100e6 / (√3 · 230e3) = 251 A
Z_real,AT = 0.10 · 529 Ω = 52.9 Ω   (impedancia de cortocircuito vista desde 230 kV)
```

**Lado de baja (13.8 kV):**
```
Z_base,BT = 13.8² / 100 = 1.904 Ω
I_base,BT = 100e6 / (√3 · 13.8e3) = 4184 A
Z_real,BT = 0.10 · 1.904 Ω = 0.1904 Ω
```

Nótese que `Z_real,AT / Z_real,BT = 52.9 / 0.1904 ≈ 278 ≈ (230/13.8)²` — la relación óhmica real
escala con el cuadrado de la relación de transformación, tal como predice la teoría de
transformadores. Pero en **por unidad, el valor es idéntico en ambos lados: 0.10 pu**. Esa
invarianza es exactamente la propiedad que permite dibujar el sistema completo (generador, líneas
de distintos niveles de tensión, transformadores) como un único circuito de impedancias en serie
sin preocuparse de en qué "lado" del transformador está cada una.

---

## 2. Flujo de carga (load flow / power flow)

### 2.1 Qué problema resuelve

El estudio de flujo de carga responde una pregunta muy concreta: **dado el patrón de generación y
demanda en estado estable (régimen permanente, sin fallas), ¿cuáles son la magnitud de tensión y
el ángulo de fase en cada nodo (barra) del sistema?** A partir de esas tensiones y ángulos se
derivan todos los flujos de potencia activa y reactiva por cada línea/transformador, y las
pérdidas totales — es el estudio base para verificar que ningún equipo queda sobrecargado y que
las tensiones se mantienen dentro de límites operativos (normalmente ±5% del valor nominal).

Cada barra del sistema se clasifica en uno de tres tipos según qué variables se conocen y cuáles
son incógnitas:

| Tipo de barra | Conocido | Incógnita |
|---|---|---|
| Slack / referencia | \|V\|, ángulo θ (fijado en 0°) | P, Q inyectadas |
| PV (generación) | P inyectada, \|V\| | Q inyectada, ángulo θ |
| PQ (carga) | P, Q consumidas | \|V\|, ángulo θ |

### 2.2 Ecuaciones de balance de potencia nodal

En cada barra *i* la potencia activa inyectada debe igualar la suma de flujos que salen hacia las
barras vecinas *k*, en función de la matriz de admitancias nodal `Y = G + jB` del sistema:

```
P_i = Σ_k |V_i||V_k| (G_ik cos θ_ik + B_ik sin θ_ik)
Q_i = Σ_k |V_i||V_k| (G_ik sin θ_ik − B_ik cos θ_ik)
```

donde `θ_ik = θ_i − θ_k`. Estas son las ecuaciones que debe satisfacer simultáneamente cada barra
del sistema.

### 2.3 Por qué es un problema no lineal — y cómo se resuelve

Las ecuaciones anteriores mezclan **productos** de magnitudes de tensión desconocidas
(`|V_i|·|V_k|`) con **funciones trigonométricas** de ángulos desconocidos (`sin θ_ik`,
`cos θ_ik`). Esa combinación de no linealidades impide resolver el sistema con álgebra lineal
directa (no existe una matriz única que despeje V y θ en un solo paso), a diferencia, por
ejemplo, de un circuito puramente resistivo.

El método estándar de la industria para resolver esto es **Newton-Raphson**: en vez de resolver
las ecuaciones no lineales de una vez, se parte de una estimación inicial de tensiones y ángulos
(normalmente "arranque plano": todas las tensiones en 1.0 pu, todos los ángulos en 0°), se
**linealiza** el sistema alrededor de esa estimación (usando la matriz Jacobiana, que captura
cómo cambia cada P y Q inyectada ante pequeños cambios en cada V y θ), se resuelve ese sistema
lineal para obtener una corrección, se actualiza la estimación, y se repite hasta que el error de
potencia en cada barra cae por debajo de una tolerancia. Newton-Raphson domina en la práctica
industrial (frente a alternativas como Gauss-Seidel) porque tiene **convergencia cuadrática**: el
número de iteraciones necesario crece muy poco incluso en sistemas de miles de barras, típicamente
2–5 iteraciones. No hace falta derivar el álgebra completa de la Jacobiana para entender el punto
conceptual: es un método iterativo de aproximaciones sucesivas, no una fórmula cerrada.

---

## 3. Análisis de cortocircuito: componente simétrica y componente DC asimétrica

### 3.1 Origen físico de la asimetría

Un sistema de potencia es fundamentalmente inductivo (generadores, transformadores y líneas
tienen reactancia X mucho mayor que resistencia R). En un circuito RL, la corriente **no puede
cambiar instantáneamente** porque eso implicaría una derivada infinita del flujo magnético
almacenado en la inductancia. Cuando ocurre una falla, la corriente debe pasar abruptamente de un
valor de prefalla (normalmente pequeño) a la corriente de cortocircuito — y la única forma de
que la ecuación diferencial del circuito se satisfaga sin discontinuidad es que aparezca un
**término transitorio de corriente continua (DC offset)** que se suma a la componente senoidal
de estado estable (la componente simétrica).

La corriente total de falla toma la forma:

```
i(t) = √2 · I_sym · sin(ωt + α − φ)     ← componente AC simétrica (RMS de estado estable)
      + I_dc(0) · e^(−t/τ)              ← componente DC, decae exponencialmente
```

con constante de tiempo `τ = X/(ωR) = (X/R)/(2πf)`. La magnitud inicial del offset DC depende del
**punto de la onda de tensión** en el instante en que ocurre la falla (ángulo de incidencia α): en
el peor caso — falla justo en el cruce por cero de la tensión — el offset DC inicial es máximo y
prácticamente igual en magnitud al pico de la componente AC, lo que produce el caso conocido como
"totalmente asimétrico" (fully offset fault).

### 3.2 Por qué el X/R importa: decaimiento y factor de asimetría

Cuanto **mayor** es la relación X/R del sistema en el punto de falla (típico cerca de generadores
grandes y transformadores de subestación: X/R en el rango de 15–50), **más lento** decae el
offset DC, porque τ es proporcional a X/R. Esto significa que, en sistemas con X/R alto, la
corriente asimétrica se mantiene elevada durante varios ciclos antes de converger al valor
simétrico puro.

El **pico de corriente en el primer medio ciclo** (el instante de mayor esfuerzo mecánico y
térmico sobre el equipo) puede llegar, en el límite teórico de una falla totalmente asimétrica en
un circuito puramente reactivo, hasta **2√2 ≈ 2.83 veces** el valor RMS simétrico. En la práctica
normativa (IEC 62271-100, IEEE C37.010) se usa un **factor de pico normalizado de 2.7** para
corrientes de cortocircuito nominales superiores a 50 kA (valores algo menores, 2.5–2.6, se usan
para niveles de falla más bajos, reflejando X/R típicamente menores en esas ubicaciones). Este
factor de 2.7 es exactamente el que determina la **corriente pico de cierre** que un interruptor
debe soportar mecánicamente sin dañar sus contactos.

### 3.3 Por qué esto importa para el dimensionamiento de interruptores

Un interruptor de potencia enfrenta la corriente de falla en **dos momentos distintos** con
requisitos distintos:

- **Corriente de cierre (making current)**: si el interruptor cierra sobre una falla ya existente
  (por ejemplo, al reenergizar una línea con una falla no despejada), debe soportar el **pico**
  totalmente asimétrico sin soldarse ni deformar sus contactos — de ahí que la norma exprese este
  requisito como corriente de **cresta** (kA pico), usando el factor 2.7 mencionado.
- **Corriente de interrupción (breaking/interrupting current)**: cuando el interruptor abre tras
  detectar la falla (tras el tiempo de operación del relé + el tiempo de apertura mecánica del
  interruptor, típicamente 2–5 ciclos según `IDEA.md` §3.2), el offset DC ya ha decaído
  parcialmente. La norma IEEE C37.010 provee curvas de "factor multiplicador" que, en función del
  X/R real del sistema y del tiempo de separación de contactos, convierten la corriente simétrica
  calculada en la corriente asimétrica real que el interruptor debe ser capaz de interrumpir. Si
  el X/R real del sistema excede el X/R de referencia con el que fue calificado el interruptor
  (típicamente 15–17), su capacidad de interrupción debe *derratearse*.

En otras palabras: el estudio de cortocircuito no entrega un solo número de kA, sino (al menos)
dos — pico asimétrico para cierre/withstand mecánico, y corriente asimétrica de interrupción en
el instante de apertura de contactos — y ambos dependen críticamente del X/R del sistema, no solo
de la magnitud de la corriente simétrica.

---

## 4. Componentes simétricas (método de Fortescue)

### 4.1 La idea central

En 1918, Charles L. Fortescue demostró que **cualquier conjunto de n fasores desbalanceados**
puede descomponerse en n conjuntos de fasores balanceados, llamados componentes simétricas. Para
un sistema trifásico, esto da tres redes:

- **Secuencia positiva**: fasores balanceados con la misma secuencia de fases que el sistema
  normal (a-b-c), separados 120°. Es la única secuencia presente en operación normal balanceada.
- **Secuencia negativa**: fasores balanceados pero con secuencia de fases invertida (a-c-b).
  Aparece cuando hay desbalance (por ejemplo, una falla que no involucra las tres fases por
  igual).
- **Secuencia cero**: tres fasores de igual magnitud **en fase** entre sí (sin desplazamiento de
  120°). Aparece específicamente cuando hay una componente de corriente que debe retornar por un
  camino común a las tres fases — típicamente tierra o neutro.

### 4.2 Por qué esto es útil

Una falla desbalanceada (por ejemplo, una fase que toca tierra) convierte el sistema trifásico
real en un problema donde las tres fases ya **no** tienen el mismo comportamiento — lo cual
impide analizarlo con un circuito monofásico equivalente simple, como sí se puede hacer en
condiciones balanceadas. La transformación de Fortescue resuelve esto: **cada una de las tres
redes de secuencia (positiva, negativa, cero) es balanceada por construcción**, y por lo tanto
cada una se puede representar y resolver como un circuito monofásico equivalente independiente
(con su propia impedancia de secuencia positiva Z1, negativa Z2 y cero Z0 del generador,
transformador y línea). El tipo específico de falla determina cómo se **interconectan** esas tres
redes (en serie, en paralelo, etc.) en el punto de falla; una vez resuelto ese circuito
interconectado, se aplica la transformación inversa para recuperar las corrientes y tensiones
reales de fase a, b, c. Esto convierte un problema trifásico desbalanceado — matemáticamente
mucho más costoso de resolver directamente — en tres problemas monofásicos balanceados y
acoplados solo en el punto de falla.

### 4.3 Por qué la secuencia cero necesita tierra/neutro

Por definición, la secuencia cero implica que las tres fases llevan corriente **en fase**, es
decir, simultáneamente en la misma dirección instantánea. En un sistema trifásico sin conexión a
tierra, la suma de las tres corrientes de fase en cualquier nodo debe ser cero (ley de corrientes
de Kirchhoff sin camino de retorno), lo cual es incompatible con una componente de secuencia cero
distinta de cero. Por eso **la corriente de secuencia cero solo puede existir si existe una
trayectoria de retorno física** — el neutro de un transformador conectado en estrella con
puesta a tierra, o el propio terreno actuando como conductor de retorno. Esta es la razón directa
por la que el diseño de puesta a tierra (`IDEA.md` §3.8, malla de tierra según IEEE Std 80) está
matemáticamente ligado a la secuencia cero: la corriente de falla a tierra que eleva el potencial
del suelo (Ground Potential Rise) es, en esencia, `3·I0` (tres veces la corriente de secuencia
cero) circulando por esa trayectoria de retorno.

---

## 5. Tipos de falla y severidad relativa

| Tipo de falla | Frecuencia relativa típica* | Severidad (magnitud de corriente) | Redes de secuencia involucradas |
|---|---|---|---|
| Trifásica (LLL / LLLG) | ~5% | **La más severa** — sistema permanece balanceado, impedancia total mínima | Solo secuencia positiva |
| Bifásica (línea-línea, LL) | ~15% | Media-alta | Positiva y negativa |
| Bifásica a tierra (LLG) | ~10% | Alta (mayor que LL) | Positiva, negativa y cero |
| Monofásica a tierra (SLG / línea-tierra) | **~70–80%** | La menor en magnitud, pero la más frecuente | Positiva, negativa y cero (en serie) |

*Cifras de orden de magnitud reportadas de forma consistente en literatura de ingeniería de
protecciones para líneas aéreas; varían según geografía, nivel de tensión y exposición a
descargas atmosféricas/contaminación, por lo que deben tratarse como valores típicos, no
absolutos.

La falla trifásica es, contraintuitivamente, la **más rara mientras es la más severa**: requiere
que las tres fases entren en contacto simultáneamente (o casi), algo estadísticamente poco
probable en una línea aérea expuesta a causas típicas de falla (descargas atmosféricas, contacto
de un objeto o animal con una sola fase, contaminación en aisladores). Por eso el estudio de
cortocircuito trifásico se usa como **base de diseño** para dimensionar la capacidad de
interrupción de los interruptores (peor caso de magnitud), mientras que la falla monofásica a
tierra es el escenario dominante para el **ajuste de protecciones de sobrecorriente de tierra**
y para el diseño de la malla de puesta a tierra, precisamente por ser la más frecuente en la
práctica.

---

## 6. Cómo el estudio de cortocircuito alimenta otras disciplinas del proyecto

El resultado numérico de un estudio de cortocircuito no es un fin en sí mismo — es un **insumo**
directo para varias decisiones de ingeniería ya cubiertas en `IDEA.md`:

- **Dimensionamiento de interruptores (§3.2)**: la corriente de interrupción simétrica calculada
  (en kA RMS) más el factor de asimetría (X/R del sistema) determinan la corriente de
  interrupción nominal requerida del interruptor, y el pico asimétrico (factor ~2.7) determina su
  corriente de cierre/withstand nominal (kA pico).
- **Ajuste de relés de sobrecorriente (§4, "coordinación de protecciones")**: los relés se
  calibran usando las corrientes de falla mínima y máxima calculadas en cada punto del sistema —
  típicamente la corriente de falla trifásica define el límite superior de alcance, y la corriente
  de falla monofásica a tierra mínima (la más débil, en el extremo lejano de una línea) define si
  el relé tiene suficiente sensibilidad para detectarla.
- **Diseño de la malla de tierra (§3.8, IEEE Std 80)**: la corriente de falla a tierra de diseño
  (derivada de `3·I0`, la corriente de secuencia cero en el punto de falla, corregida por el
  factor de división de corriente Sf entre la malla y otros caminos de retorno como cables de
  guarda, y por el factor de decremento Df que contempla el offset DC durante el tiempo de
  despeje) es exactamente la variable que entra en las fórmulas de tensión de paso y de contacto
  ya documentadas en `IDEA.md`.

En este sentido, el estudio de cortocircuito es el "nodo central" que conecta casi todos los
estudios de ingeniería listados en la tabla de la sección 4 de `IDEA.md`.

---

## 7. Puntos clave para la simulación educativa

**Visualizar simétrico vs. asimétrico en un osciloscopio simulado.** No hace falta mostrar la
ecuación diferencial ni la Jacobiana: basta con un gráfico de corriente vs. tiempo (unos 5–8
ciclos) donde:
- Se dibuja primero la onda puramente senoidal (componente simétrica, envolvente constante).
- Se superpone la envolvente DC decayendo exponencialmente, mostrando cómo la onda total está
  "montada" asimétricamente sobre el eje horizontal en los primeros ciclos y se va centrando a
  medida que el offset decae.
- Un slider de "X/R del sistema" (ej. de 5 a 40) debería estirar o comprimir visualmente el
  tiempo que tarda en decaer el offset — X/R alto = decaimiento lento = asimetría visible durante
  más ciclos. Esto conecta directamente con la intuición de "por qué el primer ciclo es peor".
- Marcar visualmente el instante de "apertura de contactos del interruptor" (2–5 ciclos después
  del inicio de la falla) mostrando que ese es el momento cuya corriente asimétrica define la
  capacidad de interrupción requerida — mientras que el pico del primer medio ciclo define la
  capacidad de cierre/withstand.

**Per-unit con ejemplo interactivo simple.** Una buena forma de hacerlo tangible sin overhead
matemático: mostrar dos transformadores de tamaños muy distintos (ej. uno de 10 MVA y otro de 100
MVA, ambos con %Z = 10% de placa) conectados a la misma línea. El usuario ajusta la carga y ve
**dos paneles en paralelo**: uno mostrando los valores absolutos (ohmios, amperios — números que
cambian drásticamente entre los dos transformadores) y otro mostrando los mismos valores
convertidos a por unidad (donde ambos transformadores caen en el mismo rango 0–1 pu). El punto
pedagógico es visual e inmediato: "el mismo diseño de transformador, sin importar su tamaño,
tiene una 'firma' en por unidad parecida" — y quizás un pequeño control deslizante que cambia la
`S_base` elegida, mostrando en vivo cómo los valores pu se reescalan (mientras los valores
absolutos, obviamente, no cambian), para reforzar que la base es una elección arbitraria del
analista, no una propiedad física del equipo.

---

## Fuentes

- [Per-unit system — Wikipedia](https://en.wikipedia.org/wiki/Per-unit_system) — definiciones de
  bases y ejemplo numérico de conversión.
- Grainger, J.J. & Stevenson, W.D., *Power System Analysis*, McGraw-Hill — referencia estándar
  para el sistema por unidad y componentes simétricas (texto de referencia, no consultado vía
  URL en esta sesión pero ampliamente citado como fuente primaria por el resto de fuentes
  listadas).
- Glover, J.D., Sarma, M.S. & Overbye, T.J., *Power System Analysis and Design*, Cengage —
  referencia estándar para flujo de carga y análisis de cortocircuito.
- [ESE 470 – Energy Distribution Systems, Section 5: Power Flow — Oregon State University](https://web.engr.oregonstate.edu/~webbky/ESE470_files/Section%205%20Power%20Flow.pdf) —
  ecuaciones de balance de potencia nodal y justificación de Newton-Raphson.
- [Circuit Breaker Ratings — A Primer for Protection Engineers, B. Kasztenny (SEL)](https://selinc.com/api/download/122619/) —
  relación entre X/R, offset DC y ratings de interruptores según IEEE C37.010.
- [Asymmetrical vs Symmetrical Fault Currents: CB Sizing Guide — Industrial Monitor Direct](https://industrialmonitordirect.com/blogs/knowledgebase/asymmetrical-vs-symmetrical-fault-current-circuit-breaker-sizing) —
  fórmula de constante de tiempo τ, factores de asimetría por rango de X/R, fórmula de derrateo.
- [Symmetrical Components — Allumiax](https://www.allumiax.com/blog/symmetrical-components) —
  teorema de Fortescue y aplicación a análisis de fallas desbalanceadas.
- [Short Circuit Current Calculations Using Symmetrical Components — PDHonline](https://pdhonline.com/courses/e251/e251_new.htm) —
  curso técnico con desarrollo de redes de secuencia para distintos tipos de falla.
- IEC 62271-100 — *High-voltage switchgear and controlgear: Alternating-current circuit-breakers*
  — norma de referencia para el factor de pico 2.7 en corrientes de cortocircuito nominales
  superiores a 50 kA.
- IEEE Std C37.010 — *Application Guide for AC High-Voltage Circuit Breakers Rated on a
  Symmetrical Current Basis* — curvas de factor multiplicador para conversión simétrica →
  asimétrica según X/R y tiempo de separación de contactos.
- IEEE Std 80 — *IEEE Guide for Safety in AC Substation Grounding* — ya referenciada en
  `IDEA.md` §3.8/§6; se conecta aquí vía la corriente de falla a tierra de diseño (`3·I0`) y el
  factor de decremento Df.
