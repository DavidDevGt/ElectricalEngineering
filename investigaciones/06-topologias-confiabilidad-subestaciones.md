# Topologías de barras (bus configurations) y confiabilidad de subestaciones de potencia

> Investigación de soporte para el simulador 3D de subestaciones de AT (ver `IDEA.md`, sección 5).
> Objetivo: fundamentar con rigor de ingeniería el "modo diseñador" en el que el usuario arma
> topologías de barras con piezas modulares y evalúa su confiabilidad ante fallas.

---

## 1. Las seis topologías: descripción técnica

Todas las topologías resuelven el mismo problema — interconectar N circuitos (líneas de
transmisión, transformadores, generadores) a través de barras colectoras usando interruptores
(circuit breakers) y seccionadores (disconnect switches) — pero con distintas relaciones
costo/confiabilidad. La variable estructural clave es el **número de interruptores por circuito**,
que es el principal impulsor de costo (cada interruptor de AT/EAT cuesta del orden de cientos de
miles a más de un millón de USD, sin contar obra civil, protecciones y patio adicional).

### 1.1 Barra simple (single bus)

**Arreglo físico**: todos los circuitos (líneas, transformadores) se conectan a **una sola barra**
mediante un interruptor y seccionadores de línea y de barra propios. 1 interruptor por circuito —
la configuración más económica posible.

**Comportamiento ante falla/mantenimiento**: una falla en la barra, o el mantenimiento de la
propia barra, obliga a desenergizar **todos** los circuitos conectados — corte total de la
subestación. El mantenimiento de un interruptor individual también deja sin servicio a su circuito
(no hay trayectoria alterna). Es la topología con menor confiabilidad de las seis.

**Uso típico**: subestaciones de distribución pequeñas o puntos de carga donde el costo de
interrupción es bajo y aceptable.

### 1.2 Barra principal + barra de transferencia (main and transfer bus)

**Arreglo físico**: una barra principal (main bus) donde cada circuito tiene su interruptor normal,
más una **barra de transferencia** (transfer bus) paralela, conectada a la principal a través de un
único **interruptor de transferencia** (bus tie breaker) y a cada circuito mediante un seccionador
de transferencia.

**Maniobra de mantenimiento**: para sacar de servicio el interruptor de un circuito sin cortar el
suministro, se cierra el interruptor de transferencia y sus seccionadores, se cierra el seccionador
de transferencia del circuito objetivo, y solo entonces se abre el interruptor bajo mantenimiento
y sus seccionadores — el circuito queda protegido temporalmente por el interruptor de
transferencia. Esto permite mantenimiento de interruptores **sin interrumpir circuitos**, pero
**no mejora la confiabilidad ante falla de barra**: una falla en la barra principal sigue tumbando
toda la subestación (la barra de transferencia no es una barra "en paralelo" operativa, solo un
respaldo de interruptor).

**Uso típico**: subestaciones de distribución/subtransmisión donde se valora poder mantener
interruptores sin cortes, pero el costo de una segunda barra completa no se justifica.

### 1.3 Barra doble, un interruptor (double bus, single breaker)

**Arreglo físico**: dos barras principales unidas por un interruptor de acople (bus tie breaker).
Cada circuito tiene **un solo interruptor**, pero mediante dos seccionadores puede conectarse a
cualquiera de las dos barras. Permite repartir cargas/fuentes entre ambas barras y aislar una
barra para mantenimiento transfiriendo manualmente los circuitos a la otra.

**Comportamiento**: el cambio de barra de un circuito requiere maniobra manual (no es automático
ni instantáneo), y durante el cambio el circuito puede quedar momentáneamente sin la protección de
respaldo de barra. Comparte varias limitaciones operativas con la barra simple seccionada, porque
sigue habiendo un solo interruptor por circuito — su falla saca el circuito de servicio igual.

**Uso típico**: subestaciones de transmisión donde se busca separar fuentes/cargas entre dos
secciones eléctricas sin llegar al costo de doble interruptor.

### 1.4 Anillo (ring bus)

