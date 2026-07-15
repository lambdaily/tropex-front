# Documentos de Usuario - TROPEX

## Descripción General

El sistema de documentos de TROPEX permite a los usuarios subir documentos requeridos (RUC, SENACSA, mapa de acceso, etc.) para obtener la verificación de su cuenta. Los archivos se almacenan en Cloudflare R2 y los metadatos se guardan en una tabla dedicada `UserDocument` en el backend.

## Arquitectura

```
┌─────────────┐       ┌──────────────┐       ┌─────────────────┐
│  Frontend   │       │   Backend    │       │  Cloudflare R2  │
│  (React)    │       │   (Django)   │       │                 │
└─────────────┘       └──────────────┘       └─────────────────┘
       │                      │                       │
       │ 1. GET presigned URL │                       │
       ├─────────────────────►│                       │
       │                      │                       │
       │ 2. URL pre-firmada   │                       │
       │◄─────────────────────┤                       │
       │                      │                       │
       │ 3. PUT archivo                                │
       ├──────────────────────────────────────────────►│
       │                      │                       │
       │ 4. POST metadata     │                       │
       ├──────────────────────►│                       │
       │                      │ 5. Guardar en DB      │
       │                      │    (UserDocument)     │
       │                      │                       │
       │ 6. GET /auth/me/ (con uploaded_documents)    │
       │◄──────────────────────┤                       │
       │                      │                       │
       │ 7. Ver documento (URL pública)               │
       ├──────────────────────────────────────────────►│
       │◄─────────────────────                          │
```

## Modelo de Datos: UserDocument

El modelo `UserDocument` está definido en `core/users/models.py` y representa un documento subido por un usuario. Se eligió un modelo dedicado en lugar de un campo `JSONField` en el modelo `User` por las siguientes razones:

- Schema validado con `choices` para `document_type` y `status`
- Unique constraint `(user, document_type)` para evitar duplicados
- Relación FK con `User` para queries eficientes
- Campos auditables: `reviewed_by`, `reviewed_at`, `rejection_reason`
- Status workflow: `pending` → `approved` / `rejected`
- Soporte para almacenamiento local (`file`) y en R2 (`object_key`, `public_url`)
- Timestamps automáticos de creación/modificación

### Estructura

```python
class UserDocument(models.Model):
    """Documento subido por un usuario (RUC, SENACSA, mapa de acceso, etc.)."""

    class DocumentType(models.TextChoices):
        RUC = "ruc", "Constancia de RUC"
        SENACSA = "senacsa", "Registro SENACSA"
        MAPA_ACCESO = "mapa_acceso", "Mapa de acceso al establecimiento"
        CEDULA = "cedula", "Cédula de identidad"
        LICENCIA = "licencia", "Licencia de conducir"

    class Status(models.TextChoices):
        PENDING = "pending", "Pendiente de revisión"
        APPROVED = "approved", "Aprobado"
        REJECTED = "rejected", "Rechazado"

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="uploaded_documents")
    document_type = models.CharField(max_length=20, choices=DocumentType.choices)
    object_key = models.CharField(max_length=500, blank=True)
    public_url = models.CharField(max_length=1000, blank=True)
    original_filename = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField(default=0)
    content_type = models.CharField(max_length=100, blank=True)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING
    )
    reviewed_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name="reviewed_documents",
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "users_userdocument"
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "document_type"],
                name="unique_user_document_type",
            )
        ]
        indexes = [
            models.Index(fields=["user", "document_type"]),
            models.Index(fields=["status"]),
        ]
```

### Extensibilidad para Nuevos Documentos

**El sistema está diseñado para ser extensible.** A medida que el negocio crezca, se pueden agregar nuevos tipos de documentos de dos formas:

#### 1. Agregar al enum `DocumentType` (código)

