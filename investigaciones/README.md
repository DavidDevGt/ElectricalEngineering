# Investigaciones — Núcleo técnico profundo

Investigación rigurosa (normas IEEE/IEC, papers, referencias académicas) que sustenta el
contenido técnico del simulador descrito en [../IDEA.md](../IDEA.md). Los documentos 01-08 cubren
la teoría eléctrica de cada subsistema; los documentos 09-12 cubren cómo programar el simulador en
sí (bucles de simulación, visualización, diseño pedagógico, arquitectura de software); los
documentos 13-15 cubren cómo se documenta el propio proyecto (framework Diátaxis, guías de estilo
de Microsoft/Google/IBM, ADRs/design docs/RFC de Big Tech) y fundamentan la carpeta
[`../docs/`](../docs/README.md). Cada documento cierra con una sección que traduce la teoría en
mecánicas o decisiones concretas para el proyecto.

### Teoría eléctrica

| # | Documento | Hallazgo más relevante |
|---|---|---|
| 01 | [Transformadores de potencia](01-transformadores-potencia.md) | El %Z es un parámetro de diseño intencional que limita la corriente de falla; la protección diferencial 87T discrimina inrush de falla real por contenido de 2do armónico. |
| 02 | [Interruptores y arco eléctrico](02-interruptores-arco-electrico.md) | La interrupción es una carrera entre la recuperación dieléctrica del medio y la TRV; el tiempo total de despeje (3-4 ciclos) es el mismo dato que alimenta el cálculo de tensiones de paso/contacto de IEEE 80. |
| 03 | [Protecciones y coordinación](03-protecciones-electricas-coordinacion.md) | La protección diferencial (87) es la única "unitaria" sin necesidad de coordinación temporal; las zonas de distancia (21) se escalonan porque ningún relé puede cubrir el 100% de una línea sin riesgo de disparo indebido. |
| 04 | [Puesta a tierra (IEEE 80)](04-puesta-a-tierra-ieee80.md) | Una resistencia de tierra global baja NO garantiza seguridad — hay que verificar tensión de malla y de paso por separado contra los límites de Dalziel. |
| 05 | [Coordinación de aislamiento](05-coordinacion-aislamiento-sobretensiones.md) | Un transformador visto en las frecuencias de un frente de rayo se comporta como circuito abierto y duplica la tensión en bornes — por eso el pararrayos debe ir físicamente pegado a él. |
| 06 | [Topologías y confiabilidad](06-topologias-confiabilidad-subestaciones.md) | El número de interruptores por circuito es el driver estructural de costo/confiabilidad; el apagón Suecia-Dinamarca 2003 muestra qué pasa cuando una topología pierde redundancia N-1. |
| 07 | [Transformadores de instrumento](07-transformadores-instrumento-medicion.md) | Un TC con secundario abierto genera picos de tensión de varios kV por `dΦ/dt` extremo al saturarse el núcleo — un voltímetro RMS común subestima el riesgo real. |
| 08 | [Cortocircuito y per-unit](08-cortocircuito-flujo-carga-per-unit.md) | La secuencia cero (clave en fallas a tierra) exige físicamente un retorno por tierra/neutro, ligando directamente el estudio de cortocircuito al diseño de la malla (doc 04). |

### Ingeniería de software del simulador

| # | Documento | Hallazgo más relevante |
|---|---|---|
| 09 | [Simulación en tiempo real e integración numérica](09-simulacion-tiempo-real-integracion-numerica.md) | El patrón "timestep fijo + acumulador" (Fix Your Timestep!) es obligatorio para que las EDOs del modelo eléctrico (ej. arco de Mayr) sean estables y deterministas, desacoplado del `requestAnimationFrame` variable; el offset DC de cortocircuito tiene solución analítica cerrada y no debe integrarse numéricamente. |
| 10 | [Visualización científica en tiempo real](10-visualizacion-cientifica-tiempo-real.md) | El heatmap de la malla de tierra debe calcularse en CPU como `DataTexture` (no shader por frame, porque solo cambia al soltar un slider); todo dato científico continuo debe usar viridis/magma, nunca "jet". |
| 11 | [Diseño de simuladores educativos](11-diseno-simuladores-educativos.md) | Lo que produce aprendizaje medible (Hake 1998) no es la interactividad en sí sino el ciclo predicción→acción→observación→reconciliación (POE) — el modo "falla" del proyecto debería pedir una predicción antes de disparar la falla. |
| 12 | [Arquitectura de simulación de circuitos y estados](12-arquitectura-simulacion-circuitos-estados.md) | Un grafo con BFS/DFS sobre estados de arista (no MNA tipo SPICE) es la elección correcta para el modo diseñador de topologías; FSMs simples a mano (patrón statecharts de Harel, sin librería) bastan para el enclavamiento interruptor-seccionador. |

### Ingeniería de software de la documentación

| # | Documento | Hallazgo más relevante |
|---|---|---|
| 13 | [Framework Diátaxis y docs-as-code](13-documentacion-framework-diataxis.md) | Mezclar tutorial/how-to/referencia/explicación en un mismo documento degrada el contenido y colapsa la estructura a la vez; Kubernetes y Cloudflare migraron su documentación citando explícitamente este framework. |
| 14 | [Guías de estilo Microsoft/Google/IBM](14-guias-estilo-microsoft-google-ibm.md) | Las tres guías convergen casi palabra por palabra en voz activa, segunda persona directa, un paso por línea y formato visual con significado fijo — es el estándar de facto de la industria, no una preferencia de marca. |
| 15 | [ADR, Design Docs y RFC de Big Tech](15-adr-design-docs-rfc-bigtech.md) | Un ADR aceptado nunca se edita cuando la decisión cambia — se crea uno nuevo que "supersede" al anterior, preservando el historial de *por qué* se decidió algo, no solo el *qué*. |

## Cómo se usa esto en el proyecto

Cada documento cierra con "Puntos clave para la simulación educativa" (o, en 13-15, "Puntos clave
para la carpeta docs/") — esa sección es la que se debe consultar al implementar cada componente 3D
o al documentar el proyecto, para que la interacción no sea solo estética sino que enseñe el
principio físico real (ver tabla de mapeo teoría→interacción en
[IDEA.md §7](../IDEA.md#7-diseño-pedagógico--de-la-teoría-a-la-interacción-3d)), y para que la
documentación misma siga los estándares de [`../docs/STYLE_GUIDE.md`](../docs/STYLE_GUIDE.md).
