---
# ADR-006: Euler semi-implícito como método de integración por defecto para las EDOs del dominio
status: aceptado
date: 2026-07-25
supersedes: null
---

## Contexto y planteamiento del problema

Con un timestep fijo ya decidido (ADR-005), hace falta elegir el método numérico de integración
para las ecuaciones diferenciales del dominio — el caso más exigente es el modelo de arco de Mayr
(investigación 02), cuya conductancia colapsa de forma abrupta cerca del cruce por cero de
corriente (comportamiento "rígido"/stiff en una ventana de tiempo corta).

## Fuerzas impulsoras (decision drivers)

- Costo computacional: el simulador corre en el navegador, en tiempo real, con potencialmente
  varias EDOs activas simultáneamente.
- Estabilidad y conservación de energía razonable para la mayoría de las dinámicas del proyecto.
- Precisión adicional solo donde realmente se necesita (la ventana rígida del arco), no en todo
  el sistema por defecto.

## Opciones consideradas

1. **Euler explícito** — el método más simple, un cálculo por paso.
2. **Euler semi-implícito (symplectic Euler)** — casi el mismo costo que Euler explícito, mejor
   conservación de energía.
3. **Runge-Kutta 4 (RK4)** — mayor precisión, 4 evaluaciones por paso.

## Decisión

Se elige **Euler semi-implícito como método por defecto** para la mayoría de las EDOs del dominio,
reservando **RK4 (o sub-stepping) solo para la ventana rígida** del colapso de conductancia del
arco de Mayr cerca del cruce por cero (investigación 09 §3).

## Pros y contras de las opciones

### Euler explícito

- Bueno, porque es el más simple y barato de implementar.
- Malo, porque es inestable o impreciso con pasos grandes o sistemas rígidos — no conserva
  energía razonablemente en simulación interactiva prolongada.

### Euler semi-implícito

- Bueno, porque es el estándar de facto en videojuegos/simulación interactiva: casi el mismo costo
  que Euler explícito, con mucha mejor conservación de energía.
- Bueno, porque es suficiente para la mayoría de las dinámicas del proyecto (decaimientos,
  aproximaciones a régimen permanente).
- Malo, porque sigue siendo insuficiente en la ventana rígida específica del colapso de
  conductancia del arco.

### RK4

- Bueno, porque da mayor precisión y estabilidad en sistemas rígidos.
- Malo, porque cuesta 4 evaluaciones por paso — aplicarlo a todo el sistema por defecto sería
  sobrecosto innecesario para dinámicas que no lo requieren.

## Consecuencias

- **Positivas**: costo computacional bajo por defecto, con precisión adicional dirigida solo donde
  el modelo físico realmente la necesita (arco cerca de current-zero).
- **Negativas**: el modelo de dominio necesita poder distinguir cuándo está en la ventana rígida
  para cambiar de método o hacer sub-stepping — una pieza adicional de lógica, no gratuita.
- **Señal de escalar / revisar esta decisión**: si aparecen nuevas EDOs rígidas en otros
  componentes (no solo el arco) que semi-implícito no maneje establemente, ampliar el criterio de
  cuándo usar RK4/sub-stepping, documentado en un ADR nuevo si el criterio cambia sustancialmente.

## Más información

- [`investigaciones/09-simulacion-tiempo-real-integracion-numerica.md` §3, §7](../../investigaciones/09-simulacion-tiempo-real-integracion-numerica.md).
- [`investigaciones/02-interruptores-arco-electrico.md` §1](../../investigaciones/02-interruptores-arco-electrico.md) (modelos de Cassie y Mayr).
