import { useState, type CSSProperties } from 'react';
import { X, Check, Truck, MapPin, Star } from 'lucide-react';
import { getEmpresaFleet, getEmpresaDrivers } from '../../store/demoStore';
import { useIsMobile } from '../ui/use-mobile';
import { MapView, type MapMarker } from '../MapView';
import { coordsForCity } from '../../data/paraguay-locations';

interface TripInfo {
  id: string;
  origin: string;
  destination: string;
  heads: number;
  cattleType: string;
  guides?: Array<{ guideNumber: 1 | 2; heads: number; status: string }>;
}

interface FleetAssignmentPopupProps {
  trip: TripInfo;
  guideNumber?: 1 | 2;
  /** Texto del botón de confirmar (varía según el flujo: ofertar vs aceptar). */
  confirmLabel?: string;
  onConfirm: (assignment: { driverId: string; vehicleId: string }) => void;
  onCancel: () => void;
}

const DEFAULT_COORDS: [number, number] = [-25.26, -57.58];

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isAdultCattle(cattleType: string): boolean {
  return ['gordos', 'novillos', 'vaquillonas', 'vacas', 'toros', 'fat'].includes(cattleType.toLowerCase());
}

function vehicleTypeLabel(type: string): string {
  switch (type) {
    case 'camion-chico': return 'Camión chico';
    case 'camion-mediano': return 'Camión mediano';
    case 'camion-acoplado': return 'Camión con acoplado';
    case 'semirremolque': return 'Semirremolque';
    default: return type;
  }
}

const chip = (color: string, bg: string): CSSProperties => ({ fontSize: 10, fontWeight: 700, color, background: bg, padding: '2px 8px', borderRadius: 99, whiteSpace: 'nowrap' });

