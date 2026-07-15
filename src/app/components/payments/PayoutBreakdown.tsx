// Desglose de cobro (flete − comisión − multa) y rating de entrega.
// Compartido por los historiales de Owner-Operator y Empresa, y la pantalla
// de viaje recién entregado de la Empresa.
import { useState, type ReactNode } from 'react';
import { X, Info, Star, CheckCircle2 } from 'lucide-react';
import { C, DISPLAY, BODY, MONO, formatGs } from '../dashboards/admin/kit';
import { useIsMobile } from '../ui/use-mobile';

export const MULTA_RATE = 0.02; // 2% del flete, debitado del cobro (lo define el admin)

// ── Estados de pago para los historiales ──
export type PayState = 'esperando' | 'verificando' | 'pagado';
export const payMeta: Record<PayState, { label: string; color: string }> = {
  esperando: { label: 'Esperando procesamiento', color: C.naranja },
  verificando: { label: 'Comprobante en verificación', color: '#B45309' },
  pagado: { label: 'Pagado', color: C.verdeClaro },
};
// Variante para quien cobra (transportista/empresa)
export const payMetaCobro: Record<PayState, { label: string; color: string }> = {
  esperando: { label: 'Cobro pendiente', color: C.naranja },
  verificando: { label: 'Verificando pago', color: '#B45309' },
  pagado: { label: 'Cobrado', color: C.verdeClaro },
};

export function PayBadge({ state, cobro }: { state: PayState; cobro?: boolean }) {
  const m = (cobro ? payMetaCobro : payMeta)[state];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: m.color, background: m.color + '18', border: `1px solid ${m.color}33`, padding: '3px 9px', borderRadius: 99, whiteSpace: 'nowrap' }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: m.color }} />{m.label}
    </span>
  );
}

// ── Fila del desglose ──
function BRow({ label, value, kind, info, onInfo }: { label: string; value: string; kind?: 'minus' | 'total'; info?: boolean; onInfo?: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: kind === 'total' ? '12px 0 2px' : '7px 0' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: kind === 'total' ? 14 : 13, fontWeight: kind === 'total' ? 800 : 500, color: kind === 'total' ? C.texto : C.gris }}>
        {label}
        {info && <button onClick={onInfo} title="Más info" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}><Info size={13} color={C.grisClaro} /></button>}
      </span>
      <span style={{ fontFamily: DISPLAY, fontSize: kind === 'total' ? 19 : 14, fontWeight: kind === 'total' ? 800 : 600, color: kind === 'total' ? C.verde : kind === 'minus' ? C.rojo : C.texto, letterSpacing: kind === 'total' ? '-0.02em' : undefined }}>{value}</span>
    </div>
  );
}

// ── Contenido del desglose (reutilizable: modal o embebido) ──
export function PayoutBreakdownContent({ freight, commissionRate }: { freight: number; commissionRate: number }) {
  const [multa, setMulta] = useState(false);
  const [info, setInfo] = useState(false);
  const comision = Math.round(freight * commissionRate);
  const multaMonto = Math.round(freight * MULTA_RATE);
  const neto = freight - comision - (multa ? multaMonto : 0);
  const pct = Math.round(commissionRate * 100);
  return (
    <div>
      <BRow label="Flete total" value={formatGs(freight)} />
      <BRow label={`Comisión TROPEX (${pct}%)`} value={'− ' + formatGs(comision)} kind="minus" />
      {multa && <BRow label={`Multa (${Math.round(MULTA_RATE * 100)}%)`} value={'− ' + formatGs(multaMonto)} kind="minus" info onInfo={() => setInfo(v => !v)} />}
      {multa && info && (
        <div style={{ fontSize: 12, color: '#92400e', background: '#FFFBEB', border: '1px solid #FDE7A7', borderRadius: 9, padding: '9px 11px', lineHeight: 1.5, margin: '2px 0 6px' }}>
          La multa se <strong>debita de tu cobro</strong>. La define el equipo de Tropero según el motivo (p. ej. cancelación tardía o incumplimiento). Las causas justificadas con respaldo no tienen costo.
        </div>
      )}
      <div style={{ borderTop: `1px dashed ${C.borde}`, marginTop: 6 }} />
      <BRow label="Neto a cobrar" value={formatGs(neto)} kind="total" />
      <button onClick={() => setMulta(m => !m)} style={{ marginTop: 12, width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '10px 0', borderRadius: 10, border: multa ? `1px solid ${C.borde}` : `1.5px solid ${C.naranja}`, background: multa ? '#fff' : `${C.naranja}10`, color: multa ? C.gris : C.naranja, fontFamily: BODY, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
        {multa ? 'Quitar multa simulada' : <><Info size={14} /> Simular multa</>}
      </button>
    </div>
  );
}

// ── Modal de desglose (responsivo) ──
export function PayoutBreakdown({ tripId, freight, commissionRate, onClose }: { tripId?: string; freight: number; commissionRate: number; onClose: () => void }) {
  const isMobile = useIsMobile();
  const inner = (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, padding: '16px 18px 12px' }}>
        <div>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 17, color: C.texto }}>Desglose del cobro</div>
          {tripId && <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.grisClaro, marginTop: 2 }}>{tripId}</div>}
        </div>
        <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 9, border: 'none', background: '#F3F4F6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><X size={17} color={C.gris} /></button>
      </div>
      <div style={{ padding: '0 18px 18px' }}>
        <PayoutBreakdownContent freight={freight} commissionRate={commissionRate} />
      </div>
    </>
  );
  if (isMobile) {
    return (
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1800, background: 'rgba(8,34,26,0.4)', display: 'flex', alignItems: 'flex-end', fontFamily: BODY }}>
        <div onClick={e => e.stopPropagation()} style={{ width: '100%', background: '#fff', borderRadius: '20px 20px 0 0', paddingBottom: 'env(safe-area-inset-bottom)' }}>{inner}</div>
      </div>
    );
  }
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1800, background: 'rgba(8,34,26,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: BODY }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 420, background: '#fff', borderRadius: 18, boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>{inner}</div>
    </div>
  );
}

