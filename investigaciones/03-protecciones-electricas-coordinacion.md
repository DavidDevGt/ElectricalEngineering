# Investigación 03 — Sistemas de Protección Eléctrica y Coordinación de Relés

> Complementa `IDEA.md` (secciones 3.2, 4, 7 y la fila "Coordinación de protecciones" de la tabla
> pedagógica). Fuente de referencia central: J. Lewis Blackburn, *Protective Relaying: Principles
> and Applications*; normas IEEE C37 series; ver sección Fuentes.

---

## 1. Filosofía de la protección

Un sistema de protección no evita fallas — las fallas (cortocircuitos, sobrecargas, descargas
atmosféricas) son inevitables en un sistema eléctrico real. Su función es **detectar la falla y
aislar el mínimo tramo posible del sistema, en el mínimo tiempo posible, sin desconectar nada que
esté sano**. Todo el diseño de protecciones se reduce a balancear cuatro atributos que compiten
entre sí:

- **Selectividad (selectivity/discrimination)**: solo debe operar la protección más cercana a la
  falla (protección primaria); el resto del sistema permanece en servicio. Si la protección
  primaria falla, debe operar una protección de respaldo (backup), pero desconectando la menor
  zona adicional posible.
- **Sensibilidad**: capacidad de detectar fallas incluso de baja magnitud (p. ej. una falla a
  tierra de alta impedancia al final de una línea larga), sin por ello operar ante condiciones de
  carga normal o transitorios no falla.
- **Velocidad**: cuanto más rápido se despeja la falla, menor es el daño térmico/mecánico al
  equipo, menor el riesgo para las personas, y menor el impacto en la estabilidad del sistema de
  potencia (un cortocircuito prolongado puede sacar generadores de sincronismo).
- **Confiabilidad (reliability)**: se descompone formalmente en dos componentes que Blackburn y la
  literatura IEEE tratan como ejes independientes y en tensión:
  - **Dependability (fiabilidad de operación)**: certeza de que el relé operará cuando debe.
  - **Security (seguridad de no-operación)**: certeza de que el relé NO operará cuando no debe
    (falsos disparos).
  Aumentar dependability (p. ej. añadiendo respaldos, bajando umbrales) tiende a reducir security,
  y viceversa — no existe un ajuste que maximice ambos simultáneamente; el diseño es un
  compromiso deliberado según la criticidad del circuito.

### Zonas de protección superpuestas

Cada elemento del sistema (línea, transformador, barra, generador) tiene una **zona de
protección** definida por la ubicación física de los transformadores de instrumento (TC/TP) que
alimentan al relé — el TC literalmente traza el límite eléctrico de "adentro" vs "afuera" de la
zona. Las zonas adyacentes se **superponen deliberadamente** en la ubicación del interruptor, de
modo que no exista ningún punto del sistema sin cobertura ("zona muerta"). Esa superposición es la
razón por la que una falla justo en la zona de traslape puede hacer operar simultáneamente dos
protecciones — comportamiento esperado, no un error de diseño.

---

## 2. Protección de sobrecorriente (50/51)

Es la protección más simple y extendida: mide la magnitud de corriente y opera si supera un
umbral (pickup). El código ANSI distingue dos comportamientos:

- **50 — Sobrecorriente instantánea**: opera sin retardo intencional en cuanto la corriente supera
  el ajuste. Se usa para fallas de magnitud muy alta (cercanas eléctricamente al relé), donde no
  hace falta esperar: nada "aguas abajo" puede producir una corriente tan alta en operación normal.
- **51 — Sobrecorriente de tiempo (temporizada)**: el tiempo de operación depende inversamente de
  la magnitud de la corriente — a mayor corriente, disparo más rápido — siguiendo una **curva
  tiempo-corriente (TCC, Time-Current Curve)**.

### Curvas TCC y sus familias

La norma **IEEE C37.112** y la **IEC 60255-151** definen ecuaciones estándar de tiempo inverso
para que relés de distintos fabricantes reproduzcan curvas idénticas dada la misma familia y
dial/multiplicador de tiempo (TDS/TMS). Las familias principales (parámetro α de la ecuación,
IEC 60255):

| Familia | α aproximado | Comportamiento | Uso típico |
|---|---|---|---|
| Inversa estándar (SI) | ≈ 0.02 | Pendiente moderada | Distribución general |
| Muy inversa (VI) | ≈ 0.138–1 (según IEC/IEEE) | Pendiente pronunciada | Sistemas con aportes de falla muy variables |
| Extremadamente inversa (EI) | ≈ 1.0–2 | Muy pronunciada, casi tipo fusible | Protección de motores, coordinación con fusibles |

