---
# ADR-003: Representar la topología de barras como grafo con BFS/DFS, no como análisis nodal (MNA)
status: aceptado
date: 2026-07-25
---

## Contexto y planteamiento del problema

El "modo diseñador" del simulador (IDEA.md §5, §7) necesita responder, ante la falla simulada de un
elemento (interruptor, tramo de barra, seccionador), qué circuitos quedan sin servicio en cada una
de las 6 configuraciones de barras (barra simple, principal+transferencia, doble barra, anillo,
interruptor y medio, doble barra/doble interruptor). Hay que decidir cómo se modela y resuelve esa
pregunta en software.

## Fuerzas impulsoras (decision drivers)

- El objetivo pedagógico es enseñar confiabilidad de topología (qué circuitos sobreviven a una
  falla), no calcular flujos de potencia reales (reparto de MW/MVAr entre circuitos).
- El número de topologías es fijo y conocido de antemano (las 6 de investigación 06), no un
  circuito arbitrario dibujado libremente por el usuario.
- Costo de implementación y mantenibilidad por un equipo pequeño.

## Opciones consideradas

1. **Análisis nodal modificado (MNA)** — la técnica estándar detrás de SPICE: formular
   `A·x = z` a partir de LCK en cada nodo y resolver por eliminación gaussiana/LU.
2. **Grafo con estados de arista + BFS/DFS** — nodos = barras/circuitos, aristas =
   interruptores/seccionadores con estado (abierto/cerrado/en falla); tras fallar un elemento, se
   recalculan componentes conexos.

## Decisión

Se elige **grafo con BFS/DFS**. La pregunta relevante para el objetivo pedagógico del proyecto es
alcanzabilidad/conectividad ("¿este circuito sigue teniendo camino a una fuente?"), no reparto de
corriente — MNA es la herramienta correcta solo si el modo diseñador evolucionara a flujo de carga
real (investigación 12 §1-2).

## Pros y contras de las opciones

### Análisis nodal modificado (MNA)

- Bueno, porque es la técnica correcta y estándar de la industria para resolver un circuito
  arbitrario con precisión numérica real.
- Malo, porque es sobredimensionado para el alcance actual: el proyecto no necesita voltajes ni
  corrientes reales en el modo diseñador, solo conectividad.
- Malo, porque añade complejidad de implementación (álgebra lineal, manejo de singularidades)
  desproporcionada al objetivo pedagógico de esta función específica.

### Grafo con BFS/DFS

- Bueno, porque es simple, rápido de implementar y de razonar, y suficiente para el objetivo
  ("¿qué circuitos quedan sin servicio?").
- Bueno, porque generaliza naturalmente a las 6 topologías conocidas sin necesitar generalizar a
  circuitos arbitrarios.
- Malo, porque no calcula magnitudes eléctricas reales (tensión, corriente, potencia) — es una
  simplificación honesta, no una versión degradada disfrazada de completa.

## Consecuencias

- **Positivas**: implementación simple (un algoritmo de componentes conexos estándar), fácil de
  testear, suficiente para comparar confiabilidad entre topologías de forma interactiva.
- **Negativas**: el modo diseñador no podrá mostrar sobrecargas de circuitos ni caídas de tensión
  reales tras una falla — solo conectividad binaria (con servicio / sin servicio).
- **Señal de escalar / revisar esta decisión**: si el proyecto añadiera un objetivo pedagógico de
  enseñar flujo de carga real (no solo confiabilidad de topología), esta decisión debería
  reabrirse con un ADR que documente la migración a MNA o a un solver de flujo de carga simplificado.

## Más información

- [`investigaciones/06-topologias-confiabilidad-subestaciones.md` §7](../../investigaciones/06-topologias-confiabilidad-subestaciones.md).
- [`investigaciones/12-arquitectura-simulacion-circuitos-estados.md` §1-2](../../investigaciones/12-arquitectura-simulacion-circuitos-estados.md).
