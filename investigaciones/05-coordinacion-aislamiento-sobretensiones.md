# Coordinación de aislamiento y sobretensiones en sistemas de alta tensión

> Investigación técnica de soporte para el simulador 3D de subestaciones (`IDEA.md`). Fuentes:
> IEC 60071-1/2, IEEE C62.11/C62.22, IEEE Std 1243, y literatura de ingeniería de alta tensión.

## 1. Tipos de sobretensión que debe soportar un sistema de AT

La coordinación de aislamiento es, en esencia, un ejercicio de comparar **la severidad de las
sobretensiones que puede sufrir el sistema** contra **la capacidad de aislamiento del equipo**,
dejando un margen de seguridad. IEC 60071-1 clasifica las sobretensiones por su forma de onda
(frente de subida) porque la resistencia dieléctrica de un aislador **depende de la velocidad con
la que sube la tensión**, no solo de su valor de pico:

| Categoría IEC | Origen típico | Forma de onda / frente | Rango de amplitud típico |
|---|---|---|---|
| **Sobretensión temporal (TOV)** | Rechazo de carga, falla monofásica a tierra (efecto Ferranti/desplazamiento del neutro), resonancia, saturación de transformador | Frecuencia industrial (50/60 Hz), duración de ciclos a segundos | 1.2–1.8 p.u., puede persistir segundos |
| **Sobretensión de maniobra (switching surge)** | Apertura/cierre de interruptores, reenganche, energización de líneas en vacío, eliminación de fallas | Frente lento, decenas a cientos de µs — onda normalizada **250/2500 µs** | 2–4 p.u. |
| **Sobretensión atmosférica (rayo)** | Descarga directa a línea/fase, descarga a cable de guarda con retorno inverso (backflashover), inducción por rayo cercano | Frente muy rápido, µs — onda normalizada **1.2/50 µs** | hasta decenas de p.u. sin protección |
| **Muy rápido frente (VFTO)** | Maniobras en GIS (operación de seccionador en SF6) | ns (0.1 µs) | específico de subestaciones GIS |

La onda normalizada de impulso atmosférico **1.2/50 µs** (según IEC 60060-1: T1 = 1.2 µs ± 30 %,
es decir 0.84–1.56 µs de tiempo de frente; T2 = 50 µs ± 20 %, tiempo hasta el semivalor en la
cola) es la que se usa en ensayos tipo de todo equipo de AT. La onda de maniobra **250/2500 µs**
es dos a tres órdenes de magnitud más lenta, lo cual importa porque el mecanismo de ruptura
dieléctrica en aire (formación de líder/estrimer) tiene un tiempo característico propio: para
frentes muy lentos el aislamiento en aire se vuelve **más débil relativamente** que para frentes
rápidos (existe una tensión crítica de flameo mínima en torno a 100–300 µs, la "curva U" de
resistencia dieléctrica vs. tiempo al pico).

## 2. BIL, BSL y los Rangos I/II de IEC 60071-1

**BIL (Basic [Lightning] Impulse Insulation Level)**: tensión de pico de la onda 1.2/50 µs que el
aislamiento debe soportar sin descarga disruptiva, en condiciones normalizadas, con una
probabilidad de resistencia especificada. Es el parámetro histórico de diseño de aislamiento en
todo el rango de tensiones.

**BSL (Basic Switching [Impulse] Insulation Level)**: análogo pero para la onda de maniobra
250/2500 µs. IEC 60071-1 solo lo exige como ensayo normalizado explícito para **Um > 245 kV**
(Rango II); por debajo, se asume implícitamente cubierto por el ensayo a frecuencia industrial de
corta duración.

La norma divide el rango de tensiones en dos bloques con filosofías de diseño distintas:

- **Rango I (1 kV < Um ≤ 245 kV)**: domina el diseño la sobretensión atmosférica. El BIL es el
  parámetro de diseño principal; el ensayo dieléctrico se hace con impulso de rayo + tensión de
  corta duración a frecuencia industrial.
