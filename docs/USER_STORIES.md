# TROPEX — User Stories

Versión actualizada · Junio 2026 · Estado real de la aplicación (demo Figma → implementación React)

**Producto:** Marketplace de transporte de ganado.
**Marca:** TROPEX — "Del oficio tropero a la logística inteligente" · Agrotech Logistics.
**Roles incluidos:** Ganadero (y otras entidades solicitantes), Empresa de transporte, Owner-Operator (Transportista Independiente) y Chofer. Más un rol interno: Admin (consola de Tropero).

## Qué hace este documento

Mantiene el nivel de desglose del documento original, pero corrige y actualiza el alcance según lo que **realmente está construido hoy** en la app. Cuando una pieza descrita en el documento anterior no existe todavía en el código, se marca como **supuesto anterior** o **backlog futuro**, en lugar de tratarla como producto cerrado. Cuando algo cambió respecto del documento viejo, se indica con **Actualizado**.

> Nota de versión: la marca pasó a llamarse **TROPEX** (antes "Tropero"). En el código se usan ambos nombres en algunos lugares; la identidad visual oficial es TROPEX.

---

## 1. Propósito del documento

Este documento no pretende reescribir la UI en lenguaje académico. La idea es explicar en pocas palabras qué hace cada rol, qué pantallas existen hoy y qué comportamiento se espera cuando la app pase de demo a implementación productiva. Además, existen funciones que serían vitales en un futuro, luego de recolectar información de los usuarios; como necesitamos que se entienda la idea final, vale la pena incluirlas (marcadas como backlog).

La idea no es solo una app de camiones. El producto combina **marketplace, operación logística y cumplimiento documental**. La experiencia está diseñada en torno a un viaje de ganado que atraviesa cuatro grandes momentos: **publicación, negociación, asignación y ejecución**.

### 1.1 Identidad de marca (Actualizado)

Para mantener consistencia en el desarrollo, la paleta y tipografías están fijadas en código (`src/app/config/brand.ts`, "no cambiar"):

| Token | Color | Uso |
|---|---|---|
| Verde profundo | #1E5126 | Color primario / acciones |
| Naranja GPS | #F58718 | Acento / CTA / tracking |
| Verde noche | #08221A | Fondos oscuros / dashboards |
| Neutro técnico | #F6F1E8 | Fondo cálido general |

**Tipografías:** Space Grotesk (títulos) + IBM Plex Sans (cuerpo/UI).

### 1.2 Información sobre la SENACSA

El Servicio Nacional de Calidad y Salud Animal es el ente que controla el mercado de esta aplicación y tiene varias restricciones, reglas y documentos que son —y podrían llegar a ser— vitales para la funcionalidad de la app. (Obs.: nuestra competencia "CERKA" no hace ningún esfuerzo por ser SENACSA-compliant; nosotros tampoco estamos obligados, pero serlo sería una buena iniciativa.)

**Documentos importantes:**

- **Guía:** documento base del movimiento. Solo puede haber una por camión, con un máximo de **45 animales adultos (gordos)** o **80 jóvenes (desmamantes)**. Puede ser *Guía Simple de Traslado* (sin cambio de dueño) o *Guía de Traslado y Transferencia* (cuando hay venta o cambio de propietario). Incluye origen, destino, marcas, tipo de ganado y cantidad. Para Tropero/TROPEX la guía es muy útil porque explica qué se mueve, desde dónde, hacia dónde y bajo qué figura, y se controla obligatoriamente en los puestos de control. Sería bueno avisar al ganadero y al transportista cada vez que pasen por uno.
- **COTA:** Certificado Oficial de Tránsito de Animales. En la práctica, autoriza el tránsito del ganado; con él se emite la guía. **Comentario (Actualizado):** en la versión móvil ya se retiraron las referencias a "subir COTA"; el documento operativo que queda visible para el conductor es la **guía**. El COTA permanece como concepto de cumplimiento, no como tarea de carga manual en la app.
- **Vehículos y choferes habilitados:** SENACSA también regula que vehículos y choferes estén habilitados oficialmente. Para el MVP no se exige; a futuro, integrar verificación SENACSA (idealmente vía SIGOR) aumentaría confiabilidad y formalidad.

**Límite de cabezas por camión (Actualizado, fijado en código):** además del límite por **guía** (45 gordos / 80 desmamantes), la app aplica un **tope de 40 cabezas facturables por camión en una oferta** (`MAX_HEADS_PER_TRUCK = 40`). Es el máximo que un transportista cotiza en un solo viaje; si la solicitud pide más, el excedente se reparte en otra guía / otro camión.

> Constantes de negocio (`src/app/config/business.ts`): `SENACSA_GUIDE_LIMIT = { fat: 45, weaned: 80 }`, `MAX_HEADS_PER_TRUCK = 40`, `MAX_NEGOTIATION_ROUNDS = 3`. Precio de referencia de demo: `410 ₲/km/cabeza` sobre `400 km` por defecto (`DEMO_PRICING` → `estimateReferencePrice`).

---

## 2. Pre-Registro

En el rubro, no solo el ganadero orquesta el pedido: también frigoríficos, consignatarias, organizadores de feria y otras organizaciones. El negocio no debería cerrarse solo a ganaderos, pero tampoco perder la identidad de cada perfil. Por eso el prerregistro tiene un paso adicional para distinguir si el usuario **necesita transporte** o **provee transporte**.

### 2.1 Landing y selección de tipo de usuario

- **Landing (`WelcomeScreen.tsx`):** hero animado con visualización de tracking de ganado en tiempo real y CTA "Empezar ahora".
- **Selección de cuenta (`ChooseAccountType.tsx`):** pregunta "¿Qué necesitás hacer?" con dos caminos:

**Camino A — "Necesito transportar ganado"** → tipo de establecimiento:

| Opción | Descripción |
|---|---|
| Ganadero / Estanciero | Productor con estancia o campo ganadero |
| Frigorífico | Planta de faena que necesita transporte de hacienda |
| Consignataria | Empresa de corretaje y consignación de ganado |
| Feria / Remate | Organizador de subastas ganaderas |
| Otro | Otro establecimiento que necesita transporte |

