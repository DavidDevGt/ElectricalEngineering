# Transformadores de Instrumento: TC/CT y TP/VT/CVT — Medición y Protección en Alta Tensión

> Investigación técnica de soporte para el simulador 3D de subestaciones (ver `IDEA.md`, sección
> 3.4). Objetivo: dar el rigor cuantitativo necesario para que el modelo de dominio eléctrico del
> simulador (relaciones, clases de precisión, comportamiento ante fallas) sea correcto y no solo
> ilustrativo.

## 1. Transformador de Corriente (TC/CT): principio y clases

### 1.1 Principio — "transformador de corriente impuesta"

Un transformador de potencia convencional es esencialmente una **fuente de tensión** en el
secundario: el primario se conecta en **paralelo** a la red y su corriente depende de la carga
que el usuario conecte. Un TC es conceptualmente el dual: su devanado primario (típicamente 1
espira, a veces la propia barra o cable pasando por la ventana del núcleo) se conecta **en serie**
con el circuito de potencia. La corriente primaria `I1` está fijada por la carga del sistema, no
por el TC — el TC no tiene forma de "elegir" cuánta corriente circula por su primario.

Por la ley de Ampère, la fuerza magnetomotriz (fmm) primaria `N1·I1` debe ser compensada casi en
su totalidad por la fmm secundaria `N2·I2` para que el flujo neto en el núcleo se mantenga bajo
(típicamente unos pocos mWb, suficiente solo para vencer las pérdidas y la corriente de
magnetización). En estado normal:

```
N1·I1 ≈ N2·I2 + N1·Ie   (Ie = corriente de excitación, referida al primario)
```

Como `Ie` es pequeña frente a `I1` (por diseño, con núcleos de alta permeabilidad), el TC entrega
una corriente secundaria proporcional a la primaria con un error pequeño. Relaciones estándar
normalizadas: secundarios de **5 A** (IEEE/Norteamérica) o **1 A** (más común en IEC/Europa y
Latinoamérica para distancias largas de cableado, porque reduce pérdidas I²R en el cableado de
control). Ejemplo típico: **1000:5 A** (relación 200:1) o **1000:1 A** (relación 1000:1).

### 1.2 Circuito equivalente

El modelo estándar (IEEE C57.13 / IEC 61869-2) representa el TC como un transformador ideal de
relación `1:n` con una rama de magnetización en paralelo (referida al secundario), caracterizada
por la impedancia de excitación `Ze` (no lineal, satura), en serie con la impedancia de fuga
secundaria `Z2` y luego el burden `Zb`:

```
I1/n = Ie + I2        (nodo de corriente en el secundario referido)
```

`I2` es la corriente que efectivamente circula por el burden; `Ie` es la corriente que se "pierde"
magnetizando el núcleo — esta es la fuente física de todo error del TC.

### 1.3 Burden

El **burden** es la impedancia total conectada al secundario del TC: instrumentos, relés, y muy
importante, la **resistencia del cableado** entre el TC y el panel de control (que en subestaciones
grandes puede ser el término dominante si el TC está lejos de la caseta de relés). El burden se
especifica en VA a corriente nominal, o en ohmios, o mediante la clase C de IEEE (ver 1.4). Un
burden más alto (mayor impedancia) exige más tensión en el secundario para forzar la misma
corriente a través de él (`V2 = I2 · Zb`), lo que consume más fmm de excitación y **degrada la
precisión** — por eso cada TC tiene un burden máximo garantizado para mantener su clase de
precisión. Sobrecargar el burden (ej. añadir demasiados instrumentos en serie en el mismo lazo)
es un error de diseño común que arruina la precisión de medición sin que el TC "se dañe"
visiblemente.

### 1.4 Clases de precisión

**IEC 61869-2 — TC de medición**: clases 0.1, 0.2 (0.2S), 0.5 (0.5S), 1, 3 — el número es el
error de relación máximo (%) al 100% de la corriente nominal y burden nominal. El sufijo "S"
indica precisión garantizada también a bajas corrientes (5%–20% de In), relevante para medición
de facturación con cargas livianas.

