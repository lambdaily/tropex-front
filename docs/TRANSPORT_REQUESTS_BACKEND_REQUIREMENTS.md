# Requerimientos Backend — Nueva solicitud de transporte

## Objetivo

Implementar el contrato backend necesario para que el flujo de creación de solicitudes funcione desde la feature `transport-requests` del frontend.

El usuario autenticado es el solicitante. El backend debe asociar la solicitud al usuario autenticado y no aceptar `requester_id` enviado por el cliente.

## 1. Catálogos obligatorios

El frontend consume estos endpoints autenticados:

```http
GET /api/catalogs/establishment-types/
GET /api/catalogs/cattle-types/
GET /api/catalogs/truck-types/
GET /api/senacsa/establishments/
```

Los endpoints de catálogos pueden devolver un array o una respuesta paginada con `results`.

### Tipos de establecimiento

```json
[
  { "value": "campo", "label": "Estancia / Campo" },
  { "value": "frigorifico", "label": "Frigorífico" },
  { "value": "feria", "label": "Feria / Remate" },
  { "value": "otro", "label": "Otro" }
]
```

Los valores deben ser estables y usar `snake_case`. No usar valores visuales como `feria-remate`, `my-establishment` o `slaughterhouse`.

### Tipos de ganado

```json
[
  { "value": "fat", "label": "Gordos" },
  { "value": "weaned", "label": "Desmamantes" }
]
```

### Tipos de camión

```json
[
  {
    "value": "camion_ganadero",
    "label": "Camión ganadero",
    "max_heads": 40
  }
]
```

### Establecimientos SENACSA

El endpoint existente `/api/senacsa/establishments/` debe soportar:

```http
GET /api/senacsa/establishments/?search=neuland
GET /api/senacsa/establishments/?type=frigorifico
GET /api/senacsa/establishments/?department=BOQUERON
```

Respuesta esperada:

```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 123,
      "name": "Frigorífico Neuland",
      "code": "SEN-123",
      "type": "frigorifico",
      "department": "BOQUERON",
      "district": "MARISCAL ESTIGARRIBIA",
      "latitude": -22.66,
      "longitude": -60.12,
      "verified": true
    }
  ]
}
```

`latitude` y `longitude` son necesarios para mostrar el punto seleccionado y calcular la ruta.

## 2. Crear solicitud

```http
POST /api/shipment-requests/
Authorization: Bearer <token>
Content-Type: application/json
```

Payload enviado por el frontend:

```json
{
  "origin": {
    "establishment_id": 123,
    "type": "campo",
    "name": "Estancia San Miguel",
    "department": "BOQUERON",
    "latitude": -22.4,
    "longitude": -60.1
  },
  "destination": {
    "establishment_id": 456,
    "type": "frigorifico",
    "name": "Frigorífico Neuland",
    "latitude": -22.66,
    "longitude": -60.12
  },
  "cattle_type": "fat",
  "heads": 45,
  "estimated_weight_per_head": 420,
  "pickup_date": "2026-07-20",
  "truck_type": "camion_ganadero",
  "flexibility": "un_dia",
  "notes": "Manejo suave requerido",
  "guides": [
    { "guide_number": 1, "heads": 40 },
    { "guide_number": 2, "heads": 5 }
  ]
}
```

## 3. Validaciones backend

El backend debe validar siempre, aunque el frontend también valide:

- El usuario autenticado es el solicitante.
- `origin.type` y `destination.type` existen en los catálogos activos.
- Los establecimientos seleccionados existen y están habilitados.
- `heads` es mayor que cero.
- `cattle_type` existe en catálogo.
- `estimated_weight_per_head` es positivo cuando se envía.
- La suma de `guides[].heads` coincide con `heads`.
- Cada guía tiene al menos una cabeza.
- Máximo por guía: 45 gordos o 80 desmamantes.
- Aplicar el límite de negocio de 40 cabezas facturables por camión cuando corresponda.
- `pickup_date` es obligatoria y no está en el pasado.
- `flexibility` y `truck_type` pertenecen a catálogos válidos.
- No confiar en distancia o precio enviados por el cliente.

