import { useState, type ReactNode, type CSSProperties } from 'react';
import {
  Beef, Truck, Camera, CheckCircle2, Upload, X, ChevronLeft, Copy, Bell,
  RefreshCw, Clock, Wallet, Settings, ArrowRight, ShieldCheck, Signal, BatteryFull, Wifi,
} from 'lucide-react';
import { toast } from 'sonner';
import { C, DISPLAY, BODY, MONO, formatGs } from '../dashboards/admin/kit';
import { useIsMobile } from '../ui/use-mobile';

// ═══════════════ Datos del caso (demo) ═══════════════
const FREIGHT = 8_940_000;
const PAYOUTS = {
  '2-15': { label: 'Cobro a 15 días', rate: 0.02, sub: 'Cobrás cuando el ganadero paga (hasta 15 días).', tag: '2% · 15 días' },
  '5-instant': { label: 'Cobro al instante', rate: 0.05, sub: 'Cobrás al confirmar la entrega. TROPEX adelanta.', tag: '5% · al instante' },
} as const;
type PayoutKey = keyof typeof PAYOUTS;
const net = (k: PayoutKey) => FREIGHT - Math.round(FREIGHT * PAYOUTS[k].rate);

const TROPEX_ACCOUNT = { banco: 'Banco Continental', cuenta: '490062282001', nombre: 'DEVELOP E.A.S.' };

// Ciclo de vida del viaje ENV-046 (compartido por ambas perspectivas)
type Stage = 'transito' | 'descargando' | 'entregado' | 'procesando' | 'pagado';
const STAGE_ORDER: Stage[] = ['transito', 'descargando', 'entregado', 'procesando', 'pagado'];

// Otros viejos del historial (estados fijos, para mostrar variedad)
const OTHER_TRIPS = [
  { id: 'ENV-039', route: 'Concepción → Asunción', heads: 60, cattle: 'Gordos', stage: 'procesando' as Stage },
  { id: 'ENV-058', route: 'Mariscal E. → Central', heads: 38, cattle: 'Desmamantes', stage: 'pagado' as Stage },
  { id: 'ENV-031', route: 'Loma Plata → V. Hayes', heads: 52, cattle: 'Gordos', stage: 'finalizado' as any },
];

const FRIGO_PHOTOS = [
  { key: 'bascula', label: 'Foto de la báscula', hint: 'Peso final' },
  { key: 'nota', label: 'Nota firmada del frigorífico', hint: 'Prueba de recepción' },
  { key: 'descarga', label: 'Animales descargando', hint: 'Contexto' },
];

function readImage(file: File, cb: (url: string) => void) {
  const r = new FileReader();
  r.onloadend = () => cb(r.result as string);
  r.readAsDataURL(file);
}

// Estado → etiqueta/color según quién mira
function ganaderoStatus(s: Stage | 'finalizado') {
  switch (s) {
    case 'transito': case 'descargando': return { label: 'En tránsito', color: C.naranja };
    case 'entregado': return { label: 'Entregado · pagá el flete', color: '#B45309' };
    case 'procesando': return { label: 'Pago en proceso', color: C.naranja };
    case 'pagado': return { label: 'Pagado', color: C.verdeClaro };
    default: return { label: 'Finalizado', color: C.gris };
  }
}
function transportistaStatus(s: Stage, payout: PayoutKey | null) {
  switch (s) {
    case 'transito': return { label: 'En tránsito', color: C.naranja };
    case 'descargando': return { label: 'Descargando · subí la prueba', color: '#B45309' };
    case 'entregado': return { label: payout === '5-instant' ? 'Cobrado · al instante' : 'Cobro a 15 días', color: payout === '5-instant' ? C.verdeClaro : C.naranja };
    case 'procesando': return { label: payout === '5-instant' ? 'Cobrado' : 'Cobro a 15 días', color: payout === '5-instant' ? C.verdeClaro : C.naranja };
    case 'pagado': return { label: 'Cobrado', color: C.verdeClaro };
  }
}

