import { useState } from 'react';
import { Phone, CheckCircle2, Clock, FileText, Package } from 'lucide-react';
import { MapView, type MapMarker } from '../../../MapView';
import { coordsForCity, interpolate } from '../../../../data/paraguay-locations';
import {
  C, DISPLAY, formatGs, SectionHeader, DataTable, StatusBadge, DetailSheet, Field, EmptyState, type Column,
} from '../kit';

type TripStatus = 'en-transito' | 'programado' | 'completado' | 'retraso';

interface AdminTrip {
  id: string; originCity: string; destCity: string; origin: string; destination: string;
  status: TripStatus; price: number; heads: number; cattleType: string; distance: number;
  rancher: string; transporter: string; driver: string; driverPhone: string;
  progress: number; eta: string; pickupDate: string;
  checkpoints: { name: string; time: string; done: boolean }[];
  docs: { cota: boolean; guia: boolean };
}

const tripStatusMeta: Record<TripStatus, { label: string; color: string }> = {
  'en-transito': { label: 'En tránsito', color: C.verde },
  'programado': { label: 'Programado', color: C.grisClaro },
  'completado': { label: 'Completado', color: C.verdeClaro },
  'retraso': { label: 'Con retraso', color: C.rojo },
};

const TRIPS: AdminTrip[] = [
  { id: 'VIA-2026-004', originCity: 'Filadelfia', destCity: 'Asunción', origin: 'Estancia San Pedro', destination: 'Frigorífico Central', status: 'retraso', price: 1_750_000, heads: 45, cattleType: 'Gordos', distance: 485, rancher: 'Estancia San Pedro', transporter: 'Logística Paraguay SRL', driver: 'Carlos Mendez', driverPhone: '+595 981 123456', progress: 65, eta: '2h 40m', pickupDate: '24/03', checkpoints: [{ name: 'Salida Filadelfia', time: '06:00', done: true }, { name: 'Control Mariscal E.', time: '09:15', done: true }, { name: 'Control Villa Hayes', time: '~13:30', done: false }, { name: 'Entrega Asunción', time: '~16:00', done: false }], docs: { cota: true, guia: true } },
  { id: 'VIA-2026-006', originCity: 'Loma Plata', destCity: 'Villa Hayes', origin: 'Coop. Neuland', destination: 'Frigorífico V. Hayes', status: 'en-transito', price: 1_220_000, heads: 32, cattleType: 'Novillos', distance: 320, rancher: 'Cooperativa Neuland', transporter: 'Transganado SA', driver: 'María González', driverPhone: '+595 981 345678', progress: 40, eta: '3h 10m', pickupDate: '25/03', checkpoints: [{ name: 'Salida Loma Plata', time: '07:30', done: true }, { name: 'Control Pozo Colorado', time: '10:00', done: true }, { name: 'Entrega Villa Hayes', time: '~13:00', done: false }], docs: { cota: true, guia: true } },
  { id: 'VIA-2026-005', originCity: 'Concepción', destCity: 'Asunción', origin: 'Estancia La Esperanza', destination: 'Mercado de Liniers', status: 'en-transito', price: 1_580_000, heads: 38, cattleType: 'Terneros', distance: 412, rancher: 'Estancia La Esperanza', transporter: 'María González', driver: 'María González', driverPhone: '+595 981 345678', progress: 80, eta: '55m', pickupDate: '24/03', checkpoints: [{ name: 'Salida Concepción', time: '05:00', done: true }, { name: 'Control Yby Yaú', time: '08:30', done: true }, { name: 'Entrega Asunción', time: '~12:30', done: false }], docs: { cota: true, guia: false } },
  { id: 'VIA-2026-008', originCity: 'Mariscal Estigarribia', destCity: 'Asunción', origin: 'Estancia Tinfunqué', destination: 'Frigorífico Central', status: 'programado', price: 2_200_000, heads: 50, cattleType: 'Gordos', distance: 560, rancher: 'Estancia Tinfunqué', transporter: 'Logística Paraguay SRL', driver: 'Sin asignar', driverPhone: '', progress: 0, eta: '—', pickupDate: '27/03', checkpoints: [{ name: 'Salida programada', time: '27/03 06:00', done: false }], docs: { cota: false, guia: false } },
  { id: 'VIA-2026-001', originCity: 'Filadelfia', destCity: 'Asunción', origin: 'Estancia San Pedro', destination: 'Frigorífico Central', status: 'completado', price: 1_750_000, heads: 45, cattleType: 'Gordos', distance: 485, rancher: 'Estancia San Pedro', transporter: 'Logística Paraguay SRL', driver: 'Carlos Mendez', driverPhone: '+595 981 123456', progress: 100, eta: 'Entregado', pickupDate: '20/03', checkpoints: [{ name: 'Salida', time: '06:00', done: true }, { name: 'Entrega', time: '14:05', done: true }], docs: { cota: true, guia: true } },
  { id: 'VIA-2026-003', originCity: 'San Pedro', destCity: 'Asunción', origin: 'Estancia Santa Rosa', destination: 'Frigorífico Central', status: 'completado', price: 2_200_000, heads: 55, cattleType: 'Gordos', distance: 280, rancher: 'Estancia Santa Rosa', transporter: 'Transganado SA', driver: 'Ana López', driverPhone: '+595 981 567890', progress: 100, eta: 'Entregado', pickupDate: '18/03', checkpoints: [{ name: 'Salida', time: '07:00', done: true }, { name: 'Entrega', time: '12:40', done: true }], docs: { cota: true, guia: true } },
];

