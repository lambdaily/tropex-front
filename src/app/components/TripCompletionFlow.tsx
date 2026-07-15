// Cierre de viaje para transportista / chofer cuando marcan "Viaje completado".
// Paso 1: prueba de entrega (fotos). Paso 2: calificar a quien pidió el flete.
// mandatory=true (owner-operator) → no se puede saltar; bloquea el panel hasta cerrar.
// mandatory=false (chofer) → puede posponer ("Más tarde"), pero se insiste con un banner.
import { useState, type ReactNode } from 'react';
import { Camera, CheckCircle2, X, Star, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from './ui/use-mobile';

const VERDE = '#1E5126';
const NARANJA = '#F58718';
const DISPLAY = "'Space Grotesk', system-ui, sans-serif";
const BODY = "'IBM Plex Sans', system-ui, sans-serif";

const PHOTOS_FRIGO = [
  { key: 'bascula', label: 'Foto de la báscula', hint: 'Peso final del camión' },
  { key: 'nota', label: 'Nota firmada del frigorífico', hint: 'Prueba de recepción' },
  { key: 'descarga', label: 'Animales descargando', hint: 'Contexto de la descarga' },
];
const PHOTOS_ESTANCIA = [
  { key: 'descarga1', label: 'Foto de la descarga', hint: 'Animales o camión en el establecimiento' },
];
const CRITERIA = ['Puntualidad', 'Comunicación', 'Estado de la carga'];

function readImage(file: File, cb: (url: string) => void) {
  const r = new FileReader();
  r.onloadend = () => cb(r.result as string);
  r.readAsDataURL(file);
}

interface TripCompletionFlowProps {
  tripId: string;
  route: string;
  counterpart: string;               // a quién califica (ganadero / cliente)
  destinationType?: 'frigorifico' | 'estancia';
  mandatory?: boolean;               // owner-op: obligatorio
  payout?: { freight: number; commissionRate: number }; // owner-op: pantalla final de cobro
  onDismiss?: () => void;            // chofer: posponer
  onComplete: () => void;
}

export function TripCompletionFlow({ tripId, route, counterpart, destinationType = 'frigorifico', mandatory = false, payout, onDismiss, onComplete }: TripCompletionFlowProps) {
  const isMobile = useIsMobile();
  const reqs = destinationType === 'frigorifico' ? PHOTOS_FRIGO : PHOTOS_ESTANCIA;
  const minPhotos = destinationType === 'frigorifico' ? 3 : 1;

  const [step, setStep] = useState<'fotos' | 'rating' | 'done'>('fotos');
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [scores, setScores] = useState<number[]>([0, 0, 0]);

  const uploaded = reqs.filter(r => photos[r.key]).length;
  const photosOk = uploaded >= minPhotos;
  const ratingOk = scores.every(s => s > 0);
  const avg = ratingOk ? (scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const fmtGs = (n: number) => '₲ ' + Math.round(n).toLocaleString('es-PY');
  const commission = payout ? Math.round(payout.freight * payout.commissionRate) : 0;
  const neto = payout ? payout.freight - commission : 0;

  const title = step === 'fotos' ? 'Prueba de entrega' : step === 'rating' ? 'Calificá el flete' : (payout ? 'Tu cobro' : 'Viaje cerrado');

  const inner = (
    <>
      {/* Header */}
      <div style={{ background: VERDE, padding: '14px 16px 16px', paddingTop: isMobile ? 'max(14px, env(safe-area-inset-top))' : 16, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <button onClick={() => { if (step === 'rating') setStep('fotos'); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 700, cursor: step === 'rating' ? 'pointer' : 'default', padding: 0, display: 'flex', alignItems: 'center', gap: 4, opacity: step === 'rating' ? 1 : 0 }}>
            <ChevronLeft size={16} /> Volver
          </button>
          {!mandatory && step !== 'done' && onDismiss && (
            <button onClick={onDismiss} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: '6px 12px', borderRadius: 8 }}>Más tarde</button>
          )}
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontFamily: 'monospace', marginTop: 8 }}>{tripId} · {route}</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginTop: 2 }}>{title}</div>
        {/* progreso 2 pasos */}
        {step !== 'done' && (
          <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
            {['fotos', 'rating'].map((s, i) => (
              <div key={s} style={{ flex: 1, height: 4, borderRadius: 99, background: (step === 'rating' || i === 0) ? NARANJA : 'rgba(255,255,255,0.25)' }} />
            ))}
          </div>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* PASO 1 — FOTOS */}
        {step === 'fotos' && (
          <>
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E9E4D8', padding: '13px 15px', fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>
              {mandatory
                ? 'Para cerrar el viaje y volver a operar, subí la prueba de entrega y calificá.'
                : 'Subí la prueba de entrega para cerrar el viaje.'}{' '}
              {destinationType === 'frigorifico' ? 'Destino frigorífico → 3 fotos.' : 'Destino estancia → al menos 1 foto.'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: destinationType === 'frigorifico' && !isMobile ? 'repeat(3,1fr)' : '1fr', gap: 11 }}>
              {reqs.map(p => (
                <PhotoTile key={p.key} label={p.label} hint={p.hint} preview={photos[p.key]}
                  onFile={f => readImage(f, url => setPhotos(s => ({ ...s, [p.key]: url })))}
                  onRemove={() => setPhotos(s => { const c = { ...s }; delete c[p.key]; return c; })} />
              ))}
            </div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: photosOk ? VERDE : NARANJA }}>{uploaded}/{minPhotos} fotos {photosOk ? '· listo' : `· faltan ${minPhotos - uploaded}`}</div>
            <button onClick={() => { if (photosOk) setStep('rating'); }} disabled={!photosOk} style={primaryBtn(photosOk)}>Continuar a la calificación</button>
          </>
        )}

        {/* PASO 2 — RATING */}
        {step === 'rating' && (
          <>
            <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E9E4D8', padding: '15px' }}>
              <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 16, color: '#111' }}>Calificá a {counterpart}</div>
              <div style={{ fontSize: 12.5, color: '#6B7280', margin: '3px 0 14px' }}>Tu calificación ayuda a mantener la calidad de la red.</div>
              {CRITERIA.map((c, ci) => (
                <div key={c} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '7px 0' }}>
                  <span style={{ fontSize: 13.5, color: '#111', fontWeight: 500 }}>{c}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} onClick={() => setScores(s => s.map((v, i) => i === ci ? n : v))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 1, display: 'flex' }}>
                        <Star size={24} color={n <= scores[ci] ? NARANJA : '#D8D2C4'} fill={n <= scores[ci] ? NARANJA : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {avg > 0 && <div style={{ fontSize: 12.5, color: '#6B7280', marginTop: 10, textAlign: 'right' }}>Promedio: <strong style={{ color: '#111' }}>{avg.toFixed(1)} ★</strong></div>}
            </div>
            <button onClick={() => { if (ratingOk) { setStep('done'); toast.success('Viaje cerrado. ¡Gracias por calificar!'); } }} disabled={!ratingOk} style={primaryBtn(ratingOk)}>
              {ratingOk ? 'Enviar y cerrar viaje' : 'Calificá los 3 criterios'}
            </button>
          </>
        )}

        {/* DONE (chofer / sin cobro) */}
        {step === 'done' && !payout && (
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E9E4D8', padding: '30px 22px', textAlign: 'center', marginTop: 8 }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle2 size={32} color="#16a34a" />
            </div>
            <div style={{ fontFamily: DISPLAY, fontSize: 19, fontWeight: 800, color: '#111' }}>¡Viaje cerrado!</div>
            <div style={{ fontSize: 13.5, color: '#6B7280', marginTop: 7, lineHeight: 1.5 }}>
              Subiste la prueba de entrega y calificaste a {counterpart}. {mandatory ? 'Ya podés volver a operar.' : 'Gracias por completarlo.'}
            </div>
            <button onClick={onComplete} style={{ marginTop: 20, width: '100%', background: VERDE, color: '#fff', border: 'none', borderRadius: 13, padding: '14px 0', fontFamily: BODY, fontSize: 14.5, fontWeight: 800, cursor: 'pointer' }}>
              Volver al panel
            </button>
          </div>
        )}

        {/* DONE con cobro (owner-operator): pantalla final de cuánto cobra menos comisión */}
        {step === 'done' && payout && (
          <>
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E9E4D8', padding: '20px', textAlign: 'center' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <CheckCircle2 size={27} color="#16a34a" />
              </div>
              <div style={{ fontFamily: DISPLAY, fontSize: 18, fontWeight: 800, color: '#111' }}>¡Viaje cerrado!</div>
              <div style={{ fontSize: 12.5, color: '#6B7280', marginTop: 5, lineHeight: 1.5 }}>Subiste la prueba de entrega y calificaste a {counterpart}.</div>
            </div>

            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E9E4D8', padding: '16px 18px' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Tu cobro por este viaje</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0' }}>
                <span style={{ fontSize: 13, color: '#6B7280' }}>Flete total</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{fmtGs(payout.freight)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0' }}>
                <span style={{ fontSize: 13, color: '#6B7280' }}>Comisión TROPEX ({(payout.commissionRate * 100).toFixed(0)}%)</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#B91C1C' }}>− {fmtGs(commission)}</span>
              </div>
              <div style={{ height: 1, background: '#EFEADD', margin: '11px 0' }} />
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>Vas a cobrar</span>
                <span style={{ fontFamily: DISPLAY, fontSize: 25, fontWeight: 800, color: VERDE, letterSpacing: '-0.01em' }}>{fmtGs(neto)}</span>
              </div>
              <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 11, background: '#FFF7ED', border: '1px solid #FED7AA', fontSize: 11.5, color: '#9A5B12', lineHeight: 1.5 }}>
                El pago entra en verificación. Te avisamos cuando se acredite — lo seguís desde <strong>Mis viajes</strong>.
              </div>
            </div>

            <button onClick={onComplete} style={{ width: '100%', background: VERDE, color: '#fff', border: 'none', borderRadius: 13, padding: '14px 0', fontFamily: BODY, fontSize: 14.5, fontWeight: 800, cursor: 'pointer' }}>
              Ver en Mis viajes
            </button>
          </>
        )}
      </div>
    </>
  );

  if (isMobile) {
    return <div style={{ position: 'fixed', inset: 0, zIndex: 1900, background: '#F6F1E8', display: 'flex', flexDirection: 'column', fontFamily: BODY }}>{inner}</div>;
  }
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1900, background: 'rgba(8,34,26,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: BODY }}>
      <div style={{ width: '100%', maxWidth: 540, maxHeight: '92vh', background: '#F6F1E8', borderRadius: 18, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>{inner}</div>
    </div>
  );
}

