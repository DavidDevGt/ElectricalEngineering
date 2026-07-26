# Investigación 04 — Sistema de Puesta a Tierra de Subestaciones (IEEE Std 80)

> Complementa `IDEA.md`. Fuente normativa central: **IEEE Std 80-2013**, *"IEEE Guide for Safety in
> AC Substation Grounding"* (4ª edición, dedicada a J. G. Sverak, autor de las ecuaciones de tensión
> de malla y resistencia de rejilla usadas desde 1986). Complementada con IEEE Std 81 (medición de
> resistividad) y el trabajo original de C. F. Dalziel sobre fibrilación ventricular. Ver sección
> Fuentes.

---

## 1. El problema físico: Ground Potential Rise (GPR)

Una subestación de alta tensión está diseñada para que, ante una falla a tierra (cortocircuito
fase-tierra, la falla más común en sistemas AT), la corriente de falla `I_f` encuentre un camino de
baja impedancia hacia tierra a través de la **malla de puesta a tierra** (grounding grid): una red
de conductores de cobre desnudo enterrados bajo toda la huella de la subestación, interconectando
estructuras, carcasas de equipos, neutros de transformador y pararrayos.

El problema es que la tierra **no es un conductor ideal**. Tiene una resistividad finita `ρ`
(Ω·m), típicamente entre 10 y varios miles de Ω·m según el tipo de suelo. Cuando la corriente de
falla `I_g` (la fracción de `I_f` que efectivamente se dispersa por la malla hacia tierra remota,
ver sección 6) circula desde la malla hacia el suelo circundante, aparece una caída de tensión
distribuida en el volumen de tierra. Como consecuencia:

- **Toda la malla —y todo lo conectado eléctricamente a ella— se eleva de potencial** respecto a un
  punto de tierra remota (teóricamente en el infinito, en la práctica a partir de unas pocas
  decenas de metros del perímetro de la malla, donde el gradiente de potencial ya es despreciable).
  Esta elevación se llama **GPR (Ground Potential Rise)** y IEEE 80 la define formalmente como *"el
  máximo potencial eléctrico que una malla de puesta a tierra de subestación puede alcanzar
  respecto a un punto de tierra remota, asumido al potencial de tierra remota (0 V)"*.
- El GPR se calcula, en primera aproximación, como:

  **GPR = I_g · R_g**

  donde `R_g` es la resistencia de puesta a tierra global de la malla (Ω) e `I_g` es la corriente
  máxima de falla que retorna por la malla (A). Para una subestación de transmisión con `I_g` del
  orden de 10–30 kA y `R_g` de 0.1–1 Ω, el GPR resultante puede alcanzar varios miles a decenas de
  miles de voltios — órdenes de magnitud muy superiores a lo que un cuerpo humano tolera.
- El problema real de seguridad **no es el GPR en sí** (una persona parada uniformemente sobre un
  potencial elevado, sin ningún gradiente local, no siente nada — es análogo a un pájaro posado en
  una línea de alta tensión). El problema son las **diferencias de potencial locales**: cerca de la
  malla el potencial de superficie no es uniforme, cae desde el valor del GPR (en el conductor) hasta
  0 V (tierra remota) siguiendo un perfil no lineal, más pronunciado cerca de los conductores
  enterrados. Una persona que apoya dos puntos del cuerpo (dos pies, o una mano y dos pies) en
  puntos de ese perfil con distinto potencial queda expuesta a una diferencia de tensión —y por lo
  tanto a una corriente— que atraviesa su cuerpo, incluyendo potencialmente el corazón.

De ahí nacen las dos magnitudes que gobiernan todo el diseño: **tensión de contacto (touch
voltage)** y **tensión de paso (step voltage)**.

---

## 2. Tensión de paso y tensión de contacto: definición y fórmulas IEEE 80

### 2.1 Definiciones geométricas

