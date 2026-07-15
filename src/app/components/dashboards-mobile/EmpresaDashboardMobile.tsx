import { useState } from 'react';
import {
  Truck, Users, User, LogOut, Package, CheckCircle2,
  MapPin, AlertTriangle, TrendingUp, Share2, Copy, Check,
  ArrowRight, Bell, LayoutDashboard,
  MoreHorizontal, ChevronUp, ChevronDown,
  Phone, MessageCircle, Clock,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useDemoStore, getEmpresaFleet } from '../../store/demoStore';
import { truckLocations, drivers, weekData, getStatusLabel, computeFleetStats, staticTrips } from '../../data/empresa-dashboard-data';
import { formatPrice as fmt } from '../../utils/format';
import { MapView } from '../MapView';
import { AvailableTripsView } from '../tropero-v2/AvailableTripsView';
import { EmpresaAccount } from '../dashboards/EmpresaAccount';
import { TripCancelFlow } from '../TripCancelFlow';
import { coordsForCity } from '../../data/paraguay-locations';
import { fleetStatusColor } from '../../config/colors';
import { shareWhatsApp } from '../../utils/contact';
import { PayoutBreakdown, DeliveryRatingModal, PayBadge, type PayState } from '../payments/PayoutBreakdown';
import { formatGs } from '../dashboards/admin/kit';

// ── Types ──────────────────────────────────────────────────────────────────

interface EmpresaDashboardMobileProps {
  userName: string;
  onLogout: () => void;
}

type NavSection = 'home' | 'marketplace' | 'flota' | 'conductores' | 'mas' | 'cuenta';

type BidStatus = 'new' | 'rancher-countered' | 'awaiting-rancher';

interface Trip {
  id: string;
  origin: string;
  destination: string;
  heads: number;
  cattleType: string;
  pickupDate: string;
  distance: number;
  bidStatus: BidStatus;
  marketPrice: number;
  yourBid?: number;
  rancherCounterOffer?: number;
  originCoords: { lat: number; lng: number };
  hoursAgo: number;
}

// ── Component ──────────────────────────────────────────────────────────────

