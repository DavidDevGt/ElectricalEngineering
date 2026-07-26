# Metodología de diseño pedagógico-interactivo para simuladores educativos de física/ingeniería

> Investigación de soporte para [IDEA.md](../IDEA.md). Complementa las investigaciones 01-10 (que
> cubren el contenido técnico-eléctrico) con la metodología de **diseño pedagógico** detrás de
> simulaciones interactivas efectivas — no cómo se programan técnicamente (Three.js, motores de
> física), sino cómo se diseña la experiencia de aprendizaje que esa programación debe soportar.
> Fuente de referencia principal: **PhET Interactive Simulations** (University of Colorado
> Boulder), el proyecto más citado e investigado en este campo, fundado en 2002 por el premio
> Nobel de Física Carl Wieman.

---

## 1. Principios de diseño de PhET

PhET nació de una observación incómoda de Carl Wieman como profesor de física: sus estudiantes
podían resolver problemas de examen sin haber construido un modelo mental correcto del fenómeno
físico subyacente. El proyecto se dedicó, desde 2002, a diseñar simulaciones validadas
empíricamente contra esa brecha, mediante un ciclo de investigación-diseño-interview-rediseño
documentado en más de 275 entrevistas individuales de tipo "think-aloud" (el estudiante narra en
voz alta lo que piensa mientras interactúa, sin guía del investigador salvo una o dos preguntas
conceptuales) — 4 a 6 entrevistas de 30-60 minutos por cada versión de cada simulación, antes de
publicarla.