- **Tensión de contacto (E_touch)**: diferencia de potencial entre el GPR de una estructura metálica
  puesta a tierra (p. ej. la carcasa de un transformador, una reja, un poste) y el potencial de
  superficie en el punto donde están parados los pies de una persona que toca esa estructura con la
  mano, a una distancia horizontal típica de 1 m (alcance del brazo). El camino de corriente es
  **mano → un pie / dos pies en paralelo**.
- **Tensión de paso (E_step)**: diferencia de potencial de superficie entre los dos pies de una
  persona separados 1 m, caminando sobre o cerca de la malla, sin tocar ningún objeto puesto a
  tierra. El camino de corriente es **pie → pie**, ambos en serie.

### 2.2 Fórmulas de tensión tolerable (IEEE 80-2013, ec. 32–37)

La corriente tolerable por el cuerpo humano antes de riesgo de fibrilación ventricular sigue la
formulación empírica de **Dalziel**:

```
I_B(50 kg) = 0.116 / √t_s     [A]
I_B(70 kg) = 0.157 / √t_s     [A]
```

donde `t_s` es la duración del choque en segundos (válida en el rango 0.03–3.0 s), asumida igual al
**tiempo de despeje de la falla** (`t_s` = tiempo de operación de la protección + tiempo de apertura
del interruptor). El origen de esta fórmula es empírico: Dalziel determinó, mediante ensayos con
animales y extrapolación estadística, la energía de choque (`I²·t`) que produce fibrilación
ventricular en el 99.5% de una población de referencia (50 kg o 70 kg). La relación `1/√t` refleja
que el umbral de energía tolerable es aproximadamente constante (`I²·t ≈ k`), es decir, el cuerpo
tolera corrientes mayores si la exposición es más breve — esto es exactamente lo que motiva que
"despejar la falla más rápido" sea una estrategia de seguridad tan potente como "diseñar mejor la
malla": ambas reducen el riesgo, una por tiempo y otra por magnitud de tensión.

El circuito eléctrico completo incluye la resistencia del cuerpo (IEEE 80 asume un valor
**constante y conservador de 1000 Ω**, excluyendo la resistencia de contacto de los pies con el
suelo) más la resistencia de los pies actuando como electrodos circulares de ~0.08 m de radio
apoyados sobre la capa superficial. Esa resistencia de pie se modela como `R_pie ≈ 3·Cs·ρs` (un pie)
y se combina en serie/paralelo según la trayectoria de corriente, dando las ecuaciones finales:

```
E_step(50 kg)  = (1000 + 6·Cs·ρs)  · 0.116/√t_s
E_touch(50 kg) = (1000 + 1.5·Cs·ρs) · 0.116/√t_s

E_step(70 kg)  = (1000 + 6·Cs·ρs)  · 0.157/√t_s
E_touch(70 kg) = (1000 + 1.5·Cs·ρs) · 0.157/√t_s
```

**Explicación de cada término:**

- **1000 Ω**: resistencia interna del cuerpo humano, valor normalizado conservador adoptado por
  IEEE 80 para el camino mano-pies o pie-pie (IEC 60479 usa curvas más detalladas dependientes de
  la trayectoria y la tensión, pero 1000 Ω es el estándar de referencia en la práctica de diseño de
  subestaciones).
- **ρs**: resistividad de la **capa superficial** (Ω·m) — normalmente una capa de grava o piedra
  triturada de 0.10–0.15 m de espesor colocada sobre el suelo nativo dentro del predio de la
  subestación (no la resistividad del suelo profundo `ρ` usada para calcular `R_g`).
