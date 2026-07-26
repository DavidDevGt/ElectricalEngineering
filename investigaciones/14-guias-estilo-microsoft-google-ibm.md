# Guías de estilo de documentación técnica en Big Tech: Microsoft, Google, IBM

> Investigación de soporte para la carpeta `docs/` del proyecto. A diferencia de las
> investigaciones 01-13 (teoría eléctrica y arquitectura de software), este documento no trata
> el contenido técnico del simulador sino **cómo documentarlo bien**: compara con rigor las tres
> guías de estilo de documentación técnica más influyentes y públicas de la industria —
> **Microsoft Writing Style Guide**, **Google Developer Documentation Style Guide** e **IBM
> Style** — más el estándar de "plain language" del gobierno de EEUU que las tres citan como
> ancestro común. El objetivo es extraer los invariantes que definen "buena documentación
> técnica" según el consenso de la industria, para fundamentar la guía de estilo propia del
> proyecto (§8).

---

## 1. Voz y tono

Las tres guías coinciden en el eje central — **segunda persona + voz activa + tono conversacional
pero profesional** — aunque cada una lo articula distinto.

**Microsoft** define su voz corporativa explícitamente como "warm and relaxed, crisp and clear,
and ready to lend a hand" (cálida y relajada, nítida y clara, dispuesta a ayudar). El primero de
sus "Top 10 tips" es literalmente *"Use bigger ideas, fewer words"* (usa ideas más grandes, menos
palabras), con un ejemplo textual de reescritura:

> Antes: *"If you're ready to purchase Office 365 for your organization, contact your Microsoft
> account representative."*
> Después: *"Ready to buy? Contact us."*

El segundo tip, *"Write like you speak"*, da otro ejemplo de humanización de un mensaje de error:

> Antes: *"Invalid ID"*
> Después: *"You need an ID that looks like this: someone@example.com"*

