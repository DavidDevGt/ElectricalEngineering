# Límites de seguridad — tensión de paso y de contacto (IEEE Std 80)

## Fórmulas de tensión tolerable (Sverak, con coeficiente de Dalziel)

```
E_step(50kg)  = (1000 + 6·Cs·ρs)   · 0.116/√ts
E_touch(50kg) = (1000 + 1.5·Cs·ρs) · 0.116/√ts

E_step(70kg)  = (1000 + 6·Cs·ρs)   · 0.157/√ts
E_touch(70kg) = (1000 + 1.5·Cs·ρs) · 0.157/√ts
```

| Símbolo | Significado |
|---|---|
| 1000 (Ω) | Resistencia interna del cuerpo humano (valor normalizado IEEE 80) |
| `0.116/√ts` (A) | Corriente tolerable, persona de 50 kg, antes de fibrilación ventricular (Dalziel) |
| `0.157/√ts` (A) | Ídem, persona de 70 kg |
| `ρs` (Ω·m) | Resistividad de la capa superficial (grava), típico 2000–5000 Ω·m |
| `Cs` | Factor de reducción de capa superficial, 0 < Cs ≤ 1 — fórmula de Sverak: `Cs ≈ 1 − [0.09·(1−ρ/ρs)]/(2hs+0.09)` |
| `ts` (s) | Tiempo de despeje de la falla (protección + interruptor), válido en rango 0.03–3.0 s |

## Ecuaciones de tensión real de diseño (Sverak)

```
E_m = (ρ · K_m · K_i · I_g) / L_M      (tensión de malla — mesh voltage)
E_s = (ρ · K_s · K_i · I_g) / L_S      (tensión de paso máxima esperada)
```

Criterio de diseño: `E_m ≤ E_touch(tolerable)` y `E_s ≤ E_step(tolerable)` en **todos** los puntos
accesibles de la subestación — verificado por separado de la resistencia global `R_g`.

## Split factor (fracción de corriente que retorna por la malla)

```
Sf = I_g / I_f        (típico 0.4–0.85)
```

## Regla de rechazo explícita de IEEE 80

Una resistencia de puesta a tierra global baja (`R_g` baja) **no** garantiza por sí sola tensiones
de paso/contacto seguras — deben verificarse `E_m` y `E_s` independientemente.

**Explicación y derivación completa**: [`investigaciones/04-puesta-a-tierra-ieee80.md`](../../investigaciones/04-puesta-a-tierra-ieee80.md).