- **Cs**: **factor de reducción de capa superficial** (adimensional, 0 < Cs ≤ 1), que corrige el
  hecho de que la capa de grava no es infinitamente gruesa: parte de la corriente de pie escapa
  lateralmente hacia el suelo nativo de menor resistividad debajo. Sverak propuso la aproximación
  cerrada:

  ```
  Cs ≈ 1 - [0.09 · (1 - ρ/ρs)] / (2·hs + 0.09)
  ```

  donde `hs` es el espesor de la capa superficial (m) y `ρ` la resistividad del suelo nativo debajo.
  Sin capa superficial, Cs = 1. Con una capa de grava (ρs típicamente 2000–5000 Ω·m, hasta 10⁶ Ω·m
  en seco) sobre suelo nativo de menor resistividad, Cs cae típicamente a 0.6–0.8, **reduciendo** el
  término `Cs·ρs` efectivo... aunque contraintuitivamente el producto `Cs·ρs` sigue siendo mucho
  mayor que `ρ` sola, que es justamente el efecto buscado (ver sección 4).
- **t_s**: tiempo de despeje de la falla (s) — normalmente el tiempo de la protección primaria más
  el tiempo de apertura del interruptor (típicamente 0.1–1.0 s en diseño de subestaciones de
  transmisión, aunque puede llegar a 3 s si se asume operación de respaldo).

Estas son las tensiones **máximas tolerables**. El criterio de diseño de la malla es: **la tensión
de paso y de contacto reales, calculadas a partir de la geometría de la malla y el GPR (ver sección
5), deben quedar por debajo de estos límites tolerables** en todos los puntos accesibles de la
subestación.

---

## 3. Resistividad del suelo: medición y variabilidad

La resistividad del suelo `ρ` (Ω·m) es el parámetro individual más determinante del diseño, y varía
en varios órdenes de magnitud según el tipo de terreno: desde ~1–10 Ω·m (agua de mar, suelos
pantanosos) hasta 10–100 Ω·m (arcillas húmedas, marga), 100–1000 Ω·m (arena, grava) y hasta
>10 000 Ω·m (roca, granito seco). También varía fuertemente con:

- **Humedad**: la conducción en el suelo es predominantemente electrolítica (iones disueltos en el
  agua intersticial), no metálica. Un suelo que se seca puede multiplicar su resistividad por 10× o
  más; por eso IEEE 80 recomienda diseñar con la resistividad medida en la **estación más seca del
  año** o aplicar factores de corrección estacional, nunca con la lectura más favorable.
- **Temperatura**: por debajo de 0°C la resistividad aumenta abruptamente (el agua se congela y dej
  de conducir iónicamente); IEEE 80 incluye tablas de corrección para suelos con riesgo de
  congelamiento.
- **Estratificación**: casi ningún suelo real es homogéneo. Es común tener una capa superior de
  algunos metros con una resistividad y, debajo, un estrato distinto (roca madre, nivel freático,
  arcilla compactada). Por eso IEEE 80-2013 (Sección 13.4 y Anexo E) recomienda como mínimo un
  **modelo de dos capas** (`ρ1` capa superior, `ρ2` capa inferior, con un espesor `h` de transición)
  cuando las mediciones de campo muestran variación de resistividad con la separación de electrodos
  — lo cual es la norma, no la excepción.

### 3.1 Método de Wenner (4 electrodos)

El método estándar de campo (IEEE Std 81) usa cuatro electrodos metálicos clavados en línea recta y
equiespaciados una distancia `a` (típicamente entre 1 y 30 m, repitiendo el ensayo con `a` creciente
para sondear profundidades mayores). Se inyecta corriente entre los dos electrodos exteriores (C1,
C2) y se mide la caída de tensión entre los dos interiores (P1, P2). La resistividad aparente se
obtiene de:

```
ρ_a = 2·π·a·R
```

donde `R = V/I` es la resistencia medida (Ω) y `a` es el espaciamiento entre electrodos (m). La
clave física del método es que, para una separación `a` dada, la corriente inyectada penetra el
suelo hasta una profundidad aproximadamente proporcional a `a` — por lo tanto, **cada medición con
un `a` distinto sondea un volumen de suelo diferente**, y variando `a` sistemáticamente se obtiene
un perfil de resistividad aparente vs. profundidad, del cual se infiere el modelo de capas mediante
ajuste por mínimos cuadrados o gráficos de interpretación (curvas de Sunde).