**Arreglo físico**: los interruptores se disponen formando un **anillo cerrado**; cada circuito se
conecta entre dos interruptores adyacentes del anillo. No existe una "barra" central en el sentido
tradicional — el anillo mismo cumple esa función. Cada circuito queda alimentado por **dos
trayectorias** (sentido horario y antihorario del anillo), y cada interruptor pertenece a dos
circuitos adyacentes, dando un promedio de **1 interruptor por circuito** (igual costo nominal que
barra simple, pero con redundancia de trayectoria).

**Comportamiento ante falla**: la falla de un circuito o de un interruptor abre solo los dos
interruptores adyacentes a ese punto, aislando el elemento fallado sin perder los demás circuitos
— el resto de la potencia sigue fluyendo por el lado no afectado del anillo. El mantenimiento de
cualquier interruptor se hace abriendo ese interruptor y los seccionadores de línea del circuito
afectado momentáneamente, pero típicamente el circuito puede seguir energizado desde el lado
contrario mientras se mantiene abierto solo el interruptor en cuestión (dependiendo del punto).

**Limitación importante**: la confiabilidad del anillo **decrece a medida que crece el número de
circuitos conectados**, porque no hay interruptores dedicados por circuito — una falla de
interruptor puede sacar dos posiciones/circuitos a la vez, y si el anillo crece demasiado (más de
~6–8 posiciones) el riesgo de que el anillo quede "partido" en dos secciones aumenta. Por norma de
buena práctica, **no deben terminarse fuentes de generación o circuitos redundantes en posiciones
adyacentes** del anillo, para evitar que una sola falla de interruptor deje sin ambas fuentes al
mismo tiempo.

**Uso típico**: subestaciones de transmisión medianas (hasta ~6 circuitos) — buen equilibrio
costo/confiabilidad.

### 1.5 Interruptor y medio (breaker-and-a-half)

**Arreglo físico**: dos barras principales; entre ellas se disponen **cadenas de tres
interruptores en serie**, y **dos circuitos** se conectan, uno entre el interruptor "de barra 1" y
el interruptor central, y el otro entre el interruptor central y el interruptor "de barra 2". El
interruptor central es compartido por los dos circuitos → **1.5 interruptores por circuito** (para
4 circuitos se requieren 6 interruptores). Existen dos variantes de disposición física: convencional
(las líneas cruzan por encima de las barras) y "folded" (las líneas quedan hacia afuera de las
barras, reduciendo el patio requerido).

**Comportamiento ante falla de barra**: una falla en cualquiera de las dos barras principales
**no interrumpe ningún circuito** — el circuito sigue alimentado a través de la barra sana usando
los interruptores restantes de su cadena. Esta es la propiedad distintiva del esquema.

**Comportamiento ante falla de interruptor**: si falla el interruptor central (compartido), se
pierden **los dos circuitos** de esa cadena hasta que se despeje; si falla un interruptor externo
(el que conecta directo a una barra), se pierde **solo un circuito**.

**Mantenimiento**: cualquier interruptor —incluido el central— puede sacarse de servicio para
mantenimiento **sin interrumpir ningún circuito**, porque los dos interruptores restantes de la
cadena mantienen la alimentación. Igualmente, cualquiera de las dos barras puede desenergizarse
completamente para mantenimiento sin cortar servicio. Es, junto con la doble barra/doble
interruptor, la topología de mayor flexibilidad operativa.

**Uso típico**: subestaciones de transmisión/EAT de alta importancia sistémica (nodos críticos de
la red, centrales de generación grandes) donde el costo adicional (aprox. 50 % más interruptores
que barra simple) se justifica por el valor de no interrumpir servicio y la criticidad de N-1/N-2.

### 1.6 Doble barra, doble interruptor (double bus, double breaker)

**Arreglo físico**: dos barras principales; cada circuito tiene su **propio par de interruptores
dedicados**, uno hacia cada barra → **2 interruptores por circuito**, el máximo de las seis
topologías.

**Comportamiento**: ante una falla de barra, solo se pierde momentáneamente la conexión de esa
barra —cada circuito sigue alimentado por el interruptor hacia la barra sana—, sin ninguna
interrupción de circuitos. Ante falla de un interruptor, solo se ve afectado el circuito propio
brevemente (el otro interruptor de ese mismo circuito mantiene el suministro). Cualquier
interruptor o barra puede mantenerse sin afectar ningún circuito. Es la configuración de mayor
confiabilidad y también la de mayor costo — normalmente el doble que barra simple en número de
interruptores, además de duplicar seccionadores y protecciones asociadas.