// ── Modal de rating + cobro para viaje recién entregado (Empresa/Transportista) ──
const CRITERIA = ['Puntualidad', 'Comunicación', 'Cuidado del ganado'];

export function DeliveryRatingModal({ tripId, route, counterpart, freight, commissionRate, onClose, onDone }: {
  tripId: string; route: string; counterpart: string; freight: number; commissionRate: number; onClose: () => void; onDone?: () => void;
}) {
  const isMobile = useIsMobile();
  const [scores, setScores] = useState<number[]>([0, 0, 0]);
  const [done, setDone] = useState(false);
  const avg = scores.every(s => s > 0) ? (scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const canSubmit = scores.every(s => s > 0);

  const inner = (
    <>
      <div style={{ background: C.verde, padding: '16px 18px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 11, fontWeight: 800, color: '#fff', background: 'rgba(255,255,255,0.15)', padding: '3px 9px', borderRadius: 99 }}><CheckCircle2 size={12} /> Viaje entregado</div>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 18, color: '#fff', marginTop: 7 }}>{route}</div>
          <div style={{ fontFamily: MONO, fontSize: 11.5, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{tripId}</div>
        </div>
        <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 9, border: 'none', background: 'rgba(255,255,255,0.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><X size={17} color="#fff" /></button>
      </div>

      <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 18, overflowY: 'auto' }}>
        {/* Rating */}
        <div>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 15, color: C.texto }}>Calificá a {counterpart}</div>
          <div style={{ fontSize: 12.5, color: C.gris, margin: '3px 0 12px' }}>Tu calificación ayuda a mantener la calidad de la red.</div>
          {CRITERIA.map((crit, ci) => (
            <div key={crit} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '6px 0' }}>
              <span style={{ fontSize: 13.5, color: C.texto, fontWeight: 500 }}>{crit}</span>
              <div style={{ display: 'flex', gap: 3 }}>
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setScores(s => s.map((v, i) => i === ci ? n : v))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 1, display: 'flex' }}>
                    <Star size={22} color={n <= scores[ci] ? C.naranja : '#D8D2C4'} fill={n <= scores[ci] ? C.naranja : 'none'} />
                  </button>
                ))}
              </div>
            </div>
          ))}
          {avg > 0 && <div style={{ fontSize: 12.5, color: C.gris, marginTop: 8, textAlign: 'right' }}>Promedio: <strong style={{ color: C.texto }}>{avg.toFixed(1)} ★</strong></div>}
        </div>

        {/* Cobro */}
        <div style={{ borderTop: `1px solid ${C.borde}`, paddingTop: 14 }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 15, color: C.texto, marginBottom: 8 }}>Tu cobro por este viaje</div>
          <PayoutBreakdownContent freight={freight} commissionRate={commissionRate} />
        </div>

        {!done ? (
          <button onClick={() => { if (canSubmit) { setDone(true); onDone?.(); } }} disabled={!canSubmit} style={{ padding: '13px 0', borderRadius: 11, border: 'none', background: canSubmit ? C.verde : '#D7DBD5', color: '#fff', fontFamily: BODY, fontWeight: 700, fontSize: 14.5, cursor: canSubmit ? 'pointer' : 'not-allowed' }}>
            {canSubmit ? 'Enviar calificación' : 'Calificá los 3 criterios'}
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '12px 14px', borderRadius: 11, background: `${C.verde}12`, color: C.verde, fontWeight: 700, fontSize: 13.5 }}><CheckCircle2 size={17} /> ¡Gracias! Calificación enviada.</div>
        )}
      </div>
    </>
  );

  const shell = (children: ReactNode) => isMobile
    ? <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1800, background: 'rgba(8,34,26,0.45)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', fontFamily: BODY }}><div onClick={e => e.stopPropagation()} style={{ background: C.neutro, borderRadius: '20px 20px 0 0', maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>{children}</div></div>
    : <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1800, background: 'rgba(8,34,26,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: BODY }}><div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 460, maxHeight: '90vh', overflow: 'hidden', background: C.neutro, borderRadius: 18, boxShadow: '0 20px 60px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column' }}>{children}</div></div>;

  return shell(inner);
}
