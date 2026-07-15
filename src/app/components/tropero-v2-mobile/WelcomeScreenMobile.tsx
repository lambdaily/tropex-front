import { useState, useRef, useEffect } from 'react';
import { Shield, MapPin, DollarSign, Truck, ArrowRight, Radio, Navigation, Activity, ChevronDown, CheckCircle2, FileText } from 'lucide-react';
import { BrandLogo } from '../BrandLogo';

interface WelcomeScreenMobileProps {
  onSignup: () => void;
  onLogin: () => void;
}

const DISPLAY = "'Space Grotesk', system-ui, sans-serif";
const BODY = "'IBM Plex Sans', system-ui, sans-serif";
const MONO = "ui-monospace, 'SF Mono', Menlo, monospace";

const VERDE = '#1E5126';
const NOCHE = '#08221A';
const NARANJA = '#F58718';

const LIVE_SHIPMENTS = [
  { id: 'ENV-046', route: 'Filadelfia → Asunción' },
  { id: 'ENV-051', route: 'Loma Plata → V. Hayes' },
  { id: 'ENV-039', route: 'Concepción → Asunción' },
  { id: 'ENV-058', route: 'Mariscal E. → Central' },
];

const CITIES = [
  { name: 'Mariscal E.', x: 96, y: 70 },
  { name: 'Filadelfia', x: 158, y: 118 },
  { name: 'Concepción', x: 322, y: 120 },
  { name: 'P.J.C.', x: 432, y: 104 },
  { name: 'Asunción', x: 236, y: 250, hub: true },
  { name: 'C. Oviedo', x: 372, y: 262 },
  { name: 'C. del Este', x: 506, y: 244 },
  { name: 'Villarrica', x: 356, y: 322 },
  { name: 'Pilar', x: 196, y: 392 },
  { name: 'Encarnación', x: 446, y: 404 },
];

const FEATURES = [
  { icon: Shield, title: 'Transportistas verificados', desc: 'Todos con habilitación SENACSA y SITRAP validada antes de operar.' },
  { icon: MapPin, title: 'Rastreo en tiempo real', desc: 'Seguí cada traslado de la carga a la entrega, con ubicación en vivo.' },
  { icon: DollarSign, title: 'Precios transparentes', desc: 'Cotizá antes de contratar. Sin sorpresas, todo en Guaraníes.' },
  { icon: Truck, title: 'Cobertura nacional', desc: 'Transportistas en los 17 departamentos de Paraguay.' },
];

const JOURNEY_STAGES = [
  { t: 'En el origen', s: 'Cargando 45 cabezas en la estancia.' },
  { t: 'En tránsito', s: 'Rumbo a Asunción · ubicación en vivo.' },
  { t: 'Llegando', s: 'Últimos kilómetros al frigorífico.' },
  { t: 'Entregado', s: 'Descarga y documentación completas.' },
];

const reduceMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
            setVal(Math.round(to * (1 - Math.pow(1 - p, 3))));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration]);
  return <span ref={ref}>{val}{suffix}</span>;
}