La forma general (IEEE C37.112) es `t = TDS · [A/((I/I_pickup)^p − 1) + B]`, donde A, B, p
dependen de la familia de curva. La curva EI se elige cuando se necesita imitar el comportamiento
de un fusible aguas abajo; la SI cuando la corriente de falla varía poco con la distancia.

### Coordinación entre relés en serie (coordinación de sobrecorriente)

Cuando dos relés de sobrecorriente están en serie (uno "aguas arriba", de respaldo, y otro "aguas
abajo", primario) protegiendo tramos consecutivos del sistema, deben ajustarse de modo que, ante
una falla en la zona del relé aguas abajo, este dispare primero, y el de aguas arriba solo actúe
como respaldo si el primero falla. La diferencia de tiempo de operación entre ambos para la misma
corriente de falla se llama **margen de coordinación (CTI — Coordination Time Interval)**, y debe
cubrir: el tiempo de apertura del interruptor aguas abajo, el tiempo de sobrepaso (overtravel) de
relés electromecánicos o el tiempo de procesamiento en relés digitales, y un margen de seguridad.
Valores típicos de la industria: **0.2–0.4 s** con relés microprocesados modernos (más rápidos y
sin sobrepaso mecánico), llegando a **0.3–0.5 s** quedando margen adicional cuando intervienen
relés electromecánicos o fusibles. Este ajuste "en escalera" (curva tras curva desplazada en el
eje de tiempo, sobre el mismo eje logarítmico de corriente) es el objeto del **estudio de
coordinación**, típicamente graficado en papel log-log tiempo vs. corriente — de ahí el nombre TCC.

---

## 3. Protección diferencial (87) — protección unitaria

El principio es una aplicación directa de la **Ley de Corrientes de Kirchhoff (LCK)** a una zona
de protección: en régimen normal o ante una falla externa a la zona, la suma de corrientes que
entran a la zona (medidas por TC en cada terminal) debe ser igual a la suma de las que salen —
corriente diferencial ≈ 0. Si ocurre una falla **dentro** de la zona protegida, aparece una
corriente diferencial distinta de cero (la LCK "se rompe" porque hay una fuga de corriente hacia
la falla que no sale por ningún terminal monitoreado), y el relé dispara.

Consecuencia clave: la protección diferencial es una **protección unitaria** — su zona está
definida exactamente por la ubicación de los TC en cada extremo, es inherentemente selectiva por
construcción (no puede "ver" fallas fuera de su zona) y **no necesita coordinarse en tiempo con
ninguna otra protección del sistema**, a diferencia de la sobrecorriente. Esto le permite operar
prácticamente instantánea (típicamente 1–2 ciclos), siendo de las protecciones más rápidas que
existen.

Aplicaciones:
- **Líneas de transmisión (87L)**: TC en ambos extremos; requiere un canal de comunicación
  confiable entre ambos extremos (fibra óptica, onda portadora) para comparar las corrientes en
  tiempo real — la zona puede abarcar decenas o cientos de km.
- **Transformadores (87T)**: caso especial, porque no hay una conexión eléctrica directa entre
  primario y secundario (solo acoplamiento magnético) y las corrientes en cada lado tienen
  distinta magnitud (por la relación de transformación) y a veces distinto ángulo de fase (grupo
  de conexión, p. ej. Dyn11). El relé compensa matemáticamente relación de TC, relación de
  transformación y desfase por grupo de conexión antes de comparar. Además debe distinguir una
  falla interna real de la **corriente de inrush** (magnetización) al energizar el transformador,
  que también genera una diferencial aparente — se usa el contenido de segundo armónico del
  inrush como "firma" para bloquear el disparo (restricción armónica).
- **Barras colectoras (87B)**: zona definida por todos los TC de los circuitos que llegan a la
  barra; muy exigente porque un disparo indebido saca de servicio toda la barra (alta
  penalización por falta de seguridad/security), pero es indispensable para despejar fallas de
  barra rápidamente dado el altísimo nivel de cortocircuito ahí concentrado.

---

## 4. Protección de distancia (21)

Usada predominantemente en **líneas de transmisión de alta y extra alta tensión**, donde tender un
canal de comunicación dedicado para diferencial en toda la red no siempre es económico o donde se
requiere una protección robusta que funcione incluso si el canal de comunicación falla.

### Principio: impedancia aparente

El relé mide tensión (V, de un TP) y corriente (I, de un TC) en su ubicación y calcula la
**impedancia aparente** `Z = V / I`. Dado que la impedancia de una línea de transmisión es
aproximadamente proporcional a su longitud (Ω/km casi constante), la impedancia medida es un
indicador directo de **qué tan lejos** está la falla — de ahí "protección de distancia": el relé
no mide distancia física, infiere una distancia eléctrica a partir de una caída de impedancia
repentina cuando ocurre un cortocircuito (la impedancia normal de carga es mucho mayor que la de
una falla franca).

### Zonas de alcance y tiempos escalonados

La práctica estándar de la industria usa múltiples zonas concéntricas, cada una con mayor alcance
y mayor retardo:

| Zona | Alcance típico | Tiempo típico | Propósito |
|---|---|---|---|
| Zona 1 | 80–85% de la línea protegida | Instantáneo (sin retardo intencional) | Despeje ultrarrápido de fallas claramente dentro de la línea propia |
| Zona 2 | 115–150% de la línea (cubre la línea completa + margen sobre la próxima) | ~0.2–0.3 s (retardo corto) | Cubre el 15–20% final de la línea que Zona 1 deja fuera por margen de error, y respalda el primer tramo de la línea siguiente |
| Zona 3 | Alcanza significativamente hacia líneas adyacentes | ~1 s | Respaldo remoto de líneas vecinas |

Zona 1 se limita deliberadamente al 80–85% (nunca 100%) porque errores de medición de TC/TP,
imprecisión de los parámetros de línea usados en el cálculo, y el aporte de corriente de fuentes
intermedias (infeed) podrían hacer que el relé "vea" una falla justo fuera de su línea como si
estuviera dentro, y dispare indebidamente sin coordinación — un fallo de security. El 15-20%
restante (y el respaldo del sistema adyacente) queda cubierto por Zona 2 y 3 con retardo, que sí
da tiempo a que la protección primaria del tramo vecino actúe primero si la falla es de él.

---

## 5. Código de dispositivos ANSI/IEEE C37.2 — el lenguaje estándar de la industria

La norma **IEEE C37.2** asigna un número estándar a cada función de protección/control, permitiendo
que ingenieros de cualquier fabricante o país lean un diagrama unifilar sin ambigüedad. Los
números relevantes para esta investigación:

| Número | Función |
|---|---|
| 21 | Protección de distancia |
| 27 | Relé de baja tensión (undervoltage) |
| 50 | Sobrecorriente instantánea |
| 51 | Sobrecorriente de tiempo (temporizada) |
| 59 | Relé de sobretensión (overvoltage) |
| 67 | Sobrecorriente direccional |
| 79 | Relé de recierre automático (auto-reclosing) |
| 87 | Protección diferencial |

Es común ver combinaciones en la nomenclatura de placas de relés reales, p. ej. "50/51" para un
mismo elemento que ofrece ambas funciones (instantánea + temporizada) sobre la misma señal de
corriente, o "87T" / "87L" / "87B" para diferenciar la aplicación (transformador, línea, barra) de
la función diferencial genérica (87).

---

## 6. El lazo de protección completo — de la señal física al disparo

Físicamente, la cadena de protección de un circuito de alta tensión es:

1. **TC y TP** (sección 3.4 de `IDEA.md`) reducen la corriente y tensión primarias de miles de A /
   cientos de kV a señales estándar y seguras de manipular (típicamente 1 A o 5 A, y ~110-120 V).
2. El **relé de protección** — hoy casi universalmente un **IED (Intelligent Electronic Device)**,
   un dispositivo microprocesado que digitaliza esas señales (muestreo a alta frecuencia,
   típicamente 16–32 muestras/ciclo), calcula fasores/RMS y ejecuta los algoritmos de protección
   (50/51, 87, 21, etc.) en software, generalmente varios en el mismo chasis físico (protección
   multifunción).
3. Si el algoritmo determina que hay una falla dentro de su zona y ajuste, el IED energiza una
   salida de contacto (o mensaje digital, ver IEC 61850) que alimenta la **bobina de disparo (trip
   coil)** del interruptor de potencia.
4. La bobina de disparo libera mecánicamente el mecanismo de resorte/muelle del interruptor, que
   abre los contactos principales en unos pocos ciclos (típicamente 2–3 ciclos ≈ 33-50 ms a 60 Hz,
   40-50 ms a 50 Hz — ver sección 3.2 de `IDEA.md`), extinguiendo el arco en el medio dieléctrico
   correspondiente (SF6, vacío).

El **tiempo total de despeje de falla** es la suma del tiempo de operación del relé + tiempo de
apertura del interruptor, y es este número compuesto el que en última instancia determina la
severidad del daño térmico/dinámico y el impacto en estabilidad del sistema — por eso ambos
componentes (velocidad de detección Y velocidad de interrupción) importan conjuntamente.

Por redundancia crítica, en subestaciones de EAT es común duplicar el lazo completo (protección
primaria y protección de respaldo local, cada una con su propio IED, y a veces hasta su propio
banco de TC secundario), de modo que la falla de un solo IED, batería de control, o bobina de
disparo no deje el circuito sin protección.

---

## 7. IEC 61850 — el estándar moderno de la subestación digital

En subestaciones tradicionales, cada señal (estado de interruptor, orden de disparo, alarma) viaja
por un cable de cobre dedicado, punto a punto, entre el patio de conexiones y la sala de control —
miles de metros de cableado por subestación, con el costo, complejidad de mantenimiento y riesgo
de falla que eso implica.

**IEC 61850** estandariza la comunicación entre IED usando Ethernet, permitiendo que dispositivos
de distintos fabricantes interoperen bajo un mismo modelo de datos. El mecanismo más relevante
para protección es **GOOSE (Generic Object-Oriented Substation Event)**: un servicio de mensajería
tipo publicador-suscriptor, multicast a nivel de capa 2, orientado a eventos — cuando el estado de
un dispositivo cambia (p. ej. "disparo enviado", "interruptor abierto"), el IED publica
inmediatamente el mensaje sin esperar ciclos de sondeo (polling), logrando tiempos de entrega del
orden de milisegundos, comparables o mejores que el cableado de cobre físico. Esto permite
esquemas de protección adicionales que antes requerían cableado dedicado (p. ej. bloqueo/disparo
transferido entre extremos de una línea, enclavamientos entre interruptores) implementados como
mensajes GOOSE sobre la misma red Ethernet del patio de subestación — reduciendo drásticamente el
cableado de cobre físico sin sacrificar velocidad ni confiabilidad, cuando la red está bien
diseñada (redundancia de red, PRP/HSR).

---

## 8. Puntos clave para la simulación educativa

1. **Zonas de protección superpuestas — representación visual**: modelar cada zona (línea,
   transformador, barra) como un volumen translúcido de color distinto en la escena 3D, delimitado
   exactamente por la posición de los TC/TP reales del modelo (no de forma arbitraria). Mostrar
   explícitamente el traslape en el interruptor entre dos zonas adyacentes — es un punto pedagógico
   que suele confundirse ("¿por qué dispararon dos relés a la vez?").

2. **Curva TCC interactiva**: un panel 2D superpuesto (no 3D) con ejes log-log tiempo vs. corriente,
   donde el usuario pueda: (a) elegir familia de curva (SI/VI/EI) y ver cómo cambia la forma; (b)
   arrastrar el TDS/dial y ver la curva desplazarse verticalmente; (c) apilar dos curvas (relé
   aguas arriba/aguas abajo) y visualizar el margen de coordinación (CTI) como una franja
   sombreada entre ambas, marcando en rojo si el margen cae por debajo de ~0.2–0.3 s en algún
   punto — feedback inmediato de "coordinación inválida".

3. **Secuencia completa falla → detección → disparo selectivo** (ya anticipada en la fila de la
   tabla de la sección 7 de `IDEA.md`): animación temporizada en la escena 3D con las siguientes
   etapas visibles y con su tiempo real aproximado etiquetado:
   - t=0: falla inyectada (chispazo/arco visual en el punto de falla).
   - t≈1 ciclo: TC/TP "ven" la sobrecorriente/hundimiento de tensión — resaltar el flujo de señal
     TC→IED con una línea animada.
   - t≈1-2 ciclos (87) o según curva TCC (50/51) o zona (21): el IED decide disparo — mostrar el
     IED "iluminándose" y el cálculo relevante (ΔI para diferencial, t(I) para sobrecorriente,
     Z=V/I para distancia) en un tooltip.
   - Señal de disparo viaja a la bobina de disparo (representar como pulso a lo largo de un cable
     resaltado, o como mensaje GOOSE si se modela una subestación digital).
   - Apertura del interruptor (2-3 ciclos) con extinción de arco.
   - Mostrar en paralelo, en el mismo instante, qué otras protecciones "vieron" la falla pero NO
     dispararon (relés de respaldo esperando su margen de coordinación) — refuerza visualmente el
     concepto de selectividad vs. respaldo, que es el corazón conceptual de todo el tema.

---

## Fuentes

- [ANSI/IEEE C37.2 Device Numbers — APT Power (lista completa oficial de números de función)](https://www.apt-power.com/wp-content/uploads/ANSI-IEEE-C37.2-List-of-Standard-Device-Numbers-for-Relay-Protection-APT-Power-1.pdf)
- [The 2008 Revision of IEEE C37.2 Standard — Tengdin, John (WPRC archives, paper técnico sobre la revisión de la norma)](https://wprcarchives.org/wp-content/uploads/2024/07/Tengdin_John_Standard-Electrical-Power-System-Device-Function-Numbers-Acronyms-and-Contact-Designations_2009.pdf)
- [Protection and Control Device Numbers - IEEE Std C37.2 — Dowei Electric](https://www.dowei-electric.com/technical/116.html)
- [Maximizing Line Protection Reliability, Speed, and Sensitivity — Schweitzer Engineering Laboratories (SEL), paper técnico IEEE PES](https://cdn.selinc.com/assets/Literature/Publications/Technical%20Papers/6711_MaximizingLine_DT_20160208_Web3.pdf)
- [The art of fault clearance in transmission systems: main and backup relay logic — EEP (Electrical Engineering Portal)](https://electrical-engineering-portal.com/fault-clearance-transmission-systems-logic-main-backup-relays)
- [Substation Protection Guide — Protective Relaying Fundamentals — Keentel Engineering](https://keentelengineering.com/substation-protection-fundamentals)
- [Time-Current Characteristic (TCC) Curves — S&C Electric Company](https://www.sandc.com/en/contact-us/time-current-characteristic-curves/)
- [Plot Protective Relay TCC Curves: IEC/IEEE Equations Guide — Industrial Monitor Direct](https://industrialmonitordirect.com/blogs/knowledgebase/drawing-tcc-curves-for-protective-relays-using-iecieee-equations)
- [Overcurrent Protection Coordination Methodology — CTI, IDMT Curves, and Selectivity — ecalpro.com](https://ecalpro.com/docs/protection-coordination-methodology)
- [Differential (87) Current Protection — control.com, Electric Power Measurement and Control Systems textbook](https://control.com/textbook/electric-power-measurement-and-control/differential-87-current-protection/)
- [Useful Applications for Differential Relays With Both KCL and ATB 87 Elements — SEL](https://selinc.com/api/download/139349/?lang=en)
- [Fundamentals of Short-Circuit Protection for Transformers — SEL](https://selinc.com/api/download/7263/)
- [Transformer Differential Protection (ANSI 87T) — Working Principle, Function & Setting Calculation — SmartElec](https://www.smartelecmfg.com/Protection-Relay/technical/transformer-differential-protection%EF%BC%88ansi-87t%EF%BC%89/)
- [Considerations and Benefits of Using Five Zones for Distance Protection — SEL](https://selinc.com/api/download/122907/)
- [Distance Protection — CED Engineering (curso PDH, E04-034)](https://www.cedengineering.com/userfiles/E04-034%20-%20Distance%20Protection%20-%20US.pdf)
- [Principles and Characteristics of Distance Protection — EEP](https://electrical-engineering-portal.com/principles-characteristics-distance-protection)
- [IEC 61850 Digital Substation Design — Keentel Engineering](https://keentelengineering.com/digital-substation-design-and-automation-with-iec-61850)
- [ComEd Uses IEC61850 GOOSE Messaging — T&D World](https://www.tdworld.com/substations/article/21270807/comed-uses-iec61850-goose-messaging)
- [IEC 61850 GOOSE messaging and how to test it for substation automation projects — OPAL-RT Technologies](https://www.opal-rt.com/blog/iec-61850-goose-messaging-and-how-to-test-it-for-substation-automation-projects/)
- J. Lewis Blackburn & Thomas J. Domin, *Protective Relaying: Principles and Applications* (CRC Press) — libro de referencia citado como base conceptual de selectividad, dependability/security, y zonas de protección, consistente con el contenido resumido en las fuentes web anteriores.