**IEC 61869-2 — TC de protección**: notación `xPy`, ej. **5P20**, **10P20**:
- El primer número es el **error compuesto máximo** (%) en el punto de precisión límite.
- La letra "P" indica protección.
- El segundo número es el **ALF** (Accuracy Limit Factor): el múltiplo de la corriente nominal
  hasta el cual el TC debe mantener ese error compuesto sin saturarse significativamente. ALF
  estándar: 5, 10, 15, 20, 30.
- Ejemplo: un TC 5P20 con relación 1000:5 A debe mantener error compuesto ≤5% incluso con
  corriente primaria de **20 000 A** (20× nominal) — condición representativa de una falla franca
  cercana al TC.

**IEEE C57.13 — clase C (relaying accuracy)**: notación `Cxxx` (ej. C100, C200, C400, C800), donde
el número es la tensión secundaria (V) que el TC puede entregar a **20× la corriente nominal
secundaria (100 A)** sin exceder 10% de error de relación, asumiendo un burden estándar con factor
de potencia 0.5. C100 ⇒ burden estándar 1 Ω (100 V / 100 A); C200 ⇒ 2 Ω; C400 ⇒ 4 Ω; C800 ⇒ 8 Ω.
La "C" indica que la tensión de saturación puede calcularse ("Calculated"), a diferencia de la
antigua clase "T" (determinada por ensayo, con núcleos con entrehierro/flujo residual
significativo). Para medición (metering), IEEE usa clases 0.3, 0.6, 1.2 (% de error máximo a
corriente nominal) con burdens estándar designados B-0.1, B-0.2, B-0.5, B-0.9, B-1.8 (ohmios; VA
equivalente = burden × 25 para secundario de 5 A).

## 2. El peligro del secundario abierto con primario energizado

Este es el fenómeno de seguridad más importante asociado a un TC, y debe reflejarse en el
simulador como una lección explícita.

**Mecanismo, con el circuito equivalente**: en operación normal, `I2` fluye por un burden de baja
impedancia (típicamente <1 Ω a pocos ohmios), y la fmm secundaria `N2·I2` casi cancela la fmm
primaria `N1·I1`, dejando poco flujo neto. Si el secundario se abre (`Zb → ∞`), entonces `I2 = 0`
por definición del circuito abierto, y **toda** la corriente primaria referida (`I1/n`) se
convierte forzosamente en corriente de excitación: `Ie = I1/n`. Como `I1` puede ser cientos o
miles de amperios primarios, la fmm de excitación deja de ser un pequeño porcentaje y pasa a ser
el 100% de la fmm primaria — muchos órdenes de magnitud por encima de lo que el núcleo puede
manejar en su región lineal.

El núcleo se **satura duramente** en cada semiciclo. La curva B-H, en vez de recorrer su tramo
lineal, es forzada hacia la saturación casi instantáneamente y permanece saturada durante casi
todo el semiciclo (el flujo `Φ` se "aplana" en un valor casi constante cerca de `Bsat`). La tensión
inducida en el secundario es `e2 = N2 · dΦ/dt`: mientras el núcleo está saturado, `dΦ/dt ≈ 0` y la
tensión es casi nula; pero en el breve instante de cada cruce por cero de la corriente primaria, el
flujo debe invertirse de `+Bsat` a `−Bsat` **muy rápidamente**, generando un `dΦ/dt` enorme y, por
tanto, **picos de tensión muy altos y muy estrechos** (forma de onda de pulsos agudos, no
sinusoidal) en los terminales del secundario abierto.

