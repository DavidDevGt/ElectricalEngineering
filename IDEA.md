# IDEA.md — Simulador Educativo 3D de Subestaciones de Alta Tensión

> Documento núcleo del proyecto. Contiene la teoría de ingeniería eléctrica necesaria para que el
> contenido técnico de la experiencia interactiva sea correcto, y el diseño de cómo esa teoría se
> traduce en una experiencia 3D (Three.js) para aprender/reforzar conceptos.
>
> **Investigación profunda**: la carpeta [investigaciones/](investigaciones/) contiene 8
> documentos con rigor de normas IEEE/IEC, ecuaciones y fuentes primarias (transformadores de
> potencia, interruptores y arco eléctrico, coordinación de protecciones, puesta a tierra IEEE 80,
> coordinación de aislamiento, topologías y confiabilidad, transformadores de instrumento, y
> cortocircuito/per-unit). Este documento resume e integra esos hallazgos; cada sección enlaza al
> documento fuente correspondiente para el detalle completo — ver
> [investigaciones/README.md](investigaciones/README.md) para el índice.

---

## 1. Visión del proyecto

Una aplicación web (Three.js) que reconstruye una subestación de alta tensión (AT) de forma
simplificada pero **conceptualmente correcta**: cada componente 3D representa fielmente su función
real, con datos técnicos, tooltips, y modos de interacción (inspección, simulación de falla,
maniobra, quiz) para reforzar teoría de ingeniería eléctrica de potencia.

**Principio de diseño**: fidelidad conceptual > fidelidad fotorrealista. Preferimos primitivas
geométricas bien etiquetadas y con comportamiento correcto, a modelos importados bonitos pero
"mudos". Y, tras la investigación profunda: **fidelidad de mecanismo > fidelidad de resultado** —
por ejemplo, no basta con mostrar "el pararrayos recorta la sobretensión"; hay que mostrar *por
qué* (la no-linealidad V-I del ZnO) para que la interacción enseñe el principio, no solo el efecto.

---

## 2. Fundamentos teóricos

### 2.1 Por qué transmitir en alta tensión

Potencia transmitida: `P = V · I · cos(φ)` (trifásico: `P = √3 · V_LL · I · cos(φ)`).
Pérdidas en la línea: `P_perdidas = I² · R`.

Para una misma potencia P, subir la tensión V reduce la corriente I proporcionalmente, y las
pérdidas caen con el **cuadrado** de esa reducción. Por eso la transmisión de energía a larga
distancia se hace en AT/EAT (alta/extra alta tensión) y la distribución final baja a MT/BT cerca
del consumidor, vía transformadores.

### 2.2 Clasificación de niveles de tensión (IEC 60038)

| Categoría | Rango (AC) |
|---|---|
| Baja tensión (BT / LV) | ≤ 1 kV |
| Media tensión (MT / MV) | 1 kV – 35 kV |
| Alta tensión (AT / HV) | 35 kV – 230 kV |
| Extra alta tensión (EAT / EHV) | > 230 kV (tablas hasta 1200 kV) |
| Ultra alta tensión (UHV) | > 800 kV (uso informal del término) |

Existen tablas de valores normalizados preferentes (ej. 66, 132, 220, 230, 400, 500, 765 kV) que
varían según región/operador — no todos los países usan los mismos escalones.

### 2.3 Sistemas trifásicos

La transmisión y las subestaciones de potencia son casi siempre trifásicas (3 conductores + a
veces neutro/tierra). Conceptos clave a modelar: tensión fase-fase vs fase-neutro (`V_LL = √3 ·
V_LN`), conexión estrella (Y) vs delta (Δ), y el grupo de conexión de transformadores (desfase
angular, ej. Dyn11) — relevante porque un mal acoplamiento de grupos de conexión no permite
operar transformadores en paralelo (ver §3.1).

### 2.4 El sistema por unidad (per-unit) — [→ investigación 08](investigaciones/08-cortocircuito-flujo-carga-per-unit.md)

Todas las magnitudes (V, I, Z, S) se expresan como fracción de un valor base común
(`S_base`, `V_base` por zona de tensión; `Z_base = V_base²/S_base`). La propiedad central: **la
impedancia en pu de un transformador es la misma vista desde cualquiera de sus dos lados** —
permite dibujar todo un sistema multi-tensión como un único circuito de impedancias en serie sin
transformadores ideales explícitos. Ejemplo verificado: un transformador 100 MVA, 230/13.8 kV,
%Z=10% tiene `Z_real = 52.9 Ω` en el lado de 230 kV pero solo `0.19 Ω` en el de 13.8 kV — una
relación de ~278× (= (230/13.8)²) — y sin embargo **ambos son 0.10 pu**. Es la razón de fondo por
la que las placas de transformador siempre informan "%Z" en vez de ohmios.

---

## 3. Componentes de la subestación — teoría por componente

Para cada componente: **qué es**, **principio físico**, **datos cuantitativos reales**, **qué debe
poder mostrar la simulación**.

### 3.1 Transformador de potencia — [→ investigación 01](investigaciones/01-transformadores-potencia.md)

