import { X, Truck, User, MapPin, Clock, CheckCircle, Phone, MessageCircle, Navigation, Package, ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface RancherTripDetails {
  id: string;
  status: 'esperando-chofer' | 'chofer-asignado' | 'en-camino' | 'en-estancia' | 'cargando' | 'en-transito' | 'entregado';
  origin: string;
  originEstancia: string;
  destination: string;
  cattleType: string;
  heads: number;
  pickupDate: string;
  pickupTime: string;
  deliveryDate: string;
  distance: number;
  agreedPrice: number;
  transporter: {
    name: string;
    type: 'empresa' | 'owner-operator';
    phone: string;
    rating: number;
  };
  driver?: {
    name: string;
    phone: string;
    photo?: string;
    currentLocation?: string;
    estimatedArrival?: string;
  };
  documents: {
    guia: {
      uploaded: boolean;
      canUpload: boolean;
      uploadDate?: string;
    };
    cota: {
      checkpoints: {
        name: string;
        location: string;
        passed: boolean;
        time?: string;
      }[];
    };
  };
}

interface RancherTripDetailModalProps {
  tripId: string;
  onClose: () => void;
}

export function RancherTripDetailModal({ tripId, onClose }: RancherTripDetailModalProps) {

  // Mock data - in a real app, this would be fetched from API
  const tripDetailsData: { [key: string]: RancherTripDetails } = {
    'ENV-001': {
      id: 'ENV-001',
      status: 'en-transito',
      origin: 'Filadelfia',
      originEstancia: 'Estancia Don Pedro - SENACSA 12345',
      destination: 'Asunción - Frigorífico Central',
      cattleType: 'Gordos',
      heads: 45,
      pickupDate: '24/03/2026',
      pickupTime: '06:00',
      deliveryDate: '24/03/2026 14:00',
      distance: 480,
      agreedPrice: 2800000,
      transporter: {
        name: 'Transporte González S.A.',
        type: 'empresa',
        phone: '+595 981 234567',
        rating: 4.8
      },
      driver: {
        name: 'Roberto Díaz',
        phone: '+595 981 123456',
        currentLocation: 'Ruta 9 Km 300',
        estimatedArrival: '2 horas'
      },
      documents: {
        guia: {
          uploaded: true,
          canUpload: false,
          uploadDate: '24/03/2026 06:15'
        },
        cota: {
          checkpoints: [
            { name: 'Control Filadelfia', location: 'Ruta 9 Km 450', passed: true, time: '06:30' },
            { name: 'Control Mariscal Estigarribia', location: 'Ruta 9 Km 300', passed: true, time: '09:15' },
            { name: 'Control Villa Hayes', location: 'Ruta Transchaco Km 50', passed: false }
          ]
        }
      }
    },
    'ENV-002': {
      id: 'ENV-002',
      status: 'chofer-asignado',
      origin: 'Loma Plata',
      originEstancia: 'Rancho San Miguel - SENACSA 23456',
      destination: 'Villa Hayes - Matadero Municipal',
      cattleType: 'Novillos',
      heads: 30,
      pickupDate: '25/03/2026',
      pickupTime: '08:00',
      deliveryDate: '25/03/2026 13:00',
      distance: 320,
      agreedPrice: 1900000,
      transporter: {
        name: 'Carlos Méndez',
        type: 'owner-operator',
        phone: '+595 981 345678',
        rating: 4.6
      },
      driver: {
        name: 'Carlos Méndez',
        phone: '+595 981 345678'
      },
      documents: {
        guia: {
          uploaded: false,
          canUpload: true
        },
        cota: {
          checkpoints: []
        }
      }
    },
    'ENV-003': {
      id: 'ENV-003',
      status: 'esperando-chofer',
      origin: 'Neuland',
      originEstancia: 'Ganadera La Esperanza - SENACSA 34567',
      destination: 'Concepción - Frigorífico Norte',
      cattleType: 'Vaquillonas',
      heads: 52,
      pickupDate: '26/03/2026',
      pickupTime: '05:30',
      deliveryDate: '26/03/2026 12:00',
      distance: 380,
      agreedPrice: 2300000,
      transporter: {
        name: 'Flota del Chaco',
        type: 'empresa',
        phone: '+595 981 456789',
        rating: 4.9
      },
      documents: {
        guia: {
          uploaded: false,
          canUpload: false
        },
        cota: {
          checkpoints: []
        }
      }
    }
  };

  const trip = tripDetailsData[tripId];

  if (!trip) {
    return null;
  }

  const formatPrice = (price: number) => {
    return '₲ ' + price.toLocaleString('es-PY');
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'esperando-chofer':
        return { label: 'Esperando asignación de chofer', color: '#f59e0b', icon: Clock };
      case 'chofer-asignado':
        return { label: 'Chofer asignado', color: '#3b82f6', icon: User };
      case 'en-camino':
        return { label: 'En camino a tu estancia', color: '#8b5cf6', icon: Navigation };
      case 'en-estancia':
        return { label: 'Llegó a la estancia', color: '#10b981', icon: MapPin };
      case 'cargando':
        return { label: 'Cargando ganado', color: '#1E5126', icon: Truck };
      case 'en-transito':
        return { label: 'En tránsito al destino', color: '#1E5126', icon: Navigation };
      case 'entregado':
        return { label: 'Entregado', color: '#059669', icon: CheckCircle };
      default:
        return { label: status, color: '#6b7280', icon: Truck };
    }
  };

  const statusConfig = getStatusConfig(trip.status);
  const StatusIcon = statusConfig.icon;

  const handleContactTransporter = () => {
    const message = encodeURIComponent(`Hola, necesito coordinar sobre el viaje ${trip.id}.`);
    window.open(`https://wa.me/${trip.transporter.phone.replace(/\s/g, '')}?text=${message}`, '_blank');
  };

  const handleContactDriver = () => {
    if (trip.driver) {
      const message = encodeURIComponent(`Hola, soy el ganadero. Estoy coordinando el viaje ${trip.id}.`);
      window.open(`https://wa.me/${trip.driver.phone.replace(/\s/g, '')}?text=${message}`, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[95vh] overflow-y-auto my-4">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Package className="w-8 h-8" style={{ color: statusConfig.color }} />
                <h2 className="text-3xl font-bold text-gray-900">{trip.id}</h2>
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

        {/* Tabs */}
        <div className="p-6">
          <Tabs defaultValue="viaje" className="w-full">
            <TabsList className="w-full justify-center mb-6">
              <TabsTrigger value="viaje">Viaje</TabsTrigger>
              <TabsTrigger value="transportista">Transportista</TabsTrigger>
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
                      <div className="font-bold text-gray-900">{trip.origin}</div>
                      <div className="text-sm text-gray-600">{trip.originEstancia}</div>
                      <div className="text-xs text-gray-500 mt-1">{trip.pickupDate} a las {trip.pickupTime}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-500 mx-2">{trip.distance} km</span>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-red-600 mt-1" />
                    <div className="flex-1">
                      <div className="text-xs font-medium text-red-900 mb-1">Destino</div>
                      <div className="font-bold text-gray-900">{trip.destination}</div>
                      <div className="text-xs text-gray-500 mt-1">Entrega estimada: {trip.deliveryDate}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-200">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Tipo de ganado</div>
                      <div className="font-medium text-gray-900">{trip.cattleType}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Cantidad</div>
                      <div className="font-medium text-gray-900">{trip.heads} cabezas</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Peso aprox.</div>
                      <div className="font-medium text-gray-900">380 kg/animal</div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-500 mb-1">Precio acordado</div>
                    <div className="text-3xl font-bold" style={{ color: '#1E5126' }}>
                      {formatPrice(trip.agreedPrice)}
                    </div>
                  </div>
                </div>
              </div>

              {/* COTA Checkpoints */}
              {trip.documents.cota.checkpoints.length > 0 && (
                <div className="bg-white border-2 border-gray-200 rounded-lg p-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Puntos de Control COTA</h3>
                  <div className="space-y-3">
                    {trip.documents.cota.checkpoints.map((checkpoint, idx) => (
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
            </TabsContent>

            {/* Tab: Transportista */}
            <TabsContent value="transportista" className="space-y-6 mt-6">
              {/* Transporter Info */}
              <div className="bg-white border-2 border-gray-200 rounded-lg p-5">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Información del transportista
                </h3>
                <div className="mb-4">
                  <div className="font-bold text-gray-900 text-lg mb-1">{trip.transporter.name}</div>
                  <div className="text-sm text-gray-600 mb-2">
                    ★ {trip.transporter.rating} • {trip.transporter.type === 'empresa' ? 'Empresa' : 'Transportista Independiente'}
                  </div>
                  <div className="text-sm text-gray-600">{trip.transporter.phone}</div>
                </div>
                <Button
                  size="sm"
                  className="w-full flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#25D366' }}
                  onClick={handleContactTransporter}
                >
                  <MessageCircle className="w-4 h-4" />
                  Contactar transportista
                </Button>
              </div>

              {/* Driver Info */}
              {trip.driver && (
                <div className="bg-white border-2 border-gray-200 rounded-lg p-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Chofer Asignado
                  </h3>
                  <div className="text-center mb-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                      {trip.driver.photo ? (
                        <img src={trip.driver.photo} alt={trip.driver.name} className="w-20 h-20 rounded-full object-cover" />
                      ) : (
                        <User className="w-10 h-10 text-gray-600" />
                      )}
                    </div>
                    <div className="font-bold text-gray-900 text-lg">{trip.driver.name}</div>
                    <div className="text-sm text-gray-600">{trip.driver.phone}</div>
                  </div>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full flex items-center justify-center gap-2"
                      onClick={() => window.open(`tel:${trip.driver?.phone}`, '_blank')}
                    >
                      <Phone className="w-4 h-4" />
                      Llamar
                    </Button>
                    <Button
                      size="sm"
                      className="w-full flex items-center justify-center gap-2"
                      style={{ backgroundColor: '#25D366' }}
                      onClick={handleContactDriver}
                    >
                      <MessageCircle className="w-4 h-4" />
                      WhatsApp
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

          </Tabs>
        </div>
      </div>
    </div>
  );
}
