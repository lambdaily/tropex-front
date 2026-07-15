// Flujo de cancelación de viaje, compartido por todos los roles.
// - Los motivos NO muestran la posible multa (se ve recién en la pantalla de evidencia).
// - Hay que subir mínimo 3 fotos de respaldo para poder cancelar (cualquier motivo).
// - Motivos justificados (clima/mecánico/salud) con fotos válidas = sin cargo; el resto, revisión del admin (posible multa 2%).
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Camera, Check, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useIsMobile } from './ui/use-mobile';

const MIN_PHOTOS = 3;

const REASONS: Array<{ key: string; label: string; desc: string }> = [
  { key: 'clima', label: 'Clima / fuerza mayor', desc: 'Ruta cortada, inundación o acto de fuerza mayor' },
  { key: 'mecanico', label: 'Problema mecánico', desc: 'Falla del camión que impide continuar' },
  { key: 'salud', label: 'Emergencia personal / salud', desc: 'Un imprevisto del conductor' },
  { key: 'no-cumplir', label: 'Ya no puedo cumplir el viaje', desc: 'Decisión propia de no realizarlo' },
  { key: 'otro', label: 'Otro motivo', desc: 'Contanos qué pasó abajo' },
];
const JUSTIFIED = new Set(['clima', 'mecanico', 'salud']);

interface TripCancelFlowProps {
  tripId: string;
  route: string;
  /** Quién cancela (ajusta el texto). */
  who?: 'ganadero' | 'empresa' | 'transportista';
  onClose: () => void;
  onConfirmed: (reasonKey: string) => void;
}

