import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { MapPin, Clock, TrendingUp, TrendingDown, CheckCircle2, X } from 'lucide-react';
import { MAX_NEGOTIATION_ROUNDS } from '../../config/business';

interface NegotiationHistory {
  round: number;
  roundLabel: string;
  actor: 'rancher' | 'transporter';
  amount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'countered';
  timeRemaining?: string;
  timestamp: string;
}

interface NegotiationFlowProps {
  tripId: string;
  userType: 'rancher' | 'transporter';
  basePrice: number;
  currentRound: number;
  negotiationHistory: NegotiationHistory[];
  onAccept: () => void;
  onReject: () => void;
  onCounterOffer: (amount: number) => void;
  onBack: () => void;
}

export function NegotiationFlow({ 
  tripId, 
  userType, 
  basePrice,
  currentRound,
  negotiationHistory,
  onAccept,
  onReject,
  onCounterOffer,
  onBack
}: NegotiationFlowProps) {
  const [counterOfferAmount, setCounterOfferAmount] = useState('');

  const formatPrice = (price: number) => {
    return '₲ ' + new Intl.NumberFormat('es-PY').format(price);
  };

  const formatNumber = (num: string) => {
    const cleaned = num.replace(/\D/g, '');
    return new Intl.NumberFormat('es-PY').format(Number(cleaned) || 0);
  };

  const handleCounterOfferChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    setCounterOfferAmount(cleaned);
  };

  const handleSendCounterOffer = () => {
    const amount = Number(counterOfferAmount);
    if (amount > 0) {
      onCounterOffer(amount);
      setCounterOfferAmount('');
    }
  };

  // Mock data for demo - latest active offer
  const activeOffer = {
    round: 1,
    roundLabel: 'Ronda 1: Oferta Inicial',
    actor: 'transporter' as const,
    amount: 6500000,
    status: 'pending' as const,
    timeRemaining: '23:45:12'
  };

  const priceComparison = activeOffer.amount - basePrice;
  const isHigher = priceComparison > 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">Pendiente</span>;
      case 'accepted':
        return <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">Aceptada</span>;
      case 'rejected':
        return <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">Rechazada</span>;
      case 'expired':
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-full">Expirada</span>;
      case 'countered':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">Contraoferta enviada</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F6F1E8' }}>
      {/* HEADER */}
      <div className="bg-white px-4 lg:px-6 py-4" style={{ borderBottom: '2px solid #1E5126' }}>
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold">Sistema de Negociación</h1>
            <button
              onClick={onBack}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Volver
            </button>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>Filadelfia → Asunción</span>
          </div>
          <div className="flex gap-6 mt-2 text-xs text-gray-500">
            <span>🐄 120 cabezas · Gordos · Peso aprox.: 380 kg/animal</span>
            <span>📅 Carga: 28/03/2026</span>
            <span>⭐ Transportista: 4.8 calificación</span>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 lg:px-6 py-8 space-y-6">
          
          {/* PRECIO BASE REFERENCE */}
          <div className="rounded-lg p-6" style={{ backgroundColor: '#E8E3DB', border: '1px solid #d4c9b8' }}>
            <div className="text-sm text-gray-600 mb-1">Precio base estimado</div>
            <div className="text-3xl font-bold text-gray-900">
              {formatPrice(basePrice)}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Este es solo un estimado. El precio final se negocia entre las partes.
            </div>
          </div>

          {/* HISTORIAL */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm text-gray-700">
              Historial de Negociación
            </h3>

            {/* CARD DE RONDA ACTIVA */}
            <div className="bg-white rounded-lg p-6" style={{ border: '2px solid #1E5126' }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{activeOffer.roundLabel}</span>
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded">
                      {activeOffer.actor === 'transporter' ? '🚛 Transportista' : '🐄 Ganadero'}
                    </span>
                  </div>
                  <div className="text-2xl font-bold" style={{ color: '#1E5126' }}>
                    {formatPrice(activeOffer.amount)}
                  </div>
                </div>
                {getStatusBadge(activeOffer.status)}
              </div>

              <div className={`flex items-center gap-1 text-sm mb-3 ${isHigher ? 'text-red-600' : 'text-green-600'}`}>
                {isHigher ? (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    <span>+{formatPrice(Math.abs(priceComparison))} vs precio base</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4" />
                    <span>-{formatPrice(Math.abs(priceComparison))} vs precio base</span>
                  </>
                )}
              </div>

              {activeOffer.timeRemaining && (
                <div className="border-t border-gray-200 pt-3 mb-3"></div>
              )}
              {activeOffer.timeRemaining && (
                <div style={{ backgroundColor: '#f59e0b20', border: '1px solid #f59e0b40', borderRadius: '8px', padding: '8px 12px' }} className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-semibold text-amber-700">Expira en:</span>
                  <span className="font-mono font-bold text-amber-800">{activeOffer.timeRemaining}</span>
                </div>
              )}
            </div>

            {/* OFERTAS ANTERIORES (si hay) */}
            {negotiationHistory.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-gray-500 uppercase">Ofertas anteriores</h4>
                {negotiationHistory.map((offer, index) => {
                  const getBorderColor = (status: string) => {
                    switch (status) {
                      case 'accepted':
                        return '4px solid #1E5126';
                      case 'rejected':
                        return '4px solid #dc2626';
                      case 'countered':
                        return '4px solid #1E5126';
                      case 'expired':
                        return '4px solid #6b7280';
                      case 'pending':
                        return '4px solid #f59e0b';
                      default:
                        return '4px solid transparent';
                    }
                  };

                  return (
                    <div key={index} className="bg-white rounded-lg border border-gray-200 p-5" style={{ borderLeft: getBorderColor(offer.status) }}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium">{offer.roundLabel}</span>
                            <span className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded">
                              {offer.actor === 'transporter' ? '🚛 Transportista' : '🐄 Ganadero'}
                            </span>
                          </div>
                          <div className="text-lg font-bold text-gray-900">{formatPrice(offer.amount)}</div>
                          <div className="text-xs text-gray-500 mt-1">{offer.timestamp}</div>
                        </div>
                        <div>
                          {getStatusBadge(offer.status)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ÁREA DE ACCIÓN */}
          {userType === 'rancher' && activeOffer.status === 'pending' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="font-semibold mb-4">Tu respuesta (como Ganadero)</h3>

              {/* Resumen del viaje */}
              <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: '#E8E3DB', border: '1px solid #d4c9b8' }}>
                <div className="text-sm font-semibold text-black mb-3">Resumen del viaje</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-500">Origen → Destino</div>
                    <div className="text-sm font-medium text-black">Filadelfia → Asunción</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Cabezas</div>
                    <div className="text-sm font-medium text-black">120</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Precio ofrecido</div>
                    <div className="text-sm font-medium" style={{ color: '#1E5126', fontWeight: 700 }}>
                      {formatPrice(activeOffer.amount)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Precio base</div>
                    <div className="text-sm font-medium text-black">{formatPrice(basePrice)}</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mb-4">
                <Button
                  className="flex-1"
                  style={{ backgroundColor: '#1E5126' }}
                  onClick={onAccept}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Aceptar {formatPrice(activeOffer.amount)}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
                  onClick={onReject}
                >
                  <X className="w-4 h-4 mr-2" />
                  Rechazar
                </Button>
              </div>

              <div className="space-y-3">
                <div className="text-sm text-gray-600">O hacé una contraoferta:</div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      type="text"
                      value={counterOfferAmount ? formatNumber(counterOfferAmount) : ''}
                      onChange={(e) => handleCounterOfferChange(e.target.value)}
                      placeholder="Ingresá tu contraoferta"
                      className="text-lg"
                    />
                    {counterOfferAmount && (
                      <p className="text-xs text-gray-500 mt-1">
                        = {formatPrice(Number(counterOfferAmount))}
                      </p>
                    )}
                    {/* Sugerencias de contraoferta */}
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => setCounterOfferAmount(String(Math.round(activeOffer.amount * 0.90)))}
                        className="text-xs px-3 py-1 rounded-full border border-gray-300 hover:bg-gray-100"
                      >
                        -10% ({formatPrice(Math.round(activeOffer.amount * 0.90))})
                      </button>
                      <button
                        onClick={() => setCounterOfferAmount(String(Math.round(activeOffer.amount * 0.95)))}
                        className="text-xs px-3 py-1 rounded-full border border-gray-300 hover:bg-gray-100"
                      >
                        -5% ({formatPrice(Math.round(activeOffer.amount * 0.95))})
                      </button>
                      <button
                        onClick={() => setCounterOfferAmount(String(basePrice))}
                        className="text-xs px-3 py-1 rounded-full border border-gray-300 hover:bg-gray-100"
                      >
                        Precio base ({formatPrice(basePrice)})
                      </button>
                    </div>
                  </div>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={handleSendCounterOffer}
                    disabled={!counterOfferAmount || Number(counterOfferAmount) === 0}
                  >
                    Enviar
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Formato: solo números. Ej: 6200000
                </p>
              </div>
            </div>
          )}

          {/* INFO BOX */}
          <div className="rounded-lg p-4" style={{ backgroundColor: '#E8E3DB', border: '1px solid #d4c9b8' }}>
            <p className="font-semibold text-sm mb-2">📋 Proceso de negociación:</p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Transportista hace oferta inicial (24h para responder)</li>
              <li>Ganadero puede aceptar o hacer contraoferta (24h para responder)</li>
              <li>Transportista puede hacer ajuste final</li>
              <li>Ganadero acepta o rechaza (decisión final)</li>
            </ol>
          </div>

          {/* PROGRESS INDICATOR */}
          <div className="rounded-lg p-4" style={{ backgroundColor: '#1E512610', border: '1px solid #1E512640' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold" style={{ color: '#1E5126' }}>Progreso de negociación</span>
              <span className="text-xs px-3 py-1 rounded-full font-semibold" style={{ backgroundColor: '#1E512620', color: '#1E5126' }}>
                Ronda {currentRound} de {MAX_NEGOTIATION_ROUNDS}
              </span>
            </div>
            <div className="flex gap-2">
              {Array.from({ length: MAX_NEGOTIATION_ROUNDS }, (_, i) => i + 1).map((round) => (
                <div
                  key={round}
                  className="h-2 flex-1 rounded-full"
                  style={{ backgroundColor: round <= currentRound ? '#1E5126' : '#1E512630' }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
