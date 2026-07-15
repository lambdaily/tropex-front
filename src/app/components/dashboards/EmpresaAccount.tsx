import { useState, type CSSProperties } from 'react';
import {
  Building2, Truck, Users, CreditCard, FileText, Clock, Lock, LogOut,
  ChevronRight, ChevronLeft, Plus, X, Check, Trash2, AlertTriangle,
  ShieldCheck, Copy, Share2, Phone, Mail, Download, Star, Pencil,
} from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '../ui/use-mobile';
import { TruckTypeIcon } from '../TruckTypeIcon';
import {
  useDemoStore, getEmpresaFleet, getEmpresaDrivers, setEmpresaFleet, setEmpresaDrivers,
  type EmpresaVehicle, type EmpresaDriver,
} from '../../store/demoStore';
import { shareWhatsApp } from '../../utils/contact';
import { SENACSA_GUIDE_LIMIT } from '../../config/business';

interface EmpresaAccountProps {
  userName: string;
  onLogout: () => void;
  onBack: () => void;
}

type SectionKey = 'menu' | 'perfil' | 'flota' | 'conductores' | 'facturacion' | 'documentos' | 'aprobaciones' | 'seguridad';

interface Approval { id: string; titulo: string; detalle: string; }

const VEHICLE_TYPES: Record<string, string> = {
  'camion-chico': 'Camión chico',
  'camion-mediano': 'Camión mediano',
  'camion-acoplado': 'Camión con acoplado',
  'semirremolque': 'Semirremolque',
};

// ── estilos reutilizables ──
const card: CSSProperties = { background: '#fff', borderRadius: 14, border: '1px solid #E9E4D8', padding: '15px 16px' };
const lbl: CSSProperties = { fontSize: 10, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 };
const val: CSSProperties = { fontSize: 14, fontWeight: 700, color: '#111' };
const input: CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #E5E7EB', fontSize: 14, fontFamily: 'inherit', outline: 'none', color: '#111' };
const primaryBtn: CSSProperties = { padding: '11px 16px', borderRadius: 11, border: 'none', background: '#1E5126', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer' };
const ghostBtn: CSSProperties = { padding: '9px 14px', borderRadius: 10, border: '1.5px solid #E5E7EB', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 700, cursor: 'pointer' };
const dangerBtn: CSSProperties = { padding: '9px 14px', borderRadius: 10, border: '1.5px solid #FECACA', background: '#fff', color: '#B91C1C', fontSize: 13, fontWeight: 700, cursor: 'pointer' };
const sectionTitle: CSSProperties = { fontSize: 16, fontWeight: 800, color: '#111' };
const sectionDesc: CSSProperties = { fontSize: 12, color: '#6B7280', marginTop: 2 };
const approvalChip: CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: '#B45309', background: '#FEF3E2', border: '1px solid #FDE7A7', padding: '2px 8px', borderRadius: 99 };
const verifiedChip: CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: '#1E5126', background: 'rgba(30,81,38,0.08)', padding: '2px 8px', borderRadius: 99 };

