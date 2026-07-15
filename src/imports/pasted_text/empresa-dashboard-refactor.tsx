En el archivo src/app/components/dashboards/EmpresaDashboard.tsx, aplicá los siguientes cambios manteniendo toda la funcionalidad, datos y lógica existente.

1. Reordenar el Panel Principal — Acciones rápidas primero:
En la vista currentView === 'dashboard', reordenás las secciones así:

Primero: Bienvenida y título (igual que ahora)
Segundo: Acciones rápidas
Tercero: Viajes disponibles (lista desplegada, mismo formato que transportes activos del Ganadero)
Eliminá completamente el bloque del mapa de ubicación de camiones — ese contenido pasa a Reportes
Eliminá el bloque de estadísticas de la vista principal — también pasan a Reportes

2. Reordenar Acciones rápidas — Ver viajes disponibles primero:
En el grid de acciones rápidas, reordenás los botones así:

1ro: "Ver viajes disponibles" (verde, ya existente)
2do: "Gestionar flota"
3ro: "Gestionar conductores"
4to: "Reportes" — este botón ahora llama a setCurrentView('reports') en vez de no hacer nada

3. Nueva sección de viajes disponibles en el Panel Principal:
Reemplazá el bloque actual de "Viajes disponibles" (que solo tiene un texto y un botón) por una lista desplegada con el mismo formato de las cards de transportes activos del RancherDashboard. Usá estos 3 viajes mock:
typescriptconst availableTripsPreview = [
  { id: 'SOL-101', rancher: 'Estancia Don Pedro', origin: 'Filadelfia', destination: 'Asunción', heads: 45, cattleType: 'Gordos', pickupDate: '28/03/2026', distance: '480 km' },
  { id: 'SOL-102', rancher: 'Rancho San Miguel', origin: 'Loma Plata', destination: 'Villa Hayes', heads: 32, cattleType: 'Novillos', pickupDate: '29/03/2026', distance: '320 km' },
  { id: 'SOL-103', rancher: 'Ganadera La Esperanza', origin: 'Neuland', destination: 'Concepción', heads: 28, cattleType: 'Vaquillonas', pickupDate: '30/03/2026', distance: '380 km' },
]
Cada card tiene: ID de solicitud en font-mono font-bold, badge "Disponible" en verde #2D5016, grid con Origen/Destino/Cabezas/Tipo/Fecha, y un botón "Ver detalles" a la derecha con variant="outline" size="sm" que abre el TruckDetailModal usando el id del camión correspondiente (CAM-001 para SOL-101, CAM-004 para SOL-102, CAM-007 para SOL-103). Encima de la lista agregá el título "Viajes disponibles en tu región (3)" con el mismo estilo colapsable que usa el Ganadero.
4. Nueva vista de Reportes:
Agregá 'reports' al tipo currentView si no existe. En la vista currentView === 'reports' mostrá:
Título "Reportes y Analíticas" con subtítulo "Métricas de rendimiento de tu empresa"
Sección 1 — 4 tarjetas de métricas principales (mismo estilo que stats del dashboard):

Ingresos del mes: ₲ 48.200.000 · ícono DollarSign · color #2D5016 · subtexto "↑ 18% vs. mes anterior"
Viajes completados: 47 · ícono CheckCircle2 · color #2D5016 · subtexto "↑ 12% vs. mes anterior"
Viajes activos: 8 · ícono Clock · color #8B4513 · subtexto "3 en tránsito, 5 asignados"
Conductores disponibles: 12 · ícono Users · color #8B4513 · subtexto "de 17 en total"

Sección 2 — Mapa de ubicación de camiones (el bloque completo que estaba antes en el dashboard, movelolo acá sin cambios)
Sección 3 — Tabla de rendimiento por conductor (la tabla de conductores que estaba en la vista de Conductores, copiala acá también — en Conductores que siga existiendo también)
Sección 4 — Resumen de flota: una tabla simple con los datos de fleetVehicles mostrando ID, Patente, Capacidad, Estado, Conductor — igual que la tabla de Flota pero sin opciones de edición
5. Reordenar sidebar — Reportes segundo:
En el sidebar, reordenás los botones así:

Panel Principal
Reportes (segundo, llamando a setCurrentView('reports'))
Flota
Conductores
Ver viajes disponibles (llamando a setCurrentView('available-trips'))

6. Corregir botón "Ver detalles" para que abra modal en lugar de navegar:
Actualmente los botones en la lista de camiones del mapa llaman a setSelectedTruckId(truck.id) que ya abre el TruckDetailModal correctamente. Verificá que el modal esté renderizándose al final del componente con:
jsx{selectedTruckId && truckDetailsData[selectedTruckId as keyof typeof truckDetailsData] && (
  <TruckDetailModal
    truck={truckDetailsData[selectedTruckId as keyof typeof truckDetailsData]}
    onClose={() => setSelectedTruckId(null)}
  />
)}
Si ya existe, dejalo igual. Si no existe, agregalo antes del cierre del div raíz.
7. Corregir "Ver detalles" en RancherDashboard — abrir modal en lugar de navegar:
En el archivo src/app/components/dashboards/RancherDashboard.tsx, el botón "Ver detalles" de cada ENV ya llama a setSelectedTripId(shipment.id). Verificá que el RancherTripDetailModal esté importado y que se renderice así al final del componente:
jsx{selectedTripId && (
  <RancherTripDetailModal
    tripId={selectedTripId}
    onClose={() => setSelectedTripId(null)}
  />
)}
Si existe pero no funciona, verificá que los datos de tripDetailsData tengan los IDs ENV-001, ENV-002, ENV-003 que coincidan con los IDs de activeShipments.
No cambies ninguna funcionalidad existente que ya esté funcionando correctamente. No cambies el diseño visual fuera de lo especificado acá.