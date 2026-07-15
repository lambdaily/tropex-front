import { useState } from 'react';
import {
  Bell, Truck, FileText, MoreHorizontal, Clock,
  Phone, MessageCircle, AlertTriangle, CheckCircle2, MapPin,
  ChevronRight, ArrowRight, X, Share2, User, LogOut, Navigation,
  Package, DollarSign, TrendingUp,
} from 'lucide-react';
import { openCall, openWhatsApp, shareWhatsApp } from '../../utils/contact';
import { toast } from 'sonner';
import { MapView, type MapMarker } from '../MapView';
import { AvailableTripsView } from '../tropero-v2/AvailableTripsView';
import { OwnerOperatorAccount } from '../dashboards/OwnerOperatorAccount';
import { TripCancelFlow } from '../TripCancelFlow';
import { coordsForCity, interpolate } from '../../data/paraguay-locations';
import { useDemoStore } from '../../store/demoStore';
import { PayoutBreakdown, PayBadge, type PayState } from '../payments/PayoutBreakdown';
import { formatGs } from '../dashboards/admin/kit';
import { TripCompletionFlow } from '../TripCompletionFlow';

interface OwnerOperatorDashboardMobileProps {
  userName: string;
  onLogout: () => void;
}

type NavSection = 'viaje' | 'mercado' | 'mapa' | 'ingresos' | 'mas' | 'cuenta';

const STATUS_OPTIONS = [
  'En camino a recogida',
  'En tránsito con ganado',
  'Llegando al destino',
  'Descargando ganado',
  'Viaje completado',
] as const;

type MarketplaceTrip = {
  id: string; origin: string; destination: string; heads: number; cattleType: string;
  pickupDate: string; distance: number;
  bidStatus: 'new' | 'rancher-countered' | 'awaiting-rancher';
  marketPrice: number; yourBid?: number; rancherCounterOffer?: number;
  hoursAgo: number; isStoreOrder?: boolean;
};

