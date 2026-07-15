// Desktop del chofer: NO es un panel operativo. El chofer trabaja desde la app
// (el seguimiento GPS es obligatorio y solo existe en mobile). La web sirve únicamente
// para que el dispatcher ayude a crear la cuenta; al entrar, se invita a descargar la app.
import { Smartphone, Navigation, CheckCircle2, LogOut, ArrowRight, ShieldCheck } from 'lucide-react';
import type { ReactNode } from 'react';

interface DriverDashboardProps {
  userName: string;
  onLogout: () => void;
}

const VERDE = '#1E5126', NOCHE = '#08221A', NARANJA = '#F58718';
const DISPLAY = "'Space Grotesk', system-ui, sans-serif";
const BODY = "'IBM Plex Sans', system-ui, sans-serif";

function QR({ size = 150 }: { size?: number }) {
  const N = 25, cell = size / N;
  const inBox = (x: number, y: number, ox: number, oy: number) => x >= ox && x < ox + 7 && y >= oy && y < oy + 7;
  const finderOn = (x: number, y: number, ox: number, oy: number) => { const lx = x - ox, ly = y - oy; if (lx === 0 || lx === 6 || ly === 0 || ly === 6) return true; if (lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4) return true; return false; };
  const rects: ReactNode[] = [];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const finder = inBox(x, y, 0, 0) || inBox(x, y, N - 7, 0) || inBox(x, y, 0, N - 7);
    const on = finder ? finderOn(x, y, x < 7 ? 0 : N - 7, y < 7 ? 0 : N - 7) : ((x * 7 + y * 13 + x * y) % 3 === 0 && (x + y) % 5 !== 0);
    if (on) rects.push(<rect key={`${x}-${y}`} x={x * cell} y={y * cell} width={cell + 0.6} height={cell + 0.6} fill={NOCHE} />);
  }
  return <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden style={{ display: 'block' }}>{rects}</svg>;
}

function StoreBadge({ store }: { store: 'app-store' | 'google-play' }) {
  const isApple = store === 'app-store';
  return (
    <a href="#" onClick={e => e.preventDefault()} style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: NOCHE, color: '#fff', borderRadius: 11, padding: '9px 16px', textDecoration: 'none', flex: 1, justifyContent: 'center' }}>
      <span style={{ fontSize: 20, lineHeight: 1 }}>{isApple ? '' : '▶'}</span>
      <span style={{ textAlign: 'left' }}>
        <span style={{ display: 'block', fontSize: 9, opacity: 0.7 }}>{isApple ? 'Descargá en el' : 'Disponible en'}</span>
        <span style={{ display: 'block', fontSize: 14, fontWeight: 700, fontFamily: DISPLAY }}>{isApple ? 'App Store' : 'Google Play'}</span>
      </span>
    </a>
  );
}

export function DriverDashboard({ userName, onLogout }: DriverDashboardProps) {
  const first = userName?.split(' ')[0] || 'Chofer';
  return (
    <div style={{ minHeight: '100vh', background: NOCHE, fontFamily: BODY, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, position: 'relative', overflow: 'hidden' }}>
      <div aria-hidden style={{ position: 'absolute', top: '-15%', right: '-10%', width: 560, height: 520, background: 'radial-gradient(circle, rgba(30,81,38,0.6), transparent 62%)', filter: 'blur(20px)', pointerEvents: 'none' }} />
      <div aria-hidden style={{ position: 'absolute', bottom: '-20%', left: '-12%', width: 600, height: 540, background: 'radial-gradient(circle, rgba(245,135,24,0.14), transparent 60%)', filter: 'blur(20px)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 880, display: 'grid', gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,0.9fr)', gap: 0, background: '#fff', borderRadius: 22, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.45)' }}>
        {/* Izquierda: mensaje */}
        <div style={{ padding: '34px 34px 30px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: NOCHE, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/tropex-isotipo.png" alt="TROPEX" style={{ width: 26, height: 26, objectFit: 'contain' }} />
            </div>
            <div>
              <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 15, color: NOCHE, lineHeight: 1 }}>TROPEX</div>
              <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>Chofer</div>
            </div>
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, alignSelf: 'flex-start', background: `${VERDE}12`, color: VERDE, fontSize: 12, fontWeight: 700, padding: '5px 11px', borderRadius: 99, marginBottom: 16 }}>
            <CheckCircle2 size={14} /> Cuenta creada
          </div>

          <h1 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 26, letterSpacing: '-0.02em', color: '#0c1f17', margin: 0, lineHeight: 1.15 }}>
            Hola {first}, descargá la app para empezar
          </h1>
          <p style={{ fontSize: 14, color: '#5b6b63', lineHeight: 1.55, margin: '12px 0 20px' }}>
            Como chofer, todo tu trabajo —ver tus viajes asignados, navegar la ruta y el <strong>seguimiento en vivo</strong>— se hace desde la app en tu celular. La web es solo para crear la cuenta.
          </p>

          {/* Pasos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 18 }}>
            {[
              'Escaneá el QR con la cámara de tu celular',
              'Descargá e instalá TROPEX',
              'Iniciá sesión y empezá a recibir viajes',
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: VERDE, color: '#fff', fontFamily: DISPLAY, fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
                <span style={{ fontSize: 13.5, color: '#374151' }}>{s}</span>
              </div>
            ))}
          </div>

          {/* Nota tracking */}
          <div style={{ display: 'flex', gap: 10, padding: '12px 13px', borderRadius: 12, background: `${NARANJA}10`, border: `1px solid ${NARANJA}30`, marginTop: 'auto' }}>
            <Navigation size={17} color={NARANJA} style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: '#8a4d10', margin: 0, lineHeight: 1.5 }}>
              El <strong>seguimiento GPS</strong> del ganado es obligatorio y solo funciona desde la app. Por eso todos los choferes la necesitan instalada.
            </p>
          </div>
        </div>

        {/* Derecha: QR + descarga */}
        <div style={{ background: 'linear-gradient(160deg, #0c1f17, #08221A)', padding: '34px 30px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: '#FCD9B0', fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
            <Smartphone size={15} /> Escaneá para descargar
          </div>
          <div style={{ background: '#fff', borderRadius: 18, padding: 16, boxShadow: '0 12px 30px rgba(0,0,0,0.3)' }}>
            <QR size={160} />
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', margin: '14px 0 16px', maxWidth: 220, lineHeight: 1.5 }}>
            Apuntá la cámara de tu celular al código y seguí el enlace.
          </div>
          <div style={{ display: 'flex', gap: 8, width: '100%', maxWidth: 260 }}>
            <StoreBadge store="app-store" />
            <StoreBadge store="google-play" />
          </div>

          <button onClick={onLogout} style={{ marginTop: 22, display: 'inline-flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', color: 'rgba(255,255,255,0.55)', fontFamily: BODY, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <LogOut size={15} /> Cerrar sesión
          </button>
        </div>
      </div>

      {/* Pie: ayuda del dispatcher */}
      <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, textAlign: 'center', zIndex: 1 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
          <ShieldCheck size={13} /> El dispatcher de tu empresa puede ayudarte a crear la cuenta. <ArrowRight size={12} /> El resto, desde la app.
        </span>
      </div>
    </div>
  );
}
