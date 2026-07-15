Aplicá los siguientes cambios manteniendo toda la funcionalidad existente.

1. Mejorar barra de resumen en TruckDetailModal.tsx
La barra de resumen debajo del header está muy apretada. Reemplazala por este diseño más espacioso:
jsx<div className="border-b border-gray-200 px-6 py-5 bg-gray-50">
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
    <div>
      <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Ruta</div>
      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-900 text-sm">{truck.trip.origin}</span>
        <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <span className="font-semibold text-gray-900 text-sm">{truck.trip.destination}</span>
      </div>
    </div>
    <div>
      <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Ganado</div>
      <div className="font-semibold text-gray-900 text-sm">{truck.trip.heads} · {truck.trip.cattleType}</div>
    </div>
    <div>
      <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Chofer</div>
      <div className="font-semibold text-gray-900 text-sm">{truck.driver.name}</div>
    </div>
    <div>
      <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Guía</div>
      <div className={`font-semibold text-sm ${truck.documents.guia.uploaded ? 'text-green-700' : 'text-amber-600'}`}>
        {truck.documents.guia.uploaded ? '✓ Subida' : '⏳ Pendiente'}
      </div>
    </div>
  </div>
</div>
Aplicá el mismo patrón de barra de resumen espaciosa en RancherTripDetailModal.tsx con estos campos:

"Ruta": {trip.origin} → {trip.destination}
"Ganado": {trip.heads} · {trip.cattleType}
"Precio acordado": {formatPrice(trip.agreedPrice)} en style={{ color: '#2D5016' }}
"Estado": el badge de estado actual con su color correspondiente


2. Centrar tabs en ambos modales
En TruckDetailModal.tsx y RancherTripDetailModal.tsx, en el componente <TabsList>, agregá la clase w-full justify-center para que los tabs queden centrados:
jsx<TabsList className="w-full justify-center mb-6">