- **Rango II (Um > 245 kV)**: a medida que sube la tensión, las sobretensiones de maniobra crecen
  proporcionalmente con el sistema (múltiplos de la tensión de servicio) mientras que la severidad
  del rayo es prácticamente independiente de la tensión nominal de la línea. Por eso, en EAT el
  **BSL pasa a ser el factor dominante** del diseño de aislamiento — de hecho, gran parte de las
  distancias en aire de una subestación de 420–800 kV están fijadas por la sobretensión de
  maniobra, no por el rayo.

Tabla de valores normalizados **representativos** (IEC 60071-1, tablas 2 y 3 — la norma admite
varias combinaciones por nivel de Um; se muestra una selección orientativa, no exhaustiva):

| Um (kV, valor eficaz máximo) | Rango | Tensión soportada a 50 Hz, corta duración (kV ef.) | BSL (kV pico) | BIL (kV pico) |
|---|---|---|---|---|
| 72.5 | I | 140 | — | 325 / 350 |
| 145 | I | 230 / 275 | — | 550 / 650 |
| 245 | I | 360 / 395 / 460 | — | 850 / 950 / 1050 |
| 420 | II | — | 950 / 1050 | 1300 / 1425 |
| 550 | II | — | 1050 / 1175 | 1550 / 1675 |

Notar el patrón: en Rango I el BIL crece casi linealmente con Um; en Rango II, aunque Um casi se
duplica (245→420→550 kV), el BIL crece proporcionalmente menos — reflejo de que la sobretensión
de maniobra (limitada eficazmente por pararrayos ZnO modernos) se vuelve el techo de diseño en vez
del rayo.

## 3. Margen de coordinación de aislamiento

El margen de coordinación relaciona tres magnitudes:

```
Margen de protección (%) = (Nivel de aislamiento del equipo − Nivel de protección del pararrayos) / Nivel de protección del pararrayos × 100
```

IEC 60071-2 recomienda márgenes mínimos:
- **≥ 20 %** entre BIL del equipo y el nivel de protección a impulso de rayo del pararrayos (Up,
  al 10 kA nominal en 8/20 µs).
- **≥ 15–20 %** entre BSL del equipo y el nivel de protección a impulso de maniobra del pararrayos.

Este margen no es arbitrario: cubre (a) la caída de tensión adicional entre el pararrayos y el
equipo protegido por efecto de separación (líneas de conexión con inductancia, ver §7), (b)
dispersión estadística de la resistencia dieléctrica real del equipo respecto al valor de ensayo,
y (c) envejecimiento/degradación del aislamiento en servicio.

El enfoque de la norma distingue dos filosofías según el tipo de aislamiento:

- **Aislamiento autorregenerable (self-restoring)** — aire, porcelana externa: se trata
  estadísticamente porque una descarga disruptiva no destruye el aislador (recupera su rigidez
  tras el evento). Se diseña con un **riesgo de falla aceptado** (típicamente 2–10 % de
  probabilidad de descarga con la sobretensión de diseño), usando la distribución estadística de
  sobretensiones del sistema convolucionada con la distribución de resistencia dieléctrica del
  aislador.
- **Aislamiento no autorregenerable** — papel-aceite de transformador, aislamiento sólido de
  cable: una sola descarga es destructiva. Se usa un **método determinístico** con factor de
  seguridad fijo (típicamente 1.15 en Rango I y 1.15–1.25 en Rango II sobre la sobretensión
  representativa), porque no hay margen para asumir riesgo estadístico de falla.

## 4. Física del pararrayos de óxido de zinc (ZnO / MOV)

Un pararrayos moderno es esencialmente una pila de discos varistores de **ZnO sinterizado con
aditivos** (Bi₂O₃, Sb₂O₃, Co, Mn, etc.), sin explosores (gaps) en serie, a diferencia de los
antiguos pararrayos de SiC que sí requerían un gap porque el carburo de silicio por sí solo no
tiene suficiente no-linealidad para bloquear la corriente de fuga a tensión nominal.

