---
# ADR-009: Resolver el offset DC de cortocircuito con su solución analítica cerrada
status: aceptado
date: 2026-07-25
---

## Contexto y planteamiento del problema

El simulador necesita mostrar la corriente de cortocircuito asimétrica (componente AC simétrica +
offset DC decayendo exponencialmente, investigación 08 §3) en el osciloscopio de falla. Con un
motor de integración numérica ya elegido para EDOs del dominio (ADR-006), hay que decidir si este
fenómeno también se integra paso a paso o se resuelve con su fórmula cerrada.

## Fuerzas impulsoras (decision drivers)

- El offset DC de cortocircuito tiene una solución analítica exacta y conocida:
  `i(t) = √2·I_sym·sin(ωt+α−φ) + I_dc(0)·e^(−t/τ)`, con `τ = (X/R)/(2πf)`.
- Regla general del proyecto: integrar numéricamente solo cuando hay acoplamiento o no linealidad
  real que impida una solución cerrada (el arco de Mayr sí califica; el offset DC no).
- Costo y precisión: evaluar una fórmula cerrada es más barato y exacto que integrar un sistema
  lineal simple paso a paso.

## Opciones consideradas

1. **Integración numérica paso a paso** (Euler semi-implícito, igual que el resto del dominio) del
   circuito RL equivalente.
2. **Evaluación directa de la solución analítica cerrada** en cada instante de tiempo mostrado.

## Decisión

Se elige **solución analítica cerrada**. El offset DC de cortocircuito no debe integrarse
numéricamente — es un sistema lineal simple con solución exacta conocida (investigación 09 §7).

## Pros y contras de las opciones

### Integración numérica

- Bueno, porque reutiliza la misma infraestructura de integración que el resto del dominio
  (consistencia arquitectónica).
- Malo, porque introduce error numérico innecesario en un fenómeno que tiene solución exacta.
- Malo, porque es más costoso computacionalmente sin ninguna ganancia de precisión o flexibilidad.

### Solución analítica cerrada

- Bueno, porque es exacta, barata de evaluar, y no requiere mantener estado de integración para
  este fenómeno específico.
- Bueno, porque documenta explícitamente que no toda dinámica del dominio necesita el motor de
  integración numérica — reserva esa herramienta para donde realmente se necesita (no linealidad,
  acoplamiento).
- Malo, porque introduce una asimetría arquitectónica (parte del dominio se integra, parte se
  evalúa analíticamente) que debe documentarse claramente para no confundir a futuros
  colaboradores.

## Consecuencias

- **Positivas**: precisión exacta y menor costo computacional para este fenómeno específico;
  establece el criterio general del proyecto de "no integrar lo que tiene solución cerrada".
- **Negativas**: el modelo de dominio tiene dos modos de resolución de dinámicas (integración
  numérica vs. evaluación analítica) que deben quedar claramente marcados por componente.
- **Señal de escalar / revisar esta decisión**: si el offset DC dejara de poder modelarse como
  circuito RL lineal simple (ej. si se añadiera saturación de núcleo u otro efecto no lineal al
  modelo de cortocircuito), reabrir esta decisión.

## Más información

- [`investigaciones/09-simulacion-tiempo-real-integracion-numerica.md` §7](../../investigaciones/09-simulacion-tiempo-real-integracion-numerica.md).
- [`investigaciones/08-cortocircuito-flujo-carga-per-unit.md` §3](../../investigaciones/08-cortocircuito-flujo-carga-per-unit.md).