export function EmpresaDashboardMobile({ userName, onLogout }: EmpresaDashboardMobileProps) {
  const { orders: storeOrders } = useDemoStore();

  // ── Nav & view state ──
  const [activeNav, setActiveNav] = useState<NavSection>('home');
  const [fleetView, setFleetView] = useState<'lista' | 'mapa'>('lista');
  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);
  const [fleetDetailId, setFleetDetailId] = useState<string | null>(null);
  const [payOverrides, setPayOverrides] = useState<Record<string, PayState>>({});
  const [breakdown, setBreakdown] = useState<{ id: string; freight: number; rate: number } | null>(null);
  const [ratingTrip, setRatingTrip] = useState<{ id: string; route: string; freight: number; rate: number } | null>(null);
  const empPayOf = (id: string, fallback: PayState): PayState => payOverrides[id] ?? fallback;
  const empresaCobros: { id: string; route: string; driver: string; heads: number; freight: number; rate: number; payState: PayState; justDelivered?: boolean }[] = [
    { id: 'VJE-318', route: 'Filadelfia → Asunción', driver: 'Carlos Mendoza', heads: 45, freight: 8940000, rate: 0.02, payState: 'esperando', justDelivered: true },
    { id: 'VJE-315', route: 'Loma Plata → Villa Hayes', driver: 'Diego Areco', heads: 30, freight: 5400000, rate: 0.05, payState: 'verificando' },
    { id: 'VJE-311', route: 'Concepción → Asunción', driver: 'Rubén Closs', heads: 52, freight: 9200000, rate: 0.02, payState: 'pagado' },
  ];
  const [showFleetCancel, setShowFleetCancel] = useState(false);
  const [cancelledTrips, setCancelledTrips] = useState<string[]>([]);

  // ── Invite code ──
  const [inviteCodeCopied, setInviteCodeCopied] = useState(false);
  const [inviteCode] = useState(
    () => 'TRP-' + Math.random().toString(36).substring(2, 8).toUpperCase()
  );

  // ── Static data ────────────────────────────────────────────────────────

  const truckExtended: Record<string, {
    capacity: number; currentLoad: number; currentZone: string;
    isActive: boolean; routeProgress: number; eta: string;
    destinationCoords: { lat: number; lng: number } | null;
  }> = {
    'CAM-001': { capacity: 45, currentLoad: 45, currentZone: 'En ruta · Transchaco Km 180', isActive: true, routeProgress: 37, eta: '~2 horas', destinationCoords: { lat: -25.28, lng: -57.64 } },
    'CAM-004': { capacity: 35, currentLoad: 0, currentZone: 'Loma Plata · Disponible', isActive: false, routeProgress: 0, eta: 'Libre', destinationCoords: null },
    'CAM-007': { capacity: 50, currentLoad: 0, currentZone: 'Villa Hayes · Entregado', isActive: false, routeProgress: 100, eta: 'Entregado', destinationCoords: null },
    'CAM-009': { capacity: 50, currentLoad: 50, currentZone: 'En ruta · Retrasado ⚠', isActive: true, routeProgress: 32, eta: '~4 horas', destinationCoords: { lat: -25.28, lng: -57.64 } },
  };

  const truckDetails: Record<string, any> = {
    'CAM-001': {
      plate: 'ABC-123',
      driver: { name: 'Carlos Mendez', phone: '+595 981 123456' },
      trip: { status: 'yendo-destino', origin: 'Filadelfia', destination: 'Asunción - Frigorífico Central', cattleType: 'Gordos', heads: 45, distance: 480, agreedPrice: 2800000 },
      checkpoints: [
        { name: 'Filadelfia', passed: true },
        { name: 'Mariscal', passed: true },
        { name: 'V.Hayes', passed: false },
        { name: 'Asunción', passed: false },
      ],
    },
    'CAM-004': {
      plate: 'DEF-456',
      driver: { name: 'Roberto Silva', phone: '+595 981 234567' },
      trip: { status: 'esperando-instrucciones', origin: 'Loma Plata', destination: 'Concepción - Matadero', cattleType: 'Novillos', heads: 32, distance: 320, agreedPrice: 1900000 },
      checkpoints: [
        { name: 'Loma Plata', passed: false },
        { name: 'Concepción', passed: false },
      ],
    },
    'CAM-007': {
      plate: 'GHI-789',
      driver: { name: 'María González', phone: '+595 981 345678' },
      trip: { status: 'entregado', origin: 'Neuland', destination: 'Villa Hayes - Km 35', cattleType: 'Vaquillonas', heads: 28, distance: 380, agreedPrice: 1450000 },
      checkpoints: [
        { name: 'Neuland', passed: true },
        { name: 'V.Hayes', passed: true },
      ],
    },
    'CAM-009': {
      plate: 'JKL-012',
      driver: { name: 'Juan Pérez', phone: '+595 981 456789' },
      trip: { status: 'retraso', origin: 'Mar. Estigarribia', destination: 'Asunción - Frigorífico del Sur', cattleType: 'Gordos', heads: 50, distance: 560, agreedPrice: 2100000 },
      checkpoints: [
        { name: 'Mar. Est.', passed: true },
        { name: 'Filadelfia', passed: false },
        { name: 'V.Hayes', passed: false },
        { name: 'Asunción', passed: false },
      ],
      delay: { reason: 'Neumático pinchado en Ruta 9', estimatedDelay: '2 horas' },
    },
  };

  const maxWeekVal = Math.max(...weekData.map(d => d.value));

  const recentActivity = [
    { color: '#1E5126', text: 'CAM-001 asignado a SOL-001', time: 'hace 8 min' },
    { color: '#F58718', text: 'Roberto S. comenzó ENV-046', time: 'hace 25 min' },
    { color: '#1E5126', text: 'CAM-007 entregó · ENV-039', time: 'hace 1h' },
    { color: '#F58718', text: 'Nueva contraoferta · SOL-002', time: 'hace 2h' },
  ];

  const allTrips: Trip[] = [
    ...staticTrips,
    ...storeOrders.map(o => ({
      id: o.id, origin: o.origin, destination: o.destination, heads: o.heads,
      cattleType: o.cattleTypeLabel, pickupDate: o.pickupDate || 'A confirmar',
      distance: o.distance, bidStatus: 'new' as BidStatus, marketPrice: o.marketPrice,
      originCoords: { lat: -23.5, lng: -58.5 }, hoursAgo: 0,
    })),
  ];

  // ── Computed fleet stats ──
  const empresaFleet = getEmpresaFleet();
  const { enViajeCount, availableTrucksCount: disponibleCount } = computeFleetStats(empresaFleet, truckLocations);
  const counterTripsCount = allTrips.filter(t => t.bidStatus === 'rancher-countered').length;

  // ── Helpers ──
  const getStatusColor = fleetStatusColor;

  const fleetMarkers = truckLocations
    .map(cam => {
      const c = coordsForCity(cam.location);
      return c
        ? { id: cam.id, lat: c[0], lng: c[1], type: 'truck' as const, color: getStatusColor(cam.status), label: `${cam.id} · ${cam.location}` }
        : null;
    })
    .filter((m): m is NonNullable<typeof m> => m !== null);

  const handleCopyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setInviteCodeCopied(true);
    setTimeout(() => setInviteCodeCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    shareWhatsApp(
      `¡Unite a nuestra flota en Tropero!\n\nUsá este código: ${inviteCode}\n\nDescargá la app y comenzá a trabajar con nosotros.`,
    );
  };


  // ── View: Home ─────────────────────────────────────────────────────────

  const renderHome = () => (
    <div style={{ paddingBottom: 80 }}>
      {/* Dark green hero */}
      <div style={{
        background: '#1E5126',
        padding: '16px 20px 18px',
        paddingTop: 'max(16px, env(safe-area-inset-top))',
      }}>
        {/* Header row — mismo header de marca que el ganadero */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <img src="/tropex-isotipo.png" alt="TROPEX" style={{ width: 22, height: 22, objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.48)', lineHeight: 1 }}>TROPEX · Empresa</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', lineHeight: 1.2, marginTop: 2 }}>Hola, {userName.split(' ')[0]}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setActiveNav('marketplace')}
              style={{ position: 'relative', width: 36, height: 36, background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <Bell size={19} color="#fff" />
              {counterTripsCount > 0 && (
                <span style={{ position: 'absolute', top: 7, right: 7, width: 8, height: 8, borderRadius: '50%', background: '#F58718' }} />
              )}
            </button>
            <button onClick={() => setActiveNav('cuenta')} aria-label="Cuenta" style={{ width: 36, height: 36, borderRadius: 11, background: 'rgba(255,255,255,0.12)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <User size={19} color="#fff" />
            </button>
          </div>
        </div>

        {/* Stat chips */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 12px' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{enViajeCount}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>En ruta</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 12px' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#22C55E', lineHeight: 1 }}>{disponibleCount}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>Disponibles</div>
          </div>
          <div style={{
            background: counterTripsCount > 0 ? 'rgba(245,135,24,0.2)' : 'rgba(255,255,255,0.1)',
            border: counterTripsCount > 0 ? '1px solid rgba(245,135,24,0.35)' : 'none',
            borderRadius: 12, padding: '10px 12px',
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: counterTripsCount > 0 ? '#F58718' : '#fff', lineHeight: 1 }}>{counterTripsCount}</div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>Con acción</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 16px 0' }}>
        {/* Primary CTA */}
        <button
          onClick={() => setActiveNav('marketplace')}
          style={{
            width: '100%', background: '#F58718', borderRadius: 16, padding: '14px 18px',
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', boxShadow: '0 4px 20px rgba(245,135,24,0.35)',
            marginBottom: 16, position: 'relative', overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: -25, right: -25, width: 110, height: 110, background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 7 }}>
              <Package size={17} color="#fff" strokeWidth={2.5} />
              Ver viajes disponibles
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.78)', marginTop: 3 }}>
              {allTrips.filter(t => t.bidStatus === 'new').length} disponibles
              {counterTripsCount > 0 && ` · ${counterTripsCount} contraofertas`}
            </div>
          </div>
          <ArrowRight size={20} color="rgba(255,255,255,0.85)" />
        </button>

        {/* Flota preview */}
        <div>
          {/* Compact map preview */}
          <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', height: 180, marginBottom: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
            <MapView
              height={180}
              interactive={false}
              markers={fleetMarkers}
              onMarkerClick={(id) => { setSelectedTruckId(id); setActiveNav('flota'); }}
            />
            <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', zIndex: 500, background: 'rgba(0,0,0,0.5)', borderRadius: 99, padding: '3px 10px', fontSize: 9, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>
              {enViajeCount} en ruta · toca un camión para ver detalles
            </div>
          </div>

          {/* Fleet list preview (3 trucks) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {truckLocations.slice(0, 3).map(cam => {
              const ext = truckExtended[cam.id];
              const tone = getStatusColor(cam.status);
              return (
                <button
                  key={cam.id}
                  onClick={() => { setSelectedTruckId(cam.id); setActiveNav('flota'); }}
                  style={{ background: '#fff', borderRadius: 12, padding: '12px 14px', border: '1.5px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left', width: '100%', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
                >
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: tone + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Truck size={17} color={tone} strokeWidth={2.2} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: '#111', fontFamily: 'monospace' }}>{cam.id}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: tone, background: tone + '14', padding: '1px 6px', borderRadius: 4 }}>{getStatusLabel(cam.status)}</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#6B7280' }}>{cam.driver}</div>
                    <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ext?.currentZone}</div>
                  </div>
                  {ext?.isActive && (
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#1E5126' }}>{ext.eta}</div>
                      <div style={{ fontSize: 9, color: '#9CA3AF' }}>ETA</div>
                    </div>
                  )}
                </button>
              );
            })}
            <button
              onClick={() => setActiveNav('flota')}
              style={{ background: 'none', border: '1.5px dashed #D1D5DB', borderRadius: 12, padding: '10px', fontSize: 12, fontWeight: 700, color: '#1E5126', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}
            >
              Ver toda la flota <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );


  // ── View: Marketplace (unificado en el componente compartido) ───────────

  const renderMarketplace = () => (
    <div style={{ minHeight: 'calc(100vh - 64px)' }}>
      <AvailableTripsView userType="empresa" onBack={() => setActiveNav('home')} />
    </div>
  );

  // ── View: Flota ────────────────────────────────────────────────────────

  const renderFlota = () => (
    <div style={{ paddingBottom: 80 }}>
      {/* Section header with Mapa/Lista toggle */}
      <div style={{ background: '#1E5126', padding: '16px 20px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 3 }}>Mi Flota</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
              {enViajeCount} en ruta · {disponibleCount} disponibles
            </div>
          </div>
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.25)', borderRadius: 9, padding: 3 }}>
            {(['lista', 'mapa'] as const).map(v => (
              <button
                key={v}
                onClick={() => setFleetView(v)}
                style={{ padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, transition: 'all 0.15s', background: fleetView === v ? '#fff' : 'transparent', color: fleetView === v ? '#1E5126' : 'rgba(255,255,255,0.65)' }}
              >
                {v === 'lista' ? 'Lista' : 'Mapa'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map view */}
      {fleetView === 'mapa' && (
        <div style={{ position: 'relative', height: 260, background: '#eef0eb' }}>
          <MapView
            height={260}
            markers={fleetMarkers}
            onMarkerClick={(id) => setSelectedTruckId(selectedTruckId === id ? null : id)}
          />
          <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', zIndex: 500, background: 'rgba(0,0,0,0.5)', borderRadius: 99, padding: '4px 12px', fontSize: 9, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>
            {selectedTruckId ? `${selectedTruckId} seleccionado` : 'Tocá un camión para detalles'}
          </div>
        </div>
      )}

      {/* Fleet list */}
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {truckLocations.map(cam => {
          const ext = truckExtended[cam.id];
          const details = truckDetails[cam.id];
          const tone = getStatusColor(cam.status);
          const isSel = selectedTruckId === cam.id;

          return (
            <div key={cam.id}>
              {/* Truck row (tappable header) */}
              <button
                onClick={() => setSelectedTruckId(isSel ? null : cam.id)}
                style={{
                  background: '#fff',
                  borderRadius: isSel ? '14px 14px 0 0' : 14,
                  padding: '14px',
                  border: isSel ? `2px solid #1E5126` : '1.5px solid #E5E7EB',
                  borderBottom: isSel ? 'none' : undefined,
                  width: '100%', textAlign: 'left', cursor: 'pointer',
                  boxShadow: isSel ? '0 2px 12px rgba(30,81,38,0.12)' : '0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 11, background: tone + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Truck size={19} color={tone} strokeWidth={2.2} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: '#111', fontFamily: 'monospace' }}>{cam.id}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: tone, background: tone + '14', padding: '2px 7px', borderRadius: 4 }}>{getStatusLabel(cam.status)}</span>
                      {details?.delay && <AlertTriangle size={12} color="#F58718" />}
                    </div>
                    <div style={{ fontSize: 12, color: '#6B7280' }}>{cam.driver}</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ext?.currentZone}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    {ext?.isActive && (
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#1E5126' }}>{ext.eta}</div>
                        <div style={{ fontSize: 9, color: '#9CA3AF' }}>ETA</div>
                      </div>
                    )}
                    {isSel ? <ChevronUp size={14} color="#9CA3AF" /> : <ChevronDown size={14} color="#9CA3AF" />}
                  </div>
                </div>

                {ext?.isActive && (
                  <div style={{ marginTop: 10, height: 3, background: '#F0F0F0', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ width: `${ext.routeProgress}%`, height: '100%', background: 'linear-gradient(90deg, #1E5126 0%, #08221A 100%)', borderRadius: 99 }} />
                  </div>
                )}
              </button>

              {/* Expanded detail panel */}
              {isSel && details && (
                <div style={{ background: '#F6F1E8', borderRadius: '0 0 14px 14px', padding: '12px 14px 14px', border: '2px solid #1E5126', borderTop: '1px solid rgba(30,81,38,0.12)' }}>
                  {/* Delay alert */}
                  {details.delay && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '9px 10px', borderRadius: 10, background: 'rgba(245,135,24,0.08)', border: '1px solid rgba(245,135,24,0.2)', marginBottom: 12 }}>
                      <AlertTriangle size={13} color="#F58718" style={{ marginTop: 1, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#92400e', marginBottom: 1 }}>Retraso estimado: {details.delay.estimatedDelay}</div>
                        <div style={{ fontSize: 10, color: '#9CA3AF' }}>{details.delay.reason}</div>
                      </div>
                    </div>
                  )}

                  {/* Trip summary row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <MapPin size={11} color="#1E5126" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: '#374151', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {details.trip.origin} → {details.trip.destination.split(' - ')[0]}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#1E5126', flexShrink: 0 }}>
                      {fmt(details.trip.agreedPrice)}
                    </span>
                  </div>

                  {/* Metadata row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
                    {[
                      { label: 'Patente', value: details.plate },
                      { label: 'Cabezas', value: `${details.trip.heads} ${details.trip.cattleType}` },
                      { label: 'Distancia', value: `${details.trip.distance} km` },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <div style={{ fontSize: 9, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{label}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#111' }}>{value}</div>
                      </div>
                    ))}
                  </div>

                  {/* COTA checkpoints */}
                  {details.checkpoints && details.checkpoints.length > 0 && (
                    <div>
                      <div style={{ fontSize: 9, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 7 }}>Progreso COTA</div>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, position: 'relative' }}>
                        <div style={{ position: 'absolute', top: 9, left: 9, right: 9, height: 2, background: '#E5E7EB', zIndex: 0 }} />
                        <div style={{ position: 'absolute', top: 9, left: 9, height: 2, background: '#1E5126', zIndex: 1, width: `${(details.checkpoints.filter((c: any) => c.passed).length / Math.max(details.checkpoints.length - 1, 1)) * (100 - (18 / details.checkpoints.length) * 100)}%` }} />
                        {details.checkpoints.map((cp: any, i: number) => (
                          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, zIndex: 2 }}>
                            <div style={{ width: 18, height: 18, borderRadius: '50%', background: cp.passed ? '#1E5126' : '#F3F4F6', border: `2px solid ${cp.passed ? '#1E5126' : '#D1D5DB'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {cp.passed && (
                                <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                                  <path d="M1 3L3 5.5L7 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </div>
                            <div style={{ fontSize: 8.5, fontWeight: 600, color: cp.passed ? '#1E5126' : '#9CA3AF', textAlign: 'center', lineHeight: 1.2 }}>
                              {cp.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Driver contact */}
                  <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(30,81,38,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={13} color="#1E5126" />
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#111' }}>{details.driver.name}</div>
                        <div style={{ fontSize: 10, color: '#9CA3AF' }}>{details.driver.phone}</div>
                      </div>
                    </div>
                    <a
                      href={`tel:${details.driver.phone}`}
                      style={{ width: 34, height: 34, borderRadius: 9, background: '#1E5126', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, textDecoration: 'none' }}
                    >
                      <Phone size={14} color="#fff" />
                    </a>
                  </div>

                  <button onClick={() => setFleetDetailId(cam.id)} style={{ marginTop: 12, width: '100%', padding: '12px 0', borderRadius: 11, border: '1.5px solid #1E5126', background: '#fff', color: '#1E5126', fontSize: 13, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                    Ver detalles del viaje <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // ── View: Conductores ──────────────────────────────────────────────────

  const renderConductores = () => (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ background: '#1E5126', padding: '16px 20px 20px' }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 3 }}>Conductores</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{drivers.length} conductores activos</div>
      </div>

      {/* Invite card */}
      <div style={{ margin: '12px 16px 0', padding: '14px', background: '#fff', borderRadius: 14, border: '1.5px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 8 }}>Invitar conductor</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#F6F1E8', borderRadius: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 17, fontWeight: 800, color: '#1E5126', letterSpacing: '0.06em', flex: 1 }}>{inviteCode}</span>
          <button
            onClick={handleCopyInviteCode}
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 11px', background: inviteCodeCopied ? '#1E5126' : '#fff', border: '1.5px solid #E5E7EB', borderRadius: 8, cursor: 'pointer', fontSize: 11, fontWeight: 700, color: inviteCodeCopied ? '#fff' : '#374151', flexShrink: 0 }}
          >
            {inviteCodeCopied ? <><Check size={11} /> Copiado</> : <><Copy size={11} /> Copiar</>}
          </button>
        </div>
        <button
          onClick={handleShareWhatsApp}
          style={{ width: '100%', padding: '10px', borderRadius: 10, border: 'none', background: '#25D366', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
        >
          <Share2 size={13} /> Compartir por WhatsApp
        </button>
      </div>

      {/* Driver list */}
      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {drivers.map(driver => (
          <div key={driver.id} style={{ background: '#fff', borderRadius: 14, padding: '14px', border: '1.5px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(30,81,38,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14, fontWeight: 800, color: '#1E5126' }}>
              {driver.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111', marginBottom: 2 }}>{driver.name}</div>
              <div style={{ fontSize: 11, color: '#9CA3AF' }}>{driver.trips} viajes · {driver.avgSpeed}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#1E5126', marginTop: 2 }}>{driver.revenue}</div>
            </div>
            {driver.speedWarnings > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
                <AlertTriangle size={16} color="#F58718" />
                <span style={{ fontSize: 9, fontWeight: 700, color: '#F58718' }}>{driver.speedWarnings} alerta{driver.speedWarnings > 1 ? 's' : ''}</span>
              </div>
            ) : (
              <CheckCircle2 size={18} color="#22C55E" style={{ flexShrink: 0 }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // ── View: Más ──────────────────────────────────────────────────────────

  const renderMas = () => (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ background: '#1E5126', padding: '16px 20px 20px' }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 3 }}>Más</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Reportes, soporte y cuenta</div>
      </div>

      <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Weekly report chart */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', border: '1.5px solid #E5E7EB', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>Viajes esta semana</div>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#1E5126' }}>{weekData.reduce((s, d) => s + d.value, 0)} total</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 7, height: 80 }}>
            {weekData.map(d => (
              <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#1E5126' }}>{d.value}</div>
                <div style={{ width: '76%', background: d.value === maxWeekVal ? '#F58718' : '#1E5126', borderRadius: '3px 3px 0 0', height: `${(d.value / maxWeekVal) * 54}px`, opacity: 0.85 }} />
                <div style={{ fontSize: 9, color: '#aaa', fontWeight: 700 }}>{d.day}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, padding: '9px 10px', background: 'rgba(30,81,38,0.06)', borderRadius: 9, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={14} color="#1E5126" />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#111' }}>Mejor día: Jueves — {maxWeekVal} viajes</div>
              <div style={{ fontSize: 10, color: '#9CA3AF' }}>47 viajes totales este mes · ↑ 6 vs mes anterior</div>
            </div>
          </div>
        </div>

        {/* Cobros de viajes (estados de pago + rating del recién entregado) */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', border: '1.5px solid #E5E7EB' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>Cobros de viajes</span>
            <span style={{ fontSize: 10.5, color: '#9CA3AF' }}>tocá el monto</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {empresaCobros.map(t => {
              const ps = empPayOf(t.id, t.payState);
              const neto = t.freight - Math.round(t.freight * t.rate);
              return (
                <div key={t.id} style={{ border: `1px solid ${t.justDelivered ? '#1E512633' : '#F0EEE7'}`, borderRadius: 12, padding: '11px 12px', boxShadow: t.justDelivered ? '0 0 0 1px #1E512622' : 'none' }}>
                  {t.justDelivered && <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 800, color: '#1E5126', background: '#1E512612', padding: '2px 8px', borderRadius: 99, marginBottom: 6 }}><CheckCircle2 size={11} /> Recién entregado</div>}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{t.route}</div>
                      <div style={{ fontSize: 10.5, color: '#888' }}><span style={{ fontFamily: 'monospace' }}>{t.id}</span> · {t.driver} · {t.heads} cab.</div>
                    </div>
                    <button onClick={() => setBreakdown({ id: t.id, freight: t.freight, rate: t.rate })} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', flexShrink: 0 }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: '#1E5126', borderBottom: '1.5px dotted #1E512688' }}>{formatGs(neto)}</span>
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 9, flexWrap: 'wrap' }}>
                    <PayBadge state={ps} cobro />
                    {ps === 'verificando' && <button onClick={() => setPayOverrides(o => ({ ...o, [t.id]: 'pagado' }))} style={{ fontSize: 11, fontWeight: 700, color: '#1E5126', background: '#1E512612', border: 'none', borderRadius: 7, padding: '5px 9px', cursor: 'pointer' }}>Simular verificación</button>}
                    {t.justDelivered && <button onClick={() => setRatingTrip({ id: t.id, route: t.route, freight: t.freight, rate: t.rate })} style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: '#1E5126', border: 'none', borderRadius: 7, padding: '5px 10px', cursor: 'pointer' }}>Calificar y ver cobro</button>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity */}
        <div style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', border: '1.5px solid #E5E7EB' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 10 }}>Actividad reciente</div>
          {recentActivity.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: i < recentActivity.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: item.color, flexShrink: 0, marginTop: 5 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#333', lineHeight: 1.45 }}>{item.text}</div>
                <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>{item.time}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Support */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #E5E7EB', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #F3F4F6' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>Soporte</div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>¿Necesitás ayuda?</div>
          </div>
          {[
            { icon: MessageCircle, label: 'Chat de soporte', sub: 'Respuesta en menos de 2 horas' },
            { icon: Phone, label: 'Llamar a soporte', sub: '+595 21 000 0000' },
          ].map(({ icon: Icon, label, sub }, i) => (
            <button key={label} style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', borderBottom: i === 0 ? '1px solid #F3F4F6' : 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(30,81,38,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={16} color="#1E5126" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{label}</div>
                <div style={{ fontSize: 10, color: '#9CA3AF' }}>{sub}</div>
              </div>
              <ArrowRight size={14} color="#D1D5DB" />
            </button>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={onLogout}
          style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', border: '1.5px solid #E5E7EB', width: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
        >
          <LogOut size={16} color="#9CA3AF" />
          <span style={{ fontSize: 13, fontWeight: 600, color: '#6B7280' }}>Cerrar sesión</span>
        </button>
      </div>
    </div>
  );

  // ── Nav items ──────────────────────────────────────────────────────────

  const navItems: Array<{ key: NavSection; icon: LucideIcon; label: string; dot?: boolean }> = [
    { key: 'home', icon: LayoutDashboard, label: 'Panel' },
    { key: 'marketplace', icon: Package, label: 'Marketplace', dot: counterTripsCount > 0 },
    { key: 'flota', icon: Truck, label: 'Flota' },
    { key: 'conductores', icon: Users, label: 'Conductores' },
    { key: 'mas', icon: MoreHorizontal, label: 'Más' },
  ];

  // ── Pantalla completa: detalle del viaje de un camión + cancelación ──
  const renderFleetTripDetail = () => {
    if (!fleetDetailId) return null;
    const d = truckDetails[fleetDetailId];
    const ext = truckExtended[fleetDetailId];
    if (!d) return null;
    const cancelled = cancelledTrips.includes(fleetDetailId);
    const route = `${d.trip.origin} → ${String(d.trip.destination).split(' - ')[0]}`;
    const active = !!ext?.isActive && !cancelled;
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 1500, background: '#F6F1E8', display: 'flex', flexDirection: 'column', fontFamily: '"IBM Plex Sans", system-ui, sans-serif' }}>
        <div style={{ background: '#1E5126', padding: '14px 16px 16px', paddingTop: 'max(14px, env(safe-area-inset-top))', flexShrink: 0 }}>
          <button onClick={() => setFleetDetailId(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 0, marginBottom: 10 }}>← Volver a la flota</button>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>{fleetDetailId} · {d.plate}</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginTop: 2 }}>Detalles del viaje</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 40px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E9E4D8', padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <MapPin size={15} color="#1E5126" /><span style={{ fontSize: 15, fontWeight: 800, color: '#111' }}>{route}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {[['Cabezas', String(d.trip.heads)], ['Tipo', d.trip.cattleType], ['Distancia', `${d.trip.distance} km`]].map(([l, v]) => (
                <div key={l}><div style={{ fontSize: 9, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>{l}</div><div style={{ fontSize: 14, fontWeight: 800, color: '#111', marginTop: 2 }}>{v}</div></div>
              ))}
            </div>
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #F3F0E8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#9CA3AF' }}>Precio acordado</span><span style={{ fontSize: 16, fontWeight: 800, color: '#1E5126' }}>{fmt(d.trip.agreedPrice)}</span>
            </div>
          </div>

          {cancelled ? (
            <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertTriangle size={20} color="#B91C1C" /><span style={{ fontSize: 14, fontWeight: 800, color: '#B91C1C' }}>Viaje cancelado</span>
            </div>
          ) : active && (
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E9E4D8', padding: '14px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: '#6B7280' }}>Progreso del viaje</span><span style={{ fontSize: 12, fontWeight: 800, color: '#F58718' }}>{ext.routeProgress}% · ETA {ext.eta}</span>
              </div>
              <div style={{ height: 8, borderRadius: 99, background: '#EFEAE0' }}><div style={{ width: `${ext.routeProgress}%`, height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, #1E5126, #08221A)' }} /></div>
            </div>
          )}

          {d.checkpoints && d.checkpoints.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E9E4D8', padding: '14px 16px' }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#111', marginBottom: 12 }}>Puntos de control SENACSA</div>
              {d.checkpoints.map((cp: any, i: number) => (
                <div key={i} style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: cp.passed ? '#1E5126' : '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{cp.passed && <Check size={10} color="#fff" />}</div>
                    {i < d.checkpoints.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 16, background: cp.passed ? '#1E5126' : '#E5E7EB' }} />}
                  </div>
                  <div style={{ paddingBottom: 12, fontSize: 13, fontWeight: cp.passed ? 700 : 500, color: cp.passed ? '#111' : '#9CA3AF' }}>{cp.name}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E9E4D8', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div><div style={{ fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Chofer</div><div style={{ fontSize: 14, fontWeight: 800, color: '#111', marginTop: 2 }}>{d.driver.name}</div></div>
            <a href={`tel:${d.driver.phone}`} style={{ width: 40, height: 40, borderRadius: 11, background: '#1E5126', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}><Phone size={16} color="#fff" /></a>
          </div>

          {active && (
            <button onClick={() => setShowFleetCancel(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 0', borderRadius: 13, border: '1.5px solid #FECACA', background: '#FEF2F2', color: '#B91C1C', fontSize: 14, fontWeight: 800, cursor: 'pointer', width: '100%', marginTop: 2 }}>
              <AlertTriangle size={16} /> Cancelar viaje
            </button>
          )}
        </div>
      </div>
    );
  };

  // ── Main render ────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100vh', background: '#F6F1E8', fontFamily: '"IBM Plex Sans", system-ui, sans-serif' }}>
      {/* Scrollable content */}
      <div style={{ minHeight: '100vh', overflowY: 'auto', paddingBottom: 64 }}>
        {activeNav === 'home'        && renderHome()}
        {activeNav === 'marketplace' && renderMarketplace()}
        {activeNav === 'flota'       && renderFlota()}
        {activeNav === 'conductores' && renderConductores()}
        {activeNav === 'mas'         && renderMas()}
        {activeNav === 'cuenta'      && <EmpresaAccount userName={userName} onLogout={onLogout} onBack={() => setActiveNav('home')} />}
      </div>

      {/* Detalle del viaje (pantalla completa) + cancelación */}
      {fleetDetailId && renderFleetTripDetail()}
      {showFleetCancel && fleetDetailId && (() => {
        const d = truckDetails[fleetDetailId];
        return (
          <TripCancelFlow
            tripId={fleetDetailId}
            route={d ? `${d.trip.origin} → ${String(d.trip.destination).split(' - ')[0]}` : ''}
            who="empresa"
            onClose={() => setShowFleetCancel(false)}
            onConfirmed={() => { setShowFleetCancel(false); setCancelledTrips(t => [...t, fleetDetailId]); }}
          />
        );
      })()}

      {breakdown && (
        <PayoutBreakdown tripId={breakdown.id} freight={breakdown.freight} commissionRate={breakdown.rate} onClose={() => setBreakdown(null)} />
      )}
      {ratingTrip && (
        <DeliveryRatingModal tripId={ratingTrip.id} route={ratingTrip.route} counterpart="Estancia La Esperanza" freight={ratingTrip.freight} commissionRate={ratingTrip.rate} onClose={() => setRatingTrip(null)} />
      )}

      {/* Fixed bottom navigation */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: '#fff', borderTop: '1px solid rgba(0,0,0,0.07)',
        display: 'flex', padding: '8px 0 calc(8px + env(safe-area-inset-bottom))',
        zIndex: 50, boxShadow: '0 -2px 14px rgba(0,0,0,0.07)',
      }}>
        {navItems.map(({ key, icon: Icon, label, dot }) => {
          const isActive = activeNav === key;
          return (
            <button
              key={key}
              onClick={() => setActiveNav(key)}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', position: 'relative' }}
            >
              <Icon
                size={21}
                color={isActive ? '#1E5126' : '#9CA3AF'}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span style={{ fontSize: 9, fontWeight: isActive ? 700 : 500, color: isActive ? '#1E5126' : '#9CA3AF', lineHeight: 1 }}>
                {label}
              </span>
              {dot && (
                <span style={{ position: 'absolute', top: 2, left: '55%', width: 7, height: 7, borderRadius: '50%', background: '#F58718', border: '1.5px solid #fff' }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