El backend debe calcular:

- `distance_km`.
- `market_price`.
- Tarifa por kilómetro y cabeza.
- Distribución/validación final de guías.

## 4. Respuesta de creación y listado

`POST /api/shipment-requests/`, `GET /api/shipment-requests/` y `GET /api/shipment-requests/{id}/` deben mantener este contrato compatible con el frontend actual:

```json
{
  "id": 1001,
  "requester": {
    "id": 20,
    "email": "ganadero@example.com",
    "first_name": "Juan",
    "last_name": "Pérez"
  },
  "origin": "Estancia San Miguel",
  "origin_department": "BOQUERON",
  "origin_lat": "-22.400000",
  "origin_lng": "-60.100000",
  "origin_type": "campo",
  "destination": "Frigorífico Neuland",
  "destination_type": "frigorifico",
  "destination_lat": "-22.660000",
  "destination_lng": "-60.120000",
  "cattle_type": "fat",
  "cattle_type_label": "Gordos",
  "heads": 45,
  "estimated_weight_per_head": "420",
  "pickup_date": "2026-07-20",
  "distance_km": "35.4",
  "notes": "Manejo suave requerido",
  "flexibility": "un_dia",
  "status": "new",
  "market_price": "5310000",
  "guides": [
    { "id": 9001, "guide_number": 1, "heads": 40, "status": "available" },
    { "id": 9002, "guide_number": 2, "heads": 5, "status": "available" }
  ],
  "created_at": "2026-07-16T13:00:00Z",
  "updated_at": "2026-07-16T13:00:00Z"
}
```

El listado debe ser paginado:

```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": []
}
```

Filtros necesarios:

```http
GET /api/shipment-requests/?status=new
GET /api/shipment-requests/?status=active
GET /api/shipment-requests/?has_offers=false
GET /api/shipment-requests/?page=1&page_size=20
```

El solicitante solo puede ver sus propias solicitudes. El endpoint para transportistas debe tener permisos y filtros separados.

## 5. Estados y transiciones

Estados recomendados:

```text
draft
new
partial
in_negotiation
accepted
assigned
in_transit
delivered
completed
cancelled
expired
```

Transiciones mínimas:

```text
draft -> new
new -> partial | in_negotiation | expired | cancelled
partial -> in_negotiation | expired | cancelled
in_negotiation -> accepted | cancelled
accepted -> assigned | cancelled
assigned -> in_transit
in_transit -> delivered
delivered -> completed
```

No permitir cambios de estado arbitrarios mediante `PATCH`. Cada transición debe ser una acción autorizada y auditable.

## 6. Borradores

Recomendado:

```http
GET    /api/shipment-request-drafts/
POST   /api/shipment-request-drafts/
PATCH  /api/shipment-request-drafts/{id}/
POST   /api/shipment-request-drafts/{id}/publish/
DELETE /api/shipment-request-drafts/{id}/
```

Alternativa: utilizar `shipment_requests.status = "draft"` y permitir `PATCH` únicamente en ese estado.

## 7. Ofertas y negociación

```http
GET  /api/shipment-requests/{id}/offers/
POST /api/shipment-requests/{id}/offers/
GET  /api/offers/{id}/
POST /api/offers/{id}/counter/
POST /api/offers/{id}/accept/
POST /api/offers/{id}/reject/
```

Una oferta debe incluir:

```json
{
  "id": 5001,
  "shipment_request_id": 1001,
  "guide_id": 9001,
  "transporter": {
    "id": 30,
    "name": "Transporte González S.A.",
    "rating": 4.8,
    "trips_completed": 142,
    "verified": true
  },
  "vehicle": null,
  "driver": null,
  "amount": "5310000",
  "price_per_km_head": "410",
  "status": "pending",
  "created_at": "2026-07-16T13:10:00Z",
  "updated_at": "2026-07-16T13:10:00Z"
}
```

La negociación debe conservar historial en una tabla de eventos. No sobrescribir el precio anterior.

