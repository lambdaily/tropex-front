// Liquidación de un envío entregado, desde el lado del ganadero (paga el flete).
// Paso 1: calificar al transportista. Paso 2: instrucciones de pago (cuenta de
// clearing Continental). Paso 3: subir comprobante → queda "esperando verificación".
import { useState, type ReactNode } from 'react';
import { X, ChevronLeft, Star, Copy, Upload, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { C, DISPLAY, BODY, MONO, formatGs } from '../dashboards/admin/kit';
import { useIsMobile } from '../ui/use-mobile';

const TROPEX_ACCOUNT = { banco: 'Banco Continental', cuenta: '490062282001', nombre: 'DEVELOP E.A.S.' };
const CRITERIA = ['Puntualidad', 'Comunicación', 'Cuidado del ganado'];

function readImage(file: File, cb: (url: string) => void) {
  const r = new FileReader();
  r.onloadend = () => cb(r.result as string);
  r.readAsDataURL(file);
}

function QRPlaceholder({ size = 116 }: { size?: number }) {
  const N = 21, cell = size / N;
  const inBox = (x: number, y: number, ox: number, oy: number) => x >= ox && x < ox + 7 && y >= oy && y < oy + 7;
  const finderOn = (x: number, y: number, ox: number, oy: number) => { const lx = x - ox, ly = y - oy; if (lx === 0 || lx === 6 || ly === 0 || ly === 6) return true; if (lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4) return true; return false; };
  const rects: ReactNode[] = [];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const finder = inBox(x, y, 0, 0) || inBox(x, y, N - 7, 0) || inBox(x, y, 0, N - 7);
    const on = finder ? finderOn(x, y, x < 7 ? 0 : N - 7, y < 7 ? 0 : N - 7) : ((x * 7 + y * 13 + x * y) % 3 === 0 && (x + y) % 5 !== 0);
    if (on) rects.push(<rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell + 0.6} height={cell + 0.6} fill="#0c1f17" />);
  }
  return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block' }} aria-hidden>{rects}</svg>;
}

interface Props {
  shipmentId: string;
  route: string;
  transportista: string;
  freight: number;
  onClose: () => void;
  onSettled: () => void;
}