// Banner insistente para el chofer que pospuso el cierre.
export function PendingRatingBanner({ tripId, onResume }: { tripId: string; onResume: () => void }) {
  return (
    <button onClick={onResume} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 11, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 13, padding: '12px 14px', cursor: 'pointer', textAlign: 'left' }}>
      <div style={{ width: 34, height: 34, borderRadius: 9, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Star size={17} color="#B91C1C" fill="#B91C1C" /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: '#991B1B' }}>Te falta cerrar el viaje {tripId}</div>
        <div style={{ fontSize: 11.5, color: '#B91C1C', marginTop: 1 }}>Subí las fotos de entrega y calificá al ganadero.</div>
      </div>
      <span style={{ fontSize: 12, fontWeight: 800, color: '#fff', background: '#B91C1C', padding: '6px 11px', borderRadius: 8, flexShrink: 0 }}>Cerrar ahora</span>
    </button>
  );
}

// ── Subcomponentes ──
function primaryBtn(enabled: boolean): React.CSSProperties {
  return { padding: '14px 0', borderRadius: 13, border: 'none', background: enabled ? VERDE : '#D7DBD5', color: '#fff', fontFamily: BODY, fontSize: 14.5, fontWeight: 800, cursor: enabled ? 'pointer' : 'not-allowed', width: '100%' };
}