**Magnitudes típicas**: dependiendo del tamaño del TC, la relación de transformación y el nivel de
falta, estos picos de cresta pueden alcanzar desde algunos cientos de voltios hasta **varios
kilovoltios** (se citan en la literatura de campo picos de 2–5 kV, y en TCs de relación alta con
corriente primaria elevada, hasta decenas de kV). Un voltímetro RMS convencional puede subestimar
gravemente el peligro, porque la energía del pulso está concentrada en un instante muy corto del
ciclo — hay que medir tensión de **cresta**, no RMS.

**Consecuencias**:
1. **Riesgo eléctrico letal para personas**: cualquiera que toque los terminales del secundario
   abierto (práctica común erróneamente creída "segura" porque es "solo el circuito de medición")
   puede recibir una descarga de alta tensión.
2. **Riesgo de arco/flashover** en los propios terminales o en la caja de pruebas (test block),
   pudiendo iniciar un incendio en el gabinete de control.
3. **Sobrecalentamiento y envejecimiento acelerado del aislamiento** del TC por las pérdidas de
   histéresis y corrientes de Foucault muy elevadas durante la saturación repetida — daño
   térmico acumulativo incluso si no hay descarga inmediata.
4. **Error de flujo residual**: tras un evento así, el núcleo puede quedar con magnetismo
   remanente significativo, degradando la precisión del TC en operación posterior (relevante
   para protección diferencial, ver sección 6).

**Regla operativa universal**: antes de desconectar cualquier instrumento del secundario de un TC
con el primario energizado, el secundario **debe cortocircuitarse primero** (mediante un bloque de
pruebas cortocircuitable, "test block"/"shorting terminal block"), y solo después desconectar el
instrumento. Esta es una de las reglas de seguridad más enseñadas — y más frecuentemente
olvidadas por error humano — en mantenimiento de subestaciones.

## 3. TC de medición vs. TC de protección — filosofías opuestas de diseño

Aunque ambos son "transformadores de corriente", su función exige comportamientos casi
contradictorios frente a corrientes de falla:

**TC de medición (metering)**: su función es dar lecturas precisas en el **rango de operación
normal** (típicamente 5%–120% de la corriente nominal, donde vive la facturación y la
supervisión). Ante una falla (corrientes de 10–20× nominal), es **deseable que el núcleo se sature
rápidamente**, limitando la corriente y tensión secundarias entregadas a los instrumentos de
medición (vatímetros, medidores de energía) — estos equipos son de bajo costo y baja capacidad de
sobrecarga, y saturarse los protege de daño. Esta característica se cuantifica con el **Factor de
Seguridad de Instrumento (FS, Instrument Security Factor)**: FS = corriente primaria a la que la
corriente de error alcanza el 10%, dividida entre la corriente nominal. Un buen TC de medición
tiene FS bajo (ej. FS5 o FS10): se satura pronto.

**TC de protección (relaying)**: su función es que el relé **vea correctamente la magnitud de la
corriente de falla**, que puede ser 10, 20 o más veces la corriente nominal, durante el tiempo
que tarda la protección en actuar (típicamente unos pocos ciclos). Si el núcleo se saturara en ese
rango, el relé subestimaría la corriente de falla y podría fallar en operar, o retardar
peligrosamente el disparo, o (en protecciones diferenciales) generar una lectura distorsionada
que produce disparos intempestivos o pérdida de selectividad. Por eso las clases de protección
(5P20, 10P20, C100…C800) se especifican explícitamente para que el TC **mantenga precisión hasta
un múltiplo alto de la corriente nominal** (el ALF, hasta 20× o 30× In).

Esta dualidad es la razón por la que en una subestación real, para un mismo punto de medición de
corriente, se instalan **TCs con múltiples núcleos** dentro de la misma envolvente física
(devanados secundarios independientes sobre núcleos separados, todos enlazando el mismo primario):
uno o dos núcleos clase 0.2/0.5 para medición/facturación, y uno o más núcleos clase 5P20/10P20 (o
PX/PS según IEC para protección diferencial de alta exigencia) para cada función de protección.

## 4. Transformador de Potencial inductivo (TP/VT)

### 4.1 Principio