**No linealidad V-I**: la relación se modela como `I = k·V^α`, donde α (exponente de
no-linealidad) es el parámetro clave:
- SiC: α ≈ 2–6 (insuficiente — necesita el gap serie para no conducir permanentemente a tensión
  de servicio).
- **ZnO: α ≈ 25–50** en la región de conducción activa (la "rodilla" de la curva). Esta
  no-linealidad extrema es lo que permite eliminar el gap: a tensión de servicio (región de
  "fuga", microamperios) la resistencia efectiva es de cientos de MΩ; apenas la tensión supera el
  umbral de la rodilla, la resistencia colapsa varios órdenes de magnitud y el disco conduce
  kiloamperios con una subida de tensión mínima.

La curva V-I tiene tres regiones: (1) región de baja corriente/fuga (µA, dominada por la barrera
de potencial en los límites de grano de ZnO), (2) región no lineal activa (A–kA, donde α es
máximo — aquí opera el pararrayos durante una sobretensión), (3) región de saturación a
corrientes muy altas (decenas de kA) donde la resistencia óhmica del propio material vuelve a
dominar y la curva se aplana menos favorablemente.

**Parámetros de definición (IEC 60099-4 / IEEE C62.11)**:
- **Uc (MCOV, Maximum Continuous Operating Voltage)**: tensión eficaz máxima que puede aplicarse
  continuamente sin envejecimiento térmico inaceptable. Debe ser ≥ tensión fase-tierra máxima de
  servicio continuo.
- **Ur (tensión asignada/rated voltage)**: tensión de referencia para TOV — típicamente
  `Ur ≈ 1.25 × Uc`, y representa la máxima TOV de 10 s que el pararrayos puede soportar tras haber
  absorbido un impulso de descarga.
- **Nivel de protección a impulso de rayo (Up, LI)**: tensión residual medida a la corriente
  nominal de descarga (típicamente 10 kA, onda 8/20 µs) — es lo que "ve" el equipo protegido.
  Orden de magnitud: Up ≈ 3.0–3.5 × Uc.
- **Nivel de protección a impulso de maniobra (Up, SI)**: tensión residual a corriente de
  maniobra (0.5–2 kA, onda 30/60 µs), siempre menor que Up,LI porque a menor corriente la curva
  V-I del ZnO da una tensión residual inferior.
- **Capacidad de absorción de energía**: límite térmico del disco antes de fuga térmica
  (thermal runaway) irreversible. Pararrayos de clase distribución: ≈ 2.5–4.5 kJ/kV de Ur;
  pararrayos de clase estación (los usados en subestaciones de AT/EAT): ≈ 9–14 kJ/kV de Ur.
  IEC 60099-4 clasifica pararrayos en clases de energía de 1 a 20 kJ/kV. Este límite es crítico
  en aplicaciones de maniobra de líneas largas o compensación reactiva, donde la energía disipada
  por descarga de línea puede ser el factor dimensionante en vez de la tensión de protección.

## 5. Distancias de aislamiento en aire: AIS vs. GIS

En subestaciones **AIS (Air Insulated Substation)** el aire ambiente es el dieléctrico entre
fases y a tierra. La rigidez dieléctrica del aire en condiciones estándar (1 atm, seco) es del
orden de **3 kV/mm** para campos uniformes, pero las distancias reales de diseño en subestación
son mucho mayores por metro porque los campos son no uniformes (efecto punta en herrajes) y
porque las distancias se fijan por el **BSL/BIL con factores de corrección** (altitud, humedad,
configuración electrodo-electrodo o electrodo-plano), no por la rigidez teórica del aire puro.
Como orden de magnitud, una subestación AIS de 245 kV requiere distancias fase-tierra de varios
metros y de 420–550 kV, del orden de 3–4 m o más.