**Uso típico**: reservada a nodos de generación extremadamente críticos o subestaciones de EAT de
importancia estratégica nacional; rara vez se justifica económicamente en subestaciones
convencionales de transmisión, donde interruptor-y-medio ofrece casi la misma confiabilidad a
menor costo.

---

## 2. Métricas de confiabilidad usadas en la industria

Los estudios de confiabilidad de subestaciones (metodología típica: cadenas de Markov o árboles de
fallas, ej. herramienta SAPHIRE del Idaho National Laboratory) usan estas métricas centrales:

- **Tasa de falla (λ, failure rate)**: número esperado de fallas por año de un componente
  (interruptor, seccionador, tramo de barra). Se obtiene de datos históricos de operación —la
  referencia industrial clásica es el **IEEE Std 493 ("Gold Book") — Recommended Practice for the
  Design of Reliable Industrial and Commercial Power Systems**, que recopila tasas de falla y
  tiempos de reparación observados en encuestas de plantas industriales y comerciales (la encuesta
  original data de 1972, con actualizaciones posteriores; el estándar está hoy clasificado por el
  IEEE como "inactive-reserved", pero sus tablas de λ y MTTR siguen siendo la referencia más citada
  del sector).
- **Tiempo medio de reparación (MTTR, Mean Time To Repair)**: horas promedio para restaurar un
  componente fallado a servicio. El Gold Book reporta valores representativos de componentes
  eléctricos con MTTR del orden de horas para reparaciones simples hasta días para reemplazo de
  equipo mayor (transformadores de potencia, interruptores de AT dañados).
- **Disponibilidad (availability)**: `A = MTTF / (MTTF + MTTR)` (o equivalentemente
  `A = 1 - λ·MTTR / 8760` en aproximación para tasas bajas), fracción del tiempo que el elemento
  está en servicio.
- **Frecuencia esperada de interrupción (expected interruption frequency)**: veces por año que un
  circuito específico queda fuera de servicio, considerando fallas propias y fallas de elementos
  compartidos (barra, interruptor adyacente en anillo o interruptor central en interruptor-y-medio).
- **Duración esperada de interrupción (expected interruption duration)**: producto de la
  frecuencia de interrupción por el MTTR del elemento causante — el indicador que finalmente le
  importa al usuario final (horas/año sin servicio).

Estas métricas se combinan mediante **diagramas de bloques de confiabilidad (RBD)** o modelos de
Markov de estados (elemento en servicio / en falla / en mantenimiento), resolviendo la topología
específica de interruptores y barras como un circuito lógico serie-paralelo. El punto central para
el simulador: **la topología determina qué combinaciones de fallas de componentes individuales se
traducen en pérdida de un circuito** — es exactamente el cálculo que un "modo diseñador" puede
reproducir de forma simplificada y visual.

---

## 3. Comparación cuantitativa entre topologías

| Topología | Interruptores/circuito | Costo relativo | Mantenimiento sin corte | Vulnerabilidad N-1 | Vulnerabilidad N-2 |
|---|---|---|---|---|---|
| Barra simple | 1 | Muy bajo (base = 1×) | No (falla de barra o interruptor corta el circuito) | Alta — falla de barra tumba todo | Catastrófica |
| Principal + transferencia | 1 (+1 compartido) | Bajo-medio (~1.1–1.2×) | Sí, solo interruptores (no barra) | Alta ante falla de barra principal | Alta |
| Doble barra, 1 interruptor | 1 | Medio (~1.2–1.3×) | Parcial (requiere maniobra manual de transferencia) | Media | Alta |
| Anillo | ~1 (compartido) | Medio (~1.3×) | Sí, para interruptores individuales | Baja para redes pequeñas, sube con más posiciones | Puede partir el anillo |
| Interruptor y medio | 1.5 | Alto (~1.5×) | Sí, interruptores y barras | Muy baja (ningún circuito se pierde por falla de barra) | Baja (solo cae 1–2 circuitos si falla el central) |
| Doble barra, doble interruptor | 2 | Muy alto (~2×) | Sí, total | Mínima | Mínima |

