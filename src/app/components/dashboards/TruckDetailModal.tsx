import { X, Truck, User, MapPin, Clock, FileText, CheckCircle, AlertTriangle, Phone, MessageCircle, Download, Navigation, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { openCall, openWhatsApp } from '../../utils/contact';

interface TruckDetails {
  id: string;
  plate: string;
  driver: {
    id: string;
    name: string;
    phone: string;
    photo?: string;
  };
  trip: {
    id: string;
    status: 'esperando-instrucciones' | 'saliendo' | 'llegando-estancia' | 'cargado-saliendo' | 'yendo-destino' | 'entregado' | 'retraso';
    origin: string;
    originEstancia: string;
    destination: string;
    cattleType: string;
    heads: number;
    pickupDate: string;
    deliveryDate: string;
    rancherName: string;
    rancherPhone: string;
  };
  documents: {
    guia: {
      uploaded: boolean;
      uploadDate?: string;
      url?: string;
    };
    cota: {
      uploaded: boolean;
      uploadDate?: string;
      checkpoints: {
        name: string;
        location: string;
        passed: boolean;
        time?: string;
      }[];
    };
  };
  deliveryProof?: {
    certificado: { uploaded: boolean; url?: string };
    descarga: { uploaded: boolean; url?: string };
    bascula: { uploaded: boolean; url?: string };
  };
  delay?: {
    reason: string;
    estimatedDelay: string;
  };
}

interface TruckDetailModalProps {
  truck: TruckDetails;
  onClose: () => void;
}

export function TruckDetailModal({ truck, onClose }: TruckDetailModalProps) {

  const formatPrice = (price: number) => {
    return '₲ ' + price.toLocaleString('es-PY');
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'esperando-instrucciones':
        return { label: 'Esperando Instrucciones', color: '#f59e0b', icon: Clock };
      case 'saliendo':
        return { label: 'Saliendo hacia la estancia', color: '#3b82f6', icon: Navigation };
      case 'llegando-estancia':
        return { label: 'Llegando a la estancia', color: '#8b5cf6', icon: MapPin };
      case 'cargado-saliendo':
        return { label: 'Cargado y saliendo', color: '#10b981', icon: Truck };
      case 'yendo-destino':
        return { label: 'Yendo al destino final', color: '#1E5126', icon: Navigation };
      case 'entregado':
        return { label: 'Entregado', color: '#059669', icon: CheckCircle };
      case 'retraso':
        return { label: 'Reportando Retraso', color: '#dc2626', icon: AlertTriangle };
      default:
        return { label: status, color: '#6b7280', icon: Truck };
    }
  };

  const statusConfig = getStatusConfig(truck.trip.status);
  const StatusIcon = statusConfig.icon;

  const handleContactEstancia = () => {
    openWhatsApp(
      truck.trip.rancherPhone,
      `Hola, soy de la empresa de transporte. Necesito coordinar sobre el viaje ${truck.trip.id}. El camión ${truck.id} va en camino.`,
    );
  };

  // Calculate agreed price (mock - would come from API)
  const agreedPrice = 2800000;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div className="bg-white rounded-lg max-w-5xl w-full max-h-[95vh] overflow-y-auto my-4">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Truck className="w-8 h-8" style={{ color: statusConfig.color }} />
                  <h2 className="text-3xl font-bold text-gray-900">{truck.id}</h2>
                  <span className="text-gray-600">•</span>
                  <span className="text-xl text-gray-600">{truck.plate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="px-4 py-1.5 rounded-full text-sm font-semibold text-white flex items-center gap-2"
                    style={{ backgroundColor: statusConfig.color }}
                  >
                    <StatusIcon className="w-4 h-4" />
                    {statusConfig.label}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Quick Summary Bar */}
          <div className="border-b border-gray-200 px-6 py-5 bg-gray-50">
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

          {/* Delay Alert (if applicable) */}
          {truck.trip.status === 'retraso' && truck.delay && (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-5 m-6">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-bold text-red-900 text-lg mb-2">⚠️ Retraso o Desvío Reportado</h3>
                  <p className="text-red-800 mb-1"><strong>Motivo:</strong> {truck.delay.reason}</p>
                  <p className="text-red-800"><strong>Demora estimada:</strong> {truck.delay.estimatedDelay}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleContactEstancia}
                  className="flex items-center gap-2"
                  style={{ backgroundColor: '#25D366' }}
                >
                  <MessageCircle className="w-4 h-4" />
                  Contactar a la estancia
                </Button>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="p-6">
            <Tabs defaultValue="viaje" className="w-full">
              <TabsList className="w-full justify-center mb-6">
                <TabsTrigger value="viaje">Viaje</TabsTrigger>
                <TabsTrigger value="documentos">Documentos</TabsTrigger>
                <TabsTrigger value="chofer">Chofer</TabsTrigger>
                {truck.trip.status === 'entregado' && (
                  <TabsTrigger value="entrega">Entrega</TabsTrigger>
                )}
              </TabsList>

              {/* Tab: Viaje */}
              <TabsContent value="viaje" className="space-y-6 mt-6">
                <div className="bg-white border-2 border-gray-200 rounded-lg p-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Detalles del viaje</h3>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                      <div className="flex-1">
                        <div className="text-xs font-medium text-blue-900 mb-1">Punto de recogida</div>
                        <div className="font-bold text-gray-900">{truck.trip.origin}</div>
                        <div className="text-sm text-gray-600">{truck.trip.originEstancia}</div>
                        <div className="text-xs text-gray-500 mt-1">{truck.trip.pickupDate}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-red-600 mt-1" />
                      <div className="flex-1">
                        <div className="text-xs font-medium text-red-900 mb-1">Destino</div>
                        <div className="font-bold text-gray-900">{truck.trip.destination}</div>
                        <div className="text-xs text-gray-500 mt-1">Entrega estimada: {truck.trip.deliveryDate}</div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-200 grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Tipo de ganado</div>
                        <div className="font-medium text-gray-900">{truck.trip.cattleType}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Cantidad</div>
                        <div className="font-medium text-gray-900">{truck.trip.heads} cabezas</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Peso aprox.</div>
                        <div className="font-medium text-gray-900">380 kg/animal</div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-200">
                      <div className="text-xs text-gray-500 mb-1">Precio acordado</div>
                      <div className="text-3xl font-bold" style={{ color: '#1E5126' }}>
                        {formatPrice(agreedPrice)}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Tab: Documentos */}
              <TabsContent value="documentos" className="space-y-6 mt-6">
                <div className="bg-white border-2 border-gray-200 rounded-lg p-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Documentos del viaje</h3>

                  <div className="space-y-4">
                    {/* Guía */}
                    <div className={`p-4 rounded-lg border-2 ${
                      truck.documents.guia.uploaded
                        ? 'bg-green-50 border-green-300'
                        : 'bg-yellow-50 border-yellow-300'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FileText className={`w-5 h-5 ${
                            truck.documents.guia.uploaded ? 'text-green-700' : 'text-yellow-700'
                          }`} />
                          <span className="font-bold text-gray-900">Guía de Transporte</span>
                        </div>
                        {truck.documents.guia.uploaded ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-yellow-600" />
                        )}
                      </div>
                      {truck.documents.guia.uploaded ? (
                        <div>
                          <div className="text-sm text-green-700 mb-2">
                            ✓ Subida el {truck.documents.guia.uploadDate}
                          </div>
                          <Button size="sm" variant="outline" className="flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Descargar
                          </Button>
                        </div>
                      ) : (
                        <div className="text-sm text-yellow-700">Pendiente de subir</div>
                      )}
                    </div>

                    {/* COTA */}
                    <div className={`p-4 rounded-lg border-2 ${
                      truck.documents.cota.uploaded
                        ? 'bg-green-50 border-green-300'
                        : 'bg-yellow-50 border-yellow-300'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FileText className={`w-5 h-5 ${
                            truck.documents.cota.uploaded ? 'text-green-700' : 'text-yellow-700'
                          }`} />
                          <span className="font-bold text-gray-900">COTA</span>
                        </div>
                        {truck.documents.cota.uploaded ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-yellow-600" />
                        )}
                      </div>
                      {truck.documents.cota.uploaded ? (
                        <div>
                          <div className="text-sm text-green-700 mb-2">
                            ✓ Subida el {truck.documents.cota.uploadDate}
                          </div>
                          <Button size="sm" variant="outline" className="flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Descargar
                          </Button>
                        </div>
                      ) : (
                        <div className="text-sm text-yellow-700">Pendiente de subir</div>
                      )}
                    </div>

                    {/* COTA Checkpoints */}
                    {truck.documents.cota.checkpoints.length > 0 && (
                      <div className="pt-4 border-t border-gray-200">
                        <h4 className="font-bold text-gray-900 mb-3">Puntos de Control COTA</h4>
                        <div className="space-y-3">
                          {truck.documents.cota.checkpoints.map((checkpoint, idx) => (
                            <div
                              key={idx}
                              className={`flex items-start gap-3 p-4 rounded-lg border-2 ${
                                checkpoint.passed
                                  ? 'bg-green-50 border-green-300'
                                  : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                checkpoint.passed ? 'bg-green-600' : 'bg-gray-300'
                              }`}>
                                {checkpoint.passed ? (
                                  <CheckCircle className="w-5 h-5 text-white" />
                                ) : (
                                  <Clock className="w-5 h-5 text-white" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="font-bold text-gray-900">{checkpoint.name}</div>
                                <div className="text-sm text-gray-600">{checkpoint.location}</div>
                                {checkpoint.passed && checkpoint.time && (
                                  <div className="text-xs text-green-700 mt-1">
                                    ✓ Pasó a las {checkpoint.time}
                                  </div>
                                )}
                                {!checkpoint.passed && (
                                  <div className="text-xs text-gray-500 mt-1">Pendiente</div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Tab: Chofer */}
              <TabsContent value="chofer" className="space-y-6 mt-6">
                <div className="bg-white border-2 border-gray-200 rounded-lg p-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Información del chofer</h3>

                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                      {truck.driver.photo ? (
                        <img src={truck.driver.photo} alt={truck.driver.name} className="w-20 h-20 rounded-full object-cover" />
                      ) : (
                        <User className="w-10 h-10 text-gray-600" />
                      )}
                    </div>
                    <div className="font-bold text-gray-900 text-lg">{truck.driver.name}</div>
                    <div className="text-sm text-gray-600">{truck.driver.phone}</div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full flex items-center justify-center gap-2"
                      onClick={() => openCall(truck.driver.phone)}
                    >
                      <Phone className="w-4 h-4" />
                      Llamar
                    </Button>
                    <Button
                      size="sm"
                      className="w-full flex items-center justify-center gap-2"
                      style={{ backgroundColor: '#25D366' }}
                      onClick={() => openWhatsApp(truck.driver.phone)}
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </Button>
                  </div>

                  {/* Map placeholder for driver location */}
                  {['yendo-destino', 'saliendo', 'llegando-estancia'].includes(truck.trip.status) && (
                    <div className="mb-6">
                      <h4 className="font-bold text-gray-900 mb-3">Ubicación actual</h4>
                      <div className="h-48 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center border-2 border-gray-300">
                        <div className="text-center">
                          <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                          <p className="text-sm font-medium text-gray-700">Rastreo en tiempo real</p>
                          <p className="text-xs text-gray-500">(Demo)</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="font-bold text-gray-900 mb-3">Acciones rápidas</h4>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full flex items-center justify-center gap-2"
                        onClick={handleContactEstancia}
                      >
                        <MessageCircle className="w-4 h-4" />
                        Contactar estancia
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Tab: Entrega (only if delivered) */}
              {truck.trip.status === 'entregado' && truck.deliveryProof && (
                <TabsContent value="entrega" className="space-y-6 mt-6">
                  <div className="bg-green-50 border-2 border-green-300 rounded-lg p-5">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Prueba de Entrega</h3>
                    <div className="space-y-3">
                      {/* Certificado */}
                      <div className="bg-white p-4 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-gray-900">📄 Certificado firmado de entrega</span>
                          {truck.deliveryProof.certificado.uploaded && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                        {truck.deliveryProof.certificado.uploaded ? (
                          <Button size="sm" variant="outline" className="flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Descargar certificado
                          </Button>
                        ) : (
                          <span className="text-sm text-gray-500">No subido</span>
                        )}
                      </div>

                      {/* Descarga */}
                      <div className="bg-white p-4 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-gray-900">📸 Foto del camión descargando</span>
                          {truck.deliveryProof.descarga.uploaded && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                        {truck.deliveryProof.descarga.uploaded ? (
                          <Button size="sm" variant="outline" className="flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Ver foto
                          </Button>
                        ) : (
                          <span className="text-sm text-gray-500">No subida</span>
                        )}
                      </div>

                      {/* Báscula */}
                      <div className="bg-white p-4 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-gray-900">⚖️ Foto en la báscula</span>
                          {truck.deliveryProof.bascula.uploaded && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                        {truck.deliveryProof.bascula.uploaded ? (
                          <Button size="sm" variant="outline" className="flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Ver foto
                          </Button>
                        ) : (
                          <span className="text-sm text-gray-500">No subida</span>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      </div>

    </>
  );
}