Microsoft incluso prescribe el uso de contracciones (*it's*, *you'll*, *we're*) como parte de
"proyectar cercanía" — algo que en español técnico no tiene equivalente morfológico directo, pero
cuyo espíritu (evitar el registro rígido/burocrático) sí es trasladable.

**Google** describe su tono ideal como *"conversational, friendly, and respectful... casual,
natural, and approachable, not pedantic or pushy"*, y da una imagen memorable: la documentación
debe sonar *"like a knowledgeable friend who understands what the developer wants to do"* (un
amigo con conocimiento que entiende qué quiere lograr el desarrollador). Da también un contraste
explícito entre tono adecuado y tono excesivamente formal:

> Recomendado: *"This API lets you collect data about what your users like."*
> Demasiado formal: *"The API documented by this page may enable the acquisition of information
> pertaining to user preferences."*

Sobre segunda persona, la regla es tajante: *"Use second person: 'you' rather than 'we.'"* — con
la razón de fondo de que "we" (nosotros, la empresa) desplaza el foco del lector hacia el emisor,
mientras "you" mantiene al lector como sujeto de la acción.

**IBM Style** (DeRespinis et al., *The IBM Style Guide: Conventions for Writers and Editors*,
IBM Press, 2011) sigue el mismo eje de segunda persona + voz activa, con énfasis particular en la
**redacción para traducción global** (Global English) — una preocupación menos presente en
Microsoft/Google porque IBM históricamente traduce su documentación a decenas de idiomas
simultáneamente, lo que obliga a frases sintácticamente simples y sin ambigüedad referencial (un
pronombre debe tener un único antecedente posible).

Ninguna de las tres permite tono impersonal/pasivo tipo "el usuario deberá seleccionar la opción
deseada" — las tres tratan ese registro como un defecto a corregir, no como una opción de estilo
neutra.

---

## 2. Longitud de oración y estructura

**Microsoft** da la regla numérica más citada para párrafos: *"Three to seven lines is about the
right length for a paragraph"* — y permite explícitamente párrafos de una sola línea. Su sección
"Scannable content" formaliza el principio en tres imperativos consecutivos: *"1. Use short,
simple words. 2. Get to the point. 3. Then stop."* También prescribe que el contenido más
importante vaya en el primer bloque visible ("above the fold"), apoyándose en estudios de patrón
de lectura en "F" (el ojo del lector atiende primero la esquina superior izquierda).

**Google** no fija un número de palabras por oración, pero sí una regla estructural muy concreta
para instrucciones condicionales: *"Put conditions before instructions, not after"* — es decir,
"Si el archivo ya existe, elige otro nombre" en vez de "Elige otro nombre si el archivo ya
existe", porque el lector necesita saber la condición antes de actuar, no después de haber
empezado a leer la instrucción.

**Plain language** (plainlanguage.gov / digital.gov, el estándar del gobierno de EEUU que las
guías corporativas citan como ancestro) sí da una cifra explícita y ampliamente reproducida por
comunidades de redacción técnica: **promedio de ~20 palabras por oración**, con el objetivo
declarado de que el lector no tenga que releer una frase para entenderla. plainlanguage.gov añade
una regla anti-nominalización muy accionable: reemplazar sustantivaciones verbales (formas en
*-ment, -tion, -sion, -ance* en inglés; en español el equivalente son las terminaciones
*-ción, -miento, -aje*) por el verbo directo — su ejemplo es *"We analyze data"* en vez de *"We
conduct an analysis of the data"* (en español: "Analizamos los datos" en vez de "Realizamos un
análisis de los datos").

Ninguna de las tres guías da un límite duro de "pasos por procedimiento", pero las tres coinciden
en la práctica implícita: si un procedimiento supera ~7-10 pasos, se subdivide en sub-procedimientos
con sus propios encabezados, en vez de una lista numerada larga.

---

## 3. Voz activa vs. pasiva — la regla más citada de las tres

Es, sin excepción, la regla número uno de las tres guías, y las tres la justifican con el mismo
argumento: la voz activa deja explícito **quién hace qué**, mientras la pasiva puede ocultar al
actor y obligar al lector a inferirlo.

**Microsoft** (sección "Verbs" del style guide): *"Keep it active whenever you can — in active
voice, the subject of the sentence performs the action."* Ejemplo dado: *"The compiler
transformed source code into an executable"* (activa) vs. *"The source code was transformed into
an executable by the compiler"* (pasiva) — la primera es más corta y dice de inmediato quién actuó.

**Google** (`developers.google.com/style/voice`) es la guía más explícita en documentar la
**excepción**, con tres casos concretos en que la pasiva sí se permite:

1. **Para enfatizar el objeto sobre el actor**: *"The file is saved."* (no importa quién guardó
   el archivo, importa que quedó guardado).
2. **Para des-enfatizar al sujeto cuando resulta acusatorio o irrelevante**: *"Over 50 conflicts
   were found in the file"* es preferible a *"You created over 50 conflicts in the file"* — la
   pasiva evita culpar al lector por un resultado que no fue necesariamente su error directo.
3. **Cuando el actor es genuinamente desconocido o no importa identificarlo**: *"The database was
   purged in January"* (no interesa quién ejecutó la purga, solo que ocurrió).

Google también da el ejemplo canónico de instrucción imperativa en voz activa de segunda persona
implícita: *"Click Submit."* — el sujeto ("tú") queda implícito, que es la forma más económica de
voz activa en instrucciones paso a paso.

**IBM Style** documenta la misma preferencia y la misma excepción (actor desconocido o
irrelevante), con un matiz adicional relevante para documentación traducida: la voz pasiva sin
sujeto explícito es más difícil de traducir correctamente a idiomas donde la voz pasiva es menos
natural (varios idiomas asiáticos, por ejemplo), así que IBM la desaconseja incluso más
agresivamente que Microsoft o Google quienes escriben mayormente para audiencia angloparlante
directa.

**Convergencia**: las tres guías tratan la voz activa como default no negociable, y la voz pasiva
como herramienta deliberada — nunca como el resultado accidental de un registro "formal" o
"académico". Esto contrasta con la convención tradicional de la escritura técnica/científica en
español (y en inglés académico), donde la pasiva impersonal ("se procede a", "fue instalado") es
la norma culta esperada. Las tres guías de Big Tech rechazan explícitamente esa convención cuando
el objetivo es que alguien *actúe* siguiendo el texto, no que lo *lea* como reporte de un hecho ya
ocurrido.

---

## 4. Terminología e inclusividad

Las tres guías tratan la elección de términos con el mismo rigor que la gramática, con dos
preocupaciones entrelazadas: (a) evitar jerga innecesaria y definir acrónimos, y (b) reemplazar
terminología con connotaciones problemáticas por alternativas neutrales.

**Jerga y acrónimos.** Google define *jargon* como *"the specialized and often figurative
terminology of a specific group... camel case, swim lane, break-glass procedure, out-of-the-box"*,
y su regla es: si el término es necesario, **definirlo en el primer uso o enlazar a una
definición confiable**, y usarlo consistentemente después (no alternar sinónimos para el mismo
concepto, práctica que en redacción técnica se llama "elegant variation" y que estas guías
consideran un defecto, no una virtud estilística). IBM Style formaliza lo mismo bajo el principio
de **Global English**: cada término técnico se define la primera vez que aparece en un documento,
y el glosario del documento (si existe) debe ser la única fuente de verdad terminológica.

**Terminología con connotaciones problemáticas.** Es uno de los temas mejor documentados y más
convergentes entre las tres guías, con tablas casi idénticas:

| Término desaconsejado | Alternativa recomendada | Guía(s) que lo documentan |
|---|---|---|
| whitelist / blacklist | allowlist / blocklist (o allowlist / denylist) | Google, IBM |
| master / slave | primary/replica, primary/secondary, controller/worker, leader/follower | Microsoft ("primary/subordinate"), Google ("parent/replica"), IBM ("primary" + "replica/follower/secondary") |
| man-hours, mankind, manpower | person-hours, humanity/humankind, workforce/staff | Microsoft, Google |
| black hat / white hat (hacker) | attacker / defender u "offensive security researcher" | IBM |
| sanity check | "final check", "completeness check" | Google |
| crazy, insane, blind to (uso figurado) | baffling, anomalous, unaware of | Google (lenguaje "ableista") |
| he/she genérico | reescritura en plural, "the", segunda persona, o *they* singular | Microsoft (ejemplos textuales de reescritura, ver abajo) |

Microsoft da ejemplos de reescritura completos para eliminar pronombres genéricos de género, que
son útiles como plantilla de técnica (no solo de resultado):

> Antes: *"If the user has the appropriate rights, he can set other users' passwords."*
> Después: *"If you have the appropriate rights, you can set other users' passwords."* (o: *"A
> user with the appropriate rights can set other users' passwords."*)

La razón declarada por las tres empresas para el reemplazo de "master/slave" y "blacklist/whitelist"
es la misma: son metáforas que, aunque técnicamente arraigadas (control de replicación de bases de
datos, filtrado de red), cargan connotaciones históricas de esclavitud y de asociación
racializada blanco=bueno/negro=malo, y existen alternativas igualmente precisas y sin ese costo
(allowlist/blocklist son, de hecho, *más* precisas que whitelist/blacklist, porque describen la
función — permitir/bloquear — en vez de una metáfora de color).

IBM matiza, de forma poco frecuente en estas guías, que el reemplazo aplica primero a **contenido
nuevo**; en productos o APIs existentes donde el término forma parte de un nombre de campo o
parámetro ya publicado, IBM prioriza no romper la compatibilidad y coordina el cambio con el
equipo de desarrollo antes de renombrar en la documentación.

---

## 5. Formato de procedimientos (how-to / tutoriales)

Aquí es donde las tres guías convergen casi palabra por palabra, porque describen literalmente el
mismo objeto (un procedimiento paso a paso) resuelto de forma casi idéntica en las tres empresas:

- **Pasos numerados** para toda secuencia que deba ejecutarse en orden; listas con viñetas para
  todo lo demás (opciones, requisitos, no-secuencias). Google formaliza subniveles: pasos
  numerados → sub-pasos con letras minúsculas → sub-sub-pasos con números romanos minúsculos.
- **Negrita para elementos de interfaz** referenciados literalmente: Google da el ejemplo *"Click
  **Clear logcat**"* y *"In Google Docs, click **File > New > Document**."* — el uso de `>` para
  encadenar selecciones de menú secuenciales en un solo paso (*"Click **Next > Finish**"*) es una
  convención compartida por Microsoft e IBM también.
- **Bloques de código con resaltado de sintaxis**, en fuente monoespaciada, separados del texto en
  prosa. Google añade una regla de redacción poco obvia pero valiosa: *"Avoid using 'run the
  following command' to introduce code. Instead, focus on what the command does"* — es decir,
  preferir "Este comando reinicia el servicio X" a la fórmula genérica "Ejecuta el siguiente
  comando", porque la primera le dice al lector *qué logra* el comando antes de que lo ejecute.
- **Pasos opcionales marcados explícitamente**: Google prescribe iniciar el paso con la palabra
  *"Optional:"* seguida de dos puntos, en vez de dejar la opcionalidad implícita en el texto.
- **Notas y advertencias estandarizadas** en callouts con etiqueta y jerarquía de severidad
  reconocible: *Nota* (información adicional no crítica), *Importante* (información que puede
  afectar el resultado si se ignora), *Precaución/Atención* (riesgo de daño a datos o
  configuración), *Advertencia/Peligro* (riesgo de daño físico o pérdida grave e irreversible).
  IBM Style dedica una sección completa a "notes and notices" con esta misma jerarquía de cuatro
  niveles, y es la fuente histórica de la convención — Microsoft y Google la heredan con nombres
  casi idénticos.
- **Contexto antes de la acción**: Google es explícito — *"Tell the reader where to complete an
  action... before you state the action"* (ej. "En el panel de configuración, selecciona X" en
  vez de "Selecciona X en el panel de configuración") — el lector necesita ubicarse antes de
  actuar, no después.

Este es, junto con la voz activa, el punto de mayor convergencia literal entre las tres guías: un
lector que domina el formato de procedimientos de Microsoft Learn puede seguir sin fricción un
tutorial de Google Cloud o de IBM Docs, porque las convenciones visuales (negrita = UI, monoespaciada
= código, callout con etiqueta = advertencia) son, en la práctica, un estándar de facto de la
industria más que una elección de marca de cada empresa.

---

## 6. Accesibilidad en la escritura

Las tres guías tratan la accesibilidad como parte del estilo, no como un capítulo aparte de
cumplimiento legal.

**Texto alternativo en imágenes.** Google es tajante: *"For every image, provide an alt
attribute... Don't present new information in images. Always provide an equivalent text
explanation with the image."* — es decir, una imagen nunca debe ser el único vehículo de una
instrucción o dato; el texto que la acompaña debe ser autosuficiente incluso si la imagen no
carga o no es perceptible. Para imágenes puramente decorativas, el `alt` debe quedar vacío (para
que un lector de pantalla no las anuncie como contenido).

**No depender solo del color.** Google formula la regla de forma general y con mecanismo de
respaldo: *"Don't use color, size, location, or other visual cues as the primary way of
communicating information"* y, cuando el color sí se usa para indicar estado, *"also provide a
secondary cue, such as a change in the text label"*. Esto descarta instrucciones como "haz clic en
el botón verde" (falla para lectores con daltonismo, o si la captura de pantalla cambia de tema
claro/oscuro) en favor de identificar el elemento por su etiqueta de texto o posición estructural
("el botón **Guardar**", no "el botón verde de la derecha").

