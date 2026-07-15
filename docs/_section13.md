## 13. Lógica de matchmaking y precios (exploración)

> Nota: esta sección reemplaza las "Notas de producto — Ranking de ofertas" anteriores. Es una **exploración de opciones** (no una decisión cerrada) sobre el núcleo del negocio: cómo emparejar carga con camión y cómo se forma el precio. Todo lo demás del documento queda igual.

### 13.1 Alcance de TROPEX: facilitamos la comunicación, no arbitramos

Principio de producto, conviene dejarlo explícito para el equipo de desarrollo:

- TROPEX **conecta** ganaderos y transportistas, **ordena las ofertas** y, cuando hay un retraso o un cambio, **facilita la comunicación** entre las partes (habilita WhatsApp/llamada, notifica).
- **No** operamos la logística, **no** mediamos ni resolvemos el conflicto, y **no** nos hacemos cargo de "el arreglo". Si un camión se atrasa o se rompe, damos las herramientas para que las partes se coordinen dentro de la app; la solución la acuerdan ellos.
- Este alcance acotado es deliberado y **es lo que hace viable la comisión**: al no cargar con la operación ni con el riesgo de la disputa, nuestra estructura de costos es liviana y podemos cobrar poco y aun así sostenernos.

> Esto ya se refleja en el producto: el contacto directo recién se habilita cuando el viaje está activo (sección 10.2), y la cancelación se "revisa" pero no se arbitra en tiempo real (sección 10).

### 13.2 Por qué el matchmaking es el core (el motor económico)

El matchmaking no es una feature más: **es el producto**. La razón es la estructura de costos del transportista.

- De lo que cobra un transportista independiente, **~87% se va en costos operativos**, y el **combustible es ~40% de ese opex** (≈ **35% del ingreso**; según cómo se mida, el rango razonable es **35–40% del ingreso** solo en combustible).
- El combustible es proporcional a los **kilómetros recorridos** — incluidos los **kilómetros vacíos** (deadhead) que el camión hace para llegar al origen o para volver sin carga.
- Por lo tanto, **la palanca de valor más grande es la distancia**: emparejar una carga con un camión que **ya está en la zona** o que tiene un **flete de retorno** conveniente reduce los km vacíos y, con eso, el costo dominante.

El valor que se libera al ahorrar distancia se puede repartir en tres:

| Beneficiario | Cómo se beneficia de un buen match |
|---|---|
| Ganadero | Recibe ofertas más bajas: el transportista eficiente puede cobrar menos |
| Transportista | Mejor margen neto, porque gasta menos combustible por el mismo viaje |
| TROPEX | La comisión "cabe" dentro del excedente que crea la eficiencia, sin que nadie pierda |

> Idea central: la comisión **no se le saca a una torta fija**; se paga con la eficiencia que generamos. Si matcheamos bien, hay margen para todos. Si mandamos al camión más lejano, no hay margen y la comisión se siente como un impuesto.

### 13.3 La unidad de precio: guaraní por kilómetro por cabeza

En este rubro el precio no se "inventa": el transportista lo fija con un número que conoce de memoria, el **₲ por km por cabeza**, porque está atado al combustible. La app debe **hablar ese idioma**:

- La calculadora de oferta ya trabaja en ₲/km/cabeza (modo "manual") además del precio total (ver sección 6.4).
- El precio de referencia de demo usa `410 ₲/km/cabeza × 400 km` (`estimateReferencePrice`), un ancla razonable mientras no haya datos propios.
- Anclar todo en ₲/km/cabeza hace que las ofertas sean **comparables** y que la negociación sea sobre un único número, no sobre un monto opaco.

### 13.4 Peso primero: la restricción que manda

Antes de pensar en el precio, el match tiene que ser **físicamente posible**, y lo que manda es el **peso**, no la cantidad de cabezas:

- El camión se **pesa cargado** en cada control SENACSA; cada unidad tiene un **peso máximo de carga (payload)** fijo.
- Con ganado **gordo** (≈ 420 kg+ por cabeza), el camión llega al **tope de peso antes que al tope de cabezas**. Con desmamantes (livianos), manda más la cantidad.
- Por eso el matchmaking debe, **como primer filtro**, descartar los camiones que no pueden con el **peso total** de esa carga (peso estimado × cabezas), y recién después ordenar por precio/eficiencia. Hoy la app ya valida capacidad por cabezas y tipo (sección 6.5); el siguiente paso es validar también por **peso**.