function PhotoTile({ label, hint, preview, onFile, onRemove }: { label: string; hint: string; preview?: string; onFile: (f: File) => void; onRemove: () => void }): ReactNode {
  if (preview) {
    return (
      <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: `2px solid ${VERDE}` }}>
        <img src={preview} alt={label} style={{ width: '100%', height: 110, objectFit: 'cover', display: 'block' }} />
        <button onClick={onRemove} style={{ position: 'absolute', top: 6, right: 6, width: 26, height: 26, borderRadius: '50%', border: 'none', background: '#d4183d', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '5px 8px', background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', display: 'flex', alignItems: 'center', gap: 5 }}><CheckCircle2 size={13} color="#fff" /><span style={{ fontSize: 11, color: '#fff', fontWeight: 600 }}>{label}</span></div>
      </div>
    );
  }
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '13px 14px', borderRadius: 12, border: '1.5px dashed #C9C2B2', background: '#FAF8F2', cursor: 'pointer' }}>
      <Camera size={20} color="#9CA3AF" />
      <span style={{ flex: 1 }}>
        <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#111' }}>{label}</span>
        <span style={{ display: 'block', fontSize: 11, color: '#9CA3AF' }}>{hint} · tocá para subir</span>
      </span>
      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
    </label>
  );
}