## 8. Aceptación, asignación y operación

```http
POST /api/offers/{id}/accept/
POST /api/shipment-requests/{id}/assign/
GET  /api/shipment-requests/{id}/assignment/
```

Al aceptar una oferta, ejecutar una transacción que:

1. Marque la oferta como `accepted`.
2. Rechace o retire ofertas incompatibles.
3. Actualice la guía correspondiente.
4. Actualice la solicitud.
5. Cree la asignación de vehículo/chofer.
6. Registre el evento de auditoría.

Para la operación del viaje:

```http
POST /api/trips/{id}/start/
POST /api/trips/{id}/arrive-origin/
POST /api/trips/{id}/load/
POST /api/trips/{id}/arrive-destination/
POST /api/trips/{id}/deliver/
POST /api/trips/{id}/complete/
```

## 9. Cancelación

```http
POST /api/shipment-requests/{id}/cancel/
```

Payload:

```json
{
  "reason": "changed_mind",
  "comment": "Ya no necesito el transporte",
  "evidence_document_ids": []
}
```

Respuesta:

```json
{
  "status": "cancelled",
  "review_required": true,
  "possible_fee_percent": 2
}
```

## 10. Migraciones sugeridas

### `shipment_requests`

```text
requester_id
status
origin_establishment_id nullable
origin_name
origin_type
origin_department
origin_latitude
origin_longitude
destination_establishment_id nullable
destination_name
destination_type
destination_latitude
destination_longitude
pickup_date
flexibility
truck_type nullable
heads
cattle_type
estimated_weight_per_head nullable
distance_km nullable
market_price nullable
notes nullable
published_at nullable
expires_at nullable
cancelled_at nullable
created_at
updated_at
```

Índices:

```text
(requester_id, status)
(status, pickup_date)
(origin_department, status)
(destination_type, status)
```

### `shipment_request_guides`

```text
id
shipment_request_id
guide_number
heads
status
senacsa_guide_number nullable
created_at
updated_at
```

Restricción: `unique(shipment_request_id, guide_number)`.

### `transport_offers`

```text
id
shipment_request_id
guide_id nullable
transporter_id
company_id nullable
vehicle_id nullable
driver_id nullable
amount
price_per_km_head nullable
status
expires_at nullable
created_at
updated_at
```

### `offer_events` y `shipment_request_events`

Ambas tablas deben conservar historial y auditoría:

```text
id
actor_id nullable
event_type
from_status nullable
to_status nullable
amount nullable
message nullable
metadata jsonb nullable
created_at
```

## 11. Permisos

### Solicitante

- Crear solicitudes.
- Ver sus propias solicitudes.
- Editar borradores.
- Cancelar según estado y reglas de negocio.
- Ver, aceptar y rechazar ofertas de sus solicitudes.

### Transportista

- Ver solicitudes publicadas compatibles con su perfil y documentación.
- Crear, editar o retirar sus propias ofertas mientras estén pendientes.
- No ver teléfonos del solicitante antes de la aceptación.

### Administrador

- Ver solicitudes, ofertas, eventos y cancelaciones.
- Revisar penalizaciones.
- Corregir estados mediante acciones auditadas.

## 12. Códigos HTTP y errores

```text
200 GET/PATCH exitoso
201 POST exitoso
204 DELETE exitoso
400 payload inválido
401 token ausente o inválido
403 sin permisos
404 recurso inexistente o fuera del usuario
409 transición o aceptación no válida
422 regla de negocio incumplida
```

Formato recomendado:

```json
{
  "detail": "No se puede aceptar esta oferta",
  "code": "OFFER_NOT_AVAILABLE",
  "errors": {
    "status": ["La oferta ya fue aceptada o retirada"]
  }
}
```

## 13. Prioridad

### P0 — Probar el wizard

1. Catálogos de tipos de establecimiento, ganado y camión.
2. Establecimientos SENACSA con coordenadas y filtros.
3. `POST /shipment-requests/`.
4. `GET /shipment-requests/`.
5. `GET /shipment-requests/{id}/`.