### 3.2 Impacto directo en el diseño

La resistividad del suelo entra en **todas** las ecuaciones de diseño: la resistencia global de la
malla `R_g` es directamente proporcional a `ρ` (sección 5), y la tensión de malla/paso reales
también escalan con `ρ`. Un suelo de alta resistividad (p. ej. roca) obliga a mallas físicamente más
grandes, más electrodos, o soluciones alternativas (contrapesos radiales, tratamiento químico del
suelo, pozos profundos hasta capas de menor resistividad) para lograr una `R_g` aceptable — o, si
eso no es viable, el diseño debe apoyarse más en la capa superficial de grava y en tiempos de
despeje rápidos que en bajar `R_g`.

---

## 4. Diseño de la malla: geometría y capa superficial

### 4.1 Geometría típica

Una malla de subestación de transmisión es una rejilla rectangular de conductores de cobre desnudo
(calibres típicos 2/0 a 500 kcmil AWG, dimensionados térmicamente para soportar `I_g` durante `t_s`
sin fundirse — cálculo independiente de la seguridad de tensiones), con parámetros de diseño
típicos:

- **Profundidad de enterramiento**: 0.3–0.6 m (h), suficiente para estar por debajo de la capa de
  grava superficial y de la zona de labranza/tránsito, pero sin necesidad de ir mucho más profundo
  (el efecto de blindaje mutuo entre conductores muy próximos limita la ganancia de enterrar más
  hondo).
- **Espaciamiento entre conductores paralelos (D)**: 3–7 m, más denso cerca del perímetro y en zonas
  de alto riesgo (frente a interruptores, transformadores, puntos de acceso frecuente) para achatar
  el gradiente de potencial ahí donde las personas realmente caminan.
- **Electrodos de tierra verticales (ground rods)**: varillas de 2.4–3 m (o más, hasta decenas de
  metros en diseños con pozos profundos) clavadas en las esquinas de la malla, en los perímetros, y
  bajo pararrayos y neutros de transformador (puntos de inyección concentrada de corriente de
  falla/rayo). Su función principal **no** es tanto reducir la resistencia global (el conductor
  horizontal ya cubre la mayor parte de esa función) sino **estabilizar la resistencia frente a
  variaciones estacionales de humedad superficial** (alcanzan capas más profundas y húmedas todo el
  año) y mitigar gradientes locales en puntos de inyección concentrada de corriente.
- Efecto de mutuo apantallamiento entre varillas: un factor de reducción típico usado en literatura
  de referencia es `k ≈ 0.378·log(spacing/length) + 0.89`; el espaciamiento entre varillas no debe
  ser menor que su propia longitud para no perder efectividad por solapamiento de sus zonas de
  influencia.

### 4.2 Capa superficial de alta resistividad (grava/piedra triturada)

Este es, contraintuitivamente, uno de los elementos de seguridad más eficaces y económicos del
diseño, y su lógica merece explicarse con cuidado porque no es obvia: **no se busca que la capa
superficial conduzca bien — se busca exactamente lo contrario**.

La corriente que atraviesa el cuerpo de una persona en contacto con el suelo depende del divisor de
tensión formado por la resistencia del cuerpo (1000 Ω, fija) en serie con la resistencia de contacto
pie-suelo (`R_pie ≈ 3·Cs·ρs`). Cuanto **mayor** es `ρs` (la resistividad de la capa que el pie está
tocando), **mayor** es `R_pie`, y por lo tanto, para una misma tensión de paso/contacto disponible en
superficie, **menor** es la corriente que efectivamente atraviesa el cuerpo. Una capa de 0.10–0.15 m
de piedra triturada limpia y seca tiene resistividad típica de 2000–5000 Ω·m (puede superar 10⁶ Ω·m
completamente seca), muy superior a cualquier suelo nativo, por lo que multiplica varias veces la
resistencia de contacto de pie y, correspondientemente, **eleva el umbral de tensión tolerable**
(mírese cómo `Cs·ρs` aparece sumando directamente en el numerador de `E_touch` y `E_step`: subir
`ρs` sube directamente la tensión tolerable). En la práctica, esta capa es a menudo la diferencia
entre un diseño que aprueba o no aprueba los criterios de seguridad sin necesidad de rediseñar toda
la malla.