El TP/VT es, conceptualmente, un transformador de potencia convencional en miniatura: primario
conectado **en paralelo** (entre fase y tierra, o entre fases) a la línea de AT, con muchas
espiras, y secundario de baja tensión (estándar: **110 V, 115 V o 120 V** fase-fase, o
`110/√3 ≈ 63.5 V` fase-neutro) para alimentar instrumentos, medidores y relés. A diferencia del
transformador de potencia, maneja **potencias muy pequeñas** (decenas de VA, rara vez más de unos
pocos cientos de VA), lo que permite optimizar el diseño exclusivamente para precisión: núcleos de
alta permeabilidad, bajo flujo de trabajo, bobinados cuidadosamente compensados — no para
transferir energía eficientemente.

### 4.2 Por qué un cortocircuito accidental no es catastrófico (pero tampoco es inocuo)

Al ser esencialmente una **fuente de tensión** vista desde el secundario, un cortocircuito
accidental en el secundario del TP se comporta como el cortocircuito de un transformador de
potencia pequeño: la impedancia de cortocircuito interna del propio TP (relativamente alta en
términos relativos, análoga al %Z de un transformador de potencia) **limita la corriente de falla**
a un valor finito y predecible, sin generar sobretensiones peligrosas — es el fenómeno dual del TC
(que es fuente de corriente y genera sobretensión al abrirse). Por diseño, el circuito primario del
TP se protege con **fusibles de alta tensión** (o, en algunos diseños modernos, dispositivos
limitadores) dimensionados para despejar esa falla antes de que el devanado sufra daño térmico
serio. Es decir: el riesgo de un cortocircuito en el secundario del TP es fundamentalmente
**térmico y de protección del propio equipo** (calentamiento, posible quema de fusibles, pérdida
de la señal de medición/protección alimentada por ese TP), **no** un riesgo de sobretensión letal
para el personal como en el caso del TC.

Esto **no** significa que cortocircuitar el TP sea una práctica aceptable: en operación normal de
medición, un cortocircuito en el secundario **colapsa la tensión** que ven los instrumentos y
relés conectados — un relé de protección que depende de esa señal de tensión (ej. relé de
distancia, o funciones de sincronismo/subtensión) puede **mal-operar o dejar de operar
correctamente**, con consecuencias en la protección del sistema aunque no haya daño físico
inmediato al TP. Por eso, igual que el TC, el circuito secundario del TP se protege con fusibles o
interruptores termomagnéticos miniatura (MCB) dedicados, y se supervisa con esquemas de
**supervisión de circuito de VT** (fuse-failure / VT supervision) que bloquean funciones de
protección basadas en tensión cuando detectan pérdida de señal, precisamente para evitar disparos
intempestivos causados por un fusible fundido o un cortocircuito accidental del lazo de medición.

## 5. Transformador de Potencial Capacitivo (CVT/CCVT)

### 5.1 Por qué reemplaza al TP inductivo en tensiones altas

Un TP inductivo para tensiones muy altas (ej. 245 kV, 500 kV) requeriría un devanado primario con
aislamiento capaz de soportar toda la tensión de línea a tierra, con miles de espiras de alambre
fino sobre un núcleo grande — el costo del aislamiento y del cobre crece de forma pronunciada con
la tensión. A partir de aproximadamente **145 kV** (el umbral exacto varía por fabricante/norma;
IEC 61869-5 cubre CVTs y es habitual verlos dominar por encima de ese nivel), resulta más
económico usar un **divisor capacitivo de alta tensión**: dos (o más) condensadores en serie
conectados entre la fase de AT y tierra, donde el punto intermedio entrega una tensión reducida
(del orden de algunos kV) que luego se transforma a nivel de instrumento (110 V) mediante un
transformador inductivo convencional, pero de tensión mucho más baja y por tanto mucho más barato.