El costo relativo escala aproximadamente con el número de interruptores por circuito, que es la
proxy estándar de costo de capital en literatura de planeación (cada interruptor de AT/EAT incluye
también sus propios TCs, relés, obra civil y patio, por lo que el múltiplo de costo real suele ser
mayor al múltiplo de interruptores puro).

La vulnerabilidad **N-1** (pérdida de un único elemento) es donde barra-simple y anillo grande
fallan peor: en barra simple cualquier falla de barra es N-1 catastrófico; en un anillo con muchas
posiciones, la falla de un solo interruptor puede sacar dos circuitos, y en el peor caso partir el
anillo en dos mitades desconectadas si coincide con otra apertura. La vulnerabilidad **N-2**
(doble contingencia) es donde interruptor-y-medio muestra su punto débil real: la falla del
interruptor **central compartido** saca **dos** circuitos simultáneamente, algo que doble barra/doble
interruptor no sufre porque no hay ningún elemento compartido entre circuitos.

---

## 4. El criterio de contingencia N-1 en planeación de transmisión

El criterio **N-1**, base de los estándares de planeación de NERC (TPL) en Norteamérica y de
criterios equivalentes en Europa (ENTSO-E) y Latinoamérica, exige que el sistema de transmisión
permanezca **estable y sirviendo toda la demanda** ante la pérdida súbita de **cualquier elemento
único** de la red — una línea, un transformador, un generador, o un interruptor/barra de
subestación — sin que se produzcan cortes de carga, sobrecargas sostenidas ni colapso de tensión.
Es decir: el sistema se diseña y opera de modo que "N" elementos disponibles menos "1" (el que
falla) sigan siendo suficientes para mantener el servicio.

Una extensión operativa usada por varios operadores de sistema (ISO-NE, MISO) es el criterio
**N-1-1**: tras una primera contingencia, el sistema debe recuperar la condición N-1 (es decir,
quedar preparado para soportar una segunda pérdida) dentro de una ventana de tiempo definida para
ajustes del operador (típicamente 30 minutos), reconociendo que en la práctica las contingencias no
siempre son simultáneas sino consecutivas.

**Relevancia directa para topología de barras**: el criterio N-1 aplicado a nivel de subestación es
exactamente la pregunta que cada topología responde distinto. En barra simple, la "barra" en sí
misma es un elemento único cuya pérdida viola N-1 para todos los circuitos conectados
simultáneamente — por eso las subestaciones de transmisión que alimentan cargas críticas casi nunca
usan barra simple. En interruptor-y-medio y doble barra/doble interruptor, ningún elemento único
(barra o interruptor, salvo el central compartido en interruptor-y-medio) puede sacar más de un
circuito — de ahí que sean las topologías obligatorias en nodos de EAT donde el N-1 de subestación
es un requisito normativo, no una opción de diseño.

---

## 5. Casos de uso reales por nivel de tensión

- **Distribución (BT/MT)**: barra simple o barra simple seccionada. El costo de interrupción por
  cliente es relativamente bajo y hay redundancia aguas abajo (reconfiguración de alimentadores),
  por lo que no se justifica una topología más cara en cada subestación de distribución.
- **Subtransmisión / distribución con exigencia de continuidad (hospitales, industria)**: principal
  + transferencia, o doble barra con un interruptor — permiten mantenimiento de interruptores sin
  cortar servicio a un costo moderado.
- **Transmisión (AT, 115–230 kV típico)**: anillo, para subestaciones con hasta ~6 circuitos —
  buen equilibrio confiabilidad/costo, ampliamente usado en nodos de transmisión regional.
- **Transmisión / EAT (345 kV y superiores) y nodos críticos de la red**: interruptor-y-medio es el
  estándar de facto en Norteamérica para subestaciones de EAT y para centrales de generación
  grandes que inyectan a la red de transmisión troncal, precisamente porque garantiza N-1 de
  subestación (ninguna falla de barra o de interruptor individual, salvo el central compartido,
  saca más de un circuito) mientras mantiene el costo por debajo de doble barra/doble interruptor.
