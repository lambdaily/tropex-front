import { useState } from "react";
import { Mail, Lock, Phone, ChevronRight, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authApi } from "@/features/auth/api/authApi";
import { ui } from "@/app/components/AccountShell";

interface AccountSecuritySectionProps {
  profile: any;
  onLogout: () => void;
}

export function AccountSecuritySection({ profile, onLogout }: AccountSecuritySectionProps) {
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Email actual */}
      <div style={ui.card}>
        <div style={ui.lbl}>Email de acceso</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
          <Mail size={15} color="#1E5126" />
          <span style={ui.val}>{profile.email}</span>
        </div>
      </div>

      {/* Cambiar email */}
      <button
        onClick={() => setShowChangeEmail(true)}
        style={{
          ...ui.card,
          display: "flex",
          alignItems: "center",
          gap: 12,
          cursor: "pointer",
          textAlign: "left",
          width: "100%",
          border: "none",
        }}
      >
        <Mail size={18} color="#1E5126" />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>Cambiar email</div>
          <div style={{ fontSize: 12, color: "#9CA3AF" }}>Actualizá tu email de acceso</div>
        </div>
        <ChevronRight size={18} color="#D1D5DB" />
      </button>

      {/* Cambiar contraseña */}
      <button
        onClick={() => setShowChangePassword(true)}
        style={{
          ...ui.card,
          display: "flex",
          alignItems: "center",
          gap: 12,
          cursor: "pointer",
          textAlign: "left",
          width: "100%",
          border: "none",
        }}
      >
        <Lock size={18} color="#1E5126" />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>Cambiar contraseña</div>
          <div style={{ fontSize: 12, color: "#9CA3AF" }}>Te enviamos un enlace por email</div>
        </div>
        <ChevronRight size={18} color="#D1D5DB" />
      </button>

      {/* Soporte */}
      <button
        onClick={() => window.open("https://wa.me/595210000000", "_blank")}
        style={{
          ...ui.card,
          display: "flex",
          alignItems: "center",
          gap: 12,
          cursor: "pointer",
          textAlign: "left",
          width: "100%",
          border: "none",
        }}
      >
        <Phone size={18} color="#1E5126" />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>Soporte</div>
          <div style={{ fontSize: 12, color: "#9CA3AF" }}>Chat y teléfono</div>
        </div>
        <ChevronRight size={18} color="#D1D5DB" />
      </button>

      {/* Cerrar sesión */}
      <button
        onClick={onLogout}
        style={{
          ...ui.dangerBtn,
          width: "100%",
          padding: "14px 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          fontSize: 14,
        }}
      >
        <Lock size={16} /> Cerrar sesión
      </button>

      {/* Modales */}
      {showChangeEmail && <ChangeEmailModal onClose={() => setShowChangeEmail(false)} />}
      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}
    </div>
  );
}

/* ─── Modales ── */

function ChangeEmailModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<"input" | "code">("input");
  const [newEmail, setNewEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!newEmail) {
      toast.error("Ingresá un email válido");
      return;
    }
    setLoading(true);
    try {
      await authApi.changeEmailRequest(newEmail);
      toast.success(`Código enviado a ${newEmail}`);
      setStep("code");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al enviar código";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!code || code.length !== 6) {
      toast.error("Ingresá el código de 6 dígitos");
      return;
    }
    setLoading(true);
    try {
      await authApi.changeEmailConfirm(code);
      toast.success("Email actualizado correctamente");
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al confirmar";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper onClose={onClose} title="Cambiar email">
      {step === "input" ? (
        <>
          <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 16 }}>
            Ingresá el nuevo email. Te enviaremos un código de verificación.
          </p>
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="nuevo@email.com"
            style={{ ...ui.input, marginBottom: 16 }}
          />
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{ ...ui.ghostBtn, flex: 1 }}>Cancelar</button>
            <button
              onClick={handleSendCode}
              disabled={loading}
              style={{ ...ui.primaryBtn, flex: 1, opacity: loading ? 0.5 : 1 }}
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : "Enviar código"}
            </button>
          </div>
        </>
      ) : (
        <>
          <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 16 }}>
            Ingresá el código de 6 dígitos que enviamos a <strong>{newEmail}</strong>
          </p>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            style={{ ...ui.input, marginBottom: 16, textAlign: "center", fontSize: 24, letterSpacing: 8, fontFamily: "monospace" }}
          />
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setStep("input")} style={{ ...ui.ghostBtn, flex: 1 }}>Volver</button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              style={{ ...ui.primaryBtn, flex: 1, opacity: loading ? 0.5 : 1 }}
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : "Confirmar"}
            </button>
          </div>
        </>
      )}
    </ModalWrapper>
  );
}

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleSendLink = async () => {
    setLoading(true);
    try {
      await authApi.changePasswordRequest();
      toast.success("Te enviamos un enlace por email para cambiar la contraseña");
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al enviar enlace";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper onClose={onClose} title="Cambiar contraseña">
      <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 16 }}>
        Te enviaremos un enlace por email para cambiar tu contraseña. El enlace expira en 15 minutos.
      </p>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onClose} style={{ ...ui.ghostBtn, flex: 1 }}>Cancelar</button>
        <button
          onClick={handleSendLink}
          disabled={loading}
          style={{ ...ui.primaryBtn, flex: 1, opacity: loading ? 0.5 : 1 }}
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : "Enviar enlace"}
        </button>
      </div>
    </ModalWrapper>
  );
}

/* ─── Modal Wrapper ─── */

function ModalWrapper({ onClose, title, children }: { onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 24,
          width: "100%",
          maxWidth: 400,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#111" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <X size={20} color="#6B7280" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
