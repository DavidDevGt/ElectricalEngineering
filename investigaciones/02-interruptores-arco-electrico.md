# Interruptores de potencia y física del arco eléctrico de interrupción

## 1. Física del arco eléctrico: por qué se forma y cómo se comporta

Cuando los contactos de un interruptor se separan mientras circula corriente, el último punto de contacto metálico se estrecha hasta una sección microscópica. La densidad de corriente en ese punto crece hasta valores del orden de 10⁶ A/cm², lo que funde y luego vaporiza el metal del contacto. El vapor metálico y el gas circundante se ionizan térmicamente por el intensísimo calentamiento óhmico, y el espacio entre contactos se convierte en un canal de **plasma** — un gas altamente conductor formado por electrones libres, iones positivos y partículas neutras — que permite que la corriente siga circulando "a través del aire" en forma de arco.

Este plasma no es un simple espacio vacío de aislación: es un conductor con temperaturas de núcleo típicamente entre 15.000 °C y 20.000 °C (más caliente que la superficie del Sol, ~5.500 °C) para arcos de falla de varios kA ([ScienceDirect, *Arc Plasma*](https://www.sciencedirect.com/topics/engineering/arc-plasma); [Viox, *What is an Arc in a Circuit Breaker?*](https://viox.com/what-is-an-arc-in-a-circuit-breaker/)). La tensión en el arco es relativamente baja (típicamente 20–60 V, dependiente de la longitud del arco y su corriente), pero la potencia disipada como calor Joule puede llegar a decenas de miles de kilowatts cuando se interrumpen corrientes de falla de decenas de kA.

Una propiedad crucial del arco es su **resistencia dinámica no lineal**: a diferencia de una resistencia óhmica normal, la resistencia del arco *aumenta* a medida que la corriente disminuye — es decir, el arco presenta una característica de "resistencia negativa" respecto al tiempo dentro del semiciclo. Este comportamiento se modela clásicamente con dos ecuaciones diferenciales complementarias:

- **Modelo de Cassie** (balance de energía, válido para arcos de alta corriente): supone que la conductancia del arco es proporcional al balance entre potencia disipada y potencia de entrada, con temperatura de canal casi constante.
- **Modelo de Mayr** (válido cerca del cruce por cero): supone una sección transversal fija del canal de arco que pierde energía únicamente por conducción térmica radial, lo que produce la caída abrupta de conductancia justo antes de current zero.

Ambos modelos, combinados ("Cassie-Mayr" o modelos "de caja negra"), se usan en programas de simulación de transitorios (EMTP/ATP) para predecir si un interruptor logrará interrumpir una corriente dada ([IEEE Trans. Power Delivery, *Circuit breaker model based on Mayr's and Cassie's differential arc equations*](https://ieeexplore.ieee.org/document/400910/); [ResearchGate, *An Improved Arc Model Before Current Zero*](https://www.researchgate.net/publication/3274972_An_Improved_Arc_Model_Before_Current_Zero_Based_on_the_Combined_Mayr_and_Cassie_Arc_Models)). El punto clave para el simulador educativo: el arco no se apaga porque "se estira hasta romperse" — se apaga porque, en un instante específico del ciclo de CA, su conductancia colapsa a cero de forma casi discontinua.

## 2. Cruce por cero de corriente y la Tensión Transitoria de Recuperación (TRV)

En corriente alterna, la corriente pasa por cero dos veces por ciclo (100 o 120 veces por segundo a 50/60 Hz). En cada cruce por cero, la energía instantánea entregada al arco cae a cero durante un brevísimo instante, y el plasma pierde momentáneamente su capacidad de conducir. Este es el **único instante físico en que un interruptor de CA puede realmente interrumpir la corriente** sin fuerza bruta: toda la ingeniería del interruptor (soplado de gas, vacío, geometría de contactos) está diseñada para explotar esa ventana de milisegundos y evitar que el arco se "reencienda" térmicamente en el semiciclo siguiente.

Inmediatamente después de ese cruce por cero exitoso, el sistema de potencia — que sigue siendo una red con inductancias y capacitancias — impone una tensión oscilatoria de alta frecuencia a través de los contactos abiertos: la **Tensión Transitoria de Recuperación (TRV, *Transient Recovery Voltage*)**. Esta tensión puede alcanzar picos de 1,5 a 2 veces la tensión de operación normal, con tasas de crecimiento (RRRV, *Rate of Rise of Recovery Voltage*) de varios kV/µs, especialmente en fallas cercanas al interruptor ("terminal faults") o fallas de línea corta.

La interrupción exitosa es entonces una **carrera** entre dos fenómenos:

1. La **recuperación dieléctrica** del medio entre contactos (su capacidad de resistir tensión sin romperse), que crece a medida que los contactos se separan físicamente y el gas se desioniza/enfría.
2. La **TRV** que el sistema impone sobre ese mismo espacio.

Si la TRV crece más rápido de lo que el medio recupera su rigidez dieléctrica, ocurre una ruptura del espacio entre contactos y el arco se re-establece. Según la ventana temporal en que ocurre esta ruptura, se distingue entre:

- **Reignición (reignition)**: ruptura dentro del primer cuarto de ciclo tras la interrupción (dominada por la TRV de alta frecuencia).
- **Restrike (reencendido)**: ruptura después de un cuarto de ciclo, típicamente asociada a la tensión de recuperación a frecuencia industrial.

El estándar **IEEE C37.011** ("*Guide for the Application of Transient Recovery Voltage for AC High-Voltage Circuit Breakers*") define las formas de onda de TRV normalizadas (amplitud, tiempo de pico, RRRV) contra las cuales se prueban y aplican los interruptores de alta tensión ([IEEE SA, C37.011-2019](https://standards.ieee.org/standard/C37_011-2019.html); [IEEE Xplore C37.011-2019](https://ieeexplore.ieee.org/document/8726087)). Un tutorial de referencia muy citado en la industria es el de Dufournet (IEEE PES Switchgear Committee) sobre TRV para interruptores de alta tensión ([IEEE PES Tutorial, Dufournet](https://www.ewh.ieee.org/soc/pes/switchgear/presentations/tp_files/2008-GM_Tutorial_4a_Dufournet.pdf)).

## 3. Medios de extinción comparados

| Medio | Principio físico | Rango típico de aplicación | Notas |
|---|---|---|---|
| **SF6 (hexafluoruro de azufre)** | "Puffer" (soplado): al separarse los contactos, un pistón mecánico comprime SF6 en una cámara y lo fuerza a través de una tobera sobre la columna de arco justo antes del cruce por cero. El SF6 es electronegativo: captura electrones libres del plasma y forma iones pesados y poco móviles, colapsando la conductividad del arco y recuperando rigidez dieléctrica muy rápido | Media a extra-alta tensión (desde ~36 kV hasta 800 kV+), corrientes de interrupción >100 kA en diseños extra-altos | Dominante en subestaciones de AT/EAT modernas; también existen diseños "auto-soplado" (self-blast) que usan la energía térmica del propio arco para generar sobrepresión, reduciendo la fuerza mecánica requerida |
| **Vacío** | Sin gas ionizable que sostener: al separarse los contactos dentro de una ampolla sellada a alto vacío, el vapor metálico que forma el arco se difunde radialmente a velocidades muy altas, de modo que en el primer cruce por cero el canal de plasma se dispersa y no puede reconstituirse. Se usa un campo magnético axial (AMF) para mantener el arco en modo "difuso" repartido en toda la superficie del contacto, evitando puntos calientes localizados | Predominante en media tensión (1–52 kV, típicamente hasta ~38 kV); existen desarrollos experimentales/comerciales de interruptores de vacío hasta 110 kV, pero el límite práctico de rigidez dieléctrica de la ampolla de vacío restringe su uso en alta tensión | Extinción muy rápida (3–8 ms), bajo mantenimiento, sin gases ni riesgo ambiental; para AT se usan diseños híbridos vacío+SF6 en algunos fabricantes ([CIGRE Webinar, *Fundamentals of Current Interruption in HV Vacuum CBs*](https://www.e-cigre.org/publications/detail/wbn053-fundamentals-of-current-interruption-in-high-voltage-vacuum-circuit-breakers.html); [Eaton, *Vacuum interrupters fundamentals*](https://www.eaton.com/us/en-us/products/electrical-circuit-protection/vacuum-interrupters/vacuum-interrupters---fundamentals-of-vacuum-interrupter-technol.html)) |
| **Aire comprimido (air-blast)** | Chorro de aire a alta presión (20–30 bar) dirigido axial o radialmente sobre el arco para enfriarlo y desionizarlo | Histórico en AT/EAT (décadas de 1950–1980) | Obsoleto: requiere compresores, es ruidoso, y fue desplazado casi totalmente por SF6 desde los 70s-80s |
| **Aceite mineral** | El arco vaporiza el aceite circundante, generando una burbuja de hidrógeno a alta presión que enfría y sopla el arco (interruptores de "gran volumen de aceite" u "OCB"); versiones posteriores de "pequeño volumen de aceite" (minimum-oil) concentraban el efecto | Histórico, prácticamente retirado en instalaciones nuevas | Riesgo de incendio/explosión, mantenimiento intensivo, degradación del aceite con cada operación |

Fuentes técnicas adicionales sobre el principio puffer: [GeeksforGeeks, *SF6 Circuit Breaker*](https://www.geeksforgeeks.org/electrical-engineering/sf6-circuit-breaker/); [Tavrida, *VCB Fundamentals*](https://www.tavrida.com/tena/solutions/vacuum-circuit-breakers/vcb-fundamentals/).

## 4. Parámetros nominales reales

Los interruptores de potencia se especifican bajo **IEEE/ANSI C37.04, C37.06, C37.09** y su contraparte **IEC 62271-100**. Parámetros clave:

- **Tensión nominal máxima** (kV rms, línea-línea): p. ej. 15, 38, 72,5, 145, 245, 362, 550, 800 kV.
- **BIL (Basic Insulation Level)**: tensión de impulso tipo rayo (onda normalizada 1,2/50 µs) que el aislamiento debe soportar. Aumenta con la tensión nominal (por ejemplo, del orden de 95–110 kV BIL para clase 15 kV, hasta 1550–1800 kV BIL para clase 550 kV, según tablas IEEE C37.06) — es la base de la **coordinación de aislamiento** entre el interruptor y el resto de la subestación.
- **Corriente nominal continua** (A): definida por el diseño térmico de los contactos y conexiones primarias (calentamiento admisible sobre la temperatura ambiente).
- **Corriente de cortocircuito nominal (interrupting rating)**: el valor rms **simétrico** (sin componente de continua) que el interruptor puede interrumpir de forma segura.
- **Corriente asimétrica**: incluye la componente de continua (DC) decreciente que se superpone a la componente de CA justo después de iniciada la falla. La norma usa una relación X/R = 17 como condición de referencia (constante de tiempo de ~2,71 ciclos), y define un **factor de asimetría S**:

  S = √(1 + 2·(DC%)²)

  Con 80 % de componente DC, S ≈ 1,51 — es decir, el interruptor solo puede reclamar el 66 % de su capacidad simétrica nominal como capacidad asimétrica en esas condiciones ([Kasztenny & Rostron, *Circuit Breaker Ratings — A Primer for Protection Engineers*, IEEE/SEL 2018](https://selinc.com/api/download/122619/)).
- **Corriente de cierre y enclavamiento (close-and-latch / peak making current)**: capacidad de cerrar sobre una falla ya existente, típicamente ~2,6 veces la corriente simétrica nominal (valor de cresta asimétrico).
- **Tiempo de interrupción total**: desde la energización de la bobina de disparo hasta la extinción final del arco en todos los polos. Para interruptores modernos de SF6/vacío en AT, típicamente **3 a 5 ciclos** (50–83 ms a 60 Hz); interruptores de vacío rápidos en MT pueden lograr ~1–2 ciclos de tiempo de apertura mecánica.

## 5. Interruptor vs. seccionador (disconnector) y el enclavamiento obligatorio

Un **interruptor de potencia (circuit breaker)** está diseñado con cámaras de extinción (SF6, vacío, etc.) capaces de disipar la energía del arco que se forma al abrir bajo corriente de carga o de falla. Un **seccionador (disconnect switch / isolator)** es mecánicamente mucho más simple: **no** posee ningún sistema de extinción de arco dimensionado para corriente de carga o falla. Su función es exclusivamente proporcionar un **punto de corte visible y verificable** de aislamiento galvánico para trabajos de mantenimiento — es un dispositivo "sin carga" (*off-load device*) ([EEPower, *Substation Components — Part 4: Isolators*](https://eepower.com/technical-articles/substation-componentspart-4-isolators/)).

Si un seccionador se abre mientras conduce corriente apreciable, el arco resultante no tiene forma de extinguirse de manera controlada: puede sostenerse indefinidamente, provocar un cortocircuito fase-fase o fase-tierra por la ionización del aire circundante, y destruir el equipo o causar un accidente grave. Por eso la secuencia operativa correcta es estricta:

- **Para desenergizar**: 1) abrir el interruptor (corta la corriente), 2) abrir el(los) seccionador(es) (aislamiento visible, sin corriente), 3) cerrar el seccionador de puesta a tierra si corresponde.
- **Para energizar**: la secuencia inversa — primero cerrar seccionadores (sin corriente), luego cerrar el interruptor.

Esta secuencia se garantiza mediante **sistemas de enclavamiento (interlocking)**, típicamente duplicados: enclavamiento eléctrico (lógica de control que impide la maniobra del seccionador si el interruptor asociado está cerrado) y enclavamiento mecánico de llave cautiva (*trapped-key*) como respaldo a prueba de fallos, no anulable sin herramientas ([EEPower, ídem](https://eepower.com/technical-articles/substation-componentspart-4-isolators/)).

## 6. Secuencia de disparo y tiempo total de despeje de falla

La cadena completa desde que ocurre la falla hasta la extinción final del arco tiene varias etapas medibles, bien documentadas en la literatura de protecciones ([Kasztenny & Rostron 2018](https://selinc.com/api/download/122619/)):

1. **Iniciación de la falla** (t=0): la corriente de falla comienza a crecer, posiblemente con una componente DC de compensación según el ángulo de incidencia.
2. **Tiempo de operación del relé** (*relay operating time*): el relé de protección debe medir la corriente/tensión, discriminar que se trata de una falla real (no inrush, no maniobra normal) y emitir la señal de disparo a la bobina del interruptor. Relés de protección diferencial o de distancia modernos operan típicamente en **0,5 a 1 ciclo**; esquemas de altísima velocidad basados en ondas viajeras u ondas incrementales pueden operar en **~0,25 ciclo o menos**.
3. **Tiempo de apertura mecánica** (*opening/mechanical time*): desde que la bobina de disparo se energiza hasta que los contactos primarios comienzan a separarse físicamente (activación del resorte/actuador, recorrido mecánico).
4. **Tiempo de arqueo** (*arcing time*): desde que los contactos se separan y comienza el arco, hasta el siguiente cruce por cero en que se logra interrumpir — normalmente **0,5 a 0,75 ciclo**.
5. **Tiempo de despeje total de falla** (*fault clearing time*): desde la iniciación de la falla hasta la extinción final del arco en el último polo. En sistemas de AT bien protegidos, el resultado típico combinado es del orden de **3 a 4 ciclos** (50–70 ms a 60 Hz) para protección primaria; si la protección primaria falla, esquemas de **falla de interruptor (breaker failure)** disparan interruptores adyacentes de respaldo, extendiendo el despeje a ~10–12 ciclos o más.

Este tiempo es crítico por dos razones de ingeniería de sistemas:

- **Estabilidad transitoria**: mientras la falla persiste, el sistema pierde capacidad de transferencia de potencia entre generadores, que se aceleran/desaceleran relativamente entre sí (criterio de áreas iguales). Despejar la falla más rápido preserva el margen de estabilidad del sistema interconectado.
- **Tensiones de paso y de contacto (IEEE Std 80)**: la corriente de falla a tierra eleva el potencial de la malla de puesta a tierra de la subestación, generando tensiones de paso y de contacto peligrosas para el personal. Los límites tolerables de IEEE 80 son función explícita de la **duración de la falla** (cuanto más rápido se despeja, mayor la corriente tolerable sin riesgo para una persona, según las curvas de fibrilación cardíaca de Dalziel) — por eso el tiempo de despeje del interruptor entra directamente en el cálculo de diseño de la malla de tierra ([método de coordinación IEEE 80 con tiempos de relé](https://wprcarchives.org/wp-content/uploads/2024/07/Lance-Grainger_Method-coordinate-IEEE-Std-80-to-relaying-G__2005.pdf)).

## 7. Reconexión automática (autorecloser) en líneas de transmisión

La mayoría de las fallas en líneas aéreas de transmisión son **transitorias** (arco por contaminación, descarga atmosférica, contacto momentáneo con vegetación/fauna) y se auto-despejan en el aire una vez que el arco se extingue y el canal ionizado se desioniza — siempre que la línea permanezca desenergizada un tiempo suficiente ("**tiempo muerto**", *dead time*). Solo las fallas monofásicas a tierra se clasifican formalmente como potencialmente transitorias; fallas multifásicas casi siempre se tratan como permanentes por su mayor severidad ([Basler, *Automatic Reclosing — Transmission Line Applications*](https://www.basler.com/resource-hub/technical-paper/autorecl.pdf); [SEL, *Tutorial on Single-Pole Tripping and Reclosing*](https://cdn.selinc.com/assets/Literature/Publications/Technical%20Papers/6579_TutorialSingle_NF_20120912_Web.pdf)).

- **Recierre trifásico**: los tres polos del interruptor se abren y recierran juntos. Tiempo muerto típico del orden de **~0,3 a 3 s** según nivel de tensión y necesidad de recuperación de sincronismo.
- **Recierre monopolar**: solo se abre el polo de la fase fallada (para fallas monofásicas a tierra), manteniendo las otras dos fases energizadas — reduce drásticamente la perturbación al sistema y mejora la estabilidad, a costa de una lógica de protección más compleja (debe discriminar exactamente qué fase falló).

Si al recerrar la falla persiste (falla permanente: conductor roto, aislador dañado, contacto físico), el esquema de protección dispara nuevamente, y tras un número limitado de intentos (típicamente 1 a 3) el interruptor queda **bloqueado (lockout)**, requiriendo intervención manual.

## 8. Puntos clave para la simulación educativa en Three.js

Para transmitir la física real sin caer en abstracción vacía, conviene anclar la animación a los conceptos anteriores en vez de mostrar un "rayo genérico":

1. **El arco como plasma que se estira y se apaga en el cruce por cero, no por "desconexión"**: al animar la apertura de contactos, dibujar el arco (line/tube geometry con shader de plasma, glow aditivo, ruido tipo Perlin para la turbulencia) de forma continua entre los dos contactos que se separan, con su brillo modulado por `|sin(ωt)|` de la corriente instantánea — y hacer que **desaparezca exactamente en el instante t donde sin(ωt)=0**, nunca antes ni "a la fuerza". Esto enseña visualmente por qué la extinción de arco en CA solo puede ocurrir en ese instante.
2. **Panel sincronizado con la onda de corriente**: mostrar simultáneamente (HUD 2D superpuesto, tipo osciloscopio) la onda senoidal de corriente con un marcador que recorre el cruce por cero en tiempo real, vinculado 1:1 con la animación 3D del arco — refuerza la idea de "ventana de extinción" en vez de corte instantáneo arbitrario.
3. **Visualizar la "carrera" TRV vs. recuperación dieléctrica**: justo después de la extinción, superponer dos curvas animadas en el mismo osciloscopio — la TRV (oscilación amortiguada de alta frecuencia que sube rápido) y una curva de "rigidez dieléctrica disponible" que también sube pero más lento al inicio. Si el usuario fuerza parámetros irreales (p. ej. separación de contactos demasiado lenta), la curva de TRV puede cruzar por encima de la de rigidez dieléctrica → disparar una animación de **restrike** (el arco se reenciende) como consecuencia educativa directa, no como evento aleatorio.
4. **Diferenciar visualmente el color/textura del arco según medio de extinción**: un arco en SF6 puede mostrarse más "comprimido y direccional" (soplado axial visible como líneas de flujo de gas convergiendo sobre el arco), mientras un arco en vacío se muestra difundiéndose radialmente y desvaneciéndose rápido sin soplado de gas — comunica la diferencia de principio físico sin texto adicional.
5. **Secuencia de disparo como línea de tiempo interactiva**: un HUD tipo diagrama de Gantt (basado en el diagrama fault-clearing-sequence de Kasztenny & Rostron) con las etapas: *Falla → Operación del relé (bloque ~0,5–1 ciclo) → Apertura mecánica → Arqueo (0,5–0,75 ciclo) → Extinción final*, resaltando cada bloque en el 3D en el momento correspondiente (chispa de falla, LED del relé encendiéndose, bobina de disparo animada, contactos separándose, arco, extinción). Permite al usuario pausar y entender que "el interruptor no reacciona instantáneamente" — hay una cadena de tiempos reales de milisegundos.
6. **Modelar el seccionador como un dispositivo mudo sin arco**: al intentar abrir el seccionador con el interruptor cerrado (carga circulando), el simulador debería *bloquear la acción* visualmente (candado / enclavamiento eléctrico rojo) y mostrar un mensaje de por qué — reforzando la regla real de interlocking en vez de simplemente no modelarla.
7. **Autorecloser como mini-secuencia narrada**: en el modo de línea de transmisión, tras un despeje de falla transitoria, mostrar el tiempo muerto contando regresivamente y luego el recierre exitoso (arco no reaparece); en el modo de falla permanente, mostrar el segundo disparo y el bloqueo (lockout) del interruptor con indicador visual distinto.

## Fuentes

- Kasztenny, B. & Rostron, J., *Circuit Breaker Ratings — A Primer for Protection Engineers*, Schweitzer Engineering Laboratories / IEEE, 2018. https://selinc.com/api/download/122619/
- IEEE Standards Association, *IEEE C37.011-2019 — Guide for the Application of Transient Recovery Voltage for AC High-Voltage Circuit Breakers with Rated Maximum Voltage above 1000 V*. https://standards.ieee.org/standard/C37_011-2019.html
- IEEE Xplore, *C37.011-2019*. https://ieeexplore.ieee.org/document/8726087
- Dufournet, D., *Transient Recovery Voltages (TRVs) for High Voltage Circuit Breakers*, IEEE PES Switchgear Committee Tutorial. https://www.ewh.ieee.org/soc/pes/switchgear/presentations/tp_files/2008-GM_Tutorial_4a_Dufournet.pdf
- Wikipedia, *Transient recovery voltage* (resumen y referencias cruzadas a IEC/IEEE). https://en.wikipedia.org/wiki/Transient_recovery_voltage
- CIGRE, *Fundamentals of Current Interruption in (High-Voltage) Vacuum Circuit Breakers* (webinar técnico). https://www.e-cigre.org/publications/detail/wbn053-fundamentals-of-current-interruption-in-high-voltage-vacuum-circuit-breakers.html
- Eaton, *Vacuum Interrupters — Fundamentals of Vacuum Interrupter Technology*. https://www.eaton.com/us/en-us/products/electrical-circuit-protection/vacuum-interrupters/vacuum-interrupters---fundamentals-of-vacuum-interrupter-technol.html
- Tavrida Electric, *Vacuum Circuit Breaker (VCB): Fundamentals of Vacuum Interrupter for Medium Voltage*. https://www.tavrida.com/tena/solutions/vacuum-circuit-breakers/vcb-fundamentals/
- ScienceDirect Topics, *Arc Plasma — an overview*. https://www.sciencedirect.com/topics/engineering/arc-plasma
- IEEE Transactions, *Circuit breaker model for digital simulation based on Mayr's and Cassie's differential arc equations*. https://ieeexplore.ieee.org/document/400910/
- ResearchGate, *An Improved Arc Model Before Current Zero Based on the Combined Mayr and Cassie Arc Models*. https://www.researchgate.net/publication/3274972_An_Improved_Arc_Model_Before_Current_Zero_Based_on_the_Combined_Mayr_and_Cassie_Arc_Models
- EEPower, *Substation Components — Part 4: Isolators*. https://eepower.com/technical-articles/substation-componentspart-4-isolators/
- Basler Electric, *Automatic Reclosing — Transmission Line Applications and Considerations*. https://www.basler.com/resource-hub/technical-paper/autorecl.pdf
- Schweitzer Engineering Laboratories, *Tutorial on Single-Pole Tripping and Reclosing*. https://cdn.selinc.com/assets/Literature/Publications/Technical%20Papers/6579_TutorialSingle_NF_20120912_Web.pdf
- Grainger, L., *A Method to Apply IEEE Std. 80 Safe Touch and Step Voltage Criteria to Protective Relay Coordination*, Western Protective Relay Conference. https://wprcarchives.org/wp-content/uploads/2024/07/Lance-Grainger_Method-coordinate-IEEE-Std-80-to-relaying-G__2005.pdf