En subestaciones **GIS (Gas Insulated Substation)**, los conductores van encerrados en
envolventes metálicas rellenas de **SF6** a presión (típicamente 0.4–0.7 MPa). El SF6 es un gas
electronegativo (captura electrones libres, interrumpiendo la avalancha de ionización) con
rigidez dieléctrica del orden de **2.5–3 veces la del aire** a igual presión, y al presurizarlo la
rigidez sube más — del orden de 8–9 kV/mm en las condiciones típicas de operación. Esto permite
que la misma resistencia dieléctrica (mismo BIL/BSL) se logre con distancias entre conductor y
envolvente drásticamente menores. El resultado práctico citado en la industria: **una subestación
GIS ocupa del orden del 10–25 % del área de la AIS equivalente** para el mismo nivel de tensión y
configuración. Esto es relevante para el simulador porque es la justificación física (no solo
estética) de por qué las subestaciones GIS "encogen" el mismo diagrama unifilar a un contenedor
compacto.

## 6. Modelo electrogeométrico y apantallamiento contra rayos directos

El **modelo electrogeométrico (EGM)** predice si un rayo descendente impactará el cable de guarda
(protegido), un conductor de fase (falla de apantallamiento) o el suelo, en función de la
**distancia de impacto (striking distance)**, que depende de la magnitud de la corriente de
retorno del rayo `I` (kA). La formulación clásica (adoptada por IEEE Std 1243, basada en trabajos
de Whitehead/Armstrong) es:

```
rs = 10 · I^0.65   (metros, I en kA)
```

Interpretación física: cuando el líder descendente se aproxima a tierra, a una distancia `rs` de
un objeto conductor (cable de guarda, fase, o el propio suelo) se produce el "salto final"
(final jump) — el objeto que primero quede dentro de esa esfera de radio `rs` centrada en la
punta del líder "atrae" la descarga. Corrientes de rayo mayores producen líderes con más carga y
por tanto mayor `rs` (mayor "radio de atracción"), pero paradójicamente eso hace que los rayos de
**baja corriente** sean los más peligrosos para fallas de apantallamiento: su `rs` pequeño permite
que se cuelen entre el cono de protección del cable de guarda e impacten directamente una fase,
y además la insulación tiene menos margen para corrientes bajas porque la sobretensión resultante
(`V ≈ I × Z_surge / 2` en la línea) puede aun así superar el BIL si el apantallamiento fallara.

El **ángulo de apantallamiento** (shielding angle, β) es el ángulo entre la vertical que pasa por
el cable de guarda y la línea que va al conductor de fase más expuesto. Diseños clásicos (método
del ángulo fijo) usan β ≈ 20–30° para líneas de distribución/subtransmisión; para EAT/UHV
modernas se recomienda un método EGM completo (equivalente al "rolling sphere method") en vez de
un ángulo fijo, y a menudo termina en ángulos efectivos cercanos a 0° o incluso negativos
(cable de guarda desplazado hacia afuera de la fase) para minimizar la tasa de falla de
apantallamiento en estructuras muy altas.

## 7. Ondas viajeras y el problema del extremo del transformador

Una sobretensión de rayo que incide en una línea no aparece instantáneamente en toda su longitud:
se propaga como **onda viajera** con velocidad cercana a la de la luz (para líneas aéreas) y una
**impedancia característica (impedancia de choque)** `Z0 = √(L'/C')` del orden de **350–500 Ω**
para una línea aérea típica (contra ≈ 30–60 Ω para un cable subterráneo, mucho menor por su mayor
capacitancia por unidad de longitud). Esta impedancia relaciona onda de tensión y onda de
corriente viajando juntas: `V = Z0 · I`.

Cuando la onda llega a una **discontinuidad de impedancia** (empalme, extremo abierto, transformador,
barra), parte se refleja y parte se transmite, según el coeficiente de reflexión:

```
Γ = (Z2 − Z1) / (Z2 + Z1)
```

Un **transformador de potencia visto en el dominio de frecuencias del frente de onda de un
rayo (∼MHz)** se comporta aproximadamente como un **circuito abierto**: a esas frecuencias la
reactancia inductiva del devanado es enorme comparada con Z0 de la línea, de modo que `Z2 → ∞` y
`Γ → +1`. Esto significa que **la onda se refleja con el mismo signo y se suma a la incidente**,
duplicando aproximadamente la tensión en el terminal del transformador respecto a la onda
incidente sola (`V_terminal ≈ 2 × V_incidente` en el límite ideal de circuito abierto puro).

