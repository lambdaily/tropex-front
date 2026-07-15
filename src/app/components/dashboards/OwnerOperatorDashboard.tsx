import { useState } from 'react';
import { Truck, Package, DollarSign, FileText, User, LogOut, BarChart3, CheckCircle2, Clock, MapPin, Phone, MessageCircle, Upload, Calendar, TrendingUp, ArrowUpRight, ArrowRight, Share2, LayoutDashboard, Bell, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { AvailableTripsView } from '../tropero-v2/AvailableTripsView';
import { OwnerOperatorAccount } from './OwnerOperatorAccount';
import { TripCancelFlow } from '../TripCancelFlow';
import { openCall, openWhatsApp } from '../../utils/contact';
import { useDemoStore } from '../../store/demoStore';
import { PayoutBreakdown, PayBadge, type PayState } from '../payments/PayoutBreakdown';
import { formatGs } from './admin/kit';
import { TripCompletionFlow } from '../TripCompletionFlow';

interface OwnerOperatorDashboardProps {
  userName: string;
  onLogout: () => void;
}

export function OwnerOperatorDashboard({ userName, onLogout }: OwnerOperatorDashboardProps) {
  const [currentView, setCurrentView] = useState<'dashboard' | 'history' | 'reports' | 'current-trip' | 'available-trips' | 'cuenta'>('dashboard');
  const [showCancel, setShowCancel] = useState(false);
  const [payOverrides, setPayOverrides] = useState<Record<string, PayState>>({});
  const [breakdown, setBreakdown] = useState<{ id: string; freight: number; rate: number } | null>(null);
  const [completionOpen, setCompletionOpen] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [reportsTab, setReportsTab] = useState<'income' | 'documents'>('income');
  const [isAvailable, setIsAvailable] = useState(true);
  const [shareToast, setShareToast] = useState(false);
  const [initialTripIdToBid, setInitialTripIdToBid] = useState<string | undefined>(undefined);
  const [initialGuideNumberToBid, setInitialGuideNumberToBid] = useState<1 | 2 | undefined>(undefined);
  const [initialTripIdToAccept, setInitialTripIdToAccept] = useState<string | undefined>(undefined);
  const [initialTripIdToView, setInitialTripIdToView] = useState<string | undefined>(undefined);
  const [recomendadosActive, setRecomendadosActive] = useState(true);
  const [priceSort, setPriceSort] = useState<'none' | 'asc' | 'desc'>('none');
  const [estadoFilter, setEstadoFilter] = useState<'todos' | 'accion' | 'disponible' | 'esperando'>('todos');
  const [distanceMax, setDistanceMax] = useState(1000);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const { orders: storeOrders } = useDemoStore();

  const formatPrice = (price: number) => '₲ ' + price.toLocaleString('es-PY');

  const currentTrip = {
    id: 'ENV-046',
    origin: 'Estancia San Pedro',
    originCoords: 'Ruta 9 Km 45, Filadelfia',
    destination: 'Frigorífico Central',
    destinationCoords: 'Asunción',
    distance: '485 km',
    heads: 45,
    cattleType: 'Gordos',
    forepersonName: 'Carlos Martínez',
    forepersonPhone: '+595 981 456789',
    estimatedArrival: '2 horas',
    earnings: '₲ 1.750.000',
  };

  const activeTrip = currentTrip;

  const tripHistory: { id: string; date: string; origin: string; destination: string; heads: number; freight: number; rate: number; payState: PayState }[] = [
    { id: 'ENV-049', date: '20/03/2026', origin: 'Filadelfia', destination: 'Asunción', heads: 45, freight: 8940000, rate: 0.02, payState: 'esperando' },
    { id: 'ENV-047', date: '19/03/2026', origin: 'Loma Plata', destination: 'Villa Hayes', heads: 30, freight: 5400000, rate: 0.05, payState: 'verificando' },
    { id: 'ENV-046', date: '18/03/2026', origin: 'Concepción', destination: 'Asunción', heads: 52, freight: 9200000, rate: 0.02, payState: 'pagado' },
    { id: 'ENV-045', date: '15/03/2026', origin: 'Filadelfia', destination: 'Asunción', heads: 45, freight: 8100000, rate: 0.02, payState: 'pagado' },
    { id: 'ENV-042', date: '12/03/2026', origin: 'Loma Plata', destination: 'Villa Hayes', heads: 30, freight: 5400000, rate: 0.02, payState: 'pagado' },
    { id: 'ENV-038', date: '08/03/2026', origin: 'Concepción', destination: 'Asunción', heads: 52, freight: 9450000, rate: 0.05, payState: 'pagado' },
  ];
  const payOf = (id: string, fallback: PayState): PayState => payOverrides[id] ?? fallback;

  type MarketplaceTrip = {
    id: string; origin: string; destination: string; heads: number; cattleType: string;
    pickupDate: string; distance: number;
    bidStatus: 'new' | 'rancher-countered' | 'awaiting-rancher';
    marketPrice: number; yourBid?: number; rancherCounterOffer?: number;
    hoursAgo: number; isStoreOrder?: boolean; guides?: unknown; estimatedWeight?: number;
  };

  const staticMarketplaceTrips: MarketplaceTrip[] = [
    { id: 'SOL-002', origin: 'Loma Plata', destination: 'Concepción', heads: 32, cattleType: 'Novillos', pickupDate: '25/03/2026', distance: 320, bidStatus: 'rancher-countered', yourBid: 1350000, rancherCounterOffer: 1150000, marketPrice: 1220000, hoursAgo: 6 },
    { id: 'SOL-004', origin: 'Mariscal Estigarribia', destination: 'Asunción', heads: 50, cattleType: 'Gordos', pickupDate: '27/03/2026', distance: 560, bidStatus: 'awaiting-rancher', yourBid: 2200000, marketPrice: 2050000, hoursAgo: 8 },
    { id: 'SOL-001', origin: 'Filadelfia', destination: 'Asunción', heads: 45, cattleType: 'Gordos', pickupDate: '24/03/2026', distance: 485, bidStatus: 'new', marketPrice: 1680000, hoursAgo: 3 },
    { id: 'SOL-003', origin: 'Neuland', destination: 'Villa Hayes', heads: 28, cattleType: 'Vaquillonas', pickupDate: '26/03/2026', distance: 380, bidStatus: 'new', marketPrice: 1450000, hoursAgo: 2 },
    { id: 'SOL-005', origin: 'Concepción', destination: 'Asunción', heads: 38, cattleType: 'Terneros', pickupDate: '28/03/2026', distance: 412, bidStatus: 'new', marketPrice: 1580000, hoursAgo: 1 },
    { id: 'SOL-006', origin: 'Villa Hayes', destination: 'Asunción', heads: 35, cattleType: 'Novillos', pickupDate: '25/03/2026', distance: 65, bidStatus: 'new', marketPrice: 420000, hoursAgo: 0.5 },
    { id: 'SOL-007', origin: 'Coronel Oviedo', destination: 'Asunción', heads: 40, cattleType: 'Gordos', pickupDate: '26/03/2026', distance: 155, bidStatus: 'new', marketPrice: 950000, hoursAgo: 4 },
    { id: 'SOL-008', origin: 'San Pedro', destination: 'Asunción', heads: 55, cattleType: 'Gordos', pickupDate: '27/03/2026', distance: 280, bidStatus: 'new', marketPrice: 2400000, hoursAgo: 2 },
    { id: 'SOL-009', origin: 'Pozo Colorado', destination: 'Villa Hayes', heads: 30, cattleType: 'Vaquillonas', pickupDate: '26/03/2026', distance: 200, bidStatus: 'new', marketPrice: 900000, hoursAgo: 5 },
    { id: 'SOL-010', origin: 'Filadelfia', destination: 'Concepción', heads: 42, cattleType: 'Novillos', pickupDate: '28/03/2026', distance: 290, bidStatus: 'new', marketPrice: 1820000, hoursAgo: 1.5 },
  ];

  const marketplaceTrips: MarketplaceTrip[] = [
    ...staticMarketplaceTrips,
    ...storeOrders.map(o => ({
      id: o.id, origin: o.origin, destination: o.destination, heads: o.heads,
      cattleType: o.cattleTypeLabel, pickupDate: o.pickupDate || 'A confirmar',
      distance: o.distance, bidStatus: 'new' as const, marketPrice: o.marketPrice,
      hoursAgo: 0.1, isStoreOrder: true, guides: o.guides, estimatedWeight: o.estimatedWeight,
    })),
  ];

  const counterTripsCount = marketplaceTrips.filter(t => t.bidStatus === 'rancher-countered').length;

  const getFilteredMarketplaceTrips = () => {
    const maxDist = distanceMax >= 1000 ? Infinity : distanceMax;
    let trips = marketplaceTrips.filter(t => {
      if (t.distance > maxDist) return false;
      if (estadoFilter === 'accion') return t.bidStatus === 'rancher-countered';
      if (estadoFilter === 'disponible') return t.bidStatus === 'new';
      if (estadoFilter === 'esperando') return t.bidStatus === 'awaiting-rancher';
      return true;
    });
    if (priceSort === 'desc') trips = [...trips].sort((a, b) => b.marketPrice - a.marketPrice);
    else if (priceSort === 'asc') trips = [...trips].sort((a, b) => a.marketPrice - b.marketPrice);
    else if (recomendadosActive) {
      trips = [...trips].sort((a, b) => {
        const pa = a.bidStatus === 'rancher-countered' ? 3 : a.bidStatus === 'awaiting-rancher' ? 2 : 1;
        const pb = b.bidStatus === 'rancher-countered' ? 3 : b.bidStatus === 'awaiting-rancher' ? 2 : 1;
        if (pa !== pb) return pb - pa;
        return b.marketPrice - a.marketPrice;
      });
    } else {
      trips = [...trips].sort((a, b) => a.hoursAgo - b.hoursAgo);
    }
    return trips;
  };

  const getTripTag = (trip: MarketplaceTrip): string => {
    if (trip.bidStatus === 'rancher-countered') return 'Requiere acción';
    if (trip.bidStatus === 'awaiting-rancher') return 'Esperando respuesta';
    if (trip.hoursAgo < 1) return 'Nueva oportunidad';
    if (trip.distance < 100) return 'Viaje corto';
    return '';
  };

  const openMarketplaceTrip = (trip: MarketplaceTrip) => {
    if (trip.bidStatus === 'new') { setInitialTripIdToBid(trip.id); setInitialGuideNumberToBid(undefined); setCurrentView('available-trips'); }
    else if (trip.bidStatus === 'rancher-countered') { setInitialTripIdToAccept(trip.id); setCurrentView('available-trips'); }
    else { setInitialTripIdToView(trip.id); setCurrentView('available-trips'); }
  };

  const handleCallForeperson = () => openCall(activeTrip.forepersonPhone);

  const handleWhatsAppForeperson = () =>
    openWhatsApp(activeTrip.forepersonPhone, `Hola ${activeTrip.forepersonName}, soy tu transportista del viaje ${activeTrip.id}. Te contacto para coordinar la recogida del ganado.`);

  const driverInitials = activeTrip.forepersonName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  const activityFeed = [
    { time: '06:00', text: 'Recogió el pedido en Filadelfia', status: 'done' as const },
    { time: '06:15', text: 'Guía de traslado cargada', status: 'done' as const },
    { time: '06:30', text: 'Control COTA · Filadelfia Km 450', status: 'done' as const },
    { time: '09:15', text: 'Control COTA · Mariscal Estigarribia Km 300', status: 'done' as const },
    { time: '~11:30', text: 'Control COTA · Villa Hayes Km 50', status: 'current' as const },
    { time: '~14:00', text: 'Entrega en Asunción', status: 'upcoming' as const },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#F6F1E8', fontFamily: '"IBM Plex Sans", system-ui, sans-serif', position: 'relative' }}>
      {sidebarExpanded && (
        <div onClick={() => setSidebarExpanded(false)} style={{ position: 'absolute', left: 60, top: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.45)', zIndex: 40, cursor: 'pointer' }} />
      )}
      <div style={{ width: 60, flexShrink: 0 }} />
      <aside style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: sidebarExpanded ? 220 : 60, background: '#1E5126', transition: 'width 250ms ease-in-out', overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '14px 0', gap: 4, zIndex: 50 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', marginBottom: 10, minHeight: 36 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <img src="/tropex-isotipo.png" alt="TROPEX" style={{ width: 26, height: 26, objectFit: 'contain' }} />
          </div>
          {sidebarExpanded && <span style={{ fontSize: 15, fontWeight: 800, color: '#fff', whiteSpace: 'nowrap' }}>TROPEX</span>}
        </div>
        {/* Nav items */}
        {([
          { key: 'dashboard', icon: LayoutDashboard, hasDot: false, label: 'Panel' },
          { key: 'available-trips', icon: Package, hasDot: counterTripsCount > 0, label: 'Viajes disponibles' },
          { key: 'current-trip', icon: Truck, hasDot: false, label: 'Viaje actual' },
          { key: 'history', icon: Clock, hasDot: false, label: 'Mis viajes' },
          { key: 'reports', icon: BarChart3, hasDot: false, label: 'Reportes' },
        ] as const).map(({ key, icon: Icon, hasDot, label }) => {
          const active = currentView === key;
          return sidebarExpanded ? (
            <button key={key} onClick={() => { setCurrentView(key); setSidebarExpanded(false); }} style={{ width: 'calc(100% - 16px)', margin: '0 8px', height: 38, padding: '0 10px', display: 'flex', alignItems: 'center', gap: 12, background: active ? 'rgba(255,255,255,0.18)' : 'transparent', border: 'none', borderRadius: 8, cursor: 'pointer', position: 'relative' }}>
              <Icon size={18} color={active ? '#fff' : 'rgba(255,255,255,0.6)'} strokeWidth={active ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? '#fff' : 'rgba(255,255,255,0.75)', whiteSpace: 'nowrap' }}>{label}</span>
              {hasDot && <span style={{ position: 'absolute', top: 8, left: 24, width: 7, height: 7, borderRadius: '50%', background: '#F58718', border: '1.5px solid #1E5126' }} />}
            </button>
          ) : (
            <button key={key} onClick={() => setCurrentView(key)} title={label} style={{ width: 36, height: 36, borderRadius: 9, border: 'none', background: active ? 'rgba(255,255,255,0.18)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 150ms', position: 'relative', margin: '0 auto' }}>
              <Icon size={18} color={active ? '#fff' : 'rgba(255,255,255,0.55)'} strokeWidth={active ? 2.2 : 1.8} />
              {hasDot && <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%', background: '#F58718', border: '1.5px solid #1E5126' }} />}
            </button>
          );
        })}
        <div style={{ width: sidebarExpanded ? 'calc(100% - 24px)' : 24, height: 1, background: 'rgba(255,255,255,0.15)', margin: '8px auto' }} />
        <div style={{ flex: 1 }} />
        {/* Expand/collapse */}
        {sidebarExpanded ? (
          <button onClick={() => setSidebarExpanded(false)} style={{ width: 'calc(100% - 16px)', margin: '0 8px', height: 38, padding: '0 10px', display: 'flex', alignItems: 'center', gap: 12, background: 'transparent', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
            <ChevronLeft size={18} color="rgba(255,255,255,0.6)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.65)', whiteSpace: 'nowrap' }}>Colapsar</span>
          </button>
        ) : (
          <button onClick={() => setSidebarExpanded(true)} title="Expandir menú" style={{ width: 36, height: 36, borderRadius: 9, border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', margin: '0 auto' }}>
            <ChevronRight size={18} color="rgba(255,255,255,0.55)" />
          </button>
        )}
        {/* Logout */}
        {sidebarExpanded ? (
          <button onClick={onLogout} style={{ width: 'calc(100% - 16px)', margin: '0 8px', height: 38, padding: '0 10px', display: 'flex', alignItems: 'center', gap: 12, background: 'transparent', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
            <LogOut size={18} color="rgba(255,255,255,0.6)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.65)', whiteSpace: 'nowrap' }}>Cerrar sesión</span>
          </button>
        ) : (
          <button onClick={onLogout} title="Cerrar sesión" style={{ width: 36, height: 36, borderRadius: 9, border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', margin: '0 auto' }}>
            <LogOut size={18} color="rgba(255,255,255,0.55)" strokeWidth={1.8} />
          </button>
        )}
        {/* User avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: sidebarExpanded ? '4px 12px 0' : '4px 0 0', justifyContent: sidebarExpanded ? 'flex-start' : 'center' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <User size={15} color="#fff" />
          </div>
          {sidebarExpanded && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>{userName}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap' }}>Owner-Op.</div>
            </div>
          )}
        </div>
      </aside>

      {/* Main column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <nav style={{ background: '#fff', borderBottom: '1.5px solid #1E5126', height: 48, padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#1E5126' }}>{userName}</span>
            <span style={{ background: '#1E512612', color: '#1E5126', fontSize: 10, fontWeight: 700, borderRadius: 99, padding: '3px 8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Owner-Op.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button style={{ position: 'relative', padding: 6, background: 'transparent', border: 'none', cursor: 'pointer' }}>
              <Bell size={18} color="#1E5126" />
              <span style={{ position: 'absolute', top: 4, right: 4, width: 7, height: 7, borderRadius: '50%', background: '#F58718' }} />
            </button>
            <button onClick={() => setCurrentView('cuenta')} aria-label="Cuenta" style={{ width: 28, height: 28, borderRadius: '50%', background: '#1E5126', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <User size={14} color="#fff" />
            </button>
          </div>
        </nav>

        {currentView === 'dashboard' && (() => {
          const tripProgressPercent = 68;
          const checkpoints = [
            { label: 'Salida', time: '06:00' },
            { label: 'Mariscal E.', time: '09:15' },
            { label: 'Villa Hayes', time: '13:30' },
            { label: 'Llegada', time: activeTrip.estimatedArrival },
          ];
          const checkpointProgress = (tripProgressPercent / 100) * (checkpoints.length - 1);

          return (
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '58fr 42fr', gridTemplateRows: 'auto auto 1fr', gap: 8, padding: '8px 8px 12px', overflow: 'hidden', minHeight: 0 }}>
              <style>{`
                .ownerop-mp-scroll {
                  scrollbar-width: thin;
                  scrollbar-color: rgba(255,255,255,0.42) transparent;
                }
                .ownerop-mp-scroll::-webkit-scrollbar { width: 8px; }
                .ownerop-mp-scroll::-webkit-scrollbar-track { background: transparent; }
                .ownerop-mp-scroll::-webkit-scrollbar-thumb {
                  background: rgba(255,255,255,0.38);
                  border-radius: 999px;
                  border: 2px solid transparent;
                  background-clip: padding-box;
                }
                .ownerop-mp-scroll::-webkit-scrollbar-thumb:hover {
                  background: rgba(255,255,255,0.54);
                  border: 2px solid transparent;
                  background-clip: padding-box;
                }
                .ownerop-act-scroll {
                  scrollbar-width: thin;
                  scrollbar-color: rgba(255,255,255,0.2) transparent;
                }
                .ownerop-act-scroll::-webkit-scrollbar { width: 4px; }
                .ownerop-act-scroll::-webkit-scrollbar-thumb {
                  background: rgba(255,255,255,0.25);
                  border-radius: 999px;
                }
              `}</style>

              {/* Alerta: contraoferta(s) pendiente(s) de respuesta */}
              {counterTripsCount > 0 && (
                <button
                  onClick={() => setCurrentView('available-trips')}
                  style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(245,135,24,0.12)', border: '1px solid rgba(245,135,24,0.4)', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', textAlign: 'left' }}
                >
                  <AlertTriangle size={15} color="#F58718" strokeWidth={2.5} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#8a4b06' }}>
                    Tenés {counterTripsCount} contraoferta{counterTripsCount !== 1 ? 's' : ''} pendiente{counterTripsCount !== 1 ? 's' : ''} de respuesta
                  </span>
                  <ArrowRight size={14} color="#F58718" style={{ marginLeft: 'auto' }} />
                </button>
              )}

              {/* Row 1: CTA + stats tiles */}
              <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
                {/* CTA: ver viajes disponibles (tile) */}
                <button
                  onClick={() => setCurrentView('available-trips')}
                  style={{ background: '#F58718', border: 'none', borderRadius: 10, padding: '11px 14px', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'left', boxShadow: '0 3px 12px rgba(245,135,24,0.35)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Package size={18} color="#fff" strokeWidth={2.5} />
                    <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', lineHeight: 1.15 }}>Ver viajes disponibles</div>
                    <ArrowRight size={16} color="rgba(255,255,255,0.85)" style={{ marginLeft: 'auto' }} />
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.85)', marginTop: 4 }}>
                    {marketplaceTrips.filter(t => t.bidStatus === 'new').length} oportunidades · {counterTripsCount} contraoferta{counterTripsCount !== 1 ? 's' : ''} pendiente{counterTripsCount !== 1 ? 's' : ''}
                  </div>
                </button>
                {([
                  { label: 'Ingresos mes', value: '₲ 18.7M', trend: '↑ 15% vs anterior', Icon: DollarSign, accent: '#1E5126' },
                  { label: 'Viajes mes', value: '15', trend: '↑ 3 vs anterior', Icon: Truck, accent: '#1E5126' },
                ] as const).map(stat => (
                  <div key={stat.label} style={{ background: '#fff', borderRadius: 10, padding: '11px 14px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ fontSize: 9, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>{stat.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#111', lineHeight: 1.1, marginTop: 4 }}>{stat.value}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: stat.accent, marginTop: 3 }}>{stat.trend}</div>
                    <div style={{ position: 'absolute', top: 8, right: 8, opacity: 0.12 }}>
                      <stat.Icon size={28} color={stat.accent} strokeWidth={2.4} />
                    </div>
                  </div>
                ))}
                {/* Estado actual tile */}
                <button
                  onClick={() => setIsAvailable(!isAvailable)}
                  style={{ background: isAvailable ? 'linear-gradient(135deg, #1E5126, #2d6b38)' : '#fff', borderRadius: 10, border: '1px solid #E5E7EB', padding: '11px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer', textAlign: 'left', position: 'relative', overflow: 'hidden', boxShadow: isAvailable ? '0 4px 14px rgba(30,81,38,0.25)' : 'none' }}
                >
                  <div style={{ fontSize: 9, color: isAvailable ? 'rgba(255,255,255,0.7)' : '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Estado actual</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: isAvailable ? '#22C55E' : '#9CA3AF', boxShadow: isAvailable ? '0 0 0 4px rgba(34,197,94,0.25)' : 'none' }} />
                    <div style={{ fontSize: 16, fontWeight: 800, color: isAvailable ? '#fff' : '#111', lineHeight: 1 }}>{isAvailable ? 'Disponible' : 'No disponible'}</div>
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: isAvailable ? 'rgba(255,255,255,0.65)' : '#666', marginTop: 3 }}>Tap para cambiar</div>
                </button>
              </div>

              {/* Left column: Active trip card */}
              {activeTrip ? (
                <div style={{ background: 'linear-gradient(160deg, #1E5126 0%, #08221A 60%, #1E5126 100%)', borderRadius: 14, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0, position: 'relative', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ position: 'absolute', top: -50, right: -50, width: 180, height: 180, background: 'radial-gradient(circle, rgba(245,135,24,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />

                  {/* Zone A: ID + status + earnings */}
                  <div style={{ padding: '14px 16px 10px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0, position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, fontFamily: 'monospace', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em' }}>{activeTrip.id}</span>
                        <span style={{ fontSize: 9, fontWeight: 800, color: '#fff', background: '#F58718', padding: '3px 9px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.04em' }}>En tránsito</span>
                      </div>
                      <span style={{ fontSize: 24, fontWeight: 600, color: '#F58718', letterSpacing: '-0.01em' }}>{activeTrip.earnings}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{activeTrip.origin}</span>
                      <ArrowRight size={12} color="rgba(255,255,255,0.35)" />
                      <span style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{activeTrip.destination}</span>
                    </div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{activeTrip.distance} · ETA {activeTrip.estimatedArrival}</div>
                  </div>

                  {/* Zone B: Checkpoint timeline */}
                  <div style={{ padding: '10px 16px 8px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
                    <div style={{ position: 'relative', height: 14, marginBottom: 6 }}>
                      <div style={{ position: 'absolute', left: 6, right: 6, top: '50%', height: 2, background: 'rgba(255,255,255,0.12)', transform: 'translateY(-50%)' }} />
                      <div style={{ position: 'absolute', left: 6, top: '50%', width: `calc((100% - 12px) * ${tripProgressPercent / 100})`, height: 2, background: '#F58718', transform: 'translateY(-50%)', transition: 'width 0.3s' }} />
                      {checkpoints.map((cp, i) => {
                        const pct = (i / (checkpoints.length - 1)) * 100;
                        const isDone = i < Math.floor(checkpointProgress);
                        const isCurrent = i === Math.floor(checkpointProgress) && tripProgressPercent < 100;
                        return (
                          <div key={i} style={{ position: 'absolute', left: `${pct}%`, top: '50%', transform: 'translate(-50%, -50%)' }}>
                            {isCurrent ? (
                              <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#F58718', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 4px rgba(245,135,24,0.25)' }}>
                                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff' }} />
                              </div>
                            ) : (
                              <div style={{ width: 8, height: 8, borderRadius: '50%', background: isDone ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)', border: `1.5px solid ${isDone ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.2)'}` }} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      {checkpoints.map((cp, i) => {
                        const isDone = i < Math.floor(checkpointProgress);
                        const isCurrent = i === Math.floor(checkpointProgress) && tripProgressPercent < 100;
                        const align = i === 0 ? 'flex-start' : i === checkpoints.length - 1 ? 'flex-end' : 'center';
                        return (
                          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: align, flex: 1 }}>
                            <div style={{ fontSize: 9, fontWeight: 800, color: isCurrent ? '#F58718' : isDone ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)' }}>{cp.label}</div>
                            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>{cp.time}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Zone C: Activity feed */}
                  <div className="ownerop-act-scroll" style={{ flex: 1, overflowY: 'auto', padding: '10px 16px' }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: 8 }}>Actividad del viaje</div>
                    <div style={{ position: 'relative' }}>
                      {/* Vertical line */}
                      <div style={{ position: 'absolute', left: 5, top: 6, bottom: 6, width: 1.5, background: 'rgba(255,255,255,0.1)' }} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                        {activityFeed.map((event, i) => {
                          const isDone = event.status === 'done';
                          const isCurrent = event.status === 'current';
                          const dotColor = isDone ? 'rgba(255,255,255,0.45)' : isCurrent ? '#F58718' : 'rgba(255,255,255,0.15)';
                          const dotBorder = isDone ? 'rgba(255,255,255,0.3)' : isCurrent ? '#F58718' : 'rgba(255,255,255,0.15)';
                          const timeColor = isDone ? 'rgba(255,255,255,0.4)' : isCurrent ? '#F58718' : 'rgba(255,255,255,0.2)';
                          const textColor = isDone ? 'rgba(255,255,255,0.7)' : isCurrent ? '#F58718' : 'rgba(255,255,255,0.25)';
                          return (
                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, paddingBottom: i < activityFeed.length - 1 ? 10 : 0 }}>
                              <div style={{ position: 'relative', zIndex: 1, flexShrink: 0, marginTop: 1 }}>
                                <div style={{
                                  width: 11, height: 11, borderRadius: '50%',
                                  background: dotColor,
                                  border: `1.5px solid ${dotBorder}`,
                                  boxShadow: isCurrent ? '0 0 0 4px rgba(245,135,24,0.2)' : 'none',
                                }} />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <span style={{ fontSize: 9, fontWeight: 800, color: timeColor, fontFamily: 'monospace', marginRight: 6 }}>{event.time}</span>
                                <span style={{ fontSize: 10, fontWeight: isCurrent ? 700 : 500, color: textColor }}>{event.text}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Zone D: Capataz + buttons */}
                  <div style={{ padding: '10px 14px 12px', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
                    <div style={{ background: 'rgba(0,0,0,0.22)', borderRadius: 10, padding: '9px 12px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #F58718, #ff9a3c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff', flexShrink: 0, boxShadow: '0 2px 8px rgba(245,135,24,0.4)' }}>
                        {driverInitials}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>{activeTrip.forepersonName}</div>
                        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', marginTop: 1 }}>Capataz · {activeTrip.forepersonPhone}</div>
                      </div>
                      <button onClick={handleCallForeperson} style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Llamar">
                        <Phone size={13} />
                      </button>
                      <button onClick={handleWhatsAppForeperson} style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(255,255,255,0.12)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="WhatsApp">
                        <MessageCircle size={13} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: 7 }}>
                      <button onClick={() => setCurrentView('current-trip')} style={{ flex: 1, padding: '9px 0', borderRadius: 9, border: '1.5px solid rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 800, cursor: 'pointer', background: 'transparent', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Subir COTA
                      </button>
                      <button onClick={() => setCurrentView('current-trip')} style={{ flex: 1, padding: '9px 0', borderRadius: 9, border: 'none', fontSize: 10, fontWeight: 800, cursor: 'pointer', background: '#F58718', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.06em', boxShadow: '0 3px 10px rgba(245,135,24,0.35)' }}>
                        Ver detalles
                      </button>
                    </div>
                    <button onClick={() => setShowCancel(true)} style={{ width: '100%', marginTop: 7, padding: '8px 0', borderRadius: 9, border: '1px solid rgba(255,255,255,0.18)', fontSize: 10, fontWeight: 800, cursor: 'pointer', background: 'transparent', color: '#FCA5A5', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Cancelar viaje
                    </button>
                  </div>
                </div>
              ) : (
                /* Empty state */
                <div style={{ background: 'linear-gradient(160deg, #1E5126 0%, #08221A 100%)', borderRadius: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: 32, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Truck size={28} color="rgba(255,255,255,0.35)" strokeWidth={1.5} />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Sin viaje activo</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>Buscá tu próximo envío en el marketplace</div>
                  </div>
                  <button onClick={() => setCurrentView('available-trips')} style={{ padding: '10px 24px', borderRadius: 9, border: 'none', background: '#F58718', color: '#fff', fontSize: 12, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 14px rgba(245,135,24,0.35)' }}>
                    Buscar viajes
                  </button>
                </div>
              )}

              {/* Right column: Marketplace panel */}
              <div style={{ borderRadius: 14, background: 'linear-gradient(180deg, #2B5A35 0%, #1E5126 65%, #163D1D 100%)', boxShadow: '0 8px 28px rgba(30,81,38,0.28)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', minHeight: 0 }}>
                <div style={{ position: 'absolute', top: -80, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,135,24,0.22) 0%, rgba(245,135,24,0.08) 35%, transparent 70%)', pointerEvents: 'none' }} />

                {/* Header */}
                <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 9 }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>Viajes disponibles</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>
                        {getFilteredMarketplaceTrips().length} resultados · {counterTripsCount} contraoferta{counterTripsCount !== 1 ? 's' : ''} activa{counterTripsCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <button
                      onClick={() => setCurrentView('available-trips')}
                      style={{ width: 30, height: 30, borderRadius: 9, background: '#F58718', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                    >
                      <Package size={14} color="#fff" />
                    </button>
                  </div>

                  {/* Filter chips */}
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                    <button
                      onClick={() => { setRecomendadosActive(a => !a); setPriceSort('none'); }}
                      style={{ padding: '4px 9px', borderRadius: 99, border: 'none', cursor: 'pointer', fontSize: 9, fontWeight: 700, background: recomendadosActive ? '#F58718' : 'rgba(255,255,255,0.1)', color: '#fff', whiteSpace: 'nowrap' }}
                    >
                      Recomendados
                    </button>
                    <button
                      onClick={() => { setPriceSort(p => p === 'none' ? 'desc' : p === 'desc' ? 'asc' : 'none'); setRecomendadosActive(false); }}
                      style={{ padding: '4px 9px', borderRadius: 99, border: 'none', cursor: 'pointer', fontSize: 9, fontWeight: 700, background: priceSort !== 'none' ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.1)', color: priceSort !== 'none' ? '#fff' : 'rgba(255,255,255,0.58)', whiteSpace: 'nowrap' }}
                    >
                      {priceSort === 'none' ? 'Precio' : priceSort === 'desc' ? 'Precio ↓' : 'Precio ↑'}
                    </button>
                    {(() => {
                      const cfgs = {
                        todos:      { label: 'Estado',      bg: 'rgba(255,255,255,0.1)',  color: 'rgba(255,255,255,0.58)' },
                        accion:     { label: 'Con acción',  bg: '#F58718',               color: '#fff' },
                        disponible: { label: 'Disponible',  bg: '#22C55E',               color: '#fff' },
                        esperando:  { label: 'Esperando',   bg: 'rgba(234,179,8,0.8)',   color: '#1a1a1a' },
                      } as const;
                      const cfg = cfgs[estadoFilter];
                      return (
                        <button
                          onClick={() => setEstadoFilter(e => e === 'todos' ? 'accion' : e === 'accion' ? 'disponible' : e === 'disponible' ? 'esperando' : 'todos')}
                          style={{ padding: '4px 9px', borderRadius: 99, border: 'none', cursor: 'pointer', fontSize: 9, fontWeight: 700, background: cfg.bg, color: cfg.color, whiteSpace: 'nowrap' }}
                        >
                          {cfg.label}
                        </button>
                      );
                    })()}
                  </div>

                  {/* Distance slider */}
                  <div style={{ marginTop: 7, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)', flexShrink: 0 }}>Distancia:</span>
                    <input
                      type="range" min={50} max={1000} step={10} value={distanceMax}
                      onChange={e => setDistanceMax(Number(e.target.value))}
                      style={{ flex: 1, accentColor: '#F58718', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', flexShrink: 0, minWidth: 64, textAlign: 'right' }}>
                      {distanceMax >= 1000 ? '1000+ km' : `≤ ${distanceMax} km`}
                    </span>
                  </div>
                </div>

                {/* Trip list */}
                <div className="ownerop-mp-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '10px 10px 10px 12px', display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {getFilteredMarketplaceTrips().length === 0 ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: 0.55, paddingTop: 24 }}>
                      <Package size={22} color="rgba(255,255,255,0.4)" />
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>Sin resultados para los filtros aplicados</div>
                    </div>
                  ) : getFilteredMarketplaceTrips().map(trip => {
                    const isCounter = trip.bidStatus === 'rancher-countered';
                    const isAwaiting = trip.bidStatus === 'awaiting-rancher';
                    const actionLabel = trip.bidStatus === 'new' ? 'Ofertar' : isAwaiting ? 'Ver' : 'Aceptar';
                    const displayPrice = isCounter ? (trip.rancherCounterOffer ?? 0) : isAwaiting ? (trip.yourBid ?? 0) : trip.marketPrice;
                    const priceLabel = trip.bidStatus === 'new' ? 'Mercado' : isAwaiting ? 'Tu oferta' : 'Contraoferta';
                    const tag = getTripTag(trip);
                    return (
                      <div key={trip.id} style={{ background: isCounter ? 'rgba(245,135,24,0.13)' : 'rgba(255,255,255,0.07)', borderRadius: 10, padding: '11px 12px', border: `1px solid ${isCounter ? 'rgba(245,135,24,0.35)' : 'rgba(255,255,255,0.1)'}`, opacity: isAwaiting ? 0.78 : 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, letterSpacing: '-0.01em' }}>
                            {trip.origin} → {trip.destination}
                          </div>
                          <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.75)', background: 'rgba(255,255,255,0.12)', padding: '2px 8px', borderRadius: 99, flexShrink: 0 }}>{trip.distance} km</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 9 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 11, fontWeight: 800, color: '#fff' }}>{trip.heads} cab.</span>
                            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>·</span>
                            <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.78)' }}>{trip.cattleType}</span>
                            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>·</span>
                            <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.65)', background: 'rgba(255,255,255,0.1)', padding: '1px 6px', borderRadius: 5 }}>
                              ~{(trip.heads * 450).toLocaleString('es-PY')} kg
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                            <Calendar size={9} color="rgba(255,255,255,0.5)" />
                            <span style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap' }}>{trip.pickupDate}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1, minWidth: 0 }}>
                            {trip.bidStatus === 'new' && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 99, background: 'rgba(34,197,94,0.18)', color: '#4ADE80', fontSize: 9, fontWeight: 700, width: 'fit-content' }}>
                                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22C55E', display: 'inline-block', flexShrink: 0 }} />Disponible
                              </span>
                            )}
                            {isAwaiting && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 99, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', fontSize: 9, fontWeight: 700, width: 'fit-content' }}>
                                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#9CA3AF', display: 'inline-block', flexShrink: 0 }} />Esperando
                              </span>
                            )}
                            {isCounter && (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 99, background: 'rgba(245,135,24,0.28)', color: '#FCD9A6', fontSize: 9, fontWeight: 700, width: 'fit-content' }}>
                                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#F58718', display: 'inline-block', flexShrink: 0 }} />Requiere acción
                              </span>
                            )}
                            {tag && !['Requiere acción', 'Esperando respuesta'].includes(tag) && (
                              <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.07)', padding: '2px 6px', borderRadius: 99, display: 'inline-flex', width: 'fit-content' }}>{tag}</span>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: 13, fontWeight: 800, color: isCounter ? '#FCD9A6' : '#fff', lineHeight: 1 }}>{formatPrice(displayPrice)}</div>
                              <div style={{ fontSize: 10, color: isCounter ? 'rgba(252,217,166,0.6)' : 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>{priceLabel}</div>
                            </div>
                            <button
                              onClick={() => openMarketplaceTrip(trip)}
                              style={{ padding: '6px 13px', borderRadius: 7, border: isAwaiting ? '1px solid rgba(255,255,255,0.22)' : 'none', cursor: 'pointer', fontSize: 10, fontWeight: 800, background: isAwaiting ? 'rgba(255,255,255,0.1)' : '#F58718', color: '#fff', letterSpacing: '0.03em', whiteSpace: 'nowrap' }}
                            >
                              {actionLabel}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentView('available-trips')}
                  style={{ border: 'none', background: 'rgba(255,255,255,0.08)', color: '#fff', padding: '11px 16px', fontSize: 11, fontWeight: 800, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexShrink: 0 }}
                >
                  Ver todos los viajes
                  <ArrowRight size={11} />
                </button>
              </div>
            </div>
          );
        })()}

        {currentView !== 'dashboard' && (
          <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px' }}>
            <div className="max-w-7xl mx-auto">
            {currentView === 'current-trip' && (
              <>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Viaje Actual</h1>
                  <p className="text-gray-600">Detalles completos del viaje en curso</p>
                </div>

                <div className="rounded-lg p-6 mb-6 border-2" style={{ backgroundColor: '#1E512615', borderColor: '#1E512630' }}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="text-lg font-mono font-bold text-gray-900">{activeTrip.id}</span>
                      <span className="ml-3 px-4 py-1.5 text-white text-sm font-semibold rounded-full" style={{ backgroundColor: '#1E5126' }}>
                        🚛 En tránsito
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Ganancia estimada</div>
                      <div className="text-2xl font-bold" style={{ color: '#1E5126' }}>{activeTrip.earnings}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Mapa de ruta</h3>
                  <div className="w-full h-80 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg border-2 border-gray-300 flex items-center justify-center relative overflow-hidden mb-4">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(0deg, #666 0px, #666 1px, transparent 1px, transparent 30px), repeating-linear-gradient(90deg, #666 0px, #666 1px, transparent 1px, transparent 30px)' }} />
                    <div className="absolute top-1/4 left-1/4 flex flex-col items-center">
                      <div className="bg-blue-500 text-white px-3 py-1 rounded-lg text-sm font-bold mb-2 shadow-lg">Origen</div>
                      <MapPin className="w-8 h-8 text-blue-500" />
                      <div className="bg-white px-2 py-1 rounded shadow mt-1 text-xs font-medium">Filadelfia</div>
                    </div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                      <Truck className="w-10 h-10 animate-pulse" style={{ color: '#1E5126' }} />
                      <div className="text-white px-2 py-1 rounded shadow mt-2 text-xs font-bold" style={{ backgroundColor: '#1E5126' }}>Tu ubicación</div>
                    </div>
                    <div className="absolute bottom-1/4 right-1/4 flex flex-col items-center">
                      <div className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-bold mb-2 shadow-lg">Destino</div>
                      <MapPin className="w-8 h-8 text-red-500" />
                      <div className="bg-white px-2 py-1 rounded shadow mt-1 text-xs font-medium">Asunción</div>
                    </div>
                  </div>
                  <div className="mb-6">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="h-2 rounded-full transition-all duration-300" style={{ width: '60%', backgroundColor: '#1E5126' }} />
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs text-gray-500">Origen</span>
                      <span className="text-xs text-gray-500">Destino</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-5 h-5 text-blue-500" />
                        <span className="font-bold text-gray-900">Punto de recogida</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{activeTrip.origin}</p>
                      <p className="text-xs text-gray-600">{activeTrip.originCoords}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-5 h-5 text-red-500" />
                        <span className="font-bold text-gray-900">Destino final</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">{activeTrip.destination}</p>
                      <p className="text-xs text-gray-600">{activeTrip.destinationCoords}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Acciones rápidas</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="relative">
                      <button onClick={() => setStatusMenuOpen(o => !o)} className="w-full px-4 py-3 rounded-lg font-medium border-2 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors" style={{ borderColor: '#1E5126', color: '#1E5126' }}>
                        <Clock className="w-5 h-5" />
                        Actualizar estado
                      </button>
                      {statusMenuOpen && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 6, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, boxShadow: '0 10px 30px rgba(0,0,0,0.12)', zIndex: 30, overflow: 'hidden' }}>
                          {['En camino a recogida', 'En tránsito con ganado', 'Llegando al destino', 'Descargando ganado', 'Viaje completado'].map(s => (
                            <button key={s} onClick={() => { setStatusMenuOpen(false); if (s === 'Viaje completado') setCompletionOpen(true); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '11px 14px', fontSize: 13, fontWeight: s === 'Viaje completado' ? 700 : 500, color: s === 'Viaje completado' ? '#1E5126' : '#374151', background: 'none', border: 'none', borderBottom: '1px solid #F3F4F6', cursor: 'pointer' }}>{s}</button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button className="px-4 py-3 rounded-lg font-medium border-2 border-yellow-600 text-yellow-700 flex items-center justify-center gap-2 hover:bg-yellow-50 transition-colors">
                      <MapPin className="w-5 h-5" />
                      Reportar incidente
                    </button>
                  </div>
                  <div className="mt-3 relative">
                    <button
                      onClick={() => {
                        const text = `Estoy en ruta. Viaje ${activeTrip.id}: ${activeTrip.origin} → ${activeTrip.destination}. ETA: ${activeTrip.estimatedArrival}.`;
                        if (navigator.share) {
                          navigator.share({ title: 'Viaje en curso — TROPEX', text, url: window.location.href }).catch(() => {});
                        } else {
                          navigator.clipboard.writeText(text).then(() => { setShareToast(true); setTimeout(() => setShareToast(false), 3000); });
                        }
                      }}
                      className="w-full px-4 py-3 rounded-lg font-medium border-2 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                      style={{ borderColor: '#1E5126', color: '#1E5126' }}
                    >
                      <Share2 className="w-5 h-5" />
                      Compartir viaje
                    </button>
                    {shareToast && (
                      <div className="absolute left-1/2 -translate-x-1/2 -bottom-10 bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap">
                        Enlace copiado. Podés enviarlo por WhatsApp.
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Detalles del ganado</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Cantidad de cabezas:</span>
                        <span className="font-bold text-gray-900">{activeTrip.heads}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Tipo de ganado:</span>
                        <span className="font-bold text-gray-900">{activeTrip.cattleType}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Distancia total:</span>
                        <span className="font-bold text-gray-900">{activeTrip.distance}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Llegada estimada:</span>
                        <span className="font-bold" style={{ color: '#1E5126' }}>{activeTrip.estimatedArrival}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Contacto del establecimiento</h3>
                    <div className="space-y-3 mb-4">
                      <div>
                        <span className="text-sm text-gray-600">Capataz responsable:</span>
                        <p className="font-bold text-gray-900">{activeTrip.forepersonName}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Número de contacto:</span>
                        <p className="font-bold text-gray-900">{activeTrip.forepersonPhone}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <button onClick={handleWhatsAppForeperson} className="w-full px-4 py-3 rounded-lg font-medium text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity" style={{ backgroundColor: '#25D366' }}>
                        <MessageCircle className="w-5 h-5" />
                        Contactar por WhatsApp
                      </button>
                      <button onClick={handleCallForeperson} className="w-full px-4 py-3 rounded-lg font-medium border-2 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors" style={{ borderColor: '#1E5126', color: '#1E5126' }}>
                        <Phone className="w-5 h-5" />
                        Llamar
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {currentView === 'history' && (
              <>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis viajes</h1>
                  <p className="text-gray-600">Tus viajes y el estado de cada cobro</p>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">ID Viaje</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Fecha</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Ruta</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Cabezas</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Cobro neto</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Pago</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {tripHistory.map((trip) => (
                          <tr key={trip.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4"><span className="font-mono font-medium text-gray-900">{trip.id}</span></td>
                            <td className="px-6 py-4 text-gray-700">{trip.date}</td>
                            <td className="px-6 py-4">
                              <div className="text-sm">
                                <div className="font-medium text-gray-900">{trip.origin}</div>
                                <div className="text-gray-500">→ {trip.destination}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-700">{trip.heads}</td>
                            <td className="px-6 py-4">
                              <button onClick={() => setBreakdown({ id: trip.id, freight: trip.freight, rate: trip.rate })} title="Ver desglose" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                <span className="font-bold" style={{ color: '#1E5126', borderBottom: '1.5px dotted #1E512688' }}>{formatGs(trip.freight - Math.round(trip.freight * trip.rate))}</span>
                              </button>
                            </td>
                            <td className="px-6 py-4">
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <PayBadge state={payOf(trip.id, trip.payState)} cobro />
                                {payOf(trip.id, trip.payState) === 'verificando' && (
                                  <button onClick={() => setPayOverrides(o => ({ ...o, [trip.id]: 'pagado' }))} style={{ fontSize: 11, fontWeight: 700, color: '#1E5126', background: '#1E512612', border: 'none', borderRadius: 7, padding: '4px 9px', cursor: 'pointer' }}>Simular verificación</button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {currentView === 'reports' && (
              <>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Reportes</h1>
                  <p className="text-gray-600">Ingresos, documentos y estadísticas</p>
                </div>
                <div className="mb-6">
                  <div className="border-b border-gray-200">
                    <div className="flex gap-8">
                      <button onClick={() => setReportsTab('income')} className={`pb-3 px-1 border-b-2 font-medium transition-colors ${reportsTab === 'income' ? 'border-green-700 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`} style={reportsTab === 'income' ? { borderColor: '#1E5126', color: '#1E5126' } : {}}>
                        <div className="flex items-center gap-2"><DollarSign className="w-5 h-5" /><span>Ingresos</span></div>
                      </button>
                      <button onClick={() => setReportsTab('documents')} className={`pb-3 px-1 border-b-2 font-medium transition-colors ${reportsTab === 'documents' ? 'border-green-700 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`} style={reportsTab === 'documents' ? { borderColor: '#1E5126', color: '#1E5126' } : {}}>
                        <div className="flex items-center gap-2"><FileText className="w-5 h-5" /><span>Documentos</span></div>
                      </button>
                    </div>
                  </div>
                </div>

                {reportsTab === 'income' && (
                  <>
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Análisis de Ingresos</h2>
                      <p className="text-gray-600">Estadísticas financieras y rendimiento</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#1E512615' }}><DollarSign className="w-5 h-5" style={{ color: '#1E5126' }} /></div>
                          <span className="text-sm text-gray-600">Este mes</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">₲ 18.750.000</div>
                        <div className="flex items-center gap-1 text-green-600 text-sm"><TrendingUp className="w-4 h-4" /><span>+12% vs mes anterior</span></div>
                      </div>
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50"><Calendar className="w-5 h-5 text-blue-600" /></div>
                          <span className="text-sm text-gray-600">Promedio por viaje</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">₲ 1.250.000</div>
                      </div>
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-purple-50"><Truck className="w-5 h-5 text-purple-600" /></div>
                          <span className="text-sm text-gray-600">Viajes completados</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">15</div>
                      </div>
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-yellow-50"><ArrowUpRight className="w-5 h-5 text-yellow-600" /></div>
                          <span className="text-sm text-gray-600">Mejor mes</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">₲ 22.500.000</div>
                        <div className="text-xs text-gray-500">Febrero 2026</div>
                      </div>
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#F5871815' }}><TrendingUp className="w-5 h-5" style={{ color: '#F58718' }} /></div>
                          <span className="text-sm text-gray-600">₲ por km</span>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">₲ 3.612</div>
                        <div className="text-xs text-gray-500">Promedio mes</div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Ingresos mensuales 2026</h3>
                      <div className="space-y-3">
                        {[{ month: 'Marzo', amount: '₲ 18.750.000', percentage: 85 }, { month: 'Febrero', amount: '₲ 22.500.000', percentage: 100 }, { month: 'Enero', amount: '₲ 16.200.000', percentage: 72 }].map(item => (
                          <div key={item.month}>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium text-gray-700">{item.month}</span>
                              <span className="text-sm font-bold" style={{ color: '#1E5126' }}>{item.amount}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="h-2 rounded-full" style={{ width: `${item.percentage}%`, backgroundColor: '#1E5126' }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Rutas más rentables</h3>
                      <div className="space-y-4">
                        {[{ route: 'Filadelfia → Asunción', trips: 8, earnings: '₲ 13.200.000' }, { route: 'Concepción → Asunción', trips: 4, earnings: '₲ 7.800.000' }, { route: 'Loma Plata → Villa Hayes', trips: 3, earnings: '₲ 3.600.000' }].map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div><div className="font-medium text-gray-900">{item.route}</div><div className="text-sm text-gray-600">{item.trips} viajes</div></div>
                            <div className="text-right"><div className="font-bold" style={{ color: '#1E5126' }}>{item.earnings}</div></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {reportsTab === 'documents' && (
                  <>
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">Mis Documentos</h2>
                      <p className="text-gray-600">Actualizá tus documentos del vehículo y personales</p>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Documentos personales</h3>
                      <div className="space-y-4">
                        {[{ label: 'Licencia de Conducir', updated: '10/01/2026', status: '✓ Vigente hasta 10/01/2029', ok: true }, { label: 'Cédula de Identidad', updated: '15/03/2025', status: '✓ Vigente', ok: true }].map(doc => (
                          <div key={doc.label} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-4">
                              <FileText className="w-8 h-8 text-gray-600" />
                              <div>
                                <div className="font-medium text-gray-900">{doc.label}</div>
                                <div className="text-sm text-gray-600">Última actualización: {doc.updated}</div>
                                <div className="text-xs text-green-600 font-medium">{doc.status}</div>
                              </div>
                            </div>
                            <Button variant="outline" className="flex items-center gap-2"><Upload className="w-4 h-4" />Actualizar</Button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Documentos del vehículo</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-4"><Truck className="w-8 h-8 text-gray-600" /><div><div className="font-medium text-gray-900">Cédula Verde (Registro)</div><div className="text-sm text-gray-600">Última actualización: 20/02/2026</div><div className="text-xs text-green-600 font-medium">✓ Vigente</div></div></div>
                          <Button variant="outline" className="flex items-center gap-2"><Upload className="w-4 h-4" />Actualizar</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border-2 border-yellow-300">
                          <div className="flex items-center gap-4"><FileText className="w-8 h-8 text-yellow-600" /><div><div className="font-medium text-gray-900">Permiso de Transporte de Ganado</div><div className="text-sm text-gray-600">Última actualización: 05/01/2026</div><div className="text-xs text-yellow-700 font-medium">⚠️ Vence pronto: 05/04/2026</div></div></div>
                          <Button className="flex items-center gap-2" style={{ backgroundColor: '#1E5126' }}><Upload className="w-4 h-4" />Renovar</Button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center gap-4"><FileText className="w-8 h-8 text-gray-600" /><div><div className="font-medium text-gray-900">Seguro del Vehículo</div><div className="text-sm text-gray-600">Última actualización: 12/03/2026</div><div className="text-xs text-green-600 font-medium">✓ Vigente hasta 12/03/2027</div></div></div>
                          <Button variant="outline" className="flex items-center gap-2"><Upload className="w-4 h-4" />Actualizar</Button>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800">💡 <strong>Recordá:</strong> Mantené tus documentos actualizados para poder aceptar viajes sin interrupciones.</p>
                    </div>
                  </>
                )}
              </>
            )}

            {currentView === 'available-trips' && (
              <AvailableTripsView
                userType="owner-operator"
                onBack={() => { setCurrentView('dashboard'); setInitialTripIdToBid(undefined); setInitialGuideNumberToBid(undefined); setInitialTripIdToAccept(undefined); setInitialTripIdToView(undefined); }}
                initialTripIdToBid={initialTripIdToBid}
                initialGuideNumberToBid={initialGuideNumberToBid}
                onBidModalClosed={() => { setInitialTripIdToBid(undefined); setInitialGuideNumberToBid(undefined); }}
                initialTripIdToAccept={initialTripIdToAccept}
                onAcceptModalClosed={() => setInitialTripIdToAccept(undefined)}
                initialTripIdToView={initialTripIdToView}
                onViewModalClosed={() => setInitialTripIdToView(undefined)}
              />
            )}

            {currentView === 'cuenta' && (
              <OwnerOperatorAccount userName={userName} onLogout={onLogout} onBack={() => setCurrentView('dashboard')} />
            )}
            </div>
          </div>
        )}
      </div>

      {showCancel && activeTrip && (
        <TripCancelFlow tripId={activeTrip.id} route={`${activeTrip.origin} → ${activeTrip.destination}`} who="transportista" onClose={() => setShowCancel(false)} onConfirmed={() => {}} />
      )}

      {breakdown && (
        <PayoutBreakdown tripId={breakdown.id} freight={breakdown.freight} commissionRate={breakdown.rate} onClose={() => setBreakdown(null)} />
      )}

      {completionOpen && activeTrip && (
        <TripCompletionFlow tripId={activeTrip.id} route={`${activeTrip.origin} → ${activeTrip.destination}`} counterpart="Estancia San Pedro" destinationType="frigorifico" mandatory onComplete={() => setCompletionOpen(false)} />
      )}
    </div>
  );
}