// ═══════════════ Caso principal ═══════════════
export function EntregaPagoCase() {
  const isMobile = useIsMobile();
  const [perspective, setPerspective] = useState<'ganadero' | 'transportista'>('transportista');

  // ciclo de vida compartido
  const [stage, setStage] = useState<Stage>('transito');
  const [payout, setPayout] = useState<PayoutKey | null>(null);

  // navegación dentro del teléfono (por perspectiva)
  const [gScreen, setGScreen] = useState<'list' | 'detail' | 'pay'>('list');
  const [tScreen, setTScreen] = useState<'list' | 'prueba' | 'cobro'>('list');

  // datos de subida
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [comprobante, setComprobante] = useState<string>();

  // notificación dentro del teléfono
  const [notif, setNotif] = useState<{ title: string; body: string; go?: () => void } | null>(null);

  const reset = () => {
    setStage('transito'); setPayout(null); setGScreen('list'); setTScreen('list');
    setPhotos({}); setComprobante(undefined); setNotif(null);
  };

  // ── controles de simulación (panel lateral) ──
  const demoControls: { hint?: string; actions: { label: string; onClick: () => void }[] } = (() => {
    if (perspective === 'transportista') {
      if (stage === 'transito') return { hint: 'El camión va en ruta. Cuando llegue, se habilita la prueba de entrega.', actions: [{ label: 'Simular: llegada al destino', onClick: () => { setStage('descargando'); setNotif({ title: 'Llegaste al destino', body: 'Completá la prueba de entrega para cerrar el viaje.', go: () => setTScreen('prueba') }); } }] };
      if (stage === 'descargando') return { hint: 'Tocá el viaje en el teléfono y subí las 3 fotos de la prueba de entrega.', actions: [] };
      return { hint: 'Ya entregaste y definiste tu cobro. Cambiá a la perspectiva Ganadero para ver el pago.', actions: [] };
    }
    // ganadero
    if (stage === 'transito' || stage === 'descargando') return { hint: 'El viaje todavía está en ruta. Simulá que el transportista lo entrega.', actions: [{ label: 'Simular: el transportista entregó', onClick: () => { setStage('entregado'); setNotif({ title: 'Tu viaje ENV-046 llegó', body: 'Entrega confirmada en Frigorífico Concepción. Pagá el flete.', go: () => { setGScreen('detail'); } }); } }] };
    if (stage === 'entregado') return { hint: 'Tocá la notificación o el viaje "Entregado" para ver el detalle y pagar.', actions: [] };
    if (stage === 'procesando') return { hint: 'El ganadero ya subió el comprobante. Simulá que lo verificamos contra el clearing en Continental.', actions: [{ label: 'Simular: verificamos el pago', onClick: () => { setStage('pagado'); setNotif({ title: 'Pago acreditado', body: 'Verificamos tu transferencia. El viaje quedó pagado.', go: () => setGScreen('detail') }); } }] };
    return { hint: 'El viaje quedó pagado. Reiniciá para verlo de nuevo desde el principio.', actions: [] };
  })();

  // ═══════════ Pantallas del teléfono ═══════════
  const phoneScreen = perspective === 'ganadero'
    ? <GanaderoPhone {...{ stage, gScreen, setGScreen, comprobante, setComprobante, setStage, notif, setNotif }} />
    : <TransportistaPhone {...{ stage, payout, tScreen, setTScreen, photos, setPhotos, setStage, setPayout, notif, setNotif }} />;

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', padding: isMobile ? '16px 12px 70px' : '24px 28px 70px' }}>
      <h1 style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: isMobile ? 23 : 30, letterSpacing: '-0.02em', color: C.texto, margin: 0 }}>Entrega y pago</h1>
      <p style={{ fontSize: 14, color: C.gris, margin: '8px 0 16px', lineHeight: 1.55, maxWidth: 640 }}>
        El viaje real, pantalla por pantalla. Usá los controles de la derecha para simular cada evento y mirá cómo lo ve el ganadero y el transportista en su celular.
      </p>

      {/* Toggle perspectiva + reset */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
        <div style={{ display: 'inline-flex', background: '#fff', border: `1px solid ${C.borde}`, borderRadius: 12, padding: 4, gap: 4 }}>
          {([{ k: 'transportista', label: 'Transportista', icon: Truck }, { k: 'ganadero', label: 'Ganadero', icon: Beef }] as const).map(o => {
            const on = perspective === o.k; const Icon = o.icon;
            return (
              <button key={o.k} onClick={() => setPerspective(o.k)} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 9, border: 'none', cursor: 'pointer', fontFamily: BODY, fontSize: 14, fontWeight: 700, background: on ? C.verde : 'transparent', color: on ? '#fff' : C.gris }}>
                <Icon size={16} color={on ? '#fff' : C.gris} /> {o.label}
              </button>
            );
          })}
        </div>
        <button onClick={reset} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 14px', borderRadius: 10, border: `1px solid ${C.borde}`, background: '#fff', color: C.gris, fontFamily: BODY, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          <RefreshCw size={14} /> Reiniciar
        </button>
      </div>

      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexDirection: isMobile ? 'column' : 'row' }}>
        {/* Teléfono */}
        <PhoneFrame>{phoneScreen}</PhoneFrame>

        {/* Panel de control de la simulación */}
        <div style={{ flex: 1, minWidth: 0, width: isMobile ? '100%' : undefined }}>
          <div style={{ display: 'flex', gap: 10, padding: '13px 15px', borderRadius: 12, background: `${C.verde}0d`, border: `1px solid ${C.verde}22`, marginBottom: 16 }}>
            <ShieldCheck size={18} color={C.verde} style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12.5, color: C.texto, margin: 0, lineHeight: 1.55 }}>
              <strong>Alcance de TROPEX:</strong> ante retrasos o cambios solo facilitamos la comunicación entre las partes; no operamos el flete ni mediamos la disputa.
            </p>
          </div>

          {/* Progreso del ciclo */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.grisClaro, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Estado del viaje · ENV-046</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              {STAGE_ORDER.map((s, i) => {
                const reached = STAGE_ORDER.indexOf(stage) >= i;
                const labels: Record<Stage, string> = { transito: 'En ruta', descargando: 'Descargando', entregado: 'Entregado', procesando: 'Pago', pagado: 'Pagado' };
                return (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < STAGE_ORDER.length - 1 ? 1 : '0 0 auto' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 16, height: 16, borderRadius: '50%', background: reached ? C.verde : '#fff', border: `2px solid ${reached ? C.verde : C.grisClaro}` }} />
                      <span style={{ fontSize: 9.5, color: reached ? C.texto : C.grisClaro, fontWeight: reached ? 700 : 500, whiteSpace: 'nowrap' }}>{labels[s]}</span>
                    </div>
                    {i < STAGE_ORDER.length - 1 && <div style={{ flex: 1, height: 2, background: STAGE_ORDER.indexOf(stage) > i ? C.verde : C.borde, margin: '0 4px', marginBottom: 16 }} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Controles */}
          <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${C.borde}`, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ width: 24, height: 24, borderRadius: 7, background: `${C.naranja}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><RefreshCw size={13} color={C.naranja} /></span>
              <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 15, color: C.texto }}>Controles de la simulación</span>
            </div>
            {demoControls.hint && <p style={{ fontSize: 13, color: C.gris, margin: '0 0 12px', lineHeight: 1.55 }}>{demoControls.hint}</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {demoControls.actions.map((a, i) => (
                <button key={i} onClick={a.onClick} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', background: C.verde, color: '#fff', fontFamily: BODY, fontWeight: 700, fontSize: 14 }}>
                  <ArrowRight size={16} /> {a.label}
                </button>
              ))}
              {demoControls.actions.length === 0 && (
                <div style={{ fontSize: 12.5, color: C.grisClaro, fontStyle: 'italic' }}>Seguí la acción en el teléfono →</div>
              )}
            </div>
          </div>

          <p style={{ fontSize: 12, color: C.grisClaro, margin: '14px 0 0', lineHeight: 1.5 }}>
            Tip: hacé el viaje desde la perspectiva <strong>Transportista</strong> (entregar + elegir cobro) y después cambiá a <strong>Ganadero</strong> para pagar. El estado se comparte.
          </p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════ Maqueta de celular ═══════════════
function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div style={{ width: 350, maxWidth: '100%', height: 720, background: '#0c1f17', borderRadius: 46, padding: 11, boxShadow: '0 30px 70px rgba(8,34,26,0.28)', flexShrink: 0, alignSelf: 'center' }}>
      <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 36, overflow: 'hidden', background: C.neutro, display: 'flex', flexDirection: 'column', fontFamily: BODY }}>
        {/* status bar */}
        <div style={{ height: 30, background: C.verde, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', flexShrink: 0 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>9:41</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Signal size={12} color="#fff" /><Wifi size={12} color="#fff" /><BatteryFull size={15} color="#fff" />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>{children}</div>
      </div>
    </div>
  );
}