export function WelcomeScreenMobile({ onSignup, onLogin }: WelcomeScreenMobileProps) {
  const [feat, setFeat] = useState(0);
  const scRef = useRef<HTMLDivElement>(null);

  const onCarouselScroll = () => {
    const el = scRef.current;
    if (!el) return;
    setFeat(Math.round(el.scrollLeft / el.clientWidth));
  };
  const goToFeat = (i: number) => {
    const el = scRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
  };

  // ── Escena pinneada del viaje, atada al scroll ──
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
  const jPt = (journeyPath.current && len) ? journeyPath.current.getPointAtLength(Math.min(p, 1) * len) : { x: 46, y: 250 };

  // reveal al hacer scroll
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('.txm-reveal'));
    if (!('IntersectionObserver' in window) || reduceMotion()) { els.forEach(el => el.classList.add('txm-in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('txm-in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div style={{ fontFamily: BODY, background: '#fff', minHeight: '100dvh' }}>
      <style>{`
        @keyframes txm-draw { to { stroke-dashoffset: 0; } }
        @keyframes txm-flow { to { stroke-dashoffset: -28; } }
        @keyframes txm-flowmap { to { stroke-dashoffset: -200; } }
        @keyframes txm-pulse { 0% { transform: scale(.5); opacity: .65; } 100% { transform: scale(2.6); opacity: 0; } }
        @keyframes txm-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes txm-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes txm-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes txm-blink { 0%,100% { opacity: 1; } 50% { opacity: .35; } }
        @keyframes txm-bob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(5px); } }
        @keyframes txm-aurora { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(5%,4%) scale(1.18); } }
        .txm-up { animation: txm-up .6s cubic-bezier(.2,.7,.3,1) both; }
        .txm-reveal { opacity: 0; transform: translateY(22px); transition: opacity .6s ease, transform .6s ease; }
        .txm-reveal.txm-in { opacity: 1; transform: none; }
        .txm-scroll { scrollbar-width: none; -ms-overflow-style: none; }
        .txm-scroll::-webkit-scrollbar { display: none; }
        @media (prefers-reduced-motion: reduce) { .txm-up { animation: none; } .txm-reveal { opacity: 1; transform: none; } svg *, .txm-floaty, .txm-aurora { animation: none !important; } }
      `}</style>

      {/* ===== HERO ===== */}
      <section style={{ position: 'relative', overflow: 'hidden', background: NOCHE, minHeight: '100dvh', display: 'flex', flexDirection: 'column', padding: '14px 18px calc(86px + env(safe-area-inset-bottom))' }}>
        <div className="txm-aurora" aria-hidden style={{ position: 'absolute', top: '-8%', right: '-25%', width: 420, height: 420, background: 'radial-gradient(circle, rgba(245,135,24,0.24), transparent 62%)', filter: 'blur(14px)', animation: 'txm-aurora 14s ease-in-out infinite' }} />
        <div className="txm-aurora" aria-hidden style={{ position: 'absolute', bottom: '4%', left: '-30%', width: 460, height: 460, background: 'radial-gradient(circle, rgba(30,81,38,0.6), transparent 60%)', filter: 'blur(14px)', animation: 'txm-aurora 18s ease-in-out infinite reverse' }} />
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.5, pointerEvents: 'none' }} aria-hidden>
          <defs>
            <pattern id="txm-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#txm-grid)" />
        </svg>

        <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* top bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <BrandLogo height={28} />
            <button onClick={onLogin} style={{ fontFamily: BODY, fontSize: 13, fontWeight: 600, color: '#fff', background: 'none', border: 'none', padding: 4 }}>Iniciar sesión</button>
          </div>

          {/* headline */}
          <div style={{ marginTop: 24 }}>
            <div className="txm-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 99, background: 'rgba(245,135,24,0.12)', border: '1px solid rgba(245,135,24,0.3)', marginBottom: 14 }}>
              <Radio size={13} color={NARANJA} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#FCD9B0' }}>Logística ganadera inteligente</span>
            </div>
            <h1 className="txm-up" style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 'clamp(31px, 9vw, 42px)', lineHeight: 1.05, letterSpacing: '-0.03em', color: '#fff', margin: 0 }}>
              El ganado de Paraguay,<br />
              <span style={{ background: `linear-gradient(100deg, ${NARANJA}, #ffb866)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>rastreado en vivo</span>
            </h1>
            <p className="txm-up" style={{ fontSize: 15, lineHeight: 1.55, color: 'rgba(255,255,255,0.72)', margin: '12px 0 0' }}>
              Conectá ganaderos y transportistas verificados. Cotizá, contratá y seguí cada traslado al instante.
            </p>
          </div>

          {/* tarjeta de rastreo */}
          <div className="txm-up" style={{ marginTop: 18 }}>
            <div style={{ borderRadius: 20, overflow: 'hidden', background: 'linear-gradient(160deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.13)', boxShadow: '0 22px 50px rgba(0,0,0,0.45)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Navigation size={14} color={NARANJA} />
                  <span style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.85)' }}>ENV-046 · seguimiento</span>
                </div>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, color: '#7CF0A8' }}>
                  <span className="txm-floaty" style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', animation: 'txm-blink 1.6s ease-in-out infinite' }} />
                  EN VIVO
                </span>
              </div>
              <div style={{ position: 'relative', height: 192, background: `linear-gradient(180deg, #0a2a20, ${NOCHE})` }}>
                <svg viewBox="0 0 360 192" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} aria-hidden>
                  <g fill="none" stroke="rgba(124,240,168,0.10)" strokeWidth="1">
                    <path d="M -20 130 Q 110 85 190 120 T 400 100" />
                    <path d="M -20 158 Q 120 114 200 146 T 400 130" />
                  </g>
                  <g fill="rgba(255,255,255,0.07)">
                    {Array.from({ length: 4 }).map((_, r) =>
                      Array.from({ length: 9 }).map((_, c) => (
                        <circle key={`${r}-${c}`} cx={20 + c * 42} cy={26 + r * 46} r="1.1" />
                      ))
                    )}
                  </g>
                  <path id="txm-route" d="M 46 160 C 120 140, 120 74, 200 68 S 300 42, 322 28" fill="none" stroke="rgba(245,135,24,0.22)" strokeWidth="3" strokeLinecap="round" />
                  <path d="M 46 160 C 120 140, 120 74, 200 68 S 300 42, 322 28" fill="none" stroke={NARANJA} strokeWidth="3" strokeLinecap="round" strokeDasharray="440" strokeDashoffset="440" style={{ animation: 'txm-draw 2.4s ease-out .3s forwards' }} />
                  <path d="M 46 160 C 120 140, 120 74, 200 68 S 300 42, 322 28" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="3 22" style={{ animation: 'txm-flow 1.1s linear infinite' }} />
                  <g>
                    <circle cx="46" cy="160" r="8" fill="rgba(34,197,94,0.25)" style={{ transformOrigin: '46px 160px', animation: 'txm-pulse 2.4s ease-out infinite' }} />
                    <circle cx="46" cy="160" r="5" fill="#22C55E" stroke="#06160f" strokeWidth="1.8" />
                  </g>
                  <g>
                    <circle cx="322" cy="28" r="9" fill="rgba(245,135,24,0.25)" style={{ transformOrigin: '322px 28px', animation: 'txm-pulse 2.4s ease-out 1.2s infinite' }} />
                    <circle cx="322" cy="28" r="5.5" fill={NARANJA} stroke="#06160f" strokeWidth="1.8" />
                  </g>
                  <g>
                    <g transform="translate(-9,-9)">
                      <rect x="0" y="0" width="18" height="18" rx="6" fill="#fff" />
                      <path d="M4 11.5 h6 v-3.5 h2 l1.6 2 v1.5 M4 11.5 v-4 h6" fill="none" stroke={VERDE} strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" />
                    </g>
                    <animateMotion dur="7s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="linear"><mpath href="#txm-route" /></animateMotion>
                  </g>
                </svg>
                <div style={{ position: 'absolute', left: 30, bottom: 12, fontFamily: MONO, fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>● Filadelfia</div>
                <div style={{ position: 'absolute', right: 16, top: 16, fontFamily: MONO, fontSize: 10, color: '#FCD9B0' }}>Asunción ◆</div>
                <div className="txm-floaty" style={{ position: 'absolute', top: 12, left: 12, padding: '7px 10px', borderRadius: 11, background: 'rgba(8,34,26,0.8)', border: '1px solid rgba(255,255,255,0.14)', animation: 'txm-float 5s ease-in-out infinite' }}>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Llegada</div>
                  <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 15, color: '#fff' }}>2h 04m</div>
                </div>
                <div className="txm-floaty" style={{ position: 'absolute', bottom: 36, right: 12, padding: '7px 10px', borderRadius: 11, background: 'rgba(8,34,26,0.8)', border: '1px solid rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', gap: 6, animation: 'txm-float 6s ease-in-out infinite' }}>
                  <Activity size={13} color={NARANJA} />
                  <div>
                    <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 13, color: '#fff', lineHeight: 1 }}>45 cab.</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)', marginTop: 1 }}>485 km</div>
                  </div>
                </div>
              </div>
              <div style={{ padding: '11px 14px', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>En tránsito con ganado</span>
                  <span style={{ fontSize: 11, fontWeight: 800, color: NARANJA }}>65%</span>
                </div>
                <div style={{ height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.12)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '65%', borderRadius: 99, background: `linear-gradient(90deg, ${VERDE}, ${NARANJA})` }} />
                </div>
              </div>
            </div>
          </div>

          {/* stats (rellenan la pantalla) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 20 }}>
            {[{ v: 'Todo el país', l: 'Cobertura' }, { v: 'SENACSA', l: 'Verificados' }, { v: '24/7', l: 'En vivo' }].map((s, i) => (
              <div key={s.l} style={{ textAlign: 'center', padding: '11px 6px', borderRadius: 13, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 14, color: i === 1 ? NARANJA : '#fff' }}>{s.v}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>

          <div className="txm-floaty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, marginTop: 'auto', paddingTop: 16, animation: 'txm-bob 2s ease-in-out infinite' }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Deslizá para ver más</span>
            <ChevronDown size={16} color="rgba(255,255,255,0.5)" />
          </div>
        </div>
      </section>

      {/* ===== TICKER ===== */}
      <div style={{ background: NOCHE, borderTop: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', padding: '9px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', width: 'max-content', animation: 'txm-marquee 22s linear infinite' }}>
          {[...LIVE_SHIPMENTS, ...LIVE_SHIPMENTS].map((s, i) => (
            <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0 18px', whiteSpace: 'nowrap' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: NARANJA }} />
              <span style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.85)' }}>{s.id}</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{s.route}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== ESCENA PINNEADA: EL VIAJE ===== */}
      <section ref={pinRef} style={{ position: 'relative', height: motionOk ? '300vh' : 'auto', background: NOCHE }}>
        <div style={{ position: motionOk ? 'sticky' : 'relative', top: 0, height: motionOk ? '100dvh' : 'auto', minHeight: motionOk ? undefined : '88dvh', overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '20px 18px 16px' }}>
          <div className="txm-aurora" aria-hidden style={{ position: 'absolute', top: '6%', right: '-30%', width: 360, height: 360, background: 'radial-gradient(circle, rgba(245,135,24,0.18), transparent 62%)', filter: 'blur(14px)', animation: 'txm-aurora 16s ease-in-out infinite' }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: NARANJA }}>El viaje, de punta a punta</span>
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 24, letterSpacing: '-0.02em', color: '#fff', margin: '6px 0 4px' }}>{JOURNEY_STAGES[jStage].t}</h2>
            <p style={{ fontSize: 13.5, lineHeight: 1.5, color: 'rgba(255,255,255,0.65)', margin: 0, minHeight: 40 }}>{JOURNEY_STAGES[jStage].s}</p>
          </div>

          {/* stepper horizontal */}
          <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: 6, margin: '14px 0' }}>
            {JOURNEY_STAGES.map((st, i) => {
              const on = jStage >= i;
              return (
                <div key={st.t} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ height: 4, borderRadius: 99, background: on ? (i === 3 ? '#22C55E' : NARANJA) : 'rgba(255,255,255,0.14)', transition: 'background .3s ease' }} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: jStage === i ? '#fff' : 'rgba(255,255,255,0.4)' }}>{st.t}</span>
                </div>
              );
            })}
          </div>

          {/* panel de rastreo */}
          <div style={{ position: 'relative', zIndex: 2, flex: 1, minHeight: 0, borderRadius: 18, overflow: 'hidden', background: 'linear-gradient(160deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.12)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 13px', borderBottom: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <Navigation size={13} color={NARANJA} />
                <span style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.85)' }}>ENV-046 · seguimiento</span>
              </div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, color: jStage === 3 ? '#7CF0A8' : '#FCD9B0' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: jStage === 3 ? '#22C55E' : NARANJA }} />
                {jStage === 3 ? 'ENTREGADO' : 'EN VIVO'}
              </span>
            </div>
            <div style={{ position: 'relative', flex: 1, minHeight: 0, background: `linear-gradient(180deg, #0a2a20, ${NOCHE})` }}>
              <svg viewBox="0 0 360 300" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                <g fill="rgba(255,255,255,0.06)">
                  {Array.from({ length: 6 }).map((_, r) =>
                    Array.from({ length: 9 }).map((_, c) => (<circle key={`${r}-${c}`} cx={20 + c * 42} cy={24 + r * 46} r="1.2" />))
                  )}
                </g>
                <path d="M 46 250 C 130 230, 110 120, 200 110 S 300 60, 320 44" fill="none" stroke="rgba(245,135,24,0.18)" strokeWidth="4" strokeLinecap="round" />
                <path ref={journeyPath} d="M 46 250 C 130 230, 110 120, 200 110 S 300 60, 320 44" fill="none" stroke={NARANJA} strokeWidth="4" strokeLinecap="round" strokeDasharray={len || 1} strokeDashoffset={(len || 1) * (1 - p)} />
                <circle cx="46" cy="250" r="6.5" fill="#22C55E" stroke="#06160f" strokeWidth="2" />
                <g>
                  {jStage === 3 && <circle cx="320" cy="44" r="12" fill="rgba(34,197,94,0.25)" style={{ transformOrigin: '320px 44px', animation: 'txm-pulse 2s ease-out infinite' }} />}
                  <circle cx="320" cy="44" r="7" fill={jStage === 3 ? '#22C55E' : NARANJA} stroke="#06160f" strokeWidth="2" />
                </g>
                <g transform={`translate(${jPt.x - 12}, ${jPt.y - 12})`}>
                  <circle cx="12" cy="12" r="15" fill="rgba(245,135,24,0.18)" />
                  <rect x="2" y="2" width="20" height="20" rx="6" fill="#fff" />
                  <path d="M6 14 h6 v-3.5 h2 l1.6 2 v1.5 M6 14 v-4.5 h6" fill="none" stroke={VERDE} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
                </g>
              </svg>
              <div style={{ position: 'absolute', top: 12, left: 12, padding: '7px 10px', borderRadius: 11, background: 'rgba(8,34,26,0.8)', border: '1px solid rgba(255,255,255,0.14)' }}>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{jStage === 3 ? 'Llegó' : 'Llegada'}</div>
                <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 15, color: '#fff' }}>{jStage === 3 ? '✓' : jEta}</div>
              </div>
              <div style={{ position: 'absolute', bottom: 12, right: 12, padding: '7px 10px', borderRadius: 11, background: 'rgba(8,34,26,0.8)', border: '1px solid rgba(255,255,255,0.14)' }}>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Restante</div>
                <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 14, color: NARANJA }}>{jKm} km</div>
              </div>
            </div>
            <div style={{ padding: '10px 13px', background: 'rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{JOURNEY_STAGES[jStage].t}</span>
                <span style={{ fontSize: 11, fontWeight: 800, color: jStage === 3 ? '#7CF0A8' : NARANJA }}>{jPct}%</span>
              </div>
              <div style={{ height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.12)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${jPct}%`, borderRadius: 99, background: jStage === 3 ? '#22C55E' : `linear-gradient(90deg, ${VERDE}, ${NARANJA})` }} />
              </div>
            </div>
          </div>

          <div className="txm-floaty" style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'center', marginTop: 10, animation: 'txm-bob 2s ease-in-out infinite' }}>
            <ChevronDown size={16} color="rgba(255,255,255,0.4)" />
          </div>
        </div>
      </section>

      {/* ===== FEATURES (cards ricas) ===== */}
      <section style={{ padding: '32px 18px 8px', background: '#fff' }}>
        <div className="txm-reveal">
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: NARANJA }}>La plataforma</span>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 26, letterSpacing: '-0.02em', color: '#0c1f17', margin: '6px 0 18px' }}>Tecnología para el campo</h2>
        </div>

        {/* card grande: rastreo con mini-mapa */}
        <div className="txm-reveal" style={{ borderRadius: 20, padding: 20, background: `linear-gradient(160deg, ${VERDE}, ${NOCHE})`, color: '#fff', marginBottom: 12, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <MapPin size={18} color={NARANJA} />
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'rgba(255,255,255,0.6)' }}>Rastreo en tiempo real</span>
          </div>
          <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 20, margin: '0 0 6px' }}>Sabé dónde está tu ganado</h3>
          <p style={{ fontSize: 13.5, lineHeight: 1.55, color: 'rgba(255,255,255,0.8)', margin: '0 0 14px' }}>Ubicación en vivo, ETA y estado de cada traslado.</p>
          <svg viewBox="0 0 320 70" style={{ width: '100%', height: 'auto', display: 'block' }} aria-hidden>
            <path id="txm-fmini" d="M 16 56 C 90 50, 110 20, 180 24 S 290 16, 306 12" fill="none" stroke="rgba(245,135,24,0.25)" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 16 56 C 90 50, 110 20, 180 24 S 290 16, 306 12" fill="none" stroke={NARANJA} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 20" style={{ animation: 'txm-flow 1.1s linear infinite' }} />
            <circle cx="16" cy="56" r="4.5" fill="#22C55E" />
            <circle cx="306" cy="12" r="5" fill={NARANJA} />
            <g><circle r="4.5" fill="#fff" /><animateMotion dur="6s" repeatCount="indefinite"><mpath href="#txm-fmini" /></animateMotion></g>
          </svg>
        </div>

        {/* doc card + 2 chicas */}
        <div className="txm-reveal" style={{ borderRadius: 18, padding: 18, background: '#0c1f17', color: '#fff', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(245,135,24,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={18} color={NARANJA} /></div>
            <div>
              <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 16 }}>Documentación digital</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Guía de Traslado y COTA, sin papeles</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['Guía SENACSA', 'COTA', 'Cert. de descarga'].map(d => (
              <span key={d} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 11px', borderRadius: 9, background: 'rgba(255,255,255,0.06)', fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>
                <CheckCircle2 size={13} color="#7CF0A8" /> {d}
              </span>
            ))}
          </div>
        </div>

        <div className="txm-reveal" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ borderRadius: 18, padding: 16, background: '#fbfaf6', border: '1px solid #eee9dd' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 34, marginBottom: 12 }}>
              {[40, 62, 50, 78, 95].map((h, i) => <div key={i} style={{ width: 7, height: `${h}%`, borderRadius: 3, background: i === 4 ? NARANJA : '#cde0d2' }} />)}
            </div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 15, color: '#0c1f17' }}>Precios claros</div>
            <div style={{ fontSize: 12, color: '#5b6b63', marginTop: 2 }}>Sin costos ocultos</div>
          </div>
          <div style={{ borderRadius: 18, padding: 16, background: '#fbfaf6', border: '1px solid #eee9dd' }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: '#1E512610', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}><Shield size={18} color={VERDE} /></div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 15, color: '#0c1f17' }}>Verificados</div>
            <div style={{ fontSize: 12, color: '#5b6b63', marginTop: 2 }}>SENACSA y SITRAP</div>
          </div>
        </div>
      </section>

      {/* ===== COBERTURA (mapa) ===== */}
      <section style={{ padding: '30px 18px', background: NOCHE, position: 'relative', overflow: 'hidden', marginTop: 24 }}>
        <div className="txm-aurora" aria-hidden style={{ position: 'absolute', top: '30%', left: '40%', width: 380, height: 360, background: 'radial-gradient(circle, rgba(30,81,38,0.5), transparent 60%)', filter: 'blur(16px)', animation: 'txm-aurora 16s ease-in-out infinite' }} />
        <div className="txm-reveal" style={{ position: 'relative', zIndex: 2 }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: NARANJA }}>Cobertura</span>
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 26, letterSpacing: '-0.02em', color: '#fff', margin: '6px 0 8px' }}>Una red en todo el país</h2>
          <p style={{ fontSize: 14, lineHeight: 1.55, color: 'rgba(255,255,255,0.7)', margin: '0 0 8px' }}>Del Chaco a la frontera: transportistas en los 17 departamentos.</p>
          <svg viewBox="0 0 600 460" style={{ width: '100%', height: 'auto', display: 'block' }} aria-hidden>
            <g fill="rgba(255,255,255,0.05)">
              {Array.from({ length: 9 }).map((_, r) =>
                Array.from({ length: 12 }).map((_, c) => (<circle key={`${r}-${c}`} cx={20 + c * 50} cy={24 + r * 50} r="1.4" />))
              )}
            </g>
            {CITIES.filter(c => !c.hub).map((c, i) => {
              const hub = CITIES.find(h => h.hub)!;
              return (
                <g key={c.name}>
                  <line x1={hub.x} y1={hub.y} x2={c.x} y2={c.y} stroke="rgba(245,135,24,0.18)" strokeWidth="1.5" />
                  <line x1={hub.x} y1={hub.y} x2={c.x} y2={c.y} stroke={NARANJA} strokeWidth="1.5" strokeDasharray="2 16" strokeDashoffset={i * 8} style={{ animation: `txm-flowmap ${4 + (i % 3)}s linear infinite` }} />
                </g>
              );
            })}
            {CITIES.map((c) => (
              <g key={c.name}>
                {c.hub && <circle cx={c.x} cy={c.y} r="16" fill="rgba(245,135,24,0.18)" style={{ transformOrigin: `${c.x}px ${c.y}px`, animation: 'txm-pulse 2.6s ease-out infinite' }} />}
                <circle cx={c.x} cy={c.y} r={c.hub ? 8 : 5} fill={c.hub ? NARANJA : '#7CF0A8'} stroke={NOCHE} strokeWidth="2" />
                <text x={c.x} y={c.y - (c.hub ? 16 : 11)} textAnchor="middle" fontFamily={MONO} fontSize="12" fill={c.hub ? '#FCD9B0' : 'rgba(255,255,255,0.65)'}>{c.name}</text>
              </g>
            ))}
          </svg>
          <div style={{ display: 'flex', gap: 30, marginTop: 8 }}>
            <div>
              <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 28, color: NARANJA }}><CountUp to={17} /></div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>Departamentos</div>
            </div>
            <div>
              <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 28, color: '#fff' }}><CountUp to={400} suffix="+" /></div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>Rutas activas</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ROLES (carrusel swipe) ===== */}
      <section style={{ padding: '30px 0 6px', background: '#fff' }}>
        <div className="txm-reveal">
          <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 26, letterSpacing: '-0.02em', color: '#0c1f17', margin: '0 18px 4px' }}>Para cada rol</h2>
          <p style={{ fontSize: 14, color: '#6b7280', margin: '0 18px 18px' }}>Deslizá para conocer la plataforma</p>
        </div>
        <div ref={scRef} onScroll={onCarouselScroll} className="txm-scroll" style={{ display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <div key={title} style={{ flex: '0 0 100%', scrollSnapAlign: 'center', padding: '0 18px', boxSizing: 'border-box' }}>
              <div style={{ borderRadius: 22, padding: '26px 22px', minHeight: 210, background: i === 0 ? `linear-gradient(160deg, ${VERDE}, ${NOCHE})` : '#fbfaf6', border: i === 0 ? 'none' : '1px solid #eee9dd', display: 'flex', flexDirection: 'column', boxShadow: i === 0 ? '0 18px 40px rgba(8,34,26,0.25)' : '0 2px 12px rgba(0,0,0,0.04)' }}>
                <div style={{ width: 54, height: 54, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, background: i === 0 ? 'rgba(245,135,24,0.22)' : '#1E512610' }}>
                  <Icon size={26} color={i === 0 ? NARANJA : VERDE} />
                </div>
                <div style={{ fontFamily: MONO, fontSize: 12, color: i === 0 ? 'rgba(255,255,255,0.5)' : '#b6ad97', marginBottom: 6 }}>{String(i + 1).padStart(2, '0')} / {String(FEATURES.length).padStart(2, '0')}</div>
                <h3 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 21, letterSpacing: '-0.01em', color: i === 0 ? '#fff' : '#0c1f17', margin: '0 0 8px' }}>{title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: i === 0 ? 'rgba(255,255,255,0.82)' : '#5b6b63', margin: 0 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 7, marginTop: 16 }}>
          {FEATURES.map((_, i) => (
            <button key={i} onClick={() => goToFeat(i)} aria-label={`Slide ${i + 1}`} style={{ width: feat === i ? 22 : 7, height: 7, borderRadius: 99, border: 'none', padding: 0, background: feat === i ? NARANJA : '#d8d2c4', transition: 'width .25s ease, background .25s ease' }} />
          ))}
        </div>
      </section>

      {/* ===== MÉTRICAS (count-up) ===== */}
      <section style={{ padding: '30px 18px', background: `linear-gradient(135deg, ${VERDE}, ${NOCHE})`, marginTop: 24 }}>
        <div className="txm-reveal" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22, textAlign: 'center' }}>
          <div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 34, color: '#fff' }}><CountUp to={17} /></div>
            <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>Departamentos</div>
          </div>
          <div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 34, color: NARANJA }}><CountUp to={100} suffix="%" /></div>
            <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>Documentación digital</div>
          </div>
          <div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 34, color: NARANJA }}>2 min</div>
            <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>Para publicar</div>
          </div>
          <div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 34, color: '#fff' }}>24/7</div>
            <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>Seguimiento</div>
          </div>
        </div>
      </section>

      {/* ===== CÓMO FUNCIONA ===== */}
      <section style={{ padding: '32px 18px 8px', background: '#fff' }}>
        <h2 className="txm-reveal" style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 26, letterSpacing: '-0.02em', color: '#0c1f17', margin: '0 0 18px' }}>Tres pasos, cero papeles</h2>
        <div className="txm-reveal" style={{ display: 'flex', flexDirection: 'column' }}>
          {[
            { n: '01', t: 'Publicá tu traslado', d: 'Origen, destino y fecha en 2 minutos' },
            { n: '02', t: 'Recibí cotizaciones', d: 'Transportistas verificados te cotizan al instante' },
            { n: '03', t: 'Rastreá en vivo', d: 'Seguimiento con documentación 100% digital' },
          ].map(({ n, t, d }, i, arr) => (
            <div key={n} style={{ display: 'flex', gap: 13 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: NOCHE }}>
                  <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 13, color: NARANJA }}>{n}</span>
                </div>
                {i < arr.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 20, background: 'repeating-linear-gradient(180deg, #d8d2c4 0 5px, transparent 5px 10px)', margin: '4px 0' }} />}
              </div>
              <div style={{ paddingTop: 4, paddingBottom: 18 }}>
                <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 16, color: '#0c1f17' }}>{t}</div>
                <div style={{ fontSize: 13.5, color: '#6b7280', marginTop: 2 }}>{d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section style={{ padding: '24px 18px 30px', background: '#fff' }}>
        <div className="txm-reveal" style={{ position: 'relative', overflow: 'hidden', borderRadius: 24, background: `linear-gradient(150deg, ${VERDE}, ${NOCHE})`, padding: '36px 24px', textAlign: 'center' }}>
          <div className="txm-aurora" aria-hidden style={{ position: 'absolute', top: '-40%', right: '-20%', width: 280, height: 280, background: 'radial-gradient(circle, rgba(245,135,24,0.3), transparent 60%)', filter: 'blur(14px)', animation: 'txm-aurora 14s ease-in-out infinite' }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <img src="/tropex-isotipo.png" alt="TROPEX" style={{ height: 44, width: 'auto', marginBottom: 16 }} />
            <h2 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 24, letterSpacing: '-0.02em', color: '#fff', margin: '0 0 10px' }}>Movés ganado. Lo hacemos simple.</h2>
            <p style={{ fontSize: 14.5, lineHeight: 1.55, color: 'rgba(255,255,255,0.8)', margin: 0 }}>Registrate gratis y publicá tu primer traslado en minutos.</p>
          </div>
        </div>
      </section>

      {/* espacio para la CTA fija */}
      <div style={{ height: 92 }} />

      {/* ===== CTA FIJA ===== */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50, padding: '12px 18px calc(14px + env(safe-area-inset-bottom))', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderTop: '1px solid #eee9dd' }}>
        <button onClick={onSignup} style={{ width: '100%', padding: '15px 0', borderRadius: 14, background: NARANJA, color: '#fff', fontFamily: BODY, fontWeight: 700, fontSize: 16, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, boxShadow: '0 10px 26px rgba(245,135,24,0.32)' }}>
          Empezar gratis <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
