import { useState } from 'react';
import {
  ArrowLeft, Package, MapPin, ArrowRight, CheckCircle2,
  ChevronDown, ChevronUp, ShieldCheck, Info, X,
  AlertCircle, Star, Clock,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface Offer {
  id: string;
  requestId: string;
  transporterName: string;
  transporterType: 'empresa' | 'owner-operator';
  transporterRating: number;
  tripsCompleted: number;
  verified?: boolean;
  offeredPrice: number;
  yourCounterOffer?: number;
  theirFinalOffer?: number;
  negotiationRound: number;
  status: 'new' | 'you-countered' | 'they-countered' | 'accepted';
  tripDetails: {
    origin: string;
    destination: string;
    cattleType: string;
    heads: number;
    pickupDate: string;
    pickupTime: string;
    distance: number;
  };
  marketPrice: number;
}

interface OfferGroup {
  requestId: string;
  origin: string;
  destination: string;
  heads: number;
  cattleType: string;
  pickupDate: string;
  distance: number;
  offers: Offer[];
  actionCount: number;
}

interface RancherOffersViewProps {
  onBack: () => void;
  onAcceptOffer: (requestId: string, offerId: string) => void;
}

// ── Pure helpers ─────────────────────────────────────────────────────────────

const fmt = (n: number) => '₲ ' + new Intl.NumberFormat('es-PY').format(n);
const savingsPct = (cur: number, mkt: number) => Math.round(((mkt - cur) / mkt) * 100);

function getNegState(offer: Offer) {
  const currentPrice = offer.theirFinalOffer ?? offer.yourCounterOffer ?? offer.offeredPrice;
  const isFinalRound = offer.negotiationRound >= 3;
  const requiresAction = offer.status === 'new' || offer.status === 'they-countered';
  const canCounter = requiresAction && !isFinalRound;

  let stateLabel: string;
  let stateColor: string;

  if (offer.status === 'accepted') {
    stateLabel = 'Aceptada'; stateColor = '#22C55E';
  } else if (offer.status === 'you-countered') {
    stateLabel = 'Esperando respuesta'; stateColor = '#9CA3AF';
  } else if (offer.status === 'they-countered' && isFinalRound) {
    stateLabel = 'Oferta final'; stateColor = '#F58718';
  } else if (offer.status === 'they-countered') {
    stateLabel = 'Contraoferta recibida'; stateColor = '#F58718';
  } else {
    stateLabel = 'Nueva oferta'; stateColor = '#F58718';
  }

  return { currentPrice, isFinalRound, requiresAction, canCounter, stateLabel, stateColor };
}

function buildHistory(offer: Offer) {
  const h: { from: 'transportista' | 'ganadero'; round: number; price: number; label: string }[] = [
    { from: 'transportista', round: 1, price: offer.offeredPrice, label: 'Oferta inicial del transportista' },
  ];
  if (offer.yourCounterOffer)
    h.push({ from: 'ganadero', round: 2, price: offer.yourCounterOffer, label: 'Tu contraoferta' });
  if (offer.theirFinalOffer)
    h.push({ from: 'transportista', round: 3, price: offer.theirFinalOffer,
      label: offer.negotiationRound >= 3 ? 'Respuesta final del transportista' : 'Contraoferta del transportista' });
  return h;
}

function getHistoryToggleLabel(offer: Offer, historyLength: number) {
  if (historyLength <= 1) return null;
  if (offer.negotiationRound >= 3 || historyLength >= 3) {
    return `Ver historial (${historyLength} rondas)`;
  }
  return 'Ver historial';
}

// ── Filter config ────────────────────────────────────────────────────────────

type StatusFilter = 'all' | 'my-turn' | 'waiting' | 'accepted';
type SortOrder = 'none' | 'price-asc' | 'price-desc';

const STATUS_CFG: Record<StatusFilter, { label: string; bg: string; color: string }> = {
  all:       { label: 'Estado',      bg: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.65)' },
  'my-turn': { label: 'Mi turno',    bg: '#F58718',                color: '#fff' },
  waiting:   { label: 'Esperando',   bg: 'rgba(255,255,255,0.22)', color: '#fff' },
  accepted:  { label: 'Aceptadas',   bg: 'rgba(34,197,94,0.35)',   color: '#fff' },
};

const SORT_CFG: Record<SortOrder, { label: string; bg: string; color: string }> = {
  none:        { label: 'Precio',    bg: 'rgba(255,255,255,0.1)',  color: 'rgba(255,255,255,0.55)' },
  'price-asc': { label: 'Precio ↑', bg: 'rgba(255,255,255,0.22)', color: '#fff' },
  'price-desc':{ label: 'Precio ↓', bg: 'rgba(255,255,255,0.22)', color: '#fff' },
};

// ── Component ────────────────────────────────────────────────────────────────

import { toast } from 'sonner';
export function RancherOffersView({ onBack, onAcceptOffer }: RancherOffersViewProps) {

  // Filter / sort state
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortOrder, setSortOrder]       = useState<SortOrder>('none');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [solFilter, setSolFilter]       = useState<'all' | string>('all');

  // Per-offer UI state
  const [expandedHistoryByGroup, setExpandedHistoryByGroup] = useState<Record<string, string | null>>({});
  const [counteringOfferId, setCounteringOfferId]   = useState<string | null>(null);
  const [counterOfferAmount, setCounterOfferAmount] = useState('');
  const [confirmAcceptId, setConfirmAcceptId]       = useState<string | null>(null);
  const [marketInfoOfferId, setMarketInfoOfferId]   = useState<string | null>(null);

  // Mobile group collapse (all expanded by default)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  // ── Static demo data ──────────────────────────────────────────────────────

  const offers: Offer[] = [
    {
      id: 'OFF-001', requestId: 'SOL-001',
      transporterName: 'Transporte González S.A.', transporterType: 'empresa',
      transporterRating: 4.8, tripsCompleted: 142, verified: true,
      offeredPrice: 2800000, negotiationRound: 1, status: 'new',
      tripDetails: { origin: 'Filadelfia', destination: 'Asunción - Frigorífico Central',
        cattleType: 'Gordos', heads: 45, pickupDate: '26/03/2026', pickupTime: '06:00', distance: 480 },
      marketPrice: 3200000,
    },
    {
      id: 'OFF-002', requestId: 'SOL-001',
      transporterName: 'Carlos Méndez', transporterType: 'owner-operator',
      transporterRating: 4.6, tripsCompleted: 87, verified: true,
      offeredPrice: 2500000, yourCounterOffer: 2900000, theirFinalOffer: 2700000,
      negotiationRound: 3, status: 'they-countered',
      tripDetails: { origin: 'Filadelfia', destination: 'Asunción - Frigorífico Central',
        cattleType: 'Gordos', heads: 45, pickupDate: '26/03/2026', pickupTime: '06:00', distance: 480 },
      marketPrice: 3200000,
    },
    {
      id: 'OFF-003', requestId: 'SOL-002',
      transporterName: 'Flota del Chaco', transporterType: 'empresa',
      transporterRating: 4.9, tripsCompleted: 218, verified: true,
      offeredPrice: 1800000, negotiationRound: 1, status: 'new',
      tripDetails: { origin: 'Loma Plata', destination: 'Concepción - Matadero Municipal',
        cattleType: 'Novillos', heads: 32, pickupDate: '27/03/2026', pickupTime: '05:30', distance: 320 },
      marketPrice: 2100000,
    },
  ];

  // ── Build groups ──────────────────────────────────────────────────────────

  const allRequestIds = [...new Set(offers.map(o => o.requestId))];

  const rawGroups: OfferGroup[] = allRequestIds.map(reqId => {
    const go = offers.filter(o => o.requestId === reqId);
    const f = go[0];
    return {
      requestId: reqId,
      origin: f.tripDetails.origin,
      destination: f.tripDetails.destination,
      heads: f.tripDetails.heads,
      cattleType: f.tripDetails.cattleType,
      pickupDate: f.tripDetails.pickupDate,
      distance: f.tripDetails.distance,
      offers: go,
      actionCount: go.filter(o => o.status === 'new' || o.status === 'they-countered').length,
    };
  });

  // ── Apply filters ─────────────────────────────────────────────────────────

  const filteredGroups = rawGroups.map(g => {
    const visibleOffers = g.offers
      .filter(o => {
        if (verifiedOnly && !o.verified) return false;
        if (solFilter !== 'all' && o.requestId !== solFilter) return false;
        const s = getNegState(o);
        if (statusFilter === 'my-turn' && !s.requiresAction) return false;
        if (statusFilter === 'waiting' && o.status !== 'you-countered') return false;
        if (statusFilter === 'accepted' && o.status !== 'accepted') return false;
        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'none') return 0;
        const pA = getNegState(a).currentPrice;
        const pB = getNegState(b).currentPrice;
        return sortOrder === 'price-asc' ? pA - pB : pB - pA;
      });

    return {
      ...g,
      offers: visibleOffers,
      actionCount: visibleOffers.filter(o => o.status === 'new' || o.status === 'they-countered').length,
    };
  }).filter(g => g.offers.length > 0);

  // ── Derived counts ────────────────────────────────────────────────────────

  const totalActionCount = offers.filter(o => o.status === 'new' || o.status === 'they-countered').length;
  const waitingCount     = offers.filter(o => o.status === 'you-countered').length;

  // ── Helpers ───────────────────────────────────────────────────────────────

  const toggleHistory = (groupId: string, offerId: string) =>
    setExpandedHistoryByGroup(prev => ({
      ...prev,
      [groupId]: prev[groupId] === offerId ? null : offerId,
    }));

  const toggleGroup = (group: OfferGroup) => {
    const isCollapsing = !collapsedGroups.has(group.requestId);

    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(group.requestId)) {
        next.delete(group.requestId);
      } else {
        next.add(group.requestId);
      }
      return next;
    });

    if (isCollapsing) {
      setExpandedHistoryByGroup(prev => ({
        ...prev,
        [group.requestId]: null,
      }));
    }
  };

  const startCounter = (id: string) => {
    setCounteringOfferId(id); setCounterOfferAmount(''); setConfirmAcceptId(null);
  };
  const cancelCounter = () => { setCounteringOfferId(null); setCounterOfferAmount(''); };

  const handleSendCounter = (offer: Offer) => {
    const amount = parseInt(counterOfferAmount, 10);
    if (!amount || amount <= 0) return;
    toast.success(`Contraoferta de ${fmt(amount)} enviada a ${offer.transporterName}`);
    cancelCounter();
  };

  const handleAccept = (offer: Offer) => {
    onAcceptOffer(offer.requestId, offer.id);
    setConfirmAcceptId(null);
  };

  const cycleStatus = () =>
    setStatusFilter(f => f === 'all' ? 'my-turn' : f === 'my-turn' ? 'waiting' : f === 'waiting' ? 'accepted' : 'all');
  const cycleSort = () =>
    setSortOrder(s => s === 'none' ? 'price-asc' : s === 'price-asc' ? 'price-desc' : 'none');

  // ── RENDER ────────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F6F1E8' }}>

      {/* ── Dark green header (matches AvailableTripsView pattern) ── */}
      <div style={{ background: '#1E5126', margin: '0 0 0', overflow: 'hidden' }}
           className="lg:rounded-2xl lg:mx-3 lg:mt-3">
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>

          {/* Title row */}
          <div style={{ padding: '14px 20px 0' }} className="lg:px-6">
            <button
              onClick={onBack}
              style={{ background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.65)', fontSize: 13,
                display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, padding: 0 }}
            >
              <ArrowLeft style={{ width: 14, height: 14 }} />
              Volver al panel
            </button>

            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                          gap: 16, paddingBottom: 14, flexWrap: 'wrap' }}>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.2 }}
                    className="lg:text-3xl">
                  Ofertas recibidas
                </h1>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: '4px 0 0' }}>
                  {filteredGroups.reduce((s, g) => s + g.offers.length, 0)} ofertas ·{' '}
                  {allRequestIds.length} solicitud{allRequestIds.length !== 1 ? 'es' : ''}
                </p>
              </div>

              {/* Stat chips */}
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                {totalActionCount > 0 && (
                  <div style={{ background: 'rgba(245,135,24,0.2)', border: '1px solid rgba(245,135,24,0.4)',
                                borderRadius: 10, padding: '6px 14px', textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#F58718', lineHeight: 1 }}>{totalActionCount}</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase',
                                  letterSpacing: '0.05em', marginTop: 2 }}>Mi turno</div>
                  </div>
                )}
                {waitingCount > 0 && (
                  <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 10,
                                padding: '6px 14px', textAlign: 'center' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{waitingCount}</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase',
                                  letterSpacing: '0.05em', marginTop: 2 }}>Esperando</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Filter bar */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', padding: '10px 20px 14px' }}
               className="lg:px-6">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>

              {/* Status cycle pill */}
              <button
                onClick={cycleStatus}
                style={{ padding: '5px 13px', borderRadius: 99, border: 'none', cursor: 'pointer',
                         fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
                         background: STATUS_CFG[statusFilter].bg, color: STATUS_CFG[statusFilter].color }}
              >
                {STATUS_CFG[statusFilter].label}
              </button>

              {/* Sort cycle pill */}
              <button
                onClick={cycleSort}
                style={{ padding: '5px 13px', borderRadius: 99, border: 'none', cursor: 'pointer',
                         fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
                         background: SORT_CFG[sortOrder].bg, color: SORT_CFG[sortOrder].color }}
              >
                {SORT_CFG[sortOrder].label}
              </button>

              {/* Verified toggle — desktop only */}
              <button
                onClick={() => setVerifiedOnly(v => !v)}
                className="hidden lg:flex items-center gap-1"
                style={{ padding: '5px 13px', borderRadius: 99, border: 'none', cursor: 'pointer',
                         fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap',
                         background: verifiedOnly ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)',
                         color: verifiedOnly ? '#fff' : 'rgba(255,255,255,0.6)' }}
              >
                <ShieldCheck style={{ width: 12, height: 12 }} />
                {verifiedOnly ? 'Verificados ✓' : 'Verificados'}
              </button>

              {/* SOL selector — desktop only */}
              <select
                value={solFilter}
                onChange={e => setSolFilter(e.target.value)}
                className="hidden lg:block"
                style={{ marginLeft: 'auto', padding: '5px 10px', borderRadius: 8,
                         border: '1px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.1)',
                         color: '#fff', cursor: 'pointer', fontSize: 12 }}
              >
                <option value="all" style={{ color: '#000', background: '#fff' }}>Todas las solicitudes</option>
                {allRequestIds.map(id => (
                  <option key={id} value={id} style={{ color: '#000', background: '#fff' }}>{id}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '20px 16px 48px' }} className="lg:px-6">

        {filteredGroups.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <Package style={{ width: 40, height: 40, color: '#d1d5db', margin: '0 auto 12px' }} />
            <p style={{ color: '#6b7280', fontWeight: 500, fontSize: 15 }}>
              Sin ofertas para los filtros aplicados
            </p>
            <button
              onClick={() => { setStatusFilter('all'); setSortOrder('none'); setVerifiedOnly(false); setSolFilter('all'); }}
              style={{ marginTop: 12, fontSize: 13, color: '#1E5126', fontWeight: 600,
                       background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {filteredGroups.map(group => {
              const isGroupCollapsed = collapsedGroups.has(group.requestId);

              return (
                <div key={group.requestId}>

                  {/* ── Group section header ── */}
                  <button
                    type="button"
                    onClick={() => toggleGroup(group)}
                    className="w-full text-left mb-3"
                    style={{
                      background: '#fff',
                      border: '1px solid #E5E7EB',
                      borderRadius: 14,
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 14,
                      boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                    }}
                  >
                    <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 800, color: '#1E5126' }}>
                        {group.requestId}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-gray-600" style={{ minWidth: 0 }}>
                        <MapPin style={{ width: 12, height: 12, color: '#1E5126', flexShrink: 0 }} />
                        <span className="font-medium text-gray-800 truncate">{group.origin}</span>
                        <ArrowRight style={{ width: 11, height: 11, color: '#d1d5db', flexShrink: 0 }} />
                        <span className="font-medium text-gray-800 truncate">
                          {group.destination.split(' - ')[0]}
                        </span>
                      </span>
                      <span className="text-xs text-gray-400">
                        {group.heads} {group.cattleType} · {group.distance} km
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', whiteSpace: 'nowrap' }}>
                          {group.offers.length} {group.offers.length === 1 ? 'oferta' : 'ofertas'}
                        </span>
                        {group.actionCount > 0 && (
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#F58718',
                                         display: 'flex', alignItems: 'center', gap: 3, whiteSpace: 'nowrap' }}>
                            <AlertCircle style={{ width: 11, height: 11 }} />
                            {group.actionCount} tu turno
                          </span>
                        )}
                      </div>
                      <span
                        aria-hidden="true"
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          background: '#F6F1E8',
                          border: '1px solid #E5E7EB',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#6B7280',
                        }}
                      >
                        {isGroupCollapsed
                          ? <ChevronDown style={{ width: 15, height: 15 }} />
                          : <ChevronUp style={{ width: 15, height: 15 }} />
                        }
                      </span>
                    </div>
                  </button>

                  {/* ── Offer cards ── */}
                  {!isGroupCollapsed && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {group.offers.map(offer => {
                        const state        = getNegState(offer);
                        const history      = buildHistory(offer);
                        const historyLabel = getHistoryToggleLabel(offer, history.length);
                        const isHistExp    = expandedHistoryByGroup[group.requestId] === offer.id;
                        const isCountering = counteringOfferId === offer.id;
                        const isConfirming = confirmAcceptId === offer.id;
                        const showMktInfo  = marketInfoOfferId === offer.id;
                        const savings      = savingsPct(state.currentPrice, offer.marketPrice);

                        return (
                          <div
                            key={offer.id}
                            style={{
                              background: '#fff',
                              borderRadius: 14,
                              border: state.requiresAction
                                ? '1.5px solid rgba(245,135,24,0.3)'
                                : offer.status === 'accepted'
                                  ? '1.5px solid rgba(34,197,94,0.25)'
                                  : '1.5px solid #E5E7EB',
                              boxShadow: state.requiresAction
                                ? '0 2px 10px rgba(245,135,24,0.07)'
                                : '0 1px 4px rgba(0,0,0,0.04)',
                              overflow: 'hidden',
                            }}
                          >
                            {/* ── Card body ── */}
                            <div style={{ padding: '12px 14px 10px' }} className="lg:px-5 lg:pt-4">

                              {/* Row A: Transporter name + verified + price */}
                              <div style={{ display: 'flex', alignItems: 'flex-start',
                                            justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap', minWidth: 0 }}>
                                  {/* Avatar */}
                                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#1E5126',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                                    {offer.transporterName[0]}
                                  </div>
                                  <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }} className="truncate">
                                    {offer.transporterName}
                                  </span>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Star style={{ width: 11, height: 11, fill: '#FBBF24', color: '#FBBF24' }} />
                                    <span style={{ fontSize: 11, fontWeight: 600, color: '#6B7280' }}>
                                      {offer.transporterRating}
                                    </span>
                                    <span className="hidden lg:inline" style={{ fontSize: 11, color: '#9CA3AF' }}>
                                      · {offer.tripsCompleted} viajes
                                    </span>
                                  </div>
                                  {offer.verified && (
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3,
                                                   fontSize: 10, fontWeight: 700, padding: '2px 7px',
                                                   borderRadius: 99, background: 'rgba(34,197,94,0.1)', color: '#16a34a' }}>
                                      <ShieldCheck style={{ width: 10, height: 10 }} />
                                      Verificado
                                    </span>
                                  )}
                                </div>

                                {/* Current price — right aligned */}
                                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                  <div style={{ fontSize: 16, fontWeight: 800, color: '#1E5126', lineHeight: 1 }}>
                                    {fmt(state.currentPrice)}
                                  </div>
                                  <div style={{ fontSize: 11, fontWeight: 600, color: '#22C55E', marginTop: 2 }}>
                                    ↓ {savings}%
                                  </div>
                                </div>
                              </div>

                              {/* Row B: Status + round indicator + market ref */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                {/* Status badge */}
                                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px',
                                               borderRadius: 99, background: `${state.stateColor}18`,
                                               color: state.stateColor, whiteSpace: 'nowrap' }}>
                                  {state.stateLabel}
                                </span>

                                {/* Action needed */}
                                {state.requiresAction && (
                                  <span style={{ fontSize: 10, fontWeight: 700, color: '#F58718',
                                                 display: 'flex', alignItems: 'center', gap: 3 }}>
                                    <AlertCircle style={{ width: 10, height: 10 }} />
                                    Tu turno
                                  </span>
                                )}
                                {offer.status === 'you-countered' && (
                                  <span style={{ fontSize: 10, color: '#9CA3AF',
                                                 display: 'flex', alignItems: 'center', gap: 3 }}>
                                    <Clock style={{ width: 10, height: 10 }} />
                                    Esperando
                                  </span>
                                )}

                                {/* Round dots */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginLeft: 2 }}>
                                  {[1, 2, 3].map(r => (
                                    <div key={r} style={{ width: 6, height: 6, borderRadius: '50%',
                                                          background: r <= offer.negotiationRound ? '#1E5126' : '#E5E7EB' }} />
                                  ))}
                                  <span style={{ fontSize: 10, color: '#9CA3AF', marginLeft: 3 }}>
                                    {offer.negotiationRound}/3
                                  </span>
                                </div>

                                {/* Market ref with info icon */}
                                <div style={{ position: 'relative', marginLeft: 'auto' }}>
                                  <button
                                    onClick={() => setMarketInfoOfferId(showMktInfo ? null : offer.id)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                                             display: 'flex', alignItems: 'center', gap: 3,
                                             fontSize: 10, color: '#9CA3AF' }}
                                  >
                                    Ref. {fmt(offer.marketPrice)}
                                    <Info style={{ width: 10, height: 10 }} />
                                  </button>
                                  {showMktInfo && (
                                    <div style={{ position: 'absolute', bottom: '100%', right: 0, marginBottom: 6,
                                                  width: 200, padding: '10px 12px', borderRadius: 10, zIndex: 20,
                                                  background: '#fff', border: '1px solid #E5E7EB',
                                                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)', fontSize: 11, color: '#6B7280' }}>
                                      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                        <p style={{ margin: 0, lineHeight: 1.5 }}>
                                          Referencia informativa. Esta estimación no forma parte del MVP final.
                                        </p>
                                        <button onClick={() => setMarketInfoOfferId(null)}
                                                style={{ background: 'none', border: 'none', cursor: 'pointer',
                                                         color: '#9CA3AF', flexShrink: 0, padding: 0 }}>
                                          <X style={{ width: 11, height: 11 }} />
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>

                              </div>

                              {historyLabel && (
                                <button
                                  type="button"
                                  onClick={() => toggleHistory(group.requestId, offer.id)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0 0',
                                           display: 'flex', alignItems: 'center', gap: 3,
                                           fontSize: 11, fontWeight: 600,
                                           color: isHistExp ? '#1E5126' : '#6B7280' }}
                                >
                                  {isHistExp
                                    ? <><ChevronUp style={{ width: 12, height: 12 }} />Ocultar historial</>
                                    : <><ChevronDown style={{ width: 12, height: 12 }} />{historyLabel}</>
                                  }
                                </button>
                              )}
                            </div>

                            {/* ── Collapsible history ── */}
                            {isHistExp && historyLabel && (
                              <div style={{ padding: '0 14px 10px' }} className="lg:px-5">
                                <div style={{ borderTop: '1px solid #F0F0F0', paddingTop: 10,
                                              display: 'flex', flexDirection: 'column', gap: 6 }}>
                                  {history.map((item, i) => {
                                    const isTr = item.from === 'transportista';
                                    return (
                                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10,
                                                            padding: '8px 12px', borderRadius: 10,
                                                            background: isTr ? 'rgba(30,81,38,0.05)' : 'rgba(245,135,24,0.06)',
                                                            border: `1px solid ${isTr ? 'rgba(30,81,38,0.1)' : 'rgba(245,135,24,0.15)'}` }}>
                                        <div style={{ width: 20, height: 20, borderRadius: '50%',
                                                      background: isTr ? '#1E5126' : '#F58718',
                                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                      color: '#fff', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                                          {item.round}
                                        </div>
                                        <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0, flex: 1 }}>
                                          {item.label}
                                        </p>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                                          <span style={{ fontWeight: 700, fontSize: 13, color: '#111827' }}>
                                            {fmt(item.price)}
                                          </span>
                                          {i === history.length - 1 && (
                                            <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px',
                                                           borderRadius: 4, background: 'rgba(30,81,38,0.08)', color: '#1E5126' }}>
                                              actual
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* ── Inline counteroffer ── */}
                            {isCountering && (
                              <div style={{ padding: '0 14px 14px' }} className="lg:px-5">
                                <div style={{ padding: 14, borderRadius: 12, background: '#F6F1E8',
                                              border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: '#111827' }}>
                                      Tu contraoferta
                                    </p>
                                    <button onClick={cancelCounter}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                      <X style={{ width: 14, height: 14, color: '#9CA3AF' }} />
                                    </button>
                                  </div>
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                    <div>
                                      <p style={{ margin: '0 0 2px', fontSize: 10, color: '#9CA3AF' }}>Precio actual</p>
                                      <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: '#111827' }}>{fmt(state.currentPrice)}</p>
                                    </div>
                                    <div>
                                      <p style={{ margin: '0 0 2px', fontSize: 10, color: '#9CA3AF' }}>Ref. mercado</p>
                                      <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: '#111827' }}>{fmt(offer.marketPrice)}</p>
                                    </div>
                                  </div>
                                  <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                                                   fontWeight: 700, color: '#9CA3AF', fontSize: 16, userSelect: 'none' }}>₲</span>
                                    <input
                                      type="text" inputMode="numeric" autoFocus
                                      value={counterOfferAmount ? new Intl.NumberFormat('es-PY').format(Number(counterOfferAmount)) : ''}
                                      onChange={e => setCounterOfferAmount(e.target.value.replace(/\D/g, ''))}
                                      placeholder={new Intl.NumberFormat('es-PY').format(Math.round(state.currentPrice * 0.95))}
                                      style={{ width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 10, paddingBottom: 10,
                                               borderRadius: 10, border: `2px solid ${counterOfferAmount ? '#1E5126' : '#E5E7EB'}`,
                                               fontSize: 16, fontWeight: 700, outline: 'none', boxSizing: 'border-box',
                                               background: '#fff', transition: 'border-color 0.15s' }}
                                    />
                                  </div>
                                  {counterOfferAmount && Number(counterOfferAmount) > 0 && (
                                    <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#22C55E' }}>
                                      Ahorrás {savingsPct(Number(counterOfferAmount), offer.marketPrice)}% vs referencia
                                    </p>
                                  )}
                                  {state.isFinalRound && (
                                    <p style={{ margin: 0, fontSize: 11, color: '#B45309', background: '#FEF9C3',
                                                padding: '6px 10px', borderRadius: 8 }}>
                                      Esta será la ronda final — el transportista dará la última respuesta.
                                    </p>
                                  )}
                                  <div style={{ display: 'flex', gap: 8 }}>
                                    <button
                                      onClick={() => handleSendCounter(offer)}
                                      disabled={!counterOfferAmount}
                                      style={{ flex: 1, padding: '9px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                                               fontWeight: 700, fontSize: 13, color: '#fff', background: '#1E5126',
                                               opacity: counterOfferAmount ? 1 : 0.4, transition: 'opacity 0.15s' }}
                                    >
                                      Enviar contraoferta
                                    </button>
                                    <button
                                      onClick={cancelCounter}
                                      style={{ padding: '9px 14px', borderRadius: 10, border: '1px solid #E5E7EB',
                                               background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13, color: '#6B7280' }}
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* ── Inline accept confirmation ── */}
                            {isConfirming && !isCountering && (
                              <div style={{ padding: '0 14px 14px' }} className="lg:px-5">
                                <div style={{ padding: 14, borderRadius: 12,
                                              background: 'rgba(30,81,38,0.05)', border: '1px solid rgba(30,81,38,0.15)',
                                              display: 'flex', flexDirection: 'column', gap: 10 }}>
                                  <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: '#111827' }}>
                                    Confirmar aceptación
                                  </p>
                                  <p style={{ margin: 0, fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>
                                    Aceptás la oferta de <strong>{offer.transporterName}</strong> por{' '}
                                    <strong>{fmt(state.currentPrice)}</strong>.
                                    El transportista será asignado a tu viaje.
                                  </p>
                                  <div style={{ display: 'flex', gap: 8 }}>
                                    <button
                                      onClick={() => handleAccept(offer)}
                                      style={{ flex: 1, padding: '9px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                                               fontWeight: 700, fontSize: 13, color: '#fff', background: '#1E5126' }}
                                    >
                                      Confirmar y aceptar
                                    </button>
                                    <button
                                      onClick={() => setConfirmAcceptId(null)}
                                      style={{ padding: '9px 14px', borderRadius: 10, border: '1px solid #E5E7EB',
                                               background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13, color: '#6B7280' }}
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* ── Action footer ── */}
                            {offer.status !== 'accepted' && !isCountering && !isConfirming && (
                              <div style={{ padding: '8px 14px 10px', background: '#FAFAFA',
                                            borderTop: '1px solid #F0F0F0',
                                            display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}
                                   className="lg:px-5">
                                {offer.status === 'you-countered' ? (
                                  <p style={{ margin: 0, fontSize: 12, color: '#9CA3AF',
                                              display: 'flex', alignItems: 'center', gap: 5 }}>
                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#D1D5DB' }} />
                                    Esperando respuesta de{' '}
                                    <span style={{ fontWeight: 600, color: '#6B7280' }}>
                                      {offer.transporterName.split(' ')[0]}
                                    </span>
                                  </p>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => { setConfirmAcceptId(offer.id); setCounteringOfferId(null); }}
                                      style={{ display: 'flex', alignItems: 'center', gap: 6,
                                               padding: '7px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
                                               fontWeight: 700, fontSize: 12, color: '#fff', background: '#1E5126' }}
                                    >
                                      <CheckCircle2 style={{ width: 14, height: 14 }} />
                                      Aceptar oferta
                                    </button>

                                    {state.canCounter && (
                                      <button
                                        onClick={() => startCounter(offer.id)}
                                        style={{ display: 'flex', alignItems: 'center', gap: 6,
                                                 padding: '7px 14px', borderRadius: 10, cursor: 'pointer',
                                                 fontWeight: 700, fontSize: 12,
                                                 color: '#1E5126', background: 'transparent',
                                                 border: '1.5px solid #1E5126' }}
                                      >
                                        Contraofertar
                                      </button>
                                    )}

                                    {!state.canCounter && state.isFinalRound && (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 5,
                                                    padding: '5px 10px', borderRadius: 8, fontSize: 11,
                                                    background: 'rgba(245,135,24,0.08)', color: '#92400e' }}>
                                        <AlertCircle style={{ width: 12, height: 12, color: '#F58718', flexShrink: 0 }} />
                                        Oferta final · sin más contraofertas
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            )}

                            {/* ── Accepted footer ── */}
                            {offer.status === 'accepted' && (
                              <div style={{ padding: '8px 14px 10px',
                                            background: 'rgba(34,197,94,0.06)', borderTop: '1px solid rgba(34,197,94,0.15)',
                                            display: 'flex', alignItems: 'center', gap: 6 }}
                                   className="lg:px-5">
                                <CheckCircle2 style={{ width: 14, height: 14, color: '#22C55E' }} />
                                <span style={{ fontSize: 12, fontWeight: 600, color: '#16a34a' }}>
                                  Oferta aceptada
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