### P1 — Completar marketplace

1. Ofertas.
2. Contraofertas.
3. Aceptación.
4. Asignación de vehículo y chofer.
5. Eventos de estado.
6. Cancelación.

### P2 — Evolución

1. Borradores persistidos.
2. Notificaciones.
3. Expiración automática.
4. Cálculo avanzado de rutas.
5. Penalizaciones y revisión administrativa.

## Criterios de aceptación

- El wizard carga los selectores desde backend.
- La selección conserva id, tipo, nombre, departamento y coordenadas.
- Se puede crear una solicitud con una o dos guías.
- La suma de las guías coincide con el total.
- El backend calcula distancia y precio.
- La solicitud creada aparece en el listado.
- Un usuario no puede ver solicitudes de otro usuario.
- Las transiciones quedan auditadas.
- El backend rechaza payloads inválidos aunque el frontend los permita.

---

## Anexo: datos del paso 4 y contrato de producción

La pantalla final confirma que la solicitud debe conservar y procesar estos datos, además de origen, destino, nombres y coordenadas.

### Datos que deben llegar al backend

```json
{
  "origin": {
    "establishment_id": 94,
    "type": "frigorifico",
    "name": "Frigorifico Concepcion Mariano Roque Alonso",
    "department": "Central",
    "latitude": -25.1974300,
    "longitude": -57.5186400
  },
  "destination": {
    "establishment_id": 123,
    "type": "campo",
    "name": "CAMPO BRAVO",
    "department": "Paraguarí",
    "latitude": -25.1000000,
    "longitude": -57.5000000
  },
  "pickup_date": "2026-07-24",
  "flexibility": "tres_dias",
  "truck_type": "camion_ganadero",
  "cattle_type": "weaned",
  "heads": 100,
  "estimated_weight_per_head": 420,
  "notes": "Manejo suave",
  "guides": [
    { "guide_number": 1, "heads": 80 },
    { "guide_number": 2, "heads": 20 }
  ]
}
```

El nombre del origen y del destino no es decorativo: debe ser obligatorio, guardarse como snapshot y devolverse en el listado. Las coordenadas también deben guardarse como el punto final marcado por el usuario, incluso si el establecimiento catalogado tenía otro punto o no tenía coordenadas.

### Flexibilidad de fecha

Valores permitidos:

```text
exacta   => pickup_date_from = pickup_date_to = pickup_date
un_dia    => pickup_date - 1 día ... pickup_date + 1 día
tres_dias => pickup_date - 3 días ... pickup_date + 3 días
```

Persistir tanto la fecha solicitada como el rango calculado:

```text
pickup_date DATE NOT NULL
pickup_date_from DATE NOT NULL
pickup_date_to DATE NOT NULL
flexibility VARCHAR(32) NOT NULL
```

La fecha recibida debe tener formato ISO `YYYY-MM-DD`, ser una fecha real y no estar en el pasado. Por ejemplo, `1004-03-02` debe responder `422 PICKUP_DATE_INVALID` o `422 PICKUP_DATE_IN_PAST`; no debe llegar a una solicitud publicada.

### Peso y resumen

El frontend muestra peso promedio por animal y peso total. El backend debe guardar el valor fuente y puede devolver el total calculado:

```json
{
  "heads": 100,
  "estimated_weight_per_head": "420.00",
  "estimated_total_weight": "42000.00",
  "estimated_total_weight_unit": "kg"
}
```

Fórmula:

```text
estimated_total_weight = heads × estimated_weight_per_head
```

El total no debe aceptarse como dato confiable del cliente; se calcula en backend.

### Guías SENACSA

Para `weaned` el máximo es 80 cabezas por guía. Por eso 100 desmamantes requieren como mínimo:

```text
Guía 1: 80
Guía 2: 20
```

Para `fat` el máximo es 45 cabezas por guía. Validar siempre:

```text
sum(guides[].heads) == heads
1 <= guide.heads <= guide_max_heads(cattle_type)
```

