# Investigación 10 — Visualización Científica en Tiempo Real (WebGL/Three.js)

> Complementa `IDEA.md`. A diferencia de las investigaciones 01-08 (física/normativa del dominio
> eléctrico), este documento cubre la **capa de renderizado**: cómo trasladar los campos, ondas y
> curvas de esas investigaciones a píxeles en un navegador a 60 fps. Fuentes: documentación oficial
> de [Three.js](https://threejs.org/docs/), [The Book of Shaders](https://thebookofshaders.com/),
> documentación de [D3.js](https://d3js.org/), y literatura de referencia en colormaps perceptuales
> y GPGPU. Ver sección Fuentes al final.

---

## 1. Renderizado de campos escalares continuos (heatmaps) en 3D

El heatmap de potencial de superficie de la malla de tierra (investigación 04) es, matemáticamente,
una función continua `V(x, y)` — la superposición de los potenciales inducidos por cada segmento de
conductor enterrado, evaluada en cada punto del plano del suelo. Hay dos formas legítimas de
llevarlo a pantalla en Three.js, y difieren en **dónde** se evalúa esa función.

### 1.a. Cálculo en CPU + `DataTexture`

Se discretiza el dominio en una grilla `N×N` (p. ej. 256×256), se evalúa `V(x,y)` en JavaScript para
cada celda (recorriendo la lista de segmentos de la malla y sumando la contribución de cada uno —
la misma superposición que ya exige IEEE 80), se mapea cada valor a un color vía una función de
colormap (sección 2), y el resultado se sube a la GPU como una
[`THREE.DataTexture`](https://threejs.org/docs/#api/en/textures/DataTexture) aplicada como `map` de
un `MeshBasicMaterial` sobre un `PlaneGeometry`.

```js
const size = 256;
const data = new Uint8Array(size * size * 4); // RGBA
for (let j = 0; j < size; j++) {
  for (let i = 0; i < size; i++) {
    const { x, y } = gridToWorld(i, j);
    const V = potencialSuperficie(x, y, conductores, Ig, rho); // superposición IEEE 80
    const [r, g, b] = viridis(normalize(V, Vmin, Vmax));
    const idx = (j * size + i) * 4;
    data.set([r, g, b, 255], idx);
  }
}
const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
texture.needsUpdate = true; // obligatorio tras (re)escribir `data`
```

Cuando cambian parámetros (`I_g`, `ρ`, posición de un conductor), se recalcula el array y se vuelve
a marcar `texture.needsUpdate = true` — Three.js re-sube el buffer al GPU. Un hilo del foro oficial
discute exactamente este patrón para pasar "grandes cantidades de datos" a un shader: texturas (que
también se pasan como uniforms) son la vía recomendada cuando el volumen de datos excede lo cómodo
para uniforms sueltos ([discourse.threejs.org/t/25944](https://discourse.threejs.org/t/how-to-pass-large-amounts-of-data-to-a-fragment-shader/25944)).

**Ventaja**: el código es JS plano, fácil de depurar con `console.log`, reutiliza directamente la
misma función `potencialSuperficie()` que alimenta los cálculos numéricos de `E_step`/`E_touch` del
modelo de dominio (§8 de IDEA.md exige esa separación dominio/render) — una sola fuente de verdad
para la fórmula. **Costo**: recalcular una grilla 256×256 en CPU con una suma sobre N conductores es
`O(N·256²)`; para mallas con decenas de segmentos y actualización solo al soltar un slider (no cada
frame), esto es completamente viable en JS puro (unos pocos ms).

### 1.b. Cálculo directo en el fragment shader (GPU)

La alternativa es no precalcular nada: se renderiza el mismo plano con un `ShaderMaterial` cuyo
fragment shader recibe la lista de posiciones de conductores, `I_g` y `ρ` como **uniforms** (un
`vec3[]` de posiciones, un `float` de corriente, etc.), y evalúa la fórmula de superposición
**por píxel, en paralelo**, en cada frame:

```glsl
uniform vec2 conductores[MAX_SEGMENTOS];
uniform float Ig, rho;
varying vec2 vUv;

void main() {
  float V = 0.0;
  for (int k = 0; k < MAX_SEGMENTOS; k++) {
    float d = distance(vUv, conductores[k]);
    V += (Ig * rho) / (2.0 * PI * max(d, 0.05)); // superposición puntual simplificada
  }
  vec3 color = viridis(normalize(V));
  gl_FragColor = vec4(color, 1.0);
}
```

Esto es exactamente el patrón GPGPU: mover el bucle `for cada conductor` de JS al shader, donde se
ejecuta en miles de núcleos simultáneos (uno por píxel) en vez de secuencialmente. El límite práctico
es el tamaño de arrays de uniforms que WebGL permite declarar en el shader (fijo en tiempo de
compilación, `MAX_SEGMENTOS` debe conocerse de antemano o recompilar el shader si cambia el número de
conductores).

**Trade-off central**: (a) es más simple de escribir y depurar, y es suficiente si el campo se
recalcula solo cuando el usuario suelta un slider — el caso típico de un heatmap educativo. (b)
escala mejor si se necesita **recalcular cada frame a alta resolución** (p. ej. arrastrando un
conductor en vivo con feedback visual continuo, o combinando el heatmap con una animación temporal
del GPR durante el transitorio de falla) — ahí, subir una `DataTexture` de 256×256 desde JS cada
frame empieza a costar más que dejar que la GPU lo recalcule en paralelo. Para el proyecto, **(a) es
la elección correcta**: el heatmap de la malla de tierra cambia cuando el usuario ajusta `ρ`, la
capa de grava, o arrastra el avatar — no es una animación continua de alta frecuencia (ver §7).

---

## 2. Mapeo de color: por qué no "jet" (arcoíris)

El colormap "jet" (azul→cian→verde→amarillo→rojo), heredado de MATLAB y omnipresente en software de
ingeniería antiguo, es problemático por tres razones documentadas en la literatura de visualización
científica:

1. **No es perceptualmente uniforme**: un salto igual en el valor de los datos no produce un salto
   igual percibido en el color. Jet tiene bandas de luminancia casi constante (el amarillo y el cian
   se perciben con brillo similar) que generan **artefactos falsos** — el ojo humano detecta bordes
   donde no los hay en los datos, y los oculta donde sí los hay.
2. **Ilegible en escala de grises o para daltonismo**: al convertir jet a blanco y negro, el orden de
   los valores se pierde (partes del degradado no son monótonas en luminancia), y las transiciones
   rojo-verde son indistinguibles para la forma más común de daltonismo (deuteranopía).
3. **No tiene una progresión de luminancia monótona**: esto es lo que técnicamente rompe la lectura
   cuantitativa — un mapa de color científico debería poder leerse "a ojo" como un proxy de
   magnitud incluso sin la leyenda.

**Viridis** (y su familia magma/inferno/plasma) fue diseñada específicamente para resolver esto. En
2015, Nathaniel J. Smith y Stéfan van der Walt (con input de Eric Firing) diseñaron los cuatro
candidatos para reemplazar jet como default de matplotlib 2.0; el criterio de diseño fue explícito:
uniformidad perceptual (analíticamente casi uniforme en el espacio de color **CIELAB**, donde la
distancia euclidiana entre dos colores se corresponde con la diferencia perceptual real), progresión
de luminancia **monótonamente creciente** (legible en escala de grises), y robustez ante las formas
más comunes de daltonismo. "Opción D" de ese proceso se convirtió en Viridis
([visualizing.jp/en/matplotlib-colorscheme](https://visualizing.jp/en/matplotlib-colorscheme/),
[matplotlib.org/stable/users/explain/colors/colormaps](https://matplotlib.org/stable/users/explain/colors/colormaps.html)).

Implementación práctica en un shader: viridis se aproxima bien con un polinomio de bajo grado sobre
el parámetro normalizado `t ∈ [0,1]` (existen aproximaciones GLSL de 6-7 términos ampliamente
publicadas, sin necesidad de textura de lookup), lo cual es preferible a cargar una textura 1D de 256
colores solo para esto — menos una dependencia de asset, y evaluable tanto en el shader (§1.b) como
en JS (§1.a) con la misma fórmula, manteniendo consistencia visual entre ambos casos.

**Recomendación para el proyecto**: usar viridis (o magma, más oscuro en el extremo bajo, útil si se
superpone texto/UI) para todo dato secuencial continuo (heatmap de GPR, mapa de error de TC vs.
corriente). Reservar una paleta divergente (p. ej. azul-blanco-rojo, centrada en el valor "seguro")
solo si se necesita mostrar explícitamente una zona segura/insegura respecto a un umbral — ahí sí
importa que el punto medio sea perceptualmente neutro, un caso de uso distinto al secuencial.

---

## 3. Shaders para el arco eléctrico / efecto de plasma

El arco de la investigación 02 (canal de plasma no lineal entre contactos, gobernado por los modelos
de Cassie/Mayr, que se apaga en el cruce por cero de corriente) no necesita simulación física real
para verse convincente — necesita un **shader procedural** que combine cuatro técnicas estándar:

1. **SDF (signed distance function) para el tubo del arco**: en vez de modelar el arco como una
   malla explícita, se define una función matemática que da la distancia del punto evaluado al eje
   del arco (un segmento curvo entre los dos contactos, que se mueven al abrir el interruptor). Un
   SDF de "cápsula" (segmento con radio) es el bloque base:
   ```glsl
   float sdCapsule(vec3 p, vec3 a, vec3 b, float r) {
     vec3 pa = p - a, ba = b - a;
     float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
     return length(pa - ba * h) - r;
   }
   ```
   El signo/magnitud de esta distancia se usa directamente como base de la intensidad del glow (más
   brillante cerca de `d=0`, cae con la distancia). Referencia canónica de la técnica: Iñigo Quilez,
   [iquilezles.org/articles/distfunctions](https://iquilezles.org/articles/distfunctions/), y la
   introducción accesible de Julia Evans,
   [jvns.ca — writing shaders with SDFs](https://jvns.ca/blog/2020/03/15/writing-shaders-with-signed-distance-functions/).
2. **Ruido procedural (Simplex/Perlin) para la turbulencia**: el eje recto del SDF se perturba
   sumando ruido 3D animado en el tiempo (`sdCapsule(p + noise(p, t)*amplitud, ...)`), lo que da el
   aspecto retorcido/inestable característico de un canal de plasma real. El capítulo de referencia
   es [The Book of Shaders — Noise](https://thebookofshaders.com/11/) (fundamentos de ruido de
   valor/Perlin en GLSL) y su continuación
   [More noise](https://thebookofshaders.com/12/) (ruido celular) y
   [Fractal Brownian Motion](https://thebookofshaders.com/13/) (sumar octavas de ruido a distintas
   frecuencias/amplitudes da turbulencia multi-escala, más realista que una sola octava). Para
   implementaciones GLSL listas para copiar (evitando reinventar la función de ruido), la librería
   de referencia de Stefan Gustavson/Ian McEwan es el estándar de facto:
   [stegu.github.io/webgl-noise](https://stegu.github.io/webgl-noise/webdemo/).
3. **Blending aditivo para el glow**: el material del arco se configura con
   `blending: THREE.AdditiveBlending, depthWrite: false, transparent: true`. Cada fragmento suma su
   color al framebuffer en vez de reemplazarlo — así, donde varias capas del efecto se superponen
   (núcleo brillante + halo difuso), el resultado se satura hacia blanco, exactamente el
   comportamiento de una fuente de luz real sobreexpuesta. Advertencia documentada: sobre un fondo
   que no sea negro puro, el aditivo "lava" la escena (todo tiende a blanco) — para una subestación
   con fondo de cielo/terreno, conviene limitar el aditivo al propio quad/tubo del arco (renderizado
   aparte o con blending local) y no aplicarlo a toda la escena.
4. **Modulación de intensidad ligada al dominio eléctrico**: la variable crítica pedagógica (IDEA.md
   §7) es que el arco debe apagarse **exactamente** en el cruce por cero de corriente, no en un
   tiempo arbitrario. Esto se logra pasando la corriente instantánea del modelo de dominio como
   uniform:
   ```glsl
   uniform float corrienteInstantanea; // = I_pico * sin(omega * t), calculado en JS
   float intensidad = smoothstep(0.0, 0.05, abs(corrienteInstantanea) / I_pico);
   gl_FragColor = vec4(colorGlow * intensidad, intensidad);
   ```
   El shader no "sabe" de electricidad — solo recibe un `float` ya calculado por el modelo de
   dominio (`SubstationModel`, IDEA.md §8) y lo usa para escalar el brillo. Esto mantiene la
   separación arquitectónica: la física vive en JS, el shader solo interpreta un número.

---

## 4. Sistemas de partículas: CPU vs. GPU (GPGPU)

Actualizar posición/velocidad/vida de partículas en JavaScript (CPU) es directo: un array de
objetos o de floats, un bucle `for` en cada frame que integra física simple (`pos += vel*dt`), y un
`THREE.Points` cuyo `BufferAttribute` de posición se reescribe cada frame. Esto funciona bien hasta
del orden de unos pocos miles de partículas — más allá, el bucle JS y la re-subida del buffer entero
a la GPU cada frame empiezan a comer el presupuesto de frame (16.6 ms a 60 fps).

La alternativa GPGPU evita mover datos de partículas entre CPU y GPU en absoluto: el **estado**
(posición, velocidad) de cada partícula se almacena como los píxeles de una textura (cada partícula
= un texel, sus componentes RGBA = x,y,z,vida), y la actualización se hace **render-to-texture**: un
fragment shader lee la textura de estado del frame anterior y escribe la del frame siguiente a un
render target distinto — la técnica de **ping-pong buffers** (dos texturas, se alterna cuál es
lectura y cuál escritura cada frame, evitando leer y escribir el mismo buffer simultáneamente). En
Three.js esto está empaquetado en el helper oficial `GPUComputationRenderer`
([threejs.org/docs/GPUComputationRenderer](https://threejs.org/docs/pages/GPUComputationRenderer.html)),
que administra la creación de los render targets, el formato de textura float RGBA, y las
dependencias entre variables (una textura de "posición" puede leer la de "velocidad" del mismo
paso). Ejemplos recientes de referencia:
[Codrops — GPGPU dreamy particle effect](https://tympanus.net/codrops/2024/12/19/crafting-a-dreamy-particle-effect-with-three-js-and-gpgpu/)
y el foro oficial ([discourse.threejs.org/t/90558](https://discourse.threejs.org/t/gpgpu-particles/90558)).

**¿Lo necesita este proyecto?** No para el arco en sí — un arco convincente se resuelve con el
shader de tubo/SDF de la sección 3, sin ninguna partícula individual. GPGPU se justificaría **solo**
si se quisiera añadir un efecto secundario de chispas/dispersión de metal fundido en el punto de
extinción del arco con varios miles de partículas individuales y físicamente dispersas (gravedad,
colisión con el suelo) — un "nice to have" visual, no un requisito pedagógico de IDEA.md. Dado el
principio de "simplicidad sobre sofisticación innecesaria" del proyecto, la recomendación es **no
implementar GPGPU en la v1**: si se añade un efecto de chispas, empezar con un sistema CPU de unos
cientos de partículas (`THREE.Points`, buffer reescrito por frame) — muy por debajo del límite donde
GPGPU se vuelve necesario, y con una fracción del código y la complejidad de depuración.

---

## 5. Overlays 2D de datos científicos sobre la escena 3D

Hay dos patrones arquitectónicos válidos para superponer un osciloscopio o una curva TCC a la
escena 3D:

**A. Canvas HTML/CSS separado, superpuesto al canvas WebGL** (`position: absolute` con z-index sobre
el `<canvas>` de Three.js). El gráfico 2D se dibuja con la API Canvas2D nativa (`CanvasRenderingContext2D`,
`lineTo`/`stroke`) o con una librería ligera de gráficos, completamente desacoplado del pipeline
WebGL/3D.

**B. Geometría de líneas dentro de la propia escena Three.js**, renderizada con una cámara
ortográfica secundaria en modo HUD (`THREE.OrthographicCamera` + `THREE.Line` con posiciones en
espacio de pantalla, o un segundo `renderer.render()` sobre la misma escena con `autoClear = false`).

**Recomendación: (A), y coincide con lo ya decidido en IDEA.md §8** ("UI overlay: HTML/CSS
superpuesto al canvas... en vez de sprites 3D, por accesibilidad y velocidad de desarrollo"). Las
razones técnicas que refuerzan esa decisión:

- **Accesibilidad**: texto y controles en DOM real son navegables por teclado y lectores de
  pantalla; geometría 3D no lo es sin trabajo adicional considerable (raycasting para hover, ARIA
  sintético).
- **Velocidad de desarrollo**: dibujar ejes, grillas, texto de etiquetas y tooltips en Canvas2D (o
  SVG con D3, ver §6) es código directo con una API bien documentada; hacerlo con `THREE.Line` exige
  reconstruir manualmente cada primitiva 2D (texto en 3D requiere geometría de fuente o sprites,
  mucho más trabajo por el mismo resultado visual).
- **Separación de responsabilidades**: mantiene la escena 3D enfocada en la subestación, y los
  paneles de datos como una capa de UI independiente — coherente con la separación
  dominio/render que ya exige IDEA.md §8 para el modelo eléctrico.
- **Costo real de rendimiento es despreciable** para este caso de uso: un osciloscopio o una curva
  TCC son unas pocas decenas a cientos de puntos redibujados por frame en un canvas 2D pequeño
  (típicamente <400×200 px) — trivial comparado con el presupuesto de la escena WebGL principal.

El único caso donde (B) tendría sentido es si el gráfico necesitara integrarse físicamente en el
espacio 3D (p. ej. una pantalla de osciloscopio como objeto dentro de la sala de control, visible
solo desde cierto ángulo) — no es el caso de los paneles de datos de este proyecto, que son HUD
persistente.

---

## 6. Ejes logarítmicos y actualización eficiente de gráficos en tiempo real

### 6.1 Curva TCC log-log

Las curvas TCC de protección (investigación 03, familia SI/VI/EI de IEEE C37.112) se grafican
tradicionalmente en **ambos ejes logarítmicos** (corriente en múltiplos de pickup vs. tiempo de
operación en segundos), porque la relación `t = TDS·[A/((I/Ipickup)^p − 1) + B]` cubre varios
órdenes de magnitud en ambas variables — en escala lineal, la curva sería ilegible (comprimida en
una esquina).

Para esto, **D3.js es la herramienta correcta**: `d3.scaleLog()` construye directamente una escala
logarítmica (`y = m·log(x) + b`), con la restricción de que el dominio debe ser estrictamente
positivo (log(0) no está definido) — relevante porque `I/Ipickup` nunca debe evaluarse en 0 en la
curva. El componente `d3.axisBottom()`/`d3.axisLeft()` combinado con esa escala genera automáticamente
las marcas (ticks) en las décadas correctas (1, 10, 100...) con sub-marcas logarítmicas intermedias,
que es exactamente el aspecto estándar de una hoja de curva TCC en un catálogo de relé.
Documentación oficial: [d3js.org/d3-scale/log](https://d3js.org/d3-scale/log). D3 puede dibujar
sobre SVG (mejor para elementos estáticos con pocas actualizaciones, como los ejes y las curvas de
familia) o sobre un `<canvas>` 2D si se prefiere el mismo lienzo que el osciloscopio — ambos son
compatibles con el patrón de overlay HTML/CSS de la sección 5.

### 6.2 Actualización eficiente del osciloscopio en tiempo real

Si el osciloscopio de corriente/tensión se dibujara con geometría Three.js (`THREE.Line`) en vez de
Canvas2D (alternativa B de la sección 5 — aplicable si se prefiere mantenerlo dentro de la escena
WebGL por rendimiento en un caso de muchos trazos simultáneos), el punto crítico de rendimiento es
**nunca recrear la geometría por frame**. El patrón correcto:

1. Pre-asignar un `BufferAttribute` de posición con la capacidad máxima de puntos del trazo (p. ej.
   500 muestras para una ventana de tiempo deslizante), una sola vez al crear el objeto.
2. Cada frame, escribir los nuevos valores directamente en el array tipado subyacente
   (`positions.array[i] = nuevoValor`) en vez de crear un array nuevo.
3. Marcar `positions.needsUpdate = true` — esto solo re-sube el buffer modificado a la GPU, sin
   recompilar geometría ni reasignar memoria.
4. Si el número de puntos visibles varía (buffer circular donde se descartan muestras viejas), usar
   `geometry.setDrawRange(inicio, cuenta)` para controlar cuánto del buffer pre-asignado se dibuja,
   en vez de cambiar el tamaño del array (redimensionar un buffer es tan costoso como recrearlo por
   completo).

Esto es el mismo patrón "buffer circular" usado en cualquier osciloscopio digital real: un array de
tamaño fijo donde el puntero de escritura avanza y da la vuelta, sin nunca reasignar memoria durante
la operación en vivo. Documentación de soporte:
[BufferAttribute.needsUpdate](https://threejs.org/docs/#api/en/core/BufferAttribute.needsUpdate) y
discusión de rendimiento en el foro oficial
([discourse.threejs.org/t/36415](https://discourse.threejs.org/t/updating-buffer-attribute-performance-is-incredibly-slow/36415)).
Para el caso de este proyecto (Canvas2D, no Three.js, por la recomendación de la sección 5), el
equivalente directo es mantener el mismo array circular en JS y redibujar solo el trazo (`clearRect`
+ `stroke` del subconjunto visible) — la misma lógica de buffer circular, sin la capa WebGL.

---

## 7. Puntos clave para el simulador de subestación

Recomendación priorizada, técnica por técnica, para cada uno de los 4 casos del proyecto —
priorizando siempre la opción más simple que cumple el requisito pedagógico, no la más sofisticada:

| Caso | Técnica recomendada | Por qué (trade-off) |
|---|---|---|
| **Heatmap malla de tierra** (§1) | **CPU + `DataTexture`** (opción a), recalculada solo cuando cambian parámetros (slider soltado, no cada frame) | El campo no necesita animarse continuamente en la v1 (cambia con `ρ`, capa de grava, posición del avatar) — recalcular una grilla 128-256² en JS toma pocos ms, reutiliza la misma función que ya calcula `E_step`/`E_touch`, y es enormemente más simple de depurar que un shader con arrays de uniforms. Migrar a shader GPU (opción b) solo si en el futuro se anima el GPR durante el transitorio de falla en tiempo real. |
| **Arco de plasma** (§3) | **Shader SDF (tubo/cápsula) + ruido procedural + blending aditivo**, intensidad modulada por `corrienteInstantanea` del modelo de dominio | Es la técnica estándar de la industria del shader art para este efecto exacto (arco/rayo/plasma), visualmente convincente sin física real, y el gancho pedagógico clave (apagarse en el cruce por cero) se logra con un solo uniform `float` — no requiere ni partículas ni GPGPU. |
| **Osciloscopio 2D** (§5, §6) | **Canvas2D HTML/CSS superpuesto** (ya decidido en IDEA.md §8), con buffer circular de muestras reescrito in-place cada frame | Coincide con la arquitectura ya elegida del proyecto; accesibilidad y velocidad de desarrollo ganan sobre cualquier ventaja de rendimiento de mantenerlo en WebGL, que aquí es despreciable (pocas líneas, pocos cientos de puntos). |
| **Curva TCC log-log** (§6) | **D3.js sobre SVG/Canvas**, `d3.scaleLog()` para ambos ejes, dentro del mismo overlay HTML | D3 resuelve gratis el problema no trivial de generar ticks/sub-ticks logarítmicos correctos y coincide con el mismo patrón arquitectónico de overlay que el osciloscopio — un único enfoque de "gráficos 2D" para todo el proyecto, en vez de mezclar Three.js y Canvas2D para cosas equivalentes. |

**Descartado explícitamente para la v1** (por complejidad injustificada frente al valor pedagógico):
GPGPU/`GPUComputationRenderer` para partículas (§4) — reservar solo si se decide añadir un efecto
secundario de chispas con varios miles de partículas; y renderizado de campos escalares directamente
en shader (§1.b) — reservar solo si el heatmap necesita recalcularse cada frame a alta resolución
por interacción continua (arrastre en vivo), lo cual no es un requisito confirmado en IDEA.md §7.

El hilo común de estas cinco decisiones: el proyecto es un simulador **educativo**, no un motor de
producción — la técnica ganadora es casi siempre la que reduce superficie de depuración y reutiliza
al máximo el modelo de dominio ya calculado en JS (IDEA.md §8), reservando GPU/shaders para los
casos donde aportan un efecto visual que JS simplemente no puede lograr a la frecuencia necesaria
(el arco de plasma) o donde el volumen de cómputo por frame lo exige (ninguno de los 4 casos actuales
lo exige de forma confirmada).

---

## Fuentes

- [Three.js docs — ShaderMaterial](https://threejs.org/docs/pages/ShaderMaterial.html) y
  [ShaderMaterial.uniforms](https://threejs.org/docs/#api/materials/ShaderMaterial.uniforms)
- [Three.js docs — DataTexture](https://threejs.org/docs/#api/en/textures/DataTexture)
- [Three.js docs — GPUComputationRenderer](https://threejs.org/docs/pages/GPUComputationRenderer.html)
- [Three.js docs — BufferAttribute.needsUpdate](https://threejs.org/docs/#api/en/core/BufferAttribute.needsUpdate)
- [Three.js forum — How to pass large amounts of data to a fragment shader](https://discourse.threejs.org/t/how-to-pass-large-amounts-of-data-to-a-fragment-shader/25944)
- [Three.js forum — GPGPU Particles showcase](https://discourse.threejs.org/t/gpgpu-particles/90558)
- [Three.js forum — Updating buffer attribute performance](https://discourse.threejs.org/t/updating-buffer-attribute-performance-is-incredibly-slow/36415)
- [Codrops — Crafting a Dreamy Particle Effect with Three.js and GPGPU (2024)](https://tympanus.net/codrops/2024/12/19/crafting-a-dreamy-particle-effect-with-three-js-and-gpgpu/)
- [The Book of Shaders — 11. Noise](https://thebookofshaders.com/11/)
- [The Book of Shaders — 12. More Noise](https://thebookofshaders.com/12/)
- [The Book of Shaders — 13. Fractal Brownian Motion](https://thebookofshaders.com/13/)
- [Stefan Gustavson / Ian McEwan — WebGL Noise (Simplex/Perlin GLSL reference implementations)](https://stegu.github.io/webgl-noise/webdemo/)
- [Iñigo Quilez — Signed Distance Functions](https://iquilezles.org/articles/distfunctions/)
- [Julia Evans — Getting started with shaders: signed distance functions](https://jvns.ca/blog/2020/03/15/writing-shaders-with-signed-distance-functions/)
- [Matplotlib docs — Choosing Colormaps in Matplotlib](https://matplotlib.org/stable/users/explain/colors/colormaps.html)
- [How Matplotlib Moved from Jet to Viridis](https://visualizing.jp/en/matplotlib-colorscheme/)
- [D3.js docs — Logarithmic scales (d3-scale/log)](https://d3js.org/d3-scale/log)

---

*Ver [IDEA.md §8](../IDEA.md#8-arquitectura-técnica-propuesta) para la decisión arquitectónica ya
tomada de overlay HTML/CSS, y [IDEA.md §7](../IDEA.md#7-diseño-pedagógico--de-la-teoría-a-la-interacción-3d)
para el mapeo teoría→interacción que motiva cada uno de los 4 casos cubiertos aquí.*
