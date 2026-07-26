# Documentación de decisiones de ingeniería en empresas top de tecnología: ADR, Design Docs y RFC

> A diferencia de las investigaciones 01-12 (teoría eléctrica y arquitectura de software del
> simulador), este documento cubre un tema distinto pero directamente aplicable al propio proyecto:
> **cómo documentan sus decisiones técnicas** las organizaciones de ingeniería de software más
> maduras — no documentación de usuario final, sino documentación *interna*, dirigida a otros
> ingenieros, presentes y futuros. El objetivo concreto es fundamentar la estructura de una futura
> carpeta `docs/` para este proyecto, que capture de forma trazable decisiones ya tomadas (y
> dispersas dentro de las investigaciones 09-12) como "usar BFS/DFS sobre un grafo en vez de un
> solver de análisis nodal", "FSM a mano en vez de una librería de statecharts" o "`DataTexture`
> en CPU en vez de un shader GPU para el heatmap de tierra".

## 1. ADR — el formato original de Michael Nygard (2011)

El origen del término "Architecture Decision Record" es un artículo corto y muy citado de
[Michael Nygard, *Documenting Architecture
Decisions*](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) (Cognitect,
2011). Nygard identifica un problema muy concreto de cualquier proyecto de software que vive más
de unos meses: el código "simplemente es como es" — una arquitectura contiene decisiones (usar
esta librería y no aquella, resolver este problema con un grafo y no con álgebra lineal) cuyo
razonamiento original se pierde en canales efímeros (un chat, una reunión, la cabeza de un
ingeniero que ya rotó de equipo). Cuando ese razonamiento desaparece, un nuevo integrante del
equipo enfrenta dos malas opciones: **aceptar la decisión a ciegas** sin saber si sigue siendo
válida en el contexto actual, o **cambiarla a ciegas**, reintroduciendo sin saberlo un problema
que el equipo original ya consideró y descartó explícitamente por una buena razón. Ambos caminos
son costosos, y el segundo es peor porque *repite trabajo ya hecho* disfrazado de progreso.

La solución de Nygard es deliberadamente minimalista: un **Architecture Decision Record (ADR)** es
un documento corto — "una o dos páginas", dice el artículo original — con cinco componentes fijos:

- **Título**: una frase nominal corta y numerada (ej. *"ADR 1: Deployment on Ruby on Rails
  3.0.10"*).
- **Estado**: `propuesto`, `aceptado`, `desaprobado (deprecated)` o `reemplazado (superseded)`.
- **Contexto**: las fuerzas en juego al momento de decidir — técnicas, de negocio, de equipo,
  incluso políticas — descritas en lenguaje neutral y factual, sin argumentar todavía a favor de
  ninguna opción.
- **Decisión**: la respuesta, en voz activa: *"Decidimos hacer/usar X"*.
- **Consecuencias**: el resultado — positivo, negativo y neutral — que esa decisión deja para el
  desarrollo futuro. Nygard es explícito en que esta sección debe incluir también las
  consecuencias *negativas*, no solo justificar la elección.

El punto arquitectónico más importante del formato — y el que más se cita hoy — es la
**inmutabilidad**: un ADR aceptado **no se edita** cuando la decisión cambia. En vez de eso, se
escribe un **ADR nuevo** que referencia explícitamente al anterior y lo marca como *superseded*
(reemplazado), mientras el ADR original permanece con su estado actualizado pero su contenido
intacto. Nygard lo resume con una frase que se ha vuelto casi un lema del formato: *"los documentos
grandes nunca se mantienen actualizados"*, mientras que piezas pequeñas e inmutables son fáciles de
consumir para cualquier interesado, en cualquier momento, sin depender de que alguien las
mantenga sincronizadas con la realidad actual. El resultado es un **historial append-only** de
*por qué* se decidió algo en su momento — no solo qué se decidió — que sigue siendo válido como
registro histórico incluso después de que la decisión cambie. Esto es exactamente lo que resuelve
el problema descrito arriba: un ingeniero nuevo que encuentra "grafo con BFS, no MNA" puede leer el
ADR correspondiente y ver, en la sección Contexto, que el equipo *sí* consideró MNA/flujo de
potencia y lo descartó por una razón específica documentada — no tiene que reconstruir ese
razonamiento por sí mismo ni arriesgarse a reintroducir la complejidad ya evaluada y rechazada.

## 2. MADR — la evolución estructurada del formato

[MADR (Markdown Architectural Decision Records)](https://adr.github.io/madr/) es la evolución más
adoptada del formato de Nygard en el ecosistema open source moderno. Mantiene el espíritu — corto,
en Markdown, versionado junto al código en el repositorio — pero añade estructura explícita
pensada para *forzar* que el autor documente las alternativas descartadas, no solo la decisión
final. Las secciones del template actual de MADR son:

1. **Front matter** (metadatos opcionales en YAML: estado, fecha, quién decide, a quién se
   consultó, a quién se informa).
2. **Título**: frase corta representativa del problema resuelto y la solución encontrada.
3. **Contexto y planteamiento del problema** (*Context and Problem Statement*): 2-3 frases o una
   narrativa breve del problema, sin argumentar todavía.
4. **Fuerzas impulsoras / Decision Drivers** (opcional): la lista explícita de factores que
   presionan la decisión — rendimiento, costo de mantenimiento, curva de aprendizaje del equipo,
   alcance pedagógico, etc.
5. **Opciones consideradas** (*Considered Options*): la enumeración de las alternativas
   evaluadas, no solo la ganadora.
6. **Resultado de la decisión** (*Decision Outcome*): cuál opción se eligió y por qué, con
   justificación explícita frente a los *drivers* de la sección 4.
7. **Pros y contras de cada opción** (opcional pero central en la práctica): un análisis
   punto por punto de cada alternativa de la sección 5 — esta es la sección que MADR añade con más
   peso frente a Nygard, porque documenta *por qué se descartó* cada opción no elegida, no solo la
   que ganó.
8. **Confirmación** (opcional): cómo se valida que la decisión se implementó correctamente
   (un test, una revisión, un checklist).
9. **Consecuencias** y **Más información** (opcionales): efectos posteriores y enlaces de soporte.

La diferencia práctica frente a Nygard es de disciplina: el formato original permite (y en la
práctica invita) escribir solo "decidimos X porque Y", dejando implícitas las alternativas. MADR
obliga estructuralmente a nombrar cada alternativa considerada y evaluar sus pros/contras
explícitamente antes de llegar al resultado — lo que hace mucho más difícil, meses después, dudar
de si el equipo realmente evaluó la opción B o simplemente la ignoró.

## 3. Design Docs — la cultura de diseño previo al código en Google

Un [*design doc*](https://www.industrialempathy.com/posts/design-docs-at-google/) es, en la
cultura de ingeniería de Google, un documento informal que el autor (o autores) de un cambio
técnico no trivial escribe **antes de empezar a programar**, para exponer la estrategia de
implementación de alto nivel y — con mayor énfasis que en un ADR — los **trade-offs** considerados
en cada decisión de diseño. La estructura típica:

- **Contexto y alcance**: el paisaje técnico existente y qué se va a construir, en términos
  objetivos y sucintos.
- **Objetivos y no-objetivos** (*Goals and Non-Goals*): qué debe lograr el sistema, y — con
  igual peso — qué queda deliberadamente fuera de alcance. El artículo de referencia aclara que un
  no-objetivo no es un objetivo negado trivial ("el sistema no debería fallar"), sino una exclusión
  de alcance consciente que delimita el diseño.
- **Sección de diseño**: comienza con una visión general y luego detalla la solución,
  con énfasis explícito en los trade-offs — el artículo lo resume con una frase que condensa la
  filosofía entera del formato: *el design doc es el lugar para escribir los trade-offs que se
  hicieron al diseñar el software*.
- **Alternativas consideradas**: otros enfoques viables y por qué el diseño elegido satisface
  mejor los objetivos del proyecto.
- **Preocupaciones transversales** (*cross-cutting concerns*): seguridad, privacidad,
  observabilidad y temas similares que afectan al sistema completo, no a una sola pieza.

El proceso de revisión es tan importante como el documento en sí: el design doc se comparte para
**revisión por pares senior** antes de que empiece la implementación — el punto donde los
problemas de diseño son baratos de corregir (cambiar una frase en un documento) frente a
descubrirlos ya con código escrito (reescribir un módulo). Más allá del control de calidad, Google
le atribuye una función de **enseñanza y mentoría**: cuando un ingeniero —sobre todo uno junior—
se enfrenta a un sistema que no conoce, la pregunta reflexiva del equipo es *"¿dónde está el design
doc?"* — leer los design docs de decisiones pasadas es, en la práctica, cómo los ingenieros nuevos
aprenden a razonar sobre trade-offs de la forma en que lo hace el equipo, sin necesidad de que
alguien se los explique verbalmente uno por uno. Es documentación que enseña *el proceso de pensar*
la decisión, no solo su resultado.

## 4. El proceso RFC — Rust lang como caso ejemplar

El [proceso RFC de Rust](https://rust-lang.github.io/rfcs/) es uno de los procesos de código
abierto mejor documentados para decisiones de **impacto amplio**, con múltiples grupos de interés
que no pertenecen a un único equipo pequeño. Cualquier persona puede proponer un cambio sustancial
al lenguaje, Cargo, crates.io o al propio proceso RFC. El flujo tiene fases explícitas:

1. **Propuesta**: se hace fork del repositorio de RFCs y se escribe un documento basado en la
   plantilla oficial, que debe presentar una "motivación convincente" y demostrar que el autor
   entiende el impacto de diseño y los trade-offs involucrados. Se somete como pull request.
2. **Discusión abierta**: el sub-equipo relevante etiqueta la propuesta y la triage en reuniones
   futuras. Cualquier miembro de la comunidad puede comentar en el PR; el autor revisa el
   documento con nuevos commits, preservando el historial (está explícitamente prohibido reescribir
   o aplastar commits) — el historial de revisiones **es parte del registro** de cómo cambió el
   pensamiento colectivo sobre la propuesta.
3. **Final Comment Period (FCP)**: cuando la discusión ha madurado lo suficiente, un miembro del
   sub-equipo propone entrar en FCP con una disposición concreta (fusionar, cerrar o posponer).
   **Todos** los miembros del sub-equipo deben dar su visto bueno antes de que el FCP comience. El
   FCP dura un mínimo de diez días naturales, abarcando al menos cinco días hábiles, y se anuncia
   ampliamente para dar una última ventana de objeciones antes de la decisión final.
4. **Decisión documentada**: el RFC se fusiona o se cierra, y el sub-equipo agrega un comentario
   explicando la justificación si no queda ya clara en los hilos de discusión previos.

Este proceso es deliberadamente más pesado que un ADR: involucra a un equipo de revisión formal,
un período de espera mínimo obligatorio, y discusión pública abierta a toda la comunidad — apropiado
porque las decisiones que pasan por RFC en Rust afectan a millones de usuarios del lenguaje y a
docenas de equipos con intereses distintos. Un ADR, en cambio, es apropiado para una decisión que
un equipo pequeño puede tomar y vivir con sus consecuencias sin necesitar coordinar consenso a esa
escala. La proporción es clave: usar el peso de un RFC para una decisión de equipo pequeño es
burocracia innecesaria; usar el peso de un ADR para un cambio con impacto ancho de organización es
subestimar cuánta gente necesita enterarse y opinar antes de comprometerse.

## 5. PR-FAQ / Working Backwards — el método de Amazon

El método [*Working Backwards*](https://workingbackwards.com/resources/working-backwards-pr-faq/),
descrito en detalle por Colin Bryar y Bill Carr —ambos ex-ejecutivos de Amazon, Bryar fue Chief of
Staff de Jeff Bezos— en el libro homónimo, documenta la práctica interna de Amazon de escribir el
**comunicado de prensa (press release) y las preguntas frecuentes (FAQ)** de un producto o feature
**antes** de construirlo. El documento resultante, el **PR-FAQ**, tiene dos partes:

- **Press release** (una página): título de una sola frase que un cliente entendería, subtítulo
  identificando el segmento de cliente objetivo y el beneficio principal, un párrafo resumen (con
  ciudad, medio ficticio y fecha de lanzamiento, al estilo de una nota de prensa real), un párrafo
  de problema (el dolor del cliente, en su propio lenguaje, priorizando problemas con demanda de
  mercado sustancial), uno o más párrafos de solución (cómo el producto resuelve ese problema,
  reconociendo alternativas existentes y explicando la diferenciación), y cita(s) de un vocero y de
  un cliente ficticio junto con una llamada a la acción.
- **FAQ**: dividida en **FAQ externas** (las preguntas que haría un cliente: precio,
  funcionalidad, soporte, dónde comprarlo) y **FAQ internas** (las preguntas que haría el liderazgo
  de la empresa: posicionamiento competitivo, tamaño de mercado, desafíos técnicos, proyecciones
  financieras, riesgos regulatorios, métricas de éxito).

La razón de escribirlo *antes* de construir nada es explícita: forzar que el creador de la idea se
enfoque en el cliente, no en las capacidades internas del equipo — como dice el material de
referencia, *"escribir el comunicado de prensa es una función forzadora para asegurar que el
creador de la idea de producto esté enfocado en el cliente"*. Es el enfoque inverso al de un ADR:
un ADR parte de una decisión técnica ya semi-tomada y documenta su razonamiento; un PR-FAQ parte de
ninguna decisión técnica y fuerza claridad sobre el valor final para el usuario *antes* de
comprometer ingeniería a resolver el problema equivocado. Amazon atribuye a este proceso el diseño
de productos como Kindle, AWS y Alexa —no adivinando qué querían los clientes, sino trabajando
hacia atrás desde la historia que la empresa quería poder contar el día del lanzamiento.

## 6. Cuándo usar cada formato

| Formato | Peso / costo de escribirlo | Audiencia | Apropiado para |
|---|---|---|---|
| **ADR / MADR** | Bajo — media página a 2 páginas, minutos a ~1 hora | El propio equipo, presente y futuro; cualquiera que lea el repositorio | Una decisión técnica interna, ya tomada o casi, de un equipo pequeño (elegir una librería, un patrón, un algoritmo) |
| **Design Doc** (Google) | Medio — varias páginas, días de redacción + revisión por pares senior antes de aprobar | Ingenieros senior revisores + el equipo; también futuros ingenieros que se incorporen al sistema | Un cambio técnico no trivial, previo a escribir código, donde el trade-off entre 2+ enfoques viables no es obvio y vale la pena que otros lo cuestionen antes de invertir en implementación |
| **RFC** (estilo Rust) | Alto — documento formal + semanas de discusión pública + período de espera obligatorio (FCP) | Toda la comunidad/organización, múltiples equipos con intereses distintos | Un cambio con impacto ancho, que afecta a stakeholders fuera del equipo que lo propone, donde el consenso explícito importa más que la velocidad |
| **PR-FAQ / Working Backwards** | Medio-alto — semanas de iteración de redacción, centrado en narrativa de producto, no en arquitectura | Liderazgo de producto/negocio, no primariamente ingenieros | Una nueva iniciativa de producto o feature, cuando la pregunta abierta es *"¿debería existir esto y para quién?"*, no *"¿cómo lo construimos técnicamente?"* |

La distinción de fondo: ADR/MADR y RFC comparten el mismo objeto de documentación (una decisión
técnica) pero difieren en el tamaño del grupo cuyo consenso hace falta. Design Doc se ubica
conceptualmente entre ambos: más ceremonioso que un ADR individual porque cubre un cambio completo
(que puede generar varios ADRs derivados), pero sin la escala de discusión pública/multi-stakeholder
de un RFC. PR-FAQ es categóricamente distinto de los otros tres: no documenta una decisión técnica
en absoluto, documenta una decisión de *producto*, y se usa en una etapa anterior — antes de que
exista siquiera una pregunta de arquitectura que documentar.

## 7. Puntos clave para la carpeta `docs/` del proyecto

**(a) Qué formato conviene.** Para un proyecto de este tamaño — un simulador educativo con un
único desarrollador o un equipo muy pequeño, sin stakeholders externos que deban aprobar consenso
antes de fusionar una decisión — el proceso pesado de RFC (discusión pública, FCP de 10 días,
sign-off de sub-equipo) y el aparato de revisión por pares senior de un Design Doc de Google son
sobredimensionados: no hay una organización grande cuyo consenso haga falta coordinar, ni un
volumen de cambios simultáneos que justifique un proceso de triage formal. La elección correcta es
**ADR ligero en formato MADR** (Markdown, versionado junto al código en el repositorio, en
`docs/adr/`): lo bastante estructurado para forzar que se documenten las alternativas descartadas
(la sección "Opciones consideradas" / "Pros y contras" es exactamente lo que ya hacen, de forma
dispersa y en prosa, las investigaciones 09-12 al explicar por qué se descartó MNA, XState o un
shader GPU), pero sin el costo de proceso de un RFC o un Design Doc completo. El "Design Doc" como
concepto — documento previo a escribir código, con foco en trade-offs — sigue siendo útil como
*modo de pensar* antes de decisiones grandes (igual que el patrón de Harel se adopta sin adoptar
XState, investigación 12 §4), pero no necesita ser un formato de documento separado del ADR para
este proyecto: un MADR bien escrito con buena sección de contexto ya cumple esa función.

**(b) Lista de ADRs específicos a escribir**, extraídos de decisiones ya tomadas y documentadas en
IDEA.md e investigaciones 01-12:

1. **ADR-001: Usar primitivas geométricas de Three.js en vez de modelos 3D importados** — de
   IDEA.md §1/§8: "preferimos primitivas geométricas bien etiquetadas... a modelos importados
   bonitos pero mudos"; fidelidad conceptual sobre fidelidad fotorrealista.
2. **ADR-002: Separar el modelo de dominio eléctrico de la capa de render Three.js
   (`SubstationModel` sin imports de `three`)** — de IDEA.md §8 e investigación 12 §6: patrón
   MVP + pub-sub, testeable con Jest/Vitest sin WebGL.
3. **ADR-003: Representar la topología de la subestación como grafo con BFS/DFS, en vez de un
   solver de análisis nodal modificado (MNA) o flujo de potencia** — de investigación 12 §1-2: la
   pregunta relevante es alcanzabilidad/conectividad, no reparto de corriente; MNA queda
   documentado como ruta de escalado si el "modo diseñador" evoluciona a flujo de carga real.
4. **ADR-004: Implementar las máquinas de estado de los componentes (interruptor, seccionador,
   relé) como FSM a mano, sin adoptar XState/statecharts como dependencia de runtime** — de
   investigación 12 §3-4: se adopta el *patrón* de Harel (regiones paralelas comunicándose por
   eventos, no banderas compartidas) sin la librería, dado el número acotado de componentes.
5. **ADR-005: Bucle de simulación con timestep fijo y acumulador, desacoplado del framerate de
   render** — de investigación 09 §2/§6: patrón "Fix Your Timestep!" con clamp defensivo y tope de
   pasos por frame para evitar la "espiral de la muerte".
6. **ADR-006: Euler semi-implícito como método de integración por defecto para las EDOs del
   dominio (arco Cassie-Mayr), con sub-stepping o RK4 reservado a la ventana rígida del cruce por
   cero** — de investigación 09 §3: symplectic Euler como "gold standard" de motores interactivos
   frente a Euler explícito (inestable) y RK4 (4× costo, innecesario fuera de la ventana rígida).
7. **ADR-007: Heatmap de la malla de tierra calculado en CPU con `THREE.DataTexture`, en vez de
   cálculo directo en un fragment shader (GPGPU)** — de investigación 10 §1/tabla final: el campo
   no necesita animarse cada frame en la v1; recalcular al soltar un slider es más simple de
   depurar y reutiliza la misma función que ya calcula `E_step`/`E_touch`. Migrar a shader queda
   documentado como ruta de escape si se anima el GPR en tiempo real durante el transitorio de
   falla.
8. **ADR-008: `userData` de Three.js + jerarquía de `THREE.Group` como composición de
   componentes, en vez de adoptar un motor ECS (bitECS/miniplex)** — de investigación 12 §5: ya es,
   informalmente, una forma minimalista de ECS; migrar solo si el número de entidades crece a
   cientos o aparece necesidad real de serialización eficiente.
9. **ADR-009: Resolver el offset DC de cortocircuito con su solución analítica cerrada, en vez de
   integrarlo numéricamente paso a paso** — de investigación 09 §7: regla general del proyecto —
   integrar numéricamente solo cuando hay acoplamiento o no linealidad real (el arco sí califica,
   el offset DC no).

(Un proyecto de este tamaño no necesita más de 8-10 ADRs activos a la vez; esta lista ya cubre las
decisiones de mayor impacto arquitectónico documentadas hasta la investigación 12. Nuevas
decisiones — p. ej. cómo se estructura el "modo diseñador" de topologías, o si se introduce
TypeScript estricto — deberían generar ADRs nuevos según se tomen, no retrofitear esta lista.)

**(c) Plantilla `_template.md`** — MADR ligero, adaptado al tamaño del proyecto (se omiten
front-matter de roles organizacionales tipo "consulted/informed", que no aplican a un equipo de
una o pocas personas, pero se conserva la disciplina de listar opciones y pros/contras):

```markdown
---
# ADR-NNN: <Título corto, frase nominal, en imperativo del "qué se decide">
status: propuesto | aceptado | rechazado | reemplazado por ADR-NNN | deprecado
date: AAAA-MM-DD
supersedes: ADR-NNN (opcional, si reemplaza una decisión anterior)
superseded-by: ADR-NNN (opcional, se añade cuando este ADR queda obsoleto)
---

## Contexto y planteamiento del problema

<Describe, en 2-4 frases, el problema a resolver y las fuerzas en juego (técnicas, de alcance
pedagógico, de tamaño de equipo). Lenguaje neutral y factual — todavía sin argumentar a favor de
ninguna opción. Si esta decisión nace de una investigación previa, enlázala aquí
(ej. "ver investigaciones/12-arquitectura-simulacion-circuitos-estados.md §2").>

## Fuerzas impulsoras (decision drivers)

- <Factor 1, ej. "costo de implementación y mantenimiento por un equipo pequeño">
- <Factor 2, ej. "el objetivo pedagógico es X, no Y">
- <Factor 3, ej. "facilidad de testear sin depender de WebGL/render">

## Opciones consideradas

1. **<Opción A>** — <una frase>
2. **<Opción B>** — <una frase>
3. **<Opción C, si aplica>** — <una frase>

## Decisión

Se elige **<Opción X>**.

<Justificación breve en voz activa: "Decidimos X porque..." — remite a las fuerzas impulsoras de
arriba, no las repite en abstracto.>

## Pros y contras de las opciones

### <Opción A>

- Bueno, porque <razón>
- Malo, porque <razón>

### <Opción B>

- Bueno, porque <razón>
- Malo, porque <razón>

### <Opción C, si aplica>

- Bueno, porque <razón>
- Malo, porque <razón>

## Consecuencias

- **Positivas**: <qué se gana o simplifica>
- **Negativas**: <qué costo, límite o deuda técnica se acepta conscientemente>
- **Señal de escalar / revisar esta decisión**: <condición concreta y observable que, de
  cumplirse, justificaría abrir un nuevo ADR que reemplace este — ej. "si el número de entidades
  interactivas supera ~200" o "si el modo diseñador requiere flujo de carga real". No dejar esta
  sección vacía ni genérica: debe ser una señal verificable, no una vaguedad tipo "si el proyecto
  crece mucho".>

## Confirmación (opcional)

<Cómo se verifica que la decisión se implementó como se describe aquí — un test, un módulo
concreto, una revisión de código.>

## Más información (opcional)

<Enlaces a investigaciones/, discusiones, o material externo relevante.>
```

Nota de proceso: siguiendo a Nygard, **un ADR aceptado no se edita** cuando la decisión cambia —
se crea un ADR nuevo con `supersedes: ADR-NNN` en el front-matter, y el ADR viejo se actualiza
*solo* en su campo `status` a `reemplazado por ADR-NNN` (el resto del contenido queda intacto como
registro histórico). Esto es lo que hace que `docs/adr/` sea, con el tiempo, un historial confiable
de *por qué* el proyecto llegó a su arquitectura actual — no solo un snapshot de su estado final.

## Fuentes

- [Nygard, Michael. *Documenting Architecture Decisions*, Cognitect blog (2011)](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions)
- [MADR — Markdown Architectural Decision Records, especificación y template oficial](https://adr.github.io/madr/)
- [adr.github.io — Architectural Decision Records, sitio de referencia general del formato](https://adr.github.io/)
- [Ubl, Malte / industrialempathy.com. *Design Docs at Google*](https://www.industrialempathy.com/posts/design-docs-at-google/)
- [Ubl, Malte. *Design docs — A design doc* (post original en Medium)](https://medium.com/dev-channel/design-docs-a-design-doc-a152f4484c6b)
- [The Rust RFC Book — proceso RFC oficial de Rust lang](https://rust-lang.github.io/rfcs/)
- [rust-lang/rfcs — repositorio oficial en GitHub](https://github.com/rust-lang/rfcs)
- [Bryar, Colin & Carr, Bill. *Working Backwards: Insights, Stories, and Secrets from Inside Amazon* — sitio oficial del método](https://workingbackwards.com/resources/working-backwards-pr-faq/)
- [Working Backwards — *The Amazon Working Backwards PR/FAQ Process*, concepto explicado](https://workingbackwards.com/concepts/working-backwards-pr-faq-process/)
- [Commoncog — *Putting Amazon's PR/FAQ to Practice*, análisis técnico del método](https://commoncog.com/putting-amazons-pr-faq-to-practice/)
