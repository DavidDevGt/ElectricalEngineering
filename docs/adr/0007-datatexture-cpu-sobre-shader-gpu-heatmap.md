---
# ADR-007: Heatmap de la malla de tierra calculado en CPU con DataTexture, no en shader GPU
status: aceptado
date: 2026-07-25
---

## Contexto y planteamiento del problema

El simulador necesita renderizar un heatmap 3D del potencial de superficie sobre la malla de tierra
(IDEA.md §3.8) ante una falla simulada. Hay que decidir si ese campo escalar `V(x,y)` se calcula en
JavaScript (CPU) y se sube como textura, o se calcula directamente por píxel en un fragment shader
(GPU).

## Fuerzas impulsoras (decision drivers)

- El campo no necesita animarse cada frame en la primera versión: cambia cuando el usuario suelta
  un slider (resistividad, espaciado de malla, capa de grava), no continuamente.
- La misma función de cálculo de potencial debe poder reutilizarse para calcular `E_step`/`E_touch`
  numéricos que se muestran en el panel de información (no solo para pintar el heatmap).
- Facilidad de depuración: un valor calculado en JS es inspeccionable con las herramientas
  normales de desarrollo; un valor calculado dentro de un shader es más opaco de depurar.

## Opciones consideradas

1. **Cálculo en CPU (JS) sobre una grilla discreta**, subido como `THREE.DataTexture` aplicada a
   un plano, regenerada solo cuando cambian los parámetros.
2. **Cálculo en un fragment shader (GPU)**, evaluando la fórmula de superposición de potencial por
   píxel en paralelo, cada frame.

## Decisión

Se elige **cálculo en CPU con `DataTexture`** (investigación 10 §1 y tabla final). El campo se
recalcula al soltar un slider, no cada frame, y así se reutiliza la misma función que ya alimenta
los cálculos de `E_step`/`E_touch` de IEEE 80 (ver ADR relacionado con `docs/reference/limites-seguridad-ieee80.md`).

## Pros y contras de las opciones

### Cálculo en CPU + DataTexture

- Bueno, porque la misma función de potencial sirve tanto para pintar el heatmap como para
  calcular los valores numéricos de `E_step`/`E_touch` — una sola fuente de verdad.
- Bueno, porque es más simple de implementar y depurar (JS estándar, sin GLSL).
- Bueno, porque es suficiente en rendimiento: no se necesita recalcular cada frame si el campo no
  cambia continuamente.
- Malo, porque si en el futuro se quisiera animar el GPR en tiempo real durante el transitorio de
  una falla (no solo mostrar el estado final), este enfoque sería más costoso de refrescar a alta
  frecuencia.

### Cálculo en fragment shader (GPU)

- Bueno, porque escala mejor si el usuario arrastra sliders en vivo y se necesita recalcular cada
  frame a alta resolución.
- Malo, porque es sobredimensionado para la necesidad actual (el campo no cambia cada frame).
- Malo, porque duplica la lógica de cálculo del potencial en GLSL, separada de la función JS que
  ya calcula `E_step`/`E_touch` — riesgo de que ambas divergan con el tiempo.

## Consecuencias

- **Positivas**: una sola función de dominio (JS puro, testeable) alimenta tanto el heatmap visual
  como los valores numéricos del panel de información.
- **Negativas**: si se anima el GPR en tiempo real durante el transitorio de la falla (no solo el
  estado final), el refresco de `DataTexture` en CPU podría no ser suficientemente rápido a alta
  resolución de grilla.
- **Señal de escalar / revisar esta decisión**: si el proyecto necesita animar el heatmap
  continuamente durante el transitorio completo de una falla (no solo mostrar el resultado
  estacionario), reabrir esta decisión y evaluar migrar el cálculo a un fragment shader,
  manteniendo la función de dominio como referencia de verificación.

## Más información

- [`investigaciones/10-visualizacion-cientifica-tiempo-real.md` §1](../../investigaciones/10-visualizacion-cientifica-tiempo-real.md).
- [`investigaciones/04-puesta-a-tierra-ieee80.md` §8](../../investigaciones/04-puesta-a-tierra-ieee80.md).