- **Principio**: ley de Faraday, `E_rms = 4.44·f·N·B_max·A_núcleo`. Circuito equivalente tipo T
  (rama de magnetización `R_c ∥ X_m` + impedancias serie `R+jX` de dispersión). Para estudios de
  sistema se usa el circuito aproximado con una sola `Z_eq` — es la impedancia que se mide en el
  ensayo de cortocircuito y se expresa como **%Z**.
- **Grupo de conexión** (IEC 60076-1, notación horaria 0–11): p. ej. **Dyn11** (delta AT, estrella
  BT con neutro, desfase +30°) suprime el 3er armónico de magnetización y permite cargas
  monofásicas desbalanceadas. Poner en paralelo transformadores con distinto grupo de conexión
  genera **corrientes circulantes** limitadas solo por las %Z de ambos, capaces de destruir
  devanados en segundos.
- **Pérdidas y eficiencia**: hierro `P_Fe` (histéresis + Foucault, ~constante con la carga) vs
  cobre `P_Cu(x) = x²·P_Cu,nominal` (crece con el cuadrado del factor de carga x). Eficiencia
  máxima cuando `x²·P_Cu = P_Fe` → `x_óptimo = √(P_Fe/P_Cu,nominal)`, típicamente 50–70% de carga
  nominal. Transformadores grandes alcanzan 99.0–99.7% de eficiencia en el punto óptimo.
- **%Z como parámetro de diseño intencional**: `I_falla ≈ I_nominal × (100/%Z)`. Valores típicos
  normativos (IEC 60076-5): 4-6% en distribución (<1 MVA), 7-11% en subestación (10-100 MVA),
  ≥10-12.5% en transmisión/EAT (>25 MVA). Subir %Z reduce la corriente de falla a costa de mayor
  caída de tensión — compromiso central de diseño.
- **Enfriamiento** (IEC 60076-2): ONAN → ONAF → OFAF → ODAF, etapas que se activan por termostato
  y aumentan la capacidad (+15% en unidades pequeñas, hasta +67% en una segunda etapa forzada en
  unidades grandes, según IEEE C57.91). La capacidad no es un número fijo: existen curvas de
  sobrecarga admisible tiempo-temperatura que sacrifican vida útil del aislamiento de forma
  controlada (regla de Montsinger: la tasa de envejecimiento se duplica cada 6-8°C de exceso
  térmico sostenido).
- **Cambiador de tomas (tap changer)**: off-load (DETC, solo desenergizado) vs on-load (OLTC).
  Mecanismo make-before-break: el *selector* preselecciona sin corriente, el *diverter switch*
  transfiere la corriente puenteando brevemente ambas tomas a través de una resistencia de
  transición (40-60 ms) para limitar la corriente circulante entre espiras — nunca hay un instante
  de circuito abierto ni de cortocircuito franco entre tomas.
- **Protección — relé diferencial 87T**: compara `I1` vs `I2` (compensadas por relación y grupo de
  conexión); dispara si `I_dif > pendiente × I_res`. Debe discriminar la **corriente de inrush**
  (8-14× nominal al energizar, por flujo residual + saturación) de una falla real: el inrush tiene
  >15-20% de 2do armónico, una falla real <5% — el relé usa esa "firma armónica" para bloquear
  disparos indebidos.
- **Otras protecciones**: relé Buchholz (detecta gas de descomposición por falla incipiente vs.
  golpe de aceite por falla severa — discrimina por *velocidad* del fenómeno), sondas de imagen
  térmica, válvula de sobrepresión. Diagnóstico no invasivo: **DGA** (análisis de gases disueltos:
  H₂→descargas parciales, C₂H₄→sobrecalentamiento, C₂H₂→arco severo, CO/CO₂→degradación del
  papel) y análisis de furanos (estima el grado de polimerización remanente del papel aislante,
  el verdadero factor de vida útil del equipo).

### 3.2 Interruptor de potencia (circuit breaker) — [→ investigación 02](investigaciones/02-interruptores-arco-electrico.md)

- **Física del arco**: al separarse los contactos bajo corriente, el punto de contacto se
  vaporiza y forma un canal de plasma (15 000–20 000 °C) que sigue conduciendo. Su resistencia es
  dinámica y no lineal (modelos de Cassie y Mayr) — el arco no se apaga por estirarse, se apaga
  porque su conductancia colapsa en el **cruce por cero de corriente** (única ventana física de
  extinción en CA, 100-120 veces/s).
- **La carrera TRV vs. recuperación dieléctrica**: tras la extinción, el sistema impone una
  **Tensión Transitoria de Recuperación (TRV)** oscilatoria (1.5–2× la tensión normal, varios
  kV/µs de tasa de subida — IEEE C37.011). Si la TRV crece más rápido que la rigidez dieléctrica
  del medio que se recupera, ocurre reencendido (restrike). Toda la ingeniería del interruptor
  (soplado de SF6, difusión en vacío) existe para ganar esa carrera.
- **Medios de extinción**: SF6 (puffer — soplado mecánico de gas electronegativo, dominante en
  AT/EAT, hasta 800 kV+); vacío (difusión ultrarrápida del vapor metálico, dominante en MT hasta
  ~38 kV); aire comprimido y aceite (históricos, obsoletos).