export function FleetAssignmentPopup({ trip, guideNumber, confirmLabel = 'Continuar →', onConfirm, onCancel }: FleetAssignmentPopupProps) {
  const isMobile = useIsMobile();
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

  const fleet = getEmpresaFleet();
  const drivers = getEmpresaDrivers();

  const [pickupLat, pickupLng] = coordsForCity(trip.origin) ?? DEFAULT_COORDS;

  const requiredHeads = guideNumber && trip.guides
    ? (trip.guides.find(g => g.guideNumber === guideNumber)?.heads ?? trip.heads)
    : trip.heads;

  const adultCattle = isAdultCattle(trip.cattleType);

  // Camiones ordenados: disponibles primero, luego por cercanía al origen.
  const driverCards = drivers.map(driver => {
    const vehicle = fleet.find(v => v.id === driver.assignedVehicleId) ?? null;
    const distance = Math.round(distanceKm(driver.currentLat, driver.currentLng, pickupLat, pickupLng));
    const driverUnavailable = !driver.available;
    const vehicleUnavailable = !vehicle || vehicle.status !== 'disponible';
    let capacityInsufficient = false;
    let capacityLabel = '';
    if (vehicle) {
      const cap = adultCattle ? vehicle.capacityAdults : vehicle.capacityYoung;
      if (cap < requiredHeads) {
        capacityInsufficient = true;
        capacityLabel = `Capacidad insuficiente (${cap}/${requiredHeads} cab.)`;
      }
    }
    const disabled = driverUnavailable || vehicleUnavailable || capacityInsufficient || !vehicle;
    return { driver, vehicle, distance, disabled, driverUnavailable, vehicleUnavailable, capacityInsufficient, capacityLabel };
  }).sort((a, b) => (Number(a.disabled) - Number(b.disabled)) || (a.distance - b.distance));

  const closestAvailableId = driverCards.find(c => !c.disabled)?.driver.id ?? null;
  const selectedEntry = selectedDriverId ? driverCards.find(c => c.driver.id === selectedDriverId) ?? null : null;
  const canConfirm = !!selectedEntry && !selectedEntry.disabled && !!selectedEntry.vehicle;

  const subtitle = guideNumber
    ? `${trip.id} · Guía ${guideNumber} · ${requiredHeads} cab. · ${trip.origin} → ${trip.destination}`
    : `${trip.id} · ${requiredHeads} cab. · ${trip.origin} → ${trip.destination}`;

  const handleConfirm = () => {
    if (canConfirm && selectedEntry?.vehicle) {
      onConfirm({ driverId: selectedEntry.driver.id, vehicleId: selectedEntry.vehicle.id });
    }
  };

  const mapMarkers: MapMarker[] = [
    { id: '__pickup', lat: pickupLat, lng: pickupLng, type: 'origin', label: trip.origin },
    ...driverCards.filter(e => e.vehicle).map(e => ({
      id: e.driver.id,
      lat: e.driver.currentLat,
      lng: e.driver.currentLng,
      type: 'truck' as const,
      color: e.disabled ? '#9CA3AF' : selectedDriverId === e.driver.id ? '#1E5126' : e.driver.id === closestAvailableId ? '#F58718' : '#1E5126',
      label: `${e.vehicle!.plate}${e.disabled ? '' : ` · ${e.distance} km`}`,
    })),
  ];

  const body = (
    <>
      {/* Mapa real con la flota y el punto de recogida */}
      <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid #E5E7EB' }}>
        <MapView
          height={isMobile ? 180 : 210}
          markers={mapMarkers}
          onMarkerClick={(id) => { const e = driverCards.find(c => c.driver.id === id); if (e && !e.disabled) setSelectedDriverId(id); }}
        />
      </div>
      <div style={{ fontSize: 11, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Camiones ordenados por cercanía al origen
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {driverCards.map((entry) => {
          const { driver, vehicle, distance, disabled, driverUnavailable, vehicleUnavailable, capacityInsufficient, capacityLabel } = entry;
          const isClosest = driver.id === closestAvailableId;
          const isSelected = selectedDriverId === driver.id;
          const cap = vehicle ? (adultCattle ? vehicle.capacityAdults : vehicle.capacityYoung) : 0;
          return (
            <button
              key={driver.id}
              disabled={disabled}
              onClick={() => !disabled && setSelectedDriverId(driver.id)}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '13px 14px', borderRadius: 14, border: `1.5px solid ${isSelected ? '#1E5126' : '#E5E7EB'}`, background: isSelected ? 'rgba(30,81,38,0.06)' : disabled ? '#FAFAFA' : '#fff', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.62 : 1, width: '100%', textAlign: 'left', transition: 'border-color .15s ease, background .15s ease' }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 11, background: disabled ? '#F3F4F6' : 'rgba(30,81,38,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Truck size={19} color={disabled ? '#9CA3AF' : '#1E5126'} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', marginBottom: 3 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>{vehicle ? vehicle.plate : 'Sin vehículo'}</span>
                  {vehicle && <span style={{ fontSize: 11, color: '#9CA3AF' }}>{vehicleTypeLabel(vehicle.type)}</span>}
                  {isClosest && <span style={chip('#B45309', '#FEF3E2')}>★ Más cercano</span>}
                </div>
                {vehicle && (
                  <div style={{ fontSize: 11, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><MapPin size={11} /> ~{distance} km</span>
                    <span style={{ color: '#D1D5DB' }}>·</span>
                    <span>{cap} cab.</span>
                    <span style={{ color: '#D1D5DB' }}>·</span>
                    <span>{driver.name}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}><Star size={10} style={{ fill: '#F5B301', color: '#F5B301' }} /> {driver.rating}</span>
                  </div>
                )}
                <div style={{ marginTop: 5, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {!disabled && <span style={chip('#065F46', '#ECFDF5')}>Disponible</span>}
                  {driverUnavailable && <span style={chip('#6B7280', '#F3F4F6')}>Chofer no disponible</span>}
                  {!driverUnavailable && vehicleUnavailable && vehicle && <span style={chip('#6B7280', '#F3F4F6')}>Camión {vehicle.status === 'en-viaje' ? 'en viaje' : 'en mantenimiento'}</span>}
                  {capacityInsufficient && <span style={chip('#B91C1C', '#FEF2F2')}>⚠ {capacityLabel}</span>}
                </div>
              </div>
              <div style={{ flexShrink: 0, marginTop: 2 }}>
                {isSelected ? (
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#1E5126', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={14} color="#fff" />
                  </div>
                ) : (
                  <div style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${disabled ? '#E5E7EB' : '#D1D5DB'}` }} />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </>
  );

  // ── Mobile: full-screen sheet ──
  if (isMobile) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 1600, background: '#F6F1E8', display: 'flex', flexDirection: 'column', fontFamily: '"IBM Plex Sans", system-ui, sans-serif' }}>
        <div style={{ background: '#1E5126', padding: '14px 16px 16px', paddingTop: 'max(14px, env(safe-area-inset-top))', flexShrink: 0 }}>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 0, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
            ← Volver
          </button>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>Elegí el camión</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>{subtitle}</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {body}
        </div>
        <div style={{ flexShrink: 0, background: '#fff', borderTop: '1px solid #E5E7EB', padding: '12px 16px calc(12px + env(safe-area-inset-bottom))' }}>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            style={{ width: '100%', padding: '15px 0', borderRadius: 13, border: 'none', background: canConfirm ? '#1E5126' : '#D1D5DB', color: '#fff', fontSize: 15, fontWeight: 800, cursor: canConfirm ? 'pointer' : 'default' }}
          >
            {canConfirm ? confirmLabel : 'Elegí un camión'}
          </button>
        </div>
      </div>
    );
  }

  // ── Desktop: centered dialog ──
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(8,34,26,0.38)', backdropFilter: 'blur(2.5px)', WebkitBackdropFilter: 'blur(2.5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 16, maxWidth: 640, width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 50px rgba(0,0,0,0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '18px 22px', borderBottom: '1px solid #EEF0F3', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 19, fontWeight: 800, color: '#111' }}>Elegí el camión</div>
            <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{subtitle}</div>
          </div>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6 }}><X size={20} color="#6B7280" /></button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {body}
        </div>
        <div style={{ display: 'flex', gap: 12, padding: '16px 22px', borderTop: '1px solid #EEF0F3', flexShrink: 0 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '13px 0', borderRadius: 12, border: '1.5px solid #E5E7EB', background: '#fff', color: '#374151', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Cancelar</button>
          <button onClick={handleConfirm} disabled={!canConfirm} style={{ flex: 1, padding: '13px 0', borderRadius: 12, border: 'none', background: canConfirm ? '#1E5126' : '#D1D5DB', color: '#fff', fontSize: 14, fontWeight: 800, cursor: canConfirm ? 'pointer' : 'default' }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
