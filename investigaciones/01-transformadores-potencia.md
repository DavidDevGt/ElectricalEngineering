# Transformadores de potencia en subestaciones de alta tensión

> Investigación técnica de soporte para `IDEA.md`. Objetivo: dotar al simulador 3D de un modelo
> conceptual riguroso del transformador de potencia — el componente más crítico de una
> subestación de alta tensión, tanto por su costo (típicamente 30-40% del CAPEX de una
> subestación AT/EAT) como por su rol como cuello de botella de la transferencia de energía.

---

## 1. Principio físico

### 1.1 Ley de Faraday y circuito magnético

Un transformador de dos devanados acopla magnéticamente un devanado primario (N₁ espiras) y uno
secundario (N₂ espiras) a través de un núcleo ferromagnético laminado (acero al silicio de grano
orientado, GOES, con permeabilidad relativa μᵣ ≈ 1500-5000 en el rango de operación lineal). La
ley de inducción de Faraday establece que la tensión inducida en un devanado es:

```
e(t) = N · dΦ/dt
```

Para excitación sinusoidal en estado estable, con Φ(t) = Φ_max·sin(ωt), la tensión eficaz
inducida es la **ecuación EMF del transformador**:

```
E_rms = 4.44 · f · N · Φ_max = 4.44 · f · N · B_max · A_núcleo
```

donde f es la frecuencia (50/60 Hz), B_max la densidad de flujo máxima en el núcleo (típicamente
diseñada entre 1.5-1.8 T para acero GOES, con saturación cerca de 2.0-2.1 T) y A_núcleo el área
efectiva de la sección transversal. Esta ecuación es el punto de partida del diseño: para una
tensión y frecuencia dadas, N y A_núcleo se dimensionan conjuntamente, y es también la razón por
la que operar un transformador a frecuencia menor que la nominal (o con sobretensión) empuja
B_max hacia la saturación, disparando corriente de magnetización no lineal y sobrecalentamiento.

El circuito magnético se modela como análogo al circuito eléctrico (dualidad reluctancia ↔
resistencia): la fuerza magnetomotriz `F = N·I` empuja un flujo `Φ` a través de una reluctancia
`R = l/(μ·A)` del núcleo, tal que `Φ = F/R`. Este análogo (tratado en detalle en MIT 6.061,
capítulo "Magnetic circuit analog to electric circuits") es la base para entender por qué el
núcleo requiere entrehierros mínimos, por qué el acero se lamina (para cortar las trayectorias de
corrientes de Foucault) y por qué la corriente de magnetización no es sinusoidal pura (por la
curva B-H no lineal, incluso lejos de saturación).

### 1.2 Circuito equivalente

El transformador real se modela con un **circuito equivalente tipo T** (referido usualmente al
lado primario o secundario mediante el cuadrado de la relación de vueltas `a = N₁/N₂`):

- **Transformador ideal**: relación `V1/V2 = N1/N2 = a`, `I1/I2 = N2/N1 = 1/a`, sin pérdidas ni
  dispersión de flujo.
- **Rama de magnetización** (en paralelo, del lado de la fuente): resistencia `R_c` (pérdidas en
  el hierro por histéresis y Foucault) en paralelo con reactancia de magnetización `X_m`
  (corriente reactiva necesaria para establecer el flujo mutuo). Esta rama consume la llamada
  "corriente de excitación" o "corriente de vacío" — típicamente 0.5-2% de la corriente nominal en
  transformadores de potencia grandes.
- **Impedancias serie**: resistencia de devanado `R1, R2` (pérdidas I²R / efecto Joule) e
  inductancia de dispersión (leakage) `X1, X2`, que representan el flujo que no enlaza
  completamente ambos devanados y que produce caída de tensión bajo carga sin disipar potencia
  activa.

En la práctica de ingeniería de sistemas de potencia, para estudios de flujo de carga y
cortocircuito se usa el **circuito equivalente aproximado**: se desprecia la rama de
magnetización (su corriente es pequeña comparada con la de carga) y toda la impedancia serie se
concentra en una sola impedancia equivalente referida a un lado, `Z_eq = R_eq + jX_eq` — esta es
precisamente la impedancia que se mide en el ensayo de cortocircuito y se expresa como %Z (ver
§4).

### 1.3 Diagrama fasorial