**Camino B — "Soy transportista"** → tipo de transportista:

| Opción | Descripción |
|---|---|
| Empresa | Compañía de transporte ganadero |
| Owner-Operator (Transportista Independiente) | Transportista con vehículo propio |
| Chofer | Conductor empleado por una empresa |

> Existen variantes móviles de todas las pantallas de registro (`*Mobile.tsx`). Las reglas y campos son los mismos; cambia solo el layout.

### 2.2 Flujo 1 — Registro de Ganadero

3 pasos · Validación RUC: Sí · Base SITRAP: opcional (solo exportadores).

#### Paso 1 de 3 — Información básica
*Como ganadero, quiero registrar mis datos personales básicos para crear mi cuenta.*

| Campo | Requerido | Notas |
|---|---|---|
| Nombre | Sí | Placeholder: Juan |
| Apellido | Sí | Placeholder: González |
| Teléfono | Sí | Formato: +595 981 234 567 |
| Email | No | Placeholder: juan@ejemplo.com |

Componente: `RancherSignup1Basic.tsx`.

#### Paso 2 de 3 — Localizar establecimiento ⭐ Integración API
*Como ganadero, quiero buscar mi establecimiento y validar mi RUC para que mis datos se verifiquen automáticamente.*

| Campo | Requerido | Notas |
|---|---|---|
| Nombre del establecimiento (SENACSA) | Sí | Queda como nombre de usuario. Autocompleta desde base SITRAP (solo exportadores, datos de prueba) |
| RUC | Sí | Validación contra `turuc.com.py` → "✓ RUC verificado" o "RUC no encontrado — podés continuar igual" |
| Razón Social | Sí | Autocompletado desde API si el RUC es válido |
| Ubicación del establecimiento | Sí | Mapa interactivo (demo): al hacer clic autocompleta lat/long y departamento/ciudad |
| Mapa de acceso al establecimiento | No | Carga de documento opcional |

> API `turuc.com.py`: `GET /api/contribuyente/{ruc}` — sin autenticación. Si estado='ACTIVO', autocompletar Razón Social y mostrar check verde 'Verificado con SET'.

Componente: `RancherSignup2Ranch.tsx`.

#### Paso 3 de 3 — Método de pago
*Como ganadero, quiero configurar dónde recibir pagos.*

Tipo de entidad (tarjetas seleccionables): **Banco · Financiera · Cooperativa · Billetera** (Tigo Money, Personal Pay, Wally, Dimo-Cabal, Tuparenda, Bancard). Luego: institución, número de cuenta, titular, tipo y número de documento.

Componente: `RancherSignup3Payment.tsx`. Pantalla final: "Cuenta lista".

### 2.3 Flujo 1.2 — Registro de Frigorífico / Consignataria / Feria / Otro

3 pasos · Validación RUC: Sí.

#### Paso 1 de 3 — Información del establecimiento
*Como [entidad], quiero registrar los datos de mi establecimiento.*

| Campo | Requerido | Notas |
|---|---|---|
| Nombre del establecimiento | Sí | Placeholder: Ej: Estancia La Esperanza |
| RUC | Sí | Verifica contra base simulada → "✓ RUC verificado" / "RUC no encontrado" |
| Razón Social | Sí | Se completa automáticamente con RUC válido |
| Teléfono de contacto | Sí | +595 981 123 456 |
| Email | Sí | tu@email.com |
| Dirección | No | Dirección física |

Componente: `ProductorSignup1Basic.tsx`.

#### Paso 2 de 3 — Documentos del establecimiento
Carga opcional (PDF/JPG/PNG, máx 5MB, múltiples archivos) para obtener el estado **Verificado**. Componente: `ProductorSignup2Documents.tsx`.

#### Paso 3 de 3 — Método de pago
Reutiliza el mismo flujo de pago del ganadero (`RancherSignup3Payment.tsx`).

### 2.4 Flujo 2 — Registro de Empresa de Transporte

5 pasos · Validación RUC: Sí · Lista DINATRAN: datos de prueba (no actualizada).

#### Paso 1 de 5 — Información de la empresa
*Como empresa de transporte, quiero registrar los datos de mi empresa para operar en la plataforma.*

| Campo | Requerido | Notas |
|---|---|---|
| Buscar empresa (opcional) | No | Autocomplete desde lista DINATRAN (datos de prueba). Ej: G-3 TRANSPORTES, AGRO LOG, BOICY |
| Nombre de la Empresa | Sí | Ej: Transportes Ganaderos del Chaco S.A. |
| RUC | Sí | Validación `turuc.com.py` |
| Razón Social | Sí | Verificar que coincida con el RUC |
| Teléfono de contacto | Sí | +595 981 123456 |
| Email Corporativo | Sí | contacto@empresa.com.py |

Componente: `EmpresaSignup1Basic.tsx`.

#### Paso 2 de 5 — Tu flota ⭐ Lógica compleja
*Como empresa de transporte, quiero configurar mi flota para que la plataforma sepa qué capacidad tengo.*

**Tipos de camión (4 tarjetas con ilustración SVG):** Camión chico (eje simple) · Camión mediano (doble eje) · Camión con acoplado · Semirremolque.

**Interacción:** al seleccionar un tipo aparece un contador [- Quitar] [+ Agregar]. **Cada unidad se configura por separado** (las capacidades pueden diferir).

| Campo por unidad | Requerido | Notas |
|---|---|---|
| Capacidad Gordos / Adultos | Sí | Helper: "Máximo 45 cabezas según SENACSA" |
| Capacidad Desmamantes / Jóvenes | Sí | Autocalculado = min(adultos × 2, 80), **editable**. Helper: "Valor sugerido automáticamente. Podés editarlo." / "Editado manualmente" |

**Resumen de flota (tiempo real):** total de unidades, capacidad total adultos, capacidad total jóvenes.

