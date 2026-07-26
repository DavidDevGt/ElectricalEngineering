# Tutorial 1 — Tu primera inspección del transformador

En este tutorial vamos a levantar el simulador por primera vez y a descubrir, jugando con un solo
control, por qué un transformador de potencia tiene un punto de carga donde es más eficiente — sin
necesidad de leer ninguna ecuación antes de verlo pasar delante de tus ojos.

No vamos a explicar aquí *por qué* funciona así — eso vive en
[`investigaciones/01-transformadores-potencia.md`](../../investigaciones/01-transformadores-potencia.md),
y puedes leerlo después de este tutorial, con la intuición ya construida.

## Antes de empezar

Necesitas Node.js 20 o superior instalado. No necesitas saber TypeScript ni Three.js para este
tutorial.

## Paso 1 — Levanta el simulador

Desde la raíz del repositorio:

```bash
npm install
npm run dev
```

Tu navegador debería abrirse solo en `http://localhost:5173`. Verás un cubo gris oscuro flotando
sobre un piso casi negro, con tres postes finos saliendo de su parte superior y un panel con datos
numéricos en la esquina superior izquierda.

Ese cubo es el **transformador de potencia** — modelado con formas geométricas simples a propósito
(ver [`../explanation/filosofia-del-proyecto.md`](../explanation/filosofia-del-proyecto.md) si
tienes curiosidad de por qué no es un modelo fotorrealista). Los tres postes son los pasatapas
(bushings) del lado de alta tensión.

## Paso 2 — Lee el panel antes de tocar nada

Con el slider **Factor de carga** en 0%, el panel debería mostrarte algo parecido a esto:

| Campo | Valor |
|---|---|
| Potencia nominal | 100 MVA |
| Grupo de conexión | YNd11 |
| %Z | 10% |
| Pérdidas hierro | 60 kW |
| Pérdidas cobre | 0.0 kW |
| Eficiencia | 0.00% |
| Carga óptima | 45% |
| I falla (x nominal) | 10.0x |

Fíjate en dos números: **Pérdidas cobre** está en 0, y **Eficiencia** también está en 0% — aunque
las pérdidas de hierro (60 kW) siguen ahí. Sin carga, el transformador no entrega ninguna potencia
útil, así que la fórmula de eficiencia da cero aunque el equipo siga consumiendo energía en vacío.

## Paso 3 — Mueve el slider lentamente y observa la esfera

Arrastra el slider **Factor de carga** despacio, de 0% hacia 100%. Fíjate en dos cosas a la vez:

1. El número de **Pérdidas cobre** crece cada vez más rápido a medida que subes el slider — no de
   forma pareja. Duplicar la carga más que duplica esa pérdida.
2. La pequeña esfera sobre el tanque cambia de color. Empieza en **ámbar**. En algún punto cerca
   del **45%** (el valor que viste en "Carga óptima" en el paso 2), se pone **verde**. Si sigues
   subiendo el slider más allá de ese punto, vuelve a ponerse ámbar.

Esa esfera no está decorativa: es el mismo dato "Carga óptima" del panel, expresado como color en
la escena 3D en vez de como número — dos representaciones distintas del mismo hecho, conectadas
entre sí (si quieres el porqué de este patrón de diseño, está en
[`investigaciones/11-diseno-simuladores-educativos.md`](../../investigaciones/11-diseno-simuladores-educativos.md)).

## Paso 4 — Encuentra el punto exacto de máxima eficiencia

Ahora, con el slider, intenta encontrar el valor de "Factor de carga" donde **Eficiencia** en el
panel alcanza su número más alto. Debería rondar el mismo ~45% donde la esfera está más
claramente verde.

¿Notaste que la eficiencia máxima no está ni en 0% ni en 100%, sino en un punto intermedio? Eso es
el resultado central de este primer componente: un transformador tiene pérdidas que no dependen de
la carga (las de hierro) y pérdidas que sí (las de cobre, y crecen con el cuadrado de la carga) — y
el punto óptimo es exactamente donde ambas se igualan. Acabas de descubrir esa relación moviendo un
slider, antes de ver la fórmula.

## Qué sigue

- Si quieres la fórmula exacta detrás de lo que acabas de observar:
  [`investigaciones/01-transformadores-potencia.md` §3.3](../../investigaciones/01-transformadores-potencia.md).
- Si quieres entender por qué el simulador está construido así (dominio separado de la escena,
  primitivas en vez de modelos importados): [`../explanation/filosofia-del-proyecto.md`](../explanation/filosofia-del-proyecto.md).
- Si quieres construir el siguiente componente tú mismo:
  [`../how-to/agregar-un-componente-3d.md`](../how-to/agregar-un-componente-3d.md).