De ese proceso surgió un conjunto de principios de diseño, resumidos por Wieman, Perkins y Adams en
la Oersted Medal Lecture de 2008 ("Interactive simulations for teaching physics: what works, what
doesn't, and why") y en los estudios "A Study of Educational Simulations Part I — Engagement and
Learning" y "Part II — Interface Design" (2008):

**(a) Exploración libre orientada a la curiosidad, no un procedimiento fijo.** El diseño no obliga
al estudiante a seguir una secuencia de pasos predeterminada; en cambio, la simulación debe generar
suficiente curiosidad ("¿qué pasa si muevo esto?") como para que la exploración ocurra sin
necesidad de instrucciones explícitas. PhET llama a esto diseño para la "**exploración
productiva**" (productive engagement): el estudiante actúa guiado por sus propias preguntas, no por
un guion externo.

**(b) Representaciones múltiples y conectadas.** Casi todas las simulaciones de PhET muestran
simultáneamente dos o más representaciones de la misma variable — una visual/física (ej. una
partícula moviéndose, un campo de vectores) y una simbólica/numérica (ej. un gráfico, un medidor,
una ecuación que se actualiza en vivo) — y **ambas cambian sincronizadamente** ante la misma
acción del usuario. La investigación de PhET documenta que esta conexión dinámica entre
representaciones es uno de los mecanismos más potentes para que el estudiante construya el puente
mental entre el fenómeno concreto y su abstracción matemática, un puente que la instrucción
puramente textual rara vez logra. Esto es exactamente el patrón que IDEA.md §7 ya propone para el
interruptor ("arco 3D sincronizado 1:1 con osciloscopio de corriente") y para el transformador
("osciloscopio con pico de inrush") — pero conviene **formalizarlo como principio transversal**,
no solo como una idea puntual en dos componentes.

**(c) Minimizar texto, maximizar que el sistema comunique su propio estado.** PhET evita
instrucciones escritas largas: el objetivo es que la interfaz misma —mediante affordances visuales,
animación, color, y feedback inmediato ante cada acción— comunique qué está pasando y por qué,
sin que el usuario tenga que leer un manual. Esto reduce la carga cognitiva extraña (texto que
compite por atención con el fenómeno) y hace la simulación utilizable en múltiples idiomas y
niveles de lectura sin rediseño.

**(d) Doble uso: exploración libre sin guía docente, y como pieza dentro de una lección
estructurada.** PhET diseña sus simulaciones para funcionar en ambos extremos: un estudiante solo,
jugando sin ninguna consigna ("free play"), y un docente que la inserta en una guía de laboratorio
con preguntas dirigidas. La investigación de PhET nota explícitamente que **la mayoría de los
estudiantes no tiene motivación intrínseca suficiente para explorar una simulación de ciencia sin
una razón directa** (una consigna, una nota, una pregunta del profesor) — el diseño "abierto" no
sustituye la necesidad de un contexto de uso con propósito. Esto es directamente relevante para el
simulador de subestación: el modo inspección libre (IDEA.md §7, nivel 1) necesita, para la mayoría
de los usuarios reales, estar acompañado de preguntas o tareas concretas ("encuentra los tres
componentes que forman la zona de protección del transformador"), no solo el escenario abierto.

---

## 2. "Interactive engagement" vs. instrucción transmisiva: el trabajo de Hake

El físico Richard Hake publicó en 1998 el estudio "Interactive-engagement versus traditional
methods: A six-thousand-student survey of mechanics test data for introductory physics courses"
(*American Journal of Physics* 66), que sigue siendo uno de los trabajos más citados de la
investigación en educación de física (physics education research, PER). Analizó datos pre/post de
6,542 estudiantes en 62 cursos, usando el Force Concept Inventory (FCI) o el Halloun-Hestenes
Mechanics Diagnostic como instrumento.

Hake definió la **ganancia normalizada** (*normalized gain*, "g de Hake"):

```
g = (%post − %pre) / (100 − %pre)
```

— es decir, qué fracción de lo que un estudiante *podía* mejorar (respecto al techo de 100%)
efectivamente mejoró. Resultado central: los 14 cursos "tradicionales" (instrucción
predominantemente transmisiva — clase magistral, el estudiante observa/lee pasivamente) lograron
`g ≈ 0.23`, mientras que los 48 cursos que usaron métodos de **"interactive engagement"**
(actividades donde el estudiante predice, actúa, recibe feedback inmediato, y discute) lograron
`g ≈ 0.48` — más del doble, una diferencia de casi dos desviaciones estándar. En la literatura de
PER se adoptó desde entonces un umbral de referencia informal: `g < 0.3` se considera "bajo
engagement" (instrucción esencialmente transmisiva), `0.3 ≤ g < 0.7` "engagement medio", y `g ≥
0.7` "alto engagement" — aunque pocos cursos reales superan 0.5-0.6 de forma sostenida.

El punto de fondo, replicado y ampliado por muchos estudios posteriores en PER (incluida buena
parte de la investigación de fundamentación de PhET), es que el factor causal no es "usar
tecnología" ni "que se vea bonito": es que el estudiante **prediga, actúe, observe el resultado y
lo reconcilie con lo que esperaba**, en vez de simplemente recibir información. Una simulación
puede ser tan pasiva como una clase magistral si el usuario solo mueve sliders sin comprometerse
antes con una expectativa — de ahí la importancia del ciclo POE (sección 3).

---

## 3. El ciclo Predict-Observe-Explain (POE)

La estrategia POE fue documentada por primera vez por Champagne, Klopfer y Anderson (1979) para
medir el razonamiento de estudiantes de física, y formalizada como metodología didáctica por White
y Gunstone en su libro *Probing Understanding* (1992). Su estructura de tres fases:

1. **Predict** (predecir): antes de que ocurra o se muestre el fenómeno, el estudiante debe
   comprometerse explícitamente con una predicción justificada del resultado. Este paso, por sí
   solo, es lo que distingue POE de "jugar" con una simulación: obliga a activar y exponer el
   modelo mental previo del estudiante (incluidas sus concepciones erróneas).
2. **Observe** (observar): el estudiante ejecuta o presencia el fenómeno real (en este caso, en la
   simulación) y registra lo que efectivamente ocurrió.
3. **Explain** (explicar): si hay discrepancia entre la predicción y la observación —lo habitual
   cuando existe una concepción errónea previa— el estudiante debe reconciliar ambas, articulando
   por qué su modelo mental estaba equivocado.

El mecanismo pedagógico es el **conflicto cognitivo productivo**: la sola observación de un
resultado correcto no reestructura una concepción errónea si el estudiante nunca se comprometió con
una predicción contraria; es la *discrepancia* explícita entre lo esperado y lo observado la que
fuerza la revisión activa del modelo mental. Por eso POE produce ganancias de aprendizaje y
retención documentadas por encima de la simple exposición o incluso de la exploración libre sin
compromiso previo (ver estudios recientes que replican el efecto en química y física, sección
Fuentes).

**Aplicación directa al modo "falla" del simulador (IDEA.md §7, nivel 3).** Actualmente el modo
falla se describe como "inyectar fallas... y observar la respuesta completa del sistema de
protección". Sin el paso de predicción, esto es una simulación de exploración libre, no un ciclo
POE — con la ganancia de aprendizaje típicamente menor según la literatura de Hake. La mejora
concreta: antes de disparar la falla, la interfaz debe preguntar explícitamente al usuario, por
ejemplo:

- "¿Qué protección esperas que actúe primero: el 87T (diferencial) o el 51 (sobrecorriente aguas
  arriba)?"
- "¿Esperas que el interruptor despeje la falla en menos de 1 ciclo, en 3-4 ciclos, o en más de
  10 ciclos?"
- Para el modo diseño de topologías (§5 de IDEA.md): "¿cuántos circuitos crees que quedarán sin
  servicio si falla esta barra en la topología de barra simple? ¿Y en interruptor-y-medio?"

Solo después de esa predicción explícita se dispara la falla y se muestra la secuencia real
(TC/TP → relé → interruptor → arco → despeje), con un paso final que compara la predicción del
usuario contra lo observado y explica el porqué de la diferencia (p. ej. "esperabas que el 51
actuara primero, pero el 87T es más rápido porque no necesita coordinación temporal — es protección
unitaria").

---

## 4. Affordances y restricción deliberada de la libertad de acción

Hay dos estrategias pedagógicas aparentemente opuestas y ambas respaldadas por investigación,
según el objetivo de aprendizaje:

**Restringir la acción (bloquear, no dejar que el error ocurra).** Cuando el objetivo es enseñar
una **regla de seguridad no negociable** — donde en el mundo real la consecuencia es catastrófica
e irreversible (un arco de fase-tierra al abrir un seccionador con carga, con riesgo de lesión o
muerte del operador) — la literatura de diseño de interfaces educativas favorece bloquear la acción
físicamente imposible y explicar el porqué en el momento del intento, en vez de dejar que el
usuario la ejecute y solo mostrar el resultado. Esto es exactamente lo que IDEA.md §3.3 ya propone
("la simulación bloquea la acción... y explica por qué, en vez de simplemente no modelarlo") y es
consistente con el principio de enclavamiento real de una subestación física: el simulador no solo
representa la regla, la *hace cumplir* de la misma manera que el enclavamiento eléctrico real,
reforzando que no es una convención arbitraria de la simulación sino una restricción física
genuina.

**Permitir el error y mostrar la consecuencia (productive failure).** Cuando el objetivo es que la
lección sea memorable y el costo de cometer el error en la simulación es cero (a diferencia del
mundo real), dejar que el usuario ejecute la acción incorrecta y presencie la consecuencia completa
genera un aprendizaje más profundo que solo explicarlo de antemano. Esto conecta con el marco de
**productive failure** de Manu Kapur (ETH Zürich): estudiantes que primero intentan resolver un
problema con su conocimiento previo —incluso si fallan o llegan a una solución subóptima— y luego
reciben la instrucción/explicación canónica, retienen y transfieren mejor que quienes reciben la
instrucción correcta desde el inicio, porque la fase de fallo activa y diferencia el conocimiento
previo antes de la consolidación.

**Criterio para decidir cuál usar en el simulador de subestación**: restringir cuando la acción
representa una regla de seguridad física real cuya violación en el mundo real es irreversible o
peligrosa para personas (seccionador con carga, abrir el secundario de un TC en carga — IDEA.md
§3.4); permitir el error cuando la consecuencia es instructiva mas no catastrófica y observarla en
sí misma es el objetivo de aprendizaje (ej. dejar que el usuario dispare una falla trifásica sin
haber configurado bien la coordinación de protecciones en el "modo diseño", y ver cómo la falta de
selectividad provoca un disparo en cascada innecesario — el error en un ejercicio de diseño es la
lección, no un riesgo de seguridad).

---

## 5. Diseño de feedback

La meta-investigación de Kulik & Kulik (1988) sobre timing de feedback es más matizada de lo que
suele citarse: en estudios de aula real con material de aprendizaje aplicado, el feedback
**inmediato** tiende a superar al diferido; en estudios de laboratorio de memorización de listas,
el patrón se invierte. Para una simulación interactiva de ingeniería —más cercana al caso de "aula
real con material aplicado"— el feedback inmediato ante cada acción es la elección correcta, y es
justamente lo que PhET impone como principio de diseño de interfaz (sección 1c): cada acción del
usuario debe producir una reacción visible del sistema sin demora perceptible.

Pero "inmediato" no basta: el feedback más efectivo explica el **porqué**, no solo marca
correcto/incorrecto. Un mensaje "Error: no se puede abrir el seccionador" es sustancialmente menos
pedagógico que uno que muestra el candado del enclavamiento y explica "el seccionador no tiene
cámara de extinción — abrirlo con corriente sostendría un arco sin control; primero debes abrir el
interruptor" (que es justo el patrón que IDEA.md §3.3 ya especifica). Esto es aplicable a toda la
tabla de interacciones de §7: cada bloqueo o resultado inesperado debería llevar aparejada una
explicación de mecanismo, no solo de resultado — consistente con el "principio de diseño" que
IDEA.md ya declara en la sección 1 ("fidelidad de mecanismo > fidelidad de resultado").

**El rol del escalamiento temporal en el feedback.** Varios fenómenos centrales del proyecto son
demasiado rápidos (el arco se extingue en el cruce por cero, 100-120 veces por segundo; el colapso
V-I del pararrayos ocurre en microsegundos) o demasiado lentos (la degradación térmica del papel
aislante, meses/años) para que la observación directa en tiempo real sea pedagógicamente útil. La
literatura de simulación educativa (y la investigación paralela sobre escalamiento de
tiempo/cámara lenta del proyecto) coincide en que hacer visible lo invisible —mediante
ralentización, aceleración o "congelado" del tiempo simulado con controles explícitos que el
usuario percibe como tales (no una animación arbitraria)— es en sí mismo un mecanismo de feedback:
el usuario debe poder ver *que* el sistema está mostrándole una versión con el tiempo alterado, para
no confundir la escala dramatizada con la escala real del fenómeno (riesgo didáctico: que el
usuario crea que el arco "dura" medio segundo cuando en realidad dura milisegundos).

---

## 6. Progresión de dificultad y scaffolding

El marco de **Gradual Release of Responsibility** (Pearson & Gallagher, 1983, basado en la Zona de
Desarrollo Próximo de Vygotsky) estructura la progresión instruccional en fases donde la
responsabilidad cognitiva se transfiere gradualmente del sistema/instructor al estudiante: "yo lo
hago" (modelado) → "lo hacemos juntos" (guiado) → "lo haces con apoyo" (colaborativo/con andamios
parciales) → "lo haces solo" (independiente). El mecanismo clave es el **fading**: los andamios
(pistas, restricciones, información pre-provista) se retiran progresivamente a medida que el
estudiante demuestra dominio, no se mantienen constantes ni se retiran de golpe.

Aplicado a los 5 niveles ya definidos en IDEA.md §7, el diseño actual **ya sigue implícitamente**
esta progresión (inspección → maniobra → falla → diseño → quiz va de exposición pasiva a
producción activa), pero puede beneficiarse de hacerla explícita en términos de qué andamio se
retira en cada transición:

- **Inspección → maniobra**: se retira la explicación permanente (ficha técnica siempre visible) y
  se sustituye por feedback condicional (solo aparece si el usuario se equivoca o lo solicita).
- **Maniobra → falla**: se retira el protocolo correcto pre-escrito; el usuario debe predecir
  (POE, sección 3) en vez de simplemente ejecutar una secuencia ya conocida.
- **Falla → diseño**: se retira el andamio más grande — la topología fija de la subestación. El
  usuario pasa de operar un sistema dado a construir el grafo él mismo, con las mismas reglas
  físicas pero sin que el sistema le diga cuál es "la" respuesta correcta (múltiples topologías son
  válidas con distinto costo-confiabilidad, como ya documenta la tabla de §5 de IDEA.md).
- **Diseño → quiz**: el quiz debe evaluar sin ningún andamio — es la fase "lo haces solo" del
  modelo GRR — pero anclado a componentes específicos de la escena 3D en vez de preguntas
  abstractas, como ya propone IDEA.md.

---

## 7. Evaluación de simulaciones educativas: qué mide la literatura

La literatura de PER y de PhET usa varias métricas convergentes, no una sola, para validar que una
simulación "realmente enseña" y no solo "se ve interactiva":

- **Tests de concepto pre/post** (concept inventories): el Force Concept Inventory (Hestenes,
  Wells & Swackhamer, 1992) es el instrumento fundacional en física; midió la ganancia normalizada
  de Hake (sección 2). Para ingeniería eléctrica de potencia el equivalente más cercano es el
  **Electric Circuits Concept Inventory (ECCI)**, desarrollado para cursos de circuitos DC, que
  cubre leyes de Kirchhoff, análisis de circuitos y conceptos fundamentales de corriente/tensión —
  existen intentos análogos en electromagnetismo, señales y sistemas, y lógica digital, aunque
  ninguno específico de subestaciones/protecciones de potencia a la fecha de esta investigación.
  Esto sugiere que, para validar rigurosamente el simulador de subestación en un contexto educativo
  formal, habría que construir o adaptar preguntas de concepto propias (p. ej. "¿por qué el %Z de
  un transformador no cambia según el lado desde el que se mide?") en vez de asumir que existe un
  instrumento estándar ya disponible.
- **Entrevistas cualitativas think-aloud** (sección 1): el mecanismo que PhET usa *antes* de
  publicar cada simulación, no solo después — identifica malentendidos de interfaz y conceptuales
  tempranamente, con una muestra pequeña (4-6 estudiantes) pero iterada varias veces por
  simulación.
- **Tiempo en tarea y tasa de finalización**: métricas de uso más débiles por sí solas (no
  garantizan aprendizaje — un estudiante puede pasar mucho tiempo confundido, no comprometido) pero
  útiles como señal de abandono o fricción de interfaz cuando se combinan con las anteriores.
- **Retención diferida**: pruebas administradas días o semanas después (no solo inmediatamente
  post-actividad) para distinguir aprendizaje real de memoria de trabajo de corto plazo — relevante
  si el simulador se usa como recurso de curso con evaluación posterior.

---

## Puntos clave para el simulador de subestación

Revisando los 5 niveles de progresión y la tabla de interacciones de IDEA.md §7 contra los
principios anteriores, se proponen las siguientes mejoras concretas:

1. **Incorporar el ciclo POE explícitamente en el modo falla (nivel 3).** Antes de cada falla
   inyectada, la UI debe pedir una predicción concreta al usuario (qué protección actúa primero,
   en cuántos ciclos, cuántos circuitos caen) y, tras la simulación, mostrar explícitamente la
   comparación predicción-vs-observación con la explicación del mecanismo. Sin este paso, el modo
   falla es exploración libre —pedagógicamente más débil según Hake— no interactive engagement en
   sentido estricto. Extender el mismo patrón al "modo comparación de topologías" del modo diseño
   (§5): predecir cuántos circuitos caerán en cada topología *antes* de ver el resultado del grafo.

2. **Formalizar "representaciones múltiples y conectadas" como principio transversal de todos los
   componentes, no solo del interruptor y el transformador.** IDEA.md ya lo aplica puntualmente
   (osciloscopio + arco, curva de eficiencia + slider de carga), pero conviene aplicarlo
   sistemáticamente donde falta: el heatmap de potencial de superficie de la malla de tierra (§3.8)
   debería mostrar simultáneamente el valor numérico de `E_step`/`E_touch` calculado en la posición
   del avatar *y* la representación visual del heatmap, ambos actualizándose en vivo al arrastrar
   el avatar — ya está insinuado mas conviene hacerlo explícito como requisito de diseño, no como
   idea opcional.

3. **Distinguir explícitamente, para cada interacción de la tabla de §7, si corresponde
   "restringir" (bloqueo + explicación) o "permitir el error" (productive failure).** Actualmente
   solo el seccionador (§3.3) y el TC en circuito abierto (§3.4, aunque ahí el objetivo pedagógico
   es precisamente mostrar el pico de tensión, así que ahí sí conviene permitir la acción y mostrar
   la consecuencia) tienen esta distinción implícita. Se recomienda: bloquear con explicación en
   seccionador-con-carga y en secuencias de maniobra que violen enclavamiento real; permitir el
   error y mostrarlo en el modo diseño (topología subóptima, coordinación de protecciones mal
   ajustada) y en demostraciones de fenómeno (TC abierto, ferroresonancia en CVT).

4. **Añadir consignas o preguntas dirigidas al modo inspección (nivel 1), en vez de dejarlo
   completamente abierto.** La investigación de PhET es explícita en que la mayoría de los
   estudiantes no explora una simulación sin un motivo directo. El modo inspección debería incluir,
   opcionalmente, una lista de "misiones" cortas (ej. "encuentra los tres componentes que forman la
   zona de protección diferencial 87T y explica por qué se solapan en el interruptor") que le den
   propósito a la exploración libre sin convertirla en un tutorial rígido — preservando el espíritu
   de descubrimiento pero anclándolo a una tarea, tal como PhET reconcilia exploración libre con uso
   estructurado por un docente.

5. **Hacer explícito el "fading" de andamios entre niveles y anclar el quiz final a la escena 3D
   sin ningún soporte visual permanente.** La progresión ya es correcta en esencia (§6 de esta
   investigación), pero conviene documentar en IDEA.md, para cada transición de nivel, qué andamio
   específico se retira (ficha técnica permanente → feedback bajo demanda → predicción obligatoria →
   sin topología dada → sin ningún apoyo), de modo que el diseño de cada nivel sea una decisión
   deliberada de qué información retirar, no solo "más difícil" en abstracto.

---

## Fuentes

- [PhET Interactive Simulations — Research](https://phet.colorado.edu/en/research) — página oficial de investigación del proyecto, principios de diseño y metodología de entrevistas think-aloud.
- [PhET: Interactive Simulations for Teaching and Learning Physics (The Physics Teacher, 2006)](https://pubs.aip.org/aapt/pte/article/44/1/18/274167/PhET-Interactive-Simulations-for-Teaching-and)
- [Oersted Medal Lecture 2007: Interactive simulations for teaching physics: What works, what doesn't, and why (Wieman, Perkins, Adams — American Journal of Physics, 2008)](https://pubs.aip.org/aapt/ajp/article-abstract/76/4/393/1040249/Oersted-Medal-Lecture-2007-Interactive-simulations)
- [A Study of Educational Simulations Part II – Interface Design](https://search.issuelab.org/resources/1369/1369.pdf)
- [Physics. PhET: Simulations that enhance learning (Wieman, Adams, Perkins — Science, 2008)](https://www.researchgate.net/publication/23441908_Physics_PhET_Simulations_that_enhance_learning)
- [PhysPort: Methods and Materials — PhET Interactive Simulations](https://www.physport.org/methods/method.cfm?G=PhET&S=4)
- [Interactive-engagement versus traditional methods: A six-thousand-student survey of mechanics test data for introductory physics courses (Hake, 1998 — American Journal of Physics)](https://pubs.aip.org/aapt/ajp/article/66/1/64/1055076/Interactive-engagement-versus-traditional-methods)
- [Hake: Normalized Gains — Montana State University summary](https://www.montana.edu/msse/capstones/hake_normalized_gains.html)
- [The Original Case for Active Learning – PERbites](https://perbites.org/2018/05/23/the-original-case-for-active-learning/)
- [A comparison of Hake's g and Cohen's d for analyzing gains on concept inventories](https://arxiv.org/pdf/1612.09180)
- [Predict, Observe, Explain (POE) — Assessment Resource Banks, NZCER](https://arbs.nzcer.org.nz/predict-observe-explain-poe)
- [The effects of the "Predict-Observe-Explain (POE)" strategy on academic achievement, attitude and retention in science learning](https://files.eric.ed.gov/fulltext/EJ1341654.pdf)
- [Force Concept Inventory — Wikipedia](https://en.wikipedia.org/wiki/Force_Concept_Inventory)
- [A concept inventory for an Electric Circuits course: Rationale and fundamental topics (IEEE)](https://ieeexplore.ieee.org/document/5536996/)
- [Concept Inventory Assessment Instruments for Circuits Courses](https://www.researchgate.net/publication/344544083_Concept_Inventory_Assessment_Instruments_for_Circuits_Courses)
- [The Gradual Release of Responsibility Framework — Old Dominion University](https://www.odu.edu/facultydevelopment/teaching-toolkit/gradual-release-responsibility-framework)
- [Revisiting the Rules of Gradual Release of Responsibility — ASCD](https://www.ascd.org/el/articles/revisiting-the-rules-of-gradual-release-of-responsibility)
- [Productive Failure — Manu Kapur, ETH Zürich (overview PDF)](https://boldscience.org/wp-content/uploads/2025/04/Productive-Failure.pdf)
- [When Problem Solving Followed by Instruction Works: Evidence for Productive Failure (Sinha & Kapur, 2021)](https://journals.sagepub.com/doi/10.3102/00346543211019105)
- [Designing for Productive Failure (Kapur)](https://docdrop.org/static/drop-pdf/Kapur---Designing-for-Productive-Failure-oaAJc.pdf)
- [A Meta-Analysis of the Impact of Feedback Timing on Learning (incluye discusión de Kulik & Kulik 1988)](https://hal.science/hal-05546645v1/file/Meta_HAL_submission.pdf)
- [Katherine K. Perkins — Wikipedia](https://en.wikipedia.org/wiki/Katherine_K._Perkins)
- [Wendy Adams — Wikipedia](https://en.wikipedia.org/wiki/Wendy_Adams)
