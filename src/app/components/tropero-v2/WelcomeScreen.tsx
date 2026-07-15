import { useEffect, useRef, useState } from 'react';
import { Beef, Building2, Truck, UserCheck, Shield, FileText, TrendingUp, MapPin, DollarSign, Headphones, ArrowRight, Activity, Radio, Navigation, CheckCircle2, Clock } from 'lucide-react';
import { BrandLogo } from '../BrandLogo';

interface WelcomeScreenProps {
  onSignup: () => void;
  onLogin: () => void;
  onAdminClick?: () => void;
  onCasosBordeClick?: () => void;
}

const DISPLAY = "'Space Grotesk', system-ui, sans-serif";
const BODY = "'IBM Plex Sans', system-ui, sans-serif";
const MONO = "ui-monospace, 'SF Mono', 'Cascadia Mono', Menlo, monospace";

const VERDE = '#1E5126';
const NOCHE = '#08221A';
const NARANJA = '#F58718';
const NEUTRO = '#F6F1E8';

const LIVE_SHIPMENTS = [
  { id: 'ENV-046', route: 'Filadelfia → Asunción', state: 'En ruta' },
  { id: 'ENV-051', route: 'Loma Plata → Villa Hayes', state: 'Cargando' },
  { id: 'ENV-039', route: 'Concepción → Asunción', state: 'En ruta' },
  { id: 'ENV-058', route: 'Mariscal E. → Central', state: 'Entregado' },
  { id: 'ENV-062', route: 'Neuland → Concepción', state: 'En ruta' },
  { id: 'ENV-044', route: 'San Pedro → Asunción', state: 'Cargando' },
];

// Nodos del mapa de cobertura (layout aprox. de Paraguay)
const CITIES = [
  { name: 'Mariscal E.', x: 96, y: 70 },
  { name: 'Filadelfia', x: 158, y: 118 },
  { name: 'Concepción', x: 322, y: 120 },
  { name: 'P. J. Caballero', x: 432, y: 104 },
  { name: 'Asunción', x: 236, y: 250, hub: true },
  { name: 'Coronel Oviedo', x: 372, y: 262 },
  { name: 'Ciudad del Este', x: 506, y: 244 },
  { name: 'Villarrica', x: 356, y: 322 },
  { name: 'Pilar', x: 196, y: 392 },
  { name: 'Encarnación', x: 446, y: 404 },
];

const reduceMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Contador que sube de 0 al entrar en viewport
function CountUp({ to, suffix = '', duration = 1700 }: { to: number; suffix?: string; duration?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduceMotion() || !('IntersectionObserver' in window)) { setVal(to); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting && !done.current) {
          done.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setVal(Math.round(to * eased));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration]);
  return <span ref={ref}>{val}{suffix}</span>;
}

const ROLES = [
  {
    key: 'ganadero', icon: Beef, title: 'Ganadero',
    tagline: 'Publicá tu traslado y elegí la mejor oferta sin moverte de la estancia.',
    bullets: ['Cotizaciones de transportistas verificados', 'Comparás precio, calificación y disponibilidad', 'Guía de Traslado y COTA digitales'],
  },
  {
    key: 'empresa', icon: Building2, title: 'Empresa',
    tagline: 'Gestioná tu flota completa y aceptá los viajes que más te convienen.',
    bullets: ['Asignación de camiones y choferes', 'Marketplace de viajes disponibles', 'Control de documentación y rutas'],
  },
  {
    key: 'transportista', icon: Truck, title: 'Transportista',
    tagline: 'Encontrá viajes cerca tuyo y manejá tus ingresos en un solo lugar.',
    bullets: ['Ofertás y negociás directo con el ganadero', 'Seguimiento del viaje en curso', 'Reportes de ingresos y ₲/km'],
  },
  {
    key: 'chofer', icon: UserCheck, title: 'Chofer',
    tagline: 'Recibí tus asignaciones y resolvé la documentación desde el celular.',
    bullets: ['Estado del viaje en tiempo real', 'Subida de COTA y fotos de descarga', 'Contacto directo con el capataz'],
  },
];

const JOURNEY_STAGES = [
  { t: 'En el origen', s: 'Cargando 45 cabezas en la estancia, con Guía de Traslado digital.' },
  { t: 'En tránsito', s: 'Rumbo a Asunción · ruta y ubicación monitoreadas en tiempo real.' },
  { t: 'Llegando', s: 'Últimos kilómetros al frigorífico · el destino ya fue notificado.' },
  { t: 'Entregado', s: 'Descarga y documentación completas · viaje cerrado.' },
];

