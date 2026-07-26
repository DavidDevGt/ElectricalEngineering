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
| [`explanation/`](explanation/README.md) | Explicación | "¿Por qué...?" | [`../investigaciones/`](../investigaciones/README.md) (15 docs) + 1 documento propio (filosofía del proyecto) |
| [`reference/`](reference/README.md) | Referencia | "¿Qué es...?" (consulta rápida) | 7 documentos (niveles de tensión, BIL/BSL, IEEE 80, per-unit, topologías, glosario, normas) |
| [`tutorials/`](tutorials/README.md) | Tutorial | "¿Puedes enseñarme a...?" | 2 tutoriales (inspección del transformador, maniobra segura con enclavamiento) |
| [`how-to/`](how-to/README.md) | Guía how-to | "¿Cómo hago...?" | 4 guías (correr el simulador, agregar componente 3D, escribir ADR, agregar investigación) |
| [`adr/`](adr/README.md) | *(no es un cuadrante Diátaxis)* | "¿Por qué se decidió así, técnicamente?" | 9 decisiones registradas |

**Regla de oro** (la razón de ser de esta estructura, ver investigación 13 §1.3): cada documento
vive en un solo cuadrante y no mezcla modos. Un documento de referencia no explica ni opina; un
documento de explicación no da pasos numerados de instalación; un tutorial no se desvía a teoría.
Si algo que escribes empieza a hacer las dos cosas a la vez, es la señal de que necesita partirse
en dos documentos, no de que el cuadrante está mal elegido.

## Estado actual del proyecto

El simulador corre una **bahía de línea completa** — 10 componentes (transformador, interruptor,
2 seccionadores, TC, TP, pararrayos, barra colectora, malla de tierra, relé de protección) en modo
inspección (click → panel de datos técnicos) y modo maniobra (enclavamiento real, con bloqueo y
razón mostrada), sobre un boilerplate Vite + TypeScript + Three.js que implementa los 9 ADRs
registrados (ver [../IDEA.md](../IDEA.md) §9 para el detalle de qué está hecho y qué falta, y
[`../investigaciones/`](../investigaciones/README.md) para las 15 investigaciones de soporte).
`tutorials/` y `how-to/` dejaron de ser placeholders — documentan pasos reales, verificados contra
el código en ejecución, no instrucciones especulativas.

## Para contribuir documentación

Sigue [`STYLE_GUIDE.md`](STYLE_GUIDE.md) — es la guía de estilo propia del proyecto, sintetizada
(no copiada) de las guías públicas de Microsoft, Google e IBM, aplicada al registro técnico-denso
que `IDEA.md` e `investigaciones/` ya establecieron como identidad del proyecto.

Antes de documentar una decisión técnica de arquitectura (no de teoría eléctrica — esa va en
`investigaciones/`), revisa si corresponde un nuevo ADR en [`adr/`](adr/README.md).