- **Generación / nodos de máxima criticidad estratégica**: doble barra + doble interruptor,
  reservado a los pocos casos donde el valor de la energía no servida o el riesgo sistémico
  justifica el costo casi doble en interruptores — grandes centrales nucleares o hidroeléctricas
  conectadas directamente a la red troncal.

---

## 6. Caso de estudio: apagón de Suecia meridional y Dinamarca oriental, 23 de septiembre de 2003

Este apagón —el más severo en 20 años en el sistema nórdico en su momento, dejó sin servicio a
partes del sur de Suecia y el este de Dinamarca (incluyendo Copenhague), afectando a millones de
personas— es un ejemplo documentado donde una **falla de doble barra en una subestación** jugó un
papel decisivo en la cascada.

Secuencia (según el informe conjunto de los operadores de sistema, ampliamente citado en literatura
IEEE PES): a las 12:30, la unidad 3 de la central nuclear de Oskarshamn se desconectó por un
problema técnico en una válvula del circuito de agua de alimentación, retirando cerca de 1200 MW de
generación. Esta era una contingencia simple (N-1) para la que el sistema nórdico estaba diseñado,
y la reserva rodante estabilizó la frecuencia dentro de límites normales en los minutos siguientes.
Sin embargo, pocos minutos después ocurrió una **falla en doble barra** en una subestación clave del
sur de Suecia, lo que provocó la pérdida simultánea de varias líneas de transmisión conectadas a
esa subestación y el disparo en cascada de unidades de generación adicionales — una segunda
contingencia que, combinada con la primera, excedió los criterios de diseño N-1 del sistema y
resultó en colapso de tensión y apagón regional.

La lección técnica —consistente con lo desarrollado en las secciones 1 y 4 de este documento— es
que una falla que afecta **ambas barras simultáneamente** en una subestación de doble barra anula
precisamente la propiedad de redundancia que esa topología debería ofrecer: si el modo de falla
compromete las dos barras a la vez (por ejemplo, un fallo de protección o un elemento de
acoplamiento compartido), el sistema efectivamente se comporta como si tuviera barra simple en ese
nodo, y la "doble contingencia" real terminó siendo, en la práctica, una contingencia N-1 de
subestación no anticipada por el criterio N-1 de elemento único de la red de transmisión.

---

## 7. Puntos clave para la simulación educativa

Para el "modo constructor" descrito en `IDEA.md` §5 y §7, la investigación anterior sugiere el
siguiente diseño concreto:

1. **Piezas modulares mínimas**: interruptor (breaker), seccionador (disconnect), tramo de barra
   (bus segment), y "circuito" (línea/transformador entrante). El usuario los conecta en el patio
   3D siguiendo las reglas de cada topología (ej. el sistema puede ofrecer plantillas iniciales de
   las 6 topologías y dejar que el usuario las modifique).

2. **Modelo de dominio como grafo, no solo geometría 3D**: representar la subestación como un grafo
   donde los nodos son barras/circuitos y las aristas son interruptores/seccionadores con estado
   (cerrado/abierto/en falla). Esto permite calcular conectividad con un algoritmo simple de
   componentes conexos tras "remover" un elemento fallado — exactamente el mismo principio que un
   RBD (reliability block diagram) simplificado.

3. **Motor de simulación de falla aleatoria**: 
   - El usuario (o el sistema) selecciona un elemento para fallar (interruptor, tramo de barra,
     seccionador).
   - El motor "abre" ese elemento y, si corresponde por lógica de protección, también los
     interruptores adyacentes necesarios para aislar la falla (replicando el comportamiento real:
     en anillo se abren los dos interruptores vecinos; en interruptor-y-medio se abre la cadena
     completa si falla el interruptor central).
   - Se recalculan los componentes conexos del grafo resultante y se listan los circuitos que
     perdieron **todas** sus trayectorias hacia una fuente — esos son los "circuitos fuera de
     servicio".