- **Parámetros nominales** (IEEE C37.04/06/09, IEC 62271-100): corriente de interrupción simétrica
  (kA rms); corriente asimétrica con **factor de asimetría S = √(1+2·DC%²)** (con 80% DC, S≈1.51,
  el interruptor solo dispone del 66% de su capacidad simétrica); corriente de cierre/enclavamiento
  ≈2.6-2.7× la simétrica (pico asimétrico); tiempo total de interrupción **3-5 ciclos** en AT
  moderna.
- **Seccionador vs. interruptor — enclavamiento obligatorio**: el seccionador no tiene cámara de
  extinción; abrirlo con carga sostiene un arco sin control. Enclavamiento eléctrico + llave
  cautiva (trapped-key) mecánica garantizan la secuencia: interruptor abre → seccionador abre (y
  viceversa para energizar).
- **Secuencia de disparo real (con tiempos)**: relé 0.5-1 ciclo → apertura mecánica → arqueo
  0.5-0.75 ciclo → extinción. Despeje total típico **3-4 ciclos** (50-70 ms). Este tiempo entra
  directamente en el cálculo de tensiones de paso/contacto de IEEE 80 (§3.8) vía `t_s`.
- **Autorecloser (79)**: la mayoría de fallas en líneas aéreas son transitorias; recierre
  trifásico (tiempo muerto 0.3-3 s) o monopolar (solo la fase fallada, mejor estabilidad). Tras
  fallas persistentes, bloqueo (lockout) tras 1-3 intentos.

### 3.3 Seccionador (disconnect switch)
- **Diferencia crítica con el interruptor**: el seccionador **no** tiene capacidad de interrumpir
  corriente de carga ni de falla — solo aísla eléctricamente un tramo ya sin corriente, dando una
  separación física visible (aislamiento de seguridad para trabajos de mantenimiento).
- **Regla de operación (secuencia de maniobra)**: nunca se abre un seccionador con carga. Secuencia
  correcta para desenergizar un circuito: abrir interruptor → abrir seccionadores → (si aplica)
  cerrar seccionador de puesta a tierra. Para energizar es el orden inverso. Ver §3.2 para el
  enclavamiento que hace esto físicamente imposible de violar en una subestación real.
- **Interacción educativa (fuerte candidato a quiz)**: el usuario debe ordenar correctamente la
  secuencia de maniobra; si intenta abrir un seccionador con el interruptor cerrado, la simulación
  bloquea la acción (candado/enclavamiento) y explica por qué, en vez de simplemente no modelarlo.

### 3.4 Transformadores de instrumento — [→ investigación 07](investigaciones/07-transformadores-instrumento-medicion.md)

**TC — Transformador de Corriente (CT)**
- **Principio**: transformador "de corriente impuesta" — primario en serie, `N1·I1 ≈ N2·I2 +
  N1·Ie`. Relaciones estándar: secundario 5 A (IEEE/Norteamérica) o 1 A (IEC, reduce pérdidas en
  cableado largo).
- **Peligro del secundario abierto**: si `Zb→∞`, toda la corriente primaria se convierte en
  corriente de excitación, el núcleo se satura duramente, y en cada cruce por cero el flujo se
  invierte con `dΦ/dt` enorme → picos de tensión de **cresta** (no RMS) de cientos de V a varios
  kV. Un voltímetro RMS común subestima el riesgo. Regla operativa universal: cortocircuitar el
  secundario (test block) *antes* de desconectar cualquier instrumento.
- **Clases opuestas por diseño**: medición (0.2/0.5, o FS5/FS10 — debe *saturarse pronto* para
  proteger instrumentos baratos) vs. protección (5P20, 10P20 IEC, o C100-C800 IEEE — debe mantener
  precisión hasta 20-30× In para que el relé "vea" la falla). Por eso un mismo TC físico lleva
  varios núcleos independientes, uno por función.

**TP/TT — Transformador de Potencial (VT/PT)**
- Fuente de tensión en miniatura (primario en paralelo). Un cortocircuito accidental en el
  secundario es limitado por su propia impedancia interna (no genera sobretensión, a diferencia
  del TC) pero colapsa la señal — protegido con fusibles y supervisado con esquemas de VT
  supervision (fuse-failure) que bloquean protecciones basadas en tensión ante pérdida de señal.

**CVT/CCVT (Transformador de Potencial Capacitivo)**
- Reemplaza al TP inductivo por encima de ~145 kV: divisor capacitivo de AT + reactor de
  compensación (resuena a 50/60 Hz) + transformador inductivo de baja tensión. Más barato en EAT,
  pero introduce riesgo de **ferroresonancia** (oscilación espuria por el acoplamiento no lineal
  capacitancia-inductancia saturable), mitigado con circuito de amortiguamiento. Doble uso: también
  sirve de acoplador de señales de onda portadora (PLC) para telecomunicación entre subestaciones.
- **Error de relación y de ángulo de fase**: ambos importan para facturación (`P=V·I·cos φ`) y son
  críticos en protección diferencial — TCs con distinto error de ángulo generan diferencial
  espuria y disparos intempestivos.

