import { useState } from 'react';
import {
  X, Star, MapPin, ArrowRight, CheckCircle2, AlertCircle,
  ShieldCheck, ChevronDown, ChevronUp, Info,
} from 'lucide-react';

interface OfferDetails {
  offerId: string;
  solId: string;
  transporterName: string;
  transporterRating: number;
  transporterTrips: number;
  verified?: boolean;
  origin: string;
  destination: string;
  cattleType: string;
  heads: number;
  distance: number;
  currentPrice: number;
  marketPrice: number;
  status: string;
  negotiationHistory: {
    round: number;
    from: 'transportista' | 'ganadero';
    price: number;
    label: string;
  }[];
  currentRound: number;
  maxRounds: number;
}

interface RancherOfferDetailModalProps {
  offerId: string;
  onClose: () => void;
  onAccept?: (offerId: string) => void;
}

const fmt = (n: number) => '₲ ' + new Intl.NumberFormat('es-PY').format(n);
const savingsPct = (cur: number, mkt: number) => Math.round(((mkt - cur) / mkt) * 100);

import { toast } from 'sonner';
export function RancherOfferDetailModal({ offerId, onClose, onAccept }: RancherOfferDetailModalProps) {
  const [counterOfferAmount, setCounterOfferAmount] = useState('');
  const [showCounterInput, setShowCounterInput] = useState(false);
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [showMarketInfo, setShowMarketInfo] = useState(false);
  const [confirmAccept, setConfirmAccept] = useState(false);

  const offersData: Record<string, OfferDetails> = {
    'OFFER-SOL-001-1': {
      offerId: 'OFFER-SOL-001-1',
      solId: 'SOL-001',
      transporterName: 'Transporte González S.A.',
      transporterRating: 4.8,
      transporterTrips: 142,
      verified: true,
      origin: 'Filadelfia',
      destination: 'Asunción - Frigorífico Central',
      cattleType: 'Gordos',
      heads: 45,
      distance: 480,
      currentPrice: 2800000,
      marketPrice: 3200000,
      status: 'nueva-oferta',
      negotiationHistory: [
        { round: 1, from: 'transportista', price: 2800000, label: 'Oferta inicial del transportista' },
      ],
      currentRound: 1,
      maxRounds: 3,
    },
    'OFFER-SOL-001-2': {
      offerId: 'OFFER-SOL-001-2',
      solId: 'SOL-001',
      transporterName: 'Carlos Méndez',
      transporterRating: 4.6,
      transporterTrips: 89,
      verified: true,
      origin: 'Filadelfia',
      destination: 'Asunción - Frigorífico Central',
      cattleType: 'Gordos',
      heads: 45,
      distance: 480,
      currentPrice: 2700000,
      marketPrice: 3200000,
      status: 'contraoferta-recibida',
      negotiationHistory: [
        { round: 1, from: 'transportista', price: 3000000, label: 'Oferta inicial del transportista' },
        { round: 2, from: 'ganadero', price: 2600000, label: 'Tu contraoferta' },
        { round: 3, from: 'transportista', price: 2700000, label: 'Respuesta final del transportista' },
      ],
      currentRound: 3,
      maxRounds: 3,
    },
    'OFFER-SOL-002-1': {
      offerId: 'OFFER-SOL-002-1',
      solId: 'SOL-002',
      transporterName: 'Flota del Chaco',
      transporterRating: 4.9,
      transporterTrips: 213,
      verified: true,
      origin: 'Loma Plata',
      destination: 'Concepción - Matadero Municipal',
      cattleType: 'Novillos',
      heads: 32,
      distance: 320,
      currentPrice: 1800000,
      marketPrice: 2100000,
      status: 'nueva-oferta',
      negotiationHistory: [
        { round: 1, from: 'transportista', price: 1800000, label: 'Oferta inicial del transportista' },
      ],
      currentRound: 1,
      maxRounds: 3,
    },
  };

  const offer = offersData[offerId];
  if (!offer) return null;

  const canCounter = offer.currentRound < offer.maxRounds;
  const isFinalRound = offer.currentRound >= offer.maxRounds;
  const savings = savingsPct(offer.currentPrice, offer.marketPrice);

  const isNewOffer = offer.status === 'nueva-oferta';
  const statusLabel = isNewOffer ? 'Nueva oferta' : 'Contraoferta recibida';
  const statusColor = isNewOffer ? '#F58718' : '#F58718';

  const handleAccept = () => {
    if (onAccept) onAccept(offerId);
    toast.success(`¡Oferta aceptada! ${offer.transporterName} fue asignado al viaje.`);
    onClose();
  };

  const handleSendCounter = () => {
    const amount = parseInt(counterOfferAmount, 10);
    if (!amount || amount <= 0) return;
    toast.success(`Contraoferta de ${fmt(amount)} enviada a ${offer.transporterName}`);
    setShowCounterInput(false);
    setCounterOfferAmount('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto my-4"
        style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
      >
        {/* ── Sticky header ── */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <span
              className="font-mono text-base font-bold px-2.5 py-1 rounded-lg"
              style={{ backgroundColor: 'rgba(30,81,38,0.08)', color: '#1E5126' }}
            >
              {offer.solId}
            </span>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: `${statusColor}18`, color: statusColor }}
            >
              {statusLabel}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">

          {/* ── Transporter info ── */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-base font-bold flex-shrink-0"
              style={{ backgroundColor: '#1E5126' }}
            >
              {offer.transporterName[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-gray-900">{offer.transporterName}</span>
                {offer.verified && (
                  <span
                    className="flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#16a34a' }}
                  >
                    <ShieldCheck className="w-3 h-3" />
                    Verificado
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-400 mt-0.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-medium">{offer.transporterRating}</span>
                <span>· {offer.transporterTrips} viajes completados</span>
              </div>
            </div>
          </div>

          {/* ── Route & cargo ── */}
          <div className="rounded-2xl p-4" style={{ backgroundColor: '#F6F1E8' }}>
            <div className="flex items-center gap-2 text-sm flex-wrap mb-2">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#1E5126' }} />
              <span className="font-semibold text-gray-900">{offer.origin}</span>
              <ArrowRight className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
              <MapPin className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
              <span className="font-semibold text-gray-900">{offer.destination}</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>{offer.heads} cabezas · {offer.cattleType}</span>
              <span>·</span>
              <span>{offer.distance} km</span>
            </div>
          </div>

          {/* ── Price hero ── */}
          <div className="rounded-2xl p-5" style={{ backgroundColor: '#1E5126' }}>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  Precio actual de la oferta
                </p>
                <p className="text-3xl font-bold text-white">{fmt(offer.currentPrice)}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold" style={{ color: '#22C55E' }}>↓ {savings}%</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>vs mercado</p>
              </div>
            </div>

            {/* Market reference */}
            <div
              className="mt-4 pt-3 flex items-center gap-2"
              style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
            >
              <p className="text-xs flex-1" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Ref. mercado: {fmt(offer.marketPrice)} · Ahorrás {fmt(offer.marketPrice - offer.currentPrice)}
              </p>
              <div className="relative">
                <button
                  onClick={() => setShowMarketInfo(v => !v)}
                  className="flex items-center gap-1 text-xs"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
                {showMarketInfo && (
                  <div
                    className="absolute bottom-full right-0 mb-1.5 w-52 p-3 rounded-xl text-xs text-gray-600 z-20 shadow-lg"
                    style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p>Referencia informativa. Esta estimación no forma parte del MVP final.</p>
                      <button onClick={() => setShowMarketInfo(false)} className="flex-shrink-0 mt-0.5">
                        <X className="w-3 h-3 text-gray-400" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Round progress ── */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3].map(r => (
                <div
                  key={r}
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: r <= offer.currentRound ? '#1E5126' : '#E5E7EB' }}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">
              Ronda {offer.currentRound} de {offer.maxRounds}
            </span>
            {isFinalRound && (
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'rgba(245,135,24,0.1)', color: '#F58718' }}
              >
                Ronda final
              </span>
            )}
          </div>
          {canCounter && (
            <p className="text-xs text-gray-400 mt-1">
              {offer.maxRounds - offer.currentRound === 1
                ? 'Te queda 1 contraoferta antes de la ronda final.'
                : `Te quedan ${offer.maxRounds - offer.currentRound} contraofertas.`}
            </p>
          )}

          {/* ── Negotiation history (collapsible) ── */}
          {offer.negotiationHistory.length > 0 && (
            <div>
              <button
                onClick={() => setHistoryExpanded(v => !v)}
                className="flex items-center gap-2 text-sm font-semibold w-full text-left mb-2"
                style={{ color: '#1E5126' }}
              >
                {historyExpanded
                  ? <ChevronUp className="w-4 h-4" />
                  : <ChevronDown className="w-4 h-4" />
                }
                Historial de negociación ({offer.negotiationHistory.length} ronda{offer.negotiationHistory.length !== 1 ? 's' : ''})
              </button>

              {historyExpanded && (
                <div className="space-y-2">
                  {offer.negotiationHistory.map((item, i) => {
                    const isTransporter = item.from === 'transportista';
                    const isLast = i === offer.negotiationHistory.length - 1;
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl"
                        style={{
                          backgroundColor: isTransporter ? 'rgba(30,81,38,0.05)' : 'rgba(245,135,24,0.06)',
                          border: `1px solid ${isTransporter ? 'rgba(30,81,38,0.1)' : 'rgba(245,135,24,0.15)'}`,
                        }}
                      >
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: isTransporter ? '#1E5126' : '#F58718' }}
                        >
                          {item.round}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500">{item.label}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="font-bold text-gray-900">{fmt(item.price)}</span>
                          {isLast && (
                            <span
                              className="text-xs font-semibold px-1.5 py-0.5 rounded"
                              style={{ backgroundColor: 'rgba(30,81,38,0.08)', color: '#1E5126' }}
                            >
                              actual
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Inline counteroffer ── */}
          {showCounterInput && (
            <div
              className="p-4 rounded-2xl space-y-3"
              style={{ backgroundColor: '#F6F1E8', border: '1px solid #E5E7EB' }}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-gray-900">Tu contraoferta</p>
                <button onClick={() => { setShowCounterInput(false); setCounterOfferAmount(''); }}>
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
                <div>
                  <p className="mb-0.5">Precio actual</p>
                  <p className="font-bold text-sm text-gray-900">{fmt(offer.currentPrice)}</p>
                </div>
                <div>
                  <p className="mb-0.5">Referencia de mercado</p>
                  <p className="font-bold text-sm text-gray-900">{fmt(offer.marketPrice)}</p>
                </div>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-base select-none">₲</span>
                <input
                  type="text"
                  inputMode="numeric"
                  autoFocus
                  value={counterOfferAmount
                    ? new Intl.NumberFormat('es-PY').format(Number(counterOfferAmount))
                    : ''}
                  onChange={e => setCounterOfferAmount(e.target.value.replace(/\D/g, ''))}
                  placeholder={new Intl.NumberFormat('es-PY').format(Math.round(offer.currentPrice * 0.95))}
                  className="w-full pl-8 pr-4 py-3 rounded-xl border-2 text-base font-bold focus:outline-none transition-colors"
                  style={{
                    borderColor: counterOfferAmount ? '#1E5126' : '#E5E7EB',
                    backgroundColor: '#FFFFFF',
                  }}
                />
              </div>
              {counterOfferAmount && Number(counterOfferAmount) > 0 && (
                <p className="text-xs font-medium" style={{ color: '#22C55E' }}>
                  Ahorrás {savingsPct(Number(counterOfferAmount), offer.marketPrice)}% vs referencia de mercado
                </p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleSendCounter}
                  disabled={!counterOfferAmount}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-40"
                  style={{ backgroundColor: '#1E5126' }}
                >
                  Enviar contraoferta
                </button>
                <button
                  onClick={() => { setShowCounterInput(false); setCounterOfferAmount(''); }}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-500"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* ── Accept confirmation ── */}
          {confirmAccept && (
            <div
              className="p-4 rounded-2xl"
              style={{ backgroundColor: 'rgba(30,81,38,0.05)', border: '1px solid rgba(30,81,38,0.15)' }}
            >
              <p className="text-sm font-bold text-gray-900 mb-1">Confirmar aceptación</p>
              <p className="text-xs text-gray-600 mb-3">
                Aceptás la oferta de <strong>{offer.transporterName}</strong> por{' '}
                <strong>{fmt(offer.currentPrice)}</strong>. El transportista será asignado al viaje.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleAccept}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{ backgroundColor: '#1E5126' }}
                >
                  <CheckCircle2 className="w-4 h-4 inline mr-1" />
                  Confirmar y aceptar
                </button>
                <button
                  onClick={() => setConfirmAccept(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-500"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* ── Primary actions ── */}
          {!showCounterInput && !confirmAccept && (
            <div className="space-y-2 pt-1">
              <button
                onClick={() => setConfirmAccept(true)}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
                style={{ backgroundColor: '#1E5126' }}
              >
                <CheckCircle2 className="w-4 h-4" />
                Aceptar oferta
              </button>

              {canCounter && (
                <button
                  onClick={() => setShowCounterInput(true)}
                  className="w-full py-3.5 rounded-xl text-sm font-bold border-2 flex items-center justify-center gap-2 transition-colors"
                  style={{ borderColor: '#1E5126', color: '#1E5126' }}
                >
                  Contraofertar
                </button>
              )}

              {!canCounter && (
                <div
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                  style={{ backgroundColor: 'rgba(245,135,24,0.08)', color: '#92400e' }}
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#F58718' }} />
                  Ronda máxima alcanzada — solo podés aceptar o rechazar
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