Como el divisor capacitivo por sí solo tiene una impedancia de salida alta y dependiente de la
carga (variaría la tensión de salida al conectar burden), se añade un **reactor de compensación**
en serie, sintonizado junto con la capacitancia del divisor para resonar a la frecuencia del
sistema (50/60 Hz) y cancelar la caída de tensión que introduciría la capacitancia bajo carga —
esto es lo que permite que el CVT alcance clases de precisión de medición (0.2, 0.5) comparables a
un TP inductivo.

### 5.2 Ventaja de costo

El ahorro proviene de reemplazar el aislamiento masivo de un devanado de AT por condensadores de
alta tensión (tecnología de fabricación más barata y compacta a estos niveles), y de que el
transformador inductivo final trabaja a tensión intermedia, no a la tensión de línea completa. La
diferencia de costo se vuelve significativa por encima de 145–170 kV y crece con el nivel de
tensión.

### 5.3 Desventaja: respuesta transitoria y ferroresonancia

El precio de esta arquitectura es la **respuesta dinámica**. La combinación de la capacitancia del
divisor, la inductancia del reactor de compensación y la inductancia magnetizante del transformador
final forma un circuito resonante de segundo/tercer orden. Ante transitorios rápidos (ej.
desconexión de una falla cercana, maniobra de interruptor), el CVT puede producir:
- **Transitorios de tensión secundaria** que no siguen fielmente el colapso real de la tensión
  primaria (sobre-oscilación o "subsidencia" transitoria) — crítico para relés de protección de
  alta velocidad (ej. protección de distancia) que pueden interpretar mal la señal en los primeros
  milisegundos tras una falla.
- **Ferroresonancia**: el acoplamiento no lineal entre la capacitancia del divisor y la
  inductancia saturable del núcleo del transformador puede excitar un modo de oscilación
  sostenida a frecuencia distinta de la fundamental (subarmónica, o a la fundamental pero con
  forma de onda distorsionada y amplitud anómala), típicamente disparado por transitorios de
  maniobra o fallas del sistema. Se mitiga con **circuitos de amortiguamiento (ferroresonance
  suppression circuit)**: un reactor saturable en serie con una resistencia de carga, diseñado
  para permanecer de alta impedancia (invisible) en operación normal, pero saturarse y activar
  la resistencia de amortiguamiento cuando aparecen las sobretensiones características de la
  ferroresonancia, disipando la energía del modo resonante espurio.

### 5.4 Uso adicional: acoplador de onda portadora (PLC)

Una ventaja colateral del CVT es que el propio divisor capacitivo de AT puede usarse como punto de
inyección/extracción de señales de **onda portadora por línea de potencia (PLC — Power Line
Carrier)**: señales de alta frecuencia (decenas a cientos de kHz) superpuestas a la línea de
transmisión para telecomunicación entre subestaciones (teleprotección, telemedida, voz de
emergencia). El condensador de acoplamiento del CVT actúa como filtro paso-alto natural hacia el
equipo de PLC, mientras la trampa de onda (line trap, un reactor en la línea) evita que la señal de
alta frecuencia se fugue hacia otras partes de la red. Esta doble función (medición + comunicación)
es exclusiva de la arquitectura capacitiva; un TP inductivo puro no ofrece este punto de acceso.

## 6. Error de relación y error de ángulo de fase

Todo transformador de instrumento real se desvía del ideal por dos magnitudes complementarias:

- **Error de relación (ratio error)**: `ε = (Kn·I2 − I1) / I1 × 100%` (para TC; análogo para TP con
  tensiones), donde `Kn` es la relación nominal placa. Refleja cuánto se desvía la *magnitud*
  efectivamente transformada respecto del valor ideal, causado por la corriente/tensión de
  excitación consumida por el núcleo.
- **Error de ángulo de fase (phase angle error, `δ`)**: el desfase entre el fasor primario y el
  fasor secundario invertido, idealmente 0°. Se expresa en minutos de arco o centirradianes. No
  afecta la magnitud pero sí la fase relativa entre corriente y tensión.