### 3.5 Pararrayos (surge arresters) — [→ investigación 05](investigaciones/05-coordinacion-aislamiento-sobretensiones.md)

- **Principio**: discos de ZnO sinterizado, sin explosor (a diferencia de los antiguos SiC), con
  no-linealidad extrema `I = k·V^α`, **α ≈ 25-50** (vs. α≈2-6 del SiC) — esto permite que a
  tensión de servicio la resistencia sea de cientos de MΩ, y apenas se supera la "rodilla" colapse
  varios órdenes de magnitud, conduciendo kA con subida de tensión mínima.
- **Parámetros** (IEC 60099-4/IEEE C62.11): Uc (MCOV, tensión continua máxima), Ur ≈1.25×Uc,
  Up-LI (nivel de protección a impulso de rayo, ≈3.0-3.5×Uc), Up-SI (protección a maniobra, menor
  que Up-LI), capacidad de absorción de energía (9-14 kJ/kV de Ur en clase estación).
- **Margen de coordinación**: IEC 60071-2 exige ≥20% entre BIL del equipo y Up del pararrayos.
  Debe instalarse **físicamente cerca** del equipo protegido: la distancia introduce un retardo de
  propagación (efecto de separación) que erosiona ese margen (ver §3.9 sobre ondas viajeras).
- **Interacción educativa**: mostrar el "recorte" de un impulso de rayo — sin que el pararrayos
  "absorba todo" (error didáctico común): limita la tensión a Up, no a cero, y esa onda recortada
  sigue viajando aguas abajo.

### 3.6 Aisladores
- **Función**: soportar mecánicamente conductores energizados manteniendo aislamiento eléctrico
  respecto a tierra/estructura. Tipos: soporte rígido (pin/post), cadena de suspensión, pasatapas
  (bushings) para atravesar tanques de transformador/interruptor.
- **Conceptos**: rigidez dieléctrica, distancia de fuga (creepage distance, crítica en zonas con
  contaminación/salinidad), material (porcelana, vidrio, polímero/silicona — este último más
  liviano y con mejor comportamiento hidrofóbico).
- **AIS vs. GIS**: en aire (AIS), rigidez ≈3 kV/mm; en SF6 presurizado (GIS), ≈8-9 kV/mm (2.5-3×
  superior). Resultado: una subestación GIS ocupa solo 10-25% del área de la AIS equivalente para
  el mismo nivel de tensión — justificación física, no solo estética, de por qué GIS "encoge" el
  mismo diagrama unifilar a un contenedor compacto.

### 3.7 Barras colectoras (busbars)
- Conductores (rígidos tipo tubo o flexibles tipo cable) que agrupan e interconectan los
  distintos circuitos de la subestación. Su disposición define la **configuración de barras**
  (ver §5), que determina la confiabilidad de toda la subestación.

### 3.8 Sistema de puesta a tierra (grounding grid) — [→ investigación 04](investigaciones/04-puesta-a-tierra-ieee80.md)

- **El problema (GPR)**: ante falla a tierra, `GPR = I_g · R_g` eleva el potencial de toda la
  malla respecto a tierra remota (miles a decenas de miles de voltios). El riesgo real no es el
  GPR en sí (análogo al pájaro en la línea de AT) sino los **gradientes locales** de potencial de
  superficie.
- **Fórmulas completas (IEEE 80-2013, Sverak)**, con el coeficiente de Dalziel explícito:
  ```
  E_step(50kg)  = (1000 + 6·Cs·ρs)  · 0.116/√ts
  E_touch(50kg) = (1000 + 1.5·Cs·ρs) · 0.116/√ts
  ```
  1000 Ω = resistencia interna del cuerpo (IEEE 80); `0.116/√ts` (o `0.157/√ts` para 70 kg) = 
  corriente tolerable antes de fibrilación ventricular (Dalziel); `ts` = tiempo de despeje de la
  falla (§3.2) — despejar más rápido *también* es una estrategia de seguridad, no solo diseñar
  mejor la malla.
- **Capa superficial (Cs·ρs)**: contraintuitivamente, no busca conducir bien — busca **subir** la
  resistencia de contacto del pie (grava, ρs 2000-5000 Ω·m) para **bajar** la corriente que
  atraviesa el cuerpo a igual tensión de superficie. `Cs ≈ 1 − [0.09·(1−ρ/ρs)]/(2hs+0.09)`
  (Sverak).
- **Punto pedagógico central**: IEEE 80 rechaza explícitamente "R_g baja = seguro" — exige
  verificar por separado tensión de malla `E_m` y de paso `E_s` (fórmulas de Sverak con factores
  geométricos `Km, Ks, Ki`) contra los límites tolerables en **todos** los puntos accesibles.
- **Split factor**: no toda la corriente de falla retorna por la malla — parte va por cables de
  guarda/neutros multiaterrizados. `Sf = I_g/I_f`, típicamente 0.4-0.85.
