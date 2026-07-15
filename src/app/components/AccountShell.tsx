// Shell + estilos compartidos para los módulos de Cuenta de todos los roles.
// Garantiza que empresa, ganadero, owner-operator y chofer se vean idénticos.
import { useState, type CSSProperties, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, LogOut, Clock, Check } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useIsMobile } from './ui/use-mobile';

export interface Approval { id: string; titulo: string; detalle: string; }

export interface AccountSection {
  key: string;
  icon: LucideIcon;
  label: string;
  sub: string;
  badge?: number;
  render: () => ReactNode;
}

// ── estilos compartidos ──
export const ui = {
  card: { background: '#fff', borderRadius: 14, border: '1px solid #E9E4D8', padding: '15px 16px' } as CSSProperties,
  lbl: { fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 } as CSSProperties,
  val: { fontSize: 14, fontWeight: 700, color: '#111' } as CSSProperties,
  input: { width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #E5E7EB', fontSize: 14, fontFamily: 'inherit', outline: 'none', color: '#111' } as CSSProperties,
  primaryBtn: { padding: '11px 16px', borderRadius: 11, border: 'none', background: '#1E5126', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer' } as CSSProperties,
  ghostBtn: { padding: '9px 14px', borderRadius: 10, border: '1.5px solid #E5E7EB', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 700, cursor: 'pointer' } as CSSProperties,
  dangerBtn: { padding: '9px 14px', borderRadius: 10, border: '1.5px solid #FECACA', background: '#fff', color: '#B91C1C', fontSize: 13, fontWeight: 700, cursor: 'pointer' } as CSSProperties,
  sectionTitle: { fontSize: 16, fontWeight: 800, color: '#111' } as CSSProperties,
  sectionDesc: { fontSize: 12, color: '#6B7280', marginTop: 2 } as CSSProperties,
  approvalChip: { display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: '#B45309', background: '#FEF3E2', border: '1px solid #FDE7A7', padding: '2px 8px', borderRadius: 99 } as CSSProperties,
  verifiedChip: { display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: '#1E5126', background: 'rgba(30,81,38,0.08)', padding: '2px 8px', borderRadius: 99 } as CSSProperties,
};

// Fila de dato (vista lectura). `sensitive` marca que el cambio requiere aprobación.
export function fieldRow(label: string, value: string, sensitive?: boolean) {
  return (
    <div style={{ padding: '11px 0', borderBottom: '1px solid #F3F0E8' }}>
      <div style={ui.lbl}>{label}{sensitive && <span style={{ color: '#B45309' }}> · requiere aprobación</span>}</div>
      <div style={{ ...ui.val, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
    </div>
  );
}

// Sección "Solicitudes en revisión" (igual para todos los roles).
export function ApprovalsSection({ approvals, intro }: { approvals: Approval[]; intro: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>{intro}</div>
      {approvals.length === 0 ? (
        <div style={{ ...ui.card, textAlign: 'center', padding: '28px 16px' }}>
          <Check size={28} color="#9CA3AF" style={{ margin: '0 auto 8px', display: 'block' }} />
          <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>No tenés solicitudes pendientes</div>
          <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 3 }}>Los cambios que requieran aprobación aparecerán acá.</div>
        </div>
      ) : approvals.map(a => (
        <div key={a.id} style={ui.card}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: '#FEF3E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Clock size={18} color="#F58718" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>{a.titulo}</span>
                <span style={ui.approvalChip}>En revisión</span>
              </div>
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3, lineHeight: 1.4 }}>{a.detalle}</div>
              <div style={{ fontSize: 10, color: '#9CA3AF', fontFamily: 'monospace', marginTop: 4 }}>{a.id}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface AccountShellProps {
  title: string;       // "Mi cuenta" / "Cuenta de la empresa"
  subtitle: string;    // desktop: bajada
  summary: ReactNode;  // tarjeta resumen (empresa/persona)
  sections: AccountSection[];
  onBack: () => void;
  onLogout: () => void;
}

export function AccountShell({ title, subtitle, summary, sections, onBack, onLogout }: AccountShellProps) {
  const isMobile = useIsMobile();
  const [section, setSection] = useState<string>('menu');
  const labelFor = (k: string) => sections.find(s => s.key === k)?.label ?? 'Cuenta';
  const subFor = (k: string) => sections.find(s => s.key === k)?.sub ?? '';
  const render = (k: string) => sections.find(s => s.key === k)?.render() ?? null;

  // ── Mobile: menú → sub-pantallas ──
  if (isMobile) {
    return (
      <div style={{ paddingBottom: 90, fontFamily: '"IBM Plex Sans", system-ui, sans-serif' }}>
        <div style={{ background: '#1E5126', padding: '14px 16px 16px', paddingTop: 'max(14px, env(safe-area-inset-top))' }}>
          <button onClick={() => section === 'menu' ? onBack() : setSection('menu')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 0, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
            <ChevronLeft size={16} /> {section === 'menu' ? 'Volver al panel' : 'Cuenta'}
          </button>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{section === 'menu' ? title : labelFor(section)}</div>
        </div>
        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {section === 'menu' ? (
            <>
              {summary}
              {sections.map(s => (
                <button key={s.key} onClick={() => setSection(s.key)} style={{ ...ui.card, display: 'flex', alignItems: 'center', gap: 13, cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: '#F6F1E8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <s.icon size={18} color="#1E5126" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{s.label}</div>
                    <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 1 }}>{s.sub}</div>
                  </div>
                  {!!s.badge && s.badge > 0 && <span style={{ ...ui.approvalChip, marginRight: 4 }}>{s.badge}</span>}
                  <ChevronRight size={18} color="#D1D5DB" />
                </button>
              ))}
              <button onClick={onLogout} style={{ ...ui.dangerBtn, width: '100%', padding: '13px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14, marginTop: 2 }}>
                <LogOut size={16} /> Cerrar sesión
              </button>
            </>
          ) : render(section)}
        </div>
      </div>
    );
  }

  // ── Desktop: cabecera + nav lateral + contenido ──
  const activeDesktop = section === 'menu' ? sections[0]?.key : section;
  return (
    <div style={{ fontFamily: '"IBM Plex Sans", system-ui, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#111' }}>{title}</div>
          <div style={ui.sectionDesc}>{subtitle}</div>
        </div>
        <button onClick={onBack} style={{ ...ui.ghostBtn, display: 'inline-flex', alignItems: 'center', gap: 6 }}><ChevronLeft size={15} /> Volver al panel</button>
      </div>
      {summary}
      <div style={{ display: 'flex', gap: 22, alignItems: 'flex-start', marginTop: 18 }}>
        <nav style={{ width: 250, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {sections.map(s => {
            const active = s.key === activeDesktop;
            return (
              <button key={s.key} onClick={() => setSection(s.key)} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 13px', borderRadius: 11, border: 'none', cursor: 'pointer', background: active ? 'rgba(30,81,38,0.08)' : 'transparent', textAlign: 'left', width: '100%' }}>
                <s.icon size={18} color={active ? '#1E5126' : '#9CA3AF'} />
                <span style={{ flex: 1, fontSize: 14, fontWeight: active ? 800 : 600, color: active ? '#1E5126' : '#374151' }}>{s.label}</span>
                {!!s.badge && s.badge > 0 && <span style={ui.approvalChip}>{s.badge}</span>}
              </button>
            );
          })}
        </nav>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: 14 }}>
            <div style={ui.sectionTitle}>{labelFor(activeDesktop)}</div>
            <div style={ui.sectionDesc}>{subFor(activeDesktop)}</div>
          </div>
          {render(activeDesktop)}
        </div>
      </div>
    </div>
  );
}