> Por eso el peso aproximado por animal es un campo obligatorio al crear la solicitud (sección 3.6): sin peso no se puede decidir qué camión entra.

### 13.5 Cuánta comisión nos deja la distancia (modelo)

Ejercicio simple para dimensionar el margen que crea un buen match (números ilustrativos):

- Viaje con carga: **485 km**. Combustible ≈ **37% del ingreso**.
- **Transportista A** (lejos): hace **180 km vacíos** para llegar al origen → recorre 665 km totales.
- **Transportista B** (con flete de retorno, ya en zona): hace **20 km vacíos** → recorre 505 km totales.
- B recorre **~24% menos kilómetros** que A. Como el combustible escala con los km, B gasta en combustible **~24% menos** sobre la fracción de combustible.

| Concepto | Transportista A (lejos) | Transportista B (en zona) |
|---|---|---|
| Km totales (vacío + carga) | 665 | 505 |
| Combustible relativo (índice) | 1.00 | ~0.76 |
| Ahorro de combustible vs A | — | ~24% de la fracción de combustible |
| Margen para bajar precio + dejar comisión | bajo | alto |

El ahorro de elegir a B (sobre el ~37% del ingreso que es combustible) **alcanza cómodamente para cubrir una comisión del 3–5% y aun así dejarle al ganadero un precio más bajo y a B un mejor margen** que el que tendría A. Conclusión operativa: **priorizar la eficiencia de ruta es lo que financia nuestra comisión**.

### 13.6 Opciones de lógica de matchmaking

Distintas formas de ordenar/emparejar, de la más simple a la más completa. No son excluyentes: se pueden combinar y activar por fases.

**Opción A — Ranking por precio simple (ancla ₲/km/cabeza).** Ordenar las ofertas por precio total para el ganadero, usando el ₲/km/cabeza que cada uno cotiza. Transparente y fiel al comportamiento del rubro. *Contra:* ignora eficiencia y reputación; premia a quien tira el número más bajo aunque después no cumpla.

**Opción B — Eficiencia de ruta / flete de retorno primero (backhaul).** Priorizar a quien minimiza los km vacíos hasta el origen (ya está en la zona o tiene retorno). Es de donde sale el margen de comisión. Puede ser **proactivo**: sugerirle al ganadero el camión mejor ubicado, o avisarle al transportista bien ubicado que hay una carga conveniente. *Contra:* necesita conocer la posición/agenda de los camiones (tracking), que recién estamos empezando a recolectar.

**Opción C — Ajuste por peso y llenado del camión.** Emparejar para **maximizar el llenado** (cabezas × peso cerca del tope sin pasarlo): así el ₲/km se reparte sobre más carga y baja el ₲/km/cabeza. Evita despropósitos como mandar un semirremolque por 10 cabezas. *Contra:* puede chocar con la división en guías (45/80) y con que a veces el ganadero necesita un solo camión.

**Opción D — Score compuesto (recalibrado).** El modelo de varios factores, con el **peso/capacidad como compuerta dura** (si no entra, no rankea) y la **distancia como factor dominante**:

| Factor | Peso sugerido | Notas |
|---|---|---|
| Factibilidad de peso/capacidad | Compuerta (sí/no) | Si el camión no puede con el peso total, queda fuera |
| Eficiencia de ruta (km vacíos) | 40% | `1 − (km_total / km_referencia)` — el factor que crea margen |
| Precio relativo al ancla ₲/km/cabeza | 30% | Comparado con la estimación interna, **no** con una referencia de mercado que todavía no tenemos |
| Reputación | 20% | `rating × log(viajes_completados + 1)` — pondera experiencia |
| Velocidad de respuesta | 10% | Quien responde rápido cierra más |

*Degradación elegante:* mientras falten datos (ver 13.7), se simplifica a **compuerta de peso + precio (50%) + reputación (50%)**, y se activa el modelo completo cuando haya histórico.