---

## 5. Resistencia global vs. seguridad real: por qué una R_g baja no basta

Un error conceptual común (fuera de la ingeniería de potencia) es asumir que el objetivo del diseño
es simplemente "lograr una resistencia de tierra baja" (p. ej. el clásico criterio genérico de
"menos de 5 Ω" usado en instalaciones de baja tensión). **IEEE 80 rechaza explícitamente ese
criterio como suficiente para subestaciones AT.** La razón es que `R_g` es un parámetro *global* —
determina cuánto se eleva el GPR total— pero dice **nada** sobre cómo se distribuye el potencial en
la superficie dentro y alrededor de la subestación, que es lo que realmente determina si una persona
sufre una tensión de paso o contacto peligrosa.

Es perfectamente posible tener una `R_g` muy baja (p. ej. una única varilla profunda que alcanza un
estrato de muy baja resistividad) y aun así tener gradientes de potencial superficiales letales cerca
de esa varilla, porque toda la caída de potencial se concentra en un volumen pequeño alrededor del
único electrodo. Inversamente, una malla mucho más grande con conductores bien distribuidos puede
tener una `R_g` moderada pero un perfil de potencial de superficie mucho más "aplanado" —porque
reparte la inyección de corriente en muchos puntos— y en consecuencia tensiones de paso/contacto
seguras incluso con GPR relativamente alto.

Por eso IEEE 80 estructura el proceso de diseño como una verificación en dos pasos independientes:

1. Estimar `R_g` (fórmula de Sverak, sección 6) para conocer el GPR esperado.
2. **Independientemente**, calcular la **tensión de malla (mesh voltage, E_m)** —la tensión de
   contacto aproximada máxima esperada dentro de la malla, típicamente en el centro de la celda de
   esquina de la rejilla, donde el gradiente es más pronunciado— y la **tensión de paso (E_s)**
   máxima esperada, mediante las ecuaciones de Sverak:

   ```
   E_m = (ρ · K_m · K_i · I_g) / L_M
   E_s = (ρ · K_s · K_i · I_g) / L_S
   ```

   donde `K_m` y `K_s` son factores geométricos que dependen del espaciamiento `D`, diámetro del
   conductor `d`, profundidad `h` y número de conductores paralelos `n`; `K_i` es un factor de
   corrección por irregularidad de la distribución de corriente (aproximadamente `0.644 + 0.148·n`);
   y `L_M`, `L_S` son las longitudes efectivas de conductor (horizontal + varillas, con distintos
   pesos) que participan en cada mecanismo.

3. Comparar `E_m ≤ E_touch(tolerable)` y `E_s ≤ E_step(tolerable)` en **todos los puntos críticos**
   de la huella de la subestación. Solo si ambas condiciones se cumplen el diseño se considera
   seguro — independientemente de cuán "buena" luzca la `R_g` global.

---

## 6. Corriente de falla de diseño y el factor de división (split factor)

No toda la corriente de falla a tierra `3I_0` (o `I_f`, según notación) regresa a la fuente
atravesando el suelo desde la malla. En un sistema real, parte de esa corriente retorna por caminos
metálicos alternativos que corren en paralelo con el suelo: los **cables de guarda (shield wires)**
de las líneas de transmisión conectadas a la subestación, las **pantallas de cables subterráneos**, y
los **neutros multiaterrizados (MGN)** de líneas de distribución. Esa fracción de corriente nunca
pasa por el volumen de tierra alrededor de la malla y, por lo tanto, no contribuye al GPR ni a las
tensiones de paso/contacto.

El **factor de división** o **split factor (Sf)** se define como:

```
Sf = I_g / I_f
```

