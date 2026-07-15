import { useMemo, useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Phone,
  Mail,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import {
  useAdminStore,
  checkRucMatch,
  type AdminUser,
  type GanaderoDocumentType,
} from "@/features/admin/store/adminStore";
import {
  C,
  DISPLAY,
  timeAgo,
  SectionHeader,
  DataTable,
  StatusBadge,
  DetailSheet,
  Field,
  Btn,
  EmptyState,
  roleMeta,
  type Column,
} from "../kit";

const LEGACY_DOC_LABELS: Record<string, string> = {
  ruc: "RUC",
  senacsa: "Registro SENACSA",
  establishment: "Habilitación establecimiento",
  "access-map": "Mapa de acceso",
  cedula: "Cédula de identidad",
  transport: "Licencia de transporte",
  insurance: "Seguro",
  license: "Licencia de conducir",
};

interface VerificationDocEntry {
  code: string;
  ok: boolean;
  required: boolean;
}

function resolveGanaderoDocs(
  user: AdminUser,
  ganaderoDocTypes: GanaderoDocumentType[],
): VerificationDocEntry[] {
  const activeTypes = ganaderoDocTypes
    .filter((d) => d.active)
    .sort((a, b) => a.order - b.order);

  if (activeTypes.length === 0) {
    return Object.entries(user.documents).map(([code, ok]) => ({
      code,
      ok: Boolean(ok),
      required: false,
    }));
  }

  return activeTypes.map((doc) => ({
    code: doc.code,
    ok: Boolean(user.documents[doc.code]),
    required: doc.required,
  }));
}

export function VerificationsSection() {
  const { users, approveUser, rejectUser, ganaderoDocumentTypes } =
    useAdminStore();

  const pending = users.filter(
    (u) => u.status === "pending" && u.role === "ganadero",
  );

  const [sel, setSel] = useState<AdminUser | null>(null);

  const docLabelByCode = useMemo(() => {
    const map = { ...LEGACY_DOC_LABELS };
    ganaderoDocumentTypes.forEach((doc) => {
      map[doc.code] = doc.label;
    });
    return map;
  }, [ganaderoDocumentTypes]);

  const handleApprove = (u: AdminUser) => {
    approveUser(u.id);
    toast.success(`${u.name} fue aprobado y activado.`);
    setSel(null);
  };

  const handleReject = (u: AdminUser) => {
    rejectUser(u.id);
    toast.error(`${u.name} fue rechazado.`);
    setSel(null);
  };

  const columns: Column<AdminUser>[] = [
    {
      key: "name",
      header: "Solicitante",
      value: (u) => u.name,
      render: (u) => (
        <div>
          <div style={{ fontWeight: 600 }}>{u.name}</div>
          <div style={{ fontSize: 12, color: C.gris }}>{u.legalName}</div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Tipo",
      value: (u) => roleMeta[u.role].label,
      hideMobile: true,
      render: (u) => (
        <StatusBadge
          label={roleMeta[u.role].label}
          color={roleMeta[u.role].color}
        />
      ),
    },
    {
      key: "department",
      header: "Departamento",
      value: (u) => u.department,
      hideMobile: true,
    },
    {
      key: "docs",
      header: "Documentos",
      hideMobile: true,
      render: (u) => {
        const docs = resolveGanaderoDocs(u, ganaderoDocumentTypes);
        const total = docs.length;
        const ok = docs.filter((d) => d.ok).length;

        return (
          <span
            style={{
              fontSize: 12.5,
              fontWeight: 700,
              color: ok === total ? C.verdeClaro : C.naranja,
            }}
          >
            {ok}/{total} OK
          </span>
        );
      },
    },
    {
      key: "registeredAt",
      header: "Solicitado",
      value: (u) => u.registeredAt,
      render: (u) => (
        <span style={{ color: C.gris }}>{timeAgo(u.registeredAt)}</span>
      ),
    },
    {
      key: "go",
      header: "",
      align: "right",
      render: () => (
        <Btn size="sm" variant="soft">
          Revisar
        </Btn>
      ),
    },
  ];

  return (
    <div>
      <SectionHeader
        title="Verificaciones · Ganadero"
        subtitle={`${pending.length} cuenta${pending.length !== 1 ? "s" : ""} ganadera${pending.length !== 1 ? "s" : ""} esperando aprobación`}
      />

      {pending.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="Sin verificaciones ganaderas pendientes"
          description="Cuando un ganadero complete su registro, aparecerá aquí para revisión."
        />
      ) : (
        <DataTable
          columns={columns}
          rows={pending}
          getRowId={(u) => u.id}
          onRowClick={setSel}
          searchKeys={["name", "legalName", "ruc"]}
          searchPlaceholder="Buscar solicitante, razón social o RUC…"
        />
      )}

      {sel && (
        <DetailSheet
          open={!!sel}
          onClose={() => setSel(null)}
          title={sel.name}
          subtitle={sel.legalName}
          statusNode={
            <StatusBadge
              label={roleMeta[sel.role].label}
              color={roleMeta[sel.role].color}
            />
          }
          footer={
            <>
              <Btn
                variant="danger"
                icon={XCircle}
                onClick={() => handleReject(sel)}
              >
                Rechazar
              </Btn>
              <Btn
                variant="primary"
                icon={CheckCircle2}
                onClick={() => handleApprove(sel)}
              >
                Aprobar
              </Btn>
            </>
          }
        >
          <VerificationDetail
            user={sel}
            ganaderoDocTypes={ganaderoDocumentTypes}
            docLabelByCode={docLabelByCode}
          />
        </DetailSheet>
      )}
    </div>
  );
}

function VerificationDetail({
  user,
  ganaderoDocTypes,
  docLabelByCode,
}: {
  user: AdminUser;
  ganaderoDocTypes: GanaderoDocumentType[];
  docLabelByCode: Record<string, string>;
}) {
  const rucOk = !user.ruc || checkRucMatch(user.name, user.legalName);
  const docs = resolveGanaderoDocs(user, ganaderoDocTypes);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {user.ruc && !rucOk && (
        <div
          style={{
            display: "flex",
            gap: 11,
            background: "#FEF3E2",
            border: `1px solid ${C.naranja}`,
            borderRadius: 12,
            padding: "12px 14px",
          }}
        >
          <AlertTriangle
            size={18}
            color={C.naranja}
            style={{ flexShrink: 0, marginTop: 1 }}
          />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#92611A" }}>
              Verificar RUC manualmente
            </div>
            <div style={{ fontSize: 12.5, color: "#92611A", marginTop: 2 }}>
              El nombre de contacto y la razón social no coinciden. Confirmá la
              titularidad antes de aprobar.
            </div>
          </div>
        </div>
      )}

      {user.ruc && rucOk && (
        <div
          style={{
            display: "flex",
            gap: 11,
            background: "#EAF6EC",
            border: `1px solid ${C.verde}33`,
            borderRadius: 12,
            padding: "12px 14px",
          }}
        >
          <CheckCircle2
            size={18}
            color={C.verde}
            style={{ flexShrink: 0, marginTop: 1 }}
          />
          <div style={{ fontSize: 12.5, color: C.verde, fontWeight: 600 }}>
            RUC y razón social coinciden.
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="RUC" value={user.ruc || "—"} />
        <Field label="Departamento" value={user.department} />
        <Field label="Solicitado" value={timeAgo(user.registeredAt)} />
        {user.establishmentName && (
          <Field label="Establecimiento" value={user.establishmentName} />
        )}
        {user.headCount != null && (
          <Field
            label="Cabezas"
            value={user.headCount.toLocaleString("es-PY")}
          />
        )}
      </div>

      <Field label="Dirección" value={user.address} />

      <div style={{ display: "flex", gap: 10 }}>
        <a
          href={`tel:${user.phone}`}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            padding: "10px 0",
            borderRadius: 10,
            border: `1.5px solid ${C.verde}`,
            color: C.verde,
            fontWeight: 700,
            fontSize: 13,
            textDecoration: "none",
          }}
        >
          <Phone size={15} /> Llamar
        </a>
        <a
          href={`mailto:${user.email}`}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            padding: "10px 0",
            borderRadius: 10,
            border: `1.5px solid ${C.borde}`,
            color: C.texto,
            fontWeight: 700,
            fontSize: 13,
            textDecoration: "none",
          }}
        >
          <Mail size={15} /> Email
        </a>
      </div>

      <div>
        <div
          style={{
            fontFamily: DISPLAY,
            fontWeight: 600,
            fontSize: 14,
            color: C.texto,
            marginBottom: 10,
          }}
        >
          Documentación
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {docs.map(({ code, ok, required }) => (
            <div
              key={code}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "#fff",
                border: `1px solid ${C.borde}`,
                borderRadius: 10,
                padding: "10px 12px",
              }}
            >
              <FileText size={16} color={ok ? C.verde : C.grisClaro} />
              <span style={{ flex: 1, fontSize: 13.5, color: C.texto }}>
                {docLabelByCode[code] || code}
                {required && (
                  <span
                    style={{ marginLeft: 6, color: "#92400e", fontSize: 11.5 }}
                  >
                    · obligatorio
                  </span>
                )}
              </span>
              {ok ? (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 12,
                    fontWeight: 700,
                    color: C.verde,
                  }}
                >
                  <CheckCircle2 size={14} /> Cargado
                </span>
              ) : (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 12,
                    fontWeight: 700,
                    color: C.rojo,
                  }}
                >
                  <XCircle size={14} /> Falta
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