Bajo carga, el diagrama fasorial referido al secundario muestra: `E2` (fem inducida) adelantada
respecto a `V2` (tensión terminal) por la caída fasorial `I2·Z_eq`; la corriente `I2` desfasada de
`V2` por el ángulo del factor de potencia de la carga (φ); y la corriente de excitación `I_exc`
(magnetización + pérdidas en el hierro) en cuadratura/fase con el flujo mutuo `Φ_m`, que a su vez
está retrasado 90° respecto a `E`. Este diagrama es la herramienta clásica para visualizar por qué
la regulación de tensión (`(V_vacío - V_carga)/V_carga`) depende tanto de la magnitud de la
impedancia como del factor de potencia de la carga — con carga inductiva la caída de tensión es
mayor que con carga capacitiva a igual corriente.

---

## 2. Relación de transformación y grupos de conexión

### 2.1 Relación de transformación

`V1/V2 = N1/N2 = a` para transformación monofásica ideal. En transformadores trifásicos de
potencia, la relación de tensiones línea-línea depende además de cómo se conectan los devanados
(estrella Y, delta D/Δ, zigzag Z), porque la tensión de fase de un devanado en Y es `V_LL/√3`
mientras que en Δ es `V_LL` directamente.

### 2.2 Grupos de conexión (vector groups, IEC 60076-1)

La notación estándar IEC usa: letra mayúscula para el devanado de AT (Y=estrella, D=delta,
Z=zigzag), letra minúscula para el de BT (y, d, z; "n" adicional si el neutro está accesible), y
un número horario (0-11) que indica el desfase angular del secundario respecto al primario en
múltiplos de 30° (como las manecillas de un reloj, tomando el primario como referencia a las 12).

Ejemplos típicos en subestaciones:
- **Yy0**: ambos devanados en estrella, sin desfase (0°). Común en autotransformadores de
  transmisión donde se requiere neutro accesible en ambos lados.
- **Dyn11**: primario en delta, secundario en estrella con neutro accesible, desfase de +30°
  (posición horaria 11). Es la conexión más común en transformadores de distribución/subtransmisión
  porque el lado delta suprime el tercer armónico de la corriente de magnetización (que de otro
  modo circularía en la línea) y el lado estrella con neutro permite alimentar cargas
  monofásicas desbalanceadas.
- **YNd11**: estrella con neutro en AT (permite aterrizar el neutro para protección) y delta en
  BT, típico en transformadores elevadores de generación.

### 2.3 Por qué el desfase importa para el paralelismo

Para operar dos transformadores en paralelo (alimentando la misma barra) sin corrientes
circulantes destructivas, deben cumplirse simultáneamente: (1) igual relación de transformación
(o dentro de tolerancia estrecha), (2) igual grupo de conexión / desfase angular, y (3) polaridad
e secuencia de fases correctas. Un desfase angular distinto — por ejemplo intentar poner en
paralelo un Yy0 con un Dyn11 (30° de diferencia) — produce una diferencia de tensión fasorial
entre los secundarios que, aunque las magnitudes sean iguales, genera una **corriente circulante
limitada únicamente por las impedancias de cortocircuito de ambos transformadores** (típicamente
de un solo dígito porcentual), lo cual puede alcanzar magnitudes de varias veces la corriente
nominal y destruir los devanados en segundos. Por esto las normas exigen que el grupo de conexión
figure en la placa de características y que la ingeniería de subestaciones verifique
explícitamente compatibilidad de grupos antes de cualquier operación en paralelo.

---

## 3. Pérdidas y eficiencia

### 3.1 Pérdidas en el hierro (no-load losses, `P_Fe`)

Ocurren en el núcleo por dos mecanismos, y son esencialmente **independientes de la carga**
(dependen solo de la tensión aplicada y la frecuencia, por eso se miden en el "ensayo de vacío" /
open-circuit test):

- **Histéresis**: energía disipada al recorrer el ciclo B-H del material en cada ciclo de la red.
  Aproximada por la fórmula empírica de Steinmetz: `P_h = k_h · f · B_max^n` (n ≈ 1.6-2.0).
- **Corrientes de Foucault (eddy currents)**: corrientes inducidas dentro del propio acero del
  núcleo por el flujo variable, que se oponen (Lenz) al flujo y disipan I²R en el material. Escala
  aproximadamente como `P_e = k_e · f² · B_max² · t²` (t = espesor de lámina) — de ahí que el
  núcleo se construya con láminas delgadas (típicamente 0.23-0.30 mm) aisladas entre sí, en vez de
  hierro macizo, reduciendo drásticamente esta componente.