La división de guías debe persistirse en `shipment_request_guides`, no solamente en el JSON de la solicitud. Si en el futuro una solicitud requiere más de dos guías, el backend debe soportar N guías aunque el frontend actual genere una o dos.

### Camiones

El dato seleccionado en la captura es:

```text
truck_type = camion_ganadero
max_heads = 40
```

La capacidad es por camión, no el máximo total de la solicitud:

```text
estimated_trucks = ceil(heads / truck_type.max_heads)
estimated_trucks = ceil(100 / 40) = 3
```

La solicitud puede tener 100 cabezas y requerir 3 camiones. El backend debe devolver `estimated_trucks`; no debe rechazar la solicitud únicamente porque `heads > 40`.

### Estimación de precio

La captura usa estos valores de referencia:

```text
distance_km = 400
heads = 100
price_per_km_head = 410 PYG
market_price = 400 × 100 × 410 = 16.400.000 PYG
```

En producción el endpoint recomendado es:

```http
POST /api/shipment-requests/estimate/
```

Request mínimo:

```json
{
  "origin": {
    "establishment_id": 94,
    "name": "Frigorifico Concepcion Mariano Roque Alonso",
    "latitude": -25.1974300,
    "longitude": -57.5186400
  },
  "destination": {
    "establishment_id": 123,
    "name": "CAMPO BRAVO",
    "latitude": -25.1000000,
    "longitude": -57.5000000
  },
  "cattle_type": "weaned",
  "heads": 100,
  "truck_type": "camion_ganadero"
}
```

Response mínima:

```json
{
  "origin_name": "Frigorifico Concepcion Mariano Roque Alonso",
  "destination_name": "CAMPO BRAVO",
  "distance_km": "400.00",
  "heads": 100,
  "estimated_trucks": 3,
  "price_per_km_head": "410.00",
  "market_price": "16400000.00",
  "currency": "PYG",
  "pricing_version": "2026-01",
  "is_reference_price": true
}
```

La tarifa `410` y la distancia demo `400` sirven para probar la interfaz, pero no deben quedar hardcodeadas en producción. La tarifa debe salir de configuración o de una tabla versionada. Al crear la solicitud, guardar la distancia, tarifa, precio, moneda y versión de cálculo como snapshot.

### Respuesta completa esperada de creación

```json
{
  "id": 1001,
  "status": "new",
  "origin": "Frigorifico Concepcion Mariano Roque Alonso",
  "origin_establishment_id": 94,
  "origin_type": "frigorifico",
  "origin_department": "Central",
  "origin_lat": "-25.1974300",
  "origin_lng": "-57.5186400",
  "destination": "CAMPO BRAVO",
  "destination_establishment_id": 123,
  "destination_type": "campo",
  "destination_department": "Paraguarí",
  "destination_lat": "-25.1000000",
  "destination_lng": "-57.5000000",
  "pickup_date": "2026-07-24",
  "pickup_date_from": "2026-07-21",
  "pickup_date_to": "2026-07-27",
  "flexibility": "tres_dias",
  "truck_type": "camion_ganadero",
  "estimated_trucks": 3,
  "cattle_type": "weaned",
  "cattle_type_label": "Desmamantes",
  "heads": 100,
  "estimated_weight_per_head": "420.00",
  "estimated_total_weight": "42000.00",
  "distance_km": "400.00",
  "price_per_km_head": "410.00",
  "market_price": "16400000.00",
  "currency": "PYG",
  "pricing_version": "2026-01",
  "notes": "Manejo suave",
  "guides": [
    { "id": 9001, "guide_number": 1, "heads": 80, "status": "available" },
    { "id": 9002, "guide_number": 2, "heads": 20, "status": "available" }
  ],
  "created_at": "2026-07-17T22:00:00Z",
  "updated_at": "2026-07-17T22:00:00Z"
}
```

### Política de cancelación

La pantalla comunica una posible penalización del 2% después de que un transportista acepta el viaje sin causa justificada. El backend debe calcularla, no recibirla desde el frontend:

```text
cancellation_fee_percent = 2.00
cancellation_fee = accepted_transport_amount × 0.02
```