**Jerarquía de encabezados.** Las tres guías coinciden en que los encabezados deben formar un
árbol sin saltos de nivel — Google lo dice explícitamente: *"Don't skip levels of the heading
hierarchy. For example, put an h3 element only after an h2 element"* — porque los lectores de
pantalla navegan documentos largos saltando entre encabezados, y un salto de nivel (de h2 a h4 sin
pasar por h3) rompe esa navegación aunque visualmente el documento se vea correcto. Microsoft
añade el uso de mayúscula tipo oración (no Title Case) en encabezados como parte de la misma
familia de reglas de escaneo/accesibilidad: reduce la carga cognitiva de lectura de encabezados
largos.

---

## 7. Los invariantes — qué tienen en común las tres guías

Sintetizando lo anterior, estas son las reglas que aparecen, en esencia, **en las tres guías**
(con nombres distintos pero la misma intención), y que por tanto constituyen el estándar de facto
de la industria — no una preferencia arbitraria de una sola empresa:

1. **Voz activa por defecto.** El sujeto gramatical hace la acción. La pasiva se reserva para
   cuando el actor es desconocido, irrelevante, o cuando nombrar al lector como actor resultaría
   acusatorio.
2. **Segunda persona directa.** Hablarle al lector ("tú/usted", nunca "el usuario deberá...").
   El lector es el sujeto de las instrucciones, no un tercero observado.