### 3.2 Pérdidas en el cobre (load losses, `P_Cu`)

Pérdidas resistivas I²R en los devanados primario y secundario, más pérdidas adicionales por
efecto pelicular (skin effect) y de proximidad, y pérdidas parásitas en partes metálicas
estructurales (tanque, prensas) inducidas por el campo de dispersión. Escalan con el **cuadrado**
de la corriente de carga, es decir, con el cuadrado del load factor `x` (fracción de carga
nominal):

```
P_Cu(x) = x² · P_Cu,nominal
```

Se miden en el "ensayo de cortocircuito" (con el secundario en corto y tensión reducida aplicada
al primario hasta circular corriente nominal) — este mismo ensayo es el que determina la
impedancia de cortocircuito %Z (§4).

### 3.3 Curva de eficiencia y carga óptima

```
η(x) = P_salida / (P_salida + P_Fe + x²·P_Cu,nominal)
```

La eficiencia es máxima en el punto donde las pérdidas variables igualan a las pérdidas
constantes, es decir, cuando `x² · P_Cu,nominal = P_Fe`:

```
x_óptimo = √(P_Fe / P_Cu,nominal)     →     S_óptima (MVA) = S_nominal · x_óptimo
```

En transformadores de potencia grandes bien diseñados, la relación P_Fe/P_Cu suele situarse de
forma que el punto de máxima eficiencia caiga entre 50-70% de carga nominal, porque los
transformadores de subestación operan la mayor parte del tiempo por debajo de su capacidad
nominal (el dimensionamiento incluye margen para contingencias N-1 y crecimiento de demanda). Los
transformadores de potencia grandes alcanzan eficiencias del 99.0-99.7% en el punto óptimo — muy
superiores a las máquinas rotativas — precisamente porque no hay pérdidas mecánicas ni de
fricción, solo pérdidas magnéticas y resistivas.

---

## 4. Impedancia de cortocircuito (%Z)

### 4.1 Significado físico

La impedancia de cortocircuito es, por definición (IEEE C57.12.00 / IEC 60076-1), la tensión que
debe aplicarse al devanado primario, con el secundario en cortocircuito, para que circule la
corriente nominal — expresada como porcentaje de la tensión nominal:

```
%Z = (V_cc / V_nominal) × 100
```

Físicamente representa casi en su totalidad la **reactancia de dispersión** (leakage reactance)
entre devanados — el flujo magnético que no logra acoplar completamente primario y secundario
debido a la separación física entre ellos (canales de aceite, aislamiento) — más una componente
resistiva menor. No es una "pérdida" en sentido de disipación (salvo la parte resistiva, que sí
son las P_Cu), sino una limitación inductiva a la transferencia de corriente.

### 4.2 Cómo limita la corriente de falla

Ante un cortocircuito franco en el lado secundario, la corriente de falla que entrega el
transformador está limitada, en primera aproximación (despreciando la impedancia de la red aguas
arriba), por:

```
I_falla = I_nominal × (100 / %Z)
```

Un transformador con %Z = 10% puede entregar hasta 10 veces su corriente nominal en falla franca.
Este es el motivo por el cual el %Z es un parámetro de **diseño intencional**, no solo una
consecuencia — subir el %Z reduce la corriente de falla (protegiendo interruptores y barras aguas
abajo, reduciendo esfuerzos electrodinámicos en los devanados) a costa de mayor caída de tensión
en operación normal y mayor regulación. Es un compromiso central de ingeniería.

### 4.3 Valores típicos por rango de potencia

Los valores típicos (y mínimos normativos según IEC 60076-5) crecen con el tamaño del
transformador:

| Rango de potencia | %Z típico |
|---|---|
| Transformadores de distribución (< 1 MVA) | 4-6% |
| Transformadores de subestación (10-100 MVA) | 7-11% |
| Transmisión / EAT (25-40 MVA, mínimo IEC) | ≥ 10% |
| Transmisión / EAT (63-100 MVA, mínimo IEC) | ≥ 12.5% |
| Transmisión / EAT (> 100 MVA) | 10-14%, mínimo ≥ 12.5% |

Para convertir %Z entre bases de potencia distintas (relevante al combinar transformadores de
distinta capacidad en un mismo estudio de cortocircuito): `%Z_nueva_base = %Z_base_original ×
(S_nueva_base / S_base_original)`.

---

## 5. Sistemas de enfriamiento

