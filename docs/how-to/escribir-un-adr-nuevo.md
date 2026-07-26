# Cómo escribir un ADR nuevo

Escribe un ADR cuando tomes una decisión de **arquitectura de software** del simulador con
alternativas reales evaluadas (ej. "grafo vs. análisis nodal", "FSM a mano vs. librería") — no para
decisiones triviales sin alternativa seria, ni para teoría eléctrica (eso va en
`investigaciones/`, ver [`agregar-una-investigacion-tecnica.md`](agregar-una-investigacion-tecnica.md)).

1. Copia la plantilla:

   ```bash
   cp docs/adr/_template.md docs/adr/00NN-titulo-corto-en-kebab-case.md
   ```

   Usa el siguiente número disponible — revisa [`../adr/README.md`](../adr/README.md) para ver el
   último ADR registrado.

2. Completa **Contexto y planteamiento del problema** y **Fuerzas impulsoras** primero, en
   lenguaje neutral — todavía sin argumentar a favor de ninguna opción. Si la decisión nace de una
   investigación existente, enlázala aquí (ej. "ver investigaciones/12 §2").

3. Enumera **todas** las opciones que evaluaste en serio en **Opciones consideradas**, no solo la
   ganadora — y completa **Pros y contras** para cada una. Esta es la parte que más vale la pena no
   saltarse: es lo que le permite a alguien en el futuro confirmar que una alternativa ya fue
   evaluada y descartada, en vez de tener que volver a evaluarla desde cero.

4. Escribe la **Decisión** en voz activa ("Decidimos X porque...") remitiendo a las fuerzas
   impulsoras de la sección 2 — no repitas el análisis de pros/contras aquí, solo la conclusión.

5. En **Consecuencias**, la sub-sección **"Señal de escalar / revisar esta decisión"** debe ser una
   condición **verificable** ("si el número de entidades supera ~200"), nunca una vaguedad tipo "si
   el proyecto crece mucho" — de lo contrario, nadie sabrá cuándo reabrir el ADR.

6. Añade la fila correspondiente a la tabla del índice en [`../adr/README.md`](../adr/README.md).

## Importante — un ADR aceptado nunca se edita

Si una decisión ya documentada cambia, **no** edites el ADR original. Escribe un ADR nuevo con
`supersedes: ADR-NNN` en el front-matter, y actualiza *solo* el campo `status` del ADR viejo a
`reemplazado por ADR-NNN` — su contenido queda intacto como registro histórico de por qué se
decidió así en su momento (ver
[`../../investigaciones/15-adr-design-docs-rfc-bigtech.md` §1](../../investigaciones/15-adr-design-docs-rfc-bigtech.md)).

## Ver también

- [`../adr/README.md`](../adr/README.md) — índice de los 9 ADRs existentes, como ejemplo de formato ya aplicado.
- [`../adr/_template.md`](../adr/_template.md) — la plantilla MADR completa.
