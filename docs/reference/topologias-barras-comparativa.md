# Configuraciones de barras — comparativa

| Topología | Interruptores/circuito | Costo relativo | Mantenimiento sin corte | Vulnerabilidad N-1 | Vulnerabilidad N-2 |
|---|---|---|---|---|---|
| Barra simple | 1 | 1× (base) | No | Alta — falla de barra tumba todo | Catastrófica |
| Principal + transferencia | 1 (+1 compartido) | ~1.1-1.2× | Solo interruptores | Alta ante falla de barra | Alta |
| Doble barra, 1 interruptor | 1 | ~1.2-1.3× | Parcial (maniobra manual) | Media | Alta |
| Anillo (ring bus) | ~1 (compartido) | ~1.3× | Sí, interruptores individuales | Baja en anillos pequeños, sube con más posiciones | Puede partir el anillo |
| Interruptor y medio | 1.5 | ~1.5× | Sí, interruptores y barras | Muy baja | Falla del interruptor central saca 2 circuitos |
| Doble barra, doble interruptor | 2 | ~2× | Sí, total | Mínima | Mínima |

## Uso típico por nivel

| Nivel | Topología típica |
|---|---|
| Distribución (BT/MT) | Barra simple o barra simple seccionada |
| Subtransmisión / continuidad exigida | Principal + transferencia, o doble barra con 1 interruptor |
| Transmisión (AT, hasta ~6 circuitos) | Anillo |
| Transmisión / EAT (345 kV+), nodos críticos | Interruptor y medio |
| Generación / máxima criticidad | Doble barra + doble interruptor |

**Explicación, casos reales (apagón Suecia/Dinamarca 2003) y criterio N-1**: [`investigaciones/06-topologias-confiabilidad-subestaciones.md`](../../investigaciones/06-topologias-confiabilidad-subestaciones.md).
