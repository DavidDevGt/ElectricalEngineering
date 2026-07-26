# Cómo documentan las empresas y proyectos de referencia mundial: el framework Diátaxis y docs-as-code

> Investigación de soporte para [IDEA.md](../IDEA.md). A diferencia de los documentos 01-12 (teoría
> eléctrica y arquitectura del simulador), esta investigación no trata sobre el *contenido* técnico
> del proyecto sino sobre cómo **organizar y mantener la documentación misma** — con el mismo rigor
> de fuentes primarias que el resto de la carpeta. Fuente central: **Diátaxis**
> ([diataxis.fr](https://diataxis.fr/)), creado por Daniele Procida (Django core developer desde
> 2013, ex-Vicepresidente de la Django Software Foundation, hoy Director of Engineering en
> Canonical), y adoptado explícitamente por Kubernetes, Cloudflare, Canonical/Ubuntu, Gatsby y
> cientos de proyectos más. Se complementa con la filosofía **docs-as-code** de la comunidad Write
> the Docs y los templates del Good Docs Project.

---

## 1. El framework Diátaxis: cuatro necesidades, cuatro formas

Diátaxis (del griego *dia* + *taxis*, "a través del orden/disposición") parte de una observación
específica: la documentación técnica no falla por falta de contenido, sino porque **mezcla modos de
escritura que sirven a necesidades incompatibles del lector**. El sitio oficial lo plantea así:
Diátaxis identifica cuatro necesidades documentales distintas y "las coloca en una relación
sistemática, y propone que la documentación misma debería organizarse alrededor de la estructura de
esas necesidades." El framework opera sobre tres dimensiones simultáneas: **contenido** (qué
escribir), **estilo** (cómo escribirlo) y **arquitectura** (cómo organizarlo) — no es solo una
taxonomía de carpetas, es una teoría de por qué cada tipo de documento debe *sonar* distinto.

### 1.1 Los dos ejes del mapa conceptual

El diagrama de diataxis.fr (página `/map/`) organiza los cuatro cuadrantes cruzando dos ejes:

- **Eje horizontal — acción vs. cognición**: ¿el lector necesita *hacer* algo ahora mismo, o
  necesita *adquirir/consultar conocimiento*? Tutoriales y guías how-to están del lado de la
  acción; referencia y explicación están del lado del conocimiento.
- **Eje vertical — adquisición de skill vs. aplicación de conocimiento**: ¿el lector está
  **aprendiendo** (todavía no sabe hacerlo, necesita ser guiado paso a paso como estudiante) o está
  **aplicando** lo que ya sabe (ya tiene competencia, busca completar una tarea o consultar un
  dato)? Tutoriales y referencia están del lado de "todavía no domina el tema / lo consulta desde
  cero"; guías how-to y explicación asumen ya cierta familiaridad.

De ese cruce surgen los cuatro cuadrantes, cada uno con su pregunta característica:

| Cuadrante | Eje acción/cognición | Eje aprendizaje/aplicación | Pregunta que responde |
|---|---|---|---|
| **Tutorial** | Acción | Aprendizaje (adquisición) | "¿Puedes enseñarme a…?" |
| **Guía how-to** | Acción | Aplicación | "¿Cómo hago…?" |
| **Referencia** | Cognición | Aplicación | "¿Qué es…?" (consulta) |
| **Explicación** | Cognición | Aprendizaje/comprensión | "¿Por qué…?" |

### 1.2 Qué caracteriza a cada cuadrante

**Tutorial** — es, literalmente, "una experiencia que ocurre bajo la guía de un tutor": el autor
asume casi toda la responsabilidad del éxito del lector, como un contrato pedagógico. Debe producir
**resultados visibles temprano y a menudo** (cada paso genera algo comprobable), usar lenguaje en
primera persona del plural ("vamos a…", afirmando la relación tutor-aprendiz), y — punto crítico —
**minimizar la explicación**: diataxis.fr insiste en que un tutorial no debe intentar explicar por
qué las cosas funcionan ("don't try to teach" en el sentido de exponer teoría), sino crear una
experiencia concreta de la que el aprendizaje emerge por sí solo. Lo que el estudiante *hace* no es
necesariamente lo que *aprende* — el tutorial diseña la actividad, no el discurso.