3. **Una idea por oración, oraciones cortas.** ~20 palabras de promedio es la cifra de referencia
   de plain language; Microsoft prefiere directamente medirlo en líneas de párrafo (3-7).
4. **Instrucción = verbo imperativo al inicio del paso.** "Haz clic en Guardar", no "El botón
   Guardar debe hacerse clic" ni "Se debe hacer clic en el botón Guardar".
5. **Terminología consistente y definida en el primer uso.** Un concepto, un término, siempre —
   nunca alternar sinónimos por variedad estilística ("elegant variation" es un defecto aquí, no
   una virtud).
6. **Formato visual con significado fijo.** Negrita = elemento de interfaz. Monoespaciada = código
   o valor literal. Callouts con etiqueta (Nota/Importante/Precaución/Advertencia) para
   información fuera del flujo lineal del procedimiento.
7. **Contexto antes de acción.** Decir dónde ocurre algo antes de decir qué hacer ahí.
8. **La imagen nunca es la única portadora de información.** Todo dato o instrucción visual debe
   tener equivalente textual (alt text, o texto que no dependa del color/posición).
9. **Jerarquía de encabezados sin saltos**, usada para navegación real (índice, lectores de
   pantalla), no solo para jerarquía visual.
10. **Terminología libre de connotaciones problemáticas** cuando existe alternativa igual de
    precisa (allowlist/blocklist, primary/replica) — tratado como parte del estilo técnico, no
    como una sección aparte de "políticas".

