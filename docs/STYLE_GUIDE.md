# Guía de estilo de la documentación

Síntesis aplicada al proyecto de los invariantes comunes entre el *Microsoft Writing Style Guide*,
el *Google developer documentation style guide* e *IBM Style* — investigación completa en
[`investigaciones/14-guias-estilo-microsoft-google-ibm.md`](../investigaciones/14-guias-estilo-microsoft-google-ibm.md).
Esta guía **no** adopta el tono "cálido y conversacional" de marca de esas empresas — sería
inconsistente con el registro técnico-denso que `IDEA.md` e `investigaciones/` ya establecieron —
sino los *mecanismos* que las tres comparten, aplicados a ese registro.

## Reglas

1. **Voz activa siempre que el sujeto sea identificable.**
   ✅ "El relé 87T compara las corrientes de entrada y salida."
   ❌ "Las corrientes de entrada y salida son comparadas por el relé 87T."
   Pasiva solo cuando el actor es genuinamente irrelevante para el punto que se explica (ej. "la
   malla de tierra fue diseñada bajo IEEE 80" cuando lo que importa es la norma, no quién diseñó).

2. **Segunda persona solo en documentación orientada a acción** (`tutorials/`, `how-to/`, futuros
   README de instalación): "Haz clic en el interruptor para abrirlo." Las investigaciones técnicas
   y `explanation/` son expositivas, no instructivas, y mantienen tercera persona técnica — son
   géneros distintos dentro del mismo proyecto, no una inconsistencia.

3. **Una idea por oración cuando la oración no es una ecuación o dato cuantitativo.** El estilo
   actual de `investigaciones/` tiende a oraciones largas cargadas de datos entre paréntesis — es
   aceptable en investigación densa (el lector la consulta, no la sigue paso a paso), pero **no**
   en `how-to/`/`tutorials/`, donde rige oración corta y un paso por línea.

4. **Instrucción = verbo imperativo al inicio del paso.**
   ✅ "Abre el seccionador."
   ❌ "El seccionador debe abrirse." / "Se procede a abrir el seccionador."

5. **Términos técnicos: español con el término en inglés entre paréntesis en el primer uso**, igual
   que ya hace `IDEA.md` (ej. "alta tensión (AT/HV)"). No traducir términos sin traducción estándar
   en la industria hispanohablante (*tap changer*, *inrush*); no forzar anglicismos donde ya existe
   término español establecido (usar "cortocircuito", no *short circuit*).

6. **Terminología consistente y definida en el primer uso** — un concepto, un término, siempre.
   Alternar sinónimos por variedad estilística ("elegant variation") es un defecto, no una virtud,
   en documentación técnica. Consulta y actualiza [`reference/glosario.md`](reference/glosario.md)
   antes de introducir un término nuevo o un sinónimo de uno ya usado.

7. **Formato visual con significado fijo**:
   - **Negrita** → elemento de interfaz del simulador (botones, paneles) una vez exista UI.
   - `Monoespaciada` → código, valores literales, nombres de archivo/carpeta.
   - Callouts con cuatro niveles fijos: **Nota** (información adicional no crítica), **Importante**
     (afecta el resultado si se ignora), **Precaución** (riesgo de dato/configuración incorrecta),
     **Advertencia** (acción irreversible o conclusión técnica incorrecta — reservado, coherente
     con IDEA.md §1: "fidelidad de mecanismo > fidelidad de resultado").

8. **Contexto antes de acción.** "En el panel de configuración, selecciona X", no "Selecciona X en
   el panel de configuración" — el lector necesita ubicarse antes de actuar, no después.

9. **Encabezados jerárquicos sin saltos** (nunca de `##` a `####` sin pasar por `###`), en
   minúscula tipo oración salvo nombres propios y siglas técnicas (IEEE 80, %Z, 87T) — coherente
   con la convención ya usada en `investigaciones/`.

10. **Toda figura/diagrama debe tener descripción textual equivalente**, no solo un pie de imagen
    decorativo — relevante en particular porque el proyecto es 3D e interactivo: cada componente
    debe poder explicarse sin depender de que el lector vea el render.

11. **Pasos numerados para secuencias, viñetas para todo lo demás** (opciones, requisitos,
    no-secuencias). Si un procedimiento supera ~7-10 pasos, se subdivide con sub-encabezados.

12. **Nunca introducir terminología con connotaciones problemáticas cuando existe alternativa
    igual de precisa** (ej. *allowlist/blocklist* en vez de *whitelist/blacklist* si el proyecto
    llegara a necesitar ese concepto en su capa de software).

## Qué NO copiar de Microsoft/Google/IBM

- El tono de marca "amigo con conocimiento" (Google) o las contracciones coloquiales (Microsoft):
  el registro de este proyecto es técnico-académico, no de producto de consumo.
  - El texto motivacional de venta ("¿Listo para empezar?"): este es un proyecto educativo de
  ingeniería, no un producto comercial con *call to action*.

## Ver también

- [`investigaciones/14-guias-estilo-microsoft-google-ibm.md`](../investigaciones/14-guias-estilo-microsoft-google-ibm.md) — la investigación completa con ejemplos textuales de cada guía.
- [`investigaciones/13-documentacion-framework-diataxis.md`](../investigaciones/13-documentacion-framework-diataxis.md) — por qué `docs/` está organizado en cuadrantes.
