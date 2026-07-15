import { useState } from "react";
import type { GanaderoAccountInitialData } from "@/features/account";
import { ProfileEstablishmentSection } from "./ProfileEstablishmentSection";
import { AccountSecuritySection } from "./AccountSecuritySection";
import { useMyProfile } from "@/features/my-profile";
import { MyEstablishmentSection } from "@/features/my-establishment";
import { useMyEstablishment } from "@/features/my-establishment";
import { MyDocumentsSection } from "@/features/my-documents";
import { MyChangeRequestsSection } from "@/features/my-change-requests";
import {
  Beef,
  MapPin,
  FileText,
  CreditCard,
  Clock,
  Lock,
  ShieldCheck,
  Check,
  AlertTriangle,
  Mail,
  Phone,
  ChevronRight,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import {
  AccountShell,
  ApprovalsSection,
  ui,
  fieldRow,
  type Approval,
  type AccountSection,
} from "@/app/components/AccountShell";

interface GanaderoAccountProps {
  userName: string;
  onLogout: () => void;
  onBack: () => void;
  subTypeLabel?: string;
  initialData?: GanaderoAccountInitialData;
}

export function GanaderoAccount({
  userName,
  onLogout,
  onBack,
  subTypeLabel = "Ganadero",
  initialData,
}: GanaderoAccountProps) {
  const { data: profileData } = useMyProfile();
  const { data: establishments = [] } = useMyEstablishment();
  const establishment = establishments[0];
  const userRuc = profileData?.ruc || profileData?.legal_name?.match(/\d+/)?.join('') || null;

  const [approvals, setApprovals] = useState<Approval[]>([]);
  const addApproval = (titulo: string, detalle: string) => {
    setApprovals((a) => [
      { id: "REV-" + (a.length + 201), titulo, detalle },
      ...a,
    ]);
    toast.success("Cambio enviado a revisión del equipo Tropero.");
  };

  const profileInitial = initialData?.profile ?? {
    nombre: userName,
    telefono: "No informado",
    email: "No informado",
  };

  const paymentInitial = initialData?.payment.summary ?? "No configurado";

  const [profile, setProfile] = useState(profileInitial);
  const [pDraft, setPDraft] = useState(profileInitial);
  const [editP, setEditP] = useState(false);

  const [pago, setPago] = useState(paymentInitial);
  const [pagoDraft, setPagoDraft] = useState(paymentInitial);
  const [editPago, setEditPago] = useState(false);

  const documents = [
    {
      key: "ruc",
      label: "Constancia de RUC",
      estado: "verificado" as const,
      nota: "Verificado por Tropero",
    },
    {
      key: "senacsa",
      label: "Registro SENACSA del establecimiento",
      estado: "verificado" as const,
      nota: "Habilita el sello Verificado",
    },
    {
      key: "mapa",
      label: "Mapa de acceso al establecimiento",
      estado: "verificado" as const,
      nota: "Ayuda a los transportistas a llegar",
    },
  ];

  const summary = (
    <div style={{ ...ui.card, display: "flex", alignItems: "center", gap: 13 }}>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 13,
          background: "#1E5126",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Beef size={22} color="#fff" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 800, color: "#111" }}>
            {establishment?.name || "Sin establecimiento"}
          </span>
          {userRuc && (
            <span style={ui.verifiedChip}>
              <ShieldCheck size={11} /> Verificado
            </span>
          )}
        </div>
        <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
          {subTypeLabel}
          {userRuc && ` · RUC ${userRuc}`}
          {establishment?.district && ` · ${establishment.district}`}
          {!establishment && !userRuc && " · No informado"}
        </div>
      </div>
    </div>
  );

  const renderPerfilEstab = () => <ProfileEstablishmentSection />;


  const renderDocumentos = () => <MyDocumentsSection />;

  const renderPago = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={ui.card}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ ...ui.sectionTitle, fontSize: 14 }}>Método de pago</div>
          {!editPago && (
            <button
              onClick={() => {
                setPagoDraft(pago);
                setEditPago(true);
              }}
              style={{ ...ui.ghostBtn, padding: "7px 11px" }}
            >
              Cambiar
            </button>
          )}
        </div>
        {!editPago ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginTop: 10,
            }}
          >
            <CreditCard size={18} color="#1E5126" />
            <span style={ui.val}>{pago}</span>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginTop: 10,
            }}
          >
            <input
              style={ui.input}
              value={pagoDraft}
              onChange={(e) => setPagoDraft(e.target.value)}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setEditPago(false)}
                style={{ ...ui.ghostBtn, flex: 1 }}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setPago(pagoDraft);
                  setEditPago(false);
                  toast.success("Método de pago actualizado.");
                }}
                style={{ ...ui.primaryBtn, flex: 1 }}
              >
                Guardar
              </button>
            </div>
          </div>
        )}
        <div
          style={{
            fontSize: 11,
            color: "#6B7280",
            marginTop: 10,
            paddingTop: 10,
            borderTop: "1px solid #F3F0E8",
            lineHeight: 1.5,
          }}
        >
          Como productor{" "}
          <strong style={{ color: "#111" }}>no pagás comisión</strong> por usar
          Tropero. Este método se usa solo si cancelás un viaje ya aceptado
          (puede aplicar una multa del 2%).
        </div>
      </div>
    </div>
  );

  const renderSeguridad = () => (
    <AccountSecuritySection profile={profile} onLogout={onLogout} />
  );

  const sections: AccountSection[] = [
    {
      key: "perfil",
      icon: Beef,
      label: "Perfil y Establecimiento",
      sub: "Contacto del productor",
      render: renderPerfilEstab,
    },
    {
      key: "documentos",
      icon: FileText,
      label: "Documentos y verificación",
      sub: "RUC, SENACSA y mapa de acceso",
      render: renderDocumentos,
    },
    {
      key: "pago",
      icon: CreditCard,
      label: "Método de pago",
      sub: "Sin comisión · solo cancelaciones",
      render: renderPago,
    },
    {
      key: "aprobaciones",
      icon: Clock,
      label: "Solicitudes en revisión",
      sub: "Cambios pendientes de aprobación",
      badge: approvals.length,
      render: () => (
        <MyChangeRequestsSection
          intro="Los datos legales (nombre, RUC, razón social) y documentos los revisa el equipo de Tropero antes de aplicarse. Acá ves su estado."
        />
      ),
    },
    {
      key: "seguridad",
      icon: Lock,
      label: "Cuenta y seguridad",
      sub: "Email, contraseña y sesión",
      render: renderSeguridad,
    },
  ];

  return (
    <AccountShell
      title="Mi cuenta"
      subtitle={`${subTypeLabel} · gestioná tu establecimiento, documentos y pagos.`}
      summary={summary}
      sections={sections}
      onBack={onBack}
      onLogout={onLogout}
    />
  );
}