> ⚠️ Importante: no asumir que todas las unidades del mismo tipo tienen la misma capacidad. Cada unidad se guarda por separado.

Componente: `EmpresaSignup2Fleet.tsx`.

#### Paso 3 de 5 — Documentos de la empresa ✓ Permite omitir
*Como empresa, quiero subir mi habilitación SENACSA para verificar que estoy autorizado.* Otorga el estado **Verificado**. Carga: Habilitación de transporte SENACSA (PDF/JPG/PNG). Componente: `EmpresaSignup3Documents.tsx`.

#### Paso 4 de 5 — Cuenta de cobro
Misma selección de entidad de pago que el resto de los perfiles (Banco/Financiera/Cooperativa/Billetera). Componente: `EmpresaSignup4Payment.tsx`.

#### Paso 5 de 5 — Método de cobro
*Como empresa, quiero elegir cuándo recibir mis pagos.*

| Opción | Comisión | Cuándo cobra |
|---|---|---|
| Pago estándar | 3% | Cuando el ganadero libera los fondos tras el viaje (hasta 24 h para confirmar) |
| Pago inmediato | 5% | Al terminar el viaje — liquidez instantánea |

> Recordá: se puede cambiar esta preferencia desde la configuración. **Comentario:** la configuración interna del admin tiene una comisión por defecto del 8% (`commissionRate`); conviene reconciliar ese valor con el 3%/5% mostrado al usuario antes de producción.

Componente: `EmpresaSignup5PayoutMethod.tsx`.

### 2.5 Flujo 3 — Registro de Owner-Operator

5 pasos · Validación RUC: Sí · Transportista independiente con camión propio.

#### Paso 1 de 5 — Información personal

| Campo | Requerido | Notas |
|---|---|---|
| Nombre Completo | Sí | Ej: Juan Carlos Pérez |
| Cédula de Identidad | Sí | Formato: 1.234.567 |
| RUC | Sí | Validación `turuc.com.py`. Helper: "Si emitís facturas" |
| Número de Celular | Sí | +595 981 123456 |
| Email | No | tu@email.com |

Componente: `OwnerOperatorSignup1Basic.tsx`.

#### Paso 2 de 5 — Tu vehículo
Misma lógica y diseño que la flota de Empresa (mismos tipos de camión, mismos límites SENACSA: 45 adultos / 80 jóvenes, autosugerencia editable). Componente: `OwnerOperatorSignup2Vehicle.tsx`.

#### Paso 3 de 5 — Documentos ✓ Permite omitir
Licencia de conducir + Habilitación SENACSA. Otorga el estado **Verificado**. Componente: `OwnerOperatorSignup3Documents.tsx`.

#### Pasos 4 y 5 — Cobro y método de cobro
Misma lógica que Empresa (cuenta de cobro + estándar 3% / inmediato 5%). Componentes: `OwnerOperatorSignup4Payment.tsx`, `OwnerOperatorSignup5PayoutMethod.tsx`.

### 2.6 Flujo 4 — Registro de Chofer de Empresa

3 pasos · Validación RUC: No · Requiere vinculación con empresa.

#### Paso 1 de 3 — Información personal

| Campo | Requerido | Notas |
|---|---|---|
| Nombre Completo | Sí | Ej: Roberto Díaz |
| Cédula de Identidad | Sí | Formato: 1.234.567 |
| Número de Celular | Sí | +595 981 123456 |
| Contacto de Emergencia | No | Número de un familiar o persona cercana |

> ⚠️ Sin validación RUC: los choferes de empresa no requieren RUC.

Componente: `DriverSignup1Basic.tsx`.

#### Paso 2 de 3 — Empresa asignada
Vinculación por **código de invitación** (ej: TROPE-2024-ABC123) o, si no lo tiene, ingresando el **nombre de la empresa** manualmente (uno deshabilita al otro). Aviso: "Verificaremos que la empresa esté registrada antes de aprobar tu cuenta." Componente: `DriverSignup2Company.tsx`.

#### Paso 3 de 3 — Documento de identidad ✓ Permite omitir
Carga opcional de cédula (frente y dorso). Componente: `DriverSignup3Documents.tsx`.

#### Pantalla final — "Tu cuenta está casi lista"
Estado: **Pendiente de aprobación**. Checklist: ✓ Información personal verificada · ✓ Solicitud enviada a tu empresa · ◷ Esperando aprobación del administrador. El admin de la empresa debe aprobar antes de operar. Componente: `DriverAccountPending.tsx`.

### 2.7 Resumen técnico de registro

| Usuario | Pasos | Validación RUC | Base de prueba |
|---|---|---|---|
| Ganadero | 3 | Sí | SITRAP |
| Frigorífico/Consignataria/Feria/Otro | 3 | Sí | — |
| Empresa | 5 | Sí | DINATRAN |
| Owner-Operator | 5 | Sí | — |
| Chofer | 3 | No | — |

**Reglas de navegación:** cada pantalla tiene "← Volver" al paso anterior; "Omitir / Guardar para después" solo en documentos y pasos opcionales; el progress bar muestra paso actual / total.

---

## 3. Pos-Registro — Ganadero y otras entidades solicitantes

El solicitante de transporte origina la demanda. Sus pantallas cubren: dashboard, historial, reportes, soporte, ofertas recibidas, detalle de viaje activo y el wizard para crear una nueva solicitud. Componentes: `dashboards/RancherDashboard.tsx` (desktop) y `dashboards-mobile/RancherDashboardMobile.tsx` (mobile).

### 3.1 Navegación

| Elemento | Descripción |
|---|---|
| Sidebar (desktop) | Panel Principal, Ofertas, Historial, Reportes, Soporte + botón destacado "Nuevo Envío" |
| Bottom-nav (mobile) | Home, Ofertas, Envíos, Historial, Reportes, Más (Soporte, **Cuenta**) |
| Objetivo del rol | Publicar solicitudes, comparar ofertas, elegir transportista y monitorear la ejecución |

### 3.2 Dashboard