export function TripCancelFlow({ tripId, route, who = 'transportista', onClose, onConfirmed }: TripCancelFlowProps) {
  const [step, setStep] = useState<'reason' | 'evidence' | 'done'>('reason');
  const [reasonKey, setReasonKey] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [photos, setPhotos] = useState(0); // demo: cantidad de fotos "subidas"

  const reason = REASONS.find(r => r.key === reasonKey) || null;
  const justified = reasonKey ? JUSTIFIED.has(reasonKey) : false;
  const canConfirm = photos >= MIN_PHOTOS;

  const slots = Math.max(MIN_PHOTOS, photos + (photos < 6 ? 1 : 0));

  const title = step === 'reason' ? 'Cancelar viaje' : step === 'evidence' ? 'Confirmar cancelación' : 'Viaje cancelado';
  const isMobile = useIsMobile();

  const inner = (
    <>
      <div style={{ background: '#1E5126', padding: '14px 16px 16px', paddingTop: 'max(14px, env(safe-area-inset-top))', flexShrink: 0 }}>
        <button
          onClick={() => { if (step === 'evidence') setStep('reason'); else onClose(); }}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 0, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}
        >
          <ChevronLeft size={16} /> {step === 'done' ? 'Volver al panel' : 'Volver'}
        </button>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>{tripId} · {route}</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginTop: 2 }}>{title}</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 40px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Motivo (sin mencionar multa) */}
        {step === 'reason' && (
          <>
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E9E4D8', padding: '13px 15px', fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>
              Elegí el motivo de la cancelación. En el siguiente paso vas a subir fotos de respaldo.
            </div>
            {REASONS.map(r => (
              <button
                key={r.key}
                onClick={() => { setReasonKey(r.key); setStep('evidence'); }}
                style={{ display: 'flex', alignItems: 'center', gap: 11, background: '#fff', borderRadius: 13, border: '1px solid #E9E4D8', padding: '13px 14px', cursor: 'pointer', textAlign: 'left', width: '100%' }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>{r.label}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>{r.desc}</div>
                </div>
                <ChevronRight size={16} color="#D1D5DB" />
              </button>
            ))}
          </>
        )}

        {/* Evidencia: fotos obligatorias + comentario + aviso de multa/revisión */}
        {step === 'evidence' && reason && (
          <>
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E9E4D8', padding: '13px 15px' }}>
              <div style={{ fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Motivo</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#111', marginTop: 2 }}>{reason.label}</div>
            </div>

            {/* Fotos */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E9E4D8', padding: '14px 15px' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>Fotos de respaldo · mínimo {MIN_PHOTOS}</div>
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3, lineHeight: 1.5 }}>
                Subí fotos que muestren el motivo (ganado, ruta, camión, documento…).
                {justified && <strong style={{ color: '#1E5126' }}> Con fotos válidas, esta cancelación es sin cargo.</strong>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 12 }}>
                {Array.from({ length: slots }).map((_, i) => {
                  const filled = i < photos;
                  return (
                    <button
                      key={i}
                      onClick={() => { if (i === photos) setPhotos(p => Math.min(p + 1, 6)); }}
                      style={{ aspectRatio: '1 / 1', borderRadius: 12, border: filled ? 'none' : '1.5px dashed #C9C2B2', background: filled ? '#1E5126' : '#FAF8F2', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: i <= photos ? 'pointer' : 'default', color: filled ? '#fff' : '#9CA3AF' }}
                    >
                      {filled ? <Check size={22} /> : <Camera size={20} />}
                      <span style={{ fontSize: 10, fontWeight: 700 }}>{filled ? `Foto ${i + 1}` : 'Agregar'}</span>
                    </button>
                  );
                })}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: canConfirm ? '#1E5126' : '#B45309', marginTop: 8 }}>{photos}/{MIN_PHOTOS} fotos {canConfirm ? '· listo' : '· faltan ' + (MIN_PHOTOS - photos)}</div>
            </div>

            {/* Aviso: multa + revisión del admin (recién acá) */}
            <div style={{ background: '#FFFBEB', border: '1px solid #FDE7A7', borderRadius: 14, padding: '13px 14px', display: 'flex', gap: 11 }}>
              <AlertTriangle size={18} color="#B45309" style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ fontSize: 12, color: '#92400e', lineHeight: 1.5 }}>
                La cancelación la <strong>revisa el equipo de Tropero</strong>. Las cancelaciones justificadas con fotos (clima, mecánico, salud) <strong>no tienen costo</strong>. En otros casos puede aplicar una <strong>multa del 2%</strong> según la revisión.
              </div>
            </div>

            <div>
              <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 700, marginBottom: 6 }}>Comentario (opcional)</div>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Contanos qué pasó para ayudar a la revisión…"
                rows={3}
                style={{ width: '100%', boxSizing: 'border-box', padding: '11px 13px', borderRadius: 12, border: '1.5px solid #E5E7EB', fontSize: 13, fontFamily: 'inherit', resize: 'none', outline: 'none', color: '#111' }}
              />
            </div>

            <button
              onClick={() => { if (canConfirm) { setStep('done'); onConfirmed(reason.key); } }}
              disabled={!canConfirm}
              style={{ padding: '15px 0', borderRadius: 13, border: 'none', background: canConfirm ? '#B91C1C' : '#E5C9C9', color: '#fff', fontSize: 14, fontWeight: 800, cursor: canConfirm ? 'pointer' : 'default', width: '100%' }}
            >
              {canConfirm ? 'Confirmar cancelación' : `Subí ${MIN_PHOTOS} fotos para continuar`}
            </button>
            <button onClick={onClose} style={{ padding: '13px 0', borderRadius: 13, border: '1.5px solid rgba(0,0,0,0.1)', background: '#fff', color: '#6B7280', fontSize: 13, fontWeight: 800, cursor: 'pointer', width: '100%' }}>
              No, mantener el viaje
            </button>
          </>
        )}

        {/* Listo */}
        {step === 'done' && (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E9E4D8', padding: '28px 20px', textAlign: 'center', marginTop: 8 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: justified ? 'rgba(34,197,94,0.1)' : 'rgba(245,135,24,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              {justified ? <ShieldCheck size={28} color="#16a34a" /> : <AlertTriangle size={28} color="#F58718" />}
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#111' }}>Viaje cancelado</div>
            <div style={{ fontSize: 13, color: '#6B7280', marginTop: 6, lineHeight: 1.5 }}>
              {who === 'ganadero' ? 'El transportista fue notificado.' : 'El ganadero fue notificado.'} {justified ? 'Cancelación justificada · sin cargo.' : 'El equipo de Tropero revisa el caso; si corresponde, te avisaremos sobre la multa.'}
            </div>
            <button onClick={onClose} style={{ marginTop: 18, width: '100%', background: '#1E5126', color: '#fff', border: 'none', borderRadius: 13, padding: '14px 0', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
              Volver al panel
            </button>
          </div>
        )}
      </div>
    </>
  );

  if (isMobile) {
    return <div style={{ position: 'fixed', inset: 0, zIndex: 1700, background: '#F6F1E8', display: 'flex', flexDirection: 'column', fontFamily: '"IBM Plex Sans", system-ui, sans-serif' }}>{inner}</div>;
  }
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1700, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: '"IBM Plex Sans", system-ui, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 540, maxHeight: '90vh', background: '#F6F1E8', borderRadius: 18, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>{inner}</div>
    </div>
  );
}
