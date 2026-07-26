# Cómo agregar una investigación técnica nueva

Escribe una investigación nueva en `investigaciones/` cuando necesites profundidad teórica —
eléctrica, de simulación, o de cualquier otro tema con fuentes primarias citables — antes de
implementar un componente. Para decisiones de arquitectura de software ya semi-tomadas, usa un ADR
en su lugar (ver [`escribir-un-adr-nuevo.md`](escribir-un-adr-nuevo.md)).

1. Elige el siguiente número disponible (revisa [`../../investigaciones/README.md`](../../investigaciones/README.md))
   y crea `investigaciones/NN-tema-en-kebab-case.md`.

2. Abre con un encabezado `# Título` y una cita en bloque (`>`) de 2-4 líneas que explique de qué
   investigación de soporte se trata y a qué documento del proyecto alimenta (`IDEA.md`, un ADR, u
   otra investigación) — sigue el mismo patrón que `investigaciones/01-transformadores-potencia.md`.

3. Investiga con fuentes primarias y autoritativas — normas (IEEE, IEC), papers, documentación
   oficial de un framework, libros de referencia citados por nombre — no blogs de baja calidad
   salvo como complemento. Cada afirmación cuantitativa (una fórmula, un valor típico, un rango
   normativo) debe ser rastreable a una fuente citada.

4. Cierra con una sección **`## Puntos clave para...`** (la simulación educativa, la carpeta
   `docs/`, según corresponda) que traduzca la teoría en una decisión o mecánica concreta para el
   proyecto — no dejes la investigación como teoría pura sin aterrizar.

5. Termina con **`## Fuentes`**: enlaces markdown reales a todo lo que citaste.

6. Actualiza [`../../investigaciones/README.md`](../../investigaciones/README.md): añade una fila
   a la tabla correspondiente (teoría eléctrica / ingeniería de software del simulador /
   ingeniería de software de la documentación, o una categoría nueva si el tema no encaja en
   ninguna) con el hallazgo más relevante en una frase.

7. Si la investigación justifica una tabla o fórmula **consultable de forma aislada** (no solo
   explicativa), extráela también a [`../reference/`](../reference/README.md) — la investigación
   explica el porqué, la referencia da el dato (ver la distinción en
   [`../reference/README.md`](../reference/README.md)).

## Ver también

- [`../../investigaciones/01-transformadores-potencia.md`](../../investigaciones/01-transformadores-potencia.md) — investigación de referencia con el formato completo ya aplicado.
- [`../explanation/README.md`](../explanation/README.md) — por qué `investigaciones/` es el cuadrante de explicación del proyecto y no vive dentro de `docs/`.