El endpoint debe ser:

```http
POST /api/shipment-requests/{id}/cancel/
```

```json
{
  "reason": "changed_mind",
  "comment": "Ya no necesito el transporte"
}
```

Respuesta:

```json
{
  "status": "cancelled",
  "review_required": true,
  "possible_fee_percent": "2.00",
  "possible_fee": "328000.00",
  "currency": "PYG"
}
```

La solicitud debe conservar el precio de referencia y el monto de la oferta aceptada por separado. La penalización no se calcula sobre el precio de referencia si ya existe un monto final aceptado.

### Migraciones mínimas

Crear o adaptar estas tablas:

```text
shipment_requests
  requester_id, status
  origin_establishment_id, origin_type, origin_name
  origin_department, origin_latitude, origin_longitude
  destination_establishment_id, destination_type, destination_name
  destination_department, destination_latitude, destination_longitude
  pickup_date, pickup_date_from, pickup_date_to, flexibility
  truck_type, estimated_trucks
  cattle_type, heads, estimated_weight_per_head, estimated_total_weight
  distance_km, price_per_km_head, market_price, currency, pricing_version
  notes, published_at, cancelled_at, created_at, updated_at

shipment_request_guides
  shipment_request_id, guide_number, heads, status
  UNIQUE(shipment_request_id, guide_number)

transport_offers
  shipment_request_id, guide_id, transporter_id
  amount, status, accepted_at, created_at, updated_at

shipment_request_events
  shipment_request_id, actor_id, event_type
  from_status, to_status, metadata, created_at
```

Tipos numéricos recomendados:

```text
latitude/longitude: DECIMAL(10,7)
distance_km: DECIMAL(10,2)
price/amount: DECIMAL(18,2)
weight: DECIMAL(10,2)
heads/estimated_trucks: INTEGER
```

Índices recomendados:

```text
(requester_id, status, created_at DESC)
(status, pickup_date_from, pickup_date_to)
(origin_establishment_id)
(destination_establishment_id)
(destination_type, status)
```

### Reglas de permisos y transacciones

- `requester_id` sale del token, nunca del payload.
- El usuario solo ve y modifica sus solicitudes.
- `mi_establecimiento` debe pertenecer al usuario autenticado.
- Crear solicitud, crear guías, calcular precio y registrar evento debe ocurrir en una transacción.
- Aceptar una oferta debe bloquear la solicitud para impedir dos aceptaciones simultáneas.
- No aceptar un `PATCH` que cambie directamente `status`, `market_price`, `distance_km`, `requester_id` o los montos calculados.
- Cada transición debe registrar un evento de auditoría.

### Errores que el frontend necesita interpretar

```json
{
  "detail": "La ubicación de origen requiere una referencia en el mapa",
  "code": "LOCATION_COORDINATES_REQUIRED",
  "errors": {
    "origin.latitude": ["El campo es obligatorio"],
    "origin.longitude": ["El campo es obligatorio"]
  }
}
```

Códigos recomendados:

```text
LOCATION_NAME_REQUIRED
LOCATION_COORDINATES_REQUIRED
LOCATION_COORDINATES_INVALID
ESTABLISHMENT_NOT_FOUND
ESTABLISHMENT_NOT_ALLOWED
CATALOG_VALUE_INVALID
PICKUP_DATE_INVALID
PICKUP_DATE_IN_PAST
GUIDES_SUM_MISMATCH
GUIDE_LIMIT_EXCEEDED
REQUEST_STATE_INVALID
OFFER_NOT_AVAILABLE
```

### Cambio pendiente en el frontend

El frontend actual ya envía nombre, tipo, id y coordenadas dentro de `origin` y `destination`, y permite seleccionar `camion_ganadero` y `tres_dias`. Sin embargo, la tarjeta de estimación todavía usa valores demo (`400 km` y `410 PYG/km/cabeza`). Para producción debe consultar `POST /api/shipment-requests/estimate/` y renderizar la respuesta del backend, incluyendo `estimated_trucks`, rango de fechas y precio de referencia.
