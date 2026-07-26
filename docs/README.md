# docs/ — Documentación del proyecto

Este directorio organiza la documentación del simulador siguiendo el framework
**[Diátaxis](https://diataxis.fr/)** (tutoriales, guías how-to, referencia, explicación) y las
prácticas de documentación de ingeniería ("docs-as-code", Architecture Decision Records) usadas por
Kubernetes, Google, Microsoft, IBM y otros proyectos/empresas de referencia — ver la investigación
que fundamenta estas decisiones en
[investigaciones/13-15](../investigaciones/README.md#ingeniería-de-software-de-la-documentación).

## Cómo navegar esto

| Carpeta | Cuadrante Diátaxis | Pregunta que responde | Estado |
|---|---|---|---|
| [`explanation/`](explanation/README.md) | Explicación | "¿Por qué...?" | Cubierto — es [`../investigaciones/`](../investigaciones/README.md) |
| [`reference/`](reference/README.md) | Referencia | "¿Qué es...?" (consulta rápida) | En construcción |
| [`tutorials/`](tutorials/README.md) | Tutorial | "¿Puedes enseñarme a...?" | Vacío — no hay código todavía |
| [`how-to/`](how-to/README.md) | Guía how-to | "¿Cómo hago...?" | Vacío — no hay código todavía |
| [`adr/`](adr/README.md) | *(no es un cuadrante Diátaxis)* | "¿Por qué se decidió así, técnicamente?" | 9 decisiones registradas |

**Regla de oro** (la razón de ser de esta estructura, ver investigación 13 §1.3): cada documento
vive en un solo cuadrante y no mezcla modos. Un documento de referencia no explica ni opina; un
documento de explicación no da pasos numerados de instalación; un tutorial no se desvía a teoría.
Si algo que escribes empieza a hacer las dos cosas a la vez, es la señal de que necesita partirse
en dos documentos, no de que el cuadrante está mal elegido.

## Estado actual del proyecto

El proyecto está en fase de **investigación y diseño** — no existe código todavía (ver
[../IDEA.md](../IDEA.md) para la visión completa y [`../investigaciones/`](../investigaciones/README.md)
para la investigación técnica de soporte, 15 documentos entre teoría eléctrica e ingeniería de
software del propio simulador). Por eso `tutorials/` y `how-to/` existen como carpetas con un
placeholder explícito en vez de estar ausentes: reservan su lugar y su disciplina de escritura
desde antes del primer commit de código, para que la primera guía de instalación no termine
mezclada dentro de un README o de `IDEA.md`.

## Para contribuir documentación

Sigue [`STYLE_GUIDE.md`](STYLE_GUIDE.md) — es la guía de estilo propia del proyecto, sintetizada
(no copiada) de las guías públicas de Microsoft, Google e IBM, aplicada al registro técnico-denso
que `IDEA.md` e `investigaciones/` ya establecieron como identidad del proyecto.

Antes de documentar una decisión técnica de arquitectura (no de teoría eléctrica — esa va en
`investigaciones/`), revisa si corresponde un nuevo ADR en [`adr/`](adr/README.md).
