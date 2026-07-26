# Coordinación de aislamiento — BIL / BSL (IEC 60071-1)

## Rangos

| Rango | Um (tensión máxima del sistema) | Parámetro dominante |
|---|---|---|
| Rango I | 1 kV < Um ≤ 245 kV | BIL (impulso de rayo) |
| Rango II | Um > 245 kV | BSL (impulso de maniobra) |

## Valores normalizados representativos

| Um (kV) | Rango | BSL (kV pico) | BIL (kV pico) |
|---|---|---|---|
| 72.5 | I | — | 325 / 350 |
| 145 | I | — | 550 / 650 |
| 245 | I | — | 850 / 950 / 1050 |
| 420 | II | 950 / 1050 | 1300 / 1425 |
| 550 | II | 1050 / 1175 | 1550 / 1675 |

> Selección orientativa, no exhaustiva — IEC 60071-1 admite varias combinaciones por nivel de Um.

## Margen de coordinación mínimo (IEC 60071-2)

- ≥ 20% entre BIL del equipo y el nivel de protección a impulso de rayo del pararrayos (Up, a 10 kA
  nominal, onda 8/20 µs).
- ≥ 15–20% entre BSL del equipo y el nivel de protección a impulso de maniobra del pararrayos.

## Formas de onda normalizadas (IEC 60060-1)

| Sobretensión | Forma de onda |
|---|---|
| Impulso de rayo | 1.2/50 µs |
| Impulso de maniobra | 250/2500 µs |

**Explicación y derivación**: [`investigaciones/05-coordinacion-aislamiento-sobretensiones.md`](../../investigaciones/05-coordinacion-aislamiento-sobretensiones.md).
