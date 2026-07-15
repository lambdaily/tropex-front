import { useState } from 'react';
import {
  Bell, Truck, FileText, MoreHorizontal, Calendar, Clock,
  Phone, MessageCircle, AlertTriangle, CheckCircle2, MapPin,
  ChevronRight, ArrowRight, User, LogOut, Navigation, Play, Info,
} from 'lucide-react';
import { openCall, openWhatsApp } from '../../utils/contact';
import { toast } from 'sonner';
import { MapView, type MapMarker } from '../MapView';
import { coordsForCity, interpolate } from '../../data/paraguay-locations';
import { DriverAccount } from '../dashboards/DriverAccount';
import { TripCompletionFlow, PendingRatingBanner } from '../TripCompletionFlow';

interface DriverDashboardMobileProps {
  userName: string;
  onLogout: () => void;
}

type NavSection = 'viaje' | 'asignados' | 'mapa' | 'documentos' | 'mas' | 'cuenta';

const STATUS_OPTIONS = [
  'En camino a recogida',
  'En tránsito con ganado',
  'Llegando al destino',
  'Descargando ganado',
  'Viaje completado',
] as const;

export function DriverDashboardMobile({ userName, onLogout }: DriverDashboardMobileProps) {
  const [activeNav, setActiveNav] = useState<NavSection>('viaje');
  const [currentStatus, setCurrentStatus] = useState<string>('En tránsito con ganado');
  const [showStatusSheet, setShowStatusSheet] = useState(false);
  const [delayReported, setDelayReported] = useState(false);
  const [completionOpen, setCompletionOpen] = useState(false);
  const [ratingPending, setRatingPending] = useState(false);
  const [tripIdx, setTripIdx] = useState(0);
  const [tripStarted, setTripStarted] = useState(true);
  const [justStarted, setJustStarted] = useState(false);
  const [showStartInfo, setShowStartInfo] = useState(false);
  const [showTripDetail, setShowTripDetail] = useState(false);

  // Viajes asignados al chofer. Al cerrar uno (fotos + rating), el dashboard pasa al siguiente.
  const ASSIGNED = [
    { id: 'ENV-046', origin: 'Estancia San Pedro', originCity: 'Filadelfia', destination: 'Frigorífico Central', destinationCity: 'Asunción', distance: '485 km', heads: 45, cattleType: 'Gordos', forepersonName: 'Carlos Martínez', forepersonPhone: '+595 981 456789', eta: '2 horas', progress: 65, day: '28', month: 'JUN', time: '06:00', startsToday: true },
    { id: 'ENV-047', origin: 'Estancia La Lomita', originCity: 'Loma Plata', destination: 'Feria de Villa Hayes', destinationCity: 'Villa Hayes', distance: '95 km', heads: 30, cattleType: 'Desmamantes', forepersonName: 'José Duarte', forepersonPhone: '+595 982 111 222', eta: '1 h 20m', progress: 0, day: '28', month: 'JUN', time: '14:00', startsToday: true },
    { id: 'ENV-048', origin: 'Estancia Neuland', originCity: 'Neuland', destination: 'Frigorífico Norte', destinationCity: 'Concepción', distance: '320 km', heads: 28, cattleType: 'Novillos', forepersonName: 'Marta Closs', forepersonPhone: '+595 983 333 444', eta: '4 horas', progress: 0, day: '29', month: 'JUN', time: '08:00', startsToday: false },
  ];
  const EMPTY_TRIP = { id: '—', origin: '', originCity: '—', destination: '', destinationCity: '—', distance: '—', heads: 0, cattleType: '—', forepersonName: '—', forepersonPhone: '', eta: '—', progress: 0, day: '', month: '', time: '', startsToday: false };
  const hasTrip = tripIdx < ASSIGNED.length;
  const trip = ASSIGNED[tripIdx] ?? EMPTY_TRIP;
  const progress = trip.progress;
  const upcoming = ASSIGNED.slice(tripIdx + 1);

  const completed = [
    { id: 'ENV-045', date: '18/03', route: 'Filadelfia → Asunción', heads: 45 },
    { id: 'ENV-044', date: '15/03', route: 'Loma Plata → Concepción', heads: 30 },
    { id: 'ENV-043', date: '12/03', route: 'Neuland → Asunción', heads: 38 },
  ];

  const handleReportDelay = () => {
    setDelayReported(true);
    toast.success('Retraso reportado. El ganadero y tu empresa fueron notificados.');
  };

  const handleSelectStatus = (s: string) => {
    setCurrentStatus(s);
    setShowStatusSheet(false);
    if (s === 'Viaje completado') { setCompletionOpen(true); setRatingPending(true); return; }
    toast.success(`Estado actualizado: ${s}`);
  };

  const handleStartTrip = () => {
    setTripStarted(true);
    setCurrentStatus('En camino a recogida');
    setJustStarted(true);
    setTimeout(() => setJustStarted(false), 800);
    toast.success('¡Viaje iniciado! Te seguimos en vivo.');
  };

  // Abre el destino en Google Maps con indicaciones paso a paso (navegación real).
  const openNavigation = () => {
    const dest = coordsForCity(trip.destinationCity);
    const target = dest ? `${dest[0]},${dest[1]}` : encodeURIComponent(trip.destination);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${target}&travelmode=driving`, '_blank');
  };

  // ── Mapa de la ruta ──
  const o = coordsForCity(trip.originCity);
  const d = coordsForCity(trip.destinationCity);
  const mapMarkers: MapMarker[] = [];
  const mapRoute: [number, number][] = [];
  if (o && d) {
    const truckPos = interpolate(o, d, progress);
    mapMarkers.push(
      { id: 'o', lat: o[0], lng: o[1], type: 'origin', label: trip.originCity },
      { id: 'd', lat: d[0], lng: d[1], type: 'destination', label: trip.destinationCity },
      { id: 't', lat: truckPos[0], lng: truckPos[1], type: 'truck', color: '#F58718', label: trip.id },
    );
    mapRoute.push(o, d);
  }


  // ── VIAJE (home) ──────────────────────────────────────────────────────────
  const renderViaje = () => (
    <div style={{ height: '100%', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden' }}>
      {/* Hero: viaje actual / próximo (fijo) */}
      <div style={{ flexShrink: 0, background: 'linear-gradient(150deg, #1E5126 0%, #2d6b38 55%, #1E5126 100%)', borderRadius: 16, padding: '15px 16px 13px', position: 'relative', overflow: 'hidden', boxShadow: '0 6px 22px rgba(30,81,38,0.25)', animation: justStarted ? 'tx-start-hero 0.75s ease' : undefined }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: 'radial-gradient(circle, rgba(245,135,24,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap' }}>{tripStarted ? 'Tu viaje actual' : 'Tu próximo viaje'}</span>
            {!tripStarted && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 800, color: '#fff', background: 'rgba(245,135,24,0.92)', padding: '3px 9px', borderRadius: 7, boxShadow: '0 2px 8px rgba(245,135,24,0.4)' }}>
                <Calendar size={11} /> {trip.day} {trip.month}
              </span>
            )}
          </div>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', background: 'rgba(0,0,0,0.2)', padding: '2px 8px', borderRadius: 99, flexShrink: 0 }}>{trip.id}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>{trip.originCity}</span>
          <ArrowRight size={16} color="rgba(255,255,255,0.5)" />
          <span style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>{trip.destinationCity}</span>
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 3 }}>{trip.distance} · ETA {trip.eta}</div>

        {/* Progress (en curso) o Programado (próximo) */}
        {tripStarted ? (
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>{trip.origin}</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#F58718' }}>{progress}%</span>
            </div>
            <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.18)' }}>
              <div style={{ height: '100%', width: `${progress}%`, borderRadius: 99, background: '#F58718' }} />
            </div>
          </div>
        ) : (
          <div style={{ marginTop: 11, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'rgba(255,255,255,0.78)', background: 'rgba(255,255,255,0.1)', padding: '6px 11px', borderRadius: 9 }}>
            <Clock size={13} color="rgba(255,255,255,0.7)" /> Programado · {trip.day} {trip.month} · {trip.time}
          </div>
        )}

        {/* Datos */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 14 }}>
          {[
            { l: 'Cabezas', v: String(trip.heads) },
            { l: 'Tipo', v: trip.cattleType },
            { l: 'Capataz', v: trip.forepersonName.split(' ')[0] },
          ].map(x => (
            <div key={x.l} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 10px' }}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{x.l}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', marginTop: 2 }}>{x.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mapa de la ruta — FLEXIBLE: absorbe el alto disponible para que nunca haga falta scroll */}
      <div style={{ flex: 1, minHeight: 92, position: 'relative', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <MapView height="100%" interactive={false} markers={mapMarkers} route={mapRoute} />
        <button
          onClick={() => setActiveNav('mapa')}
          style={{ position: 'absolute', bottom: 10, right: 10, zIndex: 500, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: 99, padding: '7px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
        >
          <MapPin size={13} /> Ver mapa
        </button>
      </div>

      {/* Acciones (fijas y compactas) */}
      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Estado actual (en curso) o Empezar viaje (próximo) */}
        {tripStarted ? (
          <button
            onClick={() => setShowStatusSheet(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 11, background: '#fff', borderRadius: 13, border: '1px solid rgba(0,0,0,0.07)', padding: '10px 13px', cursor: 'pointer', textAlign: 'left', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#1E512612', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Navigation size={18} color="#1E5126" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 9.5, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Estado actual</div>
              <div style={{ fontSize: 14.5, fontWeight: 800, color: '#111', marginTop: 1 }}>{currentStatus}</div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#1E5126', flexShrink: 0 }}>Cambiar</span>
            <ChevronRight size={16} color="#1E5126" />
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 9, alignItems: 'stretch' }}>
            <button
              onClick={() => { if (trip.startsToday) handleStartTrip(); }}
              disabled={!trip.startsToday}
              className={trip.startsToday ? 'tx-pulse-btn' : ''}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, borderRadius: 13, border: 'none', padding: '14px 12px', cursor: trip.startsToday ? 'pointer' : 'not-allowed', background: trip.startsToday ? '#1E5126' : '#E5E7EB', color: trip.startsToday ? '#fff' : '#9CA3AF', fontSize: 15, fontWeight: 800 }}
            >
              <Play size={18} fill={trip.startsToday ? '#fff' : 'none'} /> {trip.startsToday ? 'Empezar viaje' : `Disponible el ${trip.day} ${trip.month}`}
            </button>
            <button onClick={() => setShowStartInfo(true)} aria-label="Información" style={{ width: 46, flexShrink: 0, borderRadius: 13, border: '1px solid rgba(0,0,0,0.1)', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Info size={19} color="#1E5126" />
            </button>
          </div>
        )}

        {/* Reportar retraso + Ver detalles */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <button
            onClick={handleReportDelay}
            disabled={delayReported}
            style={{ background: delayReported ? '#1E512612' : '#fff', border: `1.5px solid ${delayReported ? '#1E5126' : 'rgba(0,0,0,0.1)'}`, borderRadius: 12, padding: '12px 8px', cursor: delayReported ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
          >
            {delayReported ? <CheckCircle2 size={17} color="#1E5126" strokeWidth={2.4} /> : <AlertTriangle size={17} color="#F58718" strokeWidth={2.4} />}
            <span style={{ fontSize: 12.5, fontWeight: 800, color: delayReported ? '#1E5126' : '#111', whiteSpace: 'nowrap' }}>{delayReported ? 'Retraso ✓' : 'Reportar retraso'}</span>
          </button>
          <button onClick={() => setShowTripDetail(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: '12px 8px', fontSize: 12.5, fontWeight: 800, color: '#1E5126', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <FileText size={16} /> Ver detalles
          </button>
        </div>

        {/* Contactar al capataz */}
        <div>
          <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 700, margin: '1px 2px 6px', display: 'flex', alignItems: 'center', gap: 5 }}>
            <User size={11} /> Capataz · <span style={{ color: '#374151', fontWeight: 800 }}>{trip.forepersonName}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button onClick={() => openCall(trip.forepersonPhone)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '12px 0', borderRadius: 12, border: '1.5px solid #1E5126', background: '#fff', color: '#1E5126', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}><Phone size={15} /> Llamar</button>
            <button onClick={() => openWhatsApp(trip.forepersonPhone, `Hola ${trip.forepersonName}, soy el chofer del viaje ${trip.id}.`)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '12px 0', borderRadius: 12, border: 'none', background: '#25D366', color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}><MessageCircle size={15} /> WhatsApp</button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── MAPA (tab dedicado, full screen) ───────────────────────────────────────
  const renderMapa = () => (
    <div style={{ position: 'relative', height: '100%' }}>
      <MapView height="100%" markers={mapMarkers} route={mapRoute} />
      {/* Tarjeta de destino + navegar */}
      <div style={{ position: 'absolute', bottom: 14, left: 12, right: 12, zIndex: 500, background: '#fff', borderRadius: 16, padding: '13px 15px', boxShadow: '0 6px 20px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#d4183d15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <MapPin size={18} color="#d4183d" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>{trip.destination}</div>
            <div style={{ fontSize: 11, color: '#888' }}>{trip.destinationCity} · {trip.distance} · ETA {trip.eta}</div>
          </div>
        </div>
        <button
          onClick={openNavigation}
          style={{ marginTop: 11, width: '100%', background: '#1E5126', color: '#fff', border: 'none', borderRadius: 12, padding: '14px 0', fontSize: 14, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', boxShadow: '0 4px 14px rgba(30,81,38,0.3)' }}
        >
          <Navigation size={17} /> Navegar con Google Maps
        </button>
      </div>
    </div>
  );

  // ── ASIGNADOS ──────────────────────────────────────────────────────────────
  const renderAsignados = () => (
    <div style={{ padding: '14px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111', margin: '4px 2px 2px' }}>Viajes asignados</h2>
      {upcoming.map(t => (
        <div key={t.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(0,0,0,0.06)', padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 46, borderRadius: 11, background: '#1E512610', textAlign: 'center', padding: '7px 0', flexShrink: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#1E5126', lineHeight: 1 }}>{t.day}</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: '#1E5126', textTransform: 'uppercase' }}>{t.month}</div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>{t.originCity} → {t.destinationCity}</div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}><span style={{ fontFamily: 'monospace' }}>{t.id}</span> · {t.time} · {t.heads} cab.</div>
          </div>
        </div>
      ))}
      <div style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 8 }}>Estos son tus próximos viajes confirmados.</div>
    </div>
  );

  // ── MÁS ────────────────────────────────────────────────────────────────────
  const renderMas = () => (
    <div style={{ padding: '14px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', padding: '16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#1E5126', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <User size={22} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#111' }}>{userName}</div>
          <div style={{ fontSize: 12, color: '#888' }}>Chofer · 22 viajes este mes</div>
        </div>
      </div>

      <div>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '4px 2px 8px' }}>Viajes completados</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {completed.map(t => (
            <div key={t.id} style={{ background: '#fff', borderRadius: 13, border: '1px solid rgba(0,0,0,0.06)', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <CheckCircle2 size={18} color="#1E5126" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{t.route}</div>
                <div style={{ fontSize: 11, color: '#888' }}><span style={{ fontFamily: 'monospace' }}>{t.id}</span> · {t.date} · {t.heads} cab.</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={onLogout} style={{ marginTop: 4, background: '#fff', border: '1px solid rgba(212,24,61,0.25)', borderRadius: 13, padding: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#d4183d', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
        <LogOut size={16} /> Cerrar sesión
      </button>
    </div>
  );

  // Ver más detalles del viaje (pantalla completa).
  const renderTripDetail = () => (
    <div style={{ position: 'fixed', inset: 0, zIndex: 75, background: '#F6F1E8', display: 'flex', flexDirection: 'column', fontFamily: '"IBM Plex Sans", system-ui, sans-serif' }}>
      <div style={{ background: '#1E5126', padding: '14px 16px 16px', flexShrink: 0 }}>
        <button onClick={() => setShowTripDetail(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 0, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}><ChevronRight size={16} style={{ transform: 'rotate(180deg)' }} /> Volver</button>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>{trip.id} · {tripStarted ? 'En curso' : 'Próximo viaje'}</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginTop: 2 }}>{trip.originCity} → {trip.destinationCity}</div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 40px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)' }}>
          <MapView height={180} interactive={false} markers={mapMarkers} route={mapRoute} />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#1E5126', background: '#1E512612', padding: '7px 12px', borderRadius: 10 }}><Calendar size={13} /> {trip.day} {trip.month} · {trip.time}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: '#374151', background: '#fff', border: '1px solid rgba(0,0,0,0.08)', padding: '7px 12px', borderRadius: 10 }}><MapPin size={13} color="#9CA3AF" /> {trip.distance} · ETA {trip.eta}</span>
        </div>
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(0,0,0,0.06)', padding: '14px 16px' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#111', marginBottom: 10 }}>Detalles del ganado</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[['Cabezas', String(trip.heads)], ['Tipo', trip.cattleType], ['Recogida', trip.origin], ['Destino', trip.destination]].map(([l, v]) => (
              <div key={l}>
                <div style={{ fontSize: 10.5, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: 2 }}>{l}</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#111' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid rgba(0,0,0,0.06)', padding: '14px 16px' }}>
          <div style={{ fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: 8 }}>Capataz del establecimiento</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#1E5126', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{(trip.forepersonName || '—').split(' ').map(n => n[0]).slice(0, 2).join('')}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>{trip.forepersonName}</div>
              <div style={{ fontSize: 11, color: '#888' }}>{trip.forepersonPhone}</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button onClick={() => openCall(trip.forepersonPhone)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px 0', borderRadius: 11, border: '1.5px solid #1E5126', background: '#fff', color: '#1E5126', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}><Phone size={15} /> Llamar</button>
            <button onClick={() => openWhatsApp(trip.forepersonPhone, `Hola ${trip.forepersonName}, soy el chofer del viaje ${trip.id}.`)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px 0', borderRadius: 11, border: 'none', background: '#25D366', color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}><MessageCircle size={15} /> WhatsApp</button>
          </div>
        </div>
        {!tripStarted && (
          <button onClick={() => { if (trip.startsToday) { handleStartTrip(); setShowTripDetail(false); } }} disabled={!trip.startsToday} className={trip.startsToday ? 'tx-pulse-btn' : ''} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, borderRadius: 14, border: 'none', padding: '15px 0', cursor: trip.startsToday ? 'pointer' : 'not-allowed', background: trip.startsToday ? '#1E5126' : '#E5E7EB', color: trip.startsToday ? '#fff' : '#9CA3AF', fontSize: 15, fontWeight: 800 }}>
            <Play size={18} fill={trip.startsToday ? '#fff' : 'none'} /> {trip.startsToday ? 'Empezar viaje' : `Disponible el ${trip.day} ${trip.month}`}
          </button>
        )}
      </div>
    </div>
  );

  // Estado cuando no hay viaje asignado (tras cerrar el último).
  const noTripsHero = (
    <div style={{ padding: '12px 14px' }}>
      <div style={{ background: 'linear-gradient(150deg, #1E5126 0%, #2d6b38 55%, #1E5126 100%)', borderRadius: 16, padding: '30px 22px', textAlign: 'center', boxShadow: '0 6px 22px rgba(30,81,38,0.25)' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}><CheckCircle2 size={28} color="#fff" /></div>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>¡Estás al día!</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)', marginTop: 7, lineHeight: 1.5 }}>No tenés viajes asignados ahora. Tu empresa te avisará cuando te asigne el próximo.</div>
      </div>
    </div>
  );

  const navItems: { key: NavSection; icon: typeof Truck; label: string }[] = [
    { key: 'viaje', icon: Truck, label: 'Viaje' },
    { key: 'asignados', icon: Calendar, label: 'Asignados' },
    { key: 'mapa', icon: MapPin, label: 'Mapa' },
    { key: 'mas', icon: MoreHorizontal, label: 'Más' },
  ];

  return (
    <div style={{ height: '100dvh', background: '#F6F1E8', fontFamily: '"IBM Plex Sans", system-ui, sans-serif', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <style>{`
        @keyframes tx-pulse-btn { 0%,100% { box-shadow: 0 4px 14px rgba(30,81,38,0.35); } 50% { box-shadow: 0 6px 24px rgba(30,81,38,0.6); transform: translateY(-1px); } }
        .tx-pulse-btn { animation: tx-pulse-btn 1.5s ease-in-out infinite; }
        @keyframes tx-start-hero { 0% { transform: scale(0.985); } 38% { transform: scale(1.012); box-shadow: 0 0 0 6px rgba(245,135,24,0.35); } 100% { transform: scale(1); box-shadow: 0 6px 22px rgba(30,81,38,0.25); } }
      `}</style>
      {/* Status sheet */}
      {showStatusSheet && (
        <div onClick={() => setShowStatusSheet(false)} style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', width: '100%', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: '14px 16px 28px', maxHeight: '82vh', overflowY: 'auto' }}>
            <div style={{ width: 40, height: 4, borderRadius: 99, background: '#E5E7EB', margin: '0 auto 14px' }} />
            <div style={{ fontSize: 17, fontWeight: 800, color: '#111', marginBottom: 12 }}>Actualizar estado del viaje</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {STATUS_OPTIONS.map(s => {
                const active = s === currentStatus;
                return (
                  <button key={s} onClick={() => handleSelectStatus(s)} style={{ textAlign: 'left', padding: '15px 14px', borderRadius: 13, border: `2px solid ${active ? '#1E5126' : '#E5E7EB'}`, background: active ? '#1E512610' : '#fff', cursor: 'pointer' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>{s}</div>
                    {active && <div style={{ fontSize: 11, fontWeight: 700, color: '#1E5126', marginTop: 3 }}>✓ Estado actual</div>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Top bar — header TX de marca (oculto en mapa/cuenta que traen su propio header) */}
      {activeNav !== 'mapa' && activeNav !== 'cuenta' && (
        <div style={{ flexShrink: 0, zIndex: 30, background: '#1E5126', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><img src="/tropex-isotipo.png" alt="TROPEX" style={{ width: 22, height: 22, objectFit: 'contain' }} /></div>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1 }}>TROPEX · Chofer</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', lineHeight: 1.2, marginTop: 2 }}>Hola, {userName.split(' ')[0]}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
              <Bell size={17} color="#fff" />
              <span style={{ position: 'absolute', top: 8, right: 9, width: 7, height: 7, borderRadius: '50%', background: '#F58718' }} />
            </button>
            <button onClick={() => setActiveNav('cuenta')} aria-label="Cuenta" style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <User size={17} color="#fff" />
            </button>
          </div>
        </div>
      )}

      {/* Content — rellena el alto disponible; el mapa flexiona para que nunca haga falta scroll */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {ratingPending && !completionOpen && activeNav !== 'cuenta' && activeNav !== 'mapa' && (
          <div style={{ flexShrink: 0, padding: '12px 14px 0' }}>
            <PendingRatingBanner tripId={trip.id} onResume={() => setCompletionOpen(true)} />
          </div>
        )}
        <div style={{ flex: 1, minHeight: 0, overflowY: (activeNav === 'viaje' || activeNav === 'mapa') ? 'hidden' : 'auto' }}>
          {activeNav === 'viaje' && (hasTrip ? renderViaje() : noTripsHero)}
          {activeNav === 'asignados' && renderAsignados()}
          {activeNav === 'mapa' && (hasTrip ? renderMapa() : noTripsHero)}
          {activeNav === 'mas' && renderMas()}
          {activeNav === 'cuenta' && <DriverAccount userName={userName} onLogout={onLogout} onBack={() => setActiveNav('viaje')} />}
        </div>
      </div>

      {showTripDetail && hasTrip && renderTripDetail()}

      {showStartInfo && (
        <div onClick={() => setShowStartInfo(false)} style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'flex-end' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', width: '100%', borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: '16px 18px 28px', maxHeight: '85vh', overflowY: 'auto', fontFamily: '"IBM Plex Sans", system-ui, sans-serif' }}>
            <div style={{ width: 40, height: 4, borderRadius: 99, background: '#E5E7EB', margin: '0 auto 14px' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#1E512612', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Info size={18} color="#1E5126" /></div>
              <div style={{ fontSize: 17, fontWeight: 800, color: '#111' }}>Cómo empezar el viaje</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                ['Te avisamos', 'Te vamos a mandar notificaciones para que no te olvides de apretar "Empezar viaje" el día del flete.'],
                ['Solo el día del viaje', 'El botón se habilita únicamente el día del flete, para evitar que el viaje se inicie antes de tiempo.'],
                ['Seguimiento en vivo', 'El día del flete, los administradores de TROPEX tienen acceso a tu ubicación para ver el seguimiento y si arrancás el viaje o no.'],
              ].map(([t, d]) => (
                <div key={t} style={{ display: 'flex', gap: 10 }}>
                  <CheckCircle2 size={18} color="#1E5126" style={{ flexShrink: 0, marginTop: 1 }} />
                  <div><div style={{ fontSize: 13.5, fontWeight: 800, color: '#111' }}>{t}</div><div style={{ fontSize: 12.5, color: '#6B7280', lineHeight: 1.5, marginTop: 1 }}>{d}</div></div>
                </div>
              ))}
            </div>
            <button onClick={() => setShowStartInfo(false)} style={{ marginTop: 18, width: '100%', background: '#1E5126', color: '#fff', border: 'none', borderRadius: 13, padding: '13px 0', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>Entendido</button>
          </div>
        </div>
      )}

      {completionOpen && hasTrip && (
        <TripCompletionFlow tripId={trip.id} route={`${trip.originCity} → ${trip.destinationCity}`} counterpart={trip.origin || 'el ganadero'} destinationType={trip.destination.toLowerCase().includes('frigor') ? 'frigorifico' : 'estancia'}
          onDismiss={() => { setCompletionOpen(false); toast.warning('Acordate de cerrar el viaje: fotos y calificación.'); }}
          onComplete={() => { setCompletionOpen(false); setRatingPending(false); setTripStarted(false); setCurrentStatus('En camino a recogida'); const more = tripIdx + 1 < ASSIGNED.length; setTripIdx(i => i + 1); toast.success(more ? 'Viaje cerrado. Tu próximo viaje ya aparece listo para empezar.' : 'Viaje cerrado. No tenés más viajes asignados.'); }} />
      )}

      {/* Bottom nav (en flujo, fija al pie por el layout flex) */}
      <div style={{ flexShrink: 0, background: '#fff', borderTop: '1px solid rgba(0,0,0,0.08)', display: 'flex', padding: '6px 4px', boxShadow: '0 -2px 12px rgba(0,0,0,0.05)' }}>
        {navItems.map(({ key, icon: Icon, label }) => {
          const active = activeNav === key;
          return (
            <button key={key} onClick={() => setActiveNav(key)} style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '6px 0' }}>
              <Icon size={20} color={active ? '#1E5126' : '#9CA3AF'} strokeWidth={active ? 2.4 : 1.9} />
              <span style={{ fontSize: 10, fontWeight: active ? 800 : 600, color: active ? '#1E5126' : '#9CA3AF' }}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