export function TripsSection() {
  const [status, setStatus] = useState<string>('all');
  const [sel, setSel] = useState<AdminTrip | null>(null);
  const rows = TRIPS.filter(t => status === 'all' || t.status === status);

  const columns: Column<AdminTrip>[] = [
    { key: 'id', header: 'Viaje', value: t => t.id, render: t => <span style={{ fontFamily: 'ui-monospace, monospace', fontWeight: 600 }}>{t.id}</span> },
    { key: 'route', header: 'Ruta', value: t => t.originCity, render: t => <div><div style={{ fontWeight: 600 }}>{t.originCity} → {t.destCity}</div><div style={{ fontSize: 12, color: C.gris }}>{t.distance} km · {t.heads} cab.</div></div> },
    { key: 'transporter', header: 'Transportista', value: t => t.transporter, hideMobile: true },
    { key: 'price', header: 'Flete', align: 'right', value: t => t.price, hideMobile: true, render: t => formatGs(t.price) },
    { key: 'progress', header: 'Avance', align: 'right', value: t => t.progress, hideMobile: true, render: t => `${t.progress}%` },
    { key: 'status', header: 'Estado', value: t => tripStatusMeta[t.status].label, render: t => <StatusBadge label={tripStatusMeta[t.status].label} color={tripStatusMeta[t.status].color} /> },
  ];

  const filters = [{ id: 'status', label: 'Estado', value: status, onChange: setStatus, options: [{ value: 'all', label: 'Todos' }, ...(Object.keys(tripStatusMeta) as TripStatus[]).map(s => ({ value: s, label: tripStatusMeta[s].label }))] }];

  return (
    <div>
      <SectionHeader title="Viajes" subtitle={`${TRIPS.length} envíos en el sistema`} />
      {rows.length === 0 ? <EmptyState icon={Package} title="Sin viajes" description="No hay viajes con ese filtro." /> : (
        <DataTable columns={columns} rows={rows} getRowId={t => t.id} onRowClick={setSel} searchKeys={['id', 'originCity', 'destCity', 'transporter', 'rancher']} searchPlaceholder="Buscar viaje, ruta o transportista…" filters={filters} />
      )}

      {sel && (
        <DetailSheet open={!!sel} onClose={() => setSel(null)} title={sel.id} subtitle={`${sel.origin} → ${sel.destination}`} statusNode={<StatusBadge label={tripStatusMeta[sel.status].label} color={tripStatusMeta[sel.status].color} />} width={520}>
          <TripDetail trip={sel} />
        </DetailSheet>
      )}
    </div>
  );
}

