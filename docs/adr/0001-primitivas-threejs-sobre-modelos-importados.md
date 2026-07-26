---
# ADR-001: Usar primitivas geométricas de Three.js en vez de modelos 3D importados
status: aceptado
date: 2026-07-25
---

## Contexto y planteamiento del problema

El simulador necesita representar visualmente los componentes de una subestación de alta tensión
(transformador, interruptor, seccionador, TC/TP, pararrayos, aisladores, malla de tierra). Existen
modelos 3D fotorrealistas de estos componentes disponibles en plataformas como Sketchfab,
TurboSquid o CGTrader. Hay que decidir si el simulador se construye importando esos modelos o
generando los componentes de forma procedural con primitivas de Three.js (cajas, cilindros, toros).

## Fuerzas impulsoras (decision drivers)

- El objetivo pedagógico es enseñar el principio físico de cada componente, no lograr fidelidad
  fotorrealista (ver IDEA.md §1).
- Necesidad de etiquetar, animar y resaltar partes individuales de cada componente (ej. el arco
  entre contactos de un interruptor, el núcleo de un transformador) — algo difícil sobre una malla
  importada monolítica sin metadata propia.
- Tamaño de archivo y tiempo de carga: modelos GLTF fotorrealistas pesan varios MB cada uno.
- Costo de licenciamiento y disponibilidad: los modelos gratuitos de componentes de subestación
  específicos son escasos y de calidad variable.

## Opciones consideradas

1. **Modelos 3D importados** (Sketchfab/TurboSquid/CGTrader) — mayor fidelidad visual inmediata.
2. **Primitivas Three.js proceduales** (BoxGeometry, CylinderGeometry, TorusGeometry) agrupadas en
   `THREE.Group`, con metadata propia por pieza.

## Decisión

Se elige **primitivas Three.js procedurales**. Preferimos primitivas geométricas bien etiquetadas y
con comportamiento correcto, a modelos importados bonitos pero "mudos" (IDEA.md §1).

## Pros y contras de las opciones

### Modelos 3D importados

- Bueno, porque el resultado visual es fotorrealista sin esfuerzo de modelado propio.
- Malo, porque cada mesh importada es una caja negra sin metadata semántica por pieza — animar o
  resaltar "solo el núcleo del transformador" requiere editar el modelo en un editor 3D externo.
- Malo, porque el tamaño de archivo (varios MB por componente) penaliza el tiempo de carga.
- Malo, porque la licencia y disponibilidad de modelos específicos de equipos de subestación es
  incierta y heterogénea entre fuentes.

### Primitivas Three.js procedurales

- Bueno, porque cada pieza es código, con `userData` propio, fácil de nombrar/animar/resaltar
  individualmente.
- Bueno, porque el peso es mínimo (geometría generada, no archivos binarios).
- Bueno, porque es totalmente editable sin depender de un editor 3D externo.
- Malo, porque la fidelidad visual es menor que un modelo fotorrealista — se acepta como
  compromiso consciente (ver Consecuencias).

## Consecuencias

- **Positivas**: cada pieza de cada componente puede tener `userData` con metadata técnica
  (tipo, nivel de tensión, datos nominales) accesible directamente por el raycaster de click,
  habilitando el modo inspección sin infraestructura adicional.
- **Negativas**: el proyecto no tendrá el nivel de fidelidad visual de un render fotorrealista; se
  acepta porque el principio de diseño explícito del proyecto es "fidelidad conceptual >
  fidelidad fotorrealista" (IDEA.md §1).
- **Señal de escalar / revisar esta decisión**: si en una fase futura el proyecto buscara además
  un modo "visita virtual" con foco puramente estético/de marketing (no educativo), valdría la
  pena reabrir esta decisión para esa vista específica, sin necesariamente cambiar el modo
  educativo principal.

## Más información

- [IDEA.md §1](../../IDEA.md) y [§8](../../IDEA.md).