3. Crear modal de detalle para viajes disponibles (SOL) — EmpresaDashboard.tsx
El botón "Ver detalles" en las cards de availableTripsPreview actualmente abre el TruckDetailModal con un ID de CAM, lo cual es incorrecto. Los viajes disponibles (SOL) son solicitudes de ganaderos, no camiones de la empresa.
Creá un nuevo estado: const [selectedSolId, setSelectedSolId] = useState<string | null>(null)
Cambiá el onClick del botón "Ver detalles" de cada card SOL para que llame a setSelectedSolId(trip.id) en vez de setSelectedTruckId.
Agregá los datos completos de cada SOL:
typescriptconst solDetailsData: { [key: string]: any } = {
  'SOL-101': {
    id: 'SOL-101',
    rancher: 'Estancia Don Pedro',
    rancherPhone: '+595 981 234567',
    rancherRating: 4.7,
    origin: 'Filadelfia',
    originEstancia: 'Estancia Don Pedro - SENACSA 12345',
    destination: 'Asunción - Frigorífico Central',
    heads: 45,
    cattleType: 'Gordos',
    pickupDate: '28/03/2026',
    pickupTime: '06:00',
    distance: 480,
    estimatedPrice: 45 * 410 * 480,
  },
  'SOL-102': {
    id: 'SOL-102',
    rancher: 'Rancho San Miguel',
    rancherPhone: '+595 981 345678',
    rancherRating: 4.5,
    origin: 'Loma Plata',
    originEstancia: 'Rancho San Miguel - SENACSA 23456',
    destination: 'Villa Hayes - Matadero Municipal',
    heads: 32,
    cattleType: 'Novillos',
    pickupDate: '29/03/2026',
    pickupTime: '07:00',
    distance: 320,
    estimatedPrice: 32 * 410 * 320,
  },
  'SOL-103': {
    id: 'SOL-103',
    rancher: 'Ganadera La Esperanza',
    rancherPhone: '+595 981 456789',
    rancherRating: 4.9,
    origin: 'Neuland',
    originEstancia: 'Ganadera La Esperanza - SENACSA 34567',
    destination: 'Concepción - Frigorífico Norte',
    heads: 28,
    cattleType: 'Vaquillonas',
    pickupDate: '30/03/2026',
    pickupTime: '05:30',
    distance: 380,
    estimatedPrice: 28 * 410 * 380,
  }
};
Agregá el modal de detalle SOL al final del componente, antes del cierre del div raíz, con este diseño inline (sin crear un archivo nuevo):
jsx{selectedSolId && solDetailsData[selectedSolId] && (() => {
  const sol = solDetailsData[selectedSolId];
  const formatPrice = (p: number) => '₲ ' + p.toLocaleString('es-PY');
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto my-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="font-mono font-bold text-2xl text-gray-900">{sol.id}</span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: '#2D5016' }}>Disponible</span>
            </div>
            <p className="text-sm text-gray-600">Solicitud de transporte de ganado</p>
          </div>
          <button onClick={() => setSelectedSolId(null)} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-6 h-6" />
          </button>
        </div>
        {/* Resumen */}
        <div className="border-b border-gray-200 px-6 py-5 bg-gray-50">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Ruta</div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 text-sm">{sol.origin}</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
                <span className="font-semibold text-gray-900 text-sm">{sol.destination}</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Precio estimado</div>
              <div className="font-bold text-lg" style={{ color: '#2D5016' }}>{formatPrice(sol.estimatedPrice)}</div>
            </div>
          </div>
        </div>
        {/* Contenido */}
        <div className="p-6 space-y-6">
          {/* Datos del viaje */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <div className="text-xs font-medium text-blue-900 mb-1">Punto de recogida</div>
                <div className="font-bold text-gray-900">{sol.origin}</div>
                <div className="text-sm text-gray-600">{sol.originEstancia}</div>
                <div className="text-xs text-gray-500 mt-1">{sol.pickupDate} a las {sol.pickupTime}</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <ArrowRight className="w-4 h-4" />
              <span>{sol.distance} km</span>
              <ArrowRight className="w-4 h-4" />
            </div>
            <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
              <MapPin className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <div className="text-xs font-medium text-red-900 mb-1">Destino</div>
                <div className="font-bold text-gray-900">{sol.destination}</div>
              </div>
            </div>
          </div>
          {/* Métricas cuantitativas */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-xs text-gray-500 mb-1">Cabezas</div>
              <div className="text-2xl font-bold text-gray-900">{sol.heads}</div>
              <div className="text-xs text-gray-600">{sol.cattleType}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-xs text-gray-500 mb-1">Distancia</div>
              <div className="text-2xl font-bold text-gray-900">{sol.distance}</div>
              <div className="text-xs text-gray-600">kilómetros</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-xs text-gray-500 mb-1">Precio/cabeza</div>
              <div className="text-xl font-bold" style={{ color: '#2D5016' }}>{formatPrice(Math.round(sol.estimatedPrice / sol.heads))}</div>
              <div className="text-xs text-gray-600">estimado</div>
            </div>
          </div>
          {/* Ganadero */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xs text-gray-500 mb-1">Ganadero</div>
                <div className="font-bold text-gray-900">{sol.rancher}</div>
                <div className="text-sm text-gray-600">★ {sol.rancherRating} calificación</div>
              </div>
            </div>
            <Button
              size="sm"
              className="w-full flex items-center justify-center gap-2"
              style={{ backgroundColor: '#25D366' }}
              onClick={() => window.open(`https://wa.me/${sol.rancherPhone.replace(/\s/g, '')}`, '_blank')}
            >
              <MessageCircle className="w-4 h-4" />
              Contactar ganadero
            </Button>
          </div>
          {/* Precio total */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
            <div className="text-sm text-gray-600 mb-1">Precio total estimado del viaje</div>
            <div className="text-3xl font-bold" style={{ color: '#2D5016' }}>{formatPrice(sol.estimatedPrice)}</div>
            <div className="text-xs text-gray-500 mt-2">* Precio estimado basado en ₲ 410 por km/cabeza. El precio final se acuerda en la negociación.</div>
          </div>
          {/* Acción principal */}
          <Button
            className="w-full h-12 text-base"
            style={{ backgroundColor: '#2D5016' }}
            onClick={() => { setSelectedSolId(null); setCurrentView('available-trips'); }}
          >
            Ofertar por este viaje
          </Button>
        </div>
      </div>
    </div>
  );
})()}
Asegurate de importar MessageCircle desde lucide-react si no está importado.
No cambies ninguna otra funcionalidad, datos ni diseño.