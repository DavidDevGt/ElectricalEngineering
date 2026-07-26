---
# ADR-005: Bucle de simulación con timestep fijo y acumulador, desacoplado del framerate de render
status: aceptado
date: 2026-07-25
---

## Contexto y planteamiento del problema

El modelo de dominio eléctrico (ADR-002) incluye ecuaciones diferenciales (ej. el modelo de arco
Cassie-Mayr) que deben integrarse en el tiempo. Actualizar esa integración directamente dentro del
callback de `requestAnimationFrame` (cuyo intervalo varía de ~16.6 ms a mucho más si hay lag)
produce simulaciones no deterministas e inestables, especialmente para integración explícita con
paso variable.

## Fuerzas impulsoras (decision drivers)

- Estabilidad numérica de las EDOs del dominio, en particular las que tienen comportamiento rígido
  cerca de eventos discretos (colapso de conductancia del arco en el cruce por cero).
- Determinismo: la misma secuencia de entradas del usuario debería producir el mismo resultado en
  cualquier hardware, habilitando un futuro modo "replay" de una falla simulada.
- El patrón "Fix Your Timestep!" (Glenn Fiedler) es el estándar de facto en motores de
  juegos/simulación interactiva para este problema exacto.

## Opciones consideradas

1. **Actualizar la física directamente en el callback de render**, usando el delta-time variable
   de cada frame.
2. **Timestep fijo con acumulador**: un bucle de render (`requestAnimationFrame`) alimenta un
   acumulador de tiempo real transcurrido; mientras el acumulador supere el paso fijo `DT`, se
   ejecuta un paso de física de duración constante; el render final interpola entre el estado
   anterior y el actual para evitar jitter visual.

## Decisión

Se elige **timestep fijo con acumulador** (investigación 09 §2). El bucle de render usa
`requestAnimationFrame`; el modelo de dominio se actualiza en pasos fijos independientes del
framerate.

## Pros y contras de las opciones

### Física en el callback de render (delta-time variable)

- Bueno, porque es la implementación más simple e inmediata.
- Malo, porque un frame lento (lag, pestaña en segundo plano) produce un paso de integración
  grande y potencialmente inestable para EDOs rígidas.
- Malo, porque el resultado de la simulación depende del hardware/framerate del usuario — no es
  reproducible ni determinista.

### Timestep fijo con acumulador

- Bueno, porque desacopla la estabilidad numérica del framerate real.
- Bueno, porque es determinista: la misma secuencia de eventos produce el mismo resultado siempre.
- Bueno, porque es el patrón validado y ampliamente documentado en la industria de simulación
  interactiva.
- Malo, porque requiere lógica adicional (acumulador, interpolación de render, clamp de pasos por
  frame para evitar la "espiral de la muerte" si el dispositivo no puede sostener el paso fijo).

## Consecuencias

- **Positivas**: estabilidad numérica garantizada para las EDOs del dominio; determinismo que
  habilita un futuro modo replay.
- **Negativas**: complejidad adicional del bucle principal (acumulador + interpolación) frente a
  la alternativa ingenua.
- **Señal de escalar / revisar esta decisión**: ninguna prevista — este es el patrón base del
  bucle de simulación y no se espera que cambie salvo problemas de rendimiento medidos en
  dispositivos de gama baja, que se abordarían ajustando `DT` o el tope de pasos por frame, no
  cambiando el patrón.

## Confirmación

El módulo de bucle principal debe usar `performance.now()` para timestamps de alta precisión y
aplicar un clamp al delta-time acumulado por frame (evitar acumular pasos pendientes sin límite si
la pestaña pierde foco).

## Más información

- [`investigaciones/09-simulacion-tiempo-real-integracion-numerica.md` §2, §6](../../investigaciones/09-simulacion-tiempo-real-integracion-numerica.md).
