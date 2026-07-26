# reference/ — Cuadrante Referencia

Este cuadrante responde **"¿qué es...?"** / **"¿cuál es el valor de...?"** — información para
**consultar**, no para leer de corrida. Debe ser "austera, sin concesiones", neutral y sin opinión
(ver [investigación 13, §1.2](../../investigaciones/13-documentacion-framework-diataxis.md) —
*"neutral description is the key imperative of technical reference"*). Si un documento de esta
carpeta empieza a explicar el *porqué* de un valor, esa explicación pertenece a
[`../explanation/`](../explanation/README.md) (`investigaciones/`), enlazada desde aquí — no
copiada aquí.

## Contenido

| Documento | Qué contiene |
|---|---|
| [`niveles-tension-iec60038.md`](niveles-tension-iec60038.md) | Tabla BT/MT/AT/EAT/UHV (IEC 60038) |
| [`coordinacion-aislamiento-bil-bsl.md`](coordinacion-aislamiento-bil-bsl.md) | Tabla de BIL/BSL por nivel de tensión (IEC 60071-1) |
| [`limites-seguridad-ieee80.md`](limites-seguridad-ieee80.md) | Fórmulas de tensión de paso/contacto tolerable (IEEE 80, Dalziel, Sverak) |
| [`formulas-per-unit.md`](formulas-per-unit.md) | Definición de bases y fórmulas de conversión per-unit |
| [`topologias-barras-comparativa.md`](topologias-barras-comparativa.md) | Tabla comparativa de las 6 configuraciones de barras |
| [`glosario.md`](glosario.md) | Términos técnicos del proyecto, español/inglés, con enlace a su definición canónica |
| [`normas-citadas.md`](normas-citadas.md) | Índice de normas IEEE/IEC citadas en todo el proyecto y en qué documento se usan |

## Convención de esta carpeta

Cada documento de referencia enlaza, al final, a la investigación de `explanation/` donde el valor
se justifica y se deriva — la referencia da el dato, la explicación da la razón. Los valores
numéricos aquí son "órdenes de magnitud representativos con fines pedagógicos" (heredado de
`IDEA.md` §6): antes de usarlos como valor de norma exacto en la UI del simulador, contrastar
contra la edición vigente del estándar correspondiente.