export function GanaderoLiquidacionFlow({ shipmentId, route, transportista, freight, onClose, onSettled }: Props) {
  const isMobile = useIsMobile();
  const [step, setStep] = useState<'rating' | 'pago' | 'comprobante' | 'done'>('rating');
  const [scores, setScores] = useState<number[]>([0, 0, 0]);
  const [comprobante, setComprobante] = useState<string>();

  const ratingOk = scores.every(s => s > 0);
  const title = step === 'rating' ? 'Calificá el viaje' : step === 'pago' ? 'Pagar el flete' : step === 'comprobante' ? 'Subir comprobante' : 'Esperando verificación';

  const inner = (
    <>
      <div style={{ background: C.verde, padding: '14px 16px 16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={() => { if (step === 'pago') setStep('rating'); else if (step === 'comprobante') setStep('pago'); else onClose(); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
            <ChevronLeft size={16} /> {step === 'rating' ? 'Cerrar' : 'Volver'}
          </button>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={16} color="#fff" /></button>
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontFamily: MONO, marginTop: 8 }}>{shipmentId} · {route}</div>
        <div style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 800, color: '#fff', marginTop: 2 }}>{title}</div>
        {step !== 'done' && (
          <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
            {['rating', 'pago', 'comprobante'].map((s, i) => {
              const idx = ['rating', 'pago', 'comprobante'].indexOf(step);
              return <div key={s} style={{ flex: 1, height: 4, borderRadius: 99, background: i <= idx ? C.naranja : 'rgba(255,255,255,0.25)' }} />;
            })}
          </div>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* RATING */}
        {step === 'rating' && (
          <>
            <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${C.borde}`, padding: 15 }}>
              <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 16, color: C.texto }}>Calificá a {transportista}</div>
              <div style={{ fontSize: 12.5, color: C.gris, margin: '3px 0 12px' }}>Tu calificación mantiene la calidad de la red.</div>
              {CRITERIA.map((c, ci) => (
                <div key={c} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '7px 0' }}>
                  <span style={{ fontSize: 13.5, color: C.texto, fontWeight: 500 }}>{c}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} onClick={() => setScores(s => s.map((v, i) => i === ci ? n : v))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 1, display: 'flex' }}>
                        <Star size={24} color={n <= scores[ci] ? C.naranja : '#D8D2C4'} fill={n <= scores[ci] ? C.naranja : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => { if (ratingOk) setStep('pago'); }} disabled={!ratingOk} style={btn(ratingOk)}>{ratingOk ? 'Continuar al pago' : 'Calificá los 3 criterios'}</button>
          </>
        )}

        {/* PAGO */}
        {step === 'pago' && (
          <>
            <div style={{ borderRadius: 16, overflow: 'hidden', background: '#1f3fa0' }}>
              <div style={{ padding: '14px 16px 8px' }}>
                <div style={{ fontFamily: DISPLAY, fontSize: 13, color: '#C4D600' }}>mi cuenta</div>
                <div style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>continental</div>
              </div>
              <div style={{ background: '#fff', margin: '4px 12px 14px', borderRadius: 12, padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}><QRPlaceholder size={isMobile ? 116 : 124} /></div>
                <Acct k="Entidad" v={TROPEX_ACCOUNT.banco} /><Acct k="Número de cuenta" v={TROPEX_ACCOUNT.cuenta} mono /><Acct k="Nombre" v={TROPEX_ACCOUNT.nombre} />
                <button onClick={() => { navigator.clipboard?.writeText(TROPEX_ACCOUNT.cuenta).catch(() => {}); toast.success('Cuenta copiada'); }} style={{ marginTop: 10, width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 0', borderRadius: 9, border: `1.5px solid ${C.verde}`, background: '#fff', color: C.verde, fontFamily: BODY, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}><Copy size={13} /> Copiar cuenta</button>
              </div>
            </div>
            <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${C.borde}`, padding: 14 }}>
              <div style={{ fontSize: 10.5, color: C.grisClaro, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Monto a transferir · concepto</div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 24, color: C.texto }}>{formatGs(freight)}</span>
                <span style={{ fontFamily: MONO, fontSize: 12.5, fontWeight: 700, color: C.texto }}>{shipmentId}</span>
              </div>
            </div>
            <button onClick={() => setStep('comprobante')} style={btn(true)}>Ya transferí · subir comprobante</button>
          </>
        )}

        {/* COMPROBANTE */}
        {step === 'comprobante' && (
          <>
            {!comprobante ? (
              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 7, height: 150, borderRadius: 14, border: `1.5px dashed ${C.grisClaro}`, background: '#FAFAF8', cursor: 'pointer' }}>
                <Upload size={26} color={C.gris} />
                <span style={{ fontSize: 14, fontWeight: 700, color: C.texto }}>Subir comprobante de transferencia</span>
                <span style={{ fontSize: 12, color: C.grisClaro }}>Captura o PDF</span>
                <input type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) readImage(f, url => setComprobante(url)); }} />
              </label>
            ) : (
              <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${C.borde}`, padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
                <img src={comprobante} alt="comprobante" style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 10, border: `1px solid ${C.borde}` }} />
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: C.verde }}><CheckCircle2 size={16} /> Comprobante cargado</div>
              </div>
            )}
            <button onClick={() => { if (comprobante) { setStep('done'); toast.success('Comprobante enviado. Verificamos tu pago.'); } }} disabled={!comprobante} style={btn(!!comprobante)}>Enviar para verificación</button>
          </>
        )}

        {/* DONE */}
        {step === 'done' && (
          <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${C.borde}`, padding: '28px 20px', textAlign: 'center', marginTop: 8 }}>
            <div style={{ width: 58, height: 58, borderRadius: '50%', background: `${C.naranja}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}><Clock size={28} color={C.naranja} /></div>
            <div style={{ fontFamily: DISPLAY, fontSize: 18, fontWeight: 800, color: C.texto }}>Esperando verificación</div>
            <div style={{ fontSize: 13.5, color: C.gris, marginTop: 7, lineHeight: 1.5 }}>
              Calificaste a {transportista} y subiste el comprobante. Verificamos tu transferencia contra el clearing en Continental (hasta 24 h hábiles) y liberamos el pago al transportista.
            </div>
            <button onClick={() => { onSettled(); onClose(); }} style={{ marginTop: 20, width: '100%', background: C.verde, color: '#fff', border: 'none', borderRadius: 13, padding: '14px 0', fontFamily: BODY, fontSize: 14.5, fontWeight: 800, cursor: 'pointer' }}>Volver a mis envíos</button>
          </div>
        )}
      </div>
    </>
  );

  if (isMobile) return <div style={{ position: 'fixed', inset: 0, zIndex: 1900, background: C.neutro, display: 'flex', flexDirection: 'column', fontFamily: BODY }}>{inner}</div>;
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1900, background: 'rgba(8,34,26,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: BODY }}>
      <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 460, maxHeight: '92vh', background: C.neutro, borderRadius: 18, display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>{inner}</div>
    </div>
  );
}

function btn(enabled: boolean): React.CSSProperties {
  return { padding: '14px 0', borderRadius: 13, border: 'none', background: enabled ? C.verde : '#D7DBD5', color: '#fff', fontFamily: BODY, fontSize: 14.5, fontWeight: 800, cursor: enabled ? 'pointer' : 'not-allowed', width: '100%' };
}
function Acct({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ fontSize: 10.5, color: C.grisClaro }}>{k}</div>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: C.texto, fontFamily: mono ? MONO : BODY }}>{v}</div>
    </div>
  );
}