```python
class DocumentType(models.TextChoices):
    RUC = "ruc", "Constancia de RUC"
    SENACSA = "senacsa", "Registro SENACSA"
    MAPA_ACCESO = "mapa_acceso", "Mapa de acceso al establecimiento"
    CEDULA = "cedula", "Cédula de identidad"
    LICENCIA = "licencia", "Licencia de conducir"
    # Futuros tipos de documentos:
    ANTECEDENTES_POLICIALES = "antecedentes_policiales", "Antecedentes policiales"
    CERTIFICADO_BANCARIO = "certificado_bancario", "Certificado bancario"
    FOTO_PERFIL = "foto_perfil", "Foto de perfil"
    CONTRATO_SOCIEDAD = "contrato_sociedad", "Contrato de sociedad"
    HABILITACION_MUNICIPAL = "habilitacion_municipal", "Habilitación municipal"
    CERTIFICADO_SENAVE = "certificado_senave", "Certificado SENAVE"
    SEGURO_VEHICULO = "seguro_vehiculo", "Seguro del vehículo"
    REVISION_TECNICA = "revision_tecnica", "Revisión técnica vehicular"
```

#### 2. Configuración dinámica desde el Admin

Para evitar hardcodear en el código los documentos requeridos por rol, se puede crear un modelo `RequiredDocument` que el admin pueda gestionar:

```python
class RequiredDocument(models.Model):
    """Define qué documentos son requeridos para cada rol."""

    class Meta:
        db_table = "users_requireddocument"

    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name="required_documents")
    document_type = models.CharField(max_length=20, choices=UserDocument.DocumentType.choices)
    description = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["role", "document_type"],
                name="unique_required_doc_per_role",
            )
        ]
```

**Flujo de uso:**
1. El admin entra al Django Admin → `RequiredDocument` → Crea los documentos requeridos para cada rol
2. Ejemplo: Para `Role(ganadero)` requiere: `ruc`, `senacsa`, `mapa_acceso`
3. El frontend consulta `GET /api/required-documents/?role=ganadero` para saber qué mostrar
4. El `MyDocumentsSection` se construye dinámicamente con la respuesta del backend

## Backend

### Endpoints