- **Tensión transferida**: un conductor metálico continuo (cerca mal segmentada, tubería) que
  conecta la malla (a potencial GPR) con un punto fuera del predio (a 0 V remoto) transmite el GPR
  *completo*, sin ningún `Cs` reductor — motivo por el que IEEE 80 exige segmentar cercas en el
  límite de propiedad.
- **Interacción educativa**: heatmap 3D del potencial de superficie ante falla simulada; avatar
  arrastrable que calcula `E_step`/`E_touch` reales en cada posición vs. el límite tolerable.

### 3.9 Cable de guarda (shield wire) y apantallamiento — [→ investigación 05](investigaciones/05-coordinacion-aislamiento-sobretensiones.md)
- Conductor(es) sin corriente de servicio, tendido por encima de las fases, que intercepta
  descargas atmosféricas directas antes de que impacten un conductor energizado.
- **Modelo electrogeométrico**: distancia de impacto `rs = 10·I^0.65` (m, I en kA de corriente de
  retorno del rayo) — define una "esfera rodante" que determina si el rayo impacta el cable de
  guarda, una fase, o el suelo. Contraintuitivamente, los rayos de **baja corriente** son los más
  peligrosos para fallas de apantallamiento (menor `rs`, se cuelan bajo el cono de protección).
- **Ondas viajeras**: una sobretensión de rayo se propaga como onda con impedancia característica
  `Z0 ≈ 350-500 Ω` (línea aérea). Un transformador visto a las frecuencias del frente de onda
  (~MHz) es esencialmente un circuito abierto (`Γ→+1`) — la onda se refleja y **duplica** la
  tensión en sus bornes. Por eso el pararrayos debe ir físicamente pegado al transformador: la
  distancia introduce un retardo que erosiona el margen de coordinación (§3.5).

### 3.10 Relés de protección e IEDs — [→ investigación 03](investigaciones/03-protecciones-electricas-coordinacion.md)

*(Componente ausente en la versión anterior de este documento — es el "cerebro" que decide cuándo
disparar los interruptores de §3.2, y merece tratamiento propio.)*

- **Filosofía**: selectividad, sensibilidad, velocidad, y confiabilidad descompuesta en
  **dependability** (opera cuando debe) vs. **security** (no opera cuando no debe) — ejes en
  tensión, no maximizables simultáneamente.
- **Zonas de protección superpuestas**: cada zona la define físicamente la ubicación de los TC/TP;
  las zonas adyacentes se solapan deliberadamente en el interruptor para que no exista "zona
  muerta" — dos protecciones pueden operar a la vez en el traslape, por diseño.
- **Sobrecorriente (50/51)**: 50 = instantánea; 51 = temporizada según curva TCC
  (`t = TDS·[A/((I/Ipickup)^p −1) + B]`, familias SI/VI/EI, IEEE C37.112/IEC 60255-151).
  Coordinación entre relés en serie con margen (CTI) típico **0.2-0.4 s**.
- **Diferencial (87)** — protección "unitaria": basada en LCK dentro de una zona definida por TC,
  no requiere coordinación temporal, opera en 1-2 ciclos. Variantes 87T (transformador, compensa
  grupo de conexión + restricción armónica de inrush), 87L (línea, requiere canal de
  comunicación), 87B (barra).
- **Distancia (21)**: mide impedancia aparente `Z=V/I` como proxy de distancia eléctrica a la
  falla. Zonas escalonadas: Zona 1 (80-85% de la línea, instantánea — nunca 100%, por margen de
  error de TC/TP), Zona 2 (115-150%, ~0.2-0.3s), Zona 3 (respaldo remoto, ~1s).
- **Código ANSI/IEEE C37.2**: lenguaje estándar de la industria — 21 distancia, 27 baja tensión,
  50/51 sobrecorriente, 59 sobretensión, 67 sobrecorriente direccional, 79 recierre, 87 diferencial.
- **IEC 61850 / GOOSE**: mensajería publicador-suscriptor sobre Ethernet entre IEDs, sustituyendo
  cableado de cobre punto a punto con tiempos de entrega de milisegundos — habilita subestaciones
  digitales.

---

## 4. Estudios de ingeniería (contexto de diseño real)

| Estudio | Qué responde |
|---|---|
| Flujo de carga (load flow) | Tensiones y ángulos en cada nodo en operación normal (Newton-Raphson, problema no lineal) |
| Cortocircuito | Corrientes de falla (simétrica + componente DC asimétrica) que deben soportar/interrumpir los equipos |
| Coordinación de aislamiento (IEC 60071) | Nivel de aislamiento (BIL/BSL) que cada equipo debe soportar sin descarga disruptiva |
| Coordinación de protecciones | Selectividad y tiempos entre relés para que solo actúe la protección más cercana a la falla |
| Malla de tierra (IEEE 80) | Seguridad de personas ante fallas a tierra |

### 4.1 Cortocircuito: simétrico vs. asimétrico — [→ investigación 08](investigaciones/08-cortocircuito-flujo-carga-per-unit.md)

