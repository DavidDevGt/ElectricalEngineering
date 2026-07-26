---
# ADR-004: Implementar las máquinas de estado de los componentes como FSM a mano, sin librería de statecharts
status: aceptado
date: 2026-07-25
---

## Contexto y planteamiento del problema

Componentes discretos del simulador (interruptor, seccionador, relé) tienen estados válidos
(abierto, cerrado, en transición, bloqueado) y transiciones que dependen del estado de otros
componentes (el seccionador no puede abrirse si el interruptor asociado está cerrado —
enclavamiento, IDEA.md §3.3). Hay que decidir cómo modelar esto: variables booleanas dispersas,
FSM simples implementadas a mano, o una librería de statecharts como XState (que implementa el
formalismo de Harel: jerarquía + regiones paralelas + eventos).

## Fuerzas impulsoras (decision drivers)

- El enclavamiento interruptor-seccionador es exactamente el problema que resuelven las "regiones
  paralelas que se comunican por eventos" del formalismo de Harel — una FSM plana sin esa
  estructura tiende a producir lógica condicional ad-hoc frágil.
- El número de componentes discretos del proyecto es acotado (interruptor, seccionador, relé, unos
  pocos más) — no cientos de tipos de entidad con estados complejos.
- Costo de añadir una dependencia de runtime (XState) vs. costo de implementar FSMs simples a mano.

## Opciones consideradas

1. **Variables booleanas + lógica condicional dispersa** — sin estructura explícita de estados.
2. **FSM simples implementadas a mano** (TypeScript, sin librería), adoptando el *patrón* de
   Harel (estados explícitos, transiciones válidas documentadas, comunicación por eventos) sin
   adoptar su implementación de referencia.
3. **XState** (o librería equivalente de statecharts) como dependencia de runtime.

## Decisión

Se elige **FSM simples a mano**, con el patrón conceptual de statecharts (jerarquía + regiones
paralelas comunicándose por eventos, no banderas compartidas) pero sin añadir XState como
dependencia — dado el tamaño acotado del proyecto (investigación 12 §3-4).

## Pros y contras de las opciones

### Variables booleanas dispersas

- Bueno, porque no requiere ninguna estructura ni dependencia adicional.
- Malo, porque no previene estados imposibles (nada impide, en el código, que el seccionador
  "esté abriéndose" mientras el interruptor está cerrado si el enclavamiento no se revisa en cada
  punto de mutación del estado).
- Malo, porque la lógica de validación de transiciones queda dispersa y es fácil de romper al
  agregar un nuevo componente.

### FSM a mano

- Bueno, porque documenta estados y transiciones válidas en un solo lugar por componente.
- Bueno, porque el enclavamiento se modela como comunicación explícita entre dos FSMs (eventos),
  no como una condición `if` oculta en un método de UI.
- Bueno, porque no añade dependencias de runtime ni curva de aprendizaje de una librería externa.
- Malo, porque el proyecto debe implementar y mantener su propia infraestructura mínima de FSM
  (aunque sea pequeña).

### XState

- Bueno, porque implementa el formalismo de Harel completo (historia, regiones paralelas,
  jerarquía) de forma probada y con herramientas de visualización.
- Malo, porque es sobredimensionado para el número acotado de componentes discretos del proyecto
  actual — añade una dependencia y una curva de aprendizaje sin necesidad demostrada.

## Consecuencias

- **Positivas**: el enclavamiento interruptor-seccionador (y futuras reglas similares) se modela
  como comunicación explícita entre FSMs, no como lógica condicional dispersa; sin dependencias
  nuevas.
- **Negativas**: si el número de componentes o la complejidad de sus estados crece mucho, la
  infraestructura de FSM a mano podría volverse ella misma una carga de mantenimiento.
- **Señal de escalar / revisar esta decisión**: si el número de tipos de componente con estado
  propio supera ~10-15, o si se necesita historial de sub-estados (memoria de "en qué sub-estado
  estaba antes de la última transición"), reabrir esta decisión y evaluar XState.

## Más información

- [IDEA.md §3.3](../../IDEA.md).
- [`investigaciones/12-arquitectura-simulacion-circuitos-estados.md` §3-4](../../investigaciones/12-arquitectura-simulacion-circuitos-estados.md).
