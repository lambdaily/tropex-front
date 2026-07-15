// Detalle de una solicitud del marketplace (empresa / owner-operator).
// Backdrop liviano (verde noche translúcido + blur) que deja ver el fondo atenuado,
// layout compacto a 2 columnas en desktop (sin scroll), con el mapa siempre presente.
import { X, Star, ShieldCheck, MapPin, MessageSquare, DollarSign, Check, Share2, TrendingUp } from 'lucide-react';
import { useIsMobile } from '../ui/use-mobile';
import { MapView } from '../MapView';
import { coordsForCity } from '../../data/paraguay-locations';
import { formatPrice } from '../../utils/format';

const V = '#1E5126', N = '#F58718', INK = '#0c1f17', GRY = '#6B7280', GRY2 = '#9CA3AF', BRD = 'rgba(0,0,0,0.08)';
const DISPLAY = "'Space Grotesk', system-ui, sans-serif";
const BODY = "'IBM Plex Sans', system-ui, sans-serif";

interface Props {
  trip: any;
  userType: string;
  acceptedTripId: string | null;
  onClose: () => void;
  onMakeBid: (trip: any, guideNumber?: 1 | 2) => void;
  onBothGuides: (trip: any) => void;
  onAcceptCounter: (trip: any) => void;
  onWhatsApp: (trip: any) => void;
  onShare: (trip: any) => void;
  onCounterFinal: () => void;
  canNegotiate: (trip: any) => boolean;
}

function Cell({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 10.5, color: GRY2, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: INK, fontFamily: mono ? 'monospace' : BODY, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
    </div>
  );
}

function RutaPunto({ color, label, name, coords }: { color: string; label: string; name: string; coords?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9, minWidth: 0 }}>
      <span style={{ width: 9, height: 9, borderRadius: '50%', background: color, flexShrink: 0, marginTop: 4 }} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: INK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
        {coords && <div style={{ fontSize: 11, color: GRY2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{coords}</div>}
      </div>
    </div>
  );
}