Un sistema de potencia es predominantemente inductivo: la corriente no puede saltar
instantáneamente de prefalla a cortocircuito, así que aparece un **offset DC transitorio** que se
suma a la componente AC simétrica: `i(t) = √2·I_sym·sin(ωt+α−φ) + I_dc(0)·e^(−t/τ)`, con
`τ = (X/R)/(2πf)`. Cuanto mayor el X/R del sistema (típico 15-50 cerca de generadores y
transformadores), más lento decae el offset.

- **Pico de primer medio ciclo**: hasta 2√2≈2.83× el valor RMS simétrico en el límite teórico; la
  norma usa un **factor de 2.7** (IEC 62271-100/IEEE C37.010) para corrientes >50 kA — define la
  corriente de **cierre/making** que el interruptor debe soportar mecánicamente.
- **Corriente de interrupción**: distinta de la de cierre — se evalúa en el instante en que los
  contactos realmente se separan (tras relé + apertura mecánica, §3.2), cuando el offset DC ya
  decayó parcialmente; IEEE C37.010 da curvas de derrateo según X/R real vs. X/R de referencia
  (~15-17).

### 4.2 Componentes simétricas (Fortescue)

Cualquier conjunto trifásico desbalanceado (como una falla monofásica) se descompone en tres redes
balanceadas — secuencia positiva, negativa y cero — cada una resoluble como circuito monofásico
independiente. La **secuencia cero requiere físicamente una trayectoria de retorno** (neutro o
tierra): es la razón matemática exacta por la que el estudio de cortocircuito se conecta
directamente con el diseño de la malla de tierra (§3.8) — la corriente de falla a tierra de diseño
es esencialmente `3·I0`.

**Severidad relativa de fallas** (valores típicos de industria): trifásica ~5% de los casos pero
**la más severa** (solo secuencia positiva, impedancia mínima); monofásica a tierra **~70-80%** de
los casos pero la de menor magnitud. La trifásica dimensiona interruptores (peor caso); la
monofásica a tierra dimensiona protecciones de tierra y la malla (caso dominante en frecuencia).

### 4.3 Coordinación de aislamiento — niveles de referencia (IEC 60071) — [→ investigación 05](investigaciones/05-coordinacion-aislamiento-sobretensiones.md)

- **Tipos de sobretensión** clasificados por velocidad de frente (importa tanto como la amplitud):
  TOV (frecuencia industrial, ciclos-segundos, 1.2-1.8 pu), maniobra (250/2500 µs, 2-4 pu), rayo
  (1.2/50 µs, hasta decenas de pu sin protección).
- **Rango I** (1 kV < Um ≤ 245 kV): domina el BIL (rayo). **Rango II** (Um > 245 kV): domina el
  BSL (maniobra) — la sobretensión de maniobra crece con la tensión de servicio, el rayo no.
- Tabla orientativa (IEC 60071-1, selección representativa):

| Um (kV) | Rango | BSL (kV pico) | BIL (kV pico) |
|---|---|---|---|
| 72.5 | I | — | 325 / 350 |
| 145 | I | — | 550 / 650 |
| 245 | I | — | 850 / 950 / 1050 |
| 420 | II | 950 / 1050 | 1300 / 1425 |
| 550 | II | 1050 / 1175 | 1550 / 1675 |

- **Margen de coordinación** ≥20% entre BIL del equipo y Up del pararrayos (§3.5). Aislamiento
  autorregenerable (aire) se trata estadísticamente (riesgo de falla 2-10% aceptado); aislamiento
  no autorregenerable (papel-aceite) usa factor de seguridad determinístico fijo (~1.15-1.25).
- **Idea de simulación**: el usuario dispara un impulso de rayo simulado de amplitud variable y ve
  si supera el BIL del equipo, comparando contra el nivel de protección Up del pararrayos.

---

## 5. Configuraciones de barras (bus configurations) — [→ investigación 06](investigaciones/06-topologias-confiabilidad-subestaciones.md)

La variable estructural clave es el **número de interruptores por circuito** — principal impulsor
de costo (cada interruptor de AT/EAT cuesta del orden de cientos de miles a más de un millón de
USD, sin contar obra civil y protecciones).

| Topología | Interruptores/circuito | Costo relativo | Mantenimiento sin corte | Vulnerabilidad N-1 | Vulnerabilidad N-2 |
|---|---|---|---|---|---|
| Barra simple | 1 | 1× (base) | No | Alta — falla de barra tumba todo | Catastrófica |
| Principal + transferencia | 1 (+1 compartido) | ~1.1-1.2× | Solo interruptores | Alta ante falla de barra | Alta |
| Doble barra, 1 interruptor | 1 | ~1.2-1.3× | Parcial (maniobra manual) | Media | Alta |
| Anillo (ring bus) | ~1 (compartido) | ~1.3× | Sí, interruptores individuales | Baja en anillos pequeños, sube con más posiciones | Puede partir el anillo |
| Interruptor y medio | 1.5 | ~1.5× | Sí, interruptores y barras | Muy baja (ningún circuito cae por falla de barra) | Falla del interruptor central saca 2 circuitos |
| Doble barra, doble interruptor | 2 | ~2× | Sí, total | Mínima | Mínima |

