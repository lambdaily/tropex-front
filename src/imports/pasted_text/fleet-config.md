Cambios para hacer en este proyecto:

Esta pantalla corresponde al Paso 2 del registro de empresas de transporte de ganado, sección “Tu Flota”. Rediseñar y ajustar la lógica UX/UI de esta pantalla usando como base exacta la imagen adjunta. Mantener el estilo visual general del proyecto, pero corregir la lógica de selección, cantidades y capacidades para que sea más clara, realista e intuitiva para transportistas.
El problema actual es que los tipos mostrados mezclan conceptos de tipo de camión y configuración de carga, pero para este paso no quiero rehacer toda la arquitectura del flujo. Quiero una solución práctica dentro de esta misma pantalla, manteniendo las 4 tarjetas actuales:
Transganado con Acoplado
Transganado Eje Simple
Transganado Doble Eje
Transganado Semirremolque
Mantener la interacción actual donde al hacer click en una tarjeta:
la tarjeta queda seleccionada
aparece un control con botones + y -
se pueden agregar o quitar unidades de ese tipo
debajo aparece la sección “Capacidad por tipo”
Ajustar la lógica para que cada unidad agregada se guarde por separado, no como una sola capacidad agrupada. Ejemplo obligatorio:
Si selecciono Transganado con Acoplado
cargo 40 gordos en la primera unidad
luego aprieto + para agregar una segunda unidad del mismo tipo
la primera unidad debe conservar guardado su valor de 40 gordos
la segunda unidad debe aparecer como una unidad nueva, vacía o con valores por defecto, para completar aparte
esto es importante porque un usuario puede tener 2 acoplados del mismo tipo pero con dimensiones o capacidades distintas
En la sección “Capacidad por tipo”, no mostrar un solo formulario por tipo. En vez de eso, mostrar una lista de formularios por cada unidad agregada. Ejemplo:
Transganado con Acoplado (Unidad 1)
Transganado con Acoplado (Unidad 2)
Transganado con Acoplado (Unidad 3)
Cada una con sus propios campos editables e independientes.
Cada bloque de unidad debe incluir:
título con el tipo y número de unidad
campo Capacidad Gordos / Adultos
campo Capacidad Desmamantes / Jóvenes
ambos campos deben ser visibles y editables
ambos deben poder modificarse manualmente
Aunque la capacidad de desmamantes se calcule automáticamente en base a la de gordos, quiero que siga siendo un field editable. La lógica deseada es:
cuando el usuario escribe gordos, el sistema sugiere automáticamente un valor de desmamantes
pero el usuario puede tocar ese campo y cambiarlo manualmente
una vez que lo cambia manualmente, no debe volver a sobrescribirse automáticamente salvo que se resetee o se indique lo contrario
mostrar una ayuda visual chica debajo del campo aclarando algo como:
“Valor sugerido automáticamente en base a gordos. Podés editarlo.”
Hacer que la experiencia sea mucho más clara visualmente cuando hay varias unidades del mismo tipo. Quiero que Figma diseñe esto para que se entienda fácilmente:
qué tarjeta está seleccionada
cuántas unidades hay de ese tipo
qué capacidades pertenecen a cada unidad
qué totales se están acumulando
Mantener el contador visual en la tarjeta seleccionada, pero mejorarlo. Quiero:
badge o indicador con cantidad de unidades de ese tipo
el control + / - debajo o dentro de la tarjeta seleccionada
si la cantidad llega a 0, ese tipo deja de estar activo y desaparecen sus formularios de capacidad
Si un usuario selecciona varios tipos distintos, la sección “Capacidad por tipo” debe listar todos los bloques en orden claro. Ejemplo:
Transganado con Acoplado (Unidad 1)
Transganado con Acoplado (Unidad 2)
Transganado Eje Simple (Unidad 1)
Transganado Semirremolque (Unidad 1)
Cada bloque de unidad debe poder colapsarse o expandirse para que la pantalla no se vuelva demasiado larga cuando el usuario tenga muchos vehículos. Sugerencia:
por defecto expandir el último agregado
permitir colapsar los anteriores
mantener resumen breve visible aunque esté colapsado, por ejemplo:
Adultos: 40 | Jóvenes: 70
Rediseñar el resumen inferior para que sume correctamente todas las unidades individuales. Debe mostrar en tiempo real:
Total de unidades
Capacidad total adultos
Capacidad total jóvenes
Este resumen debe actualizarse automáticamente al cambiar cualquier valor.
Mejorar el copy para que sea más natural y profesional para Paraguay y transporte ganadero. Mantener tono claro, simple y serio. Ejemplos de texto:
Título: Tu flota
Subtítulo: Seleccioná los tipos de camión que tenés y configurá la capacidad de cada unidad
Sección: Tipos de camión
Sección: Capacidad por unidad
Resumen: Resumen de flota
Añadir microcopy o helper text donde haga falta:
debajo de los campos de capacidad
en la parte superior de la sección de capacidades
en estados vacíos
Ejemplo:
“Agregá la capacidad real de cada unidad. Si tenés vehículos del mismo tipo con capacidades distintas, cargalos por separado.”
El botón Continuar debe permanecer deshabilitado hasta que el usuario haya cargado al menos una unidad y completado las capacidades mínimas requeridas. Definir visualmente estados:
vacío
incompleto
válido
Mejorar la claridad de los nombres mostrados dentro de la parte editable. En vez de repetir solo el nombre del tipo, usar estructura tipo:
Transganado con Acoplado — Unidad 1
Transganado con Acoplado — Unidad 2
Transganado Eje Simple — Unidad 1
El diseño debe contemplar que algunos usuarios pueden tener muchas unidades, así que organizarlo con buena jerarquía visual, espaciado, cards limpias, y formularios fáciles de escanear. Quiero una solución elegante de producto, no solo un parche.
Mantener los botones + y - porque me gustan, pero hacerlos más intuitivos y más claramente asociados a la tarjeta seleccionada. Si hace falta, usar labels como:
Agregar unidad
Quitar unidad
Importante: no asumir que todas las unidades del mismo tipo tienen la misma capacidad. Esa es una de las reglas más importantes de este cambio.
En la propuesta de Figma, mostrar estados de ejemplo realistas, incluyendo:
2 unidades de Transganado con Acoplado, una con 40 gordos y otra vacía
1 unidad de Eje Simple
resumen total actualizado
un caso donde el campo de desmamantes fue autocompletado pero luego editado manualmente
Mantener coherencia con el resto del producto Tropero: interfaz limpia, profesional, moderna, orientada a transportistas y logística rural. No quiero que parezca una pantalla genérica de formulario; quiero que se entienda como una herramienta de gestión de flota.
Prioridad de este cambio:
claridad
lógica correcta de múltiples unidades
guardado independiente por unidad
facilidad para completar capacidades
evitar que el usuario piense que al agregar una segunda unidad se duplica automáticamente la capacidad de la primera
Entregar la propuesta en formato de pantalla lista para prototipado en Figma, incluyendo variantes de estado:
sin selección
una tarjeta seleccionada con 1 unidad
una tarjeta seleccionada con 2 unidades
varios tipos seleccionados
campos completos y resumen activo
No rehacer por completo el flujo del producto. Hacer estos cambios dentro de la estructura actual de esta pantalla, mejorando la lógica y la UX sin romper el resto del onboarding.