### 5.1 Por qué existen

Las pérdidas (§3) se convierten en calor que debe extraerse del núcleo y los devanados para
mantener la temperatura del punto más caliente (hot-spot) dentro de límites que preservan la vida
del aislamiento (el papel Kraft/celulosa se degrada térmicamente siguiendo aproximadamente la
regla de Montsinger: la tasa de envejecimiento se **duplica** por cada ~6-8°C de incremento
sostenido sobre la temperatura de diseño). El sistema de enfriamiento es, en consecuencia, el
factor que determina cuánta potencia puede entregar un transformador de un tamaño físico dado.

### 5.2 Nomenclatura (IEC 60076-2 / IEEE C57.12.00)

Código de cuatro letras: (1) medio de enfriamiento interno en contacto con devanados, (2)
mecanismo de circulación interna, (3) medio de enfriamiento externo, (4) mecanismo de circulación
externa.

| Sigla | Significado |
|---|---|
| **ONAN** | Oil Natural, Air Natural — circulación de aceite por convección natural, disipación al aire por convección natural (radiadores pasivos). Modo base, sin ventiladores ni bombas. |
| **ONAF** | Oil Natural, Air Forced — convección natural interna, pero ventiladores forzando aire sobre los radiadores. Incrementa la capacidad respecto a ONAN. |
| **OFAF** | Oil Forced, Air Forced — bombas circulan el aceite activamente a través de los radiadores, además de ventiladores. |
| **ODAF** | Oil Directed, Air Forced — el aceite es *dirigido* mediante conductos internos directamente a los puntos calientes de los devanados (no solo circula por convección/bombeo general), maximizando la extracción de calor donde más se necesita. |

### 5.3 Relación con capacidad de carga

Es común que un mismo transformador tenga **múltiples etapas de enfriamiento** (ej. placa
ONAN/ONAF1/ONAF2) que se activan progresivamente por termostato a medida que sube la carga,
incrementando la capacidad nominal en cada etapa. Según guías de aplicación (IEEE C57.91):
transformadores pequeños (< 2500 kVA trifásico) ganan aproximadamente 15% de capacidad al pasar de
ONAN a enfriamiento forzado; transformadores medianos (2500-10000 kVA) ganan cerca de 25%; y
unidades grandes (> 10000 kVA) pueden ganar 33% en la primera etapa forzada y hasta 67% en una
segunda etapa. Adicionalmente, la norma de "loading guide" (IEEE C57.91 / IEC 60076-7) define
**curvas de sobrecarga admisible en función del tiempo**: un transformador puede soportar cargas
por encima de su placa durante períodos limitados (minutos a horas) sacrificando vida útil del
aislamiento de forma controlada y cuantificada — un transformador no tiene un límite de potencia
"duro" sino una relación tiempo-temperatura-envejecimiento que depende de la temperatura
ambiente, la carga previa (condición térmica inicial) y la altitud de instalación.

---

## 6. Cambiador de tomas (Tap Changer)

### 6.1 Función

Permite ajustar la relación de transformación efectiva (variando N1 o N2 en pasos discretos,
típicamente ±10-15% en pasos de ~1.25-2.5%) para compensar variaciones de tensión en la red —
crítico porque la tensión de la red varía con la carga del sistema, mientras que los equipos aguas
abajo requieren tensión dentro de una banda estrecha.

### 6.2 Off-load (de-energized tap changer, DETC) vs. On-Load (OLTC)

- **Off-load**: solo puede operarse con el transformador **desenergizado** (fuera de servicio).
  Se usa para ajustes esporádicos (ej. compensar una diferencia de tensión de red permanente en la
  puesta en servicio), no para regulación dinámica.
- **On-Load (OLTC)**: puede cambiar de toma con el transformador energizado y bajo carga, sin
  interrumpir el suministro — es el mecanismo que permite regulación automática de tensión en
  tiempo real (con un relé de control de tensión, AVR, que ordena el cambio de toma cuando la
  tensión sale de una banda muerta).

### 6.3 Mecanismo de conmutación sin interrupción

El reto físico es que, durante la transición de una toma a otra, **no puede existir un instante en
que el circuito de carga quede abierto** (interrumpiría el suministro y generaría un arco
destructivo), pero tampoco puede haber un instante en que dos tomas queden puenteadas
directamente sin límite de corriente (cortocircuitaría las espiras entre tomas). La solución
estándar usa dos subsistemas:

