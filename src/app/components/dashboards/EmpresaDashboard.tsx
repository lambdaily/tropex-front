import { useState, useEffect, type CSSProperties } from 'react';
import {
  Truck,
  Users,
  BarChart3,
  X,
  User,
  LogOut,
  Package,
  CheckCircle2,
  Clock,
  MapPin,
  AlertTriangle,
  TrendingUp,
  Share2,
  Copy,
  Check,
  ArrowRight,
  Bell,
  DollarSign,
  LayoutDashboard,
  Star,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Mail,
  MessageCircle,
  ExternalLink,
  Calendar,
} from 'lucide-react';
import { Button } from '../ui/button';
import { AvailableTripsView } from '../tropero-v2/AvailableTripsView';
import { EmpresaAccount } from './EmpresaAccount';
import { TruckDetailModal } from './TruckDetailModal';
import { TripCancelFlow } from '../TripCancelFlow';
import { PayoutBreakdown, DeliveryRatingModal, PayBadge, type PayState } from '../payments/PayoutBreakdown';
import { formatGs } from './admin/kit';
import { useDemoStore, getEmpresaFleet } from '../../store/demoStore';
import { truckLocations, drivers, weekData, getStatusLabel, computeFleetStats, staticTrips as allRecommendedTrips } from '../../data/empresa-dashboard-data';
import { formatPrice } from '../../utils/format';
import { filterAndSortTrips } from '../../utils/trips-filter';
import { MapView } from '../MapView';
import { fleetStatusColor } from '../../config/colors';
import { shareWhatsApp } from '../../utils/contact';

interface EmpresaDashboardProps {
  userName: string;
  onLogout: () => void;
}