- Fila superior con tarjetas-resumen: ofertas nuevas, solicitudes abiertas, próximos retiros, actividad reciente y CTA "Nuevo Envío".
- **Envío activo (hero):** ruta origen → destino, badge de estado y barra de progreso, datos del transportista (nombre, rating), distancia, horarios, ganado. Botones **"Ver detalles"** y **"Cancelar viaje"** (Actualizado).
- Listado de otros envíos activos, próximos retiros, ofertas pendientes (carrusel) y feed de actividad.
- Toggle de mapa con íconos y trazados de los viajes.

### 3.3 Historial
Tabla simple: fecha, origen, destino, cabezas, precio y estado (completado / cancelado). No es prioridad del MVP, pero sirve para análisis futuro (flete promedio, guías anteriores). **Pendiente/backlog:** botón "ver más detalles" por viaje.

### 3.4 Reportes
Pantalla de reportes y estadísticas, hoy más resumida (placeholder) que análisis profundo. Define la dirección del módulo. **Backlog:** análisis útil pero no para el MVP.

### 3.5 Soporte
Tres vías de contacto (WhatsApp, email, centro de ayuda) + preguntas frecuentes con acordeones.

### 3.6 Crear nueva solicitud (wizard, Actualizado)
Componente: `dashboards/NewShipmentFlow.tsx`. **4 pasos** con resumen lateral "Tu solicitud" que se va completando. Es parte del core.

#### Paso 1 — Origen
- Tipo de establecimiento de origen (dropdown): Campo/Estancia, Frigorífico, Feria/Remate, Otro, y **"Mi establecimiento"** (autocompleta desde el perfil — debería aparecer primero).
- Mapa interactivo para fijar el pin de origen (autocompleta departamento).
- Según el tipo: autocomplete de campos / lista de frigoríficos SENACSA / texto libre.
- Fecha de carga (calendario). *Se suele coordinar de una a dos semanas antes.*

#### Paso 2 — Destino
- Mapa interactivo para el pin de destino.
- Tipo de destino: Feria/Remate, Frigorífico (lista de 15 frigoríficos verificados SENACSA), Otro, "Mi establecimiento".
- El resumen lateral arrastra origen y fecha ya elegidos.

#### Paso 3 — Ganado
- Cantidad de cabezas y tipo de ganado (Desmamantes / Gordos; solo eso fija el precio de referencia).
- **División de guías SENACSA (Actualizado):** si la cantidad supera el límite (45 gordos / 80 desmamantes), aparece un aviso ámbar "División de guías SENACSA requerida" y dos campos **Guía 1 / Guía 2**. La app **autosugiere** el reparto (ej.: 60 gordos → Guía 1 = 45, Guía 2 = 15) y valida que la suma coincida. Cambiar una guía ajusta la otra automáticamente.
- Peso aproximado por animal (obligatorio; aparece en las ofertas porque los camiones tienen pesos máximos).
- Notas especiales de manejo (opcional).

#### Paso 4 — Confirmación
- Resumen del pedido (ruta, fecha, tipo y cabezas, peso total, notas).
- **Estimación de precio:** distancia estimada 400 km (referencia), tarifa 410 ₲/km/cabeza, total estimado en grande. Subtítulo: "Precio de referencia. Los transportistas harán sus ofertas y vos elegís."
- **Política de cancelación:** "Si cancelás después de que un transportista aceptó el viaje sin causa justificada, se puede aplicar una tarifa del 2% del costo del transporte."
- Botón "Publicar solicitud".

> Regla de producto: la confirmación debe dejar claro que el monto es **referencia de mercado** y que el precio final depende de la oferta aceptada. El precio por kilómetro fino (n≥30 por ruta) es **backlog**, no MVP.

### 3.7 Ofertas recibidas y negociación
- El módulo de **Ofertas Recibidas** muestra tarjetas por solicitud con el **historial de negociación** visible (oferta inicial del transportista, tu contraoferta, contraoferta del transportista).
- Panel de precio actual, comparación contra valor de referencia y CTA para **aceptar** o **contraofertar**. Modales específicos de "Aceptar oferta" y "Hacer contraoferta".

| Acción | Comportamiento esperado |
|---|---|
| Aceptar | Cierra la negociación y convierte la solicitud en viaje adjudicado |
| Contraofertar | Registra una nueva ronda y actualiza el historial |
| Historial | Queda visible para entender cómo se llegó al precio actual |
| Rondas | Máximo **3 rondas** (`MAX_NEGOTIATION_ROUNDS`) |

### 3.8 Detalle del transporte activo
Modal/panel con pestañas (`RancherTripDetailModal`):
- Encabezado: ID del envío, badge de estado, ganado, precio acordado y ETA.
- **Viaje:** origen, destino, distancia, tipo de ganado, cantidad, precio final.
- **Seguimiento:** ubicación del chofer en el mapa, ETA y checkpoints de control.
- **Transportista:** empresa, chofer asignado, y —solo después de que el viaje está activo— teléfono / WhatsApp / llamar.
- Interfaz de **calificación** (estrellas) tras la entrega. *Bidireccional plena = backlog.*

---

## 4. Pos-Registro — Empresa de transporte

La empresa es el rol más administrativo-operativo del lado de la oferta: compite por viajes y además gestiona flota, choferes y desempeño. Componentes: `dashboards/EmpresaDashboard.tsx` y `dashboards-mobile/EmpresaDashboardMobile.tsx`.

### 4.1 Navegación

| Elemento | Descripción |
|---|---|
| Sidebar (desktop) | Panel Principal, Marketplace, Flota, Conductores, Reportes, Soporte |
| Bottom-nav (mobile) | Flota, Marketplace, Conductores, Mapa, Reportes, Más (Soporte, **Cuenta**) |
| Diferencia central | A diferencia del owner-operator, la empresa separa **vehículo** y **chofer** |

