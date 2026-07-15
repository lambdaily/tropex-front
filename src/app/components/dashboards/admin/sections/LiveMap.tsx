import { useState } from 'react';
import { Truck, Phone, Star } from 'lucide-react';
import { MapView, type MapMarker } from '../../../MapView';
import { getEmpresaDrivers, getEmpresaFleet } from '../../../../store/demoStore';
import { C, SectionHeader, Card, StatusBadge } from '../kit';

export function LiveMapSection() {
  const drivers = getEmpresaDrivers();
  const fleet = getEmpresaFleet();
  const [focus, setFocus] = useState<string | null>(null);

  const markers: MapMarker[] = drivers.map(d => ({
    id: d.id, lat: d.currentLat, lng: d.currentLng,
    type: d.available ? 'origin' : 'truck', color: d.available ? C.verdeClaro : C.naranja,
    label: d.name.split(' ')[0],
  }));

  const enViaje = drivers.filter(d => !d.available).length;

  return (
    <div>
      <SectionHeader title="Mapa en vivo" subtitle={`${enViaje} de ${drivers.length} unidades en ruta`} />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: 14 }} className="map-grid">
        <Card style={{ overflow: 'hidden', padding: 0 }}>
          <MapView height={560} markers={markers} interactive={true} onMarkerClick={setFocus} />
        </Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 560, overflowY: 'auto' }}>
          {drivers.map(d => {
            const veh = fleet.find(v => v.id === d.assignedVehicleId);
            const on = focus === d.id;
            return (
              <Card key={d.id} onClick={() => setFocus(d.id)} style={{ padding: '13px 14px', cursor: 'pointer', border: on ? `1.5px solid ${C.verde}` : `1px solid ${C.borde}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: d.available ? `${C.verdeClaro}1a` : `${C.naranja}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Truck size={16} color={d.available ? C.verdeClaro : C.naranja} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: C.texto, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.name}</div>
                      <div style={{ fontSize: 11.5, color: C.gris, fontFamily: 'ui-monospace, monospace' }}>{veh?.plate ?? d.assignedVehicleId ?? '—'}</div>
                    </div>
                  </div>
                  <StatusBadge label={d.available ? 'Disponible' : 'En viaje'} color={d.available ? C.verdeClaro : C.naranja} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: C.gris }}><Star size={12} color={C.naranja} fill={C.naranja} /> {d.rating} · {d.tripsCompleted} viajes</span>
                  <a href={`tel:${d.phone}`} onClick={e => e.stopPropagation()} style={{ width: 30, height: 30, borderRadius: 8, border: `1.5px solid ${C.verde}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.verde }}><Phone size={13} /></a>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
      <style>{`@media (max-width: 900px){ .map-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
