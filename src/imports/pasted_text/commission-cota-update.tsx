🎯 CAMBIOS A IMPLEMENTAR
CAMBIO 1: Actualizar comisión 3% → 5%
Ubicación: NewShipmentFlow → Paso 5 (Confirmación)
Diseño actual (línea 377):
tsx<span className="text-gray-600">Comisión Tropero (3%):</span>
<span className="font-medium text-gray-700">₲ {formatPrice(commission)}</span>
Cambio requerido:

Actualizar texto:

De: "Comisión Tropero (3%)"
A: "Comisión Tropero (5%)"


Actualizar cálculo (línea 41):

De: const commission = basePrice * 0.03;
A: const commission = basePrice * 0.05;


Agregar nota informativa:

Después del disclaimer existente (línea 389-391)
Agregar badge o texto pequeño:



tsx   <p className="text-xs text-green-700 bg-green-50 rounded px-3 py-1 inline-block mt-2">
     ✓ Comisión actualizada a 5% para mejorar el servicio
   </p>
Ubicación en Figma: Frame "Nuevo Envío - Paso 5"

CAMBIO 2: Nueva pantalla - COTA Upload
Contexto funcional:

Ganadero DEBE subir COTA antes de iniciar viaje
COTA = Certificado Oficial de Tránsito de Animales (SENACSA)
Obligatorio por ley en Paraguay

Diseño de pantalla:
tsx// Estructura del componente
export function COTAUpload({ onComplete, onCancel }: COTAUploadProps) {
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
            <div>
              <h1 className="text-xl font-bold">COTA Requerido</h1>
              <p className="text-sm text-gray-600">
                Certificado obligatorio para iniciar viaje
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 lg:px-6 py-8 space-y-6">
          
          {/* DESCRIPCIÓN */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-gray-700">
              El Certificado Oficial de Tránsito de Animales (COTA) es obligatorio 
              para iniciar el viaje según normativa SENACSA.
            </p>
          </div>

          {/* SELECTOR DE MÉTODO */}
          <div className="grid md:grid-cols-2 gap-4">
            <button className="p-6 bg-white rounded-lg border-2 border-green-700 bg-green-50 hover:bg-green-100 transition text-left">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-6 h-6" style={{ color: '#2D5016' }} />
                <h3 className="font-bold">Opción 1: Número de COTA</h3>
              </div>
              <p className="text-sm text-gray-600">
                Ingresá el número emitido por SENACSA
              </p>
            </button>

            <button className="p-6 bg-white rounded-lg border-2 border-gray-200 hover:border-gray-300 transition text-left">
              <div className="flex items-center gap-3 mb-2">
                <Camera className="w-6 h-6 text-gray-600" />
                <h3 className="font-bold">Opción 2: Foto de COTA</h3>
              </div>
              <p className="text-sm text-gray-600">
                Subí una foto del documento
              </p>
            </button>
          </div>

          {/* INPUT ÁREA (si opción 1) */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <Label className="mb-2">Número de COTA *</Label>
            <Input 
              type="text" 
              placeholder="Ej: COTA-2026-001234"
              className="text-lg mb-2"
            />
            <p className="text-xs text-gray-500">
              El número aparece en el documento emitido por SENACSA
            </p>
          </div>

          {/* WARNING BOX */}
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
            <div className="flex gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-700 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-yellow-900 mb-1">
                  No podrás iniciar el viaje sin COTA verificado
                </h3>
                <p className="text-sm text-yellow-800">
                  El sistema validará este documento antes de permitir 
                  que el transportista inicie el viaje.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER BUTTONS */}
      <div className="bg-white border-t border-gray-200 px-4 lg:px-6 py-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
          <Button 
            disabled={!isValid}
            onClick={onComplete} 
            className="flex-1 bg-green-700 hover:bg-green-800"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Confirmar COTA
          </Button>
        </div>
      </div>
    </div>
  );
}
Estados a diseñar:

Opción 1 seleccionada (default)
Opción 2 seleccionada
Input válido (botón habilitado)
Foto subida con preview

Ubicación en flujo: Después de NewShipmentFlow paso 5 → Antes de volver al dashboard

CAMBIO 3: Nueva pantalla - Sistema de Negociación
Contexto funcional:

3 rondas de negociación con timeout 24h cada una
Ganadero y transportista negocian precio
Sistema estructurado vs freestyle actual