Esto es exactamente lo que hace crítica la coordinación de aislamiento en el extremo del
transformador: es el punto de la instalación donde la sobretensión de rayo tiende a ser **más
severa**, no menos, incluso después de que la onda ya viajó y se atenuó en la línea. Por eso el
pararrayos de protección del transformador debe instalarse lo más cerca físicamente posible de
sus bornes — la distancia entre el pararrayos y el transformador introduce un retardo de
propagación adicional (**efecto de separación / separation effect**) que permite que la tensión en
el terminal del transformador supere momentáneamente el nivel de protección del pararrayos antes
de que la onda reflejada regrese y sea recortada, erosionando el margen de coordinación calculado
en §3.

## 8. Puntos clave para la simulación educativa

Para transmitir estos conceptos en el simulador 3D de forma didácticamente honesta:

1. **Animar la onda 1.2/50 µs viajando por la línea**: representar el frente de tensión como un
   pulso que se desplaza a lo largo del conductor (escala de tiempo dilatada, no realista en
   segundos reales — la propagación real es de µs), con un gradiente de color que muestre la
   subida abrupta (1.2 µs) y la cola lenta (50 µs hasta el semivalor).
2. **Mostrar el "recorte" en el pararrayos**: cuando el pulso alcanza la posición del pararrayos,
   la amplitud de la onda se aplana visualmente al nivel de protección Up (no a cero — un error
   didáctico común es mostrar el pararrayos "absorbiendo todo"; en realidad limita la tensión mas
   no la elimina, y deja pasar aguas abajo una onda con amplitud ≈ Up).
3. **Comparar contra el BIL del transformador con una barra de referencia horizontal fija**: el
   objetivo pedagógico es que el usuario vea visualmente que `Up < BIL` con el margen de ~20 %, y
   pueda experimentar (modo interactivo) qué pasa si mueve el pararrayos lejos del transformador:
   la onda reflejada en el terminal (circuito abierto, §7) debería mostrarse sumándose a la
   incidente y momentáneamente **superando el BIL** si la distancia pararrayos-transformador es
   artificialmente grande — esta es la lección más valiosa y menos intuitiva del tema.
4. **Modo comparativo de severidad**: permitir alternar entre las tres formas de onda (TOV 50/60
   Hz sostenida, maniobra 250/2500 µs, rayo 1.2/50 µs) sobre el mismo eje de tiempo logarítmico,
   para que el usuario internalice la diferencia de escala temporal (segundos vs. cientos de µs
   vs. µs) — es la clave conceptual de por qué existen BIL y BSL como parámetros separados.
5. **Vincular el modelo electrogeométrico con el cable de guarda**: en la vista de línea de
   transmisión, dibujar el cono/ángulo de apantallamiento y (opcionalmente) la esfera rodante de
   radio `rs = 10·I^0.65` para distintas corrientes de rayo seleccionables por el usuario, mostrando
   cómo corrientes bajas “se cuelan” bajo el cable de guarda.

## Fuentes

- [IS/IEC 60071-1 (2006): Insulation Co-ordination, Part 1 — Definitions, principles and rules](https://law.resource.org/pub/in/bis/S05/is.iec.60071.1.2006.pdf)
- [IEC 60071-1 Edition 8.0 2010-01 (Amendment 1)](https://cdn.standards.iteh.ai/samples/16637/aac1ee94d43f43e5926c9f69d0a82cca/IEC-60071-1-2006-AMD1-2010.pdf)
- [High-Voltage Testing and Insulation Coordination — Part 1](https://eepower.com/technical-articles/high-voltage-testing-and-insulation-coordinationpart-1/)
- [High-Voltage Testing and Insulation Coordination — Part 2](https://eepower.com/technical-articles/high-voltage-testing-and-insulation-coordinationpart-2/)
- [High-Voltage Testing and Insulation Coordination — Part 3](https://eepower.com/technical-articles/high-voltage-testing-and-insulation-coordinationpart-3/)
- [High-Voltage Testing and Insulation Coordination — Part 4](https://eepower.com/technical-articles/high-voltage-testing-and-insulation-coordinationpart-4)
- [Impulse Testing Basics: Understanding High Voltage Surge Testing](https://www.hvtechnologies.com/impulse-testing-high-voltage-basics/)
- [IEEE Guide for the Application of Metal-Oxide Surge Arresters for AC Systems (IEEE C62.22 background)](https://www.academia.edu/14451843/IEEE_Guide_for_the_Application_of_Metal_Oxide_Surge_Arresters_for_Alternating_Current_Systems_Surge_Protective_Devices_Committee_of_the_IEEE_Power_Engineering_Society_IEEE_Standards_Board)
- [IEEE C62.11-2020 — IEEE Standard for Metal-Oxide Surge Arresters for AC Power Circuits (>1 kV)](https://webstore.ansi.org/standards/ieee/ieeec62112020)
- [Understanding Surge Arrester Electrical Ratings: MCOV, Rated Voltage, TOV, and Energy Absorption](https://xin-neng.com/technology/understanding-surge-arrester-electrical-ratings-mcov-rated-voltage-tov-and-energy-absorption/)
- [Surge Arrester Selection: MCOV, Voltage & Energy](https://xbrele.com/surge-arrester-selection-mcov-residual-voltage-energy-rating/)
- [Arresters Energy Handling Capability — Hubbell](https://blog.hubbell.com/en/hubbellpowersystems/arresters-energy-handling-capability)
- [Surge Arrester kJ/kV Discharge Capacity: IEEE C62.11 Standards Guide](https://industrialmonitordirect.com/blogs/knowledgebase/surge-arrester-energy-rating-kjkv-per-ieee-c6211-and-iec-60099-4)
- [Choosing Between Gas-Insulated and Air-Insulated Substations](https://eepower.com/technical-articles/choosing-between-gas-insulated-and-air-insulated-substations)
- [Gas Insulated Substation Definitions and Basics (CED Engineering course notes)](https://www.cedengineering.com/userfiles/Gas%20Insulated%20Substation%20Definitions%20and%20Basics%20R2.pdf)
- [An Introduction to Gas Insulated Electrical Substations (CED Engineering)](https://www.cedengineering.com/userfiles/E03-043%20-%20An%20Introduction%20to%20Gas%20Insulated%20Electrical%20Substations%20-%20US.pdf)
- [An Improved Electrogeometric Model for Transmission Line Shielding Analysis — IEEE Xplore](https://ieeexplore.ieee.org/document/4308192/)
- [Lightning attachment models and perfect shielding angle of transmission lines](https://www.researchgate.net/publication/224123907_Lightning_attachment_models_and_perfect_shielding_angle_of_transmission_lines)
- [Comparison of Striking Distance Formulae and Their Effect on Lightning Shielding Analysis](https://www.researchgate.net/publication/263649834_Comparison_of_Striking_Distance_Formulae_and_Their_Effect_on_Lightning_Shielding_Analysis)
- [Understanding Direct Lightning Stroke Shielding of Substations (PSERC seminar)](https://documents.pserc.wisc.edu/documents/general_information/presentations/pserc_seminars/pserc_seminars0/sen_2001.pdf)
- [Substation Shielding Methods for Lightning Strikes — Power Quality Blog](https://powerquality.blog/2023/09/06/substation-shielding-methods-for-lightning-strikes/)
- [Applying IEEE 998-2012 for Substation Lightning Shielding Design](https://industrialmonitordirect.com/blogs/knowledgebase/ieee-998-2012-lightning-protection-substation-application-guide)
- [Travelling Waves of Voltage & Currents in Circuits](https://www.engineeringenotes.com/electrical-engineering/circuits/travelling-waves-of-voltage-currents-in-circuits-electrical-engineering/24927)
- [Surge Impedance — ScienceDirect Topics](https://www.sciencedirect.com/topics/engineering/surge-impedance)
- [Rectangular Travelling Wave — Open Ended Transmission Line](https://www.eeeguide.com/rectangular-travelling-wave/)
