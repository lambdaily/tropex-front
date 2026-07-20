import { useState, useEffect, type CSSProperties, type ReactNode } from 'react';
import { MapPin, Calendar, Truck, DollarSign, Package, ArrowRight, X, Check, MessageSquare, MessageCircle, AlertCircle, TrendingUp, Clock, Users, CheckCircle, Share2, Copy, Star, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { TripAssignmentScreen } from './TripAssignmentScreen';
import { useDemoStore, addOffer, hasActiveTransporterOffer, getEmpresaFleet, getEmpresaDrivers } from '../../store/demoStore';
import { FleetAssignmentPopup } from '../dashboards/FleetAssignmentPopup';
import { openWhatsApp, shareWhatsApp } from '../../utils/contact';
import { useIsMobile } from '../ui/use-mobile';
import { MapView } from '../MapView';
import { coordsForCity } from '../../data/paraguay-locations';
import { SolicitudDetailModal } from './SolicitudDetailModal';
import { MAX_HEADS_PER_TRUCK, billableHeads, cattleCategoryFromLabel, exceedsGuideLimit, guideLimitFor } from '../../config/business';
import { isMarketplaceDemoEnabled, toMarketplaceTrip, useAvailableTransportRequests, useCreateTransportOffer } from '@/features/transport-marketplace';

// ── Estilos reutilizables de la card del marketplace (look unificado) ──────────
const cardStatLabel: CSSProperties = { fontSize: 9, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 };
const cardStatValue: CSSProperties = { fontSize: 14, fontWeight: 800, color: '#111', lineHeight: 1 };
const cardStatSub: CSSProperties = { fontSize: 11, color: '#6B7280', marginTop: 2 };
const cardPriceLabel: CSSProperties = { fontSize: 10, color: '#9CA3AF', marginBottom: 2 };
const cardPriceSub: CSSProperties = { fontSize: 10, color: '#9CA3AF', marginTop: 3 };
const footerBtnBase: CSSProperties = { padding: '9px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5 };

interface Trip {
  id: string;
  backendId?: number;
  rancherId: string;
  rancherName: string;
  rancherPhone: string;
  rancherRating: number;
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
  bidStatus: 'new' | 'awaiting-rancher' | 'rancher-countered' | 'awaiting-trucker' | 'accepted';
  yourBid?: number;
  rancherCounterOffer?: number;
  yourFinalBid?: number;
  negotiationCount: number;
  marketPrice?: number;
  isStoreOrder?: boolean;
  hoursAgo?: number;
  guides?: Array<{ guideNumber: 1 | 2; backendGuideId?: number; heads: number; status: string; activeOfferId?: string }>;
  estimatedWeight?: number;
  /** Documentos SENACSA verificados por la plataforma. */
  verified?: boolean;
}

interface Driver {
  id: string;
  name: string;
  phone: string;
  tripsCompleted: number;
  rating: number;
  available: boolean;
}

interface Vehicle {
  id: string;
  plate: string;
  capacity: number;
  available: boolean;
}

interface AvailableTripsViewProps {
  userType: 'empresa' | 'owner-operator';
  onBack: () => void;
  initialTripIdToBid?: string;
  initialGuideNumberToBid?: 1 | 2;
  initialBothGuides?: boolean;
  onBidModalClosed?: () => void;
  initialTripIdToAccept?: string;
  onAcceptModalClosed?: () => void;
  initialTripIdToView?: string;
  onViewModalClosed?: () => void;
}

import { toast } from 'sonner';
export function AvailableTripsView({ userType, onBack, initialTripIdToBid, initialGuideNumberToBid, initialBothGuides, onBidModalClosed, initialTripIdToAccept, onAcceptModalClosed, initialTripIdToView, onViewModalClosed }: AvailableTripsViewProps) {
  const isMobile = useIsMobile();
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  // Trip del modal "Ver detalles". Está SEPARADO de selectedTrip a propósito: el detalle
  // solo se abre al tocar "Ver detalles", nunca por ofertar/aceptar (que usan selectedTrip).
  const [detailTrip, setDetailTrip] = useState<Trip | null>(null);
  const [showBidModal, setShowBidModal] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [pricingMethod, setPricingMethod] = useState<'total' | 'manual'>('manual');
  const [dismissedTripIds, setDismissedTripIds] = useState<string[]>([]);

  const dismissTrip = (tripId: string) => {
    setDismissedTripIds(ids => [...ids, tripId]);
    toast('Viaje descartado', {
      action: { label: 'Deshacer', onClick: () => setDismissedTripIds(ids => ids.filter(id => id !== tripId)) },
    });
  };
  const [manualDistance, setManualDistance] = useState('');
  const [manualPricePerKm, setManualPricePerKm] = useState('');
  const [showAcceptConfirm, setShowAcceptConfirm] = useState(false);
  const [showAssignmentScreen, setShowAssignmentScreen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [acceptedTripId, setAcceptedTripId] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [selectedGuideNumber, setSelectedGuideNumber] = useState<1 | 2 | undefined>(undefined);
  const [showFleetPopup, setShowFleetPopup] = useState(false);
  // El popup de flota se usa en dos flujos: ofertar y aceptar (asignar camión primero).
  const [fleetForAccept, setFleetForAccept] = useState(false);
  const [fleetPendingTrip, setFleetPendingTrip] = useState<Trip | null>(null);
  const [fleetPendingGuide, setFleetPendingGuide] = useState<1 | 2 | undefined>(undefined);
  const [pendingFleetAssignment, setPendingFleetAssignment] = useState<{ driverId: string; vehicleId: string } | null>(null);
  const [bothGuidesMode, setBothGuidesMode] = useState(false);
  const [guide1Assignment, setGuide1Assignment] = useState<{ driverId: string; vehicleId: string } | null>(null);
  const [recomendadosActive, setRecomendadosActive] = useState(true);
  const [priceSort, setPriceSort] = useState<'none' | 'asc' | 'desc'>('none');
  const [estadoFilter, setEstadoFilter] = useState<'todos' | 'accion' | 'disponible' | 'esperando'>('todos');
  const [distanceMax, setDistanceMax] = useState(1000);
  const [truckFilter, setTruckFilter] = useState('todos');
  // Guía visible por card cuando la solicitud está dividida en 2 guías (id -> índice 0/1)
  const [guideViewIdx, setGuideViewIdx] = useState<Record<string, number>>({});

  const { orders: storeOrders } = useDemoStore();
  const { data: backendRequests = [] } = useAvailableTransportRequests();
  const createOfferMutation = useCreateTransportOffer();
  const backendTrips = backendRequests.map((request) => toMarketplaceTrip(request) as Trip);

  // Mock data for drivers and vehicles
  const availableDrivers: Driver[] = [
    { id: 'DRV-001', name: 'Carlos Mendez', phone: '+595 981 123456', tripsCompleted: 24, rating: 4.8, available: true },
    { id: 'DRV-002', name: 'Roberto Silva', phone: '+595 981 234567', tripsCompleted: 19, rating: 4.6, available: true },
    { id: 'DRV-003', name: 'María González', phone: '+595 981 345678', tripsCompleted: 31, rating: 4.9, available: false },
    { id: 'DRV-004', name: 'Juan Pérez', phone: '+595 981 456789', tripsCompleted: 15, rating: 4.5, available: true },
    { id: 'DRV-005', name: 'Ana López', phone: '+595 981 567890', tripsCompleted: 22, rating: 4.7, available: true },
  ];

  const availableVehicles: Vehicle[] = [
    { id: 'CAM-001', plate: 'ABC-123', capacity: 45, available: false },
    { id: 'CAM-004', plate: 'DEF-456', capacity: 35, available: true },
    { id: 'CAM-007', plate: 'GHI-789', capacity: 50, available: false },
    { id: 'CAM-009', plate: 'JKL-012', capacity: 40, available: true },
    { id: 'CAM-012', plate: 'MNO-345', capacity: 45, available: true },
  ];

  const mockTrips: Trip[] = [
    {
      id: 'SOL-001',
      rancherId: 'RAN-0234',
      rancherName: 'Estancia Don Pedro',
      rancherPhone: '+595 981 234567',
      rancherRating: 4.8,
      establishmentName: 'Estancia Don Pedro',
      establishmentCode: 'SENACSA-12345',
      origin: 'Filadelfia',
      originCoords: 'Ruta 9 Km 45, Filadelfia, Boquerón',
      destination: 'Asunción',
      destinationCoords: 'Frigorífico Central, Ruta 1 Km 23, Asunción',
      cattleType: 'Gordos',
      heads: 60,
      distance: 485,
      pickupDate: '24/03/2026',
      pickupTime: '06:00',
      estimatedDuration: '8 horas',
      specialRequirements: 'Ganado de alta calidad, requiere cuidado especial durante transporte',
      bidStatus: 'new',
      negotiationCount: 0,
      marketPrice: 1680000,
      hoursAgo: 3,
      verified: true,
    },
    {
      id: 'SOL-002',
      rancherId: 'RAN-0156',
      rancherName: 'Rancho San Miguel',
      rancherPhone: '+595 981 345678',
      rancherRating: 4.5,
      establishmentName: 'Rancho San Miguel',
      establishmentCode: 'SENACSA-23456',
      origin: 'Loma Plata',
      originCoords: 'Av. Central 1234, Loma Plata, Boquerón',
      destination: 'Concepción',
      destinationCoords: 'Matadero Municipal, Concepción',
      cattleType: 'Novillos',
      heads: 32,
      distance: 320,
      pickupDate: '25/03/2026',
      pickupTime: '05:30',
      estimatedDuration: '6 horas',
      bidStatus: 'rancher-countered',
      yourBid: 1350000,
      rancherCounterOffer: 1150000,
      negotiationCount: 2,
      marketPrice: 1220000,
      hoursAgo: 6,
      verified: true,
    },
    {
      id: 'SOL-003',
      rancherId: 'RAN-0089',
      rancherName: 'Ganadera La Esperanza',
      rancherPhone: '+595 981 456789',
      rancherRating: 5.0,
      establishmentName: 'Ganadera La Esperanza',
      establishmentCode: 'SENACSA-34567',
      origin: 'Neuland',
      originCoords: 'Colonia Neuland, Boquerón',
      destination: 'Villa Hayes',
      destinationCoords: 'Ruta Transchaco Km 35, Villa Hayes',
      cattleType: 'Vaquillonas',
      heads: 28,
      distance: 380,
      pickupDate: '26/03/2026',
      pickupTime: '07:00',
      estimatedDuration: '7 horas',
      specialRequirements: 'Animales preñados, conducción suave requerida',
      bidStatus: 'new',
      negotiationCount: 0,
      marketPrice: 1450000,
      hoursAgo: 2,
      verified: false,
    },
    {
      id: 'SOL-004',
      rancherId: 'RAN-0312',
      rancherName: 'Estancia Santa Rosa',
      rancherPhone: '+595 981 567890',
      rancherRating: 4.7,
      establishmentName: 'Estancia Santa Rosa',
      establishmentCode: 'SENACSA-45678',
      origin: 'Mariscal Estigarribia',
      originCoords: 'Ruta 9, Mariscal Estigarribia, Boquerón',
      destination: 'Asunción',
      destinationCoords: 'Frigorífico del Sur, Asunción',
      cattleType: 'Gordos',
      heads: 50,
      distance: 560,
      pickupDate: '27/03/2026',
      pickupTime: '05:00',
      estimatedDuration: '9 horas',
      bidStatus: 'awaiting-rancher',
      yourBid: 2200000,
      negotiationCount: 1,
      marketPrice: 2050000,
      hoursAgo: 8,
      verified: true,
    },
    {
      id: 'SOL-005',
      rancherId: 'RAN-0445',
      rancherName: 'Establecimiento El Progreso',
      rancherPhone: '+595 981 678901',
      rancherRating: 4.6,
      establishmentName: 'Establecimiento El Progreso',
      establishmentCode: 'SENACSA-56789',
      origin: 'Concepción',
      originCoords: 'Ruta 5 Km 120, Concepción',
      destination: 'Asunción',
      destinationCoords: 'Puerto de Asunción, Asunción',
      cattleType: 'Terneros',
      heads: 70,
      distance: 412,
      pickupDate: '28/03/2026',
      pickupTime: '06:30',
      estimatedDuration: '7.5 horas',
      bidStatus: 'new',
      negotiationCount: 0,
      marketPrice: 1580000,
      hoursAgo: 1,
      verified: false,
    },
  ];

  const storeTrips: Trip[] = storeOrders.map(order => ({
    id: order.id,
    rancherId: order.id,
    rancherName: order.rancherName,
    rancherPhone: '+595 981 000000',
    rancherRating: 4.5,
    establishmentName: order.origin,
    establishmentCode: 'SENACSA-DEMO',
    origin: order.origin,
    originCoords: order.originDepartment || '',
    destination: order.destination,
    destinationCoords: '',
    cattleType: order.cattleTypeLabel,
    heads: order.heads,
    distance: order.distance,
    pickupDate: order.pickupDate || 'A confirmar',
    pickupTime: '06:00',
    estimatedDuration: `${Math.ceil(order.distance / 60)} hs aprox.`,
    bidStatus: 'new' as const,
    negotiationCount: 0,
    marketPrice: order.marketPrice,
    isStoreOrder: true,
    hoursAgo: 0,
    guides: order.guides,
    estimatedWeight: order.estimatedWeight,
    verified: true,
  }));

  // Para solicitudes que superan el límite SENACSA y todavía no traen guías
  // explícitas (las mock), sintetizamos 2 guías para que el transportista pueda
  // cotizar por guía. El ganadero, en producción, ya las dividiría al publicar.
  const withSenacsaGuides = (t: Trip): Trip => {
    if (t.guides && t.guides.length > 1) return t;
    const category = cattleCategoryFromLabel(t.cattleType);
    if (!exceedsGuideLimit(category, t.heads)) return t;
    // Guía 1 al tope SENACSA, guía 2 el resto: así cada guía tiene datos distintos.
    const g1 = Math.min(t.heads, guideLimitFor(category));
    return {
      ...t,
      guides: [
        { guideNumber: 1, heads: g1, status: 'available' },
        { guideNumber: 2, heads: t.heads - g1, status: 'available' },
      ],
    };
  };

  const demoTrips: Trip[] = [...mockTrips, ...storeTrips];
  const fallbackTrips = isMarketplaceDemoEnabled ? demoTrips : storeTrips;
  const availableTrips: Trip[] = [...(backendTrips.length > 0 ? backendTrips : fallbackTrips)]
    .filter(t => !dismissedTripIds.includes(t.id))
    .map(withSenacsaGuides);

  const getFilteredAndSortedTrips = (): Trip[] => {
    const fleet = getEmpresaFleet();
    const selectedTruck = truckFilter !== 'todos' ? fleet.find(t => t.id === truckFilter) : null;
    const capacityLimit = selectedTruck ? selectedTruck.capacityAdults : Infinity;
    const maxDist = distanceMax >= 1000 ? Infinity : distanceMax;

    let trips = availableTrips.filter(t => {
      if (t.distance > maxDist) return false;
      if (t.heads > capacityLimit) return false;
      if (estadoFilter === 'accion') return t.bidStatus === 'rancher-countered';
      if (estadoFilter === 'disponible') return t.bidStatus === 'new';
      if (estadoFilter === 'esperando') return t.bidStatus === 'awaiting-rancher';
      return true;
    });

    if (priceSort === 'desc') {
      trips = [...trips].sort((a, b) => (b.marketPrice ?? 0) - (a.marketPrice ?? 0));
    } else if (priceSort === 'asc') {
      trips = [...trips].sort((a, b) => (a.marketPrice ?? 0) - (b.marketPrice ?? 0));
    } else if (recomendadosActive) {
      trips = [...trips].sort((a, b) => {
        const pa = a.bidStatus === 'rancher-countered' ? 3 : a.bidStatus === 'awaiting-rancher' ? 2 : 1;
        const pb = b.bidStatus === 'rancher-countered' ? 3 : b.bidStatus === 'awaiting-rancher' ? 2 : 1;
        if (pa !== pb) return pb - pa;
        return (b.marketPrice ?? 0) - (a.marketPrice ?? 0);
      });
    } else {
      trips = [...trips].sort((a, b) => (a.hoursAgo ?? 99) - (b.hoursAgo ?? 99));
    }
    return trips;
  };

  const handleViewDetails = (trip: Trip) => {
    setDetailTrip(trip);
    setShowBidModal(false);
    setBidAmount('');
  };

  // Auto-open bid modal if initialTripIdToBid is provided
  useEffect(() => {
    if (initialTripIdToBid) {
      const trip = availableTrips.find(t => t.id === initialTripIdToBid);
      if (trip) {
        if (initialBothGuides) {
          handleBothGuidesBid(trip);
        } else {
          handleMakeBid(trip, initialGuideNumberToBid);
        }
      }
    }
  }, [initialTripIdToBid]);

  // Auto-open accept confirmation if initialTripIdToAccept is provided
  useEffect(() => {
    if (initialTripIdToAccept) {
      const trip = availableTrips.find(t => t.id === initialTripIdToAccept);
      if (trip) {
        handleAcceptRancherOffer(trip);
      }
    }
  }, [initialTripIdToAccept]);

  // Auto-open detail view if initialTripIdToView is provided
  useEffect(() => {
    if (initialTripIdToView) {
      const trip = availableTrips.find(t => t.id === initialTripIdToView);
      if (trip) {
        handleViewDetails(trip);
      }
    }
  }, [initialTripIdToView]);

  const openBidModal = (trip: Trip, guideNum?: 1 | 2) => {
    setSelectedGuideNumber(guideNum);
    setSelectedTrip(trip);
    setShowBidModal(true);
    setPricingMethod('manual');
    if (trip.bidStatus === 'new') {
      setBidAmount(trip.marketPrice?.toString() || '');
      setManualDistance(trip.distance.toString());
      setManualPricePerKm('');
    } else if (trip.bidStatus === 'rancher-countered' && trip.rancherCounterOffer) {
      setBidAmount(trip.rancherCounterOffer.toString());
      setManualDistance(trip.distance.toString());
      setManualPricePerKm('');
    }
  };

  const handleMakeBid = (trip: Trip, guideNum?: 1 | 2) => {
    setDetailTrip(null); // ofertar nunca debe dejar abierto el detalle
    if (trip.isStoreOrder && hasActiveTransporterOffer(userType)) {
      toast.error('Tenés una oferta activa. No podés ofertar en otro viaje hasta que se resuelva.');
      return;
    }
    if (userType === 'empresa') {
      setBothGuidesMode(false);
      setGuide1Assignment(null);
      setFleetPendingTrip(trip);
      setFleetPendingGuide(guideNum);
      setShowFleetPopup(true);
      return;
    }
    openBidModal(trip, guideNum);
  };

  const handleBothGuidesBid = (trip: Trip) => {
    setDetailTrip(null);
    if (trip.isStoreOrder && hasActiveTransporterOffer(userType)) {
      toast.error('Tenés una oferta activa. No podés ofertar en otro viaje hasta que se resuelva.');
      return;
    }
    setBothGuidesMode(true);
    setGuide1Assignment(null);
    setFleetPendingTrip(trip);
    setFleetPendingGuide(1);
    setShowFleetPopup(true);
  };

  const handleFleetConfirm = (assignment: { driverId: string; vehicleId: string }) => {
    if (!fleetPendingTrip) return;
    if (fleetForAccept) {
      // Flujo aceptar: ya se eligió el camión → mostrar confirmación final.
      setPendingFleetAssignment(assignment);
      setShowFleetPopup(false);
      setFleetForAccept(false);
      setFleetPendingTrip(null);
      setFleetPendingGuide(undefined);
      setShowAcceptConfirm(true);
      return;
    }
    if (bothGuidesMode && !guide1Assignment) {
      // First popup done — store guide 1 assignment and show guide 2 popup
      setGuide1Assignment(assignment);
      setFleetPendingGuide(2);
      return;
    }
    // Single guide or second popup done
    setPendingFleetAssignment(assignment);
    setShowFleetPopup(false);
    const trip = fleetPendingTrip;
    const guideNum = bothGuidesMode ? undefined : fleetPendingGuide;
    setFleetPendingTrip(null);
    setFleetPendingGuide(undefined);
    openBidModal(trip, guideNum);
  };

  const handleShareTrip = (trip: Trip) => {
    const userName = 'Usuario'; // In real app, get from context/props
    const link = `${window.location.origin}/registro-referral?trip=${trip.id}&referrer=${userName}&remaining=${trip.heads}&cattleType=${trip.cattleType}`;
    setShareLink(link);
    setShowShareModal(true);
    setLinkCopied(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const submitBid = async () => {
    if (!selectedTrip) return;

    let finalAmount = 0;

    if (pricingMethod === 'total') {
      if (!bidAmount) return;
      finalAmount = parseInt(bidAmount);
    } else if (pricingMethod === 'manual') {
      if (!manualDistance || !manualPricePerKm) return;
      const guideHeads = selectedGuideNumber && selectedTrip.guides
        ? (selectedTrip.guides.find(g => g.guideNumber === selectedGuideNumber)?.heads ?? selectedTrip.heads)
        : selectedTrip.heads;
      finalAmount = billableHeads(guideHeads) * parseInt(manualDistance) * parseInt(manualPricePerKm);
    }

    try {
      if (selectedTrip.backendId) {
        const selectedGuide = selectedGuideNumber && selectedTrip.guides
          ? selectedTrip.guides.find((guide) => guide.guideNumber === selectedGuideNumber)
          : undefined;

        await createOfferMutation.mutateAsync({
          requestId: selectedTrip.backendId,
          amount: finalAmount,
          guideId: selectedGuide?.backendGuideId ?? null,
          pricePerKm: pricingMethod === 'manual' ? Number(manualPricePerKm) : null,
        });
      } else if (selectedTrip.isStoreOrder) {
        // Keep the demo store as a local-only fallback for demo orders.
        if (bothGuidesMode && guide1Assignment && pendingFleetAssignment && selectedTrip.guides) {
          const g1 = selectedTrip.guides.find(g => g.guideNumber === 1);
          const g2 = selectedTrip.guides.find(g => g.guideNumber === 2);
          const transporterName = 'Demo Empresa';
          const now = Date.now();
          const g1Amount = g1 ? Math.round(finalAmount * g1.heads / selectedTrip.heads) : 0;
          const g2Amount = finalAmount - g1Amount;
          if (g1) addOffer({ orderId: selectedTrip.id, guideNumber: 1, transporterName, transporterType: 'empresa', amount: g1Amount, status: 'pending', rounds: [{ round: 1, by: 'transporter', amount: g1Amount, timestamp: now }], assignedDriverId: guide1Assignment.driverId, assignedVehicleId: guide1Assignment.vehicleId });
          if (g2) addOffer({ orderId: selectedTrip.id, guideNumber: 2, transporterName, transporterType: 'empresa', amount: g2Amount, status: 'pending', rounds: [{ round: 1, by: 'transporter', amount: g2Amount, timestamp: now }], assignedDriverId: pendingFleetAssignment.driverId, assignedVehicleId: pendingFleetAssignment.vehicleId });
        } else {
          addOffer({
            orderId: selectedTrip.id,
            guideNumber: selectedTrip.guides && selectedTrip.guides.length > 1 ? selectedGuideNumber : undefined,
            transporterName: userType === 'owner-operator' ? 'Demo Transportista Independiente' : 'Demo Empresa',
            transporterType: userType,
            amount: finalAmount,
            status: 'pending',
            rounds: [{ round: 1, by: 'transporter', amount: finalAmount, timestamp: Date.now() }],
            assignedDriverId: pendingFleetAssignment?.driverId,
            assignedVehicleId: pendingFleetAssignment?.vehicleId,
          });
        }
      }

      if (selectedTrip.bidStatus === 'new') {
        toast.success(`Oferta de ₲ ${finalAmount.toLocaleString('es-PY')} enviada al ganadero. Esperando respuesta...`);
      } else if (selectedTrip.bidStatus === 'rancher-countered') {
        toast.success(`Contraoferta final de ₲ ${finalAmount.toLocaleString('es-PY')} enviada. Esta es tu última oportunidad de negociación.`);
      }
    } catch {
      toast.error('No se pudo enviar la oferta. Intentá nuevamente.');
      return;
    }

    setShowBidModal(false);
    setBidAmount('');
    setManualDistance('');
    setManualPricePerKm('');
    setSelectedTrip(null);
    setPendingFleetAssignment(null);
    setBothGuidesMode(false);
    setGuide1Assignment(null);
    onBidModalClosed?.();
  };

  const handleAcceptRancherOffer = (trip: Trip) => {
    setDetailTrip(null); // aceptar nunca debe abrir/dejar abierto el detalle de la solicitud
    setSelectedTrip(trip);
    if (userType === 'empresa') {
      // Flujo invertido: primero se elige el camión (más cercano), luego se confirma.
      setFleetForAccept(true);
      setBothGuidesMode(false);
      setGuide1Assignment(null);
      setPendingFleetAssignment(null);
      setFleetPendingTrip(trip);
      setFleetPendingGuide(undefined);
      setShowFleetPopup(true);
    } else {
      // Owner-operator es su propio camión: pasa directo a la confirmación (sin abrir el detalle).
      // Aceptar → "Confirmar viaje"; al confirmar → notificación de aceptado.
      setShowBidModal(false);
      setShowAcceptConfirm(true);
    }
  };

  const confirmAcceptOffer = () => {
    if (selectedTrip) {
      setShowAcceptConfirm(false);
      // El camión ya se asignó antes (empresa) o no aplica (owner-operator): se acepta directo.
      setAcceptedTripId(selectedTrip.id);
      setShowSuccessModal(true);
      onAcceptModalClosed?.(); // limpia el deep-link para que no se vuelva a disparar
      setTimeout(() => {
        setShowSuccessModal(false);
        setSelectedTrip(null);
        setPendingFleetAssignment(null);
      }, 3000);
    }
  };

  const handleWhatsAppRancher = (trip: Trip) => {
    openWhatsApp(
      trip.rancherPhone,
      `Hola, soy de ${userType === 'empresa' ? 'una empresa de transporte' : 'un transportista'} y estoy coordinando el viaje ${trip.id} para transportar ganado de ${trip.origin} a ${trip.destination}.`,
    );
  };

  const formatPrice = (price: number) => {
    return '₲ ' + price.toLocaleString('es-PY');
  };

  const getBidStatusBadge = (trip: Trip) => {
    const dot = (color: string) => (
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0, display: 'inline-block' }} />
    );
    const pill = (bg: string, color: string, dotColor: string, label: string, pulse = false) => (
      <span className={pulse ? 'pill-pulse' : ''} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '2px 10px', borderRadius: 99, background: bg, color, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
        {dot(dotColor)}{label}
      </span>
    );
    switch (trip.bidStatus) {
      case 'new':           return pill('#ECFDF5', '#065F46', '#22C55E', 'Disponible');
      case 'awaiting-rancher': return pill('#F3F4F6', '#6B7280', '#9CA3AF', 'Esperando respuesta');
      case 'rancher-countered': return pill('#FEF3E2', '#B45309', '#F58718', 'Contraoferta recibida', true);
      case 'accepted':      return pill('#ECFDF5', '#065F46', '#22C55E', 'Oferta aceptada');
      default: return null;
    }
  };

  const canNegotiate = (trip: Trip) => {
    return trip.negotiationCount < 3;
  };

  // Show assignment screen if it's active
  if (showAssignmentScreen && selectedTrip) {
    return (
      <TripAssignmentScreen
        trip={{
          ...selectedTrip,
          agreedPrice: selectedTrip.rancherCounterOffer || selectedTrip.yourBid || 0
        }}
        userType={userType}
        onConfirm={(driverId, vehicleId) => {
          setAcceptedTripId(selectedTrip.id);
          setShowAssignmentScreen(false);
          setShowSuccessModal(true);
          setTimeout(() => {
            setShowSuccessModal(false);
            setSelectedTrip(null);
          }, 3000);
        }}
        onCancel={() => {
          setShowAssignmentScreen(false);
          setSelectedTrip(null);
        }}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F6F1E8' }}>
      {/* Full-width dark header */}
      <div style={{ background: '#1E5126', borderRadius: 16, margin: '12px 12px 0', overflow: 'hidden' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          {/* Title row */}
          <div style={{ padding: '14px 16px 0' }}>
            <button
              onClick={onBack}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, padding: 0 }}
            >
              ← Volver al panel
            </button>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, paddingBottom: 14, flexWrap: 'wrap' }}>
              <div>
                <h1 style={{ fontSize: isMobile ? 19 : 26, fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.2 }}>Solicitudes de Transporte</h1>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', margin: '4px 0 0' }}>
                  {availableTrips.length} solicitudes activas · Hacé tu oferta
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '7px 18px', textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{availableTrips.filter(t => t.bidStatus === 'new').length}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 3 }}>Disponibles</div>
                </div>
                {availableTrips.filter(t => t.bidStatus === 'rancher-countered').length > 0 && (
                  <div style={{ background: 'rgba(245,135,24,0.2)', border: '1px solid rgba(245,135,24,0.4)', borderRadius: 10, padding: '7px 18px', textAlign: 'center' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: '#F58718', lineHeight: 1 }}>{availableTrips.filter(t => t.bidStatus === 'rancher-countered').length}</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 3 }}>Contraofertas</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Filter bar */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '10px 16px 14px' }}>

            {/* Row 1: sort/estado pills */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              {/* Recomendados toggle */}
              <button
                onClick={() => { setRecomendadosActive(a => !a); setPriceSort('none'); }}
                style={{ padding: '6px 14px', borderRadius: 99, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, background: recomendadosActive ? '#F58718' : 'rgba(255,255,255,0.12)', color: '#fff', whiteSpace: 'nowrap' }}
              >
                Recomendados
              </button>

              {/* Precio cycling */}
              <button
                onClick={() => { setPriceSort(p => p === 'none' ? 'desc' : p === 'desc' ? 'asc' : 'none'); setRecomendadosActive(false); }}
                style={{ padding: '6px 14px', borderRadius: 99, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, background: priceSort !== 'none' ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.1)', color: priceSort !== 'none' ? '#fff' : 'rgba(255,255,255,0.65)', whiteSpace: 'nowrap' }}
              >
                {priceSort === 'none' ? 'Precio' : priceSort === 'desc' ? 'Precio ↓' : 'Precio ↑'}
              </button>

              {/* Estado cycling */}
              {(() => {
                const cfgs = {
                  todos:      { label: 'Estado',       bg: 'rgba(255,255,255,0.1)',  color: 'rgba(255,255,255,0.65)' },
                  accion:     { label: 'Con acción',    bg: '#F58718',               color: '#fff' },
                  disponible: { label: 'Disponible',    bg: '#22C55E',               color: '#fff' },
                  esperando:  { label: 'Esperando',     bg: '#EAB308',               color: '#1a1a1a' },
                } as const;
                const cfg = cfgs[estadoFilter];
                return (
                  <button
                    onClick={() => setEstadoFilter(e => e === 'todos' ? 'accion' : e === 'accion' ? 'disponible' : e === 'disponible' ? 'esperando' : 'todos')}
                    style={{ padding: '6px 14px', borderRadius: 99, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, background: cfg.bg, color: cfg.color, whiteSpace: 'nowrap' }}
                  >
                    {cfg.label}
                  </button>
                );
              })()}
            </div>

            {/* Row 2: region + truck dropdowns */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              <select style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', fontSize: 12, flex: '1 1 140px' }}>
                <option style={{ color: '#000', background: '#fff' }}>Todas las regiones</option>
                <option style={{ color: '#000', background: '#fff' }}>Boquerón</option>
                <option style={{ color: '#000', background: '#fff' }}>Central</option>
                <option style={{ color: '#000', background: '#fff' }}>Concepción</option>
              </select>

              {userType === 'empresa' && (
                <select
                  value={truckFilter}
                  onChange={e => setTruckFilter(e.target.value)}
                  style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', fontSize: 12, flex: '1 1 150px' }}
                >
                  <option value="todos" style={{ color: '#000', background: '#fff' }}>Todos los camiones</option>
                  {getEmpresaFleet().map(truck => (
                    <option key={truck.id} value={truck.id} style={{ color: '#000', background: '#fff' }}>
                      {truck.id} · {truck.plate} · {truck.capacityAdults} cap.
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Row 3: distance slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', flexShrink: 0 }}>Distancia:</span>
              <input
                type="range"
                min={50}
                max={1000}
                step={10}
                value={distanceMax}
                onChange={e => setDistanceMax(Number(e.target.value))}
                style={{ flex: 1, accentColor: '#F58718', cursor: 'pointer', minWidth: 0 }}
              />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0, minWidth: 80, textAlign: 'right' }}>
                {distanceMax >= 1000 ? '1000+ km' : `≤ ${distanceMax} km`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pulse animation for action-required pills */}
      <style>{`
        @keyframes pill-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(245,135,24,0.4); }
          50% { box-shadow: 0 0 0 5px rgba(245,135,24,0); }
        }
        .pill-pulse { animation: pill-pulse 2s ease-in-out infinite; }
        @keyframes guide-fade {
          from { opacity: 0; transform: translateY(3px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .guide-fade { animation: guide-fade 0.22s ease; }
      `}</style>

      {/* Trips List */}
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: isMobile ? '14px 12px 96px' : '24px 24px 48px' }}>
        {getFilteredAndSortedTrips().length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <Package style={{ width: 48, height: 48, color: '#d1d5db', margin: '0 auto 16px' }} />
            <div style={{ color: '#6b7280', fontWeight: 500 }}>Sin solicitudes para los filtros aplicados</div>
          </div>
        ) : (
          <div className="space-y-3">
            {getFilteredAndSortedTrips().map((trip) => {
              const isNew = trip.bidStatus === 'new';
              const isAwaiting = trip.bidStatus === 'awaiting-rancher';
              const isCounter = trip.bidStatus === 'rancher-countered';
              const isAccepted = acceptedTripId === trip.id;
              const displayTrip = isAccepted ? { ...trip, bidStatus: 'accepted' as const } : trip;

              // Guías: aplica a mock y store (síntesis SENACSA arriba)
              const guides = trip.guides && trip.guides.length > 1 ? trip.guides : null;
              const hasSplit = !!guides;
              const gIdx = hasSplit ? Math.min(guideViewIdx[trip.id] ?? 0, guides!.length - 1) : 0;
              const activeGuide = hasSplit ? guides![gIdx] : null;
              const shownHeads = activeGuide ? activeGuide.heads : trip.heads;
              const shownWeight = ((trip.estimatedWeight || 380) * shownHeads).toLocaleString('es-PY');
              const setGuide = (i: number) => setGuideViewIdx(m => ({ ...m, [trip.id]: i }));

              const cardBorder = isCounter ? '1.5px solid rgba(245,135,24,0.4)'
                : isAccepted ? '1.5px solid rgba(34,197,94,0.35)' : '1.5px solid #E5E7EB';
              const cardShadow = isCounter ? '0 2px 14px rgba(245,135,24,0.1)' : '0 1px 6px rgba(0,0,0,0.05)';

              // ── Sub-elementos compartidos entre desktop y mobile ──
              const headerRow = (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1E5126', fontFamily: 'monospace', letterSpacing: '0.04em' }}>{trip.id}</span>
                  {getBidStatusBadge(displayTrip)}
                  {hasSplit && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: '#1D4ED8', background: '#EFF6FF', padding: '2px 9px', borderRadius: 99 }}>
                      <Package style={{ width: 11, height: 11 }} /> 2 guías
                    </span>
                  )}
                </div>
              );

              const rancherRow = (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{trip.rancherName}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                    <Star style={{ width: 13, height: 13, fill: '#F5B301', color: '#F5B301' }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>{trip.rancherRating.toFixed(1)}</span>
                  </span>
                  {trip.verified && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: '#1E5126', background: 'rgba(30,81,38,0.08)', padding: '2px 9px', borderRadius: 99 }}>
                      <ShieldCheck style={{ width: 12, height: 12 }} /> Verificado
                    </span>
                  )}
                </div>
              );

              const routeRow = (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: hasSplit ? 10 : 12 }}>
                  <MapPin style={{ width: 15, height: 15, color: '#1E5126', flexShrink: 0 }} />
                  <span style={{ fontSize: 15, fontWeight: 800, color: '#111', flex: isMobile ? 1 : '0 1 auto', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {trip.origin} → {trip.destination}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#1E5126', background: 'rgba(30,81,38,0.08)', padding: '3px 10px', borderRadius: 99, flexShrink: 0 }}>
                    {trip.distance} km
                  </span>
                </div>
              );

              // Toggle segmentado de guía (limpio, muestra ambas y resalta la activa)
              const guideToggle = hasSplit ? (
                <div style={{ display: 'flex', gap: 4, marginBottom: 12, padding: 4, background: '#EFF6FF', border: '1px solid #DBEAFE', borderRadius: 10 }}>
                  {guides!.map((g, i) => {
                    const active = i === gIdx;
                    return (
                      <button
                        key={g.guideNumber}
                        onClick={() => setGuide(i)}
                        style={{ flex: 1, padding: '7px 6px', borderRadius: 7, border: 'none', cursor: 'pointer', textAlign: 'center', transition: 'background 0.15s ease, color 0.15s ease', background: active ? '#1D4ED8' : 'transparent', color: active ? '#fff' : '#1D4ED8' }}
                      >
                        <div style={{ fontSize: 12, fontWeight: 800, lineHeight: 1.2 }}>Guía {g.guideNumber}</div>
                        <div style={{ fontSize: 10, fontWeight: 600, opacity: active ? 0.9 : 0.65 }}>{g.heads} cab.{g.status !== 'available' ? ' · en neg.' : ''}</div>
                      </button>
                    );
                  })}
                </div>
              ) : null;

              const cargaLabel = `Carga${hasSplit ? ` · Guía ${activeGuide!.guideNumber}` : ''}`;

              // Stats — grid en mobile, tira compacta con divisores en desktop. key=guía → transición.
              const statsMobile = (
                <div key={gIdx} className="guide-fade" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12, padding: '10px 12px', background: '#F6F1E8', borderRadius: 10 }}>
                  <div>
                    <div style={cardStatLabel}>{cargaLabel}</div>
                    <div style={cardStatValue}>{shownHeads} cab.</div>
                    <div style={cardStatSub}>{trip.cattleType}</div>
                  </div>
                  <div>
                    <div style={cardStatLabel}>Peso est.</div>
                    <div style={cardStatValue}>~{shownWeight} kg</div>
                  </div>
                  <div>
                    <div style={cardStatLabel}>Retiro</div>
                    <div style={cardStatValue}>{trip.pickupDate}</div>
                    <div style={cardStatSub}>{trip.pickupTime}</div>
                  </div>
                </div>
              );

              const statsDesktop = (
                <div key={gIdx} className="guide-fade" style={{ display: 'inline-flex', alignItems: 'stretch', marginBottom: trip.specialRequirements ? 12 : 0, background: '#F6F1E8', borderRadius: 10, padding: '10px 4px' }}>
                  {[
                    { label: cargaLabel, value: `${shownHeads} cab.`, sub: trip.cattleType },
                    { label: 'Peso est.', value: `~${shownWeight} kg`, sub: '' },
                    { label: 'Retiro', value: trip.pickupDate, sub: trip.pickupTime },
                  ].map((s, i) => (
                    <div key={i} style={{ padding: '0 18px', borderLeft: i ? '1px solid #E7E2D6' : 'none' }}>
                      <div style={cardStatLabel}>{s.label}</div>
                      <div style={cardStatValue}>{s.value}</div>
                      {s.sub && <div style={cardStatSub}>{s.sub}</div>}
                    </div>
                  ))}
                </div>
              );

              const specialEl = trip.specialRequirements ? (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 12, padding: '8px 10px', background: '#FFFBEB', border: '1px solid #FDE7A7', borderRadius: 10 }}>
                  <AlertCircle style={{ width: 14, height: 14, color: '#B45309', flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 11, color: '#92400e', lineHeight: 1.4 }}>{trip.specialRequirements}</span>
                </div>
              ) : null;

              const priceContent = (
                <>
                  {isCounter && (<>
                    <div style={cardPriceLabel}>Contraoferta del ganadero</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#F58718', lineHeight: 1 }}>{formatPrice(trip.rancherCounterOffer!)}</div>
                    <div style={cardPriceSub}>Tu oferta: {formatPrice(trip.yourBid!)} · Ref: {formatPrice(trip.marketPrice!)}</div>
                  </>)}
                  {isAwaiting && (<>
                    <div style={cardPriceLabel}>Tu oferta</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#1E5126', lineHeight: 1 }}>{formatPrice(trip.yourBid!)}</div>
                    <div style={cardPriceSub}>Ref. mercado: {formatPrice(trip.marketPrice!)}</div>
                  </>)}
                  {isAccepted && (<>
                    <div style={cardPriceLabel}>Oferta aceptada</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#1E5126', lineHeight: 1 }}>{formatPrice(trip.rancherCounterOffer || trip.yourBid!)}</div>
                    <div style={cardPriceSub}>Listo para asignación</div>
                  </>)}
                  {isNew && !isAccepted && (<>
                    <div style={cardPriceLabel}>Ref. mercado</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#1E5126', lineHeight: 1 }}>{formatPrice(trip.marketPrice!)}</div>
                    <div style={cardPriceSub}>≈ {formatPrice(Math.round(trip.marketPrice! / trip.distance))}/km</div>
                  </>)}
                </>
              );

              // Acciones — fila en mobile (footer), columna en desktop (panel derecho)
              const renderActions = (vertical: boolean) => {
                const grow = vertical ? { width: '100%' } : { flex: 1 };
                const auto = vertical ? { width: '100%' } : { flex: '0 0 auto' as const };
                const detalles = (
                  <button key="det" onClick={() => handleViewDetails(trip)} style={{ ...footerBtnBase, background: '#fff', border: '1.5px solid #E5E7EB', color: '#374151', ...auto }}>Ver detalles</button>
                );
                const descartar = isNew && !isAccepted ? (
                  <button key="dis" onClick={() => dismissTrip(trip.id)} style={{ ...footerBtnBase, background: 'transparent', color: '#9CA3AF', padding: '9px 10px', ...auto }}>Descartar</button>
                ) : null;

                let primary: ReactNode = null;
                if (isNew && !isAccepted && !hasSplit) {
                  primary = <button key="of" onClick={() => handleMakeBid(trip)} style={{ ...footerBtnBase, background: '#1E5126', color: '#fff', ...grow }}>Ofertar</button>;
                } else if (isNew && !isAccepted && hasSplit) {
                  primary = (
                    <div key="guides" style={{ display: 'flex', flexDirection: 'column', gap: 8, ...grow }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {guides!.map(g => (
                          <button
                            key={g.guideNumber}
                            disabled={g.status !== 'available'}
                            onClick={() => g.status === 'available' && handleMakeBid(trip, g.guideNumber as 1 | 2)}
                            style={{ ...footerBtnBase, background: '#1E5126', color: '#fff', flex: 1, opacity: g.status === 'available' ? 1 : 0.5, cursor: g.status === 'available' ? 'pointer' : 'not-allowed' }}
                          >
                            {g.status === 'available' ? `Ofertar Guía ${g.guideNumber}` : `Guía ${g.guideNumber} en neg.`}
                          </button>
                        ))}
                      </div>
                      {userType === 'empresa' && guides!.every(g => g.status === 'available') && (
                        <button onClick={() => handleBothGuidesBid(trip)} style={{ ...footerBtnBase, background: '#F58718', color: '#fff', width: '100%' }}>Ofertar ambas guías</button>
                      )}
                    </div>
                  );
                } else if (isAwaiting) {
                  primary = <button key="wait" disabled style={{ ...footerBtnBase, background: '#F3F4F6', color: '#9CA3AF', cursor: 'default', ...grow }}><Clock style={{ width: 13, height: 13 }} /> Esperando</button>;
                } else if (isCounter && canNegotiate(trip)) {
                  primary = (
                    <div key="neg" style={{ display: 'flex', gap: 8, ...grow }}>
                      <button onClick={() => handleAcceptRancherOffer(trip)} style={{ ...footerBtnBase, background: '#1E5126', color: '#fff', flex: 1 }}><Check style={{ width: 14, height: 14 }} /> Aceptar</button>
                      <button onClick={() => handleMakeBid(trip)} style={{ ...footerBtnBase, background: 'transparent', border: '1.5px solid #F58718', color: '#F58718', flex: 1 }}>Contraofertar</button>
                    </div>
                  );
                } else if (isCounter && !canNegotiate(trip)) {
                  primary = <button key="exh" disabled style={{ ...footerBtnBase, background: '#F3F4F6', color: '#9CA3AF', cursor: 'default', ...grow }}>Negociación agotada</button>;
                }

                return (
                  <div style={{ display: 'flex', flexDirection: vertical ? 'column' : 'row', alignItems: vertical ? 'stretch' : 'center', gap: 8, flexWrap: vertical ? 'nowrap' : 'wrap' }}>
                    {primary}
                    {detalles}
                    {descartar}
                  </div>
                );
              };

              // ── Mobile: tarjeta apilada con footer ──
              if (isMobile) {
                return (
                  <div key={trip.id} style={{ background: '#fff', borderRadius: 16, border: cardBorder, boxShadow: cardShadow, overflow: 'hidden', opacity: isAwaiting ? 0.82 : 1 }}>
                    <div style={{ padding: '14px 14px 12px' }}>
                      {headerRow}
                      {rancherRow}
                      {routeRow}
                      {guideToggle}
                      {statsMobile}
                      {specialEl}
                      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
                        <div>{priceContent}</div>
                        {trip.hoursAgo != null && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#9CA3AF', flexShrink: 0, marginBottom: 2 }}>
                            <Clock style={{ width: 12, height: 12 }} />
                            <span style={{ fontSize: 11 }}>hace {trip.hoursAgo}h</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={{ padding: '10px 14px 12px', background: '#FAFAFA', borderTop: '1px solid #F0F0F0' }}>
                      {renderActions(false)}
                    </div>
                  </div>
                );
              }

              // ── Desktop: info a la izquierda, precio + acciones a la derecha ──
              return (
                <div key={trip.id} style={{ display: 'flex', alignItems: 'stretch', background: '#fff', borderRadius: 16, border: cardBorder, boxShadow: cardShadow, overflow: 'hidden', opacity: isAwaiting ? 0.85 : 1 }}>
                  <div style={{ flex: 1, minWidth: 0, padding: '18px 20px' }}>
                    {headerRow}
                    {rancherRow}
                    {routeRow}
                    {guideToggle && <div style={{ maxWidth: 360 }}>{guideToggle}</div>}
                    {statsDesktop}
                    {specialEl}
                  </div>
                  <div style={{ width: 280, flexShrink: 0, borderLeft: '1px solid #F0F0F0', background: '#FCFBF9', padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 16 }}>
                    <div>
                      {priceContent}
                      {trip.hoursAgo != null && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#9CA3AF', marginTop: 8 }}>
                          <Clock style={{ width: 12, height: 12 }} />
                          <span style={{ fontSize: 11 }}>hace {trip.hoursAgo}h</span>
                        </div>
                      )}
                    </div>
                    {renderActions(true)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Fleet Assignment Popup — empresa: elegir camión (antes de ofertar o de aceptar) */}
      {showFleetPopup && fleetPendingTrip && (
        <FleetAssignmentPopup
          trip={fleetPendingTrip}
          guideNumber={fleetPendingGuide}
          confirmLabel={fleetForAccept ? 'Revisar y aceptar →' : 'Continuar con oferta →'}
          onConfirm={handleFleetConfirm}
          onCancel={() => {
            setShowFleetPopup(false);
            setFleetPendingTrip(null);
            setFleetPendingGuide(undefined);
            setBothGuidesMode(false);
            setGuide1Assignment(null);
            setFleetForAccept(false);
            if (!fleetForAccept) onBidModalClosed?.();
          }}
        />
      )}

      {/* Trip Details Modal — SOLO se abre vía "Ver detalles" (detailTrip), nunca por aceptar/ofertar */}
      {detailTrip && !showBidModal && !showAcceptConfirm && !showSuccessModal && (
        <SolicitudDetailModal
          trip={detailTrip}
          userType={userType}
          acceptedTripId={acceptedTripId}
          onClose={() => { setDetailTrip(null); onViewModalClosed?.(); }}
          onMakeBid={handleMakeBid}
          onBothGuides={handleBothGuidesBid}
          onAcceptCounter={handleAcceptRancherOffer}
          onWhatsApp={handleWhatsAppRancher}
          onShare={handleShareTrip}
          onCounterFinal={() => { const t = detailTrip; setDetailTrip(null); if (t) openBidModal(t); }}
          canNegotiate={canNegotiate}
        />
      )}

      {/* Bid/Counter-offer Modal */}
      {showBidModal && selectedTrip && (() => {
        // When bidding on a specific guide, use that guide's heads instead of the total
        const rawBidHeads = selectedGuideNumber && selectedTrip.guides
          ? (selectedTrip.guides.find(g => g.guideNumber === selectedGuideNumber)?.heads ?? selectedTrip.heads)
          : selectedTrip.heads;
        // Tope por camión: la calculadora nunca cotiza más de MAX_HEADS_PER_TRUCK.
        const activeBidHeads = billableHeads(rawBidHeads);
        const headsCapped = rawBidHeads > activeBidHeads;

        const calculateTotal = () => {
          if (pricingMethod === 'total' && bidAmount) {
            return parseInt(bidAmount);
          } else if (pricingMethod === 'manual' && manualDistance && manualPricePerKm) {
            return activeBidHeads * parseInt(manualDistance) * parseInt(manualPricePerKm);
          }
          return 0;
        };

        const totalPrice = calculateTotal();
        const hasValidInput = totalPrice > 0;

        // Market price proportional to the guide's heads when bidding on a specific guide
        const marketPriceTotal = selectedGuideNumber && selectedTrip.guides && selectedTrip.marketPrice
          ? Math.round(selectedTrip.marketPrice * activeBidHeads / selectedTrip.heads)
          : (selectedTrip.marketPrice ?? 0);

        // Get display value for "Tu oferta total" secondary line
        const getOfferSecondaryDisplay = () => {
          if (!hasValidInput) return null;
          if (pricingMethod === 'total') {
            return `≈ ${formatPrice(Math.round(totalPrice / selectedTrip.distance))} por km`;
          } else if (pricingMethod === 'manual' && manualDistance && manualPricePerKm) {
            return `${manualPricePerKm} × ${activeBidHeads} cabezas × ${manualDistance} km`;
          }
        };

        // Handle method change
        const handleMethodChange = (newMethod: 'total' | 'manual') => {
          setPricingMethod(newMethod);
          // If switching to total and we have a manual calculation, convert it
          if (newMethod === 'total' && pricingMethod === 'manual') {
            const calculatedTotal = calculateTotal();
            if (calculatedTotal > 0) {
              setBidAmount(calculatedTotal.toString());
            }
          }
          // If switching to manual, initialize distance if empty
          if (newMethod === 'manual' && !manualDistance) {
            setManualDistance(selectedTrip.distance.toString());
          }
        };

        return (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ background: 'rgba(8,34,26,0.38)', backdropFilter: 'blur(2.5px)', WebkitBackdropFilter: 'blur(2.5px)' }}>
            <div className="bg-white rounded-2xl max-w-md md:max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedTrip.bidStatus === 'new' ? 'Hacer tu oferta' : 'Contraoferta Final'}
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Solicitud {selectedTrip.id}</span>
                      {selectedGuideNumber && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-800 text-xs font-semibold rounded">Guía {selectedGuideNumber}</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowBidModal(false);
                      setSelectedTrip(null);
                      setBidAmount('');
                      setManualDistance('');
                      setManualPricePerKm('');
                      setPendingFleetAssignment(null);
                      onBidModalClosed?.();
                    }}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Trip Info - Compact */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500 mb-1">Distancia</div>
                    <div className="text-lg font-bold text-gray-900">{selectedTrip.distance} km</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500 mb-1">Cabezas{selectedGuideNumber ? ` · Guía ${selectedGuideNumber}` : ''}</div>
                    <div className="text-lg font-bold text-gray-900">{activeBidHeads}</div>
                    {headsCapped && (
                      <div className="text-[10px] font-semibold mt-0.5" style={{ color: '#B45309' }}>tope {MAX_HEADS_PER_TRUCK} · pedido {rawBidHeads}</div>
                    )}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500 mb-1">Peso aprox.</div>
                    <div className="text-sm font-bold text-gray-900">{selectedTrip.estimatedWeight || 380} kg</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-xs text-gray-500 mb-1">Tipo</div>
                    <div className="text-sm font-bold text-gray-900">{selectedTrip.cattleType}</div>
                  </div>
                </div>

                {/* Tu oferta - Prominent Section */}
                <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: '#1E5126' }}>
                  <div className="text-sm font-medium text-green-100 mb-1">Tu oferta total</div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {hasValidInput ? formatPrice(totalPrice) : '₲ —'}
                  </div>
                  {hasValidInput && (
                    <div className="text-sm text-green-100">
                      {getOfferSecondaryDisplay()}
                    </div>
                  )}
                </div>

                {/* Pricing Method Selector */}
                <div className="mb-4">
                  <Label className="text-sm font-medium mb-2 block">Elegí cómo calcular tu precio</Label>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <button
                      onClick={() => handleMethodChange('manual')}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        pricingMethod === 'manual'
                          ? 'border-green-600 bg-green-50 text-green-900'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Ingresar manualmente
                    </button>
                    <button
                      onClick={() => handleMethodChange('total')}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        pricingMethod === 'total'
                          ? 'border-green-600 bg-green-50 text-green-900'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Precio total
                    </button>
                  </div>

                  {/* Input Field Based on Selected Method */}
                  {pricingMethod === 'total' && (
                    <div>
                      <Label htmlFor="total-price" className="text-sm mb-1 block">Precio total del viaje</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">₲</span>
                        <Input
                          id="total-price"
                          type="text"
                          value={bidAmount}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            setBidAmount(value);
                          }}
                          placeholder="Ej: 1680000"
                          className="pl-8 h-10 text-base"
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Ingresá el precio total que querés cobrar por este viaje</div>
                    </div>
                  )}

                  {pricingMethod === 'manual' && (
                    <div className="space-y-2.5">
                      {/* Cantidad de cabezas - Fijo */}
                      <div>
                        <Label htmlFor="manual-heads" className="text-sm mb-1 block">Cantidad de cabezas{selectedGuideNumber ? ` (Guía ${selectedGuideNumber})` : ''}</Label>
                        <Input
                          id="manual-heads"
                          type="text"
                          value={activeBidHeads}
                          disabled
                          className="h-10 text-base bg-gray-100 cursor-not-allowed"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          {headsCapped
                            ? `Tope de ${MAX_HEADS_PER_TRUCK} cab. por camión (la solicitud pide ${rawBidHeads}). Cotizás por lo que entra en un viaje.`
                            : 'Este valor no se puede modificar'}
                        </div>
                      </div>

                      {/* Distancia + Precio por km (2 columnas en desktop) */}
                      <div className="grid md:grid-cols-2 gap-2.5">
                      <div>
                        <Label htmlFor="manual-distance" className="text-sm mb-1 block">Distancia en kilómetros</Label>
                        <Input
                          id="manual-distance"
                          type="text"
                          value={manualDistance}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            setManualDistance(value);
                          }}
                          placeholder="Ej: 485"
                          className="h-10 text-base"
                        />
                        <div className="text-xs text-gray-500 mt-1">Ajustá la distancia si nuestro cálculo no es exacto</div>
                      </div>

                      {/* Precio por kilómetro - Editable */}
                      <div>
                        <Label htmlFor="manual-price-per-km" className="text-sm mb-1 block">Precio por kilómetro</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600">₲</span>
                          <Input
                            id="manual-price-per-km"
                            type="text"
                            value={manualPricePerKm}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              setManualPricePerKm(value);
                            }}
                            placeholder="Ej: 400"
                            className="pl-8 h-10 text-base"
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {manualDistance && manualPricePerKm ? `${activeBidHeads} cabezas × ${manualDistance} km × ₲${manualPricePerKm} = ${formatPrice(totalPrice)}` : 'Ingresá tu precio por kilómetro'}
                        </div>
                      </div>
                      </div>
                    </div>
                  )}
                </div>

                {selectedTrip.bidStatus === 'rancher-countered' && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                    <div className="text-sm text-orange-800 mb-1">Contraoferta del ganadero</div>
                    <div className="text-2xl font-bold text-orange-700">{formatPrice(selectedTrip.rancherCounterOffer!)}</div>
                    <div className="text-xs text-orange-600 mt-2">
                      ⚠️ Esta es tu última oportunidad de negociar. Si rechazás o no aceptás, la solicitud se descarta.
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                  <p className="text-xs text-gray-700">
                    <strong>Rondas de negociación:</strong> {selectedTrip.negotiationCount}/3
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {selectedTrip.bidStatus === 'new'
                      ? 'El ganadero verá tu oferta y podrá aceptar o hacer una contraoferta.'
                      : 'Esta es tu última contraoferta. El ganadero solo podrá aceptar o rechazar.'}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setShowBidModal(false);
                      setSelectedTrip(null);
                      setBidAmount('');
                      setManualDistance('');
                      setManualPricePerKm('');
                      setPendingFleetAssignment(null);
                      onBidModalClosed?.();
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={submitBid}
                    className="flex-1"
                    style={{ backgroundColor: '#1E5126' }}
                    disabled={!hasValidInput}
                  >
                    Enviar {selectedTrip.bidStatus === 'new' ? 'oferta' : 'contraoferta'}
                  </Button>
                </div>

                {/* Share with Friend Option */}
                <button
                  onClick={() => { handleShareTrip(selectedTrip); setShowBidModal(false); }}
                  className="w-full mt-3 flex items-center justify-center gap-2 rounded-lg border border-gray-200 py-2.5 text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  <Share2 className="w-4 h-4" /> ¿Más cabezas de las que entran? Compartí con un colega
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Accept Confirmation Modal */}
      {showAcceptConfirm && selectedTrip && (() => {
        const acceptVehicle = pendingFleetAssignment ? getEmpresaFleet().find(v => v.id === pendingFleetAssignment.vehicleId) : null;
        const acceptDriver = pendingFleetAssignment ? getEmpresaDrivers().find(d => d.id === pendingFleetAssignment.driverId) : null;
        return (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-[120]" style={{ background: 'rgba(8,34,26,0.38)', backdropFilter: 'blur(2.5px)', WebkitBackdropFilter: 'blur(2.5px)' }}>
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="text-center mb-5">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: 'rgba(30,81,38,0.1)' }}>
                  <Check className="w-7 h-7" style={{ color: '#1E5126' }} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Confirmar viaje</h2>
                <p className="text-sm text-gray-500">Revisá los datos antes de aceptar la contraoferta.</p>
              </div>

              {acceptVehicle && acceptDriver && (
                <div className="rounded-xl p-3 mb-3 flex items-center gap-3" style={{ background: 'rgba(30,81,38,0.06)', border: '1px solid rgba(30,81,38,0.18)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: '#fff' }}>
                    <Truck className="w-5 h-5" style={{ color: '#1E5126' }} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-wide" style={{ color: '#1E5126' }}>Camión asignado</div>
                    <div className="text-sm font-bold text-gray-900">{acceptVehicle.plate} · {acceptDriver.name}</div>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Solicitud:</span><span className="font-bold text-gray-900">{selectedTrip.id}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Ruta:</span><span className="font-medium text-gray-900">{selectedTrip.origin} → {selectedTrip.destination}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Precio acordado:</span><span className="font-bold" style={{ color: '#1E5126' }}>{formatPrice(selectedTrip.rancherCounterOffer!)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Recogida:</span><span className="font-medium text-gray-900">{selectedTrip.pickupDate} {selectedTrip.pickupTime}</span></div>
                </div>
              </div>

              <div className="rounded-xl p-3 mb-4" style={{ background: '#FFFBEB', border: '1px solid #FDE7A7' }}>
                <p className="text-xs" style={{ color: '#92400e' }}>
                  Al confirmar, el viaje queda cerrado. Cancelar después puede tener una multa del 2% (según el motivo).
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowAcceptConfirm(false);
                    setSelectedTrip(null);
                    setPendingFleetAssignment(null);
                    setFleetForAccept(false);
                    onAcceptModalClosed?.();
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button onClick={confirmAcceptOffer} className="flex-1" style={{ backgroundColor: '#1E5126' }}>
                  Confirmar viaje
                </Button>
              </div>
            </div>
          </div>
        </div>
        );
      })()}

      {/* Assignment Modal */}
      {showAssignmentScreen && selectedTrip && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ background: 'rgba(8,34,26,0.38)', backdropFilter: 'blur(2.5px)', WebkitBackdropFilter: 'blur(2.5px)' }}>
          <div className="bg-white rounded-lg max-w-3xl w-full">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Asignar Viaje</h2>
                  <span className="text-sm text-gray-600">Solicitud {selectedTrip.id}</span>
                </div>
                <button
                  onClick={() => {
                    setShowAssignmentScreen(false);
                    setSelectedTrip(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Trip Details */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Solicitud:</span>
                    <span className="font-bold text-gray-900">{selectedTrip.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ruta:</span>
                    <span className="font-medium text-gray-900">{selectedTrip.origin} → {selectedTrip.destination}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Precio acordado:</span>
                    <span className="font-bold" style={{ color: '#1E5126' }}>{formatPrice(selectedTrip.rancherCounterOffer!)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Recogida:</span>
                    <span className="font-medium text-gray-900">{selectedTrip.pickupDate} {selectedTrip.pickupTime}</span>
                  </div>
                </div>
              </div>

              {/* Driver Selection */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-gray-900 mb-4">Seleccionar Chofer</h3>
                <div className="space-y-2">
                  {availableDrivers.map((driver) => (
                    <div
                      key={driver.id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                        selectedDriver === driver.id ? 'bg-gray-100' : ''
                      }`}
                      onClick={() => setSelectedDriver(driver.id)}
                    >
                      <Users className="w-5 h-5 text-gray-600" />
                      <div className="flex-1">
                        <div className="font-bold text-gray-900">{driver.name}</div>
                        <div className="text-sm text-gray-600">
                          {driver.tripsCompleted} viajes completados, calificación {driver.rating}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {driver.available ? 'Disponible' : 'No disponible'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vehicle Selection */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-gray-900 mb-4">Seleccionar Vehículo</h3>
                <div className="space-y-2">
                  {availableVehicles.map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                        selectedVehicle === vehicle.id ? 'bg-gray-100' : ''
                      }`}
                      onClick={() => setSelectedVehicle(vehicle.id)}
                    >
                      <Truck className="w-5 h-5 text-gray-600" />
                      <div className="flex-1">
                        <div className="font-bold text-gray-900">Patente: {vehicle.plate}</div>
                        <div className="text-sm text-gray-600">
                          Capacidad: {vehicle.capacity} cabezas
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {vehicle.available ? 'Disponible' : 'No disponible'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowAssignmentScreen(false);
                    setSelectedTrip(null);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    // Assign the trip to driver and vehicle
                    setAcceptedTripId(selectedTrip.id);
                    setShowAssignmentScreen(false);
                    setSelectedDriver('');
                    setSelectedVehicle('');
                    // Show success notification
                    setShowSuccessModal(true);
                    setTimeout(() => {
                      setShowSuccessModal(false);
                    }, 3000);
                  }}
                  className="flex-1"
                  style={{ backgroundColor: '#1E5126' }}
                  disabled={!selectedDriver || !selectedVehicle}
                >
                  Confirmar asignación
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ background: 'rgba(8,34,26,0.38)', backdropFilter: 'blur(2.5px)', WebkitBackdropFilter: 'blur(2.5px)' }}>
          <div className="bg-white rounded-lg max-w-md md:max-w-lg w-full">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Viaje Asignado</h2>
                <p className="text-gray-600">
                  El viaje ha sido asignado exitosamente al chofer y vehículo seleccionados.
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Solicitud:</span>
                    <span className="font-bold text-gray-900">{selectedTrip?.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ruta:</span>
                    <span className="font-medium text-gray-900">{selectedTrip?.origin} → {selectedTrip?.destination}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Precio acordado:</span>
                    <span className="font-bold" style={{ color: '#1E5126' }}>{formatPrice(selectedTrip?.rancherCounterOffer!)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Recogida:</span>
                    <span className="font-medium text-gray-900">{selectedTrip?.pickupDate} {selectedTrip?.pickupTime}</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-green-800">
                  ✅ El viaje ha sido asignado al chofer y vehículo seleccionados. Puedes contactar al ganadero por WhatsApp para coordinar los detalles del viaje.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowSuccessModal(false);
                    setSelectedTrip(null);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ background: 'rgba(8,34,26,0.38)', backdropFilter: 'blur(2.5px)', WebkitBackdropFilter: 'blur(2.5px)' }}>
          <div className="bg-white rounded-lg max-w-md md:max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Compartir viaje con un colega</h3>
              <button
                onClick={() => {
                  setShowShareModal(false);
                  setLinkCopied(false);
                }}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-900">Beneficio de referido</span>
                </div>
                <p className="text-sm text-green-800">
                  Tu colega recibirá un <strong>0.5% de descuento en la comisión</strong> al registrarse con tu link.
                </p>
              </div>

              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Link para compartir:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                />
                <Button
                  variant="outline"
                  onClick={handleCopyLink}
                >
                  {linkCopied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              {linkCopied && (
                <p className="text-xs text-green-600 mt-1">✓ Link copiado al portapapeles</p>
              )}
            </div>

            <div className="space-y-2">
              <Button
                className="w-full"
                style={{ backgroundColor: '#25D366' }}
                onClick={() => shareWhatsApp(
                  `Hola! Tengo un viaje que podés completar. ¿Te interesa transportar ganado? Registrate con este link y obtené 0.5% de descuento en tu comisión: ${shareLink}`
                )}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Compartir por WhatsApp
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleCopyLink}
              >
                {linkCopied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {linkCopied ? 'Link copiado' : 'Copiar link'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