export function EmpresaDashboard({ userName, onLogout }: EmpresaDashboardProps) {
  const { orders: storeOrders } = useDemoStore();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'fleet' | 'drivers' | 'available-trips' | 'reports' | 'support' | 'cuenta'>('dashboard');
  const [showEmpresaCancel, setShowEmpresaCancel] = useState(false);
  const [inviteCodeCopied, setInviteCodeCopied] = useState(false);
  const [selectedTruckId, setSelectedTruckId] = useState<string | null>(null);
  const [selectedSolId, setSelectedSolId] = useState<string | null>(null);
  const [initialTripIdToBid, setInitialTripIdToBid] = useState<string | undefined>(undefined);
  const [initialGuideNumberToBid, setInitialGuideNumberToBid] = useState<1 | 2 | undefined>(undefined);
  const [initialBothGuides, setInitialBothGuides] = useState(false);
  const [initialTripIdToAccept, setInitialTripIdToAccept] = useState<string | undefined>(undefined);
  const [initialTripIdToView, setInitialTripIdToView] = useState<string | undefined>(undefined);
  const [empresaTab, setEmpresaTab] = useState<'Flota en ruta' | 'Marketplace' | 'Conductores' | 'Mis viajes' | 'Reportes'>('Flota en ruta');
  const [payOverrides, setPayOverrides] = useState<Record<string, PayState>>({});
  const [breakdown, setBreakdown] = useState<{ id: string; freight: number; rate: number } | null>(null);
  const [ratingTrip, setRatingTrip] = useState<{ id: string; route: string; driver: string; freight: number; rate: number } | null>(null);
  const empresaCobros: { id: string; route: string; driver: string; heads: number; freight: number; rate: number; payState: PayState; justDelivered?: boolean }[] = [
    { id: 'VJE-318', route: 'Filadelfia → Asunción', driver: 'Carlos Mendoza', heads: 45, freight: 8940000, rate: 0.02, payState: 'esperando', justDelivered: true },
    { id: 'VJE-315', route: 'Loma Plata → Villa Hayes', driver: 'Diego Areco', heads: 30, freight: 5400000, rate: 0.05, payState: 'verificando' },
    { id: 'VJE-311', route: 'Concepción → Asunción', driver: 'Rubén Closs', heads: 52, freight: 9200000, rate: 0.02, payState: 'pagado' },
  ];
  const empPayOf = (id: string, fallback: PayState): PayState => payOverrides[id] ?? fallback;
  const [selectedTruckForModal, setSelectedTruckForModal] = useState<string | null>(null);
  const [recomendadosActive, setRecomendadosActive] = useState(true);
  const [priceSort, setPriceSort] = useState<'none' | 'asc' | 'desc'>('none');
  const [estadoFilter, setEstadoFilter] = useState<'todos' | 'accion' | 'disponible' | 'esperando'>('todos');
  const [distanceMax, setDistanceMax] = useState(1000);
  const [currentTripIndex, setCurrentTripIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTripIndex(i => (i + 1) % 3);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const truckDetailsData = {
    'CAM-001': {
      id: 'CAM-001',
      plate: 'ABC-123',
      driver: {
        id: 'DRV-001',
        name: 'Carlos Mendez',
        phone: '+595 981 123456',
      },
      trip: {
        id: 'VIA-2026-001',
        status: 'yendo-destino' as const,
        origin: 'Filadelfia',
        originEstancia: 'Estancia Don Pedro - SENACSA 12345',
        destination: 'Asunción - Frigorífico Central',
        cattleType: 'Gordos',
        heads: 45,
        pickupDate: '24/03/2026 06:00',
        deliveryDate: '24/03/2026 14:00',
        distance: 480,
        agreedPrice: 2800000,
        rancherName: 'Estancia Don Pedro',
        rancherPhone: '+595 981 234567',
      },
      documents: {
        guia: {
          uploaded: true,
          uploadDate: '24/03/2026 06:15',
          url: '#',
        },
        cota: {
          uploaded: true,
          uploadDate: '24/03/2026 05:45',
          checkpoints: [
            { name: 'Control Filadelfia', location: 'Ruta 9 Km 450', passed: true, time: '06:30' },
            { name: 'Control Mariscal Estigarribia', location: 'Ruta 9 Km 300', passed: true, time: '09:15' },
            { name: 'Control Villa Hayes', location: 'Ruta Transchaco Km 50', passed: false },
          ],
        },
      },
      bundles: [
        { id: 'BDL-001', origin: 'Asunción', destination: 'Loma Plata', estimatedPrice: 1200000 },
        { id: 'BDL-002', origin: 'Villa Hayes', destination: 'Neuland', estimatedPrice: 980000 },
      ],
    },
    'CAM-004': {
      id: 'CAM-004',
      plate: 'DEF-456',
      driver: {
        id: 'DRV-002',
        name: 'Roberto Silva',
        phone: '+595 981 234567',
      },
      trip: {
        id: 'VIA-2026-004',
        status: 'esperando-instrucciones' as const,
        origin: 'Loma Plata',
        originEstancia: 'Rancho San Miguel - SENACSA 23456',
        destination: 'Concepción - Matadero Municipal',
        cattleType: 'Novillos',
        heads: 32,
        pickupDate: '25/03/2026 05:30',
        deliveryDate: '25/03/2026 11:30',
        distance: 320,
        agreedPrice: 1900000,
        rancherName: 'Rancho San Miguel',
        rancherPhone: '+595 981 345678',
      },
      documents: {
        guia: {
          uploaded: false,
        },
        cota: {
          uploaded: false,
          checkpoints: [
            { name: 'Control Loma Plata', location: 'Av. Central', passed: false },
            { name: 'Control Concepción', location: 'Ruta 5', passed: false },
          ],
        },
      },
      bundles: [
        { id: 'BDL-005', origin: 'Concepción', destination: 'Filadelfia', estimatedPrice: 1450000 },
      ],
    },
    'CAM-007': {
      id: 'CAM-007',
      plate: 'GHI-789',
      driver: {
        id: 'DRV-003',
        name: 'María González',
        phone: '+595 981 345678',
      },
      trip: {
        id: 'VIA-2026-007',
        status: 'entregado' as const,
        origin: 'Neuland',
        originEstancia: 'Ganadera La Esperanza - SENACSA 34567',
        destination: 'Villa Hayes - Ruta Transchaco Km 35',
        cattleType: 'Vaquillonas',
        heads: 28,
        pickupDate: '23/03/2026 07:00',
        deliveryDate: '23/03/2026 14:00',
        distance: 380,
        agreedPrice: 1450000,
        rancherName: 'Ganadera La Esperanza',
        rancherPhone: '+595 981 456789',
      },
      documents: {
        guia: {
          uploaded: true,
          uploadDate: '23/03/2026 07:15',
          url: '#',
        },
        cota: {
          uploaded: true,
          uploadDate: '23/03/2026 06:45',
          checkpoints: [
            { name: 'Control Neuland', location: 'Colonia Neuland', passed: true, time: '07:30' },
            { name: 'Control Villa Hayes', location: 'Ruta Transchaco', passed: true, time: '12:45' },
          ],
        },
      },
      deliveryProof: {
        certificado: { uploaded: true, url: '#' },
        descarga: { uploaded: true, url: '#' },
        bascula: { uploaded: true, url: '#' },
      },
    },
    'CAM-009': {
      id: 'CAM-009',
      plate: 'JKL-012',
      driver: {
        id: 'DRV-004',
        name: 'Juan Pérez',
        phone: '+595 981 456789',
      },
      trip: {
        id: 'VIA-2026-009',
        status: 'retraso' as const,
        origin: 'Mariscal Estigarribia',
        originEstancia: 'Estancia Santa Rosa - SENACSA 45678',
        destination: 'Asunción - Frigorífico del Sur',
        cattleType: 'Gordos',
        heads: 50,
        pickupDate: '24/03/2026 05:00',
        deliveryDate: '24/03/2026 14:00',
        distance: 560,
        agreedPrice: 2100000,
        rancherName: 'Estancia Santa Rosa',
        rancherPhone: '+595 981 567890',
      },
      documents: {
        guia: {
          uploaded: true,
          uploadDate: '24/03/2026 05:20',
          url: '#',
        },
        cota: {
          uploaded: true,
          uploadDate: '24/03/2026 04:50',
          checkpoints: [
            { name: 'Control Mariscal Estigarribia', location: 'Ruta 9', passed: true, time: '05:30' },
            { name: 'Control Filadelfia', location: 'Ruta 9 Km 450', passed: false },
          ],
        },
      },
      delay: {
        reason: 'Problemas mecánicos en ruta - neumático pinchado',
        estimatedDelay: '2 horas',
      },
    },
  };

  const fleetVehicles = [
    { id: 'CAM-001', plate: 'ABC-123', capacity: '45 cabezas', status: 'en-viaje', driver: 'Carlos Mendez', lastMaintenance: '15/02/2026' },
    { id: 'CAM-004', plate: 'DEF-456', capacity: '35 cabezas', status: 'disponible', driver: 'Roberto Silva', lastMaintenance: '10/03/2026' },
    { id: 'CAM-007', plate: 'GHI-789', capacity: '50 cabezas', status: 'en-viaje', driver: 'María González', lastMaintenance: '01/03/2026' },
    { id: 'CAM-009', plate: 'JKL-012', capacity: '40 cabezas', status: 'mantenimiento', driver: 'Juan Pérez', lastMaintenance: '18/03/2026' },
    { id: 'CAM-012', plate: 'MNO-345', capacity: '45 cabezas', status: 'disponible', driver: 'Ana López', lastMaintenance: '05/03/2026' },
  ];

  const getStatusColor = fleetStatusColor;

  const dashboardTrips = [
    { id: 'SOL-002', rancher: 'Rancho San Miguel', origin: 'Loma Plata', destination: 'Concepción', heads: 32, cattleType: 'Novillos', pickupDate: '25/03/2026', distance: 320, bidStatus: 'rancher-countered' as const, yourBid: 1350000, rancherCounterOffer: 1150000, marketPrice: 1220000 },
    { id: 'SOL-004', rancher: 'Estancia Santa Rosa', origin: 'Mariscal Estigarribia', destination: 'Asunción', heads: 50, cattleType: 'Gordos', pickupDate: '27/03/2026', distance: 560, bidStatus: 'awaiting-rancher' as const, yourBid: 2200000, marketPrice: 2050000 },
    { id: 'SOL-001', rancher: 'Estancia Don Pedro', origin: 'Filadelfia', destination: 'Asunción', heads: 45, cattleType: 'Gordos', pickupDate: '24/03/2026', distance: 485, bidStatus: 'new' as const, marketPrice: 1680000 },
    { id: 'SOL-003', rancher: 'Ganadera La Esperanza', origin: 'Neuland', destination: 'Villa Hayes', heads: 28, cattleType: 'Vaquillonas', pickupDate: '26/03/2026', distance: 380, bidStatus: 'new' as const, marketPrice: 1450000 },
    { id: 'SOL-005', rancher: 'Establecimiento El Progreso', origin: 'Concepción', destination: 'Asunción', heads: 38, cattleType: 'Terneros', pickupDate: '28/03/2026', distance: 412, bidStatus: 'new' as const, marketPrice: 1580000 },
    ...storeOrders.map(o => ({
      id: o.id,
      rancher: o.rancherName,
      origin: o.origin,
      destination: o.destination,
      heads: o.heads,
      cattleType: o.cattleTypeLabel,
      pickupDate: o.pickupDate || 'A confirmar',
      distance: o.distance,
      bidStatus: 'new' as const,
      marketPrice: o.marketPrice,
      isStoreOrder: true,
      guides: o.guides,
      estimatedWeight: o.estimatedWeight,
    })),
  ];

  const solDetailsData: { [key: string]: any } = {
    'SOL-001': {
      id: 'SOL-001',
      rancher: 'Estancia Don Pedro',
      rancherPhone: '+595 981 234567',
      rancherRating: 4.8,
      origin: 'Filadelfia',
      originEstancia: 'Estancia Don Pedro - SENACSA 12345',
      destination: 'Asunción - Frigorífico Central',
      heads: 45,
      cattleType: 'Gordos',
      pickupDate: '24/03/2026',
      pickupTime: '06:00',
      distance: 485,
      estimatedPrice: 45 * 410 * 485,
    },
    'SOL-002': {
      id: 'SOL-002',
      rancher: 'Rancho San Miguel',
      rancherPhone: '+595 981 345678',
      rancherRating: 4.5,
      origin: 'Loma Plata',
      originEstancia: 'Rancho San Miguel - SENACSA 23456',
      destination: 'Concepción - Matadero Municipal',
      heads: 32,
      cattleType: 'Novillos',
      pickupDate: '25/03/2026',
      pickupTime: '05:30',
      distance: 320,
      estimatedPrice: 32 * 410 * 320,
    },
    'SOL-003': {
      id: 'SOL-003',
      rancher: 'Ganadera La Esperanza',
      rancherPhone: '+595 981 456789',
      rancherRating: 5.0,
      origin: 'Neuland',
      originEstancia: 'Ganadera La Esperanza - SENACSA 34567',
      destination: 'Villa Hayes - Ruta Transchaco Km 35',
      heads: 90,
      cattleType: 'Vaquillonas',
      pickupDate: '26/03/2026',
      pickupTime: '07:00',
      distance: 380,
      estimatedPrice: 90 * 410 * 380,
    },
  };

  const inviteCode = 'TRP-' + Math.random().toString(36).substring(2, 8).toUpperCase();

  const handleCopyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setInviteCodeCopied(true);
    setTimeout(() => setInviteCodeCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    shareWhatsApp(
      `¡Unite a nuestra flota en TROPEX!\n\nUsá este código de invitación: ${inviteCode}\n\nDescargá la app y comenzá a trabajar con nosotros.`,
    );
  };

  const empresaFleet = getEmpresaFleet();
  const { enViajeCount, availableTrucksCount, occupancyRate } = computeFleetStats(empresaFleet, truckLocations);
  const availableTripsCount = 5;
  const counterTripsCount = dashboardTrips.filter(t => t.bidStatus === 'rancher-countered').length;
  const recentAssignments = [
    { color: '#1E5126', text: 'CAM-001 asignado a SOL-001', time: 'hace 8 min' },
    { color: '#F58718', text: 'Roberto S. comenzó ENV-046', time: 'hace 25 min' },
    { color: '#1E5126', text: 'CAM-007 entregó · ENV-039', time: 'hace 1h' },
    { color: '#F58718', text: 'Nueva oferta SOL-005 ₲ 1.58M', time: 'hace 2h' },
  ];

  const maxVal = Math.max(...weekData.map(d => d.value));

  const upcomingTrips = [
    { id: 'SOL-001', day: '24', month: 'MAR', time: '06:00', route: 'Filadelfia → Asunción', heads: 45 },
    { id: 'SOL-003', day: '26', month: 'MAR', time: '07:00', route: 'Neuland → Villa Hayes', heads: 28 },
    { id: 'SOL-004', day: '27', month: 'MAR', time: '05:30', route: 'Mar. Estigarribia → Asunción', heads: 50 },
  ];

  // Extended truck metadata: current zone, coords, load, capacity
  // isActive = truck is currently in transit (use destination for proximity, not current pos)
  const truckExtended = {
    'CAM-001': { capacity: 45, currentLoad: 45, currentZone: 'En ruta - Ruta Transchaco Km 180', currentCoords: { lat: -24.40, lng: -57.60 }, destinationCoords: { lat: -25.28, lng: -57.64 }, isActive: true, routeProgress: 37, eta: '~2 horas' },
    'CAM-004': { capacity: 35, currentLoad: 0, currentZone: 'Loma Plata', currentCoords: { lat: -22.37, lng: -59.85 }, destinationCoords: null, isActive: false, routeProgress: 0, eta: 'Libre' },
    'CAM-007': { capacity: 50, currentLoad: 0, currentZone: 'Villa Hayes - Entregado', currentCoords: { lat: -25.10, lng: -57.52 }, destinationCoords: null, isActive: false, routeProgress: 100, eta: 'Entregado' },
    'CAM-009': { capacity: 50, currentLoad: 50, currentZone: 'En ruta - Retrasado', currentCoords: { lat: -23.20, lng: -59.00 }, destinationCoords: { lat: -25.28, lng: -57.64 }, isActive: true, routeProgress: 32, eta: '~4 horas' },
  };

  // Extended trip pool with origin coords and recency for smart sorting
  // Returns the position to use for proximity: destination if in transit, current location if idle
  const getProximityOrigin = (truckId: string): { lat: number; lng: number } => {
    const ext = truckExtended[truckId as keyof typeof truckExtended];
    if (!ext) return { lat: -23.5, lng: -58.5 };
    return ext.isActive && ext.destinationCoords ? ext.destinationCoords : ext.currentCoords;
  };

  const getTripTag = (trip: (typeof allRecommendedTrips)[0]): string => {
    if (trip.bidStatus === 'rancher-countered') return 'Requiere acción';
    if (trip.bidStatus === 'awaiting-rancher') return 'Esperando respuesta';
    if (selectedTruckId) {
      const ext = truckExtended[selectedTruckId as keyof typeof truckExtended];
      return ext?.isActive ? 'Cerca de tu destino' : 'Cercano a tu ubicación';
    }
    if (trip.hoursAgo < 1) return 'Nueva oportunidad';
    if (trip.distance < 100) return 'Viaje corto';
    return '';
  };

  const getFilteredAndSortedTrips = () =>
    filterAndSortTrips(allRecommendedTrips, {
      estadoFilter,
      priceSort,
      recomendadosActive,
      distanceMax,
      proximityOrigin: selectedTruckId ? getProximityOrigin(selectedTruckId) : null,
    });

  const openRecommendedTrip = (trip: (typeof allRecommendedTrips)[0]) => {
    setInitialBothGuides(false);
    setInitialGuideNumberToBid(undefined);
    if (trip.bidStatus === 'new') {
      setInitialTripIdToBid(trip.id);
      setInitialTripIdToAccept(undefined);
      setInitialTripIdToView(undefined);
    } else if (trip.bidStatus === 'rancher-countered') {
      setInitialTripIdToBid(undefined);
      setInitialTripIdToAccept(trip.id);
      setInitialTripIdToView(undefined);
    } else {
      setInitialTripIdToBid(undefined);
      setInitialTripIdToAccept(undefined);
      setInitialTripIdToView(trip.id);
    }
    setCurrentView('available-trips');
  };


  const navItems = [
    { key: 'dashboard', icon: LayoutDashboard, hasDot: false, label: 'Panel Principal' },
    { key: 'available-trips', icon: Package, hasDot: counterTripsCount > 0, label: 'Marketplace' },
    { key: 'fleet', icon: Truck, hasDot: false, label: 'Flota' },
    { key: 'drivers', icon: Users, hasDot: false, label: 'Conductores' },
    { key: 'reports', icon: BarChart3, hasDot: false, label: 'Reportes' },
  ] as const;

  const cardStyle: CSSProperties = {
    background: '#fff',
    borderRadius: 10,
    border: '1px solid rgba(0,0,0,0.08)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  };

  const largePanelStyle: CSSProperties = {
    background: '#fff',
    borderRadius: 13,
    border: '2px solid rgba(0,0,0,0.16)',
    boxShadow: '0 6px 28px rgba(0,0,0,0.14)',
  };

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        background: '#F6F1E8',
        backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.07) 1px, transparent 1px)',
        backgroundSize: '22px 22px',
        fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
        position: 'relative',
      }}
    >
      {selectedTruckForModal && truckDetailsData[selectedTruckForModal as keyof typeof truckDetailsData] && (
        <TruckDetailModal
          truck={truckDetailsData[selectedTruckForModal as keyof typeof truckDetailsData]}
          onClose={() => setSelectedTruckForModal(null)}
        />
      )}

      {showEmpresaCancel && selectedTruckId && (() => {
        const d = truckDetailsData[selectedTruckId as keyof typeof truckDetailsData];
        const route = d?.trip ? `${d.trip.origin} → ${String(d.trip.destination).split(' - ')[0]}` : '';
        return <TripCancelFlow tripId={selectedTruckId} route={route} who="empresa" onClose={() => setShowEmpresaCancel(false)} onConfirmed={() => {}} />;
      })()}

      {breakdown && (
        <PayoutBreakdown tripId={breakdown.id} freight={breakdown.freight} commissionRate={breakdown.rate} onClose={() => setBreakdown(null)} />
      )}

      {ratingTrip && (
        <DeliveryRatingModal tripId={ratingTrip.id} route={ratingTrip.route} counterpart="Estancia La Esperanza" freight={ratingTrip.freight} commissionRate={ratingTrip.rate} onClose={() => setRatingTrip(null)} />
      )}

      {sidebarExpanded && (
        <div
          onClick={() => setSidebarExpanded(false)}
          style={{ position: 'absolute', left: 60, top: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.45)', zIndex: 40, cursor: 'pointer' }}
        />
      )}

      <div style={{ width: 60, flexShrink: 0 }} />

      <aside
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: sidebarExpanded ? 220 : 60,
          background: '#1E5126',
          transition: 'width 250ms ease-in-out',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          padding: '14px 0',
          gap: 4,
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', marginBottom: 10, minHeight: 36 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <img src="/tropex-isotipo.png" alt="TROPEX" style={{ width: 26, height: 26, objectFit: 'contain' }} />
          </div>
          {sidebarExpanded && (
            <span style={{ fontSize: 15, fontWeight: 800, color: '#fff', whiteSpace: 'nowrap' }}>TROPEX</span>
          )}
        </div>

        {navItems.map(({ key, icon: Icon, hasDot, label }) => {
          const active = currentView === key;
          return sidebarExpanded ? (
            <button
              key={key}
              onClick={() => {
                setCurrentView(key as typeof currentView);
                setSidebarExpanded(false);
              }}
              style={{ width: 'calc(100% - 16px)', margin: '0 8px', height: 38, padding: '0 10px', display: 'flex', alignItems: 'center', gap: 12, background: active ? 'rgba(255,255,255,0.18)' : 'transparent', border: 'none', borderRadius: 8, cursor: 'pointer', position: 'relative' }}
            >
              <Icon size={18} color={active ? '#fff' : 'rgba(255,255,255,0.6)'} strokeWidth={active ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? '#fff' : 'rgba(255,255,255,0.75)', whiteSpace: 'nowrap' }}>{label}</span>
              {hasDot && <span style={{ position: 'absolute', top: 8, left: 24, width: 7, height: 7, borderRadius: '50%', background: '#F58718', border: '1.5px solid #1E5126' }} />}
            </button>
          ) : (
            <button
              key={key}
              onClick={() => setCurrentView(key as typeof currentView)}
              title={label}
              style={{ width: 36, height: 36, borderRadius: 9, border: 'none', background: active ? 'rgba(255,255,255,0.18)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 150ms', position: 'relative', margin: '0 auto' }}
            >
              <Icon size={18} color={active ? '#fff' : 'rgba(255,255,255,0.55)'} strokeWidth={active ? 2.2 : 1.8} />
              {hasDot && <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: '50%', background: '#F58718', border: '1.5px solid #1E5126' }} />}
            </button>
          );
        })}

        <div style={{ width: sidebarExpanded ? 'calc(100% - 24px)' : 24, height: 1, background: 'rgba(255,255,255,0.15)', margin: '8px auto' }} />

        {sidebarExpanded ? (
          <button onClick={() => { setCurrentView('support'); setSidebarExpanded(false); }} style={{ width: 'calc(100% - 16px)', margin: '0 8px', height: 38, padding: '0 10px', display: 'flex', alignItems: 'center', gap: 12, background: currentView === 'support' ? 'rgba(255,255,255,0.18)' : 'transparent', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
            <HelpCircle size={18} color={currentView === 'support' ? '#fff' : 'rgba(255,255,255,0.6)'} strokeWidth={1.8} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: currentView === 'support' ? 700 : 500, color: currentView === 'support' ? '#fff' : 'rgba(255,255,255,0.75)', whiteSpace: 'nowrap' }}>Soporte</span>
          </button>
        ) : (
          <button onClick={() => setCurrentView('support')} title="Soporte" style={{ width: 36, height: 36, borderRadius: 9, border: 'none', background: currentView === 'support' ? 'rgba(255,255,255,0.18)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', margin: '0 auto' }}>
            <HelpCircle size={18} color={currentView === 'support' ? '#fff' : 'rgba(255,255,255,0.55)'} strokeWidth={1.8} />
          </button>
        )}

        <div style={{ flex: 1 }} />

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

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: sidebarExpanded ? '4px 12px 0' : '4px 0 0', justifyContent: sidebarExpanded ? 'flex-start' : 'center' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <User size={15} color="#fff" />
          </div>
          {sidebarExpanded && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>{userName}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap' }}>Empresa</div>
            </div>
          )}
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <style>{`
          .empresa-marketplace-scroll {
            scrollbar-width: thin;
            scrollbar-color: rgba(255,255,255,0.42) transparent;
          }

          .empresa-marketplace-scroll::-webkit-scrollbar {
            width: 8px;
          }

          .empresa-marketplace-scroll::-webkit-scrollbar-track {
            background: transparent;
          }

          .empresa-marketplace-scroll::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.38);
            border-radius: 999px;
            border: 2px solid transparent;
            background-clip: padding-box;
          }

          .empresa-marketplace-scroll::-webkit-scrollbar-thumb:hover {
            background: rgba(255,255,255,0.54);
            border: 2px solid transparent;
            background-clip: padding-box;
          }
        `}</style>
        {currentView === 'dashboard' && (
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '3fr 2fr', gridTemplateRows: 'auto auto minmax(0, 1fr)', gap: 8, padding: '8px 8px 18px', overflow: 'hidden', minHeight: 0 }}>
            <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 4px' }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#111111', lineHeight: 1.2 }}>
                  Bienvenido, {userName}
                </div>
                <div style={{ fontSize: 13, fontWeight: 400, color: '#6B7280', marginTop: 3 }}>
                  {enViajeCount} camiones en ruta · {availableTripsCount} viajes disponibles
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => setCurrentView('available-trips')}
                  style={{ position: 'relative', width: 36, height: 36, background: 'rgba(30,81,38,0.07)', border: 'none', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <Bell size={17} color="#1E5126" />
                  {counterTripsCount > 0 && <span style={{ position: 'absolute', top: 7, right: 7, width: 7, height: 7, borderRadius: '50%', background: '#F58718' }} />}
                </button>
                <button onClick={() => setCurrentView('cuenta')} aria-label="Cuenta" style={{ width: 36, height: 36, borderRadius: '50%', background: '#1E5126', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <User size={16} color="#fff" />
                </button>
              </div>
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
              <button
                onClick={() => setCurrentView('available-trips')}
                style={{ background: '#F58718', borderRadius: 10, padding: '12px 16px', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden', textAlign: 'left', boxShadow: '0 4px 14px rgba(245,135,24,0.35)' }}
              >
                <div style={{ position: 'absolute', top: -24, right: -24, width: 88, height: 88, background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1.15, display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Package size={18} color="#fff" strokeWidth={2.5} />
                  Ver viajes disponibles
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.76)', textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 5 }}>5 oportunidades</div>
              </button>

              {/* Tile 2: Ocupación de flota (moved from bottom) */}
              <div style={{ ...cardStyle, padding: '12px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 10, right: 12, opacity: 0.28 }}><Truck size={24} color="#1E5126" strokeWidth={2.4} /></div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#111', lineHeight: 1 }}>{occupancyRate}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>%</div>
                </div>
                <div style={{ fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 3 }}>Ocupación de flota</div>
                <div style={{ marginTop: 5, height: 4, background: '#ECE8E1', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ width: `${occupancyRate}%`, height: '100%', background: 'linear-gradient(90deg, #1E5126 0%, #1E5126 100%)', borderRadius: 99 }} />
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#1E5126', marginTop: 4 }}>{enViajeCount} en ruta · {availableTrucksCount} disp.</div>
              </div>

              {/* Tile 3: Próximos viajes (cycling, moved from bottom) */}
              <div style={{ ...cardStyle, padding: '12px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 10, right: 12, opacity: 0.28 }}><Calendar size={24} color="#1E5126" strokeWidth={2.4} /></div>
                {(() => {
                  const u = upcomingTrips[currentTripIndex];
                  return u ? (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <div style={{ width: 30, height: 34, borderRadius: 5, background: 'linear-gradient(180deg, #1E5126 50%, #2d6b38 50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                          <div style={{ fontSize: 10, fontWeight: 800, color: '#fff', opacity: 0.85, lineHeight: '11px' }}>{u.month}</div>
                          <div style={{ fontSize: 11, fontWeight: 800, color: '#1E5126', background: '#fff', width: '100%', textAlign: 'center', lineHeight: '23px' }}>{u.day}</div>
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 800, color: '#111', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.route}</div>
                          <div style={{ fontSize: 10, color: '#888', marginTop: 2, fontFamily: 'monospace' }}>{u.id} · {u.heads} cab</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 4, marginTop: 8, alignItems: 'center' }}>
                        <div style={{ fontSize: 9, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', flex: 1 }}>Próximos viajes</div>
                        {upcomingTrips.map((_, i) => (
                          <div key={i} style={{ width: i === currentTripIndex ? 14 : 5, height: 5, borderRadius: 99, background: i === currentTripIndex ? '#1E5126' : '#D1D5DB', transition: 'all 0.3s ease' }} />
                        ))}
                      </div>
                    </>
                  ) : null;
                })()}
              </div>

              <div style={{ ...cardStyle, padding: '12px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 10, right: 12, opacity: 0.28 }}><BarChart3 size={24} color="#1E5126" strokeWidth={2.4} /></div>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#111', lineHeight: 1 }}>47</div>
                <div style={{ fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>Viajes este mes</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#1E5126', marginTop: 4 }}>↑ 6 vs mes anterior</div>
              </div>
            </div>

            <div style={{ ...largePanelStyle, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px 0', flexShrink: 0 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#111', letterSpacing: '-0.01em' }}>Operación de flota</span>
                <span style={{ fontSize: 10, color: '#9CA3AF' }}>Actualizado hace 1 min</span>
              </div>

              <div style={{
  display: 'flex',
  borderBottom: '1.5px solid rgba(0,0,0,0.1)',
  padding: '0 10px',
  flexShrink: 0,
  overflowX: 'hidden',
  overflowY: 'hidden',
  background: '#fff',
  marginTop: 2,
}}>
                {(['Flota en ruta', 'Conductores', 'Mis viajes', 'Reportes'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setEmpresaTab(tab)}
                    style={{ padding: '10px 13px', fontSize: 11.5, fontWeight: empresaTab === tab ? 700 : 500, color: empresaTab === tab ? '#1E5126' : '#6B7280', background: 'none', border: 'none', borderBottom: empresaTab === tab ? '2.5px solid #1E5126' : '2.5px solid transparent', cursor: 'pointer', marginBottom: -1.5, display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap', flexShrink: 0, letterSpacing: empresaTab === tab ? '0.01em' : 0 }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {empresaTab === 'Flota en ruta' && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
                  <div style={{ padding: '10px 16px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 99, padding: '6px 12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                      <div style={{ width: 24, height: 24, background: '#1E5126', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Truck style={{ width: 12, height: 12, color: '#fff' }} />
                      </div>
                      <span style={{ color: '#666', fontSize: 11 }}>Flota activa:</span>
                      <span style={{ fontWeight: 700, color: '#111', fontSize: 11 }}>{enViajeCount} camiones en ruta</span>
                    </div>
                  </div>

                  <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#eef0eb', minHeight: 0 }}>
                    <MapView
                      height="100%"
                      markers={truckLocations.map(cam => {
                        const ext = truckExtended[cam.id as keyof typeof truckExtended];
                        return {
                          id: cam.id,
                          lat: ext.currentCoords.lat,
                          lng: ext.currentCoords.lng,
                          type: 'truck' as const,
                          color: getStatusColor(cam.status),
                          label: `${cam.id} · ${cam.location}`,
                        };
                      })}
                      onMarkerClick={(id) => setSelectedTruckId(id)}
                    />
                    <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 500, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, pointerEvents: 'none' }}>
                      <div style={{ background: 'rgba(0,0,0,0.52)', borderRadius: 99, padding: '4px 10px', fontSize: 9, fontWeight: 700, color: '#fff', whiteSpace: 'nowrap' }}>
                        {selectedTruckId ? `${selectedTruckId} seleccionado · tocá otro para cambiar` : 'Tocá un camión para ver recomendaciones'}
                      </div>
                    </div>
                  </div>

                  {selectedTruckId && truckExtended[selectedTruckId as keyof typeof truckExtended] && (() => {
                    const ext = truckExtended[selectedTruckId as keyof typeof truckExtended];
                    const cam = truckLocations.find(t => t.id === selectedTruckId);
                    const details = truckDetailsData[selectedTruckId as keyof typeof truckDetailsData];
                    const tone = getStatusColor(cam?.status ?? 'disponible');
                    const destinationShort = details?.trip?.destination?.split(' - ')[0] ?? '';

                    const shortCpName = (name: string) => {
                      const bare = name.replace('Control ', '');
                      if (bare === 'Mariscal Estigarribia') return 'Mariscal';
                      if (bare === 'Villa Hayes') return 'V.Hayes';
                      return bare;
                    };

                    const rawCps = details?.documents?.cota?.checkpoints ?? [];
                    const allSteps: { label: string; passed: boolean; isCurrent: boolean }[] = [
                      ...rawCps.map(cp => ({ label: shortCpName(cp.name), passed: cp.passed, isCurrent: false })),
                      { label: destinationShort, passed: details?.trip?.status === 'entregado', isCurrent: false },
                    ];
                    const firstUnpassed = allSteps.findIndex(s => !s.passed);
                    if (firstUnpassed > 0) allSteps[firstUnpassed] = { ...allSteps[firstUnpassed], isCurrent: true };

                    const tripStatusLabels: Record<string, string> = {
                      'yendo-destino': 'En tránsito',
                      'esperando-instrucciones': 'Esperando instrucciones',
                      'entregado': 'Entregado',
                      'retraso': 'Con retraso',
                    };
                    const tripStatusLabel = tripStatusLabels[details?.trip?.status ?? ''] ?? getStatusLabel(cam?.status ?? '');

                    const agreedPrice = (details?.trip as typeof details.trip & { agreedPrice?: number })?.agreedPrice;
                    const tripDistance = (details?.trip as typeof details.trip & { distance?: number })?.distance;

                    return (
                      <div style={{ flexShrink: 0, background: '#fff', borderTop: '1.5px solid rgba(0,0,0,0.10)' }}>
                        {/* Row 1: ID · status · route */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 14px 8px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', background: tone, flexShrink: 0 }} />
                          <span style={{ fontSize: 11, fontWeight: 800, color: '#111', fontFamily: 'monospace', flexShrink: 0 }}>{selectedTruckId}</span>
                          <span style={{ fontSize: 10, color: '#bbb' }}>·</span>
                          <span style={{ fontSize: 10, fontWeight: 600, color: '#666', flexShrink: 0 }}>{tripStatusLabel}</span>
                          <span style={{ fontSize: 10, color: '#ccc', marginLeft: 2, flexShrink: 0 }}>
                            {details?.trip?.origin} → {destinationShort}{tripDistance ? ` · ${tripDistance} km` : ''}
                          </span>
                          <div style={{ flex: 1 }} />
                          <button
                            onClick={() => setSelectedTruckId(null)}
                            style={{ width: 19, height: 19, borderRadius: '50%', background: '#f0f0f0', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 13, color: '#888', lineHeight: 1, flexShrink: 0 }}
                          >×</button>
                        </div>

                        {/* Row 2: Conductor · ETA · Cabezas | COTA bar (centered) */}
                        <div style={{ display: 'flex', alignItems: 'center', padding: '9px 14px 7px' }}>
                          <div style={{ display: 'flex', gap: 18, flexShrink: 0 }}>
                            {[
                              { label: 'Conductor', value: details?.driver?.name ?? '—' },
                              { label: 'ETA', value: ext.eta },
                              { label: 'Cabezas', value: `${details?.trip?.heads} ${details?.trip?.cattleType}` },
                            ].map(({ label, value }) => (
                              <div key={label}>
                                <div style={{ fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>{label}</div>
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#111' }}>{value}</div>
                              </div>
                            ))}
                          </div>

                          {/* COTA progress — centered with absolute line */}
                          {allSteps.length > 1 && (() => {
                            const N = allSteps.length;
                            const DOT = 20;
                            const currentIdx = allSteps.findIndex(s => s.isCurrent);
                            const greenToIdx = currentIdx >= 0 ? currentIdx : allSteps.filter(s => s.passed).length - 1;
                            const fraction = N > 1 && greenToIdx >= 0 ? greenToIdx / (N - 1) : 0;
                            return (
                              <div style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '0 28px' }}>
                                <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', maxWidth: 420, paddingTop: 2 }}>
                                  {/* Gray base line */}
                                  <div style={{ position: 'absolute', top: DOT / 2 - 1, left: DOT / 2, right: DOT / 2, height: 2.5, background: '#E5E7EB', borderRadius: 2, zIndex: 0 }} />
                                  {/* Green progress line */}
                                  {fraction > 0 && (
                                    <div style={{
                                      position: 'absolute', top: DOT / 2 - 1, left: DOT / 2,
                                      width: `calc(${fraction * 100}% - ${fraction * DOT}px)`,
                                      height: 2.5, background: '#1E5126', borderRadius: 2, zIndex: 0,
                                    }} />
                                  )}
                                  {/* Steps */}
                                  {allSteps.map((step, i) => (
                                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, zIndex: 1, flexShrink: 0 }}>
                                      <div style={{
                                        width: DOT, height: DOT, borderRadius: '50%',
                                        background: step.passed ? '#1E5126' : step.isCurrent ? '#F58718' : '#F3F4F6',
                                        border: `2px solid ${step.passed ? '#1E5126' : step.isCurrent ? '#F58718' : '#D1D5DB'}`,
                                        boxShadow: step.isCurrent ? '0 0 0 4px rgba(245,135,24,0.15)' : 'none',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      }}>
                                        {step.passed && (
                                          <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                                            <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                          </svg>
                                        )}
                                      </div>
                                      <div style={{
                                        fontSize: 10, lineHeight: 1, fontWeight: step.isCurrent ? 800 : 600,
                                        color: step.passed ? '#1E5126' : step.isCurrent ? '#d97706' : '#9CA3AF',
                                        whiteSpace: 'nowrap',
                                        textAlign: i === 0 ? 'left' : i === N - 1 ? 'right' : 'center',
                                      }}>
                                        {step.label}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })()}
                        </div>

                        {/* Row 3: Precio · Origen · Destino · Button */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '7px 14px 10px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                          {agreedPrice && (
                            <>
                              <div>
                                <div style={{ fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 1 }}>Precio</div>
                                <div style={{ fontSize: 13, fontWeight: 800, color: '#1E5126' }}>
                                  ₲{(agreedPrice / 1000000).toFixed(1)}M
                                </div>
                              </div>
                              <div style={{ width: 1, height: 26, background: 'rgba(0,0,0,0.07)', flexShrink: 0 }} />
                            </>
                          )}
                          <div>
                            <div style={{ fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 1 }}>Origen</div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: '#333' }}>{details?.trip?.origin}</div>
                          </div>
                          <div style={{ width: 1, height: 26, background: 'rgba(0,0,0,0.07)', flexShrink: 0 }} />
                          <div>
                            <div style={{ fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 1 }}>Destino</div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: '#333' }}>{destinationShort}</div>
                          </div>
                          <div style={{ flex: 1 }} />
                          <button
                            onClick={() => setSelectedTruckForModal(selectedTruckId)}
                            style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#1E5126', color: '#fff', border: 'none', borderRadius: 7, padding: '6px 13px', fontSize: 10, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}
                          >
                            Ver documentos y detalles completos
                          </button>
                          {ext.isActive && (
                            <button
                              onClick={() => setShowEmpresaCancel(true)}
                              style={{ background: '#FEF2F2', color: '#B91C1C', border: '1.5px solid #FECACA', borderRadius: 7, padding: '6px 13px', fontSize: 10, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}
                            >
                              Cancelar viaje
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {empresaTab === 'Conductores' && (
                <div style={{ flex: 1, overflow: 'auto' }}>
                  {drivers.map(d => (
                    <div key={d.id} style={{ padding: '12px 16px', borderBottom: '1px solid rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#1E512615', color: '#1E5126', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {d.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#111' }}>{d.name}</div>
                        <div style={{ fontSize: 10, color: '#888', marginTop: 1 }}>{d.trips} viajes · {d.revenue} · {d.avgSpeed}</div>
                      </div>
                      {d.speedWarnings > 0 ? (
                        <span style={{ fontSize: 9, fontWeight: 700, color: '#F58718', background: '#F5871815', padding: '3px 7px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{d.speedWarnings} alerta{d.speedWarnings > 1 ? 's' : ''}</span>
                      ) : (
                        <span style={{ fontSize: 9, fontWeight: 700, color: '#1E5126', background: '#1E512615', padding: '3px 7px', borderRadius: 99 }}>Sin alertas</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {empresaTab === 'Mis viajes' && (
                <div style={{ flex: 1, overflow: 'auto', padding: '12px 14px' }}>
                  {/* Cobros de viajes (estados de pago + rating del recién entregado) */}
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>Cobros de viajes</span>
                      <span style={{ fontSize: 10, color: '#9CA3AF' }}>tocá el monto</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {empresaCobros.map(t => {
                        const ps = empPayOf(t.id, t.payState);
                        const neto = t.freight - Math.round(t.freight * t.rate);
                        return (
                          <div key={t.id} style={{ background: '#fff', border: `1px solid ${t.justDelivered ? '#1E512633' : 'rgba(0,0,0,0.06)'}`, borderRadius: 12, padding: '11px 12px', boxShadow: t.justDelivered ? '0 0 0 1px #1E512622' : 'none' }}>
                            {t.justDelivered && <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 800, color: '#1E5126', background: '#1E512612', padding: '2px 8px', borderRadius: 99, marginBottom: 6 }}><CheckCircle2 size={11} /> Recién entregado</div>}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 12.5, fontWeight: 700, color: '#111' }}>{t.route}</div>
                                <div style={{ fontSize: 10.5, color: '#888' }}><span style={{ fontFamily: 'monospace' }}>{t.id}</span> · {t.driver} · {t.heads} cab.</div>
                              </div>
                              <button onClick={() => setBreakdown({ id: t.id, freight: t.freight, rate: t.rate })} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', flexShrink: 0 }}>
                                <span style={{ fontSize: 13.5, fontWeight: 800, color: '#1E5126', borderBottom: '1.5px dotted #1E512688' }}>{formatGs(neto)}</span>
                              </button>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 8, flexWrap: 'wrap' }}>
                              <PayBadge state={ps} cobro />
                              {ps === 'verificando' && <button onClick={() => setPayOverrides(o => ({ ...o, [t.id]: 'pagado' }))} style={{ fontSize: 10.5, fontWeight: 700, color: '#1E5126', background: '#1E512612', border: 'none', borderRadius: 7, padding: '4px 8px', cursor: 'pointer' }}>Simular verificación</button>}
                              {t.justDelivered && <button onClick={() => setRatingTrip({ id: t.id, route: t.route, driver: t.driver, freight: t.freight, rate: t.rate })} style={{ fontSize: 10.5, fontWeight: 700, color: '#fff', background: '#1E5126', border: 'none', borderRadius: 7, padding: '4px 9px', cursor: 'pointer' }}>Calificar y ver cobro</button>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>Actividad reciente</span>
                    <Clock size={13} color="#aaa" />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {recentAssignments.map((item, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, padding: '8px 0', borderBottom: i < recentAssignments.length - 1 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: item.color, flexShrink: 0, marginTop: 6 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#333', lineHeight: 1.4 }}>{item.text}</div>
                          <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>{item.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {empresaTab === 'Reportes' && (
                <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#111', marginBottom: 4 }}>Viajes esta semana</div>
                  <div style={{ fontSize: 10, color: '#888', marginBottom: 12 }}>{weekData.reduce((sum, d) => sum + d.value, 0)} viajes en total</div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 130, padding: '0 8px' }}>
                    {weekData.map(d => (
                      <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#1E5126' }}>{d.value}</div>
                        <div style={{ width: '70%', background: d.value === maxVal ? '#F58718' : '#1E5126', borderRadius: '4px 4px 0 0', height: `${(d.value / maxVal) * 100}px`, opacity: 0.85 }} />
                        <div style={{ fontSize: 10, color: '#aaa', fontWeight: 700 }}>{d.day}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 16, padding: '12px 14px', background: '#F6F1E8', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 7, background: '#1E512615', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TrendingUp size={15} color="#1E5126" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#111' }}>Mejor día: Jueves</div>
                      <div style={{ fontSize: 10, color: '#888' }}>{maxVal} viajes completados — récord semanal</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden', minHeight: 0, paddingBottom: 10 }}>
            <div
              style={{
                flex: 1,
                borderRadius: 13,
                background: 'linear-gradient(180deg, #2B5A35 0%, #1E5126 65%, #163D1D 100%)',
                boxShadow: '0 8px 28px rgba(30,81,38,0.28)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative',
                minHeight: 0,
              }}
            >
              <div style={{ position: 'absolute', top: -80, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,135,24,0.22) 0%, rgba(245,135,24,0.08) 35%, transparent 70%)', pointerEvents: 'none' }} />

              {/* Header: dynamic title + filters */}
              <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid rgba(255,255,255,0.1)', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                      {selectedTruckId ? `Recomendados para ${selectedTruckId}` : 'Marketplace de viajes'}
                    </div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>
                      {selectedTruckId
                        ? `${truckLocations.find(t => t.id === selectedTruckId)?.location ?? ''} · ${getFilteredAndSortedTrips().length} resultados`
                        : `${availableTripsCount} disponibles · ${counterTripsCount} contraofertas activas`}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                    {selectedTruckId && (
                      <button
                        onClick={() => setSelectedTruckId(null)}
                        style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.75)', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 6, padding: '4px 7px', cursor: 'pointer' }}
                      >
                        × Limpiar
                      </button>
                    )}
                    <button
                      onClick={() => setCurrentView('available-trips')}
                      style={{ width: 30, height: 30, borderRadius: 9, background: '#F58718', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                    >
                      <Package size={14} color="#fff" />
                    </button>
                  </div>
                </div>

                {/* Selected truck context chip */}
                {selectedTruckId && (() => {
                  const ext = truckExtended[selectedTruckId as keyof typeof truckExtended];
                  const cam = truckLocations.find(t => t.id === selectedTruckId);
                  const tone = getStatusColor(cam?.status ?? 'disponible');
                  return (
                    <div style={{ marginTop: 7, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(245,135,24,0.15)', border: '1px solid rgba(245,135,24,0.28)', borderRadius: 99, padding: '3px 8px 3px 5px' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: tone, flexShrink: 0 }} />
                        <Truck size={9} color="#F58718" />
                        <span style={{ fontSize: 9, fontWeight: 800, color: '#FCD9A6', letterSpacing: '0.04em' }}>{selectedTruckId}</span>
                        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>· {ext?.currentZone}</span>
                      </div>
                      {ext?.isActive && (
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>Cercanía desde destino actual</span>
                      )}
                    </div>
                  );
                })()}

                {/* Filter row: Recomendados · Precio cycling · Estado cycling */}
                <div style={{ marginTop: 9, display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
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
                      todos:      { label: 'Estado',       bg: 'rgba(255,255,255,0.1)',  color: 'rgba(255,255,255,0.58)' },
                      accion:     { label: 'Con acción',    bg: '#F58718',               color: '#fff' },
                      disponible: { label: 'Disponible',    bg: '#22C55E',               color: '#fff' },
                      esperando:  { label: 'Esperando',     bg: 'rgba(234,179,8,0.8)',   color: '#1a1a1a' },
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
              <div className="empresa-marketplace-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '10px 10px 10px 12px', display: 'flex', flexDirection: 'column', gap: 7 }}>
                {getFilteredAndSortedTrips().length === 0 ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: 0.55, paddingTop: 24 }}>
                    <Package size={22} color="rgba(255,255,255,0.4)" />
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>Sin resultados para los filtros aplicados</div>
                  </div>
                ) : getFilteredAndSortedTrips().map(trip => {
                  const isCounter = trip.bidStatus === 'rancher-countered';
                  const isAwaiting = trip.bidStatus === 'awaiting-rancher';
                  const actionLabel = trip.bidStatus === 'new' ? 'Ofertar' : isAwaiting ? 'Ver' : 'Aceptar';
                  const displayPrice = isCounter ? (trip.rancherCounterOffer ?? 0) : isAwaiting ? (trip.yourBid ?? 0) : trip.marketPrice;
                  const priceLabel = trip.bidStatus === 'new' ? 'Mercado' : isAwaiting ? 'Tu oferta' : 'Contraoferta';
                  const tag = getTripTag(trip);
                  return (
                    <div key={trip.id} style={{ background: isCounter ? 'rgba(245,135,24,0.13)' : 'rgba(255,255,255,0.07)', borderRadius: 10, padding: '11px 12px', border: `1px solid ${isCounter ? 'rgba(245,135,24,0.35)' : 'rgba(255,255,255,0.1)'}`, opacity: isAwaiting ? 0.78 : 1 }}>
                      {/* Row 1: Route + km */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, letterSpacing: '-0.01em' }}>
                          {trip.origin} → {trip.destination}
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.75)', background: 'rgba(255,255,255,0.12)', padding: '2px 8px', borderRadius: 99, flexShrink: 0 }}>{trip.distance} km</span>
                      </div>

                      {/* Row 2: Heads + type + weight | date */}
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

                      {/* Row 3: status pill | price + button */}
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
                            onClick={() => openRecommendedTrip(trip)}
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
          </div>
        )}

        {currentView !== 'dashboard' && (
          <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px' }}>
            <div className="max-w-7xl mx-auto">
              {currentView === 'fleet' && (
                <>
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Flota</h1>
                    <p className="text-gray-600">Administrá tus vehículos y su estado</p>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">ID Camión</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Patente</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Capacidad</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Estado</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Conductor</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Último Mantenimiento</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {fleetVehicles.map(vehicle => (
                            <tr key={vehicle.id} className="hover:bg-gray-50 relative">
                              <td className="px-0 py-0 w-1 relative">
                                <div className="w-1 rounded-full h-full absolute left-0 top-0" style={{ backgroundColor: getStatusColor(vehicle.status) }} />
                              </td>
                              <td className="px-6 py-4">
                                <span className="font-medium text-gray-900">{vehicle.id}</span>
                              </td>
                              <td className="px-6 py-4 text-gray-700">{vehicle.plate}</td>
                              <td className="px-6 py-4 text-gray-700">{vehicle.capacity}</td>
                              <td className="px-6 py-4">
                                <span className="px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: getStatusColor(vehicle.status) }}>
                                  {getStatusLabel(vehicle.status)}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-gray-700">{vehicle.driver}</td>
                              <td className="px-6 py-4 text-gray-700">{vehicle.lastMaintenance}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {currentView === 'drivers' && (
                <>
                  <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Conductores</h1>
                    <p className="text-gray-600">Administrá tu equipo de conductores</p>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-6 mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Invitar nuevo conductor</h3>
                    <p className="text-sm text-gray-700 mb-4">Compartí este código de invitación con conductores para que se unan a tu flota:</p>

                    <div className="bg-white rounded-lg border-2 border-green-600 p-4 mb-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-xs text-gray-600 mb-1">Código de invitación</p>
                          <p className="text-2xl font-bold" style={{ color: '#1E5126' }}>{inviteCode}</p>
                        </div>
                        <button onClick={handleCopyInviteCode} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 transition-colors">
                          {inviteCodeCopied ? (
                            <>
                              <Check className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium text-green-600">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 text-gray-700" />
                              <span className="text-sm font-medium text-gray-700">Copiar</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleShareWhatsApp}
                      className="w-full px-4 py-3 rounded-lg font-medium text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: '#25D366' }}
                    >
                      <Share2 className="w-5 h-5" />
                      Compartir por WhatsApp
                    </button>
                  </div>

                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Conductor</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Viajes</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Ingresos Generados</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Velocidad Promedio</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Alertas</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {drivers.map(driver => (
                            <tr key={driver.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                    <User className="w-5 h-5 text-gray-600" />
                                  </div>
                                  <span className="font-medium text-gray-900">{driver.name}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <TrendingUp className="w-4 h-4 text-green-600" />
                                  <span className="font-medium text-gray-900">{driver.trips}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="font-medium text-gray-900">{driver.revenue}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`font-medium ${driver.avgSpeed.includes('85') ? 'text-red-600' : 'text-gray-700'}`}>
                                  {driver.avgSpeed}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                {driver.speedWarnings > 0 ? (
                                  <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                                    <span className="text-sm font-medium text-yellow-700">
                                      {driver.speedWarnings} {driver.speedWarnings === 1 ? 'exceso' : 'excesos'} de velocidad
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-sm text-green-600 font-medium">✓ Sin alertas</span>
                                )}
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Reportes y Analíticas</h1>
                    <p className="text-gray-600">Métricas de rendimiento de tu empresa</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#1E512615' }}>
                          <DollarSign className="w-5 h-5" style={{ color: '#1E5126' }} />
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">₲ 48.200.000</div>
                      <div className="text-sm text-gray-600 mb-2">Ingresos del mes</div>
                      <div className="text-xs" style={{ color: '#1E5126' }}>↑ 18% vs. mes anterior</div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#1E512615' }}>
                          <CheckCircle2 className="w-5 h-5" style={{ color: '#1E5126' }} />
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">47</div>
                      <div className="text-sm text-gray-600 mb-2">Viajes completados</div>
                      <div className="text-xs" style={{ color: '#1E5126' }}>↑ 12% vs. mes anterior</div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#F5871815' }}>
                          <Clock className="w-5 h-5" style={{ color: '#F58718' }} />
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">8</div>
                      <div className="text-sm text-gray-600 mb-2">Viajes activos</div>
                      <div className="text-xs text-gray-500">3 en tránsito, 5 asignados</div>
                    </div>

                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#F5871815' }}>
                          <Users className="w-5 h-5" style={{ color: '#F58718' }} />
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">12</div>
                      <div className="text-sm text-gray-600 mb-2">Conductores disponibles</div>
                      <div className="text-xs text-gray-500">de 17 en total</div>
                    </div>
                  </div>
                </>
              )}

              {currentView === 'support' && (
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-6">Soporte</h1>
                  <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Opciones de contacto</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <a href="https://wa.me/595211234567" target="_blank" rel="noopener noreferrer" className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all text-center">
                        <div className="w-12 h-12 mx-auto mb-4 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#25D366' }}>
                          <MessageCircle className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">WhatsApp</h3>
                        <p className="text-sm text-gray-600">+595 21 123 4567</p>
                      </a>
                      <a href="mailto:soporte@tropero.com.py" className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all text-center">
                        <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Mail className="w-6 h-6 text-gray-700" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">Email</h3>
                        <p className="text-sm text-gray-600">soporte@tropero.com.py</p>
                      </a>
                      <a href="#" className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all text-center">
                        <div className="w-12 h-12 mx-auto mb-4 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#1E512615' }}>
                          <ExternalLink className="w-6 h-6" style={{ color: '#1E5126' }} />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">Centro de ayuda</h3>
                        <p className="text-sm text-gray-600">Documentación y guías</p>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {currentView === 'available-trips' && (
                <AvailableTripsView
                  userType="empresa"
                  onBack={() => { setCurrentView('dashboard'); setInitialTripIdToBid(undefined); setInitialGuideNumberToBid(undefined); setInitialBothGuides(false); setInitialTripIdToAccept(undefined); setInitialTripIdToView(undefined); }}
                  initialTripIdToBid={initialTripIdToBid}
                  initialGuideNumberToBid={initialGuideNumberToBid}
                  initialBothGuides={initialBothGuides}
                  onBidModalClosed={() => { setInitialTripIdToBid(undefined); setInitialGuideNumberToBid(undefined); setInitialBothGuides(false); }}
                  initialTripIdToAccept={initialTripIdToAccept}
                  onAcceptModalClosed={() => setInitialTripIdToAccept(undefined)}
                  initialTripIdToView={initialTripIdToView}
                  onViewModalClosed={() => setInitialTripIdToView(undefined)}
                />
              )}

              {currentView === 'cuenta' && (
                <EmpresaAccount userName={userName} onLogout={onLogout} onBack={() => setCurrentView('dashboard')} />
              )}
            </div>
          </div>
        )}
      </div>

      {selectedSolId && solDetailsData[selectedSolId] && (() => {
        const sol = solDetailsData[selectedSolId];
        const modalFormatPrice = (price: number) => '₲ ' + price.toLocaleString('es-PY');
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto my-4">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono font-bold text-2xl text-gray-900">{sol.id}</span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: '#1E5126' }}>Disponible</span>
                  </div>
                  <p className="text-sm text-gray-600">Solicitud de transporte de ganado</p>
                </div>
                <button onClick={() => setSelectedSolId(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="border-b border-gray-200 px-6 py-5 bg-gray-50">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Ruta</div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 text-sm">{sol.origin}</span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold text-gray-900 text-sm">{sol.destination}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Precio estimado</div>
                    <div className="font-bold text-lg" style={{ color: '#1E5126' }}>{modalFormatPrice(sol.estimatedPrice)}</div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <div className="text-xs font-medium text-blue-900 mb-1">Punto de recogida</div>
                      <div className="font-bold text-gray-900">{sol.origin}</div>
                      <div className="text-sm text-gray-600">{sol.originEstancia}</div>
                      <div className="text-xs text-gray-500 mt-1">{sol.pickupDate} a las {sol.pickupTime}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <ArrowRight className="w-4 h-4" />
                    <span>{sol.distance} km</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg">
                    <MapPin className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <div className="text-xs font-medium text-red-900 mb-1">Destino</div>
                      <div className="font-bold text-gray-900">{sol.destination}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-xs text-gray-500 mb-1">Cabezas</div>
                    <div className="text-2xl font-bold text-gray-900">{sol.heads}</div>
                    <div className="text-xs text-gray-600">{sol.cattleType}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-xs text-gray-500 mb-1">Distancia</div>
                    <div className="text-2xl font-bold text-gray-900">{sol.distance}</div>
                    <div className="text-xs text-gray-600">kilómetros</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-xs text-gray-500 mb-1">Precio/km</div>
                    <div className="text-xl font-bold" style={{ color: '#1E5126' }}>{modalFormatPrice(Math.round(sol.estimatedPrice / sol.distance))}</div>
                    <div className="text-xs text-gray-600">por kilómetro</div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="text-xs text-gray-500 mb-1">Ganadero</div>
                  <div className="font-bold text-gray-900">{sol.rancher}</div>
                  <div className="text-sm text-gray-600">★ {sol.rancherRating} calificación</div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                  <div className="text-sm text-gray-600 mb-1">Precio total estimado del viaje</div>
                  <div className="text-3xl font-bold" style={{ color: '#1E5126' }}>{modalFormatPrice(sol.estimatedPrice)}</div>
                  <div className="text-xs text-gray-500 mt-2">* Precio estimado basado en ₲ 410 por km/cabeza. El precio final se acuerda en la negociación.</div>
                </div>

                <Button
                  className="w-full h-12 text-base"
                  style={{ backgroundColor: '#1E5126' }}
                  onClick={() => {
                    setSelectedSolId(null);
                    setInitialTripIdToBid(sol.id);
                    setCurrentView('available-trips');
                  }}
                >
                  Ofertar por este viaje
                </Button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