- **Selector de tomas**: preselecciona sin corriente de carga (opera "off-load" a nivel de
  contacto, mientras la corriente sigue circulando por la toma previamente activa) cuál será la
  siguiente toma.
- **Conmutador (diverter switch)**: ejecuta la transferencia real de corriente mediante una
  secuencia **"make-before-break"** — cierra contacto con la nueva toma *antes* de abrir el de la
  toma anterior, pasando brevemente por un estado donde ambas tomas están puenteadas
  simultáneamente. Durante ese breve instante (típicamente 40-60 ms), una **resistencia (o
  reactancia) de transición** se inserta en serie para limitar la corriente circulante entre
  ambas tomas (que de otro modo sería un cortocircuito de las espiras intermedias) a un valor
  seguro, y luego se completa la apertura del contacto anterior.

El OLTC es, junto con el propio devanado, uno de los componentes de mayor tasa de falla del
transformador (por desgaste mecánico y eléctrico de los contactos del diverter switch, que operan
miles de veces a lo largo de la vida del equipo), y requiere mantenimiento e inspección de aceite
separados del tanque principal en muchos diseños (compartimento de aceite propio, ya que la
conmutación bajo carga genera arco y contaminación del aceite localmente).

---

## 7. Protección del transformador

### 7.1 Relé diferencial (87T) — principio

Compara fasorialmente la corriente que entra por el primario (referida a una base común mediante
los TCs de cada lado, corregida por relación de transformación y grupo de conexión — un
transformador Dyn11 requiere TCs conectados en Δ/Y compensados para corregir el desfase de 30° y
la componente de secuencia cero) contra la que sale por el secundario. En operación normal ambas
corrientes deben ser prácticamente iguales (la pequeña diferencia es la corriente de
magnetización), de modo que la **corriente diferencial** `I_dif = |I1 - I2|` es casi nula. Ante una
falla interna (entre espiras, fase-tierra o fase-fase dentro de la zona protegida), aparece un
desbalance real: I_dif crece abruptamente. El relé de **porcentaje diferencial (percentage
restraint)** compara I_dif contra una corriente de "restricción" `I_res = (|I1| + |I2|)/2`, operando
solo si `I_dif > pendiente × I_res` — esto añade tolerancia a errores normales de los TCs (que
crecen con la corriente pasante) sin perder sensibilidad ante fallas internas reales.

### 7.2 El problema de la corriente de inrush

Al energizar un transformador (cierre del interruptor), si el flujo residual del núcleo (que
puede retener 20-80% de la densidad de flujo de operación, dependiendo de en qué punto de la onda
se desenergizó previamente) tiene el signo desfavorable respecto al punto de la onda de tensión en
que se cierra el interruptor, el núcleo se ve forzado transitoriamente muy por encima de
saturación. La inductancia de magnetización colapsa en esa región y la corriente de magnetización
se dispara: la **corriente de inrush** puede alcanzar típicamente 8-14 veces la corriente nominal
(hasta 15x en el peor caso, cierre cerca del cruce por cero de tensión con alto flujo residual),
altamente asimétrica (un semiciclo mucho mayor que el otro, por el offset DC), y decayendo en
0.1-1 segundo. Desde la perspectiva del relé 87T, esta corriente de inrush **se ve exactamente
como una corriente diferencial** (entra por un devanado, no "sale" proporcionalmente por el otro
porque el transformador aún no transfiere carga real) y podría disparar el relé innecesariamente
ante una simple maniobra de energización normal.

### 7.3 Discriminación por segundo armónico

La solución clásica explota que la forma de onda de la corriente de inrush, al estar dominada por
la región no lineal de saturación del núcleo, es rica en armónicos pares — particularmente el
**segundo armónico**, que típicamente representa >15-20% de la componente fundamental en la
corriente de inrush, mientras que en una corriente de falla interna real el segundo armónico es
minoritario (<5%). El relé mide la relación `I_2°armónico / I_fundamental` de la corriente
diferencial y **bloquea/restringe el disparo** si supera un umbral (típicamente configurado
alrededor de 15-20%), permitiendo el disparo solo cuando el contenido de segundo armónico es bajo
— indicativo de una falla genuina. (Nota de rigor: transformadores modernos con acero de grano
orientado de mejor calidad generan inrush con menor contenido armónico que los diseños antiguos,
lo cual ha llevado a esquemas de protección más modernos que combinan restricción armónica con
otros criterios, como reconocimiento de forma de onda).