function ScreenHeader({ title, subtitle, onBack }: { title: string; subtitle?: string; onBack?: () => void }) {
  return (
    <div style={{ background: C.verde, padding: '12px 16px 14px', position: 'sticky', top: 0, zIndex: 5 }}>
      {onBack && <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: 'rgba(255,255,255,0.85)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', padding: 0, marginBottom: 8 }}><ChevronLeft size={15} /> Volver</button>}
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 19, color: '#fff' }}>{title}</div>
      {subtitle && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>{subtitle}</div>}
    </div>
  );
}

function NotifBanner({ notif, onClose }: { notif: { title: string; body: string; go?: () => void }; onClose: () => void }) {
  return (
    <div onClick={() => { notif.go?.(); onClose(); }} style={{ position: 'absolute', top: 8, left: 8, right: 8, zIndex: 20, background: '#fff', borderRadius: 14, boxShadow: '0 10px 30px rgba(8,34,26,0.22)', border: `1px solid ${C.borde}`, padding: '11px 13px', display: 'flex', gap: 10, cursor: 'pointer' }}>
      <div style={{ width: 30, height: 30, borderRadius: 8, background: C.verde, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Bell size={15} color="#fff" /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: C.texto }}>{notif.title}</div>
        <div style={{ fontSize: 12, color: C.gris, lineHeight: 1.4, marginTop: 1 }}>{notif.body}</div>
      </div>
      <button onClick={e => { e.stopPropagation(); onClose(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0, padding: 2 }}><X size={15} color={C.grisClaro} /></button>
    </div>
  );
}

function TripRow({ id, route, meta, status, onClick }: { id: string; route: string; meta: string; status: { label: string; color: string }; onClick?: () => void }) {
  return (
    <button onClick={onClick} disabled={!onClick} style={{ width: '100%', textAlign: 'left', background: '#fff', border: `1px solid ${C.borde}`, borderRadius: 13, padding: '12px 13px', cursor: onClick ? 'pointer' : 'default', display: 'block' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontFamily: MONO, fontSize: 11, color: C.grisClaro }}>{id}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, fontWeight: 700, color: status.color, background: status.color + '18', padding: '3px 8px', borderRadius: 99 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: status.color }} />{status.label}
        </span>
      </div>
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 15, color: C.texto, marginTop: 4 }}>{route}</div>
      <div style={{ fontSize: 12, color: C.gris, marginTop: 1 }}>{meta}</div>
    </button>
  );
}

