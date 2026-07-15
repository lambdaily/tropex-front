import { useState } from 'react';
import {
  User, Building2, FileText, Clock, Lock, ShieldCheck, Check,
  Mail, Phone, ChevronRight, Pencil,
} from 'lucide-react';
import { toast } from 'sonner';
import { AccountShell, ApprovalsSection, ui, fieldRow, type Approval, type AccountSection } from '../AccountShell';

interface DriverAccountProps {
  userName: string;
  onLogout: () => void;
  onBack: () => void;
}

export function DriverAccount({ userName, onLogout, onBack }: DriverAccountProps) {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const addApproval = (titulo: string, detalle: string) => {
    setApprovals(a => [{ id: 'REV-' + (a.length + 401), titulo, detalle }, ...a]);
    toast.success('Solicitud enviada a revisión.');
  };

  const [profile, setProfile] = useState({ nombre: userName, cedula: '5.123.456', telefono: '+595 981 222 333', emergencia: 'María (esposa) · +595 981 999 000' });
  const [draft, setDraft] = useState(profile);
  const [edit, setEdit] = useState(false);

  const empresa = { nombre: 'Transporte González S.A.', ruc: '80055555-1', contacto: '+595 21 555 0100', desde: 'Marzo 2025' };

  const documents = [
    { key: 'licencia', label: 'Licencia de conducir', estado: 'verificado' as const, nota: 'Verificada por tu empresa' },
    { key: 'cedula', label: 'Cédula de identidad', estado: 'verificado' as const, nota: 'Documento personal' },
  ];

  const summary = (
    <div style={{ ...ui.card, display: 'flex', alignItems: 'center', gap: 13 }}>
      <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#1E5126', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><User size={22} color="#fff" /></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: '#111' }}>{profile.nombre}</span>
          <span style={ui.verifiedChip}><ShieldCheck size={11} /> Verificado</span>
        </div>
        <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>Chofer · {empresa.nombre}</div>
      </div>
    </div>
  );

  const renderPerfil = () => (
    <div style={ui.card}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={ui.sectionTitle}>Datos personales</div>
        {!edit && <button onClick={() => { setDraft(profile); setEdit(true); }} style={{ ...ui.ghostBtn, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Pencil size={14} /> Editar</button>}
      </div>
      {!edit ? (
        <div>
          {fieldRow('Nombre completo', profile.nombre)}
          {fieldRow('Cédula', profile.cedula, true)}
          {fieldRow('Teléfono', profile.telefono)}
          {fieldRow('Contacto de emergencia', profile.emergencia)}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
          {([['nombre', 'Nombre completo', false], ['cedula', 'Cédula', true], ['telefono', 'Teléfono', false], ['emergencia', 'Contacto de emergencia', false]] as const).map(([k, l, s]) => (
            <div key={k}><div style={{ ...ui.lbl, marginBottom: 5 }}>{l}{s && <span style={{ color: '#B45309' }}> · requiere aprobación</span>}</div><input style={ui.input} value={draft[k]} onChange={e => setDraft({ ...draft, [k]: e.target.value })} /></div>
          ))}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setEdit(false)} style={{ ...ui.ghostBtn, flex: 1 }}>Cancelar</button>
            <button onClick={() => {
              const sens = draft.cedula !== profile.cedula;
              setProfile(prev => ({ ...prev, nombre: draft.nombre, telefono: draft.telefono, emergencia: draft.emergencia }));
              if (sens) addApproval('Cambio de cédula', 'Tu empresa debe validar el cambio de documento.');
              else toast.success('Datos actualizados.');
              setEdit(false);
            }} style={{ ...ui.primaryBtn, flex: 1 }}>Guardar</button>
          </div>
        </div>
      )}
    </div>
  );

  const renderEmpresa = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={ui.card}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 11, background: 'rgba(30,81,38,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Building2 size={20} color="#1E5126" /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: '#111' }}>{empresa.nombre}</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 1 }}>Sos conductor desde {empresa.desde}</div>
          </div>
        </div>
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #F3F0E8' }}>
          {fieldRow('RUC de la empresa', empresa.ruc)}
          {fieldRow('Contacto', empresa.contacto)}
        </div>
        <button onClick={() => addApproval('Baja de la empresa', `${empresa.nombre} debe confirmar tu desvinculación.`)} style={{ ...ui.dangerBtn, width: '100%', marginTop: 12 }}>Solicitar baja de la empresa</button>
      </div>
      <div style={{ fontSize: 11, color: '#6B7280', lineHeight: 1.5 }}>
        Tu empresa administra los viajes que se te asignan. Para cambiar de empresa, pedí la baja y unite a otra con su código de invitación.
      </div>
    </div>
  );

  const renderDocumentos = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ ...ui.card, display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(30,81,38,0.05)', border: '1px solid rgba(30,81,38,0.18)' }}>
        <ShieldCheck size={26} color="#1E5126" />
        <div><div style={{ fontSize: 14, fontWeight: 800, color: '#1E5126' }}>Documentos al día</div><div style={{ fontSize: 12, color: '#4B5563' }}>Mantené tu licencia y cédula vigentes para poder conducir.</div></div>
      </div>
      {documents.map(doc => (
        <div key={doc.key} style={ui.card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#F6F1E8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><FileText size={18} color="#1E5126" /></div>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>{doc.label}</div><div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>{doc.nota}</div></div>
            <span style={ui.verifiedChip}><Check size={11} /> Verificado</span>
          </div>
          <button onClick={() => addApproval('Reemplazo de documento', `${doc.label}. Tu empresa lo valida.`)} style={{ ...ui.ghostBtn, width: '100%', marginTop: 12 }}>Reemplazar documento</button>
        </div>
      ))}
    </div>
  );

  const renderSeguridad = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <button onClick={() => toast.success('Te enviamos un email para cambiar la contraseña.')} style={{ ...ui.card, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left', width: '100%' }}>
        <Lock size={18} color="#1E5126" /><div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>Cambiar contraseña</div><div style={{ fontSize: 12, color: '#9CA3AF' }}>Te enviamos un enlace por email</div></div><ChevronRight size={18} color="#D1D5DB" />
      </button>
      <button onClick={() => window.open('https://wa.me/595210000000', '_blank')} style={{ ...ui.card, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left', width: '100%' }}>
        <Phone size={18} color="#1E5126" /><div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700, color: '#111' }}>Soporte</div><div style={{ fontSize: 12, color: '#9CA3AF' }}>Chat y teléfono</div></div><ChevronRight size={18} color="#D1D5DB" />
      </button>
      <button onClick={onLogout} style={{ ...ui.dangerBtn, width: '100%', padding: '14px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14 }}><Mail size={16} /> Cerrar sesión</button>
    </div>
  );

  const sections: AccountSection[] = [
    { key: 'perfil', icon: User, label: 'Mi perfil', sub: 'Datos personales y emergencia', render: renderPerfil },
    { key: 'empresa', icon: Building2, label: 'Mi empresa', sub: 'A qué empresa pertenecés', render: renderEmpresa },
    { key: 'documentos', icon: FileText, label: 'Documentos personales', sub: 'Licencia y cédula', render: renderDocumentos },
    { key: 'aprobaciones', icon: Clock, label: 'Solicitudes en revisión', sub: 'Cambios pendientes', badge: approvals.length, render: () => <ApprovalsSection approvals={approvals} intro="Los cambios de documento y la baja de la empresa los confirma tu empresa. Acá ves su estado." /> },
    { key: 'seguridad', icon: Lock, label: 'Cuenta y seguridad', sub: 'Contraseña y sesión', render: renderSeguridad },
  ];

  return <AccountShell title="Mi cuenta" subtitle="Chofer · gestioná tu perfil y documentos." summary={summary} sections={sections} onBack={onBack} onLogout={onLogout} />;
}
