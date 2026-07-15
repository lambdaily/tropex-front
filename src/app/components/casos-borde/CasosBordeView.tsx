import { useState } from 'react';
import { Package, LogOut, Menu, X, PanelLeftClose, PanelLeftOpen, FlaskConical } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useIsMobile } from '../ui/use-mobile';
import { C, DISPLAY, BODY } from '../dashboards/admin/kit';
import { EntregaPagoCase } from './EntregaPagoCase';

interface CasosBordeViewProps {
  onBack: () => void;
}

export type CaseId = 'entrega-pago';

interface NavItem { id: CaseId; label: string; desc: string; icon: LucideIcon; group: string; }

// Acá se van agregando los casos borde a medida que se definen.
const NAV: NavItem[] = [
  { id: 'entrega-pago', label: 'Entrega y pago', desc: 'Prueba de entrega + cobro', icon: Package, group: 'Pos-viaje' },
];

const CASE_TITLE: Record<CaseId, string> = NAV.reduce((acc, n) => { acc[n.id] = n.label; return acc; }, {} as Record<CaseId, string>);

export function CasosBordeView({ onBack }: CasosBordeViewProps) {
  const isMobile = useIsMobile();
  const [active, setActive] = useState<CaseId>('entrega-pago');
  const [navOpen, setNavOpen] = useState(false);   // drawer mobile
  const [collapsed, setCollapsed] = useState(false); // retráctil desktop

  const go = (id: CaseId) => { setActive(id); setNavOpen(false); };
  const groups = Array.from(new Set(NAV.map(n => n.group)));
  const showLabels = isMobile || !collapsed;
  const sideW = isMobile ? 264 : collapsed ? 68 : 250;

  const Sidebar = (
    <aside style={{ width: sideW, minWidth: sideW, maxWidth: sideW, background: C.noche, display: 'flex', flexDirection: 'column', flexShrink: 0, height: '100%', overflow: 'hidden', transition: 'width .18s ease, min-width .18s ease, max-width .18s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: showLabels ? '16px 18px' : '16px 0', justifyContent: showLabels ? 'flex-start' : 'center', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <img src="/tropex-isotipo.png" alt="TROPEX" style={{ width: 24, height: 24, objectFit: 'contain' }} />
        </div>
        {showLabels && (
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 15, color: '#fff', lineHeight: 1 }}>Casos borde</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Flujos de demostración</div>
          </div>
        )}
        {isMobile && <button onClick={() => setNavOpen(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} color="rgba(255,255,255,0.7)" /></button>}
      </div>

      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
        {groups.map(group => (
          <div key={group} style={{ marginBottom: 14 }}>
            {showLabels && <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 10px 6px' }}>{group}</div>}
            {NAV.filter(n => n.group === group).map(({ id, label, desc, icon: Icon }) => {
              const on = active === id;
              return (
                <button key={id} onClick={() => go(id)} title={!showLabels ? label : undefined} style={{
                  display: 'flex', alignItems: 'center', gap: 11, width: '100%', padding: showLabels ? '10px 10px' : '10px 0', justifyContent: showLabels ? 'flex-start' : 'center',
                  borderRadius: 9, border: 'none', cursor: 'pointer', background: on ? C.verde : 'transparent', marginBottom: 3, textAlign: 'left', transition: 'background .15s',
                }}>
                  <Icon size={18} color={on ? '#fff' : 'rgba(255,255,255,0.62)'} strokeWidth={on ? 2.3 : 1.9} />
                  {showLabels && (
                    <span style={{ minWidth: 0, flex: 1 }}>
                      <span style={{ display: 'block', fontFamily: BODY, fontSize: 13.5, fontWeight: on ? 700 : 500, color: on ? '#fff' : 'rgba(255,255,255,0.72)' }}>{label}</span>
                      <span style={{ display: 'block', fontSize: 11, color: on ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.4)', marginTop: 1 }}>{desc}</span>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
        {showLabels && (
          <div style={{ margin: '6px 10px 0', padding: '11px 12px', borderRadius: 10, background: 'rgba(245,135,24,0.1)', border: '1px solid rgba(245,135,24,0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
              <FlaskConical size={14} color={C.naranja} />
              <span style={{ fontSize: 11, fontWeight: 800, color: '#FCD9B0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Zona de demo</span>
            </div>
            <p style={{ fontSize: 11.5, lineHeight: 1.5, color: 'rgba(255,255,255,0.6)', margin: 0 }}>Casos que no conviene mostrar dentro del dashboard. Se irán sumando más.</p>
          </div>
        )}
      </nav>

      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', justifyContent: showLabels ? 'flex-start' : 'center', gap: 10, padding: showLabels ? '13px 18px' : '13px 0', border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'transparent', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', fontFamily: BODY, fontSize: 13.5, fontWeight: 600 }}>
        <LogOut size={17} style={{ transform: 'scaleX(-1)' }} /> {showLabels && 'Volver al inicio'}
      </button>
    </aside>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: C.neutro, fontFamily: BODY }}>
      {!isMobile && Sidebar}

      {isMobile && navOpen && (
        <div onClick={() => setNavOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(0,0,0,0.45)' }}>
          <div onClick={e => e.stopPropagation()} style={{ height: '100%', width: 264 }}>{Sidebar}</div>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{ height: 56, flexShrink: 0, background: '#fff', borderBottom: `1px solid ${C.borde}`, display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px' }}>
          {isMobile
            ? <button onClick={() => setNavOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><Menu size={22} color={C.texto} /></button>
            : <button onClick={() => setCollapsed(c => !c)} title={collapsed ? 'Expandir' : 'Contraer'} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex' }}>
                {collapsed ? <PanelLeftOpen size={20} color={C.gris} /> : <PanelLeftClose size={20} color={C.gris} />}
              </button>}
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, color: C.grisClaro, fontWeight: 600 }}>Casos borde</div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 16, color: C.texto, lineHeight: 1 }}>{CASE_TITLE[active]}</div>
          </div>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: C.naranja, background: `${C.naranja}14`, border: `1px solid ${C.naranja}33`, padding: '4px 10px', borderRadius: 99, whiteSpace: 'nowrap' }}>DEMO</span>
        </header>

        <main style={{ flex: 1, overflowY: 'auto' }}>
          {active === 'entrega-pago' && <EntregaPagoCase />}
        </main>
      </div>
    </div>
  );
}
