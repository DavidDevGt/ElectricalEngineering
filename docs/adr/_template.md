---
# ADR-NNN: <Título corto, frase nominal, en imperativo del "qué se decide">
status: propuesto | aceptado | rechazado | reemplazado por ADR-NNN | deprecado
date: AAAA-MM-DD
supersedes: ADR-NNN (opcional, si reemplaza una decisión anterior)
superseded-by: ADR-NNN (opcional, se añade cuando este ADR queda obsoleto)
---

## Contexto y planteamiento del problema

<Describe, en 2-4 frases, el problema a resolver y las fuerzas en juego (técnicas, de alcance
pedagógico, de tamaño de equipo). Lenguaje neutral y factual — todavía sin argumentar a favor de
ninguna opción. Si esta decisión nace de una investigación previa, enlázala aquí
(ej. "ver investigaciones/12-arquitectura-simulacion-circuitos-estados.md §2").>

## Fuerzas impulsoras (decision drivers)

- <Factor 1, ej. "costo de implementación y mantenimiento por un equipo pequeño">
- <Factor 2, ej. "el objetivo pedagógico es X, no Y">
- <Factor 3, ej. "facilidad de testear sin depender de WebGL/render">

## Opciones consideradas

1. **<Opción A>** — <una frase>
2. **<Opción B>** — <una frase>
3. **<Opción C, si aplica>** — <una frase>

## Decisión

Se elige **<Opción X>**.

<Justificación breve en voz activa: "Decidimos X porque..." — remite a las fuerzas impulsoras de
arriba, no las repite en abstracto.>

## Pros y contras de las opciones

### <Opción A>

- Bueno, porque <razón>
- Malo, porque <razón>

### <Opción B>

- Bueno, porque <razón>
- Malo, porque <razón>

### <Opción C, si aplica>

- Bueno, porque <razón>
- Malo, porque <razón>

## Consecuencias

- **Positivas**: <qué se gana o simplifica>
- **Negativas**: <qué costo, límite o deuda técnica se acepta conscientemente>
- **Señal de escalar / revisar esta decisión**: <condición concreta y observable que, de
  cumplirse, justificaría abrir un nuevo ADR que reemplace este — ej. "si el número de entidades
  interactivas supera ~200" o "si el modo diseñador requiere flujo de carga real". No dejar esta
  sección vacía ni genérica: debe ser una señal verificable, no una vaguedad tipo "si el proyecto
  crece mucho".>

## Confirmación (opcional)

<Cómo se verifica que la decisión se implementó como se describe aquí — un test, un módulo
concreto, una revisión de código.>

## Más información (opcional)

<Enlaces a investigaciones/, discusiones, o material externo relevante.>
