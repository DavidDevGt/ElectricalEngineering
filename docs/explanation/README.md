# explanation/ — Cuadrante Explicación

Este cuadrante responde **"¿por qué?"** — contexto, razonamiento, alternativas consideradas y
descartadas. Es el único cuadrante de Diátaxis que admite opinión y comparación de enfoques
(ver [investigación 13, §1.2](../../investigaciones/13-documentacion-framework-diataxis.md)).

## Contenido propio de esta carpeta

| Documento | Trata sobre |
|---|---|
| [`filosofia-del-proyecto.md`](filosofia-del-proyecto.md) | Por qué el proyecto está diseñado como está — fidelidad conceptual, separación dominio/render, por qué existe tanta investigación antes de tener UI completa |

## Dónde está el resto del contenido

No se duplica aquí: el cuadrante de explicación de este proyecto **es**
[`../../investigaciones/`](../../investigaciones/README.md) — 15 documentos que cubren desde la
teoría eléctrica de cada componente de la subestación (01-08) hasta la ingeniería de software del
propio simulador (09-12) y la metodología de esta misma documentación (13-15). Y
[`../../IDEA.md`](../../IDEA.md) — la visión general del proyecto, también expositiva por
naturaleza.

Se mantienen en la raíz del repositorio (no movidas dentro de `docs/`) para no romper los enlaces
cruzados ya existentes entre ambos; este `README.md` cumple la función de "alias semántico" que
[investigación 13 §7](../../investigaciones/13-documentacion-framework-diataxis.md#7-puntos-clave-para-la-carpeta-docs-del-proyecto)
recomienda, sin reescribir nada.

## Qué NO debe vivir aquí (ni en `investigaciones/`)

- Tablas de valores normativos consultables de forma aislada → van en
  [`../reference/`](../reference/README.md).
- Pasos numerados para operar el simulador una vez exista código → van en
  [`../how-to/`](../how-to/README.md) o [`../tutorials/`](../tutorials/README.md).
- Decisiones de arquitectura de software con alternativas evaluadas → van en
  [`../adr/`](../adr/README.md) como documentos formales, aunque su razonamiento extendido siga
  citado desde `investigaciones/09-12`.