### 4.2 Dashboard
- Acciones rápidas y tarjetas-resumen: viajes en ruta, contador de marketplace, conductores activos, ingresos del mes.
- **Flota en ruta:** mapa en tiempo real + tarjetas por camión (ID, estado, ubicación, chofer). Al seleccionar un camión se abre su **detalle de viaje** (ruta, progreso, checkpoints, guía) con botón **"Ver documentos y detalles completos"** y, si el viaje está activo, **"Cancelar viaje"** (Actualizado).
- Sección de marketplace directo con filtros (precio, estado, distancia), que se pueden re-filtrar pensando en el camión al que se le busca carga.

### 4.3 Ver viajes disponibles (Marketplace unificado, Actualizado)
La empresa y el owner-operator comparten la **misma vista de marketplace** (`tropero-v2/AvailableTripsView.tsx`), con el estilo de tarjeta unificado. Ver la sección 6 para el detalle completo del marketplace y del flujo de oferta.

### 4.4 Detalle de solicitud y oferta
- Modal con datos del ganadero, **calificación + badge "Verificado"** (si corresponde), establecimiento, ruta, distancia, estado de la oferta y **mapa**.
- **Nunca se muestran teléfonos en las ofertas**: el contacto del ganadero se habilita recién al aceptar.
- Formulario de oferta con dos cálculos (precio total o asistido por km) y, en envíos de dos guías, opción de ofertar por una guía. Ver sección 6.

> Dato de mercado: de lo que cobra un transportista independiente, ~87% se va en costos operativos (37–40% solo combustible). Reducir distancia es más rentable. Precio por km de referencia: 360–420 ₲. Solo ~1.600 camiones habilitados por SENACSA (caída ~30% desde 2011).

### 4.5 Gestión de flota
- Tabla con ID del camión, tipo, capacidad, estado y conductor.
- Estados: **en viaje, disponible, mantenimiento** (el mantenimiento puede quedar fuera del MVP).
- **Comentario (Actualizado):** la patente/chapa ya casi no se pide en el flujo principal; se usan el **tipo de camión** y el **chofer**. La gestión de alta/edición/baja de camiones con límites SENACSA vive principalmente en el módulo de **Cuenta** (ver 7.2).

### 4.6 Detalle de camión / viaje asignado
- Encabezado tipo CAM-001.
- **Viaje:** origen, destino, ganado, chofer y ruta actual.
- **Documentos:** guía y checkpoints.
- **Chofer:** nombre, contacto, ubicación actual y acciones rápidas (contactar).
- **Obs.:** la plataforma debe dar las herramientas para que retrasos o cambios se manejen dentro de la app, sin que "el arreglo" sea responsabilidad nuestra. **Cambio:** no existe cambio de chofer.

### 4.7 Gestión de conductores
- Bloque para invitar conductor con **código de invitación** visible y acción de copiar / compartir por WhatsApp.
- Lista de choferes con métricas (viajes, ingresos generados). *Velocidad promedio y alertas = backlog.*
- El chofer no queda operativo hasta que la empresa lo apruebe.

### 4.8 Reportes y analíticas
Métricas financieras y operativas (ingresos del mes, viajes completados/activos, conductores disponibles), mapa de flota y resumen de capacidad por unidad. *Estadísticas avanzadas (rendimiento por conductor, velocidad) = backlog.*

---

## 5. Pos-Registro — Owner-Operator

El owner-operator es el lado de oferta individual: panel propio, viaje actual, historial, reportes y documentos. Mucho de la UI coincide con la del chofer de empresa, más la parte comercial. Componentes: `dashboards/OwnerOperatorDashboard.tsx` y `dashboards-mobile/OwnerOperatorDashboardMobile.tsx`.

### 5.1 Navegación

| Elemento | Descripción |
|---|---|
| Sidebar (desktop) | Panel Principal, Viajes disponibles, Historial, Reportes, Soporte |
| Bottom-nav (mobile) | Viaje, Mercado, Mapa, Ingresos, Más (Soporte, **Cuenta**) |
| Diferencia vs empresa | No administra choferes ni múltiples unidades: él **es** el camión |

### 5.2 Dashboard
- Tarjetas: viaje actual, viajes asignados/agendados, completados del mes, ingresos del mes.
- **Viaje actual (hero):** ruta, distancia, cabezas, capataz, progreso y ETA, contacto (llamar/WhatsApp), y botones **"Ver detalles"**, **"Cancelar viaje"** y "Reportar retraso" (Actualizado).
- Preview del marketplace con cards recomendadas.
- **Comentario (Actualizado):** en mobile se retiró el bloque de "oportunidades de mercado" redundante.

### 5.3 Viajes disponibles
Misma vista de marketplace que la empresa (sección 6), con cards detalladas y filtros. **Backlog:** lógica de recomendación que empuje primero lo que más le conviene.

### 5.4 Flujo de oferta
- Ve el detalle completo de la solicitud (con mapa y datos del ganadero) antes de ofertar.
- Oferta con **precio total** o **cálculo asistido por km** (dos modos: sensación de control sobre el precio / quienes se manejan mejor con ₲ por km).
- Referencia de mercado para orientar. En estados avanzados puede aceptar la contraoferta del ganadero o enviar otra. Ver sección 6.

### 5.5 Viaje actual (Actualizado)
Módulo operativo completo (no solo una card):
- Mapa de ruta con origen, ubicación actual y destino. *Al inicio será un trazado/línea aproximada; el ruteo fino y la guía de caminos exactos son backlog.*
- Barra de progreso y actualización de estado.
- Detalle del ganado y contacto del establecimiento/capataz (llamar/WhatsApp habilitados con el viaje activo).
- **Actualizado (mobile):** el antiguo "Subir COTA" se reemplazó por **"Ver detalles del viaje"**, y dentro de ese detalle está el botón **"Cancelar viaje"** con el flujo inteligente de cancelación (sección 8). Se retiraron todas las referencias a subir COTA/guía en mobile.
- **Backlog:** compartir el viaje con el capataz o un familiar; manejo de pérdida de señal ("acercándose al establecimiento").