**Opción E — Estrategia de comisión (fija vs. dinámica).** Cómo cobramos sobre ese margen:

- **Fija y transparente (recomendada para el MVP):** un % claro (hoy 3% estándar / 5% inmediato; el admin tiene 8% por defecto, a reconciliar). El rubro desconfía de lo opaco; un número fijo genera confianza.
- **Basada en valor / dinámica (backlog):** capturar una parte del ahorro que genera el match (si el match le ahorró X al ganadero vs. un baseline, cobramos una fracción de X). Más rentable pero más difícil de explicar y auditar; dejar para cuando haya datos y confianza.

### 13.7 Precio referencial: por qué todavía no se muestra

- Para mostrar un **precio de mercado** creíble necesitamos **suficientes viajes cerrados por ruta** (apuntamos a **n ≥ 30** por bucket). **Hoy no los tenemos**, así que mostrar una "referencia de mercado" sería inventar un número y perder credibilidad con un público que conoce los precios mejor que nosotros.
- **Fase 1 (ahora):** mostrar solo la **estimación en ₲/km/cabeza** (fórmula transparente), etiquetada como *estimación*, nunca como "precio de mercado". El precio real lo fijan las ofertas.
- **Fase 2 (recolección):** guardar el ₲/km/cabeza de **cada viaje cerrado**, por granularidad de ruta progresiva: **departamento → departamento**, luego **zona → zona**, y finalmente **estancia → punto de destino**, usando el nivel más fino que tenga n ≥ 30.
- **Fase 3 (activación):** cuando un bucket llega a n ≥ 30, se enciende la referencia mostrada y el score compuesto completo (Opción D) para esa ruta. Hasta entonces, esa ruta usa el modelo simplificado.

### 13.8 Por qué 3 rondas de negociación alcanzan

El cap de **3 rondas** (`MAX_NEGOTIATION_ROUNDS`) no es arbitrario: responde a cómo se negocia de verdad en este rubro.

- La negociación acá es **poca y poco profunda**. Los ganaderos **saben que el transportista fija el precio**, porque depende del combustible, y el número que se discute es uno solo: el **₲ por km por cabeza**.
- Entonces "negociar" es, en la práctica, **confirmar o ajustar levemente** ese número, no un regateo de muchas vueltas. Tres rondas (oferta → contraoferta → cierre) **sobran** para converger.
- Más rondas solo **agregarían fricción** sin mover el número anclado en el combustible, y harían que el ganadero pierda tiempo. Cerrar en pocas rondas también **señala seriedad** de ambas partes.
- Implicancia para el matchmaking: conviene **acertar el precio de entrada** (buen ancla en ₲/km/cabeza + un match eficiente) para que la mayoría de los viajes cierren en **0–1 contraofertas**. El trabajo pesado lo hace el match, no la negociación.

### 13.9 Alineación de incentivos y privacidad del ranking

- Nuestro incentivo está **alineado con el del ganadero**: como la comisión se gana en **guaraníes por viaje cerrado**, nos conviene **cerrar más viajes**, no precios más altos. Un mejor match cierra más, aunque cada precio sea más bajo → más comisión total y más volumen.
- El **score nunca se le muestra al ganadero**; solo ve las **ofertas ordenadas**. Si pregunta por el orden, la respuesta es simple: *"ordenamos por la mejor combinación de precio y confiabilidad."*

### 13.10 Recomendación para el MVP

1. **Compuerta de peso primero** (Opción C/D): descartar camiones que no pueden con el peso total.
2. **Ordenar por una mezcla simple** de precio (ancla ₲/km/cabeza) y reputación (Opción D simplificada), con un empujón a la **eficiencia de ruta** (Opción B) en cuanto el tracking lo permita.
3. **Comisión fija y transparente** (Opción E, variante fija); reconciliar 3%/5% con el 8% del admin.
4. **No mostrar** precio de mercado todavía: solo la estimación en ₲/km/cabeza, recolectando datos para las fases 2 y 3.
5. **Mantener 3 rondas** y enfocar el producto en acertar el precio de entrada para cerrar rápido.

---

*Fin del documento. Componentes y constantes citados corresponden al estado del repositorio Tropero-V3 a junio de 2026.*