| Método | Path | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/api/auth/me/` | JWT | Usuario actual (incluye `uploaded_documents[]`) |
| `GET` | `/api/user-documents/` | JWT | Lista mis documentos |
| `POST` | `/api/user-documents/` | JWT | Crea metadata después de subir a R2 |
| `GET` | `/api/user-documents/{id}/` | JWT | Detalle (incluye URL pública) |
| `PATCH` | `/api/user-documents/{id}/` | Admin | Cambiar status (approved/rejected) |
| `DELETE` | `/api/user-documents/{id}/` | JWT | Eliminar (también de R2) |
| `POST` | `/api/uploads/presigned-url/` | JWT | Obtener URL pre-firmada para subir a R2 |
| `DELETE` | `/api/uploads/object/` | Admin | Eliminar objeto de R2 (admin only) |

### Flujo Completo

1. **Frontend pide presigned URL:**
   ```http
   POST /api/uploads/presigned-url/
   Body: { "document_type": "ruc", "filename": "mi_ruc.pdf", "content_type": "application/pdf" }
   Response: { "upload_url": "...", "object_key": "documents/ruc/10/...", "public_url": "..." }
   ```

2. **Frontend sube archivo directo a R2:**
   ```http
   PUT https://...r2.cloudflarestorage.com/...
   Body: <binary>
   ```

3. **Frontend guarda metadata:**
   ```http
   POST /api/user-documents/
   Body: {
     "document_type": "ruc",
     "object_key": "documents/ruc/10/...",
     "public_url": "https://...",
     "original_filename": "mi_ruc.pdf",
     "file_size": 254259,
     "content_type": "application/pdf"
   }
   ```

4. **Frontend lista mis documentos:**
   ```http
   GET /api/auth/me/
   Response: {
     ...
     "uploaded_documents": [
       { "id": 1, "document_type": "ruc", "status": "pending", ... }
     ]
   }
   ```

5. **Admin aprueba:**
   ```http
   PATCH /api/user-documents/1/
   Body: { "status": "approved", "reviewed_by": 1 }
   ```

### Archivos Backend

- `core/users/models.py` - Modelo `UserDocument` y `UserDocument.DocumentType`
- `core/users/serializers.py` - `UserDocumentSerializer` y actualizado `UserSerializer`
- `core/users/views.py` - `UserDocumentListCreateView` y `UserDocumentDetailView`
- `core/users/urls.py` - Rutas `/api/user-documents/`
- `core/users/admin.py` - `UserDocumentAdmin` con filtros y búsqueda
- `core/users/migrations/0009_userdocument.py` - Migración inicial
- `core/users/migrations/0010_*.py` - Cambio `public_url` de URLField a CharField
- `core/uploads/` - App de uploads con `PresignedUrlView`, `DeleteObjectView` y servicios R2

### Middleware de Traducción de Errores

El backend tiene un middleware (`core/core/middleware.py`) que traduce automáticamente los mensajes de error de inglés a español. Por ejemplo, el error `{"public_url": ["Enter a valid URL."]}` se muestra como `{"public_url": ["Ingresa una URL válida."]}` en el frontend.

## Frontend

### Estructura de la Feature

```
src/features/my-documents/
├── api/
│   └── myDocumentsApi.ts          # getAll, upload, delete
├── hooks/
│   └── useMyDocuments.ts          # useMyDocuments, useUploadDocument, useDeleteDocument
├── types/
│   └── document.types.ts          # DocumentType, DocumentStatus, DOCUMENT_CONFIG
├── components/
│   ├── MyDocumentsSection.tsx     # Componente principal
│   └── DocumentViewerModal.tsx    # Modal para ver sin descargar
└── index.ts                       # Exports públicos
```

### Componentes

#### `MyDocumentsSection`

Componente principal que muestra:
- Header dinámico (verificado/pendiente)
- Lista de documentos requeridos (RUC, SENACSA, mapa de acceso)
- Cada documento con estado (subido/pendiente)
- Botones de ver, descargar y eliminar
- Drag & drop para subir

#### `DocumentViewerModal`

Modal con visor para:
- **PDFs**: Iframe nativo con controles de zoom
- **Imágenes**: Visor con zoom in/out/reset
- **Otros archivos**: Mensaje de fallback con botón de descarga

### Mapeo de Tipos de Documento

El frontend usa nombres semánticos (`mapa_acceso`, `licencia`) pero el endpoint `/api/uploads/presigned-url/` espera valores específicos del backend. El mapeo está en `myDocumentsApi.ts`:

```typescript
const DOCUMENT_TYPE_BACKEND_MAP: Record<DocumentType, string> = {
  ruc: 'ruc',
  senacsa: 'senacsa',
  mapa_acceso: 'access_map',
  cedula: 'cedula',
  licencia: 'vehicle_photo',
};
```

### Integración con GanaderoAccount

```typescript
// src/features/account/ganadero/components/GanaderoAccount.tsx
const renderDocumentos = () => <MyDocumentsSection />;
```

Reemplaza el `renderDocumentos` anterior que tenía state local.

## Cloudflare R2

### Configuración

Variables de entorno requeridas:
```
R2_ACCOUNT_ID=21b8d039880220ade55550f9fc76ecd8
R2_ACCESS_KEY_ID=<tu_access_key>
R2_SECRET_ACCESS_KEY=<tu_secret_key>
R2_BUCKET_NAME=tropex
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_PUBLIC_URL=https://pub-<hash>.r2.dev
```

### Estructura de Archivos en R2

```
tropex/
└── documents/
    ├── ruc/
    │   └── {user_id}/
    │       └── {timestamp}-{filename}
    ├── senacsa/
    │   └── {user_id}/
    │       └── {timestamp}-{filename}
    ├── mapa_acceso/
    │   └── {user_id}/
    │       └── {timestamp}-{filename}
    ├── cedula/
    │   └── {user_id}/
    │       └── {timestamp}-{filename}
    └── licencia/
        └── {user_id}/
            └── {timestamp}-{filename}
```

## Tipos de Documento Soportados

- **PDF**: `application/pdf`
- **Imágenes**: `image/jpeg`, `image/jpg`, `image/png`, `image/webp`

**Tamaño máximo**: 10 MB

## Pendientes / Roadmap

- [ ] Modelo `RequiredDocument` para gestionar documentos por rol desde el admin
- [ ] Endpoint `GET /api/required-documents/?role=<slug>` para consultar requisitos
- [ ] Frontend dinámico basado en `RequiredDocument` (no hardcoded)
- [ ] Notificación al admin cuando se sube un documento
- [ ] Notificación al usuario cuando se aprueba/rechaza
- [ ] Historial de revisiones de un documento
- [ ] Versionado de documentos (reemplazo mantiene historial)
- [ ] Soporte para más tipos de archivo (DOCX, XLSX, PDF firmados)
- [ ] Integración con SIGOR para validación automática de RUC
