---
# ADR-008: Usar userData de Three.js + jerarquía de THREE.Group en vez de un motor ECS
status: aceptado
date: 2026-07-25
---

## Contexto y planteamiento del problema

El simulador tendrá decenas de componentes interactivos (transformadores, interruptores,
seccionadores, TCs, TPs, relés, tramos de barra), cada uno con estado eléctrico propio, malla 3D,
lógica de interacción y animación. Hay que decidir cómo componer estos aspectos: jerarquía de
objetos orientada a objetos clásica de Three.js, o un patrón Entity Component System (ECS) con una
librería como `bitecs` o `miniplex`.

## Fuerzas impulsoras (decision drivers)

- El número de tipos de entidad y de instancias del proyecto es acotado (decenas, no cientos ni
  miles) en el alcance actual.
- Costo de introducir una dependencia y un paradigma adicional (ECS) frente a usar lo que Three.js
  ya ofrece de forma nativa (`userData`, jerarquía de `THREE.Group`).
- IDEA.md §8 ya decidió usar `userData` para metadata técnica accesible por el raycaster.

## Opciones consideradas

1. **Jerarquía de `THREE.Group` + `userData`** — composición nativa de Three.js, ya decidida en
   IDEA.md §8 para metadata.
2. **ECS completo** (`bitecs`, `miniplex`) — entidades como IDs, componentes como datos puros,
   sistemas como funciones que operan sobre combinaciones de componentes.

## Decisión

Se elige **`userData` + jerarquía de `THREE.Group`**. Es, informalmente, ya una forma minimalista
de composición tipo ECS, suficiente para el alcance actual del proyecto (investigación 12 §5).

## Pros y contras de las opciones

### THREE.Group + userData

- Bueno, porque no añade dependencias ni un paradigma nuevo — usa lo que Three.js ya ofrece.
- Bueno, porque es directo de razonar para un equipo pequeño: cada componente es un `Group` con su
  metadata.
- Malo, porque no ofrece las ventajas de rendimiento de ECS real (iteración cache-friendly sobre
  arrays tipados) ni facilidades de serialización eficiente para un número muy grande de entidades.

### ECS completo

- Bueno, porque escala mejor a cientos/miles de entidades con mejor rendimiento y facilidades de
  serialización (útil si se necesitara guardar/cargar el estado completo de una escena grande).
- Malo, porque es sobredimensionado para el número de componentes actual del proyecto — añade una
  dependencia y una curva de aprendizaje sin necesidad demostrada.

## Consecuencias

- **Positivas**: cero dependencias adicionales; el patrón ya decidido en IDEA.md §8 para metadata
  técnica se reutiliza también como mecanismo de composición.
- **Negativas**: si el proyecto creciera mucho en número de entidades interactivas, esta elección
  podría requerir refactor.
- **Señal de escalar / revisar esta decisión**: si el número de entidades interactivas supera del
  orden de ~200, o si aparece una necesidad real de serialización eficiente del estado completo de
  la escena, reabrir esta decisión y evaluar `bitecs`/`miniplex`.

## Más información

- [IDEA.md §8](../../IDEA.md).
- [`investigaciones/12-arquitectura-simulacion-circuitos-estados.md` §5](../../investigaciones/12-arquitectura-simulacion-circuitos-estados.md).