### 7.4 Otras protecciones

- **Relé Buchholz** (transformadores con conservador de aceite): dispositivo electromecánico
  montado en la tubería entre el tanque principal y el conservador, con dos flotadores/paletas.
  Ante una falla incipiente (arco de baja energía, sobrecalentamiento local) el aceite se
  descompone lentamente generando gas, que asciende y se acumula en la cámara del relé,
  desplazando aceite y haciendo descender un flotador que activa una **alarma**. Ante una falla
  severa (cortocircuito interno franco), la descomposición violenta genera un **surge** (golpe) de
  aceite que fluye súbitamente hacia el conservador; ese flujo empuja una paleta que activa el
  **disparo** inmediato del interruptor. Es, por tanto, una protección que discrimina severidad por
  la *velocidad* del fenómeno, no solo su magnitud, y detecta fallas incipientes (interespiras de
  baja corriente) que el diferencial eléctrico podría no ver hasta que ya son severas.
- **Sobrecorriente (50/51)**: respaldo, típicamente coordinado para operar más lento que el 87T
  y como respaldo de fallas externas no despejadas.
- **Imagen térmica / sondas de temperatura (49, 26)**: monitorean temperatura de aceite superior
  y estiman temperatura de punto caliente del devanado (winding hot-spot) mediante modelos
  térmicos que combinan temperatura de aceite medida más un incremento calculado a partir de la
  corriente de carga — activan alarmas y disparo por sobretemperatura, y alimentan los cálculos de
  capacidad de sobrecarga admisible (§5.3).
- **Válvula de sobrepresión / disco de ruptura**: protección mecánica pasiva contra
  sobrepresión repentina del tanque ante una falla interna de alta energía (arco interno que
  vaporiza aceite instantáneamente).

---

## 8. Modos de falla reales

### 8.1 Falla de aislamiento y cortocircuitos entre espiras

El aislamiento del devanado (papel Kraft impregnado en aceite mineral) se degrada por efecto
combinado de temperatura, humedad, oxígeno y esfuerzo eléctrico. Cuando el aislamiento entre
espiras adyacentes falla localmente, se produce un cortocircuito entre espiras (turn-to-turn
fault): dado que solo un número pequeño de espiras queda en corto, la corriente de falla vista
desde los terminales externos puede ser sorprendentemente **baja** al inicio (el "transformador
interno" en corto tiene muy pocas espiras, baja impedancia, pero también baja fem inducida
externamente) — razón por la cual estas fallas incipientes son difíciles de detectar por
sobrecorriente o incluso por el diferencial 87T en etapa temprana, y es precisamente el nicho de
detección del relé Buchholz (gas por descomposición térmica localizada) y del análisis de gases
disueltos.

### 8.2 Envejecimiento del sistema aceite-papel

El papel aislante (celulosa) es, en la práctica, el componente que determina la **vida útil**
del transformador — más que el aceite, que puede regenerarse o reemplazarse, pero el papel
degradado mecánicamente no. La celulosa se despolimeriza térmicamente (el grado de polimerización,
DP, cae desde ~1000 en papel nuevo hasta un umbral de fin de vida considerado alrededor de
DP≈200), siguiendo cinéticas de Arrhenius aceleradas por temperatura, humedad y oxígeno
disueltos — de ahí la regla práctica de Montsinger de duplicar la tasa de envejecimiento por cada
6-8°C sostenidos de exceso térmico (§5.1).

### 8.3 Análisis de gases disueltos (DGA) y furanos

El **DGA** es la herramienta de diagnóstico más usada en la industria para transformadores en
servicio: la descomposición térmica y eléctrica del aceite mineral y del papel genera gases
característicos disueltos en el aceite, cuya combinación e intensidad relativa indica el tipo de
falla incipiente:

| Gas | Indicación típica |
|---|---|
| Hidrógeno (H₂) | Descargas parciales / corona |
| Metano (CH₄), Etano (C₂H₆) | Sobrecalentamiento de baja/media temperatura |
| Etileno (C₂H₄) | Sobrecalentamiento de temperatura elevada |
| Acetileno (C₂H₂) | Arco eléctrico de alta energía (falla severa) — su sola presencia en cantidad significativa es indicador de alarma |
| CO, CO₂ | Descomposición térmica del papel/celulosa (no del aceite) |

