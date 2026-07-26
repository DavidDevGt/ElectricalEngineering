# Tutorial 2 — Tu primera maniobra segura

En el [tutorial 1](01-tu-primera-inspeccion-del-transformador.md) aprendiste a inspeccionar un
componente haciendo click sobre él. En este vamos a **energizar la bahía completa** siguiendo la
secuencia de maniobra correcta — y luego vamos a intentar romper la regla de seguridad a
propósito, para ver qué pasa cuando el simulador te lo impide.

No vamos a explicar aquí *por qué* existe esta regla — eso vive en
[`investigaciones/02-interruptores-arco-electrico.md` §5](../../investigaciones/02-interruptores-arco-electrico.md),
y tiene mucho más sentido leerlo después de haber sentido el bloqueo en carne propia.

## Antes de empezar

Levanta el simulador (`npm run dev`, ver
[`../how-to/correr-el-simulador-localmente.md`](../how-to/correr-el-simulador-localmente.md) si no
lo tienes corriendo). Vas a ver ahora una **bahía completa**, no solo el transformador: de
izquierda a derecha, un seccionador, el interruptor de potencia (una columna con un tanque
cilíndrico arriba), otro seccionador, y el transformador al final. Los une un conductor horizontal
en la parte superior.

Fíjate en el conductor: está en **gris apagado**. Eso significa que la bahía está completamente
desenergizada — es el estado inicial, con todo abierto.

## Paso 1 — Intenta cerrar el interruptor primero (a propósito)

Haz click sobre el **interruptor** (la columna del medio, con el tanque cilíndrico arriba) y luego
en el botón **Cerrar** del panel.

Deberías ver: el interruptor se cierra sin problema (su luz de estado se pone verde) — pero el
conductor **sigue gris**. Cerrar el interruptor solo no energiza nada, porque los dos seccionadores
siguen abiertos a cada lado. El interruptor puede cerrarse en cualquier momento (tiene cámara de
extinción de arco, está diseñado para maniobrar así) — pero por sí solo no completa el circuito.

## Paso 2 — Ahora intenta cerrar un seccionador

Haz click en el **seccionador izquierdo** (el más cercano al borde de la escena) y presiona
**Cerrar**.

Esta vez el simulador te lo va a impedir. Vas a ver, en la esquina inferior izquierda, un mensaje
en rojo parecido a:

> *"Seccionador de línea: el interruptor asociado está cerrado. Un seccionador nunca se maniobra
> bajo carga (investigaciones/02 §5) — abre primero el interruptor."*

Y en el panel, la fila **Enclavamiento** debería mostrar "Bloqueado (interruptor cerrado)" en
ámbar. El seccionador **no tiene cámara de extinción de arco** — abrirlo o cerrarlo mientras el
interruptor conduce corriente podría sostener un arco sin ningún control. El simulador no te deja
cometer ese error, igual que el enclavamiento físico de una subestación real.

## Paso 3 — La secuencia correcta

Ahora vamos a hacerlo bien. Primero **abre el interruptor** de nuevo (click sobre él, botón
**Abrir**) — su luz vuelve a gris.

Con el interruptor abierto, ahora sí:

1. Click en el **seccionador izquierdo** → **Cerrar**. Debería funcionar sin bloqueo esta vez —
   fíjate que el primer tramo del conductor (del borde hasta el interruptor) se pone **verde**.
2. Click en el **seccionador derecho** → **Cerrar**. El segundo tramo (entre el interruptor y el
   seccionador derecho) sigue gris todavía — el interruptor sigue abierto, así que la energía no
   pasa a través de él.
3. Por último, click en el **interruptor** → **Cerrar**.

En el momento en que cierras el interruptor con ambos seccionadores ya cerrados, **todo el
conductor se pone verde**, incluyendo el tramo hasta el transformador. Acabas de energizar la
bahía completa siguiendo la secuencia real: seccionadores primero (sin carga), interruptor al
final (el único que puede cerrar el circuito con seguridad).

## Paso 4 — Rompe la regla una vez más, ahora en el otro sentido

Con todo cerrado y el conductor en verde, haz click en cualquiera de los dos seccionadores e
intenta **Abrir**lo. Deberías ver el mismo bloqueo del paso 2 — la regla es simétrica: un
seccionador tampoco puede *abrirse* mientras el interruptor sigue cerrado, por la misma razón.

Para desenergizar correctamente, la secuencia es la inversa a la que ya hiciste: interruptor
primero, luego los seccionadores.

## Qué acabas de aprender, sin leer ninguna norma todavía

- Un interruptor y un seccionador no son intercambiables — solo uno de los dos puede maniobrar con
  el circuito con carga.
- Existe una secuencia correcta de maniobra, y no es arbitraria: tiene una razón física concreta
  (el seccionador no puede extinguir un arco).
- El simulador no te "explica con texto" la regla antes de que la necesites — te deja intentar la
  maniobra insegura y te muestra la consecuencia (el bloqueo, con su razón) en el momento en que
  importa. Si quieres el porqué formal de esta decisión de diseño, está en
  [`investigaciones/11-diseno-simuladores-educativos.md`](../../investigaciones/11-diseno-simuladores-educativos.md).

## Qué sigue

- La física completa del interruptor y el seccionador:
  [`investigaciones/02-interruptores-arco-electrico.md`](../../investigaciones/02-interruptores-arco-electrico.md).
- Por qué el conductor "propaga" el color de energizado tramo por tramo: es el mismo grafo de
  conectividad de [`docs/adr/0003-grafo-bfs-dfs-sobre-mna.md`](../adr/0003-grafo-bfs-dfs-sobre-mna.md).
- Inspecciona el resto de equipos del patio (transformadores de instrumento, pararrayos, barra,
  malla de tierra, relé) con el mismo click — el modo inspección funciona igual para todos.