- **Criterio N-1** (NERC TPL / ENTSO-E): el sistema debe seguir sirviendo toda la demanda ante la
  pérdida de **cualquier elemento único** — en barra simple, la barra misma viola N-1 para todos
  sus circuitos a la vez; por eso subestaciones críticas de EAT casi siempre usan
  interruptor-y-medio o superior.
- **Regla de buena práctica en anillo**: no terminar fuentes redundantes en posiciones adyacentes
  del anillo — una sola falla de interruptor no debe dejar sin ambas fuentes.
- **Caso real — apagón Suecia/Dinamarca, 23-sep-2003**: una contingencia N-1 normal (pérdida de
  1200 MW de generación nuclear) fue absorbida por la reserva rodante, pero una **falla de doble
  barra** minutos después anuló la redundancia de esa topología (afectó ambas barras a la vez,
  comportándose como barra simple en ese nodo) y encadenó un colapso regional — lección: la
  redundancia de una topología solo vale si el modo de falla realmente respeta la independencia
  entre sus elementos redundantes.

**Idea de simulación — "modo diseñador"**: modelar la subestación como un **grafo** (barras/
circuitos = nodos, interruptores/seccionadores = aristas con estado). Al fallar un elemento, se
recalculan componentes conexos para listar qué circuitos quedaron sin trayectoria a fuente —
permite comparar la misma falla aplicada a las 6 topologías lado a lado, convirtiendo la tabla
anterior en una demostración interactiva.

---

## 6. Normas de referencia (para mantener el contenido técnico correcto)

- **IEC 60038** — Niveles de tensión normalizados.
- **IEC 60071-1/2** — Coordinación de aislamiento (BIL, BSL).
- **IEC 60099-4 / IEEE C62.11** — Pararrayos de óxido metálico (ZnO).
- **IEEE Std 80** — Guía de seguridad en puesta a tierra de subestaciones AC (tensiones de paso y
  contacto), con IEEE Std 81 (medición de resistividad de suelo).
- **IEEE C37 series** — Interruptores de potencia (C37.04/06/09/011 TRV) y protección (C37.2
  números de dispositivo, C37.112 curvas TCC, C37.010 aplicación de interrupción).
- **IEC 62271-100** — Interruptores de AT (equivalente IEC de la serie C37).
- **IEEE C57 series** — Transformadores de potencia (C57.12.00 general, C57.91 guía de carga,
  C57.13 transformadores de instrumento).
- **IEC 61869** — Transformadores de instrumento (TC/TP/CVT).
- **IEEE Std 1243 / modelo electrogeométrico** — Apantallamiento contra descargas atmosféricas.
- **IEC 61850** — Comunicación y automatización de subestaciones digitales (GOOSE).
- **IEEE Std 493 ("Gold Book")** — Tasas de falla y MTTR para estudios de confiabilidad.

> Nota: los valores numéricos de este documento (y de la carpeta `investigaciones/`) son órdenes
> de magnitud representativos con fines pedagógicos, extraídos de fuentes técnicas citadas en cada
> investigación. Antes de mostrarlos como "valor de norma" exacto en la UI, contrastar contra la
> tabla oficial de la edición vigente del estándar correspondiente.

---

## 7. Diseño pedagógico — de la teoría a la interacción 3D

Principio: **cada pieza de teoría de las secciones 2–5 debe mapear a una interacción concreta**, y
tras la investigación profunda, a un **mecanismo físico real**, no solo a una etiqueta de texto.