Métodos estandarizados (razones de Rogers, triángulo/pentágono de Duval, IEEE C57.104) interpretan
las proporciones relativas entre estos gases para clasificar el tipo de falla probable (térmica de
baja/alta temperatura, descarga parcial, arco) sin necesidad de sacar el transformador de
servicio. Complementariamente, el **análisis de furanos** (2-FAL y compuestos relacionados,
subproductos solubles en aceite de la degradación de la celulosa) permite **estimar el grado de
polimerización remanente del papel** — y por tanto la vida útil restante — de forma indirecta y no
invasiva, sin necesidad de extraer una muestra física del devanado.

---

## 9. Puntos clave para la simulación educativa

Traducción de lo anterior a mecánicas 3D/interactivas concretas, priorizadas por relación
valor-pedagógico / costo-de-implementación:

1. **Animación del flujo magnético en el núcleo** (§1.1): representar el núcleo laminado con
   líneas de flujo animadas que "laten" en fase con una onda de tensión mostrada simultáneamente;
   permite anclar visualmente la ley de Faraday sin ecuaciones. Punto de entrada natural para
   introducir B_max y saturación (mostrar cómo, al forzar tensión/frecuencia fuera de rango, las
   líneas de flujo se "desbordan" del núcleo).

2. **Curva de eficiencia interactiva** (§3.3): un slider de carga (0-120%) que mueva en tiempo
   real dos barras (P_Fe constante, P_Cu creciente con el cuadrado) y grafique η(x), marcando el
   punto óptimo donde ambas pérdidas se igualan. Es la pieza más fácil de implementar con impacto
   conceptual alto (constante vs. cuadrática es intuitivo de ver, no solo de calcular).

3. **Simulación de corriente de inrush al energizar** (§7.2-7.3): al "cerrar el interruptor" en
   la simulación, mostrar una corriente pico asimétrica (~8-14x nominal) decayendo en el
   osciloscopio virtual, con un segundo trazo mostrando el contenido de segundo armónico cayendo
   por debajo del umbral de bloqueo — visualiza por qué el relé 87T no dispara en energización
   normal pero sí lo haría ante una falla real (mostrando el contraste de forma de onda).

4. **Diagrama fasorial interactivo** (§1.3): permitir al usuario variar el factor de potencia de
   la carga con un control y ver en tiempo real cómo rota el fasor de corriente y cambia la caída
   de tensión resultante — conecta directamente con el concepto de regulación de tensión.

5. **Cambiador de tomas animado** (§6.3): secuencia paso a paso (selector preselecciona → diverter
  puentea con resistencia de transición → completa transferencia) — buen candidato para una
  animación tipo "explosión de componente" con call-outs, mostrando por qué nunca hay interrupción
  del suministro.

6. **Comparativa visual de sistemas de enfriamiento** (§5.2-5.3): un transformador 3D con
   radiadores y ventiladores que se activan progresivamente (ONAN → ONAF1 → ONAF2) a medida que
   sube un slider de carga, junto con una curva de "capacidad admisible vs. tiempo" para
   sobrecarga — enseña que la capacidad no es un número fijo.

7. **Escenario de falla con discriminación 87T vs. Buchholz** (§7, §8.1): un modo "inyectar falla"
   donde el usuario elige tipo de falla (interespiras baja energía vs. cortocircuito franco
   interno) y observa cuál protección actúa primero y por qué — refuerza que son protecciones
   complementarias, no redundantes.

8. **%Z como "cuánto se opone" el transformador a la falla** (§4.2): un mini-cálculo interactivo
   donde el usuario ajusta %Z con un slider y ve cómo cambia la corriente de falla resultante en
   un cortocircuito simulado aguas abajo — conecta el parámetro de placa con una consecuencia de
   protección tangible.

Elementos de menor prioridad visual pero mencionables en tooltips/ficha técnica del componente:
grupo de conexión y su notación horaria (§2.2), tabla de %Z típico por rango de MVA (§4.3), y
gases característicos del DGA (§8.3) como texto de referencia en un panel de "diagnóstico" del
transformador.

---

## Fuentes