> Cómo lo hace CERKA: es solo un marketplace que cobra comisión, asegura la carga por ₲50.000 (obligatorio, cubre poco) y ofrece "live tracking" tipo ping cada tanto, no un mapa como Uber. El precio se cierra por WhatsApp.

### 5.6 Historial
Tabla: ID viaje, fecha, ruta, cabezas, ganancia y estado. El owner-op lee su negocio en clave de ganancia. *Refinamiento = backlog.*

### 5.7 Reportes
Tabs Ingresos (ingresos del mes, promedio por viaje, completados, mejor mes, ranking de rutas) y Documentos (personales y del vehículo). *Backlog para el MVP.*

### 5.8 Documentos
Personales (licencia, habilitación SENACSA) y del vehículo (cédula verde / registro SENACSA). La UI muestra vigencia, última actualización y acciones de renovar; estados "vigente" y "por vencer". **Backlog:** avisos de vencimiento que congelen la cuenta (ideal con integración SIGOR).

---

## 6. Marketplace unificado y flujo de oferta (Actualizado · sección nueva)

Esta sección consolida cómo funciona el marketplace que comparten **Empresa** y **Owner-Operator**, y el flujo de aceptación. Componente principal: `tropero-v2/AvailableTripsView.tsx`.

### 6.1 Tarjeta de solicitud
Cada card muestra: ID (ej. SOL-001), badge de estado (Disponible / Esperando respuesta / Contraoferta recibida / Oferta aceptada), nombre y **rating** del ganadero, **badge "Verificado"** (verde, solo si la solicitud está verificada), ruta origen → destino, distancia, carga (cabezas + tipo), peso estimado y retiro (fecha/hora). Si aplica división SENACSA, aparece el tag **"2 guías"** y un selector **Guía 1 / Guía 2** que cambia los datos mostrados por guía.

### 6.2 Precios en la tarjeta
Según el estado: "Ref. mercado" (referencia) para nuevas; "Tu oferta" para enviadas; contraoferta del ganadero en naranja para las contraofertadas; "Oferta aceptada" + precio acordado para las cerradas. La referencia de mercado se calcula con `estimateReferencePrice` (410 ₲/km/cabeza × 400 km).

### 6.3 Ver detalles (con mapa)
El botón "Ver detalles" abre un modal con: ganadero + rating + **"Verificado · SENACSA"**, establecimiento y código SENACSA, **mapa con la ruta** (pin de origen azul, destino rojo, polilínea), distancia, datos del ganado y estado de la negociación.

> Regla clave de privacidad: **nunca se muestran números de teléfono en las ofertas**. El contacto del ganadero (WhatsApp/llamar) se habilita únicamente cuando la oferta queda aceptada (`acceptedTripId === trip.id`).

### 6.4 Hacer una oferta (calculadora)
El modal de oferta funciona igual en desktop y **mobile**, con dos modos:

| Modo | Qué pide | Resultado |
|---|---|---|
| Precio total | Un único monto total del viaje | "Tu oferta total" |
| Manual (por km) | Distancia (editable) × Precio por km (editable) × Cabezas (solo lectura, tope 40) | Cálculo en tiempo real + desglose |

Si la solicitud pide más de 40 cabezas, la nota explica: "Tope de 40 cab. por camión (la solicitud pide X). Cotizás por lo que entra en un viaje." Negociación: máximo 3 rondas.

### 6.5 Flujo de aceptación — elegir camión primero (Actualizado · Empresa)
**Cambio importante respecto del documento viejo:** antes se aceptaba la oferta y *después* se asignaba un camión. Ahora el orden está invertido para la **empresa**: primero se elige el camión, luego se confirma.

1. La empresa toca "Aceptar" → se abre `FleetAssignmentPopup` ("Elegí el camión").
2. **Mapa** con el pin de origen y todos los camiones, **ordenados por cercanía al origen**. El más cercano disponible se marca con **"★ Más cercano"** (naranja); el seleccionado en verde; los no disponibles en gris.
3. Cada card de camión muestra tipo, distancia al origen, capacidad para ese tipo de ganado, chofer y rating. Se **deshabilita** si el chofer no está disponible, el vehículo está en viaje/mantenimiento o **la capacidad es insuficiente** (ej.: "⚠ Capacidad insuficiente (35/60 cab.)"). La capacidad se valida con `capacityAdults` (gordos) o `capacityYoung` (desmamantes).
4. Elegido el camión → modal final "Confirmar viaje" con el camión asignado (tipo + chofer), ruta, precio acordado y aviso de cancelación (posible multa del 2% según el motivo).

**Owner-operator:** como él *es* el camión, no hay asignación de flota: acepta directo con la confirmación.

### 6.6 Reglas de adjudicación
La oferta aceptada cierra la negociación, se retira del pool abierto y se agrega al dashboard de ambas partes como **viaje adjudicado**.

---

## 7. Gestión de cuenta y verificación (Actualizado · sección nueva)

Todos los roles tienen un módulo de **Cuenta** accesible desde el ícono de perfil (desktop) o desde "Más → Cuenta" (mobile). Usa un shell responsivo compartido (`AccountShell.tsx`): en desktop, encabezado + sidebar de secciones + contenido; en mobile, menú → subpantalla con "volver". Los cambios sensibles (datos legales, documentos, altas de camión, conversión de cuenta) **no se aplican solos**: generan una **solicitud de revisión** que aprueba el equipo de Tropero (o la empresa, en el caso del chofer). El estado se ve en la sección **"Solicitudes en revisión"** con chips "En revisión".

### 7.1 Ganadero (`GanaderoAccount.tsx` — 6 secciones)
Mi perfil · Establecimiento (nombre/RUC/razón social = sensibles → aprobación) · Documentos y verificación (RUC, registro SENACSA → badge "Productor verificado") · Método de pago (sin comisión; solo 2% en cancelaciones de viaje verificado) · Solicitudes en revisión · Cuenta y seguridad.