**Guía how-to** — sirve a un usuario ya competente que sabe lo que quiere lograr y necesita una
secuencia de pasos para un problema real y específico. Es "orientada a la acción y solo a la
acción", sin digresión ni enseñanza. A diferencia del tutorial, no necesita ser exhaustiva ni
empezar desde cero: "practical over complete" — empieza y termina en puntos con sentido para
alguien que ya tiene contexto. Su título debe nombrar exactamente el problema que resuelve ("Cómo
configurar X para Y"), no ser vago.

**Referencia** — es información **consultada, no leída de corrida**: el usuario la busca para
obtener "verdad y certeza — una plataforma firme sobre la que pararse mientras trabaja." Debe
reflejar la estructura real del sistema que describe (como un mapa representa un territorio) y ser
"austera, sin concesiones", con patrones de presentación consistentes. El punto más citado de
diataxis.fr en esta sección: **"neutral description is the key imperative of technical reference"**
— la referencia rechaza explícitamente opinión, instrucción y explicación. La analogía que usa el
propio sitio es la del etiquetado alimentario regulado: una tabla nutricional no debe incluir
recetas ni afirmaciones de marketing, porque su función es ser jurídicamente confiable, no
persuasiva.

**Explicación** — es "un tratamiento discursivo de un tema que permite la reflexión", pensada para
leerse *lejos* del momento de uso activo del producto. Responde "¿puedes contarme sobre…?", aporta
contexto histórico, alternativas de diseño consideradas y descartadas, y — a diferencia de la
referencia — **admite explícitamente opinión y perspectiva**: "toda actividad y conocimiento humano
está investido de opinión." Aquí es donde caben frases como "la razón de X es que históricamente…"
o comparaciones "W es mejor que Z porque…", que en cualquier otro cuadrante serían un defecto.

### 1.3 Por qué mezclar los modos es la causa raíz de la mala documentación

Este es el argumento central de Procida, y vale citarlo con precisión porque es contraintuitivo:
casi ningún equipo de documentación piensa que su problema es *estructural*; piensan que les falta
contenido o que está desactualizado. Diátaxis sostiene que el problema real es anterior: **cuando
estas distinciones se dejan difuminar, los distintos tipos de documentación se filtran unos en
otros** ("bleed into each other"). Esto produce dos fallas simultáneas y compuestas:

1. **Degradación de contenido**: el estilo y contenido de un modo se cuela en un lugar inapropiado
   — el ejemplo canónico que da el propio framework es un tutorial que se desvía a explicar la
   teoría subyacente ("y esto funciona así porque internamente…"): en el momento en que el
   principiante más necesita ejecutar un paso concreto y ver un resultado, se le presenta una
   digresión conceptual que rompe el ritmo de la experiencia guiada y **lo pierde** — no porque el
   contenido esté mal, sino porque está en el documento equivocado. Simétricamente, una referencia
   que incluye opiniones ("recomendamos usar X en vez de Y") deja de ser confiable como fuente de
   consulta rápida: el usuario ya no puede tratarla como verdad neutral, tiene que evaluarla.
2. **Colapso estructural**: una vez que el contenido se mezcla, se vuelve más difícil mantener la
   disciplina de escritura apropiada en el futuro — cada nueva contribución tiene menos señal de
   "dónde va esto", y el documento se degrada de forma acumulativa. En el caso límite, cuando la
   distinción colapsa por completo, se vuelve "imposible satisfacer las necesidades que cualquiera
   de las dos formas debía cubrir" — el documento no sirve bien ni como tutorial ni como
   referencia, sirve mal a ambos lectores a la vez.

La implicación práctica que Diátaxis defiende — y que casi todos los casos de adopción documentados
citan como el cambio real — no es "escribir mejor", sino **separar físicamente los documentos por
cuadrante** para que cada uno pueda cumplir su contrato con el lector sin comprometerlo por las
exigencias de otro modo.

---

## 2. Casos documentados: Kubernetes y Cloudflare

**Kubernetes** es el caso de adopción más citado y, a diferencia de muchos testimonios de segunda
mano, está documentado en la fuente primaria del propio proyecto: la guía de estilo de
`kubernetes.io` — página ["Page content types"](https://kubernetes.io/docs/contribute/style/page-content-types/) —
define explícitamente cuatro tipos de página (**concept**, **task**, **tutorial**, **reference**) y
cita a Diátaxis por nombre como referencia: *"You may also find the Diátaxis documentation
framework helpful as a reference for how to write each of these page content types."* Cada tipo
tiene una plantilla estructural obligatoria impuesta por convención de shortcodes de Hugo: una
página de tipo *concept* debe tener secciones `overview`/`body`/`whatsnext` sin pasos numerados
(mapea a "explicación"); una *task* debe tener `prerequisites`/`steps`/`discussion` enfocados en
una sola cosa (mapea a "guía how-to"); un *tutorial* debe tener `objectives`/`lessoncontent`/
`cleanup` para objetivos más amplios que una sola tarea; y una página de *reference* se genera en
buena parte automáticamente desde el código fuente de las herramientas (`kubectl`, `kubeadm`,
`kube-apiserver`) para garantizar que nunca se desincronice del comportamiento real del binario. El
problema que esto resuelve — documentado implícitamente por la existencia misma de esta guía de
estilo obligatoria para cientos de colaboradores externos (SIG Docs) — es el de un proyecto masivo,
con contribuciones de miles de ingenieros de organizaciones distintas, donde sin una plantilla
explícita por tipo de página cada colaborador termina mezclando explicación conceptual con pasos de
instalación en el mismo documento, produciendo páginas inconsistentes en tono y imposibles de
mantener a escala.

**Cloudflare** documentó su propia migración en el post oficial del blog de ingeniería
["We rebuilt Cloudflare's developer documentation — here's what we learned"](https://blog.cloudflare.com/new-dev-docs/).
El motivo inmediato y más documentado en ese post es de infraestructura, no solo de contenido: la
plataforma anterior (Gatsby, con más de 100 despliegues independientes de Cloudflare Workers, uno
por producto) tenía tiempos de build de hasta una hora, una cadena de dependencias pesada que hacía
el desarrollo local lento para los contribuyentes, y renderizado del lado del cliente que
penalizaba el rendimiento en dispositivos limitados. La migración a **Hugo** (generador de sitios
estáticos en Go) sobre **Cloudflare Pages** consolidó esos despliegues en una unidad, convirtió
automáticamente más de 1,600 archivos de MDX a Markdown estándar, redujo el build a segundos y
mejoró el Lighthouse mobile de 55 a 99. En paralelo a ese trabajo de infraestructura —y es la parte
que developers.cloudflare.com cita como su norte de arquitectura de información en su documentación
pública— **Diátaxis se adoptó como el criterio organizador de la navegación**: separar
explícitamente "empezar" (tutorial), "guías" (how-to), "referencia de API" y "conceptos"
(explicación) en la barra de navegación superior del sitio, en vez de la mezcla anterior de guías
que combinaban pasos de instalación con explicación de arquitectura en el mismo árbol. El patrón
que ambos casos comparten, más allá del detalle técnico específico de cada stack, es el mismo que
predice el capítulo 1: **el síntoma que fuerza la migración es documentación que "se sentía
desorganizada" para cientos de colaboradores simultáneos**, y la solución no fue escribir más, fue
imponer una plantilla estructural por tipo de contenido antes de seguir escribiendo.

---

## 3. Docs-as-code: tratar la documentación como se trata el código

La comunidad **Write the Docs** ([writethedocs.org/guide/docs-as-code](https://www.writethedocs.org/guide/docs-as-code/))
define la práctica de forma directa: *"Documentation as Code (Docs as Code) refers to a philosophy
that you should be writing documentation with the same tools as code"* — es decir, el mismo flujo
de trabajo que usa un equipo de ingeniería para el código fuente, aplicado a la documentación:

- **Control de versiones (Git)**: la documentación vive en el mismo repositorio (o uno hermano) que
  el código, en texto plano (Markdown, reStructuredText o AsciiDoc) en vez de un editor WYSIWYG
  propietario. Esto da historial de cambios real, `blame`, y la capacidad de revertir.
- **Revisión por pares (pull requests)**: un cambio de documentación pasa por el mismo proceso de
  *code review* que un cambio de código — alguien más lo lee antes de que se publique. GitLab
  documenta esto de forma explícita en su flujo interno: la documentación **forma parte de su
  "definition of done"**, y los merge requests de código nuevo pueden bloquearse si no incluyen la
  documentación correspondiente, lo que incentiva a que el ingeniero documente la funcionalidad
  mientras la tiene fresca en la cabeza, no semanas después.
- **CI/CD que valida la documentación**: linters de Markdown/prosa (estilo, enlaces rotos,
  terminología prohibida), verificación automatizada de links, y build automatizado de un sitio
  estático (Hugo, MkDocs, Sphinx, Docusaurus) que falla el pipeline si algo no compila — exactamente
  como un pipeline de CI falla si el código no compila o los tests no pasan.

La razón por la que esto produce mejor documentación que un wiki separado del repositorio de código
no es solo cultural, es estructural: un wiki (Confluence, un Google Doc, un Notion) **no tiene
ninguna relación mecánica con el commit que cambió el comportamiento real**, así que diverge
silenciosamente — nadie recibe una señal cuando el código cambia y el wiki no. Docs-as-code, en
cambio, permite reglas de sincronización forzada (el pipeline puede exigir que un PR que toca cierto
módulo también toque su documento asociado), reduce la fricción para que un ingeniero contribuya
(usa el mismo editor, el mismo `git commit`, el mismo flujo de PR que ya conoce, en vez de aprender
una herramienta de documentación aparte) y —el argumento que más citan los propios equipos de
Write the Docs en sus charlas de conferencia— **da a la documentación el mismo estatus que al
código**: revisable, versionado, con propietarios claros, en vez de un anexo de segunda categoría
que se actualiza "cuando hay tiempo".

---

## 4. Estructura real de carpetas: cuatro proyectos ejemplares

Verificado directamente contra los repositorios públicos (no descripciones de terceros):

**Kubernetes** (`kubernetes/website`, carpeta `content/en/docs/`):

```
docs/
├── concepts/      → cuadrante Explicación
├── tasks/         → cuadrante Guía how-to
├── tutorials/     → cuadrante Tutorial
├── reference/     → cuadrante Referencia (generado en parte desde el código)
├── setup/         → instalación (mezcla tutorial + how-to según la página)
└── contribute/    → guía de estilo y proceso, incluye page-content-types
```

**Django** (`django/django`, carpeta `docs/`) — notable porque Procida fue core developer de Django
antes de formalizar Diátaxis, y esta estructura es un antecedente directo:

```
docs/
├── intro/         → tutoriales ("Writing your first Django app")
├── topics/        → explicación conceptual por tema
├── howto/         → guías how-to orientadas a tarea
├── ref/           → referencia (API, settings, comandos)
├── faq/           → preguntas frecuentes (complemento, no un cuadrante propio)
├── internals/     → documentación para contribuyentes al propio Django
├── releases/      → notas de versión
├── misc/
└── glossary.txt   → glosario de términos
```

**Vue.js** (`vuejs/docs`, carpeta `src/`):

```
src/
├── tutorial/          → cuadrante Tutorial (interactivo, in-browser)
├── guide/             → mezcla guiada de conceptos + how-to, progresiva
├── api/               → cuadrante Referencia
├── examples/          → complementa how-to con casos completos
├── error-reference/   → referencia especializada (códigos de error)
├── glossary/          → glosario de términos versionado
└── style-guide/       → convenciones de código recomendadas (explicación + how-to)
```

**The Good Docs Project** (`thegooddocsproject/templates`) no es un proyecto con producto, sino
plantillas descargables organizadas *directamente* según Diátaxis — su repositorio raíz tiene
carpetas `tutorial/`, `how-to/`, `reference/`, `explanation/`, más plantillas especializadas
(`api-overview/`, `api-quickstart/`, `api-reference/`, `quickstarts/`) y una `ia-guide/` (guía de
arquitectura de información) pensada para que equipos sin escritores técnicos profesionales puedan
decidir qué plantilla usar.

**Patrón común a los cuatro**: nombres de carpeta cortos y en plural, alineados 1:1 con un cuadrante
de Diátaxis (`tutorials/`, `tasks/` o `howto/`, `reference/` o `ref/`, `concepts/` o `topics/`);
un `_index.md` o `README` de entrada por carpeta que actúa como índice, nunca como contenido; y una
carpeta de referencia generada — parcial o totalmente — desde el código fuente en vez de escrita a
mano, precisamente porque la referencia es el cuadrante donde la desincronización con el código real
es más costosa.

---

## 5. El README como documento especial

La convención ampliamente aceptada (recogida en compilaciones muy referenciadas como
[matiassingers/awesome-readme](https://github.com/matiassingers/awesome-readme) y
[noffle/art-of-readme](https://github.com/noffle/art-of-readme), y reforzada por la guía oficial de
GitHub) trata el README como un documento **con un propósito distinto y más estrecho** que el resto
de `docs/`: es la puerta de entrada, no el archivo. Lo que debe contener:

- Nombre del proyecto y una frase que diga qué hace, sin jerga innecesaria.
- Cómo instalar/ejecutar: los comandos exactos, prerrequisitos (versión de lenguaje, herramientas).
- Un ejemplo mínimo de uso que demuestre valor en segundos, no en minutos.
- Enlaces hacia `docs/` para todo lo que exceda lo anterior — el README debe funcionar como "elevator
  pitch + link fest" una vez que el proyecto tiene documentación propia, no intentar contenerla.
- Estado del proyecto, licencia, y cómo contribuir (o enlace a `CONTRIBUTING.md`).

Lo que **no** debe contener, según esa misma convención: explicación conceptual profunda (eso es
`docs/explanation/` o `topics/`), referencia exhaustiva de API/opciones (eso es `docs/reference/`),
tutoriales completos paso a paso más allá del primer "hello world" (eso es `docs/tutorials/`), y
decisiones de arquitectura internas (eso vive en un `ARCHITECTURE.md` o en `docs/` para
contribuyentes, no en la cara pública del proyecto). El error típico que esta convención señala es
justamente una instancia del problema de Diátaxis: un README que crece sin límite hasta absorber
tutorial, referencia y explicación a la vez, volviéndose imposible de escanear para alguien que solo
quería saber "¿qué es esto y cómo lo instalo?".

---

## 6. Glosarios y consistencia terminológica

Proyectos grandes mantienen un glosario explícito y versionado — Kubernetes tiene el suyo en
`docs/reference/glossary/` (parte del cuadrante Referencia, con entradas enlazables por *anchor* que
otras páginas del sitio referencian vía *tooltip*), Django lo tiene en `docs/glossary.txt`, y Vue.js
en `src/glossary/`. La razón estructural: en un proyecto con decenas o cientos de colaboradores
escribiendo en paralelo, sin una fuente única de verdad terminológica es casi inevitable que un
mismo concepto técnico adquiera sinónimos distintos entre documentos distintos (ej. "nodo" vs.
"host" vs. "worker" para el mismo objeto, o en el dominio de este proyecto: "interruptor" vs.
"disyuntor" vs. "breaker" para el mismo componente) — cada sinónimo no reconocido rompe la búsqueda
del lector (busca un término, el documento relevante usa el otro) y erosiona la confianza que el
cuadrante de referencia está diseñado para dar. Publicar el glosario como parte versionada de la
documentación (no como una nota interna del equipo) también permite enlazarlo desde cualquier
página — Kubernetes lo hace con un *shortcode* que convierte la primera mención de un término en un
enlace con tooltip a su definición canónica — convirtiendo la consistencia terminológica en algo
verificable y mantenible en vez de una convención tácita que solo los veteranos del proyecto
recuerdan.

---

## 7. Puntos clave para la carpeta docs/ del proyecto

Mapeando el contenido que **ya existe** contra los cuatro cuadrantes de Diátaxis:

| Cuadrante | ¿Cubierto hoy? | Evidencia |
|---|---|---|
| **Explicación** | Sí, extensamente | `IDEA.md` (visión, fundamentos teóricos, decisiones de diseño) e `investigaciones/01-12` son, en esencia, documentos de explicación profunda: responden "por qué" (ej. "por qué el %Z limita la corriente de falla", "por qué un TC con secundario abierto genera picos de tensión"), admiten razonamiento y comparación de alternativas, y están pensados para leerse alejados del momento de "hacer algo en el simulador" — exactamente el perfil de este cuadrante. |
| **Referencia** | Parcial, mezclada dentro de la explicación | Las tablas de valores normalizados (IEC 60038), fórmulas, límites de Dalziel, clasificaciones de topologías, etc. dentro de `investigaciones/` son material de referencia, pero están **incrustadas** dentro de documentos de explicación en vez de vivir en su propio espacio consultable — el patrón exacto que Diátaxis advierte que degrada ambos modos a la vez con el tiempo. |
| **Tutorial** | No existe | El proyecto no tiene código todavía (es la fase de investigación/diseño), así que no hay nada que "enseñar a hacer" paso a paso dentro de un simulador que aún no existe. |
| **Guía how-to** | No existe | Mismo motivo: no hay tareas operables ("cómo simular una falla de arco", "cómo agregar un nuevo componente 3D") porque no hay software ejecutable aún. |

Esto es exactamente lo esperable en la fase actual: un proyecto en investigación/diseño acumula
naturalmente explicación y algo de referencia incipiente, y **no puede** tener tutoriales ni guías
how-to reales todavía porque esos dos cuadrantes documentan interacción con un sistema que aún no
existe — intentar escribirlos ahora produciría documentación ficticia y frágil, desalineada del
código real en cuanto empiece a escribirse (el mismo problema que docs-as-code busca evitar).

**Estructura de `docs/` propuesta**, aplicando lo aprendido de Kubernetes/Django/Vue/Good Docs
Project (nombres cortos, un cuadrante por carpeta, referencia separada de explicación, glosario
propio, README de entrada por carpeta):

```
docs/
├── README.md                        # índice de docs/: qué hay en cada carpeta y cuándo consultarla
│
├── explanation/                     # cuadrante EXPLICACIÓN — ya existe como investigaciones/, se
│   │                                 # recomienda renombrar o enlazar como alias semántico
│   ├── README.md                    # índice (adaptado del investigaciones/README.md actual)
│   ├── 01-transformadores-potencia.md
│   ├── 02-interruptores-arco-electrico.md
│   ├── ...                          # 03-12 tal como existen hoy
│   └── 13-documentacion-framework-diataxis.md   # este mismo documento
│
├── reference/                       # cuadrante REFERENCIA — NUEVO, a extraer de investigaciones/
│   ├── README.md
│   ├── niveles-tension-iec60038.md          # tabla BT/MT/AT/EAT/UHV (hoy en IDEA.md §2.2)
│   ├── limites-dalziel-tensiones-seguras.md # límites de tensión de paso/malla (hoy en doc 04)
│   ├── formulas-per-unit.md                 # fórmulas base S/V/Z (hoy en doc 08)
│   ├── glosario.md                          # ver más abajo
│   └── normas-citadas.md                    # índice de normas IEEE/IEC referenciadas en todo el proyecto
│
├── tutorials/                       # cuadrante TUTORIAL — vacío hasta que exista código ejecutable
│   └── README.md                    # placeholder: "se llenará cuando el simulador tenga una
│                                     # primera versión navegable; ver docs/how-to/ para el estado
│                                     # actual del proyecto en cuanto a instrucciones operables"
│
├── how-to/                          # cuadrante GUÍA HOW-TO — vacío por el mismo motivo
│   └── README.md                    # placeholder con la misma nota
│
└── architecture/                    # NO es un cuadrante de Diátaxis puro; documentación para
    │                                 # contribuyentes al propio proyecto (equivalente a
    │                                 # internals/ de Django) — decisiones de stack, convenciones
    │                                 # de código, cómo correr el proyecto localmente una vez exista
    ├── README.md
    └── decisiones-tecnicas.md       # ADRs breves: por qué Three.js, por qué timestep fijo, etc.
                                      # (destila las secciones "Puntos clave" de investigaciones 09-12)
```

Notas de implementación concretas:

- **`investigaciones/` no desaparece**: es, de hecho, el cuadrante de explicación ya maduro. Basta
  con moverla o enlazarla dentro de `docs/explanation/` para que quede bajo el mismo paraguas que
  las demás carpetas, sin reescribir nada.
- **`docs/reference/` es el trabajo nuevo de mayor valor inmediato**: extraer las tablas, fórmulas y
  límites normativos que hoy están dispersos dentro de párrafos explicativos de `IDEA.md` e
  `investigaciones/01-12` hacia documentos de referencia austeros y consultables por separado —
  aplicando literalmente la lección de la sección 1.3: la explicación puede seguir citando la
  referencia con un enlace, pero la tabla en sí debe vivir en un solo lugar neutral.
- **`docs/tutorials/` y `docs/how-to/` deben crearse vacíos con un placeholder explícito**, no
  omitirse — dejar la carpeta ausente invita a que la primera guía de instalación que alguien
  escriba termine mezclada dentro de un README o de `IDEA.md` en vez de tener ya un lugar
  reservado y con la disciplina de escritura correcta desde el primer commit de código.
- **El glosario (`docs/reference/glosario.md`) debería crearse temprano**, antes que crezca más
  código, listando los términos españoles/ingleses que el proyecto usará de forma consistente
  (interruptor vs. disyuntor vs. breaker, seccionador vs. desconectador, pararrayos vs. descargador
  de sobretensión, etc.) — exactamente el problema que la sección 6 describe, y que es más barato
  prevenir ahora que corregir después de que el simulador y su documentación ya usen sinónimos
  distintos en paralelo.
- **El `README.md` raíz del repositorio** (hoy inexistente aparte de `IDEA.md`) debería, siguiendo
  la sección 5, quedar corto: qué es el proyecto, estado actual (investigación/diseño, sin código
  aún), y enlaces a `IDEA.md` y `docs/` — no absorber el contenido de ninguno de los dos.

---

## Fuentes

- [Diátaxis — página principal](https://diataxis.fr/)
- [Diátaxis — Tutorials](https://diataxis.fr/tutorials/)
- [Diátaxis — How-to guides](https://diataxis.fr/how-to-guides/)
- [Diátaxis — Reference](https://diataxis.fr/reference/)
- [Diátaxis — Explanation](https://diataxis.fr/explanation/)
- [Diátaxis — A map of needs](https://diataxis.fr/map/)
- [Kubernetes — Page content types (cita explícita a Diátaxis)](https://kubernetes.io/docs/contribute/style/page-content-types/)
- [Kubernetes — Documentation Style Guide](https://kubernetes.io/docs/contribute/style/style-guide/)
- [Kubernetes — Standardized Glossary](https://kubernetes.io/docs/reference/glossary/)
- [Cloudflare Blog — We rebuilt Cloudflare's developer documentation, here's what we learned](https://blog.cloudflare.com/new-dev-docs/)
- [Write the Docs — Docs as Code](https://www.writethedocs.org/guide/docs-as-code/)
- [Write the Docs — DocOps](https://www.writethedocs.org/guide/doc-ops/)
- [GitLab — Documentation workflow (archivo de referencia histórico)](https://archives.docs.gitlab.com/16.11/ee/development/documentation/workflow.html)
- [The Good Docs Project — templates (repositorio)](https://github.com/thegooddocsproject/templates)
- [GitHub — kubernetes/website (repositorio)](https://github.com/kubernetes/website)
- [GitHub — django/django, carpeta docs/](https://github.com/django/django/tree/main/docs)
- [GitHub — vuejs/docs (repositorio)](https://github.com/vuejs/docs)
- [GitHub — noffle/art-of-readme](https://github.com/noffle/art-of-readme)
- [GitHub — matiassingers/awesome-readme](https://github.com/matiassingers/awesome-readme)
- [Software Sustainability Institute — perfil de Daniele Procida](https://www.software.ac.uk/about/fellows/daniele-procida)
- [Stripe API Reference](https://docs.stripe.com/api)