| Concepto teórico | Componente 3D | Interacción |
|---|---|---|
| P = V·I, pérdidas ∝ I² | Línea de transmisión | Slider de tensión, ver corriente/pérdidas recalculadas en vivo |
| Per-unit — invarianza entre lados de un transformador | Transformador | Dos transformadores de distinto tamaño (10/100 MVA), mismo %Z; paneles paralelos en ohmios vs. pu |
| Curva de eficiencia (P_Fe const. vs P_Cu∝x²) | Transformador | Slider de carga 0-120%, graficar η(x) y marcar el óptimo |
| Corriente de inrush + discriminación 2do armónico | Transformador (87T) | "Cerrar interruptor" → osciloscopio con pico 8-14× asimétrico y trazo de contenido armónico cayendo bajo el umbral |
| Cambiador de tomas make-before-break | Transformador (OLTC) | Animación paso a paso: selector preselecciona → diverter puentea con resistencia → completa transferencia, sin corte |
| Arco extinguiéndose en el cruce por cero | Interruptor | Arco (shader de plasma) sincronizado 1:1 con osciloscopio de corriente; desaparece exactamente en sin(ωt)=0 |
| Carrera TRV vs. rigidez dieléctrica | Interruptor | Dos curvas animadas tras la extinción; si TRV "gana", disparar animación de restrike |
| Secuencia de maniobra segura + enclavamiento | Seccionador + interruptor | Bloqueo visual (candado) si se intenta abrir seccionador con carga; explica la regla en vez de solo prohibir |
| TC en circuito abierto = picos de tensión de cresta | TC | Botón "abrir secundario con carga" → flujo de núcleo saturándose + pulsos de tensión (no sinusoide amplificada) |
| Clase de medición vs. protección del TC | TC | Gráfica error vs. corriente: curva de medición se satura ~2-5× In, curva de protección se mantine hasta el ALF (20-30×) |
| Pararrayos: no-linealidad ZnO recorta sin absorber todo | Pararrayos | Impulso de rayo simulado "recortado" a Up (no a cero); comparar contra BIL del transformador con barra de referencia |
| Onda viajera + reflexión en transformador (circuito abierto) | Pararrayos + transformador | Mover el pararrayos lejos del transformador → la onda reflejada se suma y supera el BIL (efecto de separación) |
| Tensión de paso/contacto (Dalziel + Sverak) | Malla de tierra | Heatmap 3D de potencial de superficie; avatar arrastrable que calcula E_step/E_touch reales vs. tolerable |
| Capa de grava sube el umbral tolerable | Malla de tierra | Toggle "capa de grava" que sube instantáneamente Cs·ρs y por tanto el límite tolerable, visible en el heatmap |
| Confiabilidad de topología (grafo + componentes conexos) | Configuración de barras | Modo comparación: misma falla, 6 topologías, cuántos circuitos caen en cada una |
| Zonas de protección superpuestas | Relés + TC/TP | Volúmenes translúcidos delimitados por la posición real de los TC; traslape visible en el interruptor |
| Curva TCC y margen de coordinación (CTI) | Relés (50/51) | Panel log-log interactivo: familia SI/VI/EI, TDS, franja de margen entre dos relés en serie |
| Secuencia falla→detección→disparo selectivo | Relés + interruptores | Línea de tiempo tipo Gantt con tiempos reales (relé 0.5-1 ciclo, arqueo 0.5-0.75 ciclo); respaldo NO disparando en paralelo |
| Simétrico vs. asimétrico, decaimiento por X/R | Osciloscopio de falla | Slider de X/R (5-40) que estira/comprime visualmente el tiempo de decaimiento del offset DC |

### Niveles de progresión sugeridos
1. **Modo inspección**: recorrer la subestación, click en cada componente → ficha técnica + rol.
2. **Modo maniobra**: ejecutar secuencias de apertura/cierre siguiendo protocolo, con feedback de
   error (enclavamientos reales, §3.2/§3.3).
3. **Modo falla**: inyectar fallas (cortocircuito, rayo, sobretensión, falla a tierra) y observar
   la respuesta completa del sistema de protección (TC/TP → relé → interruptor → arco → despeje).
4. **Modo diseño**: armar una topología de barras (grafo) y evaluar su confiabilidad ante fallas
   simuladas; opcionalmente diseñar la malla de tierra ajustando ρ, espaciamiento y capa de grava.
5. **Quiz/evaluación**: preguntas ancladas a componentes específicos de la escena 3D, incluyendo
   secuencias de maniobra y lectura de curvas (TCC, eficiencia, error de TC).

---

## 8. Arquitectura técnica (propuesta)

- **Stack**: Vite + Three.js (vanilla o con React Three Fiber si se prefiere estado declarativo
  para paneles UI). TypeScript recomendado para modelar bien las entidades eléctricas (evita
  bugs de "unidades mezcladas").
- **Modelos 3D**: primitivas procedurales (BoxGeometry, CylinderGeometry, TorusGeometry para
  cadenas de aisladores) agrupadas en `THREE.Group` por componente, con `userData` llevando la
  metadata técnica (tipo, nivel de tensión, datos nominales) para que el raycaster de click pueda
  alimentar el panel de información directamente desde el objeto.
- **Capa de datos**: un modelo de dominio separado de la escena (ej. `SubstationModel` en JS/TS
  puro) que calcula tensiones/corrientes/estados de protección; Three.js solo renderiza el
  estado, no contiene lógica eléctrica (separación de responsabilidades → más fácil de testear
  la teoría sin depender del render). Este modelo debe representar explícitamente el **grafo**
  de conectividad (nodos = barras/circuitos, aristas = interruptores/seccionadores con estado)
  para soportar tanto el modo maniobra como el modo diseño de topologías (§5).
- **UI overlay**: HTML/CSS superpuesto al canvas (paneles de info, sliders, quiz, osciloscopios
  2D, curvas TCC) en vez de sprites 3D, por accesibilidad y velocidad de desarrollo.

---

## 9. Próximos pasos

1. Confirmar alcance del MVP (¿inspección + maniobra primero, dejar falla/diseño para v2?).
2. Scaffold del proyecto (Vite + Three.js/TS).
3. Modelo de dominio eléctrico mínimo (transformador, interruptor, seccionador, TC/TP,
   pararrayos, relé) con sus reglas de negocio (ej. bloqueo de apertura de seccionador con carga,
   discriminación de inrush en 87T).
4. Primer componente 3D completo (transformador) como patrón de referencia para el resto —
   incluye ya varias de las mecánicas de mayor prioridad pedagógica (curva de eficiencia, %Z,
   inrush) documentadas en investigación 01.
5. Iterar componente por componente siguiendo la tabla de la sección 7, priorizando por relación
   valor-pedagógico / costo-de-implementación (cada investigación individual trae su propio
   ranking de prioridad en su sección final).