la fracción de la corriente total de falla que efectivamente se dispersa desde la malla hacia tierra
remota (la parte relevante para el diseño de seguridad). IEEE 80 (Anexo C, y su norma complementaria
sobre distribución de corriente de falla) ofrece tres métodos para estimarlo: un método gráfico
simplificado, un cálculo de circuito equivalente con las impedancias de los cables de guarda y las
tomas de tierra de cada torre a lo largo de la línea, o software de análisis (p. ej. el módulo
FCDIST de SES/CDEGS). Valores típicos en literatura de referencia: **Sf entre 0.4 y 0.85** según la
configuración —sistemas con cables de guarda de baja impedancia y muchas torres bien aterrizadas
entre la subestación y la fuente derivan más corriente lejos del suelo (Sf bajo); sistemas con
retorno predominante por MGN de distribución suelen usarse conservadoramente en el rango 0.6–0.8—.

Usar `I_f` completa en vez de `I_g = Sf · I_f` sobrediseña (desperdicia cobre y superficie) pero
nunca es inseguro; usar un `Sf` optimista sin justificación técnica es el error opuesto y
potencialmente peligroso, por lo que IEEE 80 exige documentar el método de cálculo del split factor,
no asumirlo.

---

## 7. Consecuencias de un mal diseño

La literatura de ingeniería (IEEE, EPRI, y los manuales de las propias utilities) documenta de forma
recurrente el mismo patrón de falla de diseño real, más que casos aislados espectaculares:

- **Electrocución de personal de mantenimiento** al tocar una estructura o carcasa metálica durante
  una falla externa a la subestación (p. ej. una falla en una línea adyacente que hace circular
  corriente de falla parcialmente por la malla local vía el neutro), en instalaciones donde el
  diseño de la malla nunca verificó `E_m` contra `E_touch` — típicamente subestaciones antiguas
  diseñadas antes de la adopción generalizada de IEEE 80 (pre-1960s/70s), o ampliaciones donde se
  añadió equipo sin re-verificar el perfil de potencial de la malla existente.
- **Tensión transferida (transferred voltage)**: un caso particular y especialmente peligroso donde
  un conductor metálico continuo (una cerca perimetral mal segmentada, una tubería metálica, un
  cable de comunicaciones o de neutro de baja tensión) conecta la malla de la subestación —a
  potencial GPR durante la falla— con un punto **fuera** de la huella de la subestación, a potencial
  de tierra remota (0 V). Una persona parada fuera de la subestación tocando ese conductor recibe
  esencialmente el **GPR completo**, sin ningún factor `Cs` reductor, porque no hay ninguna capa de
  grava fuera del predio. Esta es la razón por la que IEEE 80 exige segmentar eléctricamente cercas
  metálicas en el límite de la propiedad y prohíbe continuidad metálica no controlada saliendo de la
  huella de la malla.
- **Casos de estudio recurrentes en cursos de ingeniería** (IEEE tutorials, EPRI substation
  grounding guides) usan escenarios estándar de aprendizaje: (1) una malla dimensionada solo con el
  criterio "R_g < 1 Ω" que resulta insegura en tensión de paso porque la corriente se concentra en
  pocas varillas profundas en vez de repartirse en una rejilla amplia; (2) subestaciones en suelos de
  muy alta resistividad (roca) donde omitir la capa de grava superficial —por ahorro de costo— deja
  el sitio con tensiones de contacto varias veces por encima del límite tolerable aun con una malla
  geométricamente correcta.

El punto pedagógico central que se repite en toda la literatura: la seguridad de una subestación
frente a fallas a tierra depende de **tres defensas independientes que deben verificarse por
separado** — geometría de la malla (achatar el gradiente), capa superficial (subir la resistencia de
contacto del cuerpo) y velocidad de despeje de la protección (reducir el tiempo de exposición) — y
ninguna de las tres compensa por sí sola una falla grave en las otras dos.

---

## 8. Puntos clave para la simulación educativa

