# PR: perfil, recuperación de contraseña y nueva solicitud de transporte

## Título sugerido

`feat: agregar solicitudes de modificación, reset password y solicitud de transporte`

## Resumen

Este Pull Request incorpora tres flujos principales del frontend, organizados con React Router y estructura feature-based:

1. Solicitudes de modificación desde el perfil del usuario.
2. Recuperación y cambio de contraseña mediante enlace con token.
3. Creación de una nueva solicitud de transporte mediante un wizard de cuatro pasos.

También se incluyen la migración de las pantallas principales a React Router, la separación de módulos por feature y la infraestructura necesaria para el despliegue SPA en Railway.

## 1. Solicitudes de modificación desde perfil

### Funcionalidad

El usuario puede consultar y actualizar la información de su perfil y establecimiento. Los cambios sensibles no se aplican directamente: generan una solicitud de revisión para que un administrador la apruebe o rechace.

### Campos que requieren aprobación

- RUC.
- Razón social / nombre del propietario.
- Departamento.
- Ciudad / distrito.

Cada modificación sensible conserva:

- Establecimiento relacionado.
- Campo modificado.
- Valor anterior.
- Valor nuevo.
- Estado de la solicitud.
- Motivo de rechazo, cuando corresponda.

### Comportamiento

- Los campos sensibles se comparan contra el valor actual antes de crear una solicitud.
- Los valores sin cambios no generan solicitudes duplicadas.
- Los cambios no sensibles pueden actualizarse directamente.
- El usuario puede consultar sus solicitudes pendientes, aprobadas y rechazadas.
- Cuando una solicitud es rechazada, se muestra el motivo informado por el administrador.
- Se contemplan respuestas antiguas del backend que devuelvan el motivo como `reason`, `rejectionReason` o dentro del payload.

### Endpoints utilizados

```text
GET   /api/auth/me/
PATCH /api/auth/me/

GET   /api/users/establishments/
POST  /api/users/establishments/
PATCH /api/users/establishments/{id}/

GET   /api/user-change-requests/
GET   /api/user-change-requests/all/
GET   /api/user-change-requests/{id}/
POST  /api/user-change-requests/
PATCH /api/user-change-requests/{id}/
```

### Estructura feature-based

```text
src/features/my-profile/
src/features/my-establishment/
src/features/my-change-requests/
src/features/my-documents/
src/features/account/ganadero/
```

## 2. Recuperación y reset de contraseña

### Funcionalidad

Se agregó una ruta pública compatible con los enlaces enviados por email:

```text
/reset-password?token=<token>
```

### Flujo

1. El usuario solicita recuperar su contraseña.
2. El backend genera un token y envía el enlace.
3. React Router carga `ResetPasswordPage`.
4. La página obtiene el token mediante `useSearchParams`.
5. Se muestra el formulario de nueva contraseña.
6. El frontend envía el token y la contraseña al backend.
7. Al finalizar, se muestra la confirmación y el enlace para iniciar sesión.

### Validaciones

- El token es obligatorio.
- La contraseña debe tener al menos 8 caracteres.
- La confirmación debe coincidir con la nueva contraseña.
- Se bloquea el botón durante la solicitud.
- Se informa el error devuelto por el backend.
- Sin token, se muestra un estado de enlace inválido.

### Endpoint

```text
POST /api/auth/password-reset/
```

Payload:

```json
{
  "token": "<token>",
  "password": "<nueva contraseña>"
}
```

### Archivos principales

```text
src/app/router/pages/ResetPasswordPage.tsx
src/app/components/tropero-v2/ResetPassword.tsx
src/app/router/Router.tsx
```

## 3. Nueva solicitud de transporte

### Funcionalidad

Se implementó el wizard de creación de solicitud de transporte en cuatro pasos:

1. Origen.
2. Destino.
3. Detalles del ganado.
4. Confirmación y publicación.

### Origen y destino

El usuario puede seleccionar establecimientos desde los listados del backend o cargar una ubicación libre.

Para ubicaciones libres se exige una referencia en el mapa. El mapa permite:

- Buscar una ubicación.
- Marcar coordenadas haciendo click.
- Mover y ajustar la referencia.
- Mostrar latitud y longitud seleccionadas.
- Centrar el mapa en las coordenadas del establecimiento elegido.
- Adaptarse a desktop y mobile.

Cuando el establecimiento seleccionado ya posee coordenadas, el frontend las utiliza automáticamente para ubicar el marcador.

### Catálogos y establecimientos

```text
GET /api/catalogs/establishment-types/
GET /api/catalogs/cattle-types/
GET /api/catalogs/truck-types/
GET /api/senacsa/establishments/
```

Ejemplo para frigoríficos:

```text
GET /api/senacsa/establishments/?type=frigorifico
```

El frontend normaliza respuestas con nombres como `name`, `establishmentName`, `latitude`, `longitude`, `lat` y `lng` para evitar errores de renderizado en los autocompletados y mapas.

### Detalles del ganado

- Cantidad de cabezas.
- Tipo de ganado.
- Peso aproximado por animal.
- Notas especiales de manejo.
- Tipo de camión preferido.
- Flexibilidad de fecha.
- División automática de guías cuando se supera el máximo permitido.

La fecha de carga no puede ser menor que la fecha actual.

### Confirmación

La pantalla final muestra:

- Origen y destino.
- Fecha de carga.
- Cantidad y tipo de ganado.
- Peso total estimado.
- Notas.
- Tipo de camión.
- Flexibilidad de fecha.
- Distancia estimada.
- Tarifa estimada.
- Total estimado.

### Creación de solicitud

```text
POST /api/shipment-requests/
```

Payload esperado:

```json
{
  "origin": {
    "type": "frigorifico",
    "establishment_id": 94,
    "name": "Frigorifico Concepcion Mariano Roque Alonso",
    "latitude": -25.19743,
    "longitude": -57.51864
  },
  "destination": {
    "type": "campo",
    "name": "Campo Bravo",
    "latitude": -25.3,
    "longitude": -57.4
  },
  "pickup_date": "2026-07-24",
  "cattle_type": "fat",
  "cattle_type_label": "Gordos",
  "heads": 48,
  "estimated_weight_per_head": 350,
  "truck_type": "camion_ganadero",
  "flexibility": "un_dia",
  "notes": "manejo suave requerido",
  "guides": [
    {
      "guide_number": 1,
      "heads": 45
    },
    {
      "guide_number": 2,
      "heads": 3
    }
  ]
}
```

### Estructura feature-based

```text
src/features/transport-requests/api/
src/features/transport-requests/components/
src/features/transport-requests/hooks/
src/features/transport-requests/types/
src/features/transport-requests/utils/
```

## 4. React Router y navegación

Se incorporaron rutas públicas, protegidas y de administración:

```text
/
/login
/forgot-password
/reset-password
/register
/register/ganadero/:step
/account/ready
/dashboard
/account
/transport-requests/new
/transport-marketplace
/admin
```

Las rutas que requieren sesión utilizan `ProtectedRoute`. Las rutas administrativas utilizan `RoleRoute`.

## 5. Soporte de despliegue SPA

Se agregaron:

- `Dockerfile` multi-stage para build con Node y serving con Nginx.
- `nginx.conf` con fallback hacia `index.html`.
- Configuración para que las rutas directas de React Router funcionen en Railway.

La configuración debe permitir abrir directamente URLs como:

```text
/reset-password?token=<token>
/transport-requests/new
/transport-marketplace
```

## Archivos y módulos principales

```text
src/app/router/
src/app/routes/
src/features/auth/
src/features/account/
src/features/my-profile/
src/features/my-establishment/
src/features/my-change-requests/
src/features/my-documents/
src/features/transport-requests/
src/features/shipments/
src/features/transport-marketplace/
src/features/admin/
Dockerfile
nginx.conf
```

## Compatibilidad requerida del backend

El backend debe confirmar que:

- `PATCH /api/users/establishments/{id}/` actualiza solamente los campos permitidos directamente.
- Los campos sensibles generan solicitudes de aprobación.
- `POST /api/user-change-requests/` acepta `change_type` y `payload`.
- `PATCH /api/user-change-requests/{id}/` acepta `status` y `rejection_reason`.
- Las respuestas de solicitudes rechazadas incluyen el motivo del administrador.
- `GET /api/senacsa/establishments/?type=frigorifico` devuelve nombre, id, latitud y longitud.
- `POST /api/shipment-requests/` acepta `origin`, `destination`, `cattle_type_label`, guías y coordenadas.
- El backend valida que `pickup_date` no esté en el pasado.
- El backend calcula o devuelve `distance_km` y `market_price` cuando corresponda.

## Pruebas realizadas

```bash
npm run typecheck
npm run build
git diff --check
```

## Checklist funcional

- [ ] Abrir perfil y consultar datos actuales.
- [ ] Modificar RUC y confirmar que se crea una solicitud.
- [ ] Modificar razón social y confirmar que se crea una solicitud.
- [ ] Modificar departamento y confirmar que se crea una solicitud.
- [ ] Modificar ciudad/distrito y confirmar que se crea una solicitud.
- [ ] Rechazar una solicitud desde admin y verificar que el usuario vea el motivo.
- [ ] Abrir reset password con token en query param.
- [ ] Validar contraseña corta y confirmación diferente.
- [ ] Completar origen usando un establecimiento con coordenadas.
- [ ] Completar origen usando ubicación libre y marcar el mapa.
- [ ] Completar destino usando un establecimiento del listado.
- [ ] Completar destino usando ubicación libre y marcar el mapa.
- [ ] Verificar que una fecha pasada no pueda enviarse.
- [ ] Verificar división de guías.
- [ ] Crear una solicitud de transporte.
- [ ] Verificar la pantalla de confirmación.
- [ ] Probar los flujos en desktop y mobile.
- [ ] Probar las rutas directamente desde el navegador.

## Despliegue

Los cambios se encuentran en:

```text
feature/Migrate-to-react-router
```

Si Railway despliega `main`, es necesario fusionar este branch hacia `main` y hacer push para activar un nuevo deployment.

Después del deploy:

1. Confirmar que las rutas directas devuelven la SPA.
2. Confirmar que se sirve un bundle nuevo.
3. Probar con un token de recuperación generado recientemente.
4. Verificar los endpoints desde Network.
5. Hacer hard refresh si existe cache del bundle anterior.

## Riesgos y consideraciones

- El branch contiene una migración amplia hacia React Router; se debe revisar el diff completo antes de fusionar.
- Las solicitudes sensibles dependen de que el backend persista correctamente `old`, `new` y `rejection_reason`.
- Los tokens de recuperación no deben compartirse ni persistirse en logs.
- Las ubicaciones libres requieren coordenadas antes de avanzar o publicar la solicitud.
