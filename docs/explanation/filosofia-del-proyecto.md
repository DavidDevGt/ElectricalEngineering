# Filosofía del proyecto

Este documento es distinto de `investigaciones/` — no explica un principio de ingeniería eléctrica
ni una técnica de software, sino **por qué el proyecto está diseñado como está**, con opinión y
perspectiva (el cuadrante Explicación admite esto explícitamente, a diferencia de Referencia — ver
[investigación 13 §1.2](../../investigaciones/13-documentacion-framework-diataxis.md)).

## Fidelidad conceptual sobre fidelidad fotorrealista

La decisión de fondo de todo el proyecto, tomada antes de escribir una sola línea de código
(`IDEA.md` §1), es preferir primitivas geométricas bien etiquetadas y con comportamiento correcto
a modelos importados fotorrealistas pero mudos. Esto no es una limitación técnica — es una
apuesta pedagógica: un usuario que entiende *por qué* la luz de estado del transformador cambia de
ámbar a verde ha aprendido algo sobre la curva de eficiencia; un usuario que ve un modelo
fotorrealista sin esa conexión no ha aprendido nada, por bonito que sea el render.

Esto se extendió, tras la investigación de la sección de ingeniería de software (docs 09-12), a un
principio hermano: **fidelidad de mecanismo sobre fidelidad de resultado**. No basta con que el
simulador muestre el resultado correcto (el pararrayos "recorta" la sobretensión) — debe exponer
*por qué* ocurre (la no-linealidad V-I del ZnO), porque el resultado sin el mecanismo es
indistinguible de un truco visual.

## Por qué existen 15 documentos de investigación antes de tener una interfaz completa

Es tentador ver 15 documentos de investigación y un simulador con un solo componente terminado
como una desproporción. La apuesta explícita del proyecto es la contraria: cada componente que se
construye (el transformador fue el primero) hereda directamente ecuaciones, valores normativos y
mecánicas ya investigadas y verificadas contra fuentes primarias (IEEE, IEC, papers), en vez de
improvisarse al momento de escribir el código. El costo es que el primer componente tardó más en
aparecer; el beneficio es que cuando aparece, cada número que muestra (el 45% de carga óptima, el
10× de corriente de falla) es trazable a una fórmula documentada y citada — no un valor inventado
para que "se vea bien" en la demo.

## Por qué el modelo de dominio no sabe que existe Three.js

La separación de `ADR-002` no es dogma arquitectónico gratuito: nace de una pregunta muy concreta
— ¿cómo se prueba que la fórmula de eficiencia `η(x) = P_salida / (P_salida + P_Fe + P_Cu(x))` está
bien implementada, sin tener que abrir un navegador y leer un panel HTML cada vez? La respuesta es
que no debería requerir un navegador en absoluto. `src/domain/components/Transformer.ts` es, por
diseño, una clase de TypeScript sin ningún `import` de `three` — se puede instanciar, llamarle
`setLoadFactor(0.6)`, y leer `.efficiency` en un test o en un REPL de Node, exactamente igual que
se probaría cualquier otra lógica de negocio. La escena 3D es una *consecuencia* de ese estado, no
su fuente.

## Por qué la documentación tiene esta estructura (Diátaxis)

Este mismo `docs/` es un ejemplo aplicado de la investigación 13: cada carpeta responde una sola
pregunta (explicación → por qué, referencia → qué es, tutorial → enséñame, how-to → cómo hago) y
deliberadamente no se mezclan. Cuando este documento empezó a explicar cómo instalar el proyecto,
esa sección se movió a [`../how-to/`](../how-to/README.md) en vez de quedarse aquí — es la regla
de la sección 1.3 de esa investigación aplicada sobre sí misma, no solo citada.

## Ver también

- [`../../IDEA.md`](../../IDEA.md) — visión completa del proyecto.
- [`../adr/`](../adr/README.md) — decisiones de arquitectura concretas que implementan esta
  filosofía.
- [`../../investigaciones/11-diseno-simuladores-educativos.md`](../../investigaciones/11-diseno-simuladores-educativos.md) — la base pedagógica (PhET, ciclo POE) detrás de "fidelidad de mecanismo".