function bodyStyle(): CSSProperties { return { padding: '14px 14px 28px', display: 'flex', flexDirection: 'column', gap: 11 }; }

// ═══════════════ Teléfono · GANADERO ═══════════════
function GanaderoPhone({ stage, gScreen, setGScreen, comprobante, setComprobante, setStage, notif, setNotif }: {
  stage: Stage; gScreen: 'list' | 'detail' | 'pay'; setGScreen: (s: 'list' | 'detail' | 'pay') => void;
  comprobante?: string; setComprobante: (s: string) => void; setStage: (s: Stage) => void;
  notif: { title: string; body: string; go?: () => void } | null; setNotif: (n: { title: string; body: string; go?: () => void } | null) => void;
}) {
  const st = ganaderoStatus(stage);
  return (
    <>
      {notif && <NotifBanner notif={notif} onClose={() => setNotif(null)} />}

      {gScreen === 'list' && (
        <div>
          <ScreenHeader title="Mis envíos" subtitle="Demo Ganadero" />
          <div style={bodyStyle()}>
            <TripRow id="ENV-046" route="Filadelfia → Asunción" meta="45 Gordos · ₲ 8.940.000" status={st} onClick={() => setGScreen('detail')} />
            {OTHER_TRIPS.map(t => (
              <TripRow key={t.id} id={t.id} route={t.route} meta={`${t.heads} ${t.cattle}`} status={ganaderoStatus(t.stage)} onClick={undefined} />
            ))}
          </div>
        </div>
      )}

      {gScreen === 'detail' && (
        <div>
          <ScreenHeader title="ENV-046" subtitle="Filadelfia → Asunción" onBack={() => setGScreen('list')} />
          <div style={bodyStyle()}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: st.color, background: st.color + '18', padding: '6px 13px', borderRadius: 99 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.color }} />{st.label}
              </span>
            </div>

            <div style={{ background: '#fff', border: `1px solid ${C.borde}`, borderRadius: 13, padding: 14 }}>
              <Row k="Ganado" v="45 · Gordos" /><Row k="Destino" v="Frigorífico Concepción" /><Row k="Transportista" v="J. Giménez · ⭐ 4.8" /><Row k="Flete acordado" v={formatGs(FREIGHT)} strong />
            </div>

            {(stage === 'transito' || stage === 'descargando') && (
              <Info icon={<Clock size={16} color={C.naranja} />} bg="#FFFBEB" border="#FDE7A7" tColor="#92400e">El transportista todavía no entregó. Cuando confirme la entrega vas a poder pagar.</Info>
            )}
            {stage === 'entregado' && (
              <button onClick={() => setGScreen('pay')} style={primaryBtn()}><Wallet size={17} /> Pagar flete</button>
            )}
            {stage === 'procesando' && (
              <Info icon={<RefreshCw size={16} color={C.naranja} />} bg={`${C.naranja}10`} border={`${C.naranja}33`} tColor="#92400e"><strong>Pago en proceso.</strong> Verificamos tu transferencia contra el clearing en Continental. Hasta 24 h hábiles.</Info>
            )}
            {stage === 'pagado' && (
              <Info icon={<CheckCircle2 size={16} color={C.verde} />} bg={`${C.verde}10`} border={`${C.verde}33`} tColor={C.verde}><strong>Pagado.</strong> Tu pago de {formatGs(FREIGHT)} fue verificado y acreditado. ¡Gracias!</Info>
            )}
          </div>
        </div>
      )}

      {gScreen === 'pay' && (
        <div>
          <ScreenHeader title="Pagar flete" subtitle={`ENV-046 · ${formatGs(FREIGHT)}`} onBack={() => setGScreen('detail')} />
          <div style={bodyStyle()}>
            {/* tarjeta Continental */}
            <div style={{ borderRadius: 16, overflow: 'hidden', background: '#1f3fa0' }}>
              <div style={{ padding: '14px 16px 8px' }}>
                <div style={{ fontFamily: DISPLAY, fontSize: 13, color: '#C4D600' }}>mi cuenta</div>
                <div style={{ fontFamily: DISPLAY, fontSize: 20, fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>continental</div>
              </div>
              <div style={{ background: '#fff', margin: '4px 10px 12px', borderRadius: 11, padding: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 11 }}><QRPlaceholder size={108} /></div>
                <Acct k="Entidad" v={TROPEX_ACCOUNT.banco} /><Acct k="Número de cuenta" v={TROPEX_ACCOUNT.cuenta} mono /><Acct k="Nombre" v={TROPEX_ACCOUNT.nombre} />
                <button onClick={() => { navigator.clipboard?.writeText(TROPEX_ACCOUNT.cuenta).catch(() => {}); toast.success('Cuenta copiada'); }} style={{ marginTop: 10, width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 0', borderRadius: 9, border: `1.5px solid ${C.verde}`, background: '#fff', color: C.verde, fontFamily: BODY, fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}><Copy size={13} /> Copiar cuenta</button>
              </div>
            </div>

            <div style={{ background: '#fff', border: `1px solid ${C.borde}`, borderRadius: 13, padding: 14 }}>
              <div style={{ fontSize: 10.5, color: C.grisClaro, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Monto · concepto</div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 22, color: C.texto }}>{formatGs(FREIGHT)}</span>
                <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: C.texto }}>ENV-046</span>
              </div>
            </div>

            {!comprobante ? (
              <label style={uploadBox()}>
                <Upload size={22} color={C.gris} />
                <span style={{ fontSize: 13.5, fontWeight: 700, color: C.texto }}>Subir comprobante</span>
                <span style={{ fontSize: 11, color: C.grisClaro }}>Captura o PDF de la transferencia</span>
                <input type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) readImage(f, url => { setComprobante(url); setStage('procesando'); toast.success('Comprobante recibido. Verificando…'); setGScreen('detail'); }); }} />
              </label>
            ) : (
              <Info icon={<CheckCircle2 size={16} color={C.verde} />} bg={`${C.verde}10`} border={`${C.verde}33`} tColor={C.verde}>Comprobante subido.</Info>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ═══════════════ Teléfono · TRANSPORTISTA ═══════════════
function TransportistaPhone({ stage, payout, tScreen, setTScreen, photos, setPhotos, setStage, setPayout, notif, setNotif }: {
  stage: Stage; payout: PayoutKey | null; tScreen: 'list' | 'prueba' | 'cobro'; setTScreen: (s: 'list' | 'prueba' | 'cobro') => void;
  photos: Record<string, string>; setPhotos: (f: (s: Record<string, string>) => Record<string, string>) => void;
  setStage: (s: Stage) => void; setPayout: (p: PayoutKey) => void;
  notif: { title: string; body: string; go?: () => void } | null; setNotif: (n: { title: string; body: string; go?: () => void } | null) => void;
}) {
  const st = transportistaStatus(stage, payout);
  const uploaded = FRIGO_PHOTOS.filter(p => photos[p.key]).length;
  return (
    <>
      {notif && <NotifBanner notif={notif} onClose={() => setNotif(null)} />}

      {tScreen === 'list' && (
        <div>
          <ScreenHeader title="Mi viaje" subtitle="Demo Transportista" />
          <div style={bodyStyle()}>
            <TripRow id="ENV-046" route="Filadelfia → Asunción" meta="45 Gordos · 485 km" status={st!}
              onClick={stage === 'descargando' ? () => setTScreen('prueba') : undefined} />
            {stage === 'transito' && <Info icon={<Truck size={16} color={C.naranja} />} bg="#FFFBEB" border="#FDE7A7" tColor="#92400e">En ruta hacia Frigorífico Concepción. Al llegar vas a subir la prueba de entrega.</Info>}
            {stage === 'descargando' && <div style={{ fontSize: 12.5, color: C.gris, textAlign: 'center', padding: '4px 0' }}>Tocá el viaje para subir la prueba de entrega ↑</div>}
            {(stage === 'entregado' || stage === 'procesando' || stage === 'pagado') && payout && (
              <Info icon={payout === '5-instant' ? <CheckCircle2 size={16} color={C.verde} /> : <Clock size={16} color={C.naranja} />} bg={payout === '5-instant' ? `${C.verde}10` : '#FFFBEB'} border={payout === '5-instant' ? `${C.verde}33` : '#FDE7A7'} tColor={payout === '5-instant' ? C.verde : '#92400e'}>
                {payout === '5-instant' ? <><strong>Cobraste {formatGs(net('5-instant'))}</strong> al instante (comisión 5%).</> : <><strong>Cobro programado: {formatGs(net('2-15'))}</strong> cuando el ganadero pague (hasta 15 días · comisión 2%).</>}
              </Info>
            )}
          </div>
        </div>
      )}

      {tScreen === 'prueba' && (
        <div>
          <ScreenHeader title="Prueba de entrega" subtitle="Frigorífico → 3 fotos" onBack={() => setTScreen('list')} />
          <div style={bodyStyle()}>
            {FRIGO_PHOTOS.map(p => (
              <PhotoTile key={p.key} label={p.label} hint={p.hint} preview={photos[p.key]}
                onFile={f => readImage(f, url => setPhotos(s => ({ ...s, [p.key]: url })))}
                onRemove={() => setPhotos(s => { const c = { ...s }; delete c[p.key]; return c; })} />
            ))}
            <div style={{ fontSize: 12, fontWeight: 700, color: uploaded >= 3 ? C.verde : C.naranja, textAlign: 'center' }}>{uploaded}/3 fotos {uploaded >= 3 ? '· listo' : ''}</div>
            <button onClick={() => { if (uploaded >= 3) setTScreen('cobro'); }} disabled={uploaded < 3} style={{ ...primaryBtn(), background: uploaded >= 3 ? C.verde : '#D7DBd5', cursor: uploaded >= 3 ? 'pointer' : 'not-allowed' }}><CheckCircle2 size={17} /> Confirmar entrega</button>
          </div>
        </div>
      )}

      {tScreen === 'cobro' && (
        <div>
          <ScreenHeader title="¿Cómo querés cobrar?" subtitle="Confirmá tu método para este viaje" onBack={() => setTScreen('prueba')} />
          <div style={bodyStyle()}>
            {(Object.keys(PAYOUTS) as PayoutKey[]).map(k => {
              const on = (payout ?? '2-15') === k;
              return (
                <button key={k} onClick={() => setPayout(k)} style={{ textAlign: 'left', cursor: 'pointer', background: on ? `${C.verde}0a` : '#fff', border: `${on ? 2 : 1}px solid ${on ? C.verde : C.borde}`, borderRadius: 13, padding: 13 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 14.5, color: C.texto }}>{PAYOUTS[k].label}</span>
                    <span style={{ width: 17, height: 17, borderRadius: '50%', border: `2px solid ${on ? C.verde : C.grisClaro}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{on && <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.verde }} />}</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.gris, margin: '5px 0 9px', lineHeight: 1.45 }}>{PAYOUTS[k].sub}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
                    <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 17, color: C.verde }}>{formatGs(net(k))}</span>
                    <span style={{ fontSize: 11, color: C.grisClaro }}>neto · {(PAYOUTS[k].rate * 100).toFixed(0)}%</span>
                  </div>
                </button>
              );
            })}
            <Info icon={<Settings size={15} color={C.gris} />} bg="#FAFAF8" border={C.borde} tColor={C.gris}>Este es tu cobro por defecto. Podés cambiarlo cuando quieras desde <strong>Configuración</strong>.</Info>
            <button onClick={() => { const p = payout ?? '2-15'; setPayout(p); setStage('entregado'); setNotif({ title: 'Entrega confirmada', body: p === '5-instant' ? `Cobraste ${formatGs(net('5-instant'))} al instante.` : 'Cobro programado a 15 días.', go: () => setTScreen('list') }); toast.success('Entrega confirmada'); setTScreen('list'); }} style={primaryBtn()}><CheckCircle2 size={17} /> Confirmar entrega y cobro</button>
          </div>
        </div>
      )}
    </>
  );
}

// ═══════════════ Subcomponentes compartidos ═══════════════
function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '5px 0' }}>
      <span style={{ fontSize: 12.5, color: C.gris }}>{k}</span>
      <span style={{ fontSize: 13, fontWeight: strong ? 800 : 600, color: strong ? C.verde : C.texto, textAlign: 'right' }}>{v}</span>
    </div>
  );
}
function Acct({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ fontSize: 10.5, color: C.grisClaro }}>{k}</div>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: C.texto, fontFamily: mono ? MONO : BODY }}>{v}</div>
    </div>
  );
}
function Info({ icon, children, bg, border, tColor }: { icon: ReactNode; children: ReactNode; bg: string; border: string; tColor: string }) {
  return (
    <div style={{ display: 'flex', gap: 9, padding: '11px 13px', borderRadius: 12, background: bg, border: `1px solid ${border}` }}>
      <span style={{ flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <p style={{ fontSize: 12.5, color: tColor, margin: 0, lineHeight: 1.5 }}>{children}</p>
    </div>
  );
}
function primaryBtn(): CSSProperties {
  return { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '13px 0', borderRadius: 11, border: 'none', background: C.verde, color: '#fff', fontFamily: BODY, fontWeight: 700, fontSize: 14.5, cursor: 'pointer' };
}
function uploadBox(): CSSProperties {
  return { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, height: 128, borderRadius: 13, border: `1.5px dashed ${C.grisClaro}`, background: '#FAFAF8', cursor: 'pointer' };
}

function PhotoTile({ label, hint, preview, onFile, onRemove }: { label: string; hint: string; preview?: string; onFile: (f: File) => void; onRemove: () => void }) {
  if (preview) {
    return (
      <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: `2px solid ${C.verde}` }}>
        <img src={preview} alt={label} style={{ width: '100%', height: 92, objectFit: 'cover', display: 'block' }} />
        <button onClick={onRemove} style={{ position: 'absolute', top: 5, right: 5, width: 24, height: 24, borderRadius: '50%', border: 'none', background: C.rojo, color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={13} /></button>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '4px 8px', background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', display: 'flex', alignItems: 'center', gap: 5 }}><CheckCircle2 size={12} color="#fff" /><span style={{ fontSize: 10.5, color: '#fff', fontWeight: 600 }}>{label}</span></div>
      </div>
    );
  }
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 13px', borderRadius: 12, border: `1.5px dashed ${C.grisClaro}`, background: '#FAFAF8', cursor: 'pointer' }}>
      <Camera size={20} color={C.grisClaro} />
      <span style={{ flex: 1 }}>
        <span style={{ display: 'block', fontSize: 13, fontWeight: 700, color: C.texto }}>{label}</span>
        <span style={{ display: 'block', fontSize: 11, color: C.grisClaro }}>{hint} · tocá para subir</span>
      </span>
      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
    </label>
  );
}

function QRPlaceholder({ size = 108 }: { size?: number }) {
  const N = 21; const cell = size / N;
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
