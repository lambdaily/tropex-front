import { useState } from 'react';
import { MapPin, Truck, AlertTriangle, ArrowRight, Check, Navigation } from 'lucide-react';
import { Button } from '../ui/button';

interface Trip {
  id: string;
  rancherId: string;
  rancherName: string;
  rancherPhone: string;
  establishmentName: string;
  establishmentCode: string;
  origin: string;
  originCoords: string;
  destination: string;
  destinationCoords: string;
  cattleType: string;
  heads: number;
  distance: number;
  pickupDate: string;
  pickupTime: string;
  estimatedDuration: string;
  specialRequirements?: string;
  agreedPrice: number;
}

interface Driver {
  id: string;
  name: string;
  tripsCompleted: number;
  rating: number;
  available: boolean;
  currentLocation: string;
  distanceFromPickup: number;
}

interface TripAssignmentScreenProps {
  trip: Trip;
  userType: 'empresa' | 'owner-operator';
  onConfirm: (driverId?: string, vehicleId?: string) => void;
  onCancel: () => void;
}

const VEHICLE_DRIVER_MAP: Record<string, string> = {
  'CAM-004': 'DRV-002',
  'CAM-009': 'DRV-004',
  'CAM-012': 'DRV-005',
};

import { toast } from 'sonner';
export function TripAssignmentScreen({ trip, userType, onConfirm, onCancel }: TripAssignmentScreenProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');

  const allDrivers: Driver[] = [
    { id: 'DRV-002', name: 'Roberto Silva', tripsCompleted: 19, rating: 4.6, available: true, currentLocation: 'Filadelfia', distanceFromPickup: 35 },
    { id: 'DRV-004', name: 'Juan Pérez', tripsCompleted: 15, rating: 4.5, available: true, currentLocation: 'Loma Plata', distanceFromPickup: 80 },
    { id: 'DRV-005', name: 'Ana López', tripsCompleted: 22, rating: 4.7, available: true, currentLocation: 'Villa Hayes', distanceFromPickup: 380 },
  ];

  const rawVehicles = [
    { id: 'CAM-004', plate: 'DEF-456', capacity: 35, available: true },
    { id: 'CAM-009', plate: 'JKL-012', capacity: 40, available: true },
    { id: 'CAM-012', plate: 'MNO-345', capacity: 45, available: true },
  ];

  const vehicleCards = rawVehicles
    .map(vehicle => {
      const driverId = VEHICLE_DRIVER_MAP[vehicle.id];
      const driver = allDrivers.find(d => d.id === driverId) ?? null;
      return { vehicle, driver, distance: driver?.distanceFromPickup ?? 9999 };
    })
    .sort((a, b) => a.distance - b.distance);

  const selectedEntry = selectedVehicle
    ? vehicleCards.find(c => c.vehicle.id === selectedVehicle) ?? null
    : null;
  const selectedDriverData = selectedEntry?.driver ?? null;

  const formatPrice = (price: number) => '₲ ' + price.toLocaleString('es-PY');

  const handleConfirm = () => {
    if (userType === 'empresa' && !selectedVehicle) {
      toast.error('Por favor seleccioná un vehículo');
      return;
    }
    const driverId = selectedVehicle ? VEHICLE_DRIVER_MAP[selectedVehicle] : undefined;
    onConfirm(driverId, selectedVehicle || undefined);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F6F1E8' }}>
      {/* Header */}
      <div className="bg-white px-6 py-4 mb-6" style={{ borderBottom: '2px solid #1E5126' }}>
        <div className="max-w-7xl mx-auto">
          <button
            onClick={onCancel}
            className="text-sm text-gray-600 hover:text-gray-900 mb-2 flex items-center gap-2"
          >
            ← Volver a solicitudes
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Asignar Viaje</h1>
          <p className="text-gray-600 mt-1">
            Solicitud {trip.id} - {trip.origin} → {trip.destination}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Map and Vehicle Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map Visualization */}
            <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Navigation className="w-5 h-5" />
                  Ubicación del Vehículo y Punto de Recogida
                </h2>
              </div>

              <div className="relative h-96 bg-gradient-to-br from-blue-100 via-green-50 to-yellow-50">
                <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: `
                    linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                  `,
                  backgroundSize: '30px 30px'
                }}></div>

                {selectedDriverData && (
                  <>
                    <div className="absolute top-1/4 left-1/4 flex flex-col items-center animate-pulse">
                      <div className="relative">
                        <div className="absolute -inset-2 bg-blue-400 rounded-full opacity-30 animate-ping"></div>
                        <div className="relative bg-blue-600 rounded-full p-3 shadow-lg">
                          <Truck className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="mt-2 bg-white px-3 py-1 rounded-full shadow-lg border-2 border-blue-600">
                        <div className="text-xs font-bold text-blue-900">{selectedEntry?.vehicle.plate}</div>
                        <div className="text-xs text-blue-700">{selectedDriverData.currentLocation}</div>
                      </div>
                    </div>

                    <div className="absolute bottom-1/4 right-1/4 flex flex-col items-center">
                      <div className="relative">
                        <div className="absolute -inset-2 bg-green-400 rounded-full opacity-30 animate-ping"></div>
                        <div className="relative bg-green-600 rounded-full p-3 shadow-lg">
                          <MapPin className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="mt-2 bg-white px-3 py-1 rounded-full shadow-lg border-2 border-green-600">
                        <div className="text-xs font-bold text-green-900">{trip.origin}</div>
                        <div className="text-xs text-green-700">Punto de recogida</div>
                      </div>
                    </div>

                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      <defs>
                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" style={{ stopColor: '#2563eb', stopOpacity: 1 }} />
                          <stop offset="100%" style={{ stopColor: '#16a34a', stopOpacity: 1 }} />
                        </linearGradient>
                        <filter id="glow">
                          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                          <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                      <path
                        d="M 25% 25% Q 50% 10%, 75% 75%"
                        stroke="url(#lineGradient)"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray="10,5"
                        filter="url(#glow)"
                        className="animate-pulse"
                      />
                    </svg>

                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 py-2 rounded-lg shadow-lg border-2 border-gray-300">
                      <div className="text-xs text-gray-600">Distancia al origen</div>
                      <div className="text-lg font-bold text-gray-900">{selectedDriverData.distanceFromPickup} km</div>
                    </div>
                  </>
                )}

                {!selectedDriverData && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium">Seleccioná un vehículo para ver su ubicación</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Vehicle Selection (driver shown inline) */}
            {userType === 'empresa' && (
              <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Seleccionar Vehículo
                </h2>
                <div className="space-y-3">
                  {vehicleCards.map(({ vehicle, driver, distance }, idx) => {
                    const isClosest = idx === 0;
                    const isSelected = selectedVehicle === vehicle.id;
                    const disabled = !vehicle.available || !driver;

                    return (
                      <div
                        key={vehicle.id}
                        onClick={() => !disabled && setSelectedVehicle(vehicle.id)}
                        className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                          disabled
                            ? 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                            : isSelected
                            ? 'border-green-600 bg-green-50 cursor-pointer'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 cursor-pointer'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'bg-green-600' : disabled ? 'bg-gray-200' : 'bg-gray-300'
                        }`}>
                          <Truck className="w-6 h-6 text-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                            {vehicle.plate}
                            {isSelected && <Check className="w-5 h-5 text-green-600" />}
                            {isClosest && !disabled && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                                Más cercano
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 mt-0.5">
                            Capacidad: {vehicle.capacity} cabezas
                            <span className="mx-1.5 text-gray-400">·</span>
                            ~{distance} km del punto de recogida
                          </div>
                          {driver && (
                            <div className="text-xs text-gray-500 mt-1">
                              Chofer: <span className="font-medium text-gray-700">{driver.name}</span>
                              <span className="mx-1.5 text-gray-400">·</span>
                              ★ {driver.rating}
                              <span className="mx-1.5 text-gray-400">·</span>
                              {driver.tripsCompleted} viajes
                            </div>
                          )}
                        </div>

                        <div className="flex-shrink-0">
                          {!disabled ? (
                            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                              Disponible
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-gray-200 text-gray-600 text-xs font-semibold rounded-full">
                              No disponible
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Trip Details */}
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Detalles del Viaje</h2>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-500">Solicitud</div>
                  <div className="font-mono font-bold text-gray-900">{trip.id}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Ganadero</div>
                  <div className="font-medium text-gray-900">{trip.rancherName}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Establecimiento</div>
                  <div className="font-medium text-gray-900">{trip.establishmentName}</div>
                  <div className="text-xs text-gray-600">{trip.establishmentCode}</div>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="text-xs text-gray-500 mb-2">Ruta</div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">{trip.origin}</span>
                  </div>
                  <div className="flex items-center justify-center my-1">
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500 mx-2">{trip.distance} km</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-red-600" />
                    <span className="font-medium">{trip.destination}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="text-xs text-gray-500">Ganado</div>
                  <div className="font-medium text-gray-900">{trip.cattleType} - {trip.heads} cabezas</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Recogida</div>
                  <div className="font-medium text-gray-900">{trip.pickupDate} a las {trip.pickupTime}</div>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <div className="text-xs text-gray-500">Precio acordado</div>
                  <div className="text-2xl font-bold" style={{ color: '#1E5126' }}>
                    {formatPrice(trip.agreedPrice)}
                  </div>
                </div>
              </div>
            </div>

            {/* Cancellation warning */}
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-red-900 mb-1">⚠️ Multas por Cancelación</h3>
                  <p className="text-sm text-red-800">
                    Las cancelaciones no justificadas después de confirmar tienen penalidades:
                  </p>
                </div>
              </div>
              <ul className="space-y-1 text-sm text-red-800 ml-8">
                <li>• Primera cancelación: Advertencia</li>
                <li>• Segunda: Multa del 10% del valor</li>
                <li>• Tercera: Suspensión temporal</li>
              </ul>
            </div>

            {/* Confirm Button */}
            <Button
              onClick={handleConfirm}
              disabled={userType === 'empresa' && !selectedVehicle}
              className="w-full h-14 text-lg font-bold"
              style={{ backgroundColor: '#1E5126' }}
            >
              <Check className="w-6 h-6 mr-2" />
              Confirmar Asignación
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
