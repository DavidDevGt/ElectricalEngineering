# Glosario

Términos técnicos usados de forma consistente en todo el proyecto. Al introducir un término nuevo
en cualquier documento, revisa primero si ya existe aquí (con su forma canónica) antes de acuñar un
sinónimo — ver [`STYLE_GUIDE.md` regla 6](../STYLE_GUIDE.md).

## Componentes eléctricos

| Término canónico | Sinónimos evitados | Definición breve | Fuente |
|---|---|---|---|
| Interruptor (de potencia) | disyuntor, breaker (usar solo entre paréntesis la primera vez) | Equipo capaz de interrumpir corriente de carga y de falla extinguiendo el arco | [inv. 02](../../investigaciones/02-interruptores-arco-electrico.md) |
| Seccionador | desconectador, disconnect switch (entre paréntesis) | Aísla un tramo sin corriente; no interrumpe carga ni falla | [inv. 02](../../investigaciones/02-interruptores-arco-electrico.md) §5 |
| Transformador de corriente (TC) | CT (entre paréntesis) | Reduce corriente primaria a señal estándar (1 A / 5 A) | [inv. 07](../../investigaciones/07-transformadores-instrumento-medicion.md) |
| Transformador de potencial (TP) | TT, VT/PT (entre paréntesis) | Reduce tensión primaria a señal estándar (~110 V) | [inv. 07](../../investigaciones/07-transformadores-instrumento-medicion.md) |
| Pararrayos | descargador de sobretensión | Dispositivo ZnO no lineal que limita sobretensiones | [inv. 05](../../investigaciones/05-coordinacion-aislamiento-sobretensiones.md) |
| Malla de tierra | rejilla de puesta a tierra, grounding grid (entre paréntesis) | Red de conductores enterrados para control de GPR | [inv. 04](../../investigaciones/04-puesta-a-tierra-ieee80.md) |
| Barra colectora | busbar (entre paréntesis) | Conductor que agrupa/interconecta circuitos | [IDEA.md §3.7](../../IDEA.md) |
| Relé de protección / IED | — | Dispositivo (hoy microprocesado) que decide y ordena el disparo | [inv. 03](../../investigaciones/03-protecciones-electricas-coordinacion.md) |

## Parámetros y siglas

| Sigla/término | Significado | Fuente |
|---|---|---|
| %Z | Impedancia de cortocircuito de un transformador, en % | [inv. 01](../../investigaciones/01-transformadores-potencia.md) §4 |
| BIL | Basic (Lightning) Impulse Insulation Level | [inv. 05](../../investigaciones/05-coordinacion-aislamiento-sobretensiones.md) |
| BSL | Basic Switching Impulse Insulation Level | [inv. 05](../../investigaciones/05-coordinacion-aislamiento-sobretensiones.md) |
| TRV | Tensión Transitoria de Recuperación (Transient Recovery Voltage) | [inv. 02](../../investigaciones/02-interruptores-arco-electrico.md) §2 |
| GPR | Ground Potential Rise — elevación de potencial de la malla ante falla | [inv. 04](../../investigaciones/04-puesta-a-tierra-ieee80.md) |
| ALF | Accuracy Limit Factor (clase de protección de un TC) | [inv. 07](../../investigaciones/07-transformadores-instrumento-medicion.md) |
| MCOV / Uc | Maximum Continuous Operating Voltage de un pararrayos | [inv. 05](../../investigaciones/05-coordinacion-aislamiento-sobretensiones.md) |
| N-1 / N-1-1 | Criterio de contingencia simple / doble en planeación de transmisión | [inv. 06](../../investigaciones/06-topologias-confiabilidad-subestaciones.md) |
| per-unit (pu) | Sistema de magnitudes normalizadas a una base común | [inv. 08](../../investigaciones/08-cortocircuito-flujo-carga-per-unit.md) |
| OLTC | On-Load Tap Changer — cambiador de tomas bajo carga | [inv. 01](../../investigaciones/01-transformadores-potencia.md) §6 |
| DGA | Dissolved Gas Analysis — análisis de gases disueltos en aceite | [inv. 01](../../investigaciones/01-transformadores-potencia.md) §8 |

## Ingeniería de software del simulador

| Término | Definición breve | Fuente |
|---|---|---|
| Timestep fijo | Paso de simulación de duración constante, desacoplado del framerate de render | [inv. 09](../../investigaciones/09-simulacion-tiempo-real-integracion-numerica.md) |
| Euler semi-implícito | Método de integración numérica (symplectic Euler), estándar en simulación interactiva | [inv. 09](../../investigaciones/09-simulacion-tiempo-real-integracion-numerica.md) |
| FSM | Finite State Machine — máquina de estados finitos | [inv. 12](../../investigaciones/12-arquitectura-simulacion-circuitos-estados.md) |
| Statechart | Extensión jerárquica/paralela de FSM (formalismo de Harel) | [inv. 12](../../investigaciones/12-arquitectura-simulacion-circuitos-estados.md) |
| MNA | Modified Nodal Analysis — técnica de SPICE para resolver circuitos arbitrarios | [inv. 12](../../investigaciones/12-arquitectura-simulacion-circuitos-estados.md) |
| ECS | Entity Component System — patrón de composición de datos/comportamiento | [inv. 12](../../investigaciones/12-arquitectura-simulacion-circuitos-estados.md) |
| ADR | Architecture Decision Record | [inv. 15](../../investigaciones/15-adr-design-docs-rfc-bigtech.md) |
| Diátaxis | Framework de organización de documentación en 4 cuadrantes | [inv. 13](../../investigaciones/13-documentacion-framework-diataxis.md) |