---

## 8. Puntos clave para la guía de estilo del proyecto

El proyecto ya tiene un tono establecido en `IDEA.md` e `investigaciones/`: español técnico,
denso en ecuaciones y tablas, con términos en inglés cuando son estándar de facto de la industria
eléctrica (%Z, tap changer, inrush, TRV). La guía de estilo de `docs/` **no debe importar el tono
"cálido y conversacional" de Microsoft/Google tal cual** — sería inconsistente con el registro ya
usado en 13 documentos existentes — sino aplicar los invariantes de la sección 7 al registro que
el proyecto ya tiene. Propuesta concreta:

- **Voz activa siempre que el sujeto sea identificable.** "El relé 87T compara las corrientes de
  entrada y salida" en vez de "las corrientes de entrada y salida son comparadas por el relé
  87T". Pasiva solo cuando el actor es genuinamente irrelevante para el punto que se explica (ej.
  "la malla de tierra fue diseñada bajo IEEE 80" cuando lo que importa es la norma, no quién
  diseñó).
- **Segunda persona solo en documentación orientada a acción** (ej. futuros tutoriales de uso del
  simulador: "haz clic en el interruptor para abrirlo"). En las investigaciones técnicas
  (01-14), que son expositivas y no instructivas, se mantiene la tercera persona técnica actual
  — no hay conflicto real aquí porque son géneros distintos dentro del mismo proyecto.
- **Una idea por oración cuando la oración no es una ecuación o dato cuantitativo.** El estilo
  actual ya tiende a oraciones largas cargadas de datos entre paréntesis (ver ejemplos en
  `01-transformadores-potencia.md`) — es aceptable en investigación densa, pero **no** en
  secciones de procedimiento (ej. cómo correr el simulador, cómo agregar un componente 3D nuevo),
  donde debe regir la regla de oración corta y un paso por línea.