export function OwnerOperatorDashboardMobile({ userName, onLogout }: OwnerOperatorDashboardMobileProps) {
  const [activeNav, setActiveNav] = useState<NavSection>('viaje');
  const [currentStatus, setCurrentStatus] = useState<string>('En tránsito con ganado');
  const [showStatusSheet, setShowStatusSheet] = useState(false);
  const [showTripDetail, setShowTripDetail] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [payOverrides, setPayOverrides] = useState<Record<string, PayState>>({});
  const [breakdown, setBreakdown] = useState<{ id: string; freight: number; rate: number } | null>(null);
  const [completionOpen, setCompletionOpen] = useState(false);
  const payOf = (id: string, fallback: PayState): PayState => payOverrides[id] ?? fallback;
  const [tripCancelled, setTripCancelled] = useState(false);
  const [delayReported, setDelayReported] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [tripDone, setTripDone] = useState(false);

  // Deep-links al marketplace (mismas señales que el desktop).
  const [initialTripIdToBid, setInitialTripIdToBid] = useState<string | undefined>(undefined);
  const [initialTripIdToAccept, setInitialTripIdToAccept] = useState<string | undefined>(undefined);
  const [initialTripIdToView, setInitialTripIdToView] = useState<string | undefined>(undefined);

  const { orders: storeOrders } = useDemoStore();

  const formatPrice = (price: number) => '₲ ' + price.toLocaleString('es-PY');

  const trip = {
    id: 'ENV-051',
    origin: 'Estancia San Pedro', originCity: 'Filadelfia',
    destination: 'Frigorífico Central', destinationCity: 'Asunción',
    distance: '485 km', heads: 45, cattleType: 'Gordos',
    forepersonName: 'Carlos Martínez', forepersonPhone: '+595 981 456789',
    eta: '2 horas', earnings: '₲ 1.750.000',
  };
  const progress = 65;

  // Cobro del viaje activo (= trip.earnings). Comisión TROPEX elegida: 2% · 15 días.
  const ACTIVE_FREIGHT = 1750000;
  const ACTIVE_RATE = 0.02;

  const completed: { id: string; date: string; route: string; heads: number; freight: number; rate: number; payState: PayState }[] = [
    { id: 'ENV-049', date: '20/03', route: 'Filadelfia → Asunción', heads: 45, freight: 8940000, rate: 0.02, payState: 'esperando' },
    { id: 'ENV-047', date: '19/03', route: 'Loma Plata → Villa Hayes', heads: 30, freight: 5400000, rate: 0.05, payState: 'verificando' },
    { id: 'ENV-046', date: '18/03', route: 'Concepción → Asunción', heads: 52, freight: 9200000, rate: 0.02, payState: 'pagado' },
    { id: 'ENV-045', date: '15/03', route: 'Filadelfia → Asunción', heads: 45, freight: 8100000, rate: 0.02, payState: 'pagado' },
    { id: 'ENV-042', date: '12/03', route: 'Loma Plata → Villa Hayes', heads: 30, freight: 5400000, rate: 0.02, payState: 'pagado' },
  ];

  // Al cerrar el viaje activo (mock) se mueve al tope de "Mis viajes".
  const justCompleted = { id: trip.id, date: '28/06', route: `${trip.originCity} → ${trip.destinationCity}`, heads: trip.heads, freight: ACTIVE_FREIGHT, rate: ACTIVE_RATE, payState: 'esperando' as PayState };
  const completedList = tripDone ? [justCompleted, ...completed] : completed;

  const monthlyIncome = [
    { month: 'Marzo', amount: '₲ 18.750.000', percentage: 85 },
    { month: 'Febrero', amount: '₲ 22.500.000', percentage: 100 },
    { month: 'Enero', amount: '₲ 16.200.000', percentage: 72 },
  ];

  // ── Marketplace (mismas oportunidades que el desktop) ──
  const staticMarketplaceTrips: MarketplaceTrip[] = [
    { id: 'SOL-002', origin: 'Loma Plata', destination: 'Concepción', heads: 32, cattleType: 'Novillos', pickupDate: '25/03/2026', distance: 320, bidStatus: 'rancher-countered', yourBid: 1350000, rancherCounterOffer: 1150000, marketPrice: 1220000, hoursAgo: 6 },
    { id: 'SOL-004', origin: 'Mariscal Estigarribia', destination: 'Asunción', heads: 50, cattleType: 'Gordos', pickupDate: '27/03/2026', distance: 560, bidStatus: 'awaiting-rancher', yourBid: 2200000, marketPrice: 2050000, hoursAgo: 8 },
    { id: 'SOL-001', origin: 'Filadelfia', destination: 'Asunción', heads: 45, cattleType: 'Gordos', pickupDate: '24/03/2026', distance: 485, bidStatus: 'new', marketPrice: 1680000, hoursAgo: 3 },
    { id: 'SOL-003', origin: 'Neuland', destination: 'Villa Hayes', heads: 28, cattleType: 'Vaquillonas', pickupDate: '26/03/2026', distance: 380, bidStatus: 'new', marketPrice: 1450000, hoursAgo: 2 },
    { id: 'SOL-005', origin: 'Concepción', destination: 'Asunción', heads: 38, cattleType: 'Terneros', pickupDate: '28/03/2026', distance: 412, bidStatus: 'new', marketPrice: 1580000, hoursAgo: 1 },
  ];

  const marketplaceTrips: MarketplaceTrip[] = [
    ...staticMarketplaceTrips,
    ...storeOrders.map(o => ({
      id: o.id, origin: o.origin, destination: o.destination, heads: o.heads,
      cattleType: o.cattleTypeLabel, pickupDate: o.pickupDate || 'A confirmar',
      distance: o.distance, bidStatus: 'new' as const, marketPrice: o.marketPrice,
      hoursAgo: 0.1, isStoreOrder: true,
    })),
  ];

  const counterTripsCount = marketplaceTrips.filter(t => t.bidStatus === 'rancher-countered').length;

  // Preview ordenado por prioridad (acción > esperando > nuevo, luego precio).
  const previewTrips = [...marketplaceTrips].sort((a, b) => {
    const pa = a.bidStatus === 'rancher-countered' ? 3 : a.bidStatus === 'awaiting-rancher' ? 2 : 1;
    const pb = b.bidStatus === 'rancher-countered' ? 3 : b.bidStatus === 'awaiting-rancher' ? 2 : 1;
    if (pa !== pb) return pb - pa;
    return b.marketPrice - a.marketPrice;
  }).slice(0, 3);

  const getTripTag = (t: MarketplaceTrip): string => {
    if (t.bidStatus === 'rancher-countered') return 'Requiere acción';
    if (t.bidStatus === 'awaiting-rancher') return 'Esperando respuesta';
    if (t.hoursAgo < 1) return 'Nueva oportunidad';
    if (t.distance < 100) return 'Viaje corto';
    return '';
  };

  const openMarketplaceTrip = (t: MarketplaceTrip) => {
    if (t.bidStatus === 'new') setInitialTripIdToBid(t.id);
    else if (t.bidStatus === 'rancher-countered') setInitialTripIdToAccept(t.id);
    else setInitialTripIdToView(t.id);
    setActiveNav('mercado');
  };

  const handleReportDelay = () => {
    setDelayReported(true);
    toast.success('Retraso reportado. El ganadero fue notificado.');
  };

  const handleSelectStatus = (s: string) => {
    setCurrentStatus(s);
    setShowStatusSheet(false);
    if (s === 'Viaje completado') { setCompletionOpen(true); return; }
    toast.success(`Estado actualizado: ${s}`);
  };

  const toggleAvailability = () => {
    const next = !isAvailable;
    setIsAvailable(next);
    toast.success(next ? 'Ahora estás disponible para nuevos viajes.' : 'Te marcaste como no disponible.');
  };

  // Navegación real en Google Maps.
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

  const tagColor = (t: MarketplaceTrip) =>
    t.bidStatus === 'rancher-countered' ? '#F58718' : t.bidStatus === 'awaiting-rancher' ? '#6B7280' : '#1E5126';

  // ── VIAJE (home) ────────────────────────────────────────────────────────────
  const renderViaje = () => {
    if (tripCancelled) return (
      <div style={{ height: '100%', padding: '12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', padding: '30px 20px', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(185,28,28,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <X size={26} color="#B91C1C" strokeWidth={2.4} />
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#111' }}>No tenés un viaje activo</div>
          <div style={{ fontSize: 13, color: '#6B7280', marginTop: 6, lineHeight: 1.5 }}>Tu último viaje fue cancelado. Buscá nuevas oportunidades en el mercado.</div>
          <button onClick={() => setActiveNav('mercado')} style={{ marginTop: 18, width: '100%', background: '#1E5126', color: '#fff', border: 'none', borderRadius: 13, padding: '14px 0', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
            Buscar viajes en el mercado
          </button>
        </div>
      </div>
    );
    if (tripDone) return (
      <div style={{ height: '100%', padding: '12px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ background: 'linear-gradient(150deg, #1E5126 0%, #2d6b38 55%, #1E5126 100%)', borderRadius: 18, padding: '28px 22px', textAlign: 'center', boxShadow: '0 6px 22px rgba(30,81,38,0.25)' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}><CheckCircle2 size={28} color="#fff" /></div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>¡Viaje cerrado!</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.78)', marginTop: 7, lineHeight: 1.5 }}>Lo movimos a <strong style={{ color: '#fff' }}>Mis viajes</strong>. Te avisamos cuando se acredite tu cobro.</div>
          <button onClick={() => setActiveNav('ingresos')} style={{ marginTop: 18, width: '100%', background: '#fff', color: '#1E5126', border: 'none', borderRadius: 13, padding: '13px 0', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>Ver en Mis viajes</button>
          <button onClick={() => setActiveNav('mercado')} style={{ marginTop: 9, width: '100%', background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 13, padding: '13px 0', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>Buscar nuevos viajes</button>
        </div>
      </div>
    );
    return (
    <div style={{ height: '100%', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10, overflow: 'hidden' }}>
      {/* Alerta de contraofertas (slim, fija) */}
      {counterTripsCount > 0 && (
        <button onClick={() => { setEstadoToAction(); }} style={{ flexShrink: 0, background: '#FEF3E2', border: '1px solid #F58718', borderRadius: 12, padding: '9px 12px', display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', textAlign: 'left' }}>
          <AlertTriangle size={17} color="#F58718" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#111' }}>{counterTripsCount} contraoferta{counterTripsCount > 1 ? 's' : ''} del ganadero</span>
            <span style={{ fontSize: 11, color: '#92611A', marginLeft: 6 }}>· requieren respuesta</span>
          </div>
          <ChevronRight size={17} color="#F58718" style={{ flexShrink: 0 }} />
        </button>
      )}

      {/* Hero: viaje actual (fijo) */}
      <div style={{ flexShrink: 0, background: 'linear-gradient(150deg, #1E5126 0%, #2d6b38 55%, #1E5126 100%)', borderRadius: 16, padding: '15px 16px 13px', position: 'relative', overflow: 'hidden', boxShadow: '0 6px 22px rgba(30,81,38,0.25)' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: 'radial-gradient(circle, rgba(245,135,24,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.55)' }}>Tu viaje actual</span>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', background: 'rgba(245,135,24,0.9)', padding: '2px 8px', borderRadius: 99 }}>{trip.id}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>{trip.originCity}</span>
          <ArrowRight size={16} color="rgba(255,255,255,0.5)" />
          <span style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.01em' }}>{trip.destinationCity}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{trip.distance} · ETA {trip.eta}</span>
          <span style={{ fontSize: 17, fontWeight: 800, color: '#F58718' }}>{trip.earnings}</span>
        </div>
        <div style={{ marginTop: 11 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>{trip.origin}</span>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#F58718' }}>{progress}%</span>
          </div>
          <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.18)' }}>
            <div style={{ height: '100%', width: `${progress}%`, borderRadius: 99, background: '#F58718' }} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 12 }}>
          {[
            { l: 'Cabezas', v: String(trip.heads) },
            { l: 'Tipo', v: trip.cattleType },
            { l: 'Capataz', v: trip.forepersonName.split(' ')[0] },
          ].map(x => (
            <div key={x.l} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '7px 10px' }}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{x.l}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', marginTop: 2 }}>{x.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mapa flexible: absorbe el alto disponible para que nunca haga falta scroll */}
      <div style={{ flex: 1, minHeight: 92, position: 'relative', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
        <MapView height="100%" interactive={false} markers={mapMarkers} route={mapRoute} />
        <button onClick={() => setActiveNav('mapa')} style={{ position: 'absolute', bottom: 10, right: 10, zIndex: 500, background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: 99, padding: '7px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
          <MapPin size={13} /> Ver mapa
        </button>
      </div>

      {/* Acciones (fijas y compactas) */}
      <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button onClick={() => setShowStatusSheet(true)} style={{ display: 'flex', alignItems: 'center', gap: 11, background: '#fff', borderRadius: 13, border: '1px solid rgba(0,0,0,0.07)', padding: '10px 13px', cursor: 'pointer', textAlign: 'left', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <button onClick={handleReportDelay} disabled={delayReported} style={{ background: delayReported ? '#1E512612' : '#fff', border: `1.5px solid ${delayReported ? '#1E5126' : 'rgba(0,0,0,0.1)'}`, borderRadius: 12, padding: '12px 8px', cursor: delayReported ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
            {delayReported ? <CheckCircle2 size={17} color="#1E5126" strokeWidth={2.4} /> : <AlertTriangle size={17} color="#F58718" strokeWidth={2.4} />}
            <span style={{ fontSize: 12.5, fontWeight: 800, color: delayReported ? '#1E5126' : '#111', whiteSpace: 'nowrap' }}>{delayReported ? 'Retraso ✓' : 'Reportar retraso'}</span>
          </button>
          <button onClick={() => { setShowCancel(false); setShowTripDetail(true); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: '12px 8px', fontSize: 12.5, fontWeight: 800, color: '#1E5126', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <FileText size={16} /> Ver detalles
          </button>
        </div>

        <div>
          <div style={{ fontSize: 10, color: '#9CA3AF', fontWeight: 700, margin: '1px 2px 6px', display: 'flex', alignItems: 'center', gap: 5 }}>
            <User size={11} /> Capataz · <span style={{ color: '#374151', fontWeight: 800 }}>{trip.forepersonName}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button onClick={() => openCall(trip.forepersonPhone)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '12px 0', borderRadius: 12, border: '1.5px solid #1E5126', background: '#fff', color: '#1E5126', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}><Phone size={15} /> Llamar</button>
            <button onClick={() => openWhatsApp(trip.forepersonPhone, `Hola ${trip.forepersonName}, soy tu transportista del viaje ${trip.id}. Te contacto para coordinar la recogida del ganado.`)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '12px 0', borderRadius: 12, border: 'none', background: '#25D366', color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}><MessageCircle size={15} /> WhatsApp</button>
          </div>
        </div>
      </div>
    </div>
    );
  };

  // Helper para abrir mercado filtrando a las que requieren acción.
  function setEstadoToAction() {
    const first = marketplaceTrips.find(t => t.bidStatus === 'rancher-countered');
    if (first) setInitialTripIdToAccept(first.id);
    setActiveNav('mercado');
  }

  // ── MERCADO (AvailableTripsView full) ───────────────────────────────────────
  const renderMercado = () => (
    <div style={{ minHeight: '100%' }}>
      <AvailableTripsView
        userType="owner-operator"
        onBack={() => setActiveNav('viaje')}
        initialTripIdToBid={initialTripIdToBid}
        onBidModalClosed={() => setInitialTripIdToBid(undefined)}
        initialTripIdToAccept={initialTripIdToAccept}
        onAcceptModalClosed={() => setInitialTripIdToAccept(undefined)}
        initialTripIdToView={initialTripIdToView}
        onViewModalClosed={() => setInitialTripIdToView(undefined)}
      />
    </div>
  );

  // ── MAPA ────────────────────────────────────────────────────────────────────
  const renderMapa = () => (
    <div style={{ position: 'relative', height: '100%' }}>
      <MapView height="100%" markers={mapMarkers} route={mapRoute} />
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

  // ── INGRESOS ────────────────────────────────────────────────────────────────
  const renderIngresos = () => (
    <div style={{ padding: '14px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h2 style={{ fontSize: 18, fontWeight: 800, color: '#111', margin: '4px 2px 0' }}>Ingresos</h2>

      {/* Resumen del mes */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div style={{ background: 'linear-gradient(135deg, #1E5126, #2d6b38)', borderRadius: 14, padding: '14px', boxShadow: '0 4px 14px rgba(30,81,38,0.25)' }}>
          <DollarSign size={18} color="rgba(255,255,255,0.8)" />
          <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginTop: 8, letterSpacing: '-0.02em' }}>₲ 18.7M</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>Ingresos del mes</div>
          <div style={{ fontSize: 11, color: '#A7F3C0', fontWeight: 700, marginTop: 4 }}>↑ 15% vs anterior</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 14, padding: '14px', border: '1px solid rgba(0,0,0,0.06)' }}>
          <Truck size={18} color="#1E5126" />
          <div style={{ fontSize: 22, fontWeight: 800, color: '#111', marginTop: 8, letterSpacing: '-0.02em' }}>15</div>
          <div style={{ fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>Viajes del mes</div>
          <div style={{ fontSize: 11, color: '#1E5126', fontWeight: 700, marginTop: 4 }}>↑ 3 vs anterior</div>
        </div>
      </div>

      {/* Ingresos mensuales */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
          <TrendingUp size={16} color="#1E5126" />
          <span style={{ fontSize: 13, fontWeight: 800, color: '#111' }}>Ingresos mensuales 2026</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {monthlyIncome.map(m => (
            <div key={m.month}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#444' }}>{m.month}</span>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#111' }}>{m.amount}</span>
              </div>
              <div style={{ height: 8, borderRadius: 99, background: '#F3F4F6' }}>
                <div style={{ height: '100%', width: `${m.percentage}%`, borderRadius: 99, background: 'linear-gradient(90deg, #1E5126, #2d6b38)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Viajes completados */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '4px 2px 8px' }}>Mis viajes</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {completedList.map(t => {
            const ps = payOf(t.id, t.payState);
            const neto = t.freight - Math.round(t.freight * t.rate);
            return (
              <div key={t.id} style={{ background: '#fff', borderRadius: 13, border: '1px solid rgba(0,0,0,0.06)', padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{t.route}</div>
                    <div style={{ fontSize: 11, color: '#888' }}><span style={{ fontFamily: 'monospace' }}>{t.id}</span> · {t.date} · {t.heads} cab.</div>
                  </div>
                  <button onClick={() => setBreakdown({ id: t.id, freight: t.freight, rate: t.rate })} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', flexShrink: 0 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#1E5126', borderBottom: '1.5px dotted #1E512688' }}>{formatGs(neto)}</span>
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 9, flexWrap: 'wrap' }}>
                  <PayBadge state={ps} cobro />
                  {ps === 'verificando' && (
                    <button onClick={() => setPayOverrides(o => ({ ...o, [t.id]: 'pagado' }))} style={{ fontSize: 11, fontWeight: 700, color: '#1E5126', background: '#1E512612', border: 'none', borderRadius: 7, padding: '5px 10px', cursor: 'pointer' }}>Simular verificación</button>
                  )}
                  <span style={{ marginLeft: 'auto', fontSize: 10.5, color: '#9CA3AF' }}>Tocá el monto →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ── MÁS ─────────────────────────────────────────────────────────────────────
  const renderMas = () => (
    <div style={{ padding: '14px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', padding: '16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#1E5126', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <User size={22} color="#fff" />
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#111' }}>{userName}</div>
          <div style={{ fontSize: 12, color: '#888' }}>Transportista · 15 viajes este mes</div>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 11 }}>
        <Clock size={18} color="#1E5126" style={{ flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#111' }}>Mi camión</div>
          <div style={{ fontSize: 11, color: '#888', marginTop: 1 }}>Jaula ganadera · 48 cabezas máx.</div>
        </div>
      </div>

      <button onClick={onLogout} style={{ marginTop: 4, background: '#fff', border: '1px solid rgba(212,24,61,0.25)', borderRadius: 13, padding: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#d4183d', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
        <LogOut size={16} /> Cerrar sesión
      </button>
    </div>
  );

  const navItems: { key: NavSection; icon: typeof Truck; label: string; badge?: number }[] = [
    { key: 'viaje', icon: Truck, label: 'Viaje' },
    { key: 'mercado', icon: Package, label: 'Mercado', badge: counterTripsCount },
    { key: 'mapa', icon: MapPin, label: 'Mapa' },
    { key: 'ingresos', icon: DollarSign, label: 'Ingresos' },
    { key: 'mas', icon: MoreHorizontal, label: 'Más' },
  ];

  // ── Módulo: Ver detalles del viaje + cancelación (flujo compartido) ──
  const closeTripDetail = () => { setShowTripDetail(false); setShowCancel(false); };

  const renderTripDetail = () => (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1500, background: '#F6F1E8', display: 'flex', flexDirection: 'column', fontFamily: '"IBM Plex Sans", system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ background: '#1E5126', padding: '14px 16px 16px', paddingTop: 'max(14px, env(safe-area-inset-top))', flexShrink: 0 }}>
        <button
          onClick={closeTripDetail}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 0, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}
        >
          ← Volver al panel
        </button>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace', letterSpacing: '0.04em' }}>{trip.id}</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginTop: 2 }}>Detalles del viaje</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 40px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Detalle */}
        {(
          <>
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 19, fontWeight: 800, color: '#111' }}>{trip.originCity}</span>
                <ArrowRight size={15} color="#9CA3AF" />
                <span style={{ fontSize: 19, fontWeight: 800, color: '#111' }}>{trip.destinationCity}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                <span style={{ fontSize: 12, color: '#6B7280' }}>{trip.distance} · ETA {trip.eta}</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#F58718' }}>{trip.earnings}</span>
              </div>
            </div>

            <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.06)' }}>
              <MapView height={180} interactive={false} markers={mapMarkers} route={mapRoute} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { l: 'Cabezas', v: `${trip.heads}` },
                { l: 'Tipo de ganado', v: trip.cattleType },
                { l: 'Distancia', v: trip.distance },
                { l: 'Origen', v: trip.origin },
              ].map(x => (
                <div key={x.l} style={{ background: '#fff', borderRadius: 12, border: '1px solid rgba(0,0,0,0.06)', padding: '11px 13px' }}>
                  <div style={{ fontSize: 9, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>{x.l}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#111', marginTop: 2 }}>{x.v}</div>
                </div>
              ))}
            </div>

            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,0.06)', padding: '14px 16px' }}>
              <div style={{ fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: 8 }}>Capataz del establecimiento</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>{trip.forepersonName}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
                <button onClick={() => openCall(trip.forepersonPhone)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px 0', borderRadius: 11, border: '1.5px solid #1E5126', background: '#fff', color: '#1E5126', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
                  <Phone size={15} /> Llamar
                </button>
                <button onClick={() => openWhatsApp(trip.forepersonPhone, `Hola ${trip.forepersonName}, soy tu transportista del viaje ${trip.id}.`)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px 0', borderRadius: 11, border: 'none', background: '#25D366', color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
                  <MessageCircle size={15} /> WhatsApp
                </button>
              </div>
            </div>

            <button
              onClick={() => shareWhatsApp(`Te comparto mi viaje ${trip.id} en TROPEX: ${trip.originCity} → ${trip.destinationCity} (${trip.distance}). ETA ${trip.eta}.`)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '13px 0', borderRadius: 13, border: '1.5px solid rgba(0,0,0,0.1)', background: '#fff', color: '#111', fontSize: 13, fontWeight: 800, cursor: 'pointer', width: '100%' }}
            >
              <Share2 size={16} color="#1E5126" /> Compartir viaje con el capataz
            </button>

            <button
              onClick={() => setShowCancel(true)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 0', borderRadius: 13, border: '1.5px solid #FECACA', background: '#FEF2F2', color: '#B91C1C', fontSize: 14, fontWeight: 800, cursor: 'pointer', width: '100%', marginTop: 2 }}
            >
              <X size={17} /> Cancelar viaje
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ height: '100dvh', background: '#F6F1E8', fontFamily: '"IBM Plex Sans", system-ui, sans-serif', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Detalle del viaje */}
      {showTripDetail && renderTripDetail()}
      {showCancel && (
        <TripCancelFlow
          tripId={trip.id}
          route={`${trip.originCity} → ${trip.destinationCity}`}
          who="transportista"
          onClose={() => setShowCancel(false)}
          onConfirmed={() => { setShowCancel(false); setShowTripDetail(false); setTripCancelled(true); }}
        />
      )}

      {breakdown && (
        <PayoutBreakdown tripId={breakdown.id} freight={breakdown.freight} commissionRate={breakdown.rate} onClose={() => setBreakdown(null)} />
      )}

      {completionOpen && (
        <TripCompletionFlow
          tripId={trip.id}
          route={`${trip.originCity} → ${trip.destinationCity}`}
          counterpart={trip.origin}
          destinationType="frigorifico"
          mandatory
          payout={{ freight: ACTIVE_FREIGHT, commissionRate: ACTIVE_RATE }}
          onComplete={() => { setCompletionOpen(false); setTripDone(true); setActiveNav('ingresos'); toast.success('Viaje cerrado. Lo movimos a "Mis viajes".'); }}
        />
      )}

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

      {/* Top bar — header TX de marca (oculto en mercado/mapa que traen su propio header) */}
      {activeNav !== 'mercado' && activeNav !== 'mapa' && activeNav !== 'cuenta' && (
        <div style={{ flexShrink: 0, zIndex: 30, background: '#1E5126', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <img src="/tropex-isotipo.png" alt="TROPEX" style={{ width: 22, height: 22, objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1 }}>TROPEX · Owner-Operator</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', lineHeight: 1.2, marginTop: 2 }}>Hola, {userName.split(' ')[0]}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={toggleAvailability} title="Tocá para cambiar tu disponibilidad" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 11px', borderRadius: 99, background: isAvailable ? 'rgba(34,197,94,0.18)' : 'rgba(255,255,255,0.12)', border: isAvailable ? '1px solid rgba(34,197,94,0.55)' : '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: isAvailable ? '#22C55E' : '#9CA3AF', boxShadow: isAvailable ? '0 0 0 3px rgba(34,197,94,0.25)' : 'none' }} />
              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#fff' }}>{isAvailable ? 'Disponible' : 'No disp.'}</span>
            </button>
            <button style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
              <Bell size={17} color="#fff" />
              {counterTripsCount > 0 && <span style={{ position: 'absolute', top: 8, right: 9, width: 7, height: 7, borderRadius: '50%', background: '#F58718' }} />}
            </button>
            <button onClick={() => setActiveNav('cuenta')} aria-label="Cuenta" style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <User size={17} color="#fff" />
            </button>
          </div>
        </div>
      )}

      {/* Content — rellena el alto disponible; el mapa flexiona para que el home nunca scrollee */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: 1, minHeight: 0, overflowY: (activeNav === 'viaje' || activeNav === 'mapa') ? 'hidden' : 'auto' }}>
          {activeNav === 'viaje' && renderViaje()}
          {activeNav === 'mercado' && renderMercado()}
          {activeNav === 'mapa' && renderMapa()}
          {activeNav === 'ingresos' && renderIngresos()}
          {activeNav === 'mas' && renderMas()}
          {activeNav === 'cuenta' && <OwnerOperatorAccount userName={userName} onLogout={onLogout} onBack={() => setActiveNav('viaje')} />}
        </div>
      </div>

      {/* Bottom nav (en flujo, fija al pie por el layout flex) */}
      <div style={{ flexShrink: 0, background: '#fff', borderTop: '1px solid rgba(0,0,0,0.08)', display: 'flex', padding: '6px 4px', boxShadow: '0 -2px 12px rgba(0,0,0,0.05)' }}>
        {navItems.map(({ key, icon: Icon, label, badge }) => {
          const active = activeNav === key;
          return (
            <button key={key} onClick={() => setActiveNav(key)} style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '6px 0', position: 'relative' }}>
              {!!badge && badge > 0 && (
                <span style={{ position: 'absolute', top: 0, left: 'calc(50% + 6px)', minWidth: 15, height: 15, padding: '0 4px', borderRadius: 99, background: '#F58718', color: '#fff', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{badge}</span>
              )}
              <Icon size={20} color={active ? '#1E5126' : '#9CA3AF'} strokeWidth={active ? 2.4 : 1.9} />
              <span style={{ fontSize: 10, fontWeight: active ? 800 : 600, color: active ? '#1E5126' : '#9CA3AF' }}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