### 7.2 Empresa (`EmpresaAccount.tsx` — 8 secciones)
Perfil de la empresa (razón social/RUC sensibles) · **Flota** (alta/edición/baja de camiones con selector de tipo **TruckTypeIcon** y topes SENACSA — gordos ≤ 45, desmamantes ≤ 80 con autosugerencia; "Solicitar alta" genera aprobación) · **Conductores** (código de invitación, copiar/compartir WhatsApp, suspender/reactivar/dar de baja) · Facturación y pagos (comisión, tabla de facturas) · Documentos y verificación (RUC, permiso SENACSA, seguro de carga con alerta "por vencer") · Solicitudes en revisión · Cuenta y seguridad.

> Las ilustraciones de camión del registro (`TruckTypeIcon.tsx`) se reutilizan aquí en el alta de camión, con los mismos límites SENACSA que el signup.

### 7.3 Owner-Operator (`OwnerOperatorAccount.tsx` — 6 secciones)
Mi perfil (cédula/RUC sensibles) · **Mi vehículo** (un camión, edición con topes SENACSA) + tarjeta **"¿Querés sumar otro camión?"** → botón **"Convertir mi cuenta a Empresa"** (al confirmar genera la solicitud "Conversión a cuenta Empresa"; tras la aprobación puede manejar flota y choferes) · Documentos y verificación · Cobros y pagos (estándar 3% / inmediato 5%) · Solicitudes en revisión · Cuenta y seguridad.

### 7.4 Chofer (`DriverAccount.tsx` — 5 secciones, limitado)
Mi perfil (cédula sensible) · **Mi empresa** (datos de la empresa en solo lectura + botón **"Solicitar baja de la empresa"**; no puede convertir cuenta ni manejar flota) · Documentos personales (licencia, cédula; "reemplazar" → la empresa valida) · Solicitudes en revisión · Cuenta y seguridad (mínima).

---

## 8. Pos-Registro — Chofer

El chofer es un usuario operativo puro: ejecuta viajes asignados, actualiza estados y mantiene documentos vigentes. Componentes: `dashboards/DriverDashboard.tsx` y `dashboards-mobile/DriverDashboardMobile.tsx`.

### 8.1 Navegación

| Elemento | Descripción |
|---|---|
| Sidebar (desktop) | Panel, Viaje actual, Asignados, Documentos |
| Bottom-nav (mobile) | Viaje, Asignados, Mapa, Documentos, Más (Soporte, **Cuenta**) |
| Dependencia | Opera viajes asignados por una empresa; no participa de oferta ni negociación |

### 8.2 Dashboard
Tarjetas: viaje actual, asignados, completados del mes, km recorridos. Card del viaje actual con ruta, cantidad, ETA y contacto del capataz.

### 8.3 Viaje actual
ID del envío, badge de estado, ETA; detalle del envío (origen, destino, cabezas, tipo, distancia); contacto del establecimiento; documentos requeridos (**solo guía**, no COTA); botones "ver ruta" y "actualizar estado". **Limitación vs owner-op:** el chofer **no puede cancelar** el viaje; solo reportar retraso.

### 8.4 Ver ruta
Mapa con tres puntos: recogida, ubicación actual y destino.

### 8.5 Actualizar estado
Estados: en camino a recogida → en tránsito con ganado → llegando al destino → descargando → completado. Sección de retraso/incidente. **Backlog:** automatizar el cambio de estado por geolocalización (al pasar/dejar un control de cota).

### 8.6 Viajes asignados
Viaje activo arriba + próximos programados (origen, destino, cabezas, salida). El activo tiene "ver detalles" y "ver ruta".

### 8.7 Documentos
Mis documentos personales (licencia, cédula, certificado médico) con vigencia y alertas. **Backlog:** evaluar si se mantiene en el MVP.

---

## 9. Procedimiento de entrega (Prueba de entrega)

### 9.1 Momento y responsable
Cuando el viaje llega a **DESCARGANDO** (el transportista llega físicamente al destino), se habilita la pantalla de **Prueba de Entrega** y se notifica al solicitante (y a la empresa, si es chofer de empresa). Lo completa **el transportista/chofer**, no el ganadero. Componente: `dashboards/ProofOfDeliveryUpload.tsx` (implementado).

### 9.2 Reglas de fotos por tipo de destino

| Destino | Fotos | Regla |
|---|---|---|
| Frigorífico | 3 (obligatorias) | (1) báscula con peso final, (2) nota firmada del frigorífico, (3) animales descargando |
| Estancia | 1–3 (mín. 1) | Foto de descarga / camión en el establecimiento |

Cada foto tiene preview + eliminar/resubir. "Confirmar Entrega" se habilita al cumplir el mínimo. Toast: "Prueba de entrega confirmada. El ganadero será notificado."

### 9.3 Cambio de estado y cierre
Al confirmar: DESCARGANDO → **ENTREGADO**, se registra timestamp, se notifica al ganadero ("Tu viaje fue completado. Calificá al transportista."), se inicia el countdown de pago y se habilita la calificación.

### 9.4 Calificaciones (estado actual)
Hoy existe la **calificación con estrellas** del transportista dentro del detalle del ganadero (UI). La calificación **bidireccional plena** (modal mutuo ganadero ↔ transportista, 3 criterios, promedio, revisión por debajo de 3.5) está descrita como diseño y es **backlog**.

### 9.5 Flujo de pago (diseño)
Día 0 entrega confirmada → el ganadero paga a Tropero (hasta 10–15 días) → Tropero retiene comisión (3% estándar / 5% inmediato; default interno admin 8% a reconciliar) → paga al transportista lo antes posible. **Regla crítica (backlog/política):** Tropero asume el riesgo de impago: si el ganadero no paga, activa cobranza e igual paga al transportista para mantener confianza.

---

## 10. Cancelaciones (Actualizado — reemplaza el modelo viejo)

**Importante:** el sistema de multas en tres niveles (Tipo A/B/C) del documento anterior **no está implementado**. Se conserva más abajo como **modelo propuesto / backlog**. Lo que está construido hoy es un único flujo inteligente y compartido por todos los roles: `TripCancelFlow.tsx`.