export function WelcomeScreen({ onSignup, onLogin, onAdminClick, onCasosBordeClick }: WelcomeScreenProps) {
  const [role, setRole] = useState(0);

  // ── Escena pinneada: progreso del viaje atado al scroll ──
  const pinRef = useRef<HTMLDivElement>(null);
  const journeyPath = useRef<SVGPathElement>(null);
  const [p, setP] = useState(0);
  const [len, setLen] = useState(0);
  const [motionOk, setMotionOk] = useState(true);
  useEffect(() => { if (journeyPath.current) setLen(journeyPath.current.getTotalLength()); }, []);
  useEffect(() => {
    const el = pinRef.current;
    if (!el) return;
    if (reduceMotion()) { setMotionOk(false); setP(1); return; }
    let last = -1;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const prog = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      if (Math.abs(prog - last) > 0.0012) { last = prog; setP(prog); }
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, []);
  const jStage = p < 0.1 ? 0 : p < 0.5 ? 1 : p < 0.85 ? 2 : 3;
  const jPct = Math.round(p * 100);
  const jMins = Math.max(0, Math.round((1 - p) * 124));
  const jEta = `${Math.floor(jMins / 60)}h ${String(jMins % 60).padStart(2, '0')}m`;
  const jKm = Math.max(0, Math.round((1 - p) * 485));
  const jPt = (journeyPath.current && len) ? journeyPath.current.getPointAtLength(Math.min(p, 1) * len) : { x: 60, y: 300 };

  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.tx-reveal'));
    if (!('IntersectionObserver' in window) || reduceMotion()) {
      els.forEach(el => el.classList.add('tx-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('tx-in'); io.unobserve(e.target); } });
    }, { threshold: 0.14 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  const ActiveRoleIcon = ROLES[role].icon;

  return (
    <div style={{ fontFamily: BODY, backgroundColor: NEUTRO, minHeight: '100vh' }}>
      <style>{`
        @keyframes tx-draw { to { stroke-dashoffset: 0; } }
        @keyframes tx-flow { to { stroke-dashoffset: -28; } }
        @keyframes tx-flowmap { to { stroke-dashoffset: -200; } }
        @keyframes tx-pulse { 0% { transform: scale(.5); opacity: .65; } 100% { transform: scale(2.6); opacity: 0; } }
        @keyframes tx-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-9px); } }
        @keyframes tx-floatB { 0%,100% { transform: translateY(0); } 50% { transform: translateY(7px); } }
        @keyframes tx-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes tx-up { from { opacity: 0; transform: translateY(22px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes tx-blink { 0%,100% { opacity: 1; } 50% { opacity: .35; } }
        @keyframes tx-aurora { 0% { transform: translate(0,0) scale(1); } 50% { transform: translate(6%,4%) scale(1.15); } 100% { transform: translate(0,0) scale(1); } }
        @keyframes tx-fade { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .tx-up { animation: tx-up .7s cubic-bezier(.2,.7,.3,1) both; }
        .tx-reveal { opacity: 0; transform: translateY(30px); transition: opacity .75s cubic-bezier(.2,.7,.3,1), transform .75s cubic-bezier(.2,.7,.3,1); }
        .tx-reveal.tx-in { opacity: 1; transform: none; }
        .tx-card { transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease; }
        .tx-card:hover { transform: translateY(-5px); box-shadow: 0 18px 44px rgba(8,34,26,0.16); }
        .tx-btn { transition: transform .15s ease, box-shadow .2s ease, background-color .2s ease; }
        .tx-btn:hover { transform: translateY(-2px); }
        .tx-link { transition: color .15s ease; }
        .tx-link:hover { color: #fff; }
        .tx-panel-tilt { transform: perspective(1400px) rotateY(-7deg) rotateX(3deg); transition: transform .5s cubic-bezier(.2,.7,.3,1); }
        .tx-panel-tilt:hover { transform: perspective(1400px) rotateY(0deg) rotateX(0deg); }
        .tx-fade { animation: tx-fade .4s ease both; }
        .tx-hero-grid { display: grid; grid-template-columns: minmax(0,1.05fr) minmax(0,0.95fr); gap: 54px; align-items: center; }
        .tx-bento { display: grid; grid-template-columns: repeat(4, 1fr); grid-auto-rows: 168px; gap: 16px; }
        .tx-show-grid { display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 40px; align-items: center; }
        .tx-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
        .tx-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; text-align: center; }
        .tx-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
        .tx-foot { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr; gap: 32px; }
        @media (max-width: 1040px) {
          .tx-hero-grid { grid-template-columns: 1fr; gap: 40px; }
          .tx-panel-tilt { transform: none; }
          .tx-show-grid { grid-template-columns: 1fr; gap: 28px; }
          .tx-grid-3 { grid-template-columns: repeat(2, 1fr); }
          .tx-metrics { grid-template-columns: repeat(2, 1fr); row-gap: 34px; }
          .tx-bento { grid-template-columns: repeat(2, 1fr); grid-auto-rows: 160px; }
          .tx-bento > * { grid-column: auto !important; grid-row: auto !important; }
          .tx-foot { grid-template-columns: 1fr 1fr; gap: 28px; }
        }
        @media (max-width: 680px) {
          .tx-steps, .tx-grid-3, .tx-metrics, .tx-bento, .tx-foot { grid-template-columns: 1fr; }
          .tx-bento { grid-auto-rows: auto; }
        }
        @media (prefers-reduced-motion: reduce) {
          .tx-up, .tx-fade { animation: none; }
          .tx-reveal { opacity: 1; transform: none; transition: none; }
          .tx-panel-tilt { transform: none; }
          svg *, .tx-floaty, .tx-aurora-layer { animation: none !important; }
        }
      `}</style>

      {/* ===== HEADER ===== */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(8,34,26,0.82)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '13px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <BrandLogo height={32} />
          <nav style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
            <a href="#features" className="tx-link" style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Plataforma</a>
            <a href="#cobertura" className="tx-link" style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Cobertura</a>
            <a href="#roles" className="tx-link" style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}>Para quién</a>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={onLogin} className="tx-btn" style={{ fontFamily: BODY, fontSize: 14, fontWeight: 500, padding: '9px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.08)', color: '#fff', border: '1px solid rgba(255,255,255,0.14)', cursor: 'pointer' }}>
                Iniciar sesión
              </button>
              <button onClick={onSignup} className="tx-btn" style={{ fontFamily: BODY, fontSize: 14, fontWeight: 700, padding: '9px 18px', borderRadius: 10, background: NARANJA, color: '#fff', border: 'none', cursor: 'pointer', boxShadow: '0 6px 18px rgba(245,135,24,0.32)' }}>
                Registrarte
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section style={{ position: 'relative', background: NOCHE, overflow: 'hidden', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div className="tx-aurora-layer" aria-hidden style={{ position: 'absolute', top: '-20%', right: '-10%', width: 720, height: 620, background: 'radial-gradient(circle, rgba(245,135,24,0.22), transparent 62%)', filter: 'blur(20px)', pointerEvents: 'none', animation: 'tx-aurora 14s ease-in-out infinite' }} />
        <div className="tx-aurora-layer" aria-hidden style={{ position: 'absolute', bottom: '-25%', left: '-12%', width: 780, height: 680, background: 'radial-gradient(circle, rgba(30,81,38,0.6), transparent 58%)', filter: 'blur(20px)', pointerEvents: 'none', animation: 'tx-aurora 18s ease-in-out infinite reverse' }} />
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.5, pointerEvents: 'none' }} aria-hidden>
          <defs>
            <pattern id="tx-grid" width="46" height="46" patternUnits="userSpaceOnUse">
              <path d="M 46 0 L 0 0 0 46" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#tx-grid)" />
        </svg>

        <div className="tx-hero-grid" style={{ position: 'relative', zIndex: 2, flex: '1 0 auto', width: '100%', maxWidth: 1180, margin: '0 auto', padding: '64px 28px 44px' }}>
          <div className="tx-up" style={{ minWidth: 0 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '7px 14px', borderRadius: 99, background: 'rgba(245,135,24,0.12)', border: '1px solid rgba(245,135,24,0.3)', marginBottom: 26 }}>
              <Radio size={14} color={NARANJA} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#FCD9B0' }}>Del oficio tropero a la logística inteligente</span>
            </div>

            <h1 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 'clamp(38px, 5vw, 60px)', lineHeight: 1.04, letterSpacing: '-0.03em', color: '#fff', margin: '0 0 22px' }}>
              El ganado de Paraguay,<br />
              <span style={{ background: `linear-gradient(100deg, ${NARANJA}, #ffb866)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>rastreado en tiempo real</span>
            </h1>

            <p style={{ fontSize: 19, lineHeight: 1.6, color: 'rgba(255,255,255,0.72)', maxWidth: 480, margin: '0 0 32px' }}>
              La plataforma agrotech que conecta ganaderos, empresas y transportistas verificados. Cotizá, contratá y seguí cada traslado al instante, con documentación 100% digital.
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 30 }}>
              <button onClick={onSignup} className="tx-btn" style={{ fontFamily: BODY, fontSize: 16, fontWeight: 700, padding: '15px 28px', borderRadius: 13, background: NARANJA, color: '#fff', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 9, boxShadow: '0 10px 28px rgba(245,135,24,0.36)' }}>
                Empezar ahora <ArrowRight size={18} />
              </button>
              <button onClick={onLogin} className="tx-btn" style={{ fontFamily: BODY, fontSize: 16, fontWeight: 600, padding: '15px 28px', borderRadius: 13, background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}>
                Ya tengo cuenta
              </button>
            </div>

            {/* trust chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Operamos según</span>
              {['SENACSA', 'SITRAP', 'Guía de Traslado digital'].map(c => (
                <span key={c} style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.7)', padding: '5px 11px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>{c}</span>
              ))}
            </div>
          </div>

          {/* panel de rastreo */}
          <div className="tx-up" style={{ animationDelay: '.12s', position: 'relative', minWidth: 0 }}>
            <div className="tx-panel-tilt" style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', background: 'linear-gradient(160deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 30px 80px rgba(0,0,0,0.45)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.18)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Navigation size={15} color={NARANJA} />
                  <span style={{ fontFamily: MONO, fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>ENV-046 · seguimiento</span>
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: '#7CF0A8' }}>
                  <span className="tx-floaty" style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', animation: 'tx-blink 1.6s ease-in-out infinite' }} />
                  EN VIVO
                </span>
              </div>
              <div style={{ position: 'relative', height: 360, background: `linear-gradient(180deg, #0a2a20, ${NOCHE})` }}>
                <svg viewBox="0 0 460 360" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} aria-hidden>
                  <g fill="none" stroke="rgba(124,240,168,0.10)" strokeWidth="1">
                    <path d="M -20 250 Q 140 180 240 230 T 500 200" />
                    <path d="M -20 290 Q 150 220 250 270 T 500 245" />
                    <path d="M -20 200 Q 130 140 230 180 T 500 150" />
                  </g>
                  <g fill="rgba(255,255,255,0.07)">
                    {Array.from({ length: 8 }).map((_, r) =>
                      Array.from({ length: 11 }).map((_, c) => (
                        <circle key={`${r}-${c}`} cx={20 + c * 42} cy={28 + r * 42} r="1.2" />
                      ))
                    )}
                  </g>
                  <path id="tx-route" d="M 60 312 C 150 280, 150 170, 240 158 S 360 110, 408 50" fill="none" stroke="rgba(245,135,24,0.22)" strokeWidth="3.5" strokeLinecap="round" />
                  <path d="M 60 312 C 150 280, 150 170, 240 158 S 360 110, 408 50" fill="none" stroke={NARANJA} strokeWidth="3.5" strokeLinecap="round" strokeDasharray="560" strokeDashoffset="560" style={{ animation: 'tx-draw 2.6s ease-out .3s forwards' }} />
                  <path d="M 60 312 C 150 280, 150 170, 240 158 S 360 110, 408 50" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 25" style={{ animation: 'tx-flow 1.1s linear infinite' }} />
                  <g>
                    <circle cx="60" cy="312" r="9" fill="rgba(34,197,94,0.25)" style={{ transformOrigin: '60px 312px', animation: 'tx-pulse 2.4s ease-out infinite' }} />
                    <circle cx="60" cy="312" r="6" fill="#22C55E" stroke="#06160f" strokeWidth="2" />
                  </g>
                  <g>
                    <circle cx="408" cy="50" r="11" fill="rgba(245,135,24,0.25)" style={{ transformOrigin: '408px 50px', animation: 'tx-pulse 2.4s ease-out 1.2s infinite' }} />
                    <circle cx="408" cy="50" r="6.5" fill={NARANJA} stroke="#06160f" strokeWidth="2" />
                  </g>
                  <g>
                    <g transform="translate(-11,-11)">
                      <rect x="0" y="0" width="22" height="22" rx="7" fill="#fff" />
                      <path d="M5 14 h7 v-4 h2.5 l2 2.5 v1.5 h-0.5 M5 14 v-5 h7" fill="none" stroke={VERDE} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
                      <circle cx="7" cy="15.5" r="1.6" fill={VERDE} />
                      <circle cx="13.5" cy="15.5" r="1.6" fill={VERDE} />
                    </g>
                    <animateMotion dur="7s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="linear" rotate="0">
                      <mpath href="#tx-route" />
                    </animateMotion>
                  </g>
                </svg>
                <div style={{ position: 'absolute', left: 38, bottom: 22, fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>● Filadelfia</div>
                <div style={{ position: 'absolute', right: 24, top: 30, fontFamily: MONO, fontSize: 11, color: '#FCD9B0' }}>Asunción ◆</div>
                <div className="tx-floaty" style={{ position: 'absolute', top: 18, left: 16, padding: '10px 13px', borderRadius: 13, background: 'rgba(8,34,26,0.78)', border: '1px solid rgba(255,255,255,0.14)', backdropFilter: 'blur(6px)', animation: 'tx-float 5s ease-in-out infinite' }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Llegada estimada</div>
                  <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 20, color: '#fff', marginTop: 2 }}>2h 04m</div>
                </div>
                <div className="tx-floaty" style={{ position: 'absolute', bottom: 60, right: 16, padding: '10px 13px', borderRadius: 13, background: 'rgba(8,34,26,0.78)', border: '1px solid rgba(255,255,255,0.14)', backdropFilter: 'blur(6px)', animation: 'tx-floatB 6s ease-in-out infinite' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <Activity size={14} color={NARANJA} />
                    <div>
                      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 15, color: '#fff', lineHeight: 1 }}>45 cabezas</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>485 km · Gordos</div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ padding: '14px 16px', background: 'rgba(0,0,0,0.18)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>En tránsito con ganado</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: NARANJA }}>65%</span>
                </div>
                <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.12)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '65%', borderRadius: 99, background: `linear-gradient(90deg, ${VERDE}, ${NARANJA})` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ticker */}
        <div style={{ position: 'relative', zIndex: 2, borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.22)', overflow: 'hidden', padding: '11px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', width: 'max-content', animation: 'tx-marquee 32s linear infinite' }}>
            {[...LIVE_SHIPMENTS, ...LIVE_SHIPMENTS].map((s, i) => (
              <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '0 28px', whiteSpace: 'nowrap' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.state === 'Entregado' ? '#22C55E' : s.state === 'Cargando' ? '#EAB308' : NARANJA }} />
                <span style={{ fontFamily: MONO, fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>{s.id}</span>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>{s.route}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: s.state === 'Entregado' ? '#7CF0A8' : s.state === 'Cargando' ? '#F5D87C' : '#FCD9B0' }}>{s.state}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ESCENA PINNEADA: EL VIAJE (scroll-driven) ===== */}
      <section ref={pinRef} style={{ position: 'relative', height: motionOk ? '360vh' : 'auto', background: NOCHE }}>
        <div style={{ position: motionOk ? 'sticky' : 'relative', top: 0, height: motionOk ? '100vh' : 'auto', minHeight: motionOk ? undefined : '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: motionOk ? 0 : '60px 0' }}>
          <div className="tx-aurora-layer" aria-hidden style={{ position: 'absolute', top: '10%', right: '-8%', width: 620, height: 560, background: 'radial-gradient(circle, rgba(245,135,24,0.16), transparent 62%)', filter: 'blur(20px)', animation: 'tx-aurora 16s ease-in-out infinite' }} />
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.45, pointerEvents: 'none' }} aria-hidden>
            <rect width="100%" height="100%" fill="url(#tx-grid)" />
          </svg>

          <div style={{ position: 'relative', zIndex: 2, flex: 1, width: '100%', maxWidth: 1180, margin: '0 auto', padding: '0 28px', display: 'grid', gridTemplateColumns: 'minmax(0,0.82fr) minmax(0,1.18fr)', gap: 48, alignItems: 'center' }} className="tx-hero-grid">
            {/* Lado izquierdo: relato por etapas */}
            <div>
              <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: NARANJA }}>El viaje, de punta a punta</span>
              <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 'clamp(28px, 3.4vw, 40px)', letterSpacing: '-0.02em', color: '#fff', margin: '10px 0 28px' }}>Mirá un traslado en tiempo real</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {JOURNEY_STAGES.map((st, i) => {
                  const on = jStage >= i;
                  const current = jStage === i;
                  return (
                    <div key={st.t} style={{ display: 'flex', gap: 14, opacity: on ? 1 : 0.4, transition: 'opacity .35s ease' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: on ? (i === 3 ? '#22C55E' : NARANJA) : 'rgba(255,255,255,0.12)', boxShadow: current ? `0 0 0 5px ${i === 3 ? 'rgba(34,197,94,0.2)' : 'rgba(245,135,24,0.2)'}` : 'none', transition: 'all .35s ease' }}>
                          {on && <CheckCircle2 size={15} color="#fff" />}
                        </div>
                        {i < JOURNEY_STAGES.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 26, background: jStage > i ? NARANJA : 'rgba(255,255,255,0.12)', transition: 'background .35s ease' }} />}
                      </div>
                      <div style={{ paddingBottom: 8 }}>
                        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 17, color: current ? '#fff' : 'rgba(255,255,255,0.85)' }}>{st.t}</div>
                        <div style={{ fontSize: 13.5, lineHeight: 1.5, color: 'rgba(255,255,255,0.6)', marginTop: 2, maxWidth: 340 }}>{st.s}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Lado derecho: panel de rastreo manejado por el scroll */}
            <div style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', background: 'linear-gradient(160deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 30px 80px rgba(0,0,0,0.45)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.18)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Navigation size={15} color={NARANJA} />
                  <span style={{ fontFamily: MONO, fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>ENV-046 · seguimiento</span>
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: jStage === 3 ? '#7CF0A8' : '#FCD9B0' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: jStage === 3 ? '#22C55E' : NARANJA }} />
                  {jStage === 3 ? 'ENTREGADO' : 'EN VIVO'}
                </span>
              </div>
              <div style={{ position: 'relative', height: 380, background: `linear-gradient(180deg, #0a2a20, ${NOCHE})` }}>
                <svg viewBox="0 0 600 380" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                  <g fill="rgba(255,255,255,0.06)">
                    {Array.from({ length: 8 }).map((_, r) =>
                      Array.from({ length: 13 }).map((_, c) => (
                        <circle key={`${r}-${c}`} cx={20 + c * 46} cy={28 + r * 46} r="1.3" />
                      ))
                    )}
                  </g>
                  {/* ruta base */}
                  <path d="M 60 300 C 180 280, 160 150, 300 150 S 470 110, 540 60" fill="none" stroke="rgba(245,135,24,0.18)" strokeWidth="4" strokeLinecap="round" />
                  {/* ruta recorrida (atada al scroll) */}
                  <path ref={journeyPath} d="M 60 300 C 180 280, 160 150, 300 150 S 470 110, 540 60" fill="none" stroke={NARANJA} strokeWidth="4" strokeLinecap="round" strokeDasharray={len || 1} strokeDashoffset={(len || 1) * (1 - p)} />
                  {/* origen */}
                  <circle cx="60" cy="300" r="7" fill="#22C55E" stroke="#06160f" strokeWidth="2" />
                  {/* destino */}
                  <g>
                    {jStage === 3 && <circle cx="540" cy="60" r="13" fill="rgba(34,197,94,0.25)" style={{ transformOrigin: '540px 60px', animation: 'tx-pulse 2s ease-out infinite' }} />}
                    <circle cx="540" cy="60" r="7.5" fill={jStage === 3 ? '#22C55E' : NARANJA} stroke="#06160f" strokeWidth="2" />
                  </g>
                  {/* camión en la posición del scroll */}
                  <g transform={`translate(${jPt.x - 13}, ${jPt.y - 13})`}>
                    <circle cx="13" cy="13" r="17" fill="rgba(245,135,24,0.18)" />
                    <rect x="2" y="2" width="22" height="22" rx="7" fill="#fff" />
                    <path d="M7 16 h7 v-4 h2.5 l2 2.5 v1.5 h-0.5 M7 16 v-5 h7" fill="none" stroke={VERDE} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" transform="translate(0,0)" />
                  </g>
                </svg>
                <div style={{ position: 'absolute', left: 30, bottom: 18, fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>● Filadelfia</div>
                <div style={{ position: 'absolute', right: 22, top: 26, fontFamily: MONO, fontSize: 11, color: jStage === 3 ? '#7CF0A8' : '#FCD9B0' }}>Asunción ◆</div>
                <div style={{ position: 'absolute', top: 16, left: 16, padding: '10px 13px', borderRadius: 13, background: 'rgba(8,34,26,0.8)', border: '1px solid rgba(255,255,255,0.14)' }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{jStage === 3 ? 'Llegó' : 'Llegada estimada'}</div>
                  <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 20, color: '#fff', marginTop: 2 }}>{jStage === 3 ? '✓ Entregado' : jEta}</div>
                </div>
                <div style={{ position: 'absolute', bottom: 64, right: 16, padding: '10px 13px', borderRadius: 13, background: 'rgba(8,34,26,0.8)', border: '1px solid rgba(255,255,255,0.14)' }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Distancia restante</div>
                  <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 18, color: NARANJA, marginTop: 2 }}>{jKm} km</div>
                </div>
              </div>
              <div style={{ padding: '14px 16px', background: 'rgba(0,0,0,0.18)', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{JOURNEY_STAGES[jStage].t}</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: jStage === 3 ? '#7CF0A8' : NARANJA }}>{jPct}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.12)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${jPct}%`, borderRadius: 99, background: jStage === 3 ? '#22C55E' : `linear-gradient(90deg, ${VERDE}, ${NARANJA})` }} />
                </div>
              </div>
            </div>
          </div>

          <div style={{ position: 'relative', zIndex: 2, height: 3, background: 'rgba(255,255,255,0.08)' }}>
            <div style={{ height: '100%', width: `${jPct}%`, background: NARANJA }} />
          </div>
        </div>
      </section>

      {/* ===== BENTO FEATURES ===== */}
      <section id="features" style={{ padding: '92px 28px', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="tx-reveal" style={{ textAlign: 'center', marginBottom: 48 }}>
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: NARANJA }}>La plataforma</span>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 'clamp(28px, 3.4vw, 40px)', letterSpacing: '-0.02em', color: '#0c1f17', margin: '10px 0 0' }}>Tecnología pensada para el campo</h2>
          </div>

          <div className="tx-bento tx-reveal">
            {/* Rastreo (grande 2x2) */}
            <div className="tx-card" style={{ gridColumn: 'span 2', gridRow: 'span 2', borderRadius: 22, padding: '26px', background: `linear-gradient(160deg, ${VERDE}, ${NOCHE})`, position: 'relative', overflow: 'hidden', color: '#fff', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
                <MapPin size={20} color={NARANJA} />
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.6)' }}>Rastreo en tiempo real</span>
              </div>
              <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 24, margin: '0 0 8px' }}>Sabé dónde está tu ganado, siempre</h3>
              <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'rgba(255,255,255,0.8)', margin: 0, maxWidth: 320 }}>Ubicación en vivo, ETA y estado de cada traslado — de la carga a la entrega, sin una sola llamada.</p>
              <div style={{ marginTop: 'auto', position: 'relative', height: 110 }}>
                <svg viewBox="0 0 400 110" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} aria-hidden>
                  <path id="tx-mini" d="M 20 88 C 110 80, 130 30, 220 36 S 350 26, 384 18" fill="none" stroke="rgba(245,135,24,0.25)" strokeWidth="3" strokeLinecap="round" />
                  <path d="M 20 88 C 110 80, 130 30, 220 36 S 350 26, 384 18" fill="none" stroke={NARANJA} strokeWidth="3" strokeLinecap="round" strokeDasharray="3 22" style={{ animation: 'tx-flow 1.1s linear infinite' }} />
                  <circle cx="20" cy="88" r="5" fill="#22C55E" />
                  <circle cx="384" cy="18" r="5.5" fill={NARANJA} />
                  <g>
                    <circle r="5" fill="#fff" />
                    <animateMotion dur="6s" repeatCount="indefinite"><mpath href="#tx-mini" /></animateMotion>
                  </g>
                </svg>
              </div>
            </div>

            {/* Verificados */}
            <div className="tx-card" style={{ borderRadius: 22, padding: '22px', background: '#fbfaf6', border: '1px solid #eee9dd' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#1E512610', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <Shield size={21} color={VERDE} />
              </div>
              <h3 style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 17, color: '#0c1f17', margin: '0 0 6px' }}>Transportistas verificados</h3>
              <p style={{ fontSize: 13.5, lineHeight: 1.5, color: '#5b6b63', margin: 0 }}>Habilitación SENACSA y SITRAP validada antes de operar.</p>
            </div>

            {/* Documentación (tall) */}
            <div className="tx-card" style={{ gridRow: 'span 2', borderRadius: 22, padding: '22px', background: '#0c1f17', color: '#fff', display: 'flex', flexDirection: 'column' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(245,135,24,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <FileText size={21} color={NARANJA} />
              </div>
              <h3 style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 17, margin: '0 0 6px' }}>Documentación digital</h3>
              <p style={{ fontSize: 13.5, lineHeight: 1.5, color: 'rgba(255,255,255,0.7)', margin: '0 0 16px' }}>Guía de Traslado y COTA, sin papeles.</p>
              <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 9 }}>
                {['Guía SENACSA', 'COTA', 'Certificado de descarga'].map(d => (
                  <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 11px', borderRadius: 10, background: 'rgba(255,255,255,0.06)' }}>
                    <CheckCircle2 size={15} color="#7CF0A8" />
                    <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.85)' }}>{d}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Precios (mini chart) */}
            <div className="tx-card" style={{ borderRadius: 22, padding: '22px', background: '#fbfaf6', border: '1px solid #eee9dd' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#1E512610', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={21} color={VERDE} />
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 40 }}>
                  {[40, 62, 50, 78, 95].map((h, i) => (
                    <div key={i} style={{ width: 8, height: `${h}%`, borderRadius: 3, background: i === 4 ? NARANJA : '#cde0d2' }} />
                  ))}
                </div>
              </div>
              <h3 style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 17, color: '#0c1f17', margin: '0 0 6px' }}>Precios transparentes</h3>
              <p style={{ fontSize: 13.5, lineHeight: 1.5, color: '#5b6b63', margin: 0 }}>Cotizá antes de contratar. Sin costos ocultos.</p>
            </div>

            {/* Pagos */}
            <div className="tx-card" style={{ borderRadius: 22, padding: '22px', background: '#fbfaf6', border: '1px solid #eee9dd' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: '#1E512610', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <DollarSign size={21} color={VERDE} />
              </div>
              <h3 style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 17, color: '#0c1f17', margin: '0 0 6px' }}>Pagos en Guaraníes</h3>
              <p style={{ fontSize: 13.5, lineHeight: 1.5, color: '#5b6b63', margin: 0 }}>Transacciones seguras en moneda local.</p>
            </div>

            {/* Soporte (wide) */}
            <div className="tx-card" style={{ gridColumn: 'span 2', borderRadius: 22, padding: '22px', background: '#fbfaf6', border: '1px solid #eee9dd', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 13, background: '#1E512610', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Headphones size={22} color={VERDE} />
              </div>
              <div>
                <h3 style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 17, color: '#0c1f17', margin: '0 0 4px' }}>Soporte durante todo el viaje</h3>
                <p style={{ fontSize: 13.5, lineHeight: 1.5, color: '#5b6b63', margin: 0 }}>Asistencia por WhatsApp desde la carga hasta la entrega.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== COBERTURA (mapa de red) ===== */}
      <section id="cobertura" style={{ padding: '92px 28px', background: NOCHE, position: 'relative', overflow: 'hidden' }}>
        <div className="tx-aurora-layer" aria-hidden style={{ position: 'absolute', top: '20%', left: '50%', width: 700, height: 600, background: 'radial-gradient(circle, rgba(30,81,38,0.5), transparent 60%)', filter: 'blur(20px)', animation: 'tx-aurora 16s ease-in-out infinite' }} />
        <div className="tx-show-grid tx-reveal" style={{ position: 'relative', zIndex: 2, maxWidth: 1100, margin: '0 auto' }}>
          <div>
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: NARANJA }}>Cobertura</span>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 'clamp(28px, 3.4vw, 40px)', letterSpacing: '-0.02em', color: '#fff', margin: '10px 0 14px' }}>Una red que llega a todo el país</h2>
            <p style={{ fontSize: 17, lineHeight: 1.6, color: 'rgba(255,255,255,0.72)', margin: '0 0 28px', maxWidth: 420 }}>
              Del Chaco a la frontera con Brasil y Argentina: transportistas operando en los 17 departamentos, conectados a una sola plataforma.
            </p>
            <div style={{ display: 'flex', gap: 30, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 34, color: NARANJA }}><CountUp to={17} /></div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>Departamentos</div>
              </div>
              <div>
                <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 34, color: '#fff' }}><CountUp to={400} suffix="+" /></div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>Rutas activas</div>
              </div>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <svg viewBox="0 0 600 460" style={{ width: '100%', height: 'auto', display: 'block' }} aria-hidden>
              <defs>
                <radialGradient id="tx-terr" cx="45%" cy="55%" r="60%">
                  <stop offset="0%" stopColor="rgba(124,240,168,0.10)" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
              </defs>
              <ellipse cx="280" cy="250" rx="280" ry="210" fill="url(#tx-terr)" />
              <g fill="rgba(255,255,255,0.05)">
                {Array.from({ length: 9 }).map((_, r) =>
                  Array.from({ length: 12 }).map((_, c) => (
                    <circle key={`${r}-${c}`} cx={20 + c * 50} cy={24 + r * 50} r="1.4" />
                  ))
                )}
              </g>
              {/* rutas desde el hub (Asunción) */}
              {CITIES.filter(c => !c.hub).map((c, i) => {
                const hub = CITIES.find(h => h.hub)!;
                return (
                  <g key={c.name}>
                    <line x1={hub.x} y1={hub.y} x2={c.x} y2={c.y} stroke="rgba(245,135,24,0.18)" strokeWidth="1.5" />
                    <line x1={hub.x} y1={hub.y} x2={c.x} y2={c.y} stroke={NARANJA} strokeWidth="1.5" strokeDasharray="2 16" strokeDashoffset={i * 8} style={{ animation: `tx-flowmap ${4 + (i % 3)}s linear infinite` }} />
                  </g>
                );
              })}
              {/* nodos */}
              {CITIES.map((c, i) => (
                <g key={c.name}>
                  {c.hub && <circle cx={c.x} cy={c.y} r="16" fill="rgba(245,135,24,0.18)" style={{ transformOrigin: `${c.x}px ${c.y}px`, animation: 'tx-pulse 2.6s ease-out infinite' }} />}
                  <circle cx={c.x} cy={c.y} r={c.hub ? 8 : 5} fill={c.hub ? NARANJA : '#7CF0A8'} stroke={NOCHE} strokeWidth="2" />
                  <text x={c.x} y={c.y - (c.hub ? 16 : 11)} textAnchor="middle" fontFamily={MONO} fontSize="11" fill={c.hub ? '#FCD9B0' : 'rgba(255,255,255,0.65)'}>{c.name}</text>
                </g>
              ))}
            </svg>
          </div>
        </div>
      </section>

      {/* ===== SHOWCASE POR ROL ===== */}
      <section id="roles" style={{ padding: '92px 28px', background: NEUTRO }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="tx-reveal" style={{ textAlign: 'center', marginBottom: 36 }}>
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: NARANJA }}>Para quién es</span>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 'clamp(28px, 3.4vw, 40px)', letterSpacing: '-0.02em', color: '#0c1f17', margin: '10px 0 0' }}>Una plataforma, cada rol del negocio</h2>
          </div>

          {/* tabs */}
          <div className="tx-reveal" style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 36 }}>
            {ROLES.map((r, i) => {
              const Icon = r.icon;
              const active = role === i;
              return (
                <button key={r.key} onClick={() => setRole(i)} className="tx-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 20px', borderRadius: 12, cursor: 'pointer', fontFamily: BODY, fontSize: 15, fontWeight: 700, border: active ? 'none' : '1px solid #ddd6c8', background: active ? VERDE : '#fff', color: active ? '#fff' : '#5b6b63', boxShadow: active ? '0 10px 24px rgba(30,81,38,0.25)' : 'none' }}>
                  <Icon size={18} color={active ? NARANJA : VERDE} /> {r.title}
                </button>
              );
            })}
          </div>

          <div className="tx-show-grid tx-reveal">
            <div key={role} className="tx-fade">
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: 16, background: VERDE, marginBottom: 18 }}>
                <ActiveRoleIcon size={27} color={NARANJA} />
              </div>
              <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 28, letterSpacing: '-0.02em', color: '#0c1f17', margin: '0 0 12px' }}>{ROLES[role].title}</h3>
              <p style={{ fontSize: 17, lineHeight: 1.6, color: '#5b6b63', margin: '0 0 22px' }}>{ROLES[role].tagline}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {ROLES[role].bullets.map(b => (
                  <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 8, background: '#1E512612', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <CheckCircle2 size={15} color={VERDE} />
                    </div>
                    <span style={{ fontSize: 15, color: '#33433b' }}>{b}</span>
                  </div>
                ))}
              </div>
              <button onClick={onSignup} className="tx-btn" style={{ marginTop: 26, fontFamily: BODY, fontSize: 15, fontWeight: 700, padding: '13px 24px', borderRadius: 12, background: NARANJA, color: '#fff', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, boxShadow: '0 10px 24px rgba(245,135,24,0.3)' }}>
                Empezar como {ROLES[role].title} <ArrowRight size={17} />
              </button>
            </div>

            {/* mockup de app */}
            <div key={`mock-${role}`} className="tx-fade" style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: '100%', maxWidth: 360, borderRadius: 26, background: '#fff', border: '1px solid #e7e2d6', boxShadow: '0 30px 70px rgba(8,34,26,0.18)', overflow: 'hidden' }}>
                <div style={{ background: `linear-gradient(150deg, ${VERDE}, ${NOCHE})`, padding: '18px 18px 16px', color: '#fff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{ROLES[role].title}</span>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: '#FCD9B0' }}>TROPEX</span>
                  </div>
                  <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 20, marginTop: 8 }}>
                    {role === 0 && 'Tus traslados'}
                    {role === 1 && 'Tu flota'}
                    {role === 2 && 'Viaje actual'}
                    {role === 3 && 'Tu viaje de hoy'}
                  </div>
                </div>
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 230 }}>
                  {role === 0 && [
                    { r: 'Filadelfia → Asunción', s: '3 ofertas nuevas', c: NARANJA },
                    { r: 'Loma Plata → V. Hayes', s: 'Esperando ofertas', c: '#9CA3AF' },
                    { r: 'Concepción → Central', s: 'Adjudicado', c: VERDE },
                  ].map(o => (
                    <div key={o.r} style={{ border: '1px solid #eee9dd', borderRadius: 14, padding: '13px 14px' }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#0c1f17' }}>{o.r}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: o.c, marginTop: 3 }}>{o.s}</div>
                    </div>
                  ))}
                  {role === 1 && [
                    { r: 'PARA-01 · Volvo FH', s: 'En ruta · ENV-046', c: NARANJA },
                    { r: 'PARA-02 · Scania', s: 'Disponible', c: VERDE },
                    { r: 'PARA-03 · Iveco', s: 'En mantenimiento', c: '#9CA3AF' },
                  ].map(o => (
                    <div key={o.r} style={{ border: '1px solid #eee9dd', borderRadius: 14, padding: '13px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Truck size={18} color={VERDE} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#0c1f17' }}>{o.r}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: o.c, marginTop: 2 }}>{o.s}</div>
                      </div>
                    </div>
                  ))}
                  {role === 2 && (
                    <>
                      <div style={{ borderRadius: 16, padding: '16px', background: `linear-gradient(150deg, ${VERDE}, ${NOCHE})`, color: '#fff' }}>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Ganancia del viaje</div>
                        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 24, color: NARANJA }}>₲ 1.750.000</div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>Filadelfia → Asunción · 485 km</div>
                      </div>
                      <div style={{ border: '1px solid #eee9dd', borderRadius: 14, padding: '13px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 13, color: '#5b6b63' }}>Estado</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: VERDE }}>En tránsito · 65%</span>
                      </div>
                    </>
                  )}
                  {role === 3 && (
                    <>
                      <div style={{ border: '1px solid #eee9dd', borderRadius: 16, padding: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#0c1f17' }}>En tránsito con ganado</span>
                          <span style={{ fontSize: 13, fontWeight: 800, color: NARANJA }}>65%</span>
                        </div>
                        <div style={{ height: 7, borderRadius: 99, background: '#eee9dd' }}>
                          <div style={{ height: '100%', width: '65%', borderRadius: 99, background: `linear-gradient(90deg, ${VERDE}, ${NARANJA})` }} />
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <div style={{ flex: 1, border: '1px solid #eee9dd', borderRadius: 14, padding: '12px', textAlign: 'center' }}>
                          <FileText size={18} color={NARANJA} style={{ margin: '0 auto 4px' }} />
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#0c1f17' }}>Subir COTA</div>
                        </div>
                        <div style={{ flex: 1, border: '1px solid #eee9dd', borderRadius: 14, padding: '12px', textAlign: 'center' }}>
                          <Clock size={18} color={VERDE} style={{ margin: '0 auto 4px' }} />
                          <div style={{ fontSize: 12, fontWeight: 700, color: '#0c1f17' }}>ETA 2h 04m</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== MÉTRICAS (count-up) ===== */}
      <section style={{ padding: '64px 28px', background: `linear-gradient(135deg, ${VERDE}, ${NOCHE})` }}>
        <div className="tx-reveal tx-metrics" style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 'clamp(30px, 4vw, 44px)', color: '#fff' }}><CountUp to={17} /></div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>Departamentos cubiertos</div>
          </div>
          <div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 'clamp(30px, 4vw, 44px)', color: NARANJA }}><CountUp to={100} suffix="%" /></div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>Documentación digital</div>
          </div>
          <div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 'clamp(30px, 4vw, 44px)', color: '#fff' }}>2 min</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>Para publicar un traslado</div>
          </div>
          <div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 'clamp(30px, 4vw, 44px)', color: NARANJA }}>24/7</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>Seguimiento en vivo</div>
          </div>
        </div>
      </section>

      {/* ===== CÓMO FUNCIONA ===== */}
      <section style={{ padding: '92px 28px', background: '#fff' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div className="tx-reveal" style={{ textAlign: 'center', marginBottom: 56 }}>
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: NARANJA }}>Cómo funciona</span>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 'clamp(28px, 3.4vw, 40px)', letterSpacing: '-0.02em', color: '#0c1f17', margin: '10px 0 0' }}>Tres pasos, cero papeles</h2>
          </div>
          <div className="tx-steps tx-reveal" style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: 28, left: '16%', right: '16%', height: 2, background: `repeating-linear-gradient(90deg, ${NARANJA} 0 10px, transparent 10px 20px)`, opacity: 0.5 }} />
            {[
              { num: '01', title: 'Publicá tu traslado', desc: 'Origen, destino, cantidad de ganado y fecha. Toma 2 minutos.' },
              { num: '02', title: 'Recibí ofertas', desc: 'Transportistas verificados de todo el país te cotizan al instante.' },
              { num: '03', title: 'Rastreá en vivo', desc: 'Seguí cada traslado de la carga a la entrega, con documentación digital.' },
            ].map((step) => (
              <div key={step.num} style={{ position: 'relative', textAlign: 'center', background: '#fff', padding: '0 8px' }}>
                <div style={{ width: 58, height: 58, borderRadius: 17, background: NOCHE, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 12px 28px rgba(8,34,26,0.22)' }}>
                  <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 18, color: NARANJA }}>{step.num}</span>
                </div>
                <h3 style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 19, color: '#0c1f17', margin: '0 0 9px' }}>{step.title}</h3>
                <p style={{ fontSize: 15, lineHeight: 1.6, color: '#5b6b63', margin: 0 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section style={{ padding: '40px 28px 96px', background: NEUTRO }}>
        <div className="tx-reveal" style={{ maxWidth: 980, margin: '0 auto', position: 'relative', borderRadius: 32, overflow: 'hidden', background: `linear-gradient(140deg, ${VERDE}, ${NOCHE})`, padding: '64px 40px', textAlign: 'center' }}>
          <div className="tx-aurora-layer" aria-hidden style={{ position: 'absolute', top: '-40%', right: '-10%', width: 460, height: 460, background: 'radial-gradient(circle, rgba(245,135,24,0.3), transparent 60%)', filter: 'blur(20px)', animation: 'tx-aurora 14s ease-in-out infinite' }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'inline-flex', marginBottom: 22 }}>
              <img src="/tropex-isotipo.png" alt="TROPEX" style={{ height: 54, width: 'auto' }} />
            </div>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 'clamp(30px, 4vw, 44px)', letterSpacing: '-0.02em', color: '#fff', margin: '0 0 14px' }}>Movés ganado. Nosotros lo hacemos simple.</h2>
            <p style={{ fontSize: 18, lineHeight: 1.6, color: 'rgba(255,255,255,0.8)', margin: '0 0 32px' }}>Registrate gratis y publicá tu primer traslado en minutos.</p>
            <button onClick={onSignup} className="tx-btn" style={{ fontFamily: BODY, fontSize: 17, fontWeight: 700, padding: '16px 36px', borderRadius: 14, background: NARANJA, color: '#fff', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10, boxShadow: '0 14px 34px rgba(245,135,24,0.4)' }}>
              Registrarte gratis <ArrowRight size={19} />
            </button>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ background: NOCHE, padding: '56px 28px 36px' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto' }}>
          <div className="tx-foot" style={{ marginBottom: 40 }}>
            <div>
              <BrandLogo height={30} />
              <p style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.5)', margin: '14px 0 0', maxWidth: 280 }}>
                Agrotech Logistics. Conectamos el ganado de Paraguay con transporte verificado y trazable.
              </p>
            </div>
            {[
              { t: 'Plataforma', links: ['Cómo funciona', 'Cobertura', 'Para quién', 'Precios'] },
              { t: 'Empresa', links: ['Nosotros', 'Contacto', 'Trabajá con nosotros'] },
              { t: 'Legal', links: ['Términos', 'Privacidad', 'Ayuda'] },
            ].map(col => (
              <div key={col.t}>
                <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 14, color: '#fff', marginBottom: 14 }}>{col.t}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {col.links.map(l => (
                    <a key={l} href="#" className="tx-link" style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', textDecoration: 'none' }}>{l}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 22, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', margin: 0 }}>© 2026 TROPEX · Agrotech Logistics · Paraguay</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              {onCasosBordeClick && (
                <button onClick={onCasosBordeClick} style={{ fontFamily: BODY, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer' }}>Casos borde</button>
              )}
              {onAdminClick && (
                <button onClick={onAdminClick} style={{ fontFamily: BODY, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)', background: 'none', border: 'none', cursor: 'pointer' }}>Admin</button>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