4. **Comparación lado a lado**: aplicar la **misma falla** (mismo elemento, ej. "falla en el tramo
   de Barra 1") a las 6 topologías pre-armadas y mostrar cuántos circuitos caen en cada una — esto
   convierte directamente la tabla cualitativa de la sección 3 en una demostración interactiva y
   memorable, mucho más pedagógica que la tabla estática.

5. **Métricas simples que el usuario puede ver crecer/bajar en vivo**: número de interruptores
   usados (proxy de costo), número de circuitos afectados por la última falla simulada, y un
   contador acumulado de "fallas simuladas sin interrupción" vs. "con interrupción" para que el
   usuario intuya la diferencia entre N-1 robusto y N-1 frágil sin necesitar entender Markov chains.

6. **Modo "romper la topología"**: dejar que el usuario arme una topología inválida o subóptima
   (ej. un anillo con las dos fuentes de generación en posiciones adyacentes, violando la regla de
   buena práctica de la sección 1.4) y que la simulación de falla aleatoria le muestre por qué esa
   configuración es mala — refuerza la regla mucho mejor que explicarla en texto.

7. **Anclar el costo relativo de la tabla de la sección 3** (multiplicador de interruptores) como
   un "presupuesto" que el usuario gasta al construir, para que la disyuntiva costo vs.
   confiabilidad sea una decisión de diseño explícita y no solo informativa.

---

## Fuentes

- [Six common bus configurations in substations up to 345 kV — EEP (Electrical Engineering Portal)](https://electrical-engineering-portal.com/bus-configurations-substations-345-kv)
- [Electrical Substation Configuration Effect on Substation Reliability (OSTI / Idaho National Laboratory)](https://www.osti.gov/biblio/1968318)
- [Substation Bus Configuration / Scheme: The Definitive Guide — StudyElectrical](https://studyelectrical.com/2019/10/substation-bus-configurations.html)
- [Ring Bus Configuration Overview and Benefits — CAI Engineering](https://www.cai-engr.com/about/blog/1280/substation-bus-schemes-ring-breaker-and-a-half-and-single-bus)
- [Substation Bus Arrangements Explained: Radial, Ring, and Breaker-and-a-Half Designs Compared — Beta Engineering](https://www.betaengineering.com/news/substation-bus-arrangements-explained-radial-ring-and-breaker-and-a-half-designs-compared)
- [Maximize Substation Reliability with Breaker-And-Half Scheme — Helios Electric](https://www.helioselectric.net/blog/breaker-half-scheme)
- [IEEE Std 493-2007 — Recommended Practice for the Design of Reliable Industrial and Commercial Power Systems (Gold Book) — ANSI/IEEE Store](https://webstore.ansi.org/standards/ieee/ieeestd4932007)
- [Design of Reliable Industrial and Commercial Power Systems IEEE Std 493-2007 (Academia.edu)](https://www.academia.edu/25993060/Design_of_Reliable_Industrial_and_Commercial_Power_Systems_IEEE_Std_493_2007)
- [Electrical Equipment Failure Rate Benchmarks and Their Limits — Reliamag](https://reliamag.com/maintenance-and-reliability/electrical-equipment-failure-rate-benchmarks/)
- [NERC TPL Reliability Standards — FERC RM12-1-000](https://www.ferc.gov/sites/default/files/2020-04/E-2_6.pdf)
- [ISO New England Transmission Planning Technical Guide](https://www.iso-ne.com/static-assets/documents/2014/12/planning_technical_guide_2014-12-2_clean.pdf)
- [N-1-1 AC Contingency Analysis as Part of NERC Compliance Studies at Midwest ISO (ResearchGate)](https://www.researchgate.net/publication/224145412_N-1-1_AC_contingency_analysis_as_a_part_of_NERC_compliance_studies_at_midwest_ISO)
- [The Black-out in Southern Sweden and Eastern Denmark, September 23, 2003 (IEEE Xplore)](https://ieeexplore.ieee.org/document/4075763/)
- [The Black-out in Southern Sweden and Eastern Denmark, September 23, 2003 (ResearchGate)](https://www.researchgate.net/publication/224754868_The_black-out_in_southern_Sweden_and_eastern_Denmark_September_23_2003)
- [Energy Advisory Committee — Loss of Electricity Supply Incident Affecting Denmark and Sweden (Hong Kong EMSD report)](https://www.eeb.gov.hk/sites/default/files/en/node74/Europe02.pdf)
- [The 1983 and 2003 Blackouts in Sweden — Daniel Karlsson, Chalmers (SESBC)](https://www.sesbc.se/media/qdyharrx/daniel-karlsson-chalmers.pdf)
