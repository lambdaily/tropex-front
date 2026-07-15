import { useState } from "react";
import {
  Percent,
  DollarSign,
  ShieldCheck,
  Bell,
  Save,
  Settings as SettingsIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  useAdminStore,
  type AdminConfig,
} from "@/features/admin/store/adminStore";
import { C, DISPLAY, BODY, SectionHeader, Card, Btn } from "../kit";

export function SettingsSection() {
  const { config, setAdminConfig } = useAdminStore();
  const [draft, setDraft] = useState<AdminConfig>(config);
  const dirty = JSON.stringify(draft) !== JSON.stringify(config);

  const num = (k: keyof AdminConfig, v: string) =>
    setDraft((d) => ({ ...d, [k]: Number(v) || 0 }));
  const tog = (k: keyof AdminConfig) => setDraft((d) => ({ ...d, [k]: !d[k] }));
  const save = () => {
    setAdminConfig(draft);
    toast.success("Configuración guardada.");
  };

  return (
    <div>
      <SectionHeader
        title="Configuración"
        subtitle="Reglas de negocio de la plataforma"
        actions={
          <Btn variant="primary" icon={Save} disabled={!dirty} onClick={save}>
            Guardar cambios
          </Btn>
        }
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 16,
        }}
      >
        {/* Comercial */}
        <Card style={{ padding: "20px" }}>
          <CardHead
            icon={Percent}
            title="Comercial"
            desc="Comisión y tarifas de referencia"
          />
          <NumberField
            label="Comisión sobre GMV"
            suffix="%"
            value={draft.commissionRate}
            onChange={(v) => num("commissionRate", v)}
          />
          <NumberField
            label="Precio por km / cabeza"
            suffix="₲"
            value={draft.pricePerKmPerHead}
            onChange={(v) => num("pricePerKmPerHead", v)}
          />
        </Card>

        {/* Regulatorio */}
        <Card style={{ padding: "20px" }}>
          <CardHead
            icon={ShieldCheck}
            title="Regulatorio (SENACSA)"
            desc="Límites por guía de traslado"
          />
          <NumberField
            label="Límite cabezas — Gordos"
            value={draft.senacsaFat}
            onChange={(v) => num("senacsaFat", v)}
          />
          <NumberField
            label="Límite cabezas — Desmamantes"
            value={draft.senacsaWeaned}
            onChange={(v) => num("senacsaWeaned", v)}
          />
          <NumberField
            label="Rondas máx. de negociación"
            value={draft.maxRounds}
            onChange={(v) => num("maxRounds", v)}
          />
        </Card>

        {/* Operación */}
        <Card style={{ padding: "20px" }}>
          <CardHead
            icon={Bell}
            title="Operación y avisos"
            desc="Automatizaciones y notificaciones"
          />
          <ToggleField
            label="Auto-aprobar cuentas con docs completos"
            desc="Activa cuentas verificadas sin revisión manual"
            on={draft.autoApproveVerified}
            onToggle={() => tog("autoApproveVerified")}
          />
          <ToggleField
            label="Avisar incidencias de alta prioridad"
            on={draft.notifyIncidents}
            onToggle={() => tog("notifyIncidents")}
          />
          <ToggleField
            label="Avisar payouts pendientes"
            on={draft.notifyPayouts}
            onToggle={() => tog("notifyPayouts")}
          />
        </Card>

        {/* Equipo */}
        <Card style={{ padding: "20px" }}>
          <CardHead
            icon={SettingsIcon}
            title="Equipo"
            desc="Acceso a la consola interna"
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              {
                n: "Equipo TROPEX",
                r: "Administrador",
                email: "admin@tropex.com.py",
              },
            ].map((m) => (
              <div
                key={m.email}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                  background: "#fff",
                  border: `1px solid ${C.borde}`,
                  borderRadius: 11,
                  padding: "11px 12px",
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: C.verde,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: DISPLAY,
                    fontWeight: 700,
                    fontSize: 12,
                    color: "#fff",
                  }}
                >
                  TX
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{ fontSize: 13.5, fontWeight: 600, color: C.texto }}
                  >
                    {m.n}
                  </div>
                  <div style={{ fontSize: 11.5, color: C.gris }}>{m.email}</div>
                </div>
                <span
                  style={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: C.verde,
                    background: `${C.verde}12`,
                    padding: "4px 10px",
                    borderRadius: 99,
                  }}
                >
                  {m.r}
                </span>
              </div>
            ))}
            <Btn variant="soft" style={{ alignSelf: "flex-start" }}>
              + Invitar miembro
            </Btn>
          </div>
        </Card>
      </div>
    </div>
  );
}

function CardHead({
  icon: Icon,
  title,
  desc,
}: {
  icon: typeof Percent;
  title: string;
  desc: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 11,
        marginBottom: 18,
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 11,
          background: `${C.verde}14`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={19} color={C.verde} />
      </div>
      <div>
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 600,
            fontSize: 15,
            color: C.texto,
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 12, color: C.gris }}>{desc}</div>
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: string) => void;
  suffix?: string;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label
        style={{
          fontSize: 12.5,
          color: C.gris,
          fontWeight: 600,
          display: "block",
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          border: `1px solid ${C.borde}`,
          borderRadius: 10,
          overflow: "hidden",
          background: "#fff",
        }}
      >
        {suffix && (
          <span
            style={{
              padding: "0 12px",
              color: C.grisClaro,
              fontSize: 14,
              fontWeight: 600,
              borderRight: `1px solid ${C.borde}`,
              alignSelf: "stretch",
              display: "flex",
              alignItems: "center",
            }}
          >
            {suffix}
          </span>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            padding: "10px 12px",
            fontSize: 14,
            fontFamily: BODY,
            color: C.texto,
            width: "100%",
            boxSizing: "border-box",
            background: "transparent",
          }}
        />
      </div>
    </div>
  );
}

function ToggleField({
  label,
  desc,
  on,
  onToggle,
}: {
  label: string;
  desc?: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        width: "100%",
        textAlign: "left",
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "8px 0",
      }}
    >
      <div
        style={{
          width: 40,
          height: 23,
          borderRadius: 99,
          background: on ? C.verde : "#D1D5DB",
          position: "relative",
          flexShrink: 0,
          transition: "background .2s",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 2,
            left: on ? 19 : 2,
            width: 19,
            height: 19,
            borderRadius: "50%",
            background: "#fff",
            transition: "left .2s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          }}
        />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: C.texto }}>
          {label}
        </div>
        {desc && (
          <div style={{ fontSize: 11.5, color: C.gris, marginTop: 1 }}>
            {desc}
          </div>
        )}
      </div>
    </button>
  );
}