**Por qué importan para facturación (revenue metering)**: la potencia activa medida es
`P = V·I·cos(φ)`. Un error de ángulo de fase en el TC o el TP introduce directamente un error en el
`cos(φ)` efectivo calculado por el medidor, y ese error se **multiplica** con el error de relación.
Para cargas con factor de potencia cercano a 1 el efecto del ángulo es modesto, pero para cargas
con `cos(φ)` bajo (motores grandes, hornos de inducción) un pequeño error de ángulo produce un
error de energía facturada proporcionalmente mucho mayor — de ahí que las clases de medición más
exigentes (0.1S, 0.2S) limiten estrictamente ambos errores de forma conjunta (índice de **error
compuesto** o límites tabulados de `ε` vs `δ` por punto de corriente, IEC 61869-2 tabla de límites
de clase).

**Por qué importan para protección diferencial**: un esquema diferencial (ej. protección de
transformador de potencia, de generador o de barra) compara fasorialmente la corriente que entra y
sale de la zona protegida (`I_dif = I1_secundario + I2_secundario`, idealmente ≈0 en operación
normal). Si los TCs de ambos extremos tienen **errores de ángulo distintos** (o distinto flujo
residual, o distinta curva de saturación por ser de fabricantes/clases diferentes), aparece una
corriente diferencial espuria en operación normal o durante una falla externa, que puede provocar
un **disparo intempestivo** de la protección diferencial. Por esto las normas y las guías de
aplicación exigen que los TCs usados en un mismo esquema diferencial tengan **la misma clase, el
mismo tipo de núcleo (idealmente PX/PS según IEC, gapped core para linealidad) y relaciones lo más
cercanas posible**, y los relés diferenciales modernos incluyen compensación por relación y
"slope" (pendiente de restricción) precisamente para tolerar la dispersión de error inevitable
entre TCs reales.

## 7. Puntos clave para la simulación educativa

1. **Animación del secundario abierto de un TC**: el simulador ya contempla (IDEA.md, tabla de la
   sección 7) un botón "abrir secundario con carga" en el TC. Para que sea rigurosa:
   - Mostrar en el modelo de dominio el **flujo del núcleo pasando de sinusoidal a onda
     "cuadrada/saturada"** cuando se simula la apertura (curva B-H colapsando a los dos rieles de
     saturación).
   - Graficar la **tensión secundaria resultante** como pulsos agudos en los cruces por cero de la
     corriente primaria (no una sinusoide amplificada) — es la forma de onda real y es
     pedagógicamente el punto más contraintuitivo del fenómeno.
   - Disparar la advertencia/animación de arco solo cuando el TC está *energizado* (corriente
     primaria > 0); si el circuito primario está desenergizado, abrir el secundario debe ser
     inofensivo — refuerza que el peligro nace de la corriente impuesta, no del TC en sí.
   - Reforzar la regla operativa: mostrar el "test block" cortocircuitable y como paso obligatorio
     antes de "retirar" un instrumento del lazo secundario en el modo maniobra.

2. **Gráfica clase de medición vs. clase de protección**: un panel con eje X = corriente primaria
   (como múltiplo de In, escala hasta 20–30×) y eje Y = error de relación (%), con dos curvas:
   - TC de medición (ej. clase 0.5): error bajo y estable hasta ~1.2× In, luego **se dispara**
     rápidamente hacia saturación (curva que se desploma) alrededor de 2–5× In — visualmente
     mostrando que "se sacrifica" a propósito para proteger los instrumentos.
   - TC de protección (ej. 5P20): error también bajo en la zona nominal, pero se **mantiene**
     dentro de la banda (±5%) hasta 20× In, con una caída abrupta recién más allá del ALF —
     visualizando por qué el relé "sí ve" la falla mientras el instrumento de medición ya se
     saturó hace rato.
   - Superponer una línea vertical marcando el ALF (o el FS) de cada clase ayuda a anclar
     numéricamente el concepto.