export function EmpresaAccount({ userName, onLogout, onBack }: EmpresaAccountProps) {
  const isMobile = useIsMobile();
  useDemoStore(); // re-render on store changes (flota/conductores)

  const [section, setSection] = useState<SectionKey>('menu');
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const addApproval = (titulo: string, detalle: string) => {
    setApprovals(a => [{ id: 'REV-' + (a.length + 101), titulo, detalle }, ...a]);
    toast.success('Cambio enviado a revisión del equipo Tropero.');
  };

  // ── Perfil ──
  const [profile, setProfile] = useState({
    razonSocial: 'Demo Empresa de Transporte S.A.',
    ruc: '80012345-6',
    contacto: userName,
    email: 'operaciones@demoempresa.com.py',
    telefono: '+595 21 555 0100',
    direccion: 'Av. España 1234, Asunción',
    regiones: 'Central · Boquerón · Concepción',
  });
  const [draft, setDraft] = useState(profile);
  const [editingProfile, setEditingProfile] = useState(false);

  // ── Facturación ──
  const [payout, setPayout] = useState('Banco Continental · Cta. ····4321');
  const [editingPayout, setEditingPayout] = useState(false);
  const [payoutDraft, setPayoutDraft] = useState(payout);
  const invoices = [
    { id: 'FAC-2026-03', periodo: 'Marzo 2026', monto: '₲ 1.240.000', estado: 'pendiente' as const },
    { id: 'FAC-2026-02', periodo: 'Febrero 2026', monto: '₲ 1.890.000', estado: 'pagada' as const },
    { id: 'FAC-2026-01', periodo: 'Enero 2026', monto: '₲ 1.520.000', estado: 'pagada' as const },
  ];

  // ── Documentos ──
  const documents = [
    { key: 'ruc', label: 'Constancia de RUC', estado: 'verificado' as const, nota: 'Verificado por Tropero' },
    { key: 'senacsa', label: 'Permiso de transporte SENACSA', estado: 'verificado' as const, nota: 'Habilita el sello Verificado' },
    { key: 'seguro', label: 'Seguro de carga', estado: 'por-vencer' as const, nota: 'Vence el 30/04/2026' },
  ];

  // ── Flota: form de alta ──
  const [showAddTruck, setShowAddTruck] = useState(false);
  const [newTruck, setNewTruck] = useState({ plate: '', type: 'semirremolque', capacityAdults: '', capacityYoung: '', youngEdited: false });
  // Mismos límites SENACSA que el signup: gordos ≤ 45, desmamantes ≤ 80.
  const onAdultsChange = (v: string) => {
    const clamped = v === '' ? '' : String(Math.max(0, Math.min(SENACSA_GUIDE_LIMIT.fat, parseInt(v) || 0)));
    setNewTruck(t => {
      const adults = parseInt(clamped) || 0;
      const young = t.youngEdited ? t.capacityYoung : (adults > 0 ? String(Math.min(adults * 2, SENACSA_GUIDE_LIMIT.weaned)) : '');
      return { ...t, capacityAdults: clamped, capacityYoung: young };
    });
  };
  const onYoungChange = (v: string) => {
    const clamped = v === '' ? '' : String(Math.max(0, Math.min(SENACSA_GUIDE_LIMIT.weaned, parseInt(v) || 0)));
    setNewTruck(t => ({ ...t, capacityYoung: clamped, youngEdited: true }));
  };

  // ── Conductores: invitación ──
  const [inviteCode] = useState(() => 'TRP-' + Math.random().toString(36).substring(2, 8).toUpperCase());
  const [copied, setCopied] = useState(false);

  const fleet = getEmpresaFleet();
  const drivers = getEmpresaDrivers();

  // ── Acciones de flota ──
  const setTruckStatus = (id: string, status: EmpresaVehicle['status']) => {
    setEmpresaFleet(fleet.map(v => v.id === id ? { ...v, status } : v));
    toast.success(`Camión ${id} → ${status}`);
  };
  const removeTruck = (truck: EmpresaVehicle) => {
    const backup = fleet;
    setEmpresaFleet(fleet.filter(v => v.id !== truck.id));
    toast(`Camión ${truck.plate} dado de baja`, { action: { label: 'Deshacer', onClick: () => setEmpresaFleet(backup) } });
  };
  const addTruck = () => {
    if (!newTruck.plate.trim()) { toast.error('Ingresá la chapa del camión.'); return; }
    const adults = parseInt(newTruck.capacityAdults) || 0;
    if (adults <= 0) { toast.error(`Ingresá la capacidad de gordos (1–${SENACSA_GUIDE_LIMIT.fat}).`); return; }
    const young = parseInt(newTruck.capacityYoung) || 0;
    const id = 'CAM-' + String(900 + fleet.length + 1);
    setEmpresaFleet([...fleet, {
      id, plate: newTruck.plate.trim().toUpperCase(), type: newTruck.type,
      capacityAdults: Math.min(adults, SENACSA_GUIDE_LIMIT.fat), capacityYoung: Math.min(young, SENACSA_GUIDE_LIMIT.weaned),
      status: 'disponible', driverId: null,
    }]);
    setShowAddTruck(false);
    setNewTruck({ plate: '', type: 'semirremolque', capacityAdults: '', capacityYoung: '', youngEdited: false });
    addApproval('Alta de camión', `${newTruck.plate.toUpperCase()} requiere validación SENACSA antes de operar.`);
  };

  // ── Acciones de conductores ──
  const toggleDriver = (driver: EmpresaDriver) => {
    setEmpresaDrivers(drivers.map(d => d.id === driver.id ? { ...d, available: !d.available } : d));
    toast.success(driver.available ? `${driver.name} suspendido` : `${driver.name} reactivado`);
  };
  const removeDriver = (driver: EmpresaDriver) => {
    const backup = drivers;
    setEmpresaDrivers(drivers.filter(d => d.id !== driver.id));
    toast(`${driver.name} dado de baja`, { action: { label: 'Deshacer', onClick: () => setEmpresaDrivers(backup) } });
  };
  const copyInvite = () => { navigator.clipboard.writeText(inviteCode); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  // ── Menú de secciones ──
  const SECTIONS: Array<{ key: SectionKey; icon: typeof Building2; label: string; sub: string; badge?: number }> = [
    { key: 'perfil', icon: Building2, label: 'Perfil de la empresa', sub: 'Datos, contacto y regiones' },
    { key: 'flota', icon: Truck, label: 'Flota', sub: `${fleet.length} camiones · capacidad y altas/bajas` },
    { key: 'conductores', icon: Users, label: 'Conductores', sub: `${drivers.length} activos · invitar y dar de baja` },
    { key: 'facturacion', icon: CreditCard, label: 'Facturación y pagos', sub: 'Método de cobro y facturas' },
    { key: 'documentos', icon: FileText, label: 'Documentos y verificación', sub: 'RUC, SENACSA y seguro' },
    { key: 'aprobaciones', icon: Clock, label: 'Solicitudes en revisión', sub: 'Cambios pendientes de aprobación', badge: approvals.length },
    { key: 'seguridad', icon: Lock, label: 'Cuenta y seguridad', sub: 'Email, contraseña y sesión' },
  ];
  const sectionLabel = (k: SectionKey) => SECTIONS.find(s => s.key === k)?.label ?? 'Cuenta';

  // ════════════════ Secciones ════════════════

  const fieldRow = (label: string, value: string, sensitive?: boolean) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '11px 0', borderBottom: '1px solid #F3F0E8' }}>
      <div style={{ minWidth: 0 }}>
        <div style={lbl}>{label}{sensitive && <span style={{ color: '#B45309' }}> · requiere aprobación</span>}</div>
        <div style={{ ...val, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
      </div>
    </div>
  );

  const renderPerfil = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={sectionTitle}>Datos de la empresa</div>
          {!editingProfile && (
            <button onClick={() => { setDraft(profile); setEditingProfile(true); }} style={{ ...ghostBtn, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Pencil size={14} /> Editar</button>
          )}
        </div>
        {!editingProfile ? (
          <div>
            {fieldRow('Razón social', profile.razonSocial, true)}
            {fieldRow('RUC', profile.ruc, true)}
            {fieldRow('Persona de contacto', profile.contacto)}
            {fieldRow('Email', profile.email)}
            {fieldRow('Teléfono', profile.telefono)}
            {fieldRow('Dirección', profile.direccion)}
            <div style={{ paddingTop: 11 }}>
              <div style={lbl}>Regiones de operación</div>
              <div style={{ ...val, marginTop: 2 }}>{profile.regiones}</div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
            {([
              ['razonSocial', 'Razón social', true], ['ruc', 'RUC', true], ['contacto', 'Persona de contacto', false],
              ['email', 'Email', false], ['telefono', 'Teléfono', false], ['direccion', 'Dirección', false], ['regiones', 'Regiones de operación', false],
            ] as const).map(([key, label, sensitive]) => (
              <div key={key}>
                <div style={{ ...lbl, marginBottom: 5 }}>{label}{sensitive && <span style={{ color: '#B45309' }}> · requiere aprobación</span>}</div>
                <input style={input} value={draft[key]} onChange={e => setDraft({ ...draft, [key]: e.target.value })} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setEditingProfile(false)} style={{ ...ghostBtn, flex: 1 }}>Cancelar</button>
              <button
                onClick={() => {
                  const sensitiveChanged = draft.razonSocial !== profile.razonSocial || draft.ruc !== profile.ruc;
                  // Los campos no sensibles se aplican directo; los sensibles van a revisión.
                  setProfile(p => ({ ...p, contacto: draft.contacto, email: draft.email, telefono: draft.telefono, direccion: draft.direccion, regiones: draft.regiones }));
                  if (sensitiveChanged) {
                    addApproval('Cambio de datos legales', `Razón social / RUC. El equipo de Tropero lo revisa antes de aplicarlo.`);
                  } else {
                    toast.success('Datos actualizados.');
                  }
                  setEditingProfile(false);
                }}
                style={{ ...primaryBtn, flex: 1 }}
              >Guardar</button>
            </div>
            <div style={{ fontSize: 11, color: '#92400e', background: '#FFFBEB', border: '1px solid #FDE7A7', borderRadius: 10, padding: '9px 11px' }}>
              Razón social y RUC son datos legales: los cambios quedan en revisión del equipo de Tropero antes de aplicarse.
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderFlota = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <button onClick={() => setShowAddTruck(s => !s)} style={{ ...primaryBtn, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#F58718' }}>
        <Plus size={17} /> Agregar camión
      </button>
      {showAddTruck && (
        <div style={card}>
          <div style={{ ...sectionTitle, fontSize: 14, marginBottom: 10 }}>Nuevo camión</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input style={input} placeholder="Chapa (ej: ABC-123)" value={newTruck.plate} onChange={e => setNewTruck({ ...newTruck, plate: e.target.value })} />
            <div>
              <div style={{ ...lbl, marginBottom: 7 }}>Tipo de camión</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {Object.entries(VEHICLE_TYPES).map(([k, v]) => {
                  const sel = newTruck.type === k;
                  return (
                    <button type="button" key={k} onClick={() => setNewTruck({ ...newTruck, type: k })}
                      style={{ border: `1.5px solid ${sel ? '#1E5126' : '#E5E7EB'}`, background: sel ? 'rgba(30,81,38,0.06)' : '#fff', borderRadius: 12, padding: '12px 8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
                      <div style={{ height: 36, display: 'flex', alignItems: 'center' }}><TruckTypeIcon type={k} height={34} /></div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#111', textAlign: 'center', lineHeight: 1.2 }}>{v}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <div style={{ ...lbl, marginBottom: 5 }}>Cap. gordos · máx {SENACSA_GUIDE_LIMIT.fat}</div>
                <input style={input} type="number" min={0} max={SENACSA_GUIDE_LIMIT.fat} placeholder="Ej: 40" value={newTruck.capacityAdults} onChange={e => onAdultsChange(e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ ...lbl, marginBottom: 5 }}>Cap. desmamantes · máx {SENACSA_GUIDE_LIMIT.weaned}</div>
                <input style={{ ...input, background: newTruck.youngEdited ? '#fff' : '#FEFCE8' }} type="number" min={0} max={SENACSA_GUIDE_LIMIT.weaned} placeholder="Ej: 70" value={newTruck.capacityYoung} onChange={e => onYoungChange(e.target.value)} />
              </div>
            </div>
            <div style={{ fontSize: 11, color: '#6B7280' }}>
              Límites SENACSA por guía: <strong style={{ color: '#111' }}>{SENACSA_GUIDE_LIMIT.fat} gordos</strong> / <strong style={{ color: '#111' }}>{SENACSA_GUIDE_LIMIT.weaned} desmamantes</strong>. Los desmamantes se sugieren solos hasta que los edites. Las altas se validan con SENACSA antes de operar.
            </div>
            <button onClick={addTruck} style={primaryBtn}>Solicitar alta</button>
          </div>
        </div>
      )}
      {fleet.map(truck => {
        const tone = truck.status === 'disponible' ? '#16a34a' : truck.status === 'en-viaje' ? '#1E5126' : '#F58718';
        const driver = drivers.find(d => d.id === truck.driverId);
        return (
          <div key={truck.id} style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: 11, background: tone + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Truck size={20} color={tone} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>{truck.plate}</span>
                  <span style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace' }}>{truck.id}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: tone, background: tone + '14', padding: '2px 8px', borderRadius: 99 }}>{truck.status}</span>
                </div>
                <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                  {VEHICLE_TYPES[truck.type] ?? truck.type} · {truck.capacityAdults}/{truck.capacityYoung} cab.{driver ? ` · ${driver.name}` : ''}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              {truck.status !== 'mantenimiento'
                ? <button onClick={() => setTruckStatus(truck.id, 'mantenimiento')} style={ghostBtn}>Marcar mantenimiento</button>
                : <button onClick={() => setTruckStatus(truck.id, 'disponible')} style={ghostBtn}>Marcar disponible</button>}
              <button onClick={() => removeTruck(truck)} style={{ ...dangerBtn, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Trash2 size={14} /> Dar de baja</button>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderConductores = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Invitación */}
      <div style={card}>
        <div style={{ ...sectionTitle, fontSize: 14, marginBottom: 8 }}>Invitar conductor</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#F6F1E8', borderRadius: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 17, fontWeight: 800, color: '#1E5126', letterSpacing: '0.06em', flex: 1 }}>{inviteCode}</span>
          <button onClick={copyInvite} style={{ ...ghostBtn, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 11px' }}>
            {copied ? <><Check size={13} /> Copiado</> : <><Copy size={13} /> Copiar</>}
          </button>
        </div>
        <button onClick={() => shareWhatsApp(`¡Unite a nuestra flota en TROPEX! Usá este código: ${inviteCode}`)} style={{ ...primaryBtn, width: '100%', background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
          <Share2 size={15} /> Compartir por WhatsApp
        </button>
      </div>
      {/* Lista */}
      {drivers.map(driver => (
        <div key={driver.id} style={{ ...card, opacity: driver.available ? 1 : 0.7 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(30,81,38,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14, fontWeight: 800, color: '#1E5126' }}>
              {driver.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>{driver.name}</div>
              <div style={{ fontSize: 12, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 6, marginTop: 1 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}><Star size={11} style={{ fill: '#F5B301', color: '#F5B301' }} /> {driver.rating}</span>
                <span style={{ color: '#D1D5DB' }}>·</span>
                <span>{driver.tripsCompleted} viajes</span>
              </div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: driver.available ? '#16a34a' : '#9CA3AF', background: driver.available ? '#ECFDF5' : '#F3F4F6', padding: '3px 9px', borderRadius: 99, flexShrink: 0 }}>
              {driver.available ? 'Activo' : 'Suspendido'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button onClick={() => toggleDriver(driver)} style={{ ...ghostBtn, flex: 1 }}>{driver.available ? 'Suspender' : 'Reactivar'}</button>
            <button onClick={() => removeDriver(driver)} style={{ ...dangerBtn, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Trash2 size={14} /> Dar de baja</button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderFacturacion = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ ...sectionTitle, fontSize: 14 }}>Método de cobro</div>
          {!editingPayout && <button onClick={() => { setPayoutDraft(payout); setEditingPayout(true); }} style={{ ...ghostBtn, padding: '7px 11px' }}>Cambiar</button>}
        </div>
        {!editingPayout ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
            <CreditCard size={18} color="#1E5126" />
            <span style={val}>{payout}</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
            <input style={input} value={payoutDraft} onChange={e => setPayoutDraft(e.target.value)} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setEditingPayout(false)} style={{ ...ghostBtn, flex: 1 }}>Cancelar</button>
              <button onClick={() => { setPayout(payoutDraft); setEditingPayout(false); toast.success('Método de cobro actualizado.'); }} style={{ ...primaryBtn, flex: 1 }}>Guardar</button>
            </div>
          </div>
        )}
        <div style={{ fontSize: 11, color: '#6B7280', marginTop: 10, paddingTop: 10, borderTop: '1px solid #F3F0E8' }}>
          Comisión de la plataforma: <strong style={{ color: '#111' }}>8%</strong> por viaje completado.
        </div>
      </div>

      <div style={card}>
        <div style={{ ...sectionTitle, fontSize: 14, marginBottom: 10 }}>Facturas</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {invoices.map((inv, i) => (
            <div key={inv.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: i < invoices.length - 1 ? '1px solid #F3F0E8' : 'none' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{inv.periodo}</div>
                <div style={{ fontSize: 11, color: '#9CA3AF', fontFamily: 'monospace' }}>{inv.id}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#111' }}>{inv.monto}</div>
                <span style={{ fontSize: 10, fontWeight: 700, color: inv.estado === 'pagada' ? '#16a34a' : '#B45309' }}>{inv.estado}</span>
              </div>
              <button onClick={() => toast.success(`Descargando ${inv.id}…`)} style={{ ...ghostBtn, padding: '8px', display: 'flex' }}><Download size={15} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDocumentos = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(30,81,38,0.05)', border: '1px solid rgba(30,81,38,0.18)' }}>
        <ShieldCheck size={26} color="#1E5126" />
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#1E5126' }}>Empresa verificada</div>
          <div style={{ fontSize: 12, color: '#4B5563' }}>Tus documentos SENACSA están al día. El sello aparece en tus ofertas.</div>
        </div>
      </div>
      {documents.map(doc => (
        <div key={doc.key} style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#F6F1E8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FileText size={18} color="#1E5126" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{doc.label}</div>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>{doc.nota}</div>
            </div>
            {doc.estado === 'verificado'
              ? <span style={verifiedChip}><Check size={11} /> Verificado</span>
              : <span style={approvalChip}><AlertTriangle size={11} /> Por vencer</span>}
          </div>
          <button onClick={() => addApproval('Reemplazo de documento', `${doc.label}. Queda en revisión hasta validarse.`)} style={{ ...ghostBtn, width: '100%', marginTop: 12 }}>Reemplazar documento</button>
        </div>
      ))}
    </div>
  );

  const renderAprobaciones = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.5 }}>
        Algunos cambios (datos legales, altas de camiones, documentos) los revisa el equipo de Tropero antes de aplicarse. Acá ves su estado.
      </div>
      {approvals.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', padding: '28px 16px' }}>
          <Check size={28} color="#9CA3AF" style={{ margin: '0 auto 8px', display: 'block' }} />
          <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>No tenés solicitudes pendientes</div>
          <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 3 }}>Los cambios que requieran aprobación aparecerán acá.</div>
        </div>
      ) : approvals.map(a => (
        <div key={a.id} style={card}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: '#FEF3E2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Clock size={18} color="#F58718" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>{a.titulo}</span>
                <span style={approvalChip}>En revisión</span>
              </div>
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3, lineHeight: 1.4 }}>{a.detalle}</div>
              <div style={{ fontSize: 10, color: '#9CA3AF', fontFamily: 'monospace', marginTop: 4 }}>{a.id}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSeguridad = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={card}>
        <div style={lbl}>Email de acceso</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}><Mail size={15} color="#1E5126" /><span style={val}>{profile.email}</span></div>
      </div>
      <button onClick={() => toast.success('Te enviamos un email para cambiar la contraseña.')} style={{ ...card, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left', width: '100%' }}>
        <Lock size={18} color="#1E5126" />
        <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>Cambiar contraseña</div><div style={{ fontSize: 12, color: '#9CA3AF' }}>Te enviamos un enlace por email</div></div>
        <ChevronRight size={18} color="#D1D5DB" />
      </button>
      <button onClick={() => { window.open('https://wa.me/595210000000', '_blank'); }} style={{ ...card, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left', width: '100%' }}>
        <Phone size={18} color="#1E5126" />
        <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>Soporte</div><div style={{ fontSize: 12, color: '#9CA3AF' }}>Chat y teléfono</div></div>
        <ChevronRight size={18} color="#D1D5DB" />
      </button>
      <button onClick={onLogout} style={{ ...dangerBtn, width: '100%', padding: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14 }}>
        <LogOut size={16} /> Cerrar sesión
      </button>
    </div>
  );

  const renderSectionContent = (k: SectionKey) => {
    switch (k) {
      case 'flota': return renderFlota();
      case 'conductores': return renderConductores();
      case 'facturacion': return renderFacturacion();
      case 'documentos': return renderDocumentos();
      case 'aprobaciones': return renderAprobaciones();
      case 'seguridad': return renderSeguridad();
      default: return renderPerfil();
    }
  };

  // ── Resumen de empresa (cabecera del menú) ──
  const companyHeader = (
    <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 13 }}>
      <div style={{ width: 48, height: 48, borderRadius: 13, background: '#1E5126', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Building2 size={22} color="#fff" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: '#111' }}>{profile.razonSocial}</span>
          <span style={verifiedChip}><ShieldCheck size={11} /> Verificada</span>
        </div>
        <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>RUC {profile.ruc} · {fleet.length} camiones · {drivers.length} choferes</div>
      </div>
    </div>
  );

  // ════════════════ Layout responsive ════════════════

  if (isMobile) {
    return (
      <div style={{ paddingBottom: 90, fontFamily: '"IBM Plex Sans", system-ui, sans-serif' }}>
        <div style={{ background: '#1E5126', padding: '14px 16px 16px', paddingTop: 'max(14px, env(safe-area-inset-top))' }}>
          <button onClick={() => section === 'menu' ? onBack() : setSection('menu')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 700, cursor: 'pointer', padding: 0, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>
            <ChevronLeft size={16} /> {section === 'menu' ? 'Volver al panel' : 'Cuenta'}
          </button>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{section === 'menu' ? 'Cuenta' : sectionLabel(section)}</div>
        </div>
        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {section === 'menu' ? (
            <>
              {companyHeader}
              {SECTIONS.map(s => (
                <button key={s.key} onClick={() => setSection(s.key)} style={{ ...card, display: 'flex', alignItems: 'center', gap: 13, cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: '#F6F1E8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <s.icon size={18} color="#1E5126" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{s.label}</div>
                    <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 1 }}>{s.sub}</div>
                  </div>
                  {!!s.badge && s.badge > 0 && <span style={{ ...approvalChip, marginRight: 4 }}>{s.badge}</span>}
                  <ChevronRight size={18} color="#D1D5DB" />
                </button>
              ))}
              <button onClick={onLogout} style={{ ...dangerBtn, width: '100%', padding: '13px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14, marginTop: 2 }}>
                <LogOut size={16} /> Cerrar sesión
              </button>
            </>
          ) : renderSectionContent(section)}
        </div>
      </div>
    );
  }

  // ── Desktop: cabecera + nav lateral + contenido ──
  const activeDesktop: SectionKey = section === 'menu' ? 'perfil' : section;
  return (
    <div style={{ fontFamily: '"IBM Plex Sans", system-ui, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#111' }}>Cuenta de la empresa</div>
          <div style={sectionDesc}>Gestioná tu empresa, flota, choferes, facturación y documentos.</div>
        </div>
        <button onClick={onBack} style={{ ...ghostBtn, display: 'inline-flex', alignItems: 'center', gap: 6 }}><ChevronLeft size={15} /> Volver al panel</button>
      </div>
      {companyHeader}
      <div style={{ display: 'flex', gap: 22, alignItems: 'flex-start', marginTop: 18 }}>
        <nav style={{ width: 250, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {SECTIONS.map(s => {
            const active = s.key === activeDesktop;
            return (
              <button key={s.key} onClick={() => setSection(s.key)} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 13px', borderRadius: 11, border: 'none', cursor: 'pointer', background: active ? 'rgba(30,81,38,0.08)' : 'transparent', textAlign: 'left', width: '100%' }}>
                <s.icon size={18} color={active ? '#1E5126' : '#9CA3AF'} />
                <span style={{ flex: 1, fontSize: 14, fontWeight: active ? 800 : 600, color: active ? '#1E5126' : '#374151' }}>{s.label}</span>
                {!!s.badge && s.badge > 0 && <span style={approvalChip}>{s.badge}</span>}
              </button>
            );
          })}
        </nav>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: 14 }}>
            <div style={sectionTitle}>{sectionLabel(activeDesktop)}</div>
            <div style={sectionDesc}>{SECTIONS.find(s => s.key === activeDesktop)?.sub}</div>
          </div>
          {renderSectionContent(activeDesktop)}
        </div>
      </div>
    </div>
  );
}
