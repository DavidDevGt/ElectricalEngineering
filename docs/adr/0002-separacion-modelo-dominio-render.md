---
# ADR-002: Separar el modelo de dominio eléctrico de la capa de render Three.js
status: aceptado
date: 2026-07-25
---

## Contexto y planteamiento del problema

El simulador necesita calcular tensiones, corrientes, estados de protección y resultados de
maniobra (ej. si un seccionador puede abrirse con carga), y a la vez renderizar una escena 3D que
refleje ese estado. Hay que decidir si esa lógica eléctrica vive mezclada dentro de los objetos
Three.js de la escena, o en un módulo separado que Three.js solo consulta para renderizar.

## Fuerzas impulsoras (decision drivers)

- La lógica eléctrica (enclavamientos, protección diferencial, cálculo de tensión de paso) debe
  poder testearse sin depender de un contexto WebGL.
- El código de dominio debe poder evolucionar (agregar componentes, reglas de negocio) sin tocar
  la capa de escena, y viceversa (cambiar estilo visual sin tocar reglas eléctricas).
- Patrón de diseño de referencia en simulación/juegos: Model-View (MVP), con el modelo desconocido
  de la vista y la vista suscrita a cambios del modelo — ver investigación 12 §6.

## Opciones consideradas

1. **Lógica eléctrica embebida en los objetos Three.js** (ej. propiedades y métodos directamente
   en `userData` o en subclases de `THREE.Object3D`).
2. **Modelo de dominio separado** (`SubstationModel` en JS/TS puro, sin `import` de `three`), con
   la escena Three.js suscrita a sus cambios (patrón Observer/pub-sub).

## Decisión

Se elige **modelo de dominio separado**. `SubstationModel` calcula tensiones/corrientes/estados de
protección; Three.js solo renderiza el estado, no contiene lógica eléctrica (IDEA.md §8).

## Pros y contras de las opciones

### Lógica embebida en objetos Three.js

- Bueno, porque evita una capa de indirección adicional al principio del proyecto.
- Malo, porque cada test de una regla de negocio (ej. "no se puede abrir un seccionador con
  carga") requeriría instanciar un contexto WebGL o mockearlo extensamente.
- Malo, porque acopla el ciclo de vida de la lógica eléctrica al ciclo de vida de la escena 3D,
  dificultando reescribir o migrar la capa visual en el futuro.

### Modelo de dominio separado

- Bueno, porque la lógica de enclavamiento, protección diferencial o cálculo de tensión de paso
  se puede testear con Jest/Vitest puro, sin levantar un navegador con WebGL.
- Bueno, porque separa responsabilidades: el modelo no sabe que existe una escena 3D; la vista no
  contiene reglas eléctricas.
- Malo, porque introduce una capa de sincronización (pub-sub) que debe mantenerse consistente.

## Consecuencias

- **Positivas**: toda la lógica de negocio del proyecto (reglas de maniobra, cálculo de %Z,
  discriminación de inrush, etc.) es testeable de forma aislada y rápida.
- **Negativas**: requiere disciplina para no "colar" lógica eléctrica dentro de callbacks de la
  escena por conveniencia puntual.
- **Señal de escalar / revisar esta decisión**: ninguna prevista — este patrón es la base
  arquitectónica del proyecto y no se espera que cambie salvo un rediseño completo del stack.

## Confirmación

El módulo de dominio (`SubstationModel` y sus componentes) no debe tener ningún `import` de
`three` en su código fuente — verificable con una regla de lint o una revisión manual.

## Más información

- [IDEA.md §8](../../IDEA.md).
- [`investigaciones/12-arquitectura-simulacion-circuitos-estados.md` §6](../../investigaciones/12-arquitectura-simulacion-circuitos-estados.md).
