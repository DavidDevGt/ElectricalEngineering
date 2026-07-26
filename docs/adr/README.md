# adr/ — Architecture Decision Records

Registro de decisiones de arquitectura de software del simulador, en formato **MADR** (Markdown
Architectural Decision Records) ligero — ver
[investigación 15](../../investigaciones/15-adr-design-docs-rfc-bigtech.md) para la justificación
completa de por qué este formato (y no RFC ni Design Doc completo) es el apropiado para el tamaño
de este proyecto.

## Regla de inmutabilidad (Nygard, 2011)

Un ADR aceptado **no se edita** cuando la decisión cambia. Se crea un ADR nuevo con
`supersedes: ADR-NNN` en el front-matter; el ADR viejo solo actualiza su campo `status` a
`reemplazado por ADR-NNN` — el resto de su contenido queda intacto como registro histórico de *por
qué* se decidió algo en su momento.

## Índice

| ADR | Título | Estado |
|---|---|---|
| [0001](0001-primitivas-threejs-sobre-modelos-importados.md) | Primitivas Three.js sobre modelos 3D importados | aceptado |
| [0002](0002-separacion-modelo-dominio-render.md) | Separación del modelo de dominio y la capa de render | aceptado |
| [0003](0003-grafo-bfs-dfs-sobre-mna.md) | Grafo con BFS/DFS para topologías, en vez de análisis nodal (MNA) | aceptado |
| [0004](0004-fsm-a-mano-sobre-statecharts-libreria.md) | FSM a mano en vez de librería de statecharts (XState) | aceptado |
| [0005](0005-timestep-fijo-con-acumulador.md) | Bucle de simulación con timestep fijo y acumulador | aceptado |
| [0006](0006-euler-semi-implicito-por-defecto.md) | Euler semi-implícito como integrador por defecto | aceptado |
| [0007](0007-datatexture-cpu-sobre-shader-gpu-heatmap.md) | DataTexture en CPU en vez de shader GPU para el heatmap de tierra | aceptado |
| [0008](0008-userdata-threejs-sobre-ecs.md) | userData/THREE.Group en vez de un motor ECS | aceptado |
| [0009](0009-offset-dc-solucion-analitica.md) | Offset DC de cortocircuito por solución analítica, no integración | aceptado |

## Cómo escribir un ADR nuevo

1. Copia [`_template.md`](_template.md) a `NNNN-titulo-corto-en-kebab-case.md` (siguiente número
   disponible).
2. Completa **Contexto**, **Fuerzas impulsoras**, **Opciones consideradas** y **Pros/contras**
   antes de escribir la Decisión — el valor del formato MADR está en forzar que las alternativas
   descartadas queden documentadas, no en llegar rápido a la conclusión.
3. La sección **"Señal de escalar / revisar esta decisión"** debe ser una condición verificable,
   no una vaguedad tipo "si el proyecto crece mucho".
4. Añade la fila correspondiente a la tabla de este índice.