- **Términos técnicos: español con el término en inglés entre paréntesis en el primer uso**,
  igual que ya hace `IDEA.md` (ej. "alta tensión (AT/HV)"). No traducir términos que no tienen
  traducción estándar en la industria hispanohablante (tap changer, inrush) ni forzar anglicismos
  donde ya existe término español establecido (usar "cortocircuito", no "short circuit").
- **Formato de procedimientos idéntico al invariante de la industria**: pasos numerados, negrita
  para UI del simulador (botones, paneles), bloques de código en monoespaciada, y cuatro niveles
  de callout en español — **Nota**, **Importante**, **Precaución**, **Advertencia** — reservando
  Advertencia para casos donde una acción es irreversible o puede llevar a una conclusión técnica
  incorrecta (coherente con el rigor conceptual que el proyecto ya exige, ver IDEA.md §1: "fidelidad
  de mecanismo > fidelidad de resultado").
- **Encabezados jerárquicos sin saltos**, en minúscula tipo oración salvo nombres propios y
  siglas técnicas (IEEE 80, %Z, 87T) — coherente con la convención ya usada en los 13 documentos
  existentes.
- **Toda figura/diagrama del simulador debe tener descripción textual equivalente** en la
  documentación (no solo un pie de imagen decorativo) — relevante en particular porque el
  proyecto es 3D e interactivo: la documentación de cada componente debe poder explicarse sin
  depender de que el lector vea el render.
- **Terminología consistente por glosario único**: dado que el proyecto ya acumula 13 documentos
  con términos técnicos específicos (TRV, %Z, per-unit, N-1), `docs/` debería fijar un glosario
  canónico que enlace a la investigación fuente donde el término se define con rigor, evitando
  redefinir el mismo concepto con palabras distintas en cada documento nuevo.

En síntesis: la guía de estilo del proyecto no adopta el tono de marca de ninguna de las tres
empresas, sino los **mecanismos** que las tres comparten (voz activa, un paso por línea, formato
visual con significado fijo, accesibilidad textual) — aplicados al registro técnico-denso que
`IDEA.md` e `investigaciones/` ya establecieron como identidad propia del proyecto.

---

## Fuentes

- [Microsoft Writing Style Guide — Welcome](https://learn.microsoft.com/en-us/style-guide/welcome/)
- [Top 10 tips for Microsoft style and voice](https://learn.microsoft.com/en-us/style-guide/top-10-tips-style-voice)
- [Bias-free communication — Microsoft Style Guide](https://learn.microsoft.com/en-us/style-guide/bias-free-communication)
- [Scannable content — Microsoft Style Guide](https://learn.microsoft.com/en-us/style-guide/scannable-content/)
- [Verbs — Microsoft Style Guide](https://learn.microsoft.com/en-us/style-guide/grammar/verbs)
- [Google developer documentation style guide — Highlights](https://developers.google.com/style/highlights)
- [Google developer documentation style guide — Voice and tone](https://developers.google.com/style/tone)
- [Google developer documentation style guide — Active voice](https://developers.google.com/style/voice)
- [Google developer documentation style guide — Second person and first person](https://developers.google.com/style/person)
- [Google developer documentation style guide — Procedures](https://developers.google.com/style/procedures)
- [Google developer documentation style guide — Write accessible documentation](https://developers.google.com/style/accessibility)
- [Google developer documentation style guide — Write inclusive documentation](https://developers.google.com/style/inclusive-documentation)
- [Google developer documentation style guide — Jargon](https://developers.google.com/style/jargon)
- [Making the Google Developers documentation style guide public — Google Open Source Blog](https://opensource.googleblog.com/2017/09/making-google-developers-documentation.html)
- [The IBM Style Guide: Conventions for Writers and Editors — Pearson/InformIT](https://www.informit.com/store/ibm-style-guide-conventions-for-writers-and-editors-9780132101301)
- [IBM's Inclusive IT Language — Call for Code for Racial Justice (GitHub)](https://github.com/Call-for-Code-for-Racial-Justice/IBM-Inclusive-IT-Language)
- [Plain language guidelines — Digital.gov](https://digital.gov/guides/plain-language)
- [Writing for understanding — Digital.gov (plain language)](https://digital.gov/guides/plain-language/writing)