3. **Extensión natural (opcional, v2)**: un modo comparativo para el CVT mostrando la respuesta
   transitoria (tensión secundaria vs. tiempo) tras un escalón/falla simulada en el primario,
   contrastando un TP inductivo (respuesta limpia) contra un CVT con ferroresonancia no amortiguada
   (oscilación espuria) y el mismo CVT con el circuito de amortiguamiento activo — ilustra de forma
   muy visual el trade-off costo/velocidad de respuesta descrito en la sección 5.3.

---

## Fuentes

- [IEEE Std C57.13-2008/2016 — IEEE Standard Requirements for Instrument Transformers (resumen y referencias)](https://cmapspublic2.ihmc.us/rid=1L6G66RZ1-2BZQMV1-1HC5/IEEE)
- [Current Transformer Accuracy Ratings — S. E. Zocholl, Schweitzer Engineering Laboratories](https://selinc.com/api/download/3684)
- [CT Accuracy Standards — Continental Control Systems](https://ctlsys.com/support/ct-accuracy-standards/)
- [Selection of Current Transformers & Wire Sizing in Substations](https://guggenmossales.com/documents/SelectionOfCurrentTransformersWireSizingInSubstations.pdf)
- [IEC 61869-2:2012 — Instrument transformers, Part 2: Additional requirements for current transformers (texto normativo)](https://www.hyee-current-transformer.com/Content/upload/PDF/201815405/IEC61869-2-2012-Part2.pdf)
- [Current Transformer Accuracy Classes: 0.2S vs 0.5S vs 5P vs 10P](https://daulma.com/current-transformer-accuracy-classes-0-2s-vs-0-5s-vs-5p-vs-10p/)
- [What are 5P10 & 5P20 in CTs? — TheElectricalGuy](https://www.theelectricalguy.in/switchgear/what-is-5p10-5p20-in-cts/)
- [Why CT Secondary Must NEVER Be Open (Hazards & Theory) — ElectricalVolt](https://www.electricalvolt.com/why-ct-secondary-shall-never-be-kept-open/)
- [Open Circuit Current Transformer Characteristics — Voltage Disturbance](https://voltage-disturbance.com/power-engineering/open-circuit-current-transformer-characteristics/)
- [CT Secondary Open Circuit: 5 Fatal Risks Every Engineer Must Understand](https://www.instrumentationblog.in/ct-secondary-open-circuit-risks/)
- [Instrument Transformers – Application Guide, CR Magnetics](https://www.crmagnetics.com/technical-references/instrument-transformers-application-guide)
- [Coupling Capacitor Voltage Transformers (CCVTs) — Megger](https://www.megger.com/en-us/et-online/may-2023/coupling-capacitor-voltage-transformers-(ccvts))
- [Capacitive Voltage Transformers (CVT) For HV Measurements — EEP](https://electrical-engineering-portal.com/capacitive-voltage-transformers-cvt-for-hv-measurements)
- [Coupling Capacitor Voltage Transformers as Harmonics/Transients sources — IPST 2005 paper](https://www.ipstconf.org/papers/Proc_IPST2005/05IPST031.pdf)
- [A comprehensive guide to voltage transformer (VT) circuit supervision techniques — EEP](https://electrical-engineering-portal.com/guide-voltage-transformer-circuit-supervision-techniques)
- [Voltage Transformer — overview, ScienceDirect Topics](https://www.sciencedirect.com/topics/computer-science/voltage-transformer)
- [Best Practices for CT and VT Selection — EEP](https://electrical-engineering-portal.com/avoid-choosing-incorrect-current-voltage-transformers)
- [Current Transformer: Construction, Phasor and Errors — ElectricalVolt](https://www.electricalvolt.com/current-transformer-construction-phasor-and-errors/)
- [Selection of CTs for Protection & Metering — Circuit Master Class](https://circuitmasterclass.com/protection-metering-ct-selection/)