export function SolicitudDetailModal({ trip, userType, acceptedTripId, onClose, onMakeBid, onBothGuides, onAcceptCounter, onWhatsApp, onShare, onCounterFinal, canNegotiate }: Props) {
  const isMobile = useIsMobile();
  const o = coordsForCity(trip.origin);
  const d = coordsForCity(trip.destination);
  const accepted = acceptedTripId === trip.id;
  const splitGuides = trip.guides && trip.guides.length > 1;

  const ganadero = (
    <div style={{ background: `${V}0a`, border: `1px solid ${V}26`, borderRadius: 12, padding: '12px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 9 }}>
        <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 13.5, color: INK }}>Información del ganadero</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Star style={{ width: 14, height: 14, fill: '#F5B301', color: '#F5B301' }} />
          <span style={{ fontWeight: 800, fontSize: 13, color: INK }}>{trip.rancherRating?.toFixed(1)}</span>
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 14.5, fontWeight: 800, color: INK }}>{trip.rancherName}</div>
        {trip.verified && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 700, color: V, background: `${V}14`, padding: '2px 9px', borderRadius: 99 }}>
            <ShieldCheck style={{ width: 12, height: 12 }} /> Verificado · SENACSA
          </span>
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
        <Cell label="Establecimiento" value={trip.establishmentName} />
        <Cell label="Código SENACSA" value={trip.establishmentCode} mono />
      </div>
      <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${V}1f` }}>
        {accepted ? (
          <button onClick={() => onWhatsApp(trip)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#25D366', color: '#fff', border: 'none', borderRadius: 9, padding: '8px 13px', fontFamily: BODY, fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>
            <MessageSquare style={{ width: 14, height: 14 }} /> Coordinar por WhatsApp
          </button>
        ) : (
          <span style={{ fontSize: 12, color: GRY2, fontStyle: 'italic' }}>El contacto del ganadero se habilita al aceptar la oferta.</span>
        )}
      </div>
    </div>
  );

  const ganado = (
    <div style={{ border: `1px solid ${BRD}`, borderRadius: 12, padding: '12px 14px' }}>
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 13.5, color: INK, marginBottom: 10 }}>Detalles del ganado</div>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr', gap: 11 }}>
        <Cell label="Tipo" value={trip.cattleType} />
        <Cell label="Cabezas" value={trip.heads} />
        <Cell label="Peso" value={`${trip.estimatedWeight || 380} kg`} />
        <Cell label="Retiro" value={trip.pickupDate} />
        <Cell label="Hora" value={trip.pickupTime} />
        <Cell label="Total est." value={`~${((trip.estimatedWeight || 380) * trip.heads / 1000).toFixed(1)} t`} />
      </div>
      {trip.specialRequirements && (
        <div style={{ marginTop: 10, fontSize: 12, color: '#92400e', background: '#FFFBEB', border: '1px solid #FDE7A7', borderRadius: 9, padding: '8px 10px', lineHeight: 1.45 }}>
          ⚠ {trip.specialRequirements}
        </div>
      )}
    </div>
  );

  const precio = (
    <div style={{ border: `1px solid ${BRD}`, borderRadius: 12, padding: '12px 14px', background: '#FAFAF8' }}>
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 13.5, color: INK, marginBottom: 8 }}>Estado de la oferta</div>
      {trip.bidStatus === 'new' && (
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 11, color: GRY }}>Ref. de mercado</div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 22, color: V }}>{formatPrice(trip.marketPrice)}</div>
          </div>
          <div style={{ fontSize: 11.5, color: GRY2, textAlign: 'right' }}>≈ {formatPrice(Math.round(trip.marketPrice / trip.distance))}/km<br />El ganadero espera tu oferta</div>
        </div>
      )}
      {trip.bidStatus === 'awaiting-rancher' && (
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 11, color: GRY }}>Tu oferta enviada</div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 22, color: V }}>{formatPrice(trip.yourBid)}</div>
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#B45309' }}>⏳ Esperando respuesta</span>
        </div>
      )}
      {trip.bidStatus === 'rancher-countered' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 90 }}>
            <div style={{ fontSize: 10.5, color: GRY2 }}>Tu oferta inicial</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: GRY2, textDecoration: 'line-through' }}>{formatPrice(trip.yourBid)}</div>
          </div>
          <div style={{ flex: 1, minWidth: 110, background: `${N}14`, border: `1px solid ${N}3a`, borderRadius: 9, padding: '7px 10px' }}>
            <div style={{ fontSize: 10.5, color: '#9a5b12', fontWeight: 700 }}>Contraoferta del ganadero</div>
            <div style={{ fontFamily: DISPLAY, fontSize: 18, fontWeight: 800, color: N }}>{formatPrice(trip.rancherCounterOffer)}</div>
          </div>
          <div style={{ width: '100%', fontSize: 11.5, color: GRY, display: 'flex', alignItems: 'center', gap: 5 }}>
            <TrendingUp style={{ width: 13, height: 13 }} /> Ref. de mercado: <strong style={{ color: INK }}>{formatPrice(trip.marketPrice)}</strong>
          </div>
        </div>
      )}
    </div>
  );

  // ── Acciones (footer) ──
  const actions: React.ReactNode[] = [];
  if (trip.bidStatus === 'new' && trip.isStoreOrder && splitGuides) {
    actions.push(
      <div key="guides" style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: GRY }}>Elegí la guía en la que querés licitar:</span>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {trip.guides.map((g: any) => (
            <button key={g.guideNumber} disabled={g.status !== 'available'} onClick={() => g.status === 'available' && onMakeBid(trip, g.guideNumber)}
              style={{ flex: 1, minWidth: 150, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, padding: '11px 14px', borderRadius: 10, border: 'none', cursor: g.status === 'available' ? 'pointer' : 'not-allowed', background: g.status === 'available' ? V : '#E5E7EB', color: g.status === 'available' ? '#fff' : GRY2, fontFamily: BODY, fontWeight: 700, fontSize: 13 }}>
              <span>Guía {g.guideNumber} · {g.heads} cab.</span>
              <span style={{ fontSize: 11.5, opacity: 0.85 }}>{g.status === 'available' ? 'Ofertar →' : 'En negociación'}</span>
            </button>
          ))}
        </div>
        {userType === 'empresa' && trip.guides.every((g: any) => g.status === 'available') && (
          <button onClick={() => { onClose(); onBothGuides(trip); }} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px 0', borderRadius: 10, border: 'none', background: N, color: '#fff', fontFamily: BODY, fontWeight: 700, fontSize: 13.5, cursor: 'pointer' }}>
            <DollarSign style={{ width: 15, height: 15 }} /> Ofertar ambas guías
          </button>
        )}
      </div>
    );
  } else if (trip.bidStatus === 'new') {
    actions.push(
      <button key="bid" onClick={() => onMakeBid(trip)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '13px 0', borderRadius: 11, border: 'none', background: V, color: '#fff', fontFamily: BODY, fontWeight: 800, fontSize: 14.5, cursor: 'pointer' }}>
        <DollarSign style={{ width: 18, height: 18 }} /> Hacer oferta
      </button>
    );
  }
  if (trip.bidStatus === 'rancher-countered' && canNegotiate(trip)) {
    actions.push(
      <div key="counter" style={{ display: 'flex', gap: 9 }}>
        <button onClick={() => { onClose(); onAcceptCounter(trip); }} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '13px 0', borderRadius: 11, border: 'none', background: V, color: '#fff', fontFamily: BODY, fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
          <Check style={{ width: 17, height: 17 }} /> Aceptar contraoferta
        </button>
        <button onClick={onCounterFinal} style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '13px 0', borderRadius: 11, border: `1.5px solid ${N}`, background: '#fff', color: N, fontFamily: BODY, fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
          <DollarSign style={{ width: 16, height: 16 }} /> Contraoferta final
        </button>
      </div>
    );
  }

  const inner = (
    <div onClick={e => e.stopPropagation()} style={{ background: '#fff', width: '100%', maxWidth: isMobile ? '100%' : 900, maxHeight: isMobile ? '94vh' : '90vh', borderRadius: isMobile ? '18px 18px 0 0' : 16, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 70px rgba(0,0,0,0.32)', fontFamily: BODY }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, padding: '15px 18px', borderBottom: `1px solid ${BRD}`, flexShrink: 0 }}>
        <div>
          <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: isMobile ? 17 : 19, color: INK }}>Detalles de la solicitud</div>
          <div style={{ fontFamily: 'monospace', fontSize: 12, color: GRY, marginTop: 2 }}>{trip.id}{splitGuides ? ' · 2 guías' : ''} · {trip.origin} → {trip.destination}</div>
        </div>
        <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 9, border: 'none', background: '#F3F4F6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><X style={{ width: 18, height: 18, color: GRY }} /></button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: isMobile ? 14 : '16px 18px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.05fr 0.95fr', gap: isMobile ? 12 : 18, alignItems: 'start' }}>
        {/* Columna izquierda: mapa + ruta */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${BRD}` }}>
            {o && d ? (
              <MapView height={isMobile ? 170 : 196} markers={[{ id: 'orig', lat: o[0], lng: o[1], type: 'origin', label: trip.origin }, { id: 'dest', lat: d[0], lng: d[1], type: 'destination', label: trip.destination }]} route={[o, d]} interactive={false} />
            ) : (
              <div style={{ height: isMobile ? 170 : 196, background: 'linear-gradient(135deg, #E8EFE9, #F6F1E8)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, color: GRY }}>
                <MapPin style={{ width: 18, height: 18, color: V }} /> {trip.origin} → {trip.destination}
              </div>
            )}
          </div>
          {/* Ruta */}
          {isMobile ? (
            <div style={{ border: `1px solid ${BRD}`, borderRadius: 12, padding: '11px 13px', display: 'flex', flexDirection: 'column', gap: 2 }}>
              <RutaPunto color="#2563EB" label="Recogida" name={trip.origin} coords={trip.originCoords} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0 3px 4px' }}>
                <div style={{ width: 2, height: 16, background: BRD }} />
                <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 14, color: V }}>{trip.distance} km</span>
                <span style={{ fontSize: 11, color: GRY2 }}>· {trip.estimatedDuration}</span>
              </div>
              <RutaPunto color="#DC2626" label="Destino" name={trip.destination} coords={trip.destinationCoords} />
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'stretch', gap: 8, border: `1px solid ${BRD}`, borderRadius: 12, padding: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10.5, fontWeight: 700, color: '#2563EB' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#2563EB' }} /> Recogida</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: INK, marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trip.origin}</div>
                <div style={{ fontSize: 11, color: GRY2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{trip.originCoords}</div>
              </div>
              <div style={{ flexShrink: 0, alignSelf: 'center', textAlign: 'center', padding: '0 6px' }}>
                <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 15, color: V }}>{trip.distance} km</div>
                <div style={{ fontSize: 10, color: GRY2 }}>{trip.estimatedDuration}</div>
              </div>
              <div style={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5, fontSize: 10.5, fontWeight: 700, color: '#DC2626' }}>Destino <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#DC2626' }} /></div>
                <div style={{ fontSize: 13, fontWeight: 700, color: INK, marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trip.destination}</div>
                <div style={{ fontSize: 11, color: GRY2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{trip.destinationCoords}</div>
              </div>
            </div>
          )}
        </div>

        {/* Columna derecha: ganadero + ganado + precio */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {ganadero}
          {ganado}
          {precio}
        </div>
      </div>

      {/* Footer */}
      <div style={{ flexShrink: 0, padding: '12px 18px', borderTop: `1px solid ${BRD}`, display: 'flex', flexDirection: 'column', gap: 9, background: '#fff' }}>
        {actions}
        <button onClick={() => onShare(trip)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, width: '100%', padding: '9px 0', borderRadius: 10, border: `1px solid ${BRD}`, background: '#fff', color: GRY, fontFamily: BODY, fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>
          <Share2 style={{ width: 14, height: 14 }} /> ¿Más cabezas de las que entran? Compartí con un colega
        </button>
      </div>
    </div>
  );

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(8,34,26,0.38)', backdropFilter: 'blur(2.5px)', WebkitBackdropFilter: 'blur(2.5px)', display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', padding: isMobile ? 0 : 16 }}>
      {inner}
    </div>
  );
}