Para que el simulador 3D transmita esto de forma intuitiva, en vez de solo mostrar números:

1. **Heatmap 3D del potencial de superficie.** Modelar la malla como una rejilla de conductores
   enterrados (geometría simplificada: N×M celdas con espaciamiento `D`, profundidad `h`) e
   implementar un cálculo aproximado del potencial de superficie `V(x,y)` como superposición de las
   contribuciones de cada segmento de conductor tratado como fuente de corriente lineal (aproximación
   simplificada tipo "método de imágenes" o incluso una aproximación aún más simple: modelar cada
   nodo de la rejilla como una fuente puntual con caída `V(r) ≈ I·ρ/(2π·r)` y sumar contribuciones —
   suficiente para fines educativos, sin pretender la precisión de un solver de campo tipo CDEGS).
   Renderizar el resultado como una textura de color (heatmap) proyectada sobre un plano justo encima
   del terreno: rojo/naranja intenso cerca de los conductores y estructuras aterrizadas (alto
   potencial, cerca del GPR), degradando a azul/verde hacia el perímetro (cerca de 0 V en tierra
   remota). Esto hace **visible** el concepto central de la sección 1: el peligro no es "estar
   parado sobre tierra elevada" sino "estar sobre un gradiente".
2. **Modo "falla simulada"**: un botón/evento que dispara una falla a tierra en un punto de la malla
   (p. ej. la base de un transformador), anima el heatmap apareciendo/intensificándose, y muestra
   simultáneamente un contador numérico con el GPR calculado, el tiempo de despeje transcurrido, y
   un semáforo de seguridad.
3. **Visualizar explícitamente la diferencia paso vs. contacto** con un avatar/muñeco 3D simple
   que el usuario puede colocar en distintos puntos del heatmap:
   - **Modo tensión de paso**: mostrar los dos "pies" del avatar separados 1 m, leer el potencial de
     superficie bajo cada pie del heatmap, calcular y mostrar la diferencia (`E_step` real) junto al
     límite tolerable de la fórmula, con codificación de color (verde/rojo) según si excede el
     límite.
   - **Modo tensión de contacto**: mostrar el avatar tocando con la "mano" una estructura metálica
     puesta a tierra cercana (a potencial ≈ GPR) mientras sus pies están sobre el heatmap de
     superficie a cierta distancia; calcular y mostrar `E_touch` real vs. tolerable de la misma
     forma. Es pedagógicamente valioso dejar que el usuario **arrastre** el avatar y vea en tiempo
     real cómo `E_step`/`E_touch` cambian según la posición —más peligroso cerca del perímetro de la
     malla o de una estructura aislada, más seguro en el centro de una rejilla densa—, y cómo activar
     una capa de "grava" (toggle) sube instantáneamente el umbral tolerable (visualiza el rol de
     `Cs·ρs` sin necesidad de que el usuario entienda la fórmula primero).
4. **Panel de parámetros interactivo**: sliders para `ρ` (resistividad del suelo), espaciamiento `D`
   de la malla, número de varillas, y espesor/resistividad de la capa de grava — todos recalculando
   en vivo `R_g`, GPR, `E_m`, `E_s` y el heatmap, para que el usuario descubra experimentalmente los
   trade-offs de la sección 5 (por qué achicar espaciamiento ayuda más que solo agregar varillas
   profundas, por qué la grava es barata y muy efectiva, etc.) en vez de solo leerlos.

---

## Fuentes