- [MIT OCW 6.061 — Introduction to Electric Power Systems (Spring 2011), Prof. James L. Kirtley Jr. — Readings / Course Notes](https://ocw.mit.edu/courses/6-061-introduction-to-electric-power-systems-spring-2011/pages/readings/)
- [MIT 6.061 — Chapter 3: Polyphase Networks](https://ocw.mit.edu/courses/6-061-introduction-to-electric-power-systems-spring-2011/c6393a58319200a5344752de0cf47ec4_MIT6_061S11_ch3.pdf)
- [Introduction to Electric Power Systems Lecture Notes (MIT 6.061), dokumen.pub](https://dokumen.pub/introduction-to-electric-power-systems-lecture-notes-mit-6061.html)
- [Transformer Percent Impedance Z% Short-Circuit Calculations](https://industrialmonitordirect.com/blogs/knowledgebase/transformer-percent-impedance-z-short-circuit-calculations)
- [Maximum Transformer Impedance — Eng-Tips discussion (valores típicos por rango MVA / IEC 60076-5)](https://www.eng-tips.com/threads/maximum-transformer-impedance.519123/)
- [Transformer Vector Group: Understanding IEC Notation & Phase Displacement](https://industrialmonitordirect.com/blogs/knowledgebase/transformer-vector-group-iec-notation-phase-angles-load-balancing)
- [Why Dyn11 Over Dyn0? Electrical Transformer Vector Groups](https://industrialmonitordirect.com/blogs/knowledgebase/transformer-dyn11-vs-dyn0-vector-group-phase-shift-selection)
- [IEEE C57.91-2025: A Guide for Loading Mineral-Oil-Immersed Transformers](https://www.hvassets.com/en/post/ieee-c57-91-2025-guide-for-loading-transformers)
- [Cooling Methods of Power Transformers and Reference Standards — Filipino Engineer](https://filipinoengineer.com/blog/2024/09/cooling-methods-of-power-transformers-and-reference-standards.html)
- [Comparison of Loading Guide Standards – IEEE and IEC (IEEE PES Transformers Committee)](https://grouper.ieee.org/groups/transformers/subcommittees/insulation_life/c57.91/LoadingGuideComparison-IEEE-IEC-R1.pdf)
- [Reinhausen — On-Load Tap-Changers for Power Transformers (Dr. Dieter Dohnal, technical monograph)](https://www.reinhausen.com/fileadmin/downloadcenter/company/publikationen/f0126405_on-load_tap-changers_for_power_transformers.pdf)
- [Reinhausen — Tap Changer Basics knowledge base](https://www.reinhausen.com/newsroom/mr-knowledge-base/tap-changer-basics)
- [Transformer differential protection (ANSI code 87T) — Electrical Engineering Portal](https://electrical-engineering-portal.com/transformer-differential-protection-ansi-code-87-t)
- [Differential (87) Current Protection — Control.com Textbook, Electric Power Measurement and Control Systems](https://control.com/textbook/electric-power-measurement-and-control/differential-87-current-protection/)
- [Practical Experience in Setting Transformer Differential Inrush Restraint — IEEE Conference Publication](https://ieeexplore.ieee.org/document/4515051/)
- [Transformer Inrush Current: Calculation & Theory — Electrical4U](https://www.electrical4u.com/magnetizing-inrush-current-in-power-transformer/)
- [Parameters that Determine Transformer Inrush Current — Voltage Disturbance](https://voltage-disturbance.com/power-engineering/parameters-that-determine-transformer-inrush-current/)
- [Buchholz Relay in Transformers (Working Principle) — Electrical4U](https://www.electrical4u.com/buchholz-relay-in-transformer-buchholz-relay-operation-and-principle/)
- [Troubleshooting Buchholz Relay — Electrical Engineering Portal](https://electrical-engineering-portal.com/troubleshooting-buchholz-relay)
- [Dissolved Gas Analysis (DGA) Test of Transformer Oil — Electrical4U](https://www.electrical4u.com/dga-or-dissolved-gas-analysis-of-transformer-oil-furfural-or-furfuraldehyde-analysis/)
- [What Is Dissolved Gas Analysis (DGA) in Transformer Oil? — Megger Knowledge Hub](https://www.megger.com/en-us/knowledge-hub/what-is-dissolved-gas-analysis-in-transformer-oil)
- [A Review of Dissolved Gas Analysis in Power Transformers (ResearchGate)](https://www.researchgate.net/publication/271606143_A_Review_of_Dissolved_Gas_Analysis_in_Power_Transformers)
- [Power Transformer Health Index and Life Span Assessment: A Comprehensive Review of Conventional and Machine Learning Based Approaches (arXiv)](https://arxiv.org/pdf/2504.15310)
- [Transformer Efficiency: Losses, Maximum & All-Day Efficiency — Wiringuru](https://wiringuru.com/transformer-efficiency/)