Diseño de pantalla:
tsxexport function NegotiationFlow({ 
  tripId, 
  userType, 
  basePrice,
  currentRound,
  negotiationHistory 
}: NegotiationFlowProps) {
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-bold mb-2">Sistema de Negociación</h1>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>Filadelfia → Asunción • 120 cabezas</span>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 lg:px-6 py-8 space-y-6">
          
          {/* PRECIO BASE REFERENCE */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Precio base estimado</div>
            <div className="text-3xl font-bold text-gray-900">
              ₲ {formatPrice(basePrice)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Este es solo un estimado. El precio final se negocia entre las partes.
            </div>
          </div>

          {/* HISTORIAL */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-700">
              Historial de Negociación
            </h3>

            {/* CARD DE RONDA ACTIVA */}
            <div className="bg-white rounded-lg border-2 border-green-700 p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">Ronda 1: Oferta Inicial</span>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      🚛 Transportista
                    </span>
                  </div>
                  <div className="text-2xl font-bold" style={{ color: '#2D5016' }}>
                    ₲ 6,500,000
                  </div>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                  Pendiente
                </span>
              </div>

              <div className="flex items-center gap-1 text-sm text-red-600 mb-3">
                <TrendingUp className="w-4 h-4" />
                <span>+₲100,000 vs precio base</span>
              </div>

              <div className="border-t border-gray-200 pt-3 flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="font-semibold text-yellow-600">
                  Expira en: <span className="font-mono">23:45:12</span>
                </span>
              </div>
            </div>
          </div>

          {/* ÁREA DE ACCIÓN */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold mb-4">Tu respuesta (como Ganadero)</h3>
            
            <div className="flex gap-3 mb-4">
              <Button className="flex-1 bg-green-700 hover:bg-green-800">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Aceptar ₲6,500,000
              </Button>
              <Button variant="outline" className="flex-1">
                <X className="w-4 h-4 mr-2" />
                Rechazar
              </Button>
            </div>

            <div className="space-y-3">
              <div className="text-sm text-gray-600">O hacé una contraoferta:</div>
              <div className="flex gap-3">
                <Input 
                  type="text" 
                  placeholder="Ingresá tu contraoferta"
                  className="flex-1 text-lg"
                />
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Enviar
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Formato: solo números. Ej: 6200000
              </p>
            </div>
          </div>

          {/* INFO BOX */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <p className="font-semibold text-sm mb-2">📋 Proceso de negociación:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Transportista hace oferta inicial (24h para responder)</li>
              <li>Ganadero puede aceptar o hacer contraoferta (24h para responder)</li>
              <li>Transportista puede hacer ajuste final</li>
              <li>Ganadero acepta o rechaza (decisión final)</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
Estados a diseñar:

Ronda 1 - Pendiente respuesta ganadero
Ronda 2 - Contraoferta activa
Ronda 3 - Ajuste final
Oferta aceptada (success state)
Oferta expirada (timeout)

Badges de estado:

Pendiente: bg-yellow-100 text-yellow-800
Aceptada: bg-green-100 text-green-800
Rechazada: bg-red-100 text-red-800
Expirada: bg-gray-100 text-gray-800

Ubicación: Reemplaza RancherOffersView actual con este sistema más robusto

CAMBIO 4: Nueva pantalla - Prueba de Entrega
Contexto funcional:

Transportista sube fotos al completar entrega
Requisitos varían según tipo de destino
Frigorífico: 3 fotos obligatorias
Estancia: 1-3 fotos flexibles

Diseño de pantalla:
tsxexport function ProofOfDeliveryUpload({ 
  tripId, 
  destinationType,
  onComplete 
}: ProofOfDeliveryUploadProps) {
  
  const requirements = destinationType === 'frigorifico' 
    ? [
        { type: 'bascula', label: 'Foto de la báscula', icon: '⚖️' },
        { type: 'nota', label: 'Nota firmada del frigorífico', icon: '📋' },
        { type: 'descarga', label: 'Animales descargando', icon: '🚛' }
      ]
    : [
        { type: 'descarga', label: 'Fotos de descarga (1-3)', icon: '🚛' }
      ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Camera className="w-8 h-8" style={{ color: '#2D5016' }} />
            <h1 className="text-xl font-bold">Prueba de Entrega</h1>
          </div>
          <p className="text-sm text-gray-600">
            Subí las fotos requeridas para confirmar la entrega
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 lg:px-6 py-8 space-y-6">
          
          {/* DESTINATION BADGE */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full text-sm font-medium">
            <span>Destino:</span>
            <span className="font-bold">
              {destinationType === 'frigorifico' ? '🏭 Frigorífico Concepción' : '🏡 Estancia El Carmen'}
            </span>
          </div>

          {/* PHOTO SECTIONS */}
          {requirements.map((req, index) => (
            <div key={index} className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:border-green-700 transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{req.icon}</span>
                  <div>
                    <Label className="text-base font-semibold">
                      {req.label}
                    </Label>
                    <span className="ml-2 text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded font-semibold">
                      Requerido
                    </span>
                  </div>
                </div>
                {/* Check verde si completado */}
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>

              {/* UPLOAD AREA */}
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-700 hover:bg-gray-50 transition">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-700">Subir foto</span>
                <input type="file" className="hidden" accept="image/*" />
              </label>
            </div>
          ))}

          {/* WARNING (si incompleto) */}
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
            <div className="flex gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-700 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-yellow-900 mb-1">
                  Completá todos los requisitos para confirmar la entrega
                </h3>
                <p className="text-sm text-yellow-800">
                  Se requieren las {requirements.length} fotos para validar la entrega.
                </p>
              </div>
            </div>
          </div>

          {/* INFO BOX */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="font-semibold text-sm text-blue-900 mb-2">💡 Consejos:</p>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
              <li>Asegurate que las fotos sean claras y legibles</li>
              <li>Incluí la mayor parte del contexto posible</li>
              {destinationType === 'frigorifico' && (
                <>
                  <li>La báscula debe mostrar claramente el peso</li>
                  <li>La nota debe estar firmada y legible</li>
                </>
              )}
            </ul>
          </div>

          {/* PROGRESS SUMMARY */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Total de fotos</div>
                <div className="text-2xl font-bold">3</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Requisitos cumplidos</div>
                <div className="text-2xl font-bold" style={{ color: '#2D5016' }}>
                  3 / 3
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="bg-white border-t border-gray-200 px-4 lg:px-6 py-4">
        <div className="max-w-4xl mx-auto flex gap-3">
          <Button variant="outline" className="flex-1">
            Cancelar
          </Button>
          <Button 
            disabled={!allComplete}
            className="flex-1 bg-green-700 hover:bg-green-800"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Confirmar Entrega
          </Button>
        </div>
      </div>
    </div>
  );
}
Estados a diseñar:

Vacío (0/3 fotos, botón disabled)
Parcial (1-2/3 fotos)
Completo (3/3 fotos, botón enabled)
Variante Estancia (requisitos más flexibles)

Ubicación: DriverDashboard → Al completar viaje

✅ RESUMEN DE IMPLEMENTACIÓN
Archivos a modificar:

NewShipmentFlow.tsx - Actualizar comisión (2 líneas + nota)

Archivos nuevos a crear:
2. COTAUpload.tsx - Nueva pantalla
3. NegotiationFlow.tsx - Nueva pantalla
4. ProofOfDeliveryUpload.tsx - Nueva pantalla
Componentes UI reutilizables a usar:

Button (shadcn/ui)
Input (shadcn/ui)
Label (shadcn/ui)
Lucide Icons (AlertTriangle, Camera, Clock, CheckCircle2, etc.)

Colores específicos:

Verde Tropero: #2D5016 (botones primarios)
Amarillo warning: bg-yellow-50 border-yellow-300 (warnings)
Verde success: bg-green-50 border-green-700 (success states)

Layout pattern consistente:
tsx<div className="min-h-screen bg-gray-50 flex flex-col">
  {/* Header */}
  <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
    {/* Header content */}
  </div>
  
  {/* Content */}
  <div className="flex-1 overflow-y-auto">
    <div className="max-w-3xl mx-auto px-4 lg:px-6 py-8">
      {/* Main content */}
    </div>
  </div>
  
  {/* Footer (optional) */}
  <div className="bg-white border-t border-gray-200 px-4 lg:px-6 py-4">
    {/* Footer buttons */}
  </div>
</div>

Con este diseño, las 4 pantallas mantendrán total consistencia visual con el resto del proyecto Tropero existente en Figma. 🎨