- [IEEE Guide for Safety in AC Substation Grounding (IEEE Std 80) — copia alojada, normograma Armada Nacional](https://www.armada.mil.co/sites/default/files/normograma_arc/mantenimiento1/IEEE%2080.pdf)
- [IEEE STANDARD 80-2000 — IEEE Substations Committee, tutorial/colloquium handout (J. Garrett)](https://ewh.ieee.org/cmte/substations/scm0/Chicago%20Meeting/Conference%20PDFs/tutorial%20handouts/Colloquium/Grounding%20Guide%2080%20-%20Garrett.pdf)
- [Safety Limit Calculations to IEEE and IEC Standards — ELEK Software (PDF técnico con fórmulas de Cs, tensiones tolerables, Dalziel)](https://elek.com/wp-content/uploads/2019/10/Safety-Limit-Calculations-to-IEEE-and-IEC-Standards.pdf)
- [Safety Limit Calculations to IEEE and IEC Standards — ELEK Software (versión web)](https://elek.com/articles/safety-limit-calculations-to-ieee-and-iec-standards/)
- [A simplified method for calculating the substation grounding grid resistance — J. G. Sverak, ResearchGate](https://www.researchgate.net/publication/3272459_A_simplified_method_for_calculating_the_substation_grounding_grid_resistance)
- [Substation Components—Part 8: Grounding/Earthing Systems — EEPower, Technical Articles](https://eepower.com/technical-articles/substation-componentspart-8-grounding-earthing-systems/)
- [Substation Grounding Basics: Step, Touch, and Transferred Voltages (Part 2 de 3) — EEPower](https://eepower.com/technical-articles/the-basics-of-substation-grounding-step-touch-and-transferred-voltages-part-2-of-3/)
- [Ground Potential Rise, Step and Touch Potential — Voltage Disturbance (Power Engineering)](https://voltage-disturbance.com/power-engineering/ground-potential-rise-step-and-touch-potential/)
- [Dalziel revisited: a study of the electrical parameters affecting ventricular fibrillation — IEEE Xplore](https://ieeexplore.ieee.org/document/4816198/)
- [Dalziel — Reevaluation of lethal electrical currents (paper original, alojado en Fing/UdelaR)](https://eva.fing.edu.uy/pluginfile.php/95537/mod_folder/content/0/Dalziel%20-%20Reevaluation%20of%20lethal%20electrical%20currents.pdf?forcedownload=1)
- [How to Perform a Soil Resistivity Test for Substation Grounding Grid Design? (método de Wenner) — HV Hipot Blog](https://blog.hvhipot.com/2026/05/09/how-to-perform-a-soil-resistivity-test-for-substation-grounding-grid-design/)
- [SUBSTATION GROUNDING OPTIMIZATION — tesis/proyecto, CalState ScholarWorks](https://scholarworks.calstate.edu/downloads/8c97kq52z)
- [Ground Grid Calculator — IEEE 80-2013 Substation Earthing — SparkyCalc (referencia de fórmulas de Km, Ki, Sverak)](https://sparkycalc.com/ground-grid-calculator/)
- [Split Factor - Grounding systems — Eng-Tips (discusión técnica con referencias a Anexo C de IEEE 80)](https://www.eng-tips.com/threads/split-factor-grounding-systems.203435/)
- [A complete procedure to determine earth fault current distribution and split factor for grounding grid design of HV substations — ResearchGate](https://www.researchgate.net/publication/228683636_A_complete_procedure_to_determine_earth_fault_current_distribution_and_split_factor_for_grounding_grid_design_of_HV_substations)
- [Ground Fault Current Split Factor Calculations for Multi-Grounded Neutral Systems — Industrial Monitor Direct](https://industrialmonitordirect.com/blogs/knowledgebase/ground-fault-current-split-factor-calculations-for-multi-grounded-neutral-systems)
- [FCDIST | Simplified Fault Current Distribution Analysis — SES & Technologies (software de referencia usado en la industria junto a CDEGS)](https://www.sestech.com/en/Product/Module/FCDIST)
- [Effects of the Changes in IEEE Std. 80 on the Design and Testing of Grounding Systems — SES Technologies (paper técnico)](https://www.sestech.com/pdf/159_Changes%20in%20IEEE80.pdf)
- [Substation Earthing Design per IEEE 80 — Step by Step — Wind Farm BoP](https://www.windfarmbop.com/substation-earthing-design-per-ieee-80-step-by-step/)
