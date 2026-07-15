import { useState } from 'react';
import {
  User, Truck, FileText, CreditCard, Clock, Lock, ShieldCheck, Check,
  Mail, Phone, ChevronRight, Pencil, ArrowUpRight, Building2,
} from 'lucide-react';
import { toast } from 'sonner';
import { AccountShell, ApprovalsSection, ui, fieldRow, type Approval, type AccountSection } from '../AccountShell';
import { TruckTypeIcon } from '../TruckTypeIcon';
import { SENACSA_GUIDE_LIMIT } from '../../config/business';

interface OwnerOperatorAccountProps {
  userName: string;
  onLogout: () => void;
  onBack: () => void;
}

const VEHICLE_TYPES: Record<string, string> = {
  'camion-chico': 'Camión chico',
  'camion-mediano': 'Camión mediano',
  'camion-acoplado': 'Camión con acoplado',
  'semirremolque': 'Semirremolque',
};

export function OwnerOperatorAccount({ userName, onLogout, onBack }: OwnerOperatorAccountProps) {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const addApproval = (titulo: string, detalle: string) => {
    setApprovals(a => [{ id: 'REV-' + (a.length + 301), titulo, detalle }, ...a]);
    toast.success('Solicitud enviada a revisión del equipo Tropero.');
  };

  const [profile, setProfile] = useState({ nombre: userName, cedula: '4.567.890', ruc: '4567890-1', telefono: '+595 981 456 789', email: 'transportista@demo.com.py' });
  const [pDraft, setPDraft] = useState(profile);
  const [editP, setEditP] = useState(false);

  // Vehículo único del owner-operator
  const [vehicle, setVehicle] = useState({ plate: 'ABC-123', type: 'semirremolque', capacityAdults: 45, capacityYoung: 80 });
  const [vDraft, setVDraft] = useState({ ...vehicle, youngEdited: true });
  const [editV, setEditV] = useState(false);
  const [converting, setConverting] = useState(false);

  const onVAdults = (v: string) => {
    const a = Math.max(0, Math.min(SENACSA_GUIDE_LIMIT.fat, parseInt(v) || 0));
    setVDraft(d => ({ ...d, capacityAdults: a, capacityYoung: d.youngEdited ? d.capacityYoung : Math.min(a * 2, SENACSA_GUIDE_LIMIT.weaned) }));
  };
  const onVYoung = (v: string) => setVDraft(d => ({ ...d, capacityYoung: Math.max(0, Math.min(SENACSA_GUIDE_LIMIT.weaned, parseInt(v) || 0)), youngEdited: true }));

  const [payout, setPayout] = useState<'delayed' | 'instant'>('delayed');
  const [cuenta, setCuenta] = useState('Banco Continental · Cta. ····4321');

  const documents = [
    { key: 'licencia', label: 'Licencia de conducir', estado: 'verificado' as const, nota: 'Verificada por Tropero' },
    { key: 'cedula', label: 'Cédula verde del vehículo', estado: 'verificado' as const, nota: 'Asociada a la chapa ' + vehicle.plate },
    { key: 'senacsa', label: 'Permiso SENACSA', estado: 'verificado' as const, nota: 'Habilita el sello Verificado' },
  ];

  const summary = (
    <div style={{ ...ui.card, display: 'flex', alignItems: 'center', gap: 13 }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#1E5126', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><User size={22} color="#fff" /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: '#111' }}>{profile.nombre}</span>
          <span style={ui.verifiedChip}><ShieldCheck size={11} /> Verificado</span>
        </div>
        <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>Transportista independiente · {vehicle.plate}</div>
      </div>
    </div>
  );

  const renderPerfil = () => (
    <div style={ui.card}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={ui.sectionTitle}>Datos personales</div>
        {!editP && <button onClick={() => { setPDraft(profile); setEditP(true); }} style={{ ...ui.ghostBtn, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Pencil size={14} /> Editar</button>}
      </div>
      {!editP ? (
        <div>
          {fieldRow('Nombre completo', profile.nombre)}
          {fieldRow('Cédula', profile.cedula, true)}
          {fieldRow('RUC', profile.ruc, true)}
          {fieldRow('Teléfono', profile.telefono)}
          {fieldRow('Email', profile.email)}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
          {([['nombre', 'Nombre completo', false], ['cedula', 'Cédula', true], ['ruc', 'RUC', true], ['telefono', 'Teléfono', false], ['email', 'Email', false]] as const).map(([k, l, s]) => (
            <div key={k}><div style={{ ...ui.lbl, marginBottom: 5 }}>{l}{s && <span style={{ color: '#B45309' }}> · requiere aprobación</span>}</div><input style={ui.input} value={pDraft[k]} onChange={e => setPDraft({ ...pDraft, [k]: e.target.value })} /></div>
          ))}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setEditP(false)} style={{ ...ui.ghostBtn, flex: 1 }}>Cancelar</button>
            <button onClick={() => {
              const sens = pDraft.cedula !== profile.cedula || pDraft.ruc !== profile.ruc;
              setProfile(prev => ({ ...prev, nombre: pDraft.nombre, telefono: pDraft.telefono, email: pDraft.email }));
              if (sens) addApproval('Cambio de datos legales', 'Cédula / RUC. El equipo lo revisa antes de aplicarlo.');
              else toast.success('Datos actualizados.');
              setEditP(false);
            }} style={{ ...ui.primaryBtn, flex: 1 }}>Guardar</button>
          </div>
        </div>
      )}
    </div>
  );

  const renderVehiculo = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={ui.card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={ui.sectionTitle}>Mi camión</div>
          {!editV && <button onClick={() => { setVDraft({ ...vehicle, youngEdited: true }); setEditV(true); }} style={{ ...ui.ghostBtn, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Pencil size={14} /> Editar</button>}
        </div>
        {!editV ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <TruckTypeIcon type={vehicle.type} height={42} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#111' }}>{vehicle.plate}</div>
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{VEHICLE_TYPES[vehicle.type]} · {vehicle.capacityAdults} gordos / {vehicle.capacityYoung} desmamantes</div>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div><div style={{ ...ui.lbl, marginBottom: 5 }}>Chapa</div><input style={ui.input} value={vDraft.plate} onChange={e => setVDraft({ ...vDraft, plate: e.target.value })} /></div>
            <div>
              <div style={{ ...ui.lbl, marginBottom: 7 }}>Tipo de camión</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {Object.entries(VEHICLE_TYPES).map(([k, v]) => {
                  const sel = vDraft.type === k;
                  return (
                    <button type="button" key={k} onClick={() => setVDraft({ ...vDraft, type: k })} style={{ border: `1.5px solid ${sel ? '#1E5126' : '#E5E7EB'}`, background: sel ? 'rgba(30,81,38,0.06)' : '#fff', borderRadius: 12, padding: '12px 8px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
                      <div style={{ height: 36, display: 'flex', alignItems: 'center' }}><TruckTypeIcon type={k} height={34} /></div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#111', textAlign: 'center', lineHeight: 1.2 }}>{v}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}><div style={{ ...ui.lbl, marginBottom: 5 }}>Cap. gordos · máx {SENACSA_GUIDE_LIMIT.fat}</div><input style={ui.input} type="number" min={0} max={SENACSA_GUIDE_LIMIT.fat} value={vDraft.capacityAdults || ''} onChange={e => onVAdults(e.target.value)} /></div>
              <div style={{ flex: 1 }}><div style={{ ...ui.lbl, marginBottom: 5 }}>Cap. desmamantes · máx {SENACSA_GUIDE_LIMIT.weaned}</div><input style={ui.input} type="number" min={0} max={SENACSA_GUIDE_LIMIT.weaned} value={vDraft.capacityYoung || ''} onChange={e => onVYoung(e.target.value)} /></div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setEditV(false)} style={{ ...ui.ghostBtn, flex: 1 }}>Cancelar</button>
              <button onClick={() => {
                const plateChanged = vDraft.plate !== vehicle.plate;
                setVehicle({ plate: vDraft.plate, type: vDraft.type, capacityAdults: vDraft.capacityAdults, capacityYoung: vDraft.capacityYoung });
                setEditV(false);
                if (plateChanged) addApproval('Cambio de vehículo', `Chapa ${vDraft.plate}. Requiere validación SENACSA.`);
                else toast.success('Vehículo actualizado.');
              }} style={{ ...ui.primaryBtn, flex: 1 }}>Guardar</button>
            </div>
          </div>
        )}
      </div>

      {/* Sumar otro camión → convertir a Empresa */}
      <div style={{ ...ui.card, background: 'rgba(245,135,24,0.06)', border: '1px solid rgba(245,135,24,0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 11 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Building2 size={20} color="#F58718" /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#111' }}>¿Querés sumar otro camión?</div>
            <div style={{ fontSize: 12, color: '#4B5563', marginTop: 3, lineHeight: 1.5 }}>
              Como transportista independiente operás con <strong>un</strong> camión. Para manejar una <strong>flota con varios camiones y conductores</strong> necesitás una cuenta de <strong>Empresa</strong>. Convertimos tu cuenta y migramos tus datos.
            </div>
          </div>
        </div>
        {!converting ? (
          <button onClick={() => setConverting(true)} style={{ ...ui.primaryBtn, background: '#F58718', width: '100%', marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
            <ArrowUpRight size={16} /> Convertir mi cuenta a Empresa
          </button>
        ) : (
          <div style={{ marginTop: 12, background: '#fff', borderRadius: 11, padding: '12px 13px', border: '1px solid #FDE7A7' }}>
            <div style={{ fontSize: 12, color: '#4B5563', lineHeight: 1.5, marginBottom: 10 }}>Vas a solicitar la conversión a <strong>cuenta Empresa</strong>. Migramos tu vehículo, documentos y datos de pago; después vas a poder agregar camiones y conductores. El equipo de Tropero te contacta para confirmar.</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConverting(false)} style={{ ...ui.ghostBtn, flex: 1 }}>Ahora no</button>
              <button onClick={() => { setConverting(false); addApproval('Conversión a cuenta Empresa', 'Migración de Owner-Operator a Empresa para operar con flota y conductores.'); }} style={{ ...ui.primaryBtn, flex: 1, background: '#F58718' }}>Solicitar conversión</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderDocumentos = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ ...ui.card, display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(30,81,38,0.05)', border: '1px solid rgba(30,81,38,0.18)' }}>
        <ShieldCheck size={26} color="#1E5126" />
        <div><div style={{ fontSize: 14, fontWeight: 800, color: '#1E5126' }}>Transportista verificado</div><div style={{ fontSize: 12, color: '#4B5563' }}>Tus documentos están al día. El sello aparece en tus ofertas.</div></div>
      </div>
      {documents.map(doc => (
        <div key={doc.key} style={ui.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#F6F1E8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FileText size={18} color="#1E5126" /></div>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{doc.label}</div><div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>{doc.nota}</div></div>
            <span style={ui.verifiedChip}><Check size={11} /> Verificado</span>
          </div>
          <button onClick={() => addApproval('Reemplazo de documento', `${doc.label}. Queda en revisión hasta validarse.`)} style={{ ...ui.ghostBtn, width: '100%', marginTop: 12 }}>Reemplazar documento</button>
        </div>
      ))}
    </div>
  );

  const renderPagos = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={ui.card}>
        <div style={{ ...ui.sectionTitle, fontSize: 14, marginBottom: 10 }}>Cómo querés cobrar</div>
        {([
          { key: 'delayed' as const, t: 'Cobro estándar', d: 'Después de que el ganadero confirma la entrega.', fee: '3% de comisión' },
          { key: 'instant' as const, t: 'Cobro inmediato', d: 'Apenas se completa el viaje.', fee: '5% de comisión' },
        ]).map(o => {
          const sel = payout === o.key;
          return (
            <button key={o.key} onClick={() => { setPayout(o.key); toast.success('Preferencia de cobro guardada.'); }} style={{ display: 'flex', alignItems: 'center', gap: 11, width: '100%', textAlign: 'left', border: `1.5px solid ${sel ? '#1E5126' : '#E5E7EB'}`, background: sel ? 'rgba(30,81,38,0.06)' : '#fff', borderRadius: 12, padding: '12px 13px', cursor: 'pointer', marginBottom: 8 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${sel ? '#1E5126' : '#D1D5DB'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{sel && <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#1E5126' }} />}</div>
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{o.t}</div><div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>{o.d}</div></div>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#1E5126', flexShrink: 0 }}>{o.fee}</span>
            </button>
          );
        })}
      </div>
      <div style={ui.card}>
        <div style={{ ...ui.sectionTitle, fontSize: 14, marginBottom: 8 }}>Cuenta de cobro</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><CreditCard size={18} color="#1E5126" /><span style={ui.val}>{cuenta}</span></div>
        <button onClick={() => { const v = prompt('Nueva cuenta de cobro', cuenta); if (v) { setCuenta(v); toast.success('Cuenta actualizada.'); } }} style={{ ...ui.ghostBtn, width: '100%', marginTop: 12 }}>Cambiar cuenta</button>
      </div>
    </div>
  );

  const renderSeguridad = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={ui.card}><div style={ui.lbl}>Email de acceso</div><div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}><Mail size={15} color="#1E5126" /><span style={ui.val}>{profile.email}</span></div></div>
      <button onClick={() => toast.success('Te enviamos un email para cambiar la contraseña.')} style={{ ...ui.card, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left', width: '100%' }}>
        <Lock size={18} color="#1E5126" /><div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>Cambiar contraseña</div><div style={{ fontSize: 12, color: '#9CA3AF' }}>Te enviamos un enlace por email</div></div><ChevronRight size={18} color="#D1D5DB" />
      </button>
      <button onClick={() => window.open('https://wa.me/595210000000', '_blank')} style={{ ...ui.card, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left', width: '100%' }}>
        <Phone size={18} color="#1E5126" /><div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>Soporte</div><div style={{ fontSize: 12, color: '#9CA3AF' }}>Chat y teléfono</div></div><ChevronRight size={18} color="#D1D5DB" />
      </button>
      <button onClick={onLogout} style={{ ...ui.dangerBtn, width: '100%', padding: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14 }}><Lock size={16} /> Cerrar sesión</button>
    </div>
  );

  const sections: AccountSection[] = [
    { key: 'perfil', icon: User, label: 'Mi perfil', sub: 'Datos personales', render: renderPerfil },
    { key: 'vehiculo', icon: Truck, label: 'Mi vehículo', sub: 'Camión, capacidad y conversión', render: renderVehiculo },
    { key: 'documentos', icon: FileText, label: 'Documentos y verificación', sub: 'Licencia, cédula verde y SENACSA', render: renderDocumentos },
    { key: 'pagos', icon: CreditCard, label: 'Cobros y pagos', sub: 'Cómo y dónde cobrás', render: renderPagos },
    { key: 'aprobaciones', icon: Clock, label: 'Solicitudes en revisión', sub: 'Cambios pendientes de aprobación', badge: approvals.length, render: () => <ApprovalsSection approvals={approvals} intro="Datos legales, cambios de vehículo, documentos y la conversión a Empresa los revisa el equipo de Tropero. Acá ves su estado." /> },
    { key: 'seguridad', icon: Lock, label: 'Cuenta y seguridad', sub: 'Email, contraseña y sesión', render: renderSeguridad },
  ];

  return <AccountShell title="Mi cuenta" subtitle="Transportista independiente · gestioná tu vehículo, documentos y cobros." summary={summary} sections={sections} onBack={onBack} onLogout={onLogout} />;
}
