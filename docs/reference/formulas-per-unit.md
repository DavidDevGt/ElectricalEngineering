# Sistema por unidad (per-unit)

## Definición de bases

```
S_base   [MVA] — elegida arbitrariamente (valor redondo común a todo el sistema)
V_base   [kV]  — tensión nominal línea-línea de cada zona de tensión
I_base   [A]   = S_base / (√3 · V_base)
Z_base   [Ω]   = V_base² / S_base   =  V_base / (√3 · I_base)
```

## Conversión a pu

```
V_pu = V_real / V_base
I_pu = I_real / I_base
Z_pu = Z_real / Z_base
```

## Cambio de base de una impedancia

```
Z_pu(nueva base) = Z_pu(base propia) · (S_base_nueva / S_base_propia) · (V_base_propia / V_base_nueva)²
```

## Propiedad central

La impedancia en pu de un transformador es la **misma vista desde cualquiera de sus dos lados**,
si las tensiones base a ambos lados se eligen con la misma relación que la relación de
transformación nominal del equipo.

## Corriente de falla — factores normativos

| Magnitud | Valor de referencia |
|---|---|
| Factor de pico asimétrico (falla > 50 kA) | 2.7 (IEC 62271-100 / IEEE C37.010) |
| Pico teórico máximo (falla totalmente asimétrica) | 2√2 ≈ 2.83× el RMS simétrico |
| X/R típico de referencia para calificación de interruptores | 15–17 |
| Constante de tiempo de decaimiento del offset DC | `τ = (X/R)/(2πf)` |

**Explicación y ejemplo numérico completo**: [`investigaciones/08-cortocircuito-flujo-carga-per-unit.md`](../../investigaciones/08-cortocircuito-flujo-carga-per-unit.md).
