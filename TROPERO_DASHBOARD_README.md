# Tropero - Dashboard de Transporte de Ganado en Paraguay

## Descripción General

Tropero es una plataforma marketplace de transporte de ganado en Paraguay que conecta ganaderos con empresas de transporte y choferes. Similar a Uber Freight pero especializado en transporte de ganado.

## Estructura de Dashboards

La aplicación incluye 4 dashboards separados para cada tipo de usuario:

### 1. Dashboard de Ganadero/Rancher (`RancherDashboard.tsx`)

**Rol:** Productor ganadero que necesita transportar ganado

**Características principales:**
- Vista de estadísticas: transportes activos, solicitudes abiertas, completados, costos mensuales
- **Flujo "Nuevo envío"** (característica principal):
  - Paso 1: Información de origen (ubicación, departamento, fecha de carga)
  - Paso 2: Destino (ubicación, tipo de destino)
  - Paso 3: Detalles del ganado (cantidad, peso, notas especiales)
  - Paso 4: Preferencias de transporte (tipo de camión, ventana flexible)
  - Paso 5: Confirmación con advertencia de cancelación (tarifa del 2%)
- Panel de transportes activos con estados: en tránsito, aceptado, esperando transportista
- Acciones rápidas: Nuevo envío, Historial, Reportes, Soporte

### 2. Dashboard de Empresa de Transporte (`EmpresaDashboard.tsx`)

**Rol:** Compañía de transporte ganadero con flota de vehículos

**Características principales:**
- Estadísticas: viajes activos, conductores disponibles, viajes completados, ingresos mensuales
- Acciones rápidas:
  - Gestionar flota
  - Gestionar conductores
  - Ver viajes disponibles (acción principal)
  - Reportes
- Panel de viajes disponibles en la región

### 3. Dashboard de Owner-Operator (`OwnerOperatorDashboard.tsx`)

**Rol:** Transportista independiente con camión propio

**Características principales:**
- Estadísticas: viajes disponibles, viaje actual, viajes completados, ingresos mensuales
- Acciones rápidas:
  - Ver viajes disponibles (acción principal)
  - Historial de viajes
  - Ingresos
  - Documentos
- Panel de viaje actual con detalles en tiempo real
- Lista de viajes disponibles en la zona

### 4. Dashboard de Chofer de Empresa (`DriverDashboard.tsx`)

**Rol:** Conductor empleado de una empresa de transporte

**Características principales:**
- Estadísticas: viaje actual, viajes asignados, viajes completados, horas trabajadas
- Acciones rápidas:
  - Viaje actual (acción principal)
  - Viajes asignados
  - Estado del transporte
  - Documentos
- Panel de viaje actual con contacto del productor
- Lista de próximos viajes asignados

## Flujos de Registro (Signup)

Cada tipo de usuario tiene su propio flujo de registro personalizado:

### Ganadero (4 pasos)
1. Información básica (nombre, teléfono, email)
2. Información del establecimiento (nombre, ubicación, tamaño)
3. Documentos (RUC, título de propiedad, certificados)
4. Método de pago preferido

### Empresa de Transporte (4 pasos)
1. Información básica (nombre empresa, RUC, contacto)
2. Flota y operaciones (cantidad de camiones, regiones)
3. Documentos (RUC, permisos de transporte, seguro)
4. Método de pago

### Owner-Operator (4 pasos)
1. Información personal (nombre, cédula, RUC opcional)
2. Información del vehículo (chapa, modelo, capacidad)
3. Documentos (licencia, cédula verde, permisos)
4. Método de pago

### Chofer de Empresa (3 pasos)
1. Información personal (nombre, cédula, contacto emergencia)
2. Empresa asignada (código invitación o datos manuales)
3. Documentos (licencia, cédula)

## Branding y Diseño

**Paleta de colores:**
- Negro y blanco como colores primarios
- Verde pasto: `#2D5016` (acento principal)
- Marrón tierra: `#8B4513` (acento secundario)

**Logo:** Silueta de perfil de ganado Cebú

**Estilo visual:**
- Interfaz SaaS moderna y minimalista
- Estética de logística/agricultura
- Card-based UI
- Indicadores de estado simples
- Tipografía moderna
- Layout mobile-friendly

## Características Técnicas

**Componentes principales:**
- `/src/app/components/TroperoApp.tsx` - Componente principal que maneja la navegación
- `/src/app/components/dashboards/` - Directorio con todos los dashboards
- `/src/app/components/tropero-v2/` - Componentes de signup y autenticación
- `/src/app/components/ui/` - Componentes UI reutilizables (shadcn/ui)

**Tecnologías:**
- React + TypeScript
- Tailwind CSS v4
- Radix UI (componentes de UI)
- Lucide React (iconos)

## Localización

**Idioma:** Español (Paraguay)

**Moneda:** Guaraníes (₲)

**Ciudades reales paraguayas incluidas:**
- Asunción
- Filadelfia
- Loma Plata
- Neuland
- Concepción
- Villa Hayes
- Caaguazú
- San Pedro

## Navegación y Flujo de Usuario

1. **Pantalla de Bienvenida** → Usuario elige "Registrarse" o "Iniciar sesión"
2. **Selector de tipo de cuenta** → Usuario elige su rol
3. **Flujo de registro** → Completa 3-4 pasos según el rol
4. **Pantalla de confirmación** → Cuenta lista
5. **Dashboard** → El usuario accede a su dashboard personalizado según rol

## Demo

Para demostrar la aplicación:
- Click en "Iniciar sesión" para ver directamente el Dashboard de Ganadero
- Click en "Registrarse" para explorar los flujos de signup de cada rol
- Dentro del Dashboard de Ganadero, hacer click en "Nuevo envío" para ver el flujo completo de solicitud de transporte

## Notas de Implementación

- **FRONTEND DEMO ONLY**: Esta es una demostración frontend sin lógica de backend compleja
- Los datos son simulados y estáticos para propósitos de demo
- Ideal para presentaciones a inversionistas, demos de producto, o handoff a desarrolladores