### 10.1 Flujo construido (canónico)
Disponible para cualquier perfil con un viaje activo (ganadero, empresa, owner-operator). El **chofer no cancela** (solo reporta retraso). Se llega con el botón **"Cancelar viaje"** desde el detalle del viaje. Responsivo: pantalla completa en mobile, modal centrado en desktop.

**Paso 1 — Motivo (sin mencionar multa):**

| Motivo | ¿Justificado? |
|---|---|
| Clima / fuerza mayor (ruta cortada, inundación) | Sí — sin cargo |
| Problema mecánico (falla que impide continuar) | Sí — sin cargo |
| Emergencia personal / salud del conductor | Sí — sin cargo |
| Ya no puedo cumplir el viaje (decisión propia) | No — revisión |
| Otro motivo | No — revisión |

**Paso 2 — Evidencia (recién acá aparece la multa):**
- **Fotos obligatorias: mínimo 3** para cualquier motivo (grilla de hasta 6; el botón "Confirmar" queda deshabilitado hasta subir 3 → "Subí 3 fotos para continuar").
- Aviso: "La cancelación la revisa el equipo de Tropero. Las justificadas con fotos (clima, mecánico, salud) **no tienen costo**. En otros casos puede aplicar una **multa del 2%** según la revisión."
- Comentario opcional.

**Paso 3 — Hecho:** mensaje según quién cancela (al ganadero o al transportista se le notifica a la contraparte). Si fue justificada con fotos válidas: "Cancelación justificada · sin cargo". Si no: "El equipo de Tropero revisa el caso; si corresponde, te avisaremos sobre la multa."

> Para **empresas**, el flujo deliberadamente **no muestra la multa en la lista de motivos**; solo después de presionar cancelar (pantalla de evidencia) se informa la posibilidad de multa y la verificación del admin.

### 10.2 Contacto y comunicación por fase
- **Antes de EN_CAMINO / viaje activo:** ganadero y transportista **no** ven teléfonos; no hay botón de WhatsApp.
- **Después:** se habilitan "Contactar por WhatsApp" y "Llamar", y los teléfonos en la pestaña Transportista/Ganadero.

### 10.3 Modelo de multas propuesto (BACKLOG — no implementado)
Se mantiene como referencia de producto para cuando se automatice; hoy todo se ejecuta manualmente por el admin y los montos se ajustan con experiencia real.

- **Tipo A — No-show del transportista:** 1ª vez 10% + advertencia + la orden vuelve al marketplace; 2ª 15% + suspensión 7 días; 3ª 20% + suspensión 30 días + revisión manual.
- **Tipo B — Cancelación post-aceptación antes de EN_CAMINO:** ₲100.000 → ₲200.000 → ₲300.000 + suspensión 15 días.
- **Tipo C — Cancelación post EN_CAMINO:** 15% + 7 días → 20% + 30 días → suspensión permanente hasta revisión.
- **Ganadero:** misma estructura; sin multa si cancela antes de cualquier oferta; si cancela tras aceptar, aplica Tipo B.
- **Causas justificadas (sin multa):** deuda pendiente de la contraparte, error documentado de la plataforma, enfermedad grave documentada, clima/actos de fuerza mayor, irregularidad sanitaria en checkpoints COTA, catástrofe natural, accidente/avería.
- **Aceptación accidental:** ventana de 5 minutos para cancelar sin penalización, una sola vez por cuenta.

---

## 11. Panel de Admin (sección nueva)

Consola interna de Tropero (`dashboards/admin/`), pensada para operar la plataforma. **10 secciones:**

| Sección | Para qué |
|---|---|
| Overview | Resumen general / KPIs |
| Users | Gestión de usuarios y roles |
| Verifications | Aprobaciones de documentos, altas y conversiones (las "Solicitudes en revisión") |
| Trips | Viajes (estados: en-tránsito, programado, completado, retraso) |
| Marketplace | Solicitudes y ofertas |
| LiveMap | Mapa de flota/viajes en vivo |
| Finance | Transacciones, comisión (`commissionRate`, default 8% — a reconciliar con 3%/5%), payouts |
| Incidents | Incidentes y cancelaciones a revisar |
| Reports | Reportes |
| Settings | Configuración (incluida la comisión) |

---

## 12. Reglas transversales del sistema

### 12.1 Negociación y precios
Precios de **referencia** de mercado, valor final por oferta aceptada; historial visible para ambas partes; final claro (aceptación/rechazo/expiración); máximo 3 rondas. **Backlog:** precio de referencia fino a partir de n≥30 precios por ruta (departamento→departamento, luego zona, luego estancia→punto), usando ₲/km y adaptando a cabezas y kilometraje.

### 12.2 Tracking
El viaje incluye mapa, ETA, checkpoints y contacto; cada rol lo ve con distinto detalle pero todos comparten la noción de progreso. **Backlog:** comportamiento ante pérdida de señal o salida de ruta; actualización automática de estado por geolocalización.

### 12.3 Documentación
Documentos transaccionales del viaje (guía) y persistentes del usuario/vehículo (licencia, cédula, habilitaciones). **Backlog:** vigencia + renovación obligatoria; guía digital obligatoria a futuro si es legal.

### 12.4 Alertas e incidentes
Acciones para reportar retraso/incidente. Alertas de velocidad y documentos por vencer sugieren una capa de compliance/safety. **Backlog:** que estas alertas impacten visibilidad o disponibilidad.

### 12.5 Flota y capacidades
La empresa trabaja con capacidad por unidad y estados de vehículo; se mantiene la lógica de **unidades separadas por capacidad** (ya pensada así en registro y en el módulo de cuenta).

### 12.6 Estados del viaje (en código)
No hay un único enum global; cada vista tiene el suyo: admin (en-tránsito/programado/completado/retraso), ganadero (in-transit/accepted/waiting/completed), flota (en-viaje/disponible/mantenimiento), ofertas (pending/rancher-countered/accepted/rejected).

---

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