function TripDetail({ trip }: { trip: AdminTrip }) {
  const o = coordsForCity(trip.originCity);
  const d = coordsForCity(trip.destCity);
  const markers: MapMarker[] = [];
  const route: [number, number][] = [];
  if (o && d) {
    markers.push({ id: 'o', lat: o[0], lng: o[1], type: 'origin', label: trip.originCity }, { id: 'd', lat: d[0], lng: d[1], type: 'destination', label: trip.destCity });
    if (trip.progress > 0 && trip.progress < 100) { const p = interpolate(o, d, trip.progress); markers.push({ id: 't', lat: p[0], lng: p[1], type: 'truck', color: C.naranja, label: trip.id }); }
    route.push(o, d);
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ borderRadius: 14, overflow: 'hidden', border: `1px solid ${C.borde}` }}>
        <MapView height={200} markers={markers} route={route} interactive={false} />
      </div>

      {trip.progress > 0 && trip.progress < 100 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12.5, color: C.gris }}>Avance · ETA {trip.eta}</span>
            <span style={{ fontSize: 12.5, fontWeight: 800, color: C.naranja }}>{trip.progress}%</span>
          </div>
          <div style={{ height: 7, borderRadius: 99, background: '#eee9dd' }}><div style={{ height: '100%', width: `${trip.progress}%`, borderRadius: 99, background: `linear-gradient(90deg, ${C.verde}, ${C.naranja})` }} /></div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Field label="Flete" value={<span style={{ fontWeight: 700, color: C.verde }}>{formatGs(trip.price)}</span>} />
        <Field label="Carga" value={`${trip.heads} ${trip.cattleType}`} />
        <Field label="Distancia" value={`${trip.distance} km`} />
        <Field label="Retiro" value={trip.pickupDate} />
      </div>

      {/* Participantes */}
      <div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 14, color: C.texto, marginBottom: 10 }}>Participantes</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[{ role: 'Ganadero', name: trip.rancher }, { role: 'Transportista', name: trip.transporter }, { role: 'Chofer', name: trip.driver, phone: trip.driverPhone }].map(p => (
            <div key={p.role} style={{ display: 'flex', alignItems: 'center', gap: 11, background: '#fff', border: `1px solid ${C.borde}`, borderRadius: 11, padding: '10px 12px' }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: `${C.verde}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: DISPLAY, fontWeight: 700, fontSize: 12, color: C.verde, flexShrink: 0 }}>{p.name.split(' ').map(w => w[0]).slice(0, 2).join('')}</div>
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13.5, fontWeight: 600, color: C.texto }}>{p.name}</div><div style={{ fontSize: 11.5, color: C.gris }}>{p.role}</div></div>
              {p.phone && <a href={`tel:${p.phone}`} style={{ width: 32, height: 32, borderRadius: 8, border: `1.5px solid ${C.verde}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.verde }}><Phone size={14} /></a>}
            </div>
          ))}
        </div>
      </div>

      {/* Checkpoints */}
      <div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 14, color: C.texto, marginBottom: 10 }}>Controles del viaje</div>
        {trip.checkpoints.map((cp, i) => (
          <div key={cp.name} style={{ display: 'flex', gap: 11 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: cp.done ? C.verde : '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{cp.done && <CheckCircle2 size={9} color="#fff" />}</div>
              {i < trip.checkpoints.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 16, background: cp.done ? C.verde : '#E5E7EB' }} />}
            </div>
            <div style={{ paddingBottom: 12 }}><div style={{ fontSize: 13, fontWeight: cp.done ? 600 : 400, color: cp.done ? C.texto : C.gris }}>{cp.name}</div><div style={{ fontSize: 11.5, color: C.grisClaro }}>{cp.time}</div></div>
          </div>
        ))}
      </div>

      {/* Documentos */}
      <div style={{ display: 'flex', gap: 10 }}>
        {[{ k: 'COTA', ok: trip.docs.cota }, { k: 'Guía SENACSA', ok: trip.docs.guia }].map(doc => (
          <div key={doc.k} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: `1px solid ${C.borde}`, borderRadius: 10, padding: '10px 12px' }}>
            <FileText size={15} color={doc.ok ? C.verde : C.grisClaro} />
            <span style={{ fontSize: 13, color: C.texto, flex: 1 }}>{doc.k}</span>
            {doc.ok ? <CheckCircle2 size={15} color={C.verde} /> : <Clock size={15} color={C.grisClaro} />}
          </div>
        ))}
      </div>
    </div>
  );
}
