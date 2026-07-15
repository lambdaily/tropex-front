import { useMemo, useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { myChangeRequestsApi } from "@/features/my-change-requests/api/myChangeRequestsApi";
import type { ChangeRequest, ChangeRequestStatus } from "@/features/my-change-requests/types/change-request.types";
import { CHANGE_REQUEST_TYPE_LABELS } from "@/features/my-change-requests/types/change-request.types";
import {
  C,
  SectionHeader,
  Card,
  Btn,
  EmptyState,
  StatusBadge,
} from "../kit";

const STATUS_META: Record<ChangeRequestStatus, { color: string; bg: string; label: string }> = {
  pending: { color: C.naranja, bg: "#FEF3E2", label: "En revisión" },
  approved: { color: C.verde, bg: "#EAF6EC", label: "Aprobado" },
  rejected: { color: C.rojo, bg: "#FEE2E2", label: "Rechazado" },
};

const FIELD_LABELS: Record<string, string> = {
  ruc: "RUC",
  owner_name: "Razón social",
  department: "Departamento",
  district: "Ciudad / Distrito",
  name: "Nombre",
  frequency: "Frecuencia",
  code_sigor: "Código SENACSA",
  first_name: "Nombre",
  last_name: "Apellido",
  phone: "Teléfono",
  legal_name: "Razón social",
};

function extractChanges(payload: Record<string, unknown>): Array<{ field: string; label: string; old: string; new: string }> {
  const changes: Array<{ field: string; label: string; old: string; new: string }> = [];
  const seen = new Set<string>();

  for (const key of Object.keys(payload)) {
    if (key.endsWith("_new")) {
      const field = key.replace(/_new$/, "");
      if (seen.has(field)) continue;
      seen.add(field);

      const oldVal = payload[`${field}_old`];
      const newVal = payload[key];

      if (newVal !== undefined) {
        changes.push({
          field,
          label: FIELD_LABELS[field] || field,
          old: oldVal != null ? String(oldVal) : "",
          new: String(newVal),
        });
      }
    }
  }

  return changes;
}

export function ChangeRequestsSection() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<ChangeRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["admin-change-requests"],
    queryFn: () => myChangeRequestsApi.listAll(),
  });

  const pending = requests.filter((r) => r.status === "pending");

  const approveMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log("[ChangeRequests] Aprobando solicitud:", id);
      try {
        const result = await myChangeRequestsApi.update(id, { status: "approved" });
        console.log("[ChangeRequests] Respuesta de aprobación:", result);
        return result;
      } catch (error) {
        console.error("[ChangeRequests] Error al aprobar:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-change-requests"] });
      toast.success("Solicitud aprobada. Los cambios fueron aplicados.");
      setSelected(null);
    },
    onError: (error) => {
      console.error("[ChangeRequests] Error en mutation:", error);
      toast.error("Error al aprobar la solicitud.");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) =>
      myChangeRequestsApi.update(id, { status: "rejected", rejection_reason: rejectionReason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-change-requests"] });
      toast.error("Solicitud rechazada.");
      setSelected(null);
      setShowRejectModal(false);
      setRejectionReason("");
    },
    onError: () => {
      toast.error("Error al rechazar la solicitud.");
    },
  });

  const handleApprove = () => {
    if (selected) {
      approveMutation.mutate(selected.id);
    }
  };

  const handleReject = () => {
    if (selected) {
      rejectMutation.mutate(selected.id);
    }
  };

  const typeMeta = useMemo(() => CHANGE_REQUEST_TYPE_LABELS, []);

  if (isLoading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <Clock size={32} color={C.gris} style={{ margin: "0 auto 12px", display: "block" }} />
        <div style={{ color: C.gris }}>Cargando solicitudes...</div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader
        title="Solicitudes de cambio"
        subtitle={`${pending.length} solicitud${pending.length !== 1 ? "es" : ""} pendiente${pending.length !== 1 ? "s" : ""} de revisión`}
      />

      {pending.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="Sin solicitudes pendientes"
          description="Cuando un usuario solicite un cambio, aparecerá aquí para revisión."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {pending.map((request) => (
            <ChangeRequestCard
              key={request.id}
              request={request}
              typeMeta={typeMeta}
              onClick={() => setSelected(request)}
            />
          ))}
        </div>
      )}

      {selected && (
        <ChangeRequestDetail
          request={selected}
          typeMeta={typeMeta}
          onClose={() => {
            setSelected(null);
            setShowRejectModal(false);
            setRejectionReason("");
          }}
          onApprove={handleApprove}
          onReject={() => setShowRejectModal(true)}
          isApproving={approveMutation.isPending}
          isRejecting={rejectMutation.isPending}
        />
      )}

      {showRejectModal && (
        <RejectModal
          reason={rejectionReason}
          onReasonChange={setRejectionReason}
          onConfirm={handleReject}
          onCancel={() => {
            setShowRejectModal(false);
            setRejectionReason("");
          }}
          isRejecting={rejectMutation.isPending}
        />
      )}
    </div>
  );
}

function ChangeRequestCard({
  request,
  typeMeta,
  onClick,
}: {
  request: ChangeRequest;
  typeMeta: typeof CHANGE_REQUEST_TYPE_LABELS;
  onClick: () => void;
}) {
  const meta = typeMeta[request.change_type];
  const statusMeta = STATUS_META[request.status];
  const changes = extractChanges(request.payload);

  return (
    <Card onClick={onClick} style={{ cursor: "pointer", padding: 16 }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: "#FEF3E2",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Clock size={18} color={C.naranja} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: C.texto }}>
              {meta.title}
            </span>
            <StatusBadge label={statusMeta.label} color={statusMeta.color} />
          </div>
          <div style={{ fontSize: 12, color: C.gris, marginBottom: 8 }}>
            {request.user_name} · {request.user_email}
          </div>
          {changes.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {changes.slice(0, 2).map((change) => (
                <div key={change.field} style={{ fontSize: 12, color: C.texto }}>
                  <span style={{ fontWeight: 600 }}>{change.label}:</span>{" "}
                  <span style={{ color: C.gris, textDecoration: "line-through" }}>
                    {change.old || "(vacío)"}
                  </span>
                  <ArrowRight size={10} style={{ margin: "0 4px", verticalAlign: "middle" }} />
                  <span style={{ fontWeight: 600 }}>{change.new}</span>
                </div>
              ))}
              {changes.length > 2 && (
                <div style={{ fontSize: 11, color: C.gris }}>
                  +{changes.length - 2} cambio{changes.length - 2 !== 1 ? "s" : ""} más
                </div>
              )}
            </div>
          )}
          <div style={{ fontSize: 10, color: C.grisClaro, fontFamily: "monospace", marginTop: 8 }}>
            REV-{String(request.id).padStart(4, "0")} ·{" "}
            {new Date(request.created_at).toLocaleString("es-PY", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}

function ChangeRequestDetail({
  request,
  typeMeta,
  onClose,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}: {
  request: ChangeRequest;
  typeMeta: typeof CHANGE_REQUEST_TYPE_LABELS;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  isApproving: boolean;
  isRejecting: boolean;
}) {
  const meta = typeMeta[request.change_type];
  const changes = extractChanges(request.payload);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "flex-end",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: "#fff",
          height: "100%",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: `1px solid ${C.borde}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.texto }}>
              {meta.title}
            </div>
            <div style={{ fontSize: 12, color: C.gris, marginTop: 2 }}>
              REV-{String(request.id).padStart(4, "0")}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 8,
              color: C.gris,
            }}
          >
            <XCircle size={24} />
          </button>
        </div>

        <div style={{ padding: 24, flex: 1 }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.gris, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Solicitante
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.texto }}>
              {request.user_name}
            </div>
            <div style={{ fontSize: 13, color: C.gris }}>{request.user_email}</div>
            <div style={{ fontSize: 11, color: C.grisClaro, marginTop: 4 }}>
              {new Date(request.created_at).toLocaleString("es-PY", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.gris, marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Cambios solicitados
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {changes.map((change) => (
                <div
                  key={change.field}
                  style={{
                    padding: 14,
                    background: "#FAFAFA",
                    borderRadius: 10,
                    border: `1px solid ${C.borde}`,
                  }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.gris, marginBottom: 6 }}>
                    {change.label}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span
                      style={{
                        fontSize: 13,
                        color: C.rojo,
                        textDecoration: "line-through",
                        padding: "4px 8px",
                        background: "#FEE2E2",
                        borderRadius: 6,
                      }}
                    >
                      {change.old || "(vacío)"}
                    </span>
                    <ArrowRight size={14} color={C.gris} />
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: C.verde,
                        padding: "4px 8px",
                        background: "#EAF6EC",
                        borderRadius: 6,
                      }}
                    >
                      {change.new}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            padding: "16px 24px",
            borderTop: `1px solid ${C.borde}`,
            display: "flex",
            gap: 12,
          }}
        >
          <Btn variant="danger" icon={XCircle} onClick={onReject} disabled={isRejecting || isApproving}>
            {isRejecting ? "Rechazando..." : "Rechazar"}
          </Btn>
          <Btn variant="primary" icon={CheckCircle2} onClick={onApprove} disabled={isApproving || isRejecting}>
            {isApproving ? "Aprobando..." : "Aprobar y aplicar"}
          </Btn>
        </div>
      </div>
    </div>
  );
}

function RejectModal({
  reason,
  onReasonChange,
  onConfirm,
  onCancel,
  isRejecting,
}: {
  reason: string;
  onReasonChange: (v: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isRejecting: boolean;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1100,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 24,
          width: "100%",
          maxWidth: 400,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: 16, fontWeight: 700, color: C.texto, marginBottom: 12 }}>
          Motivo del rechazo
        </div>
        <textarea
          value={reason}
          onChange={(e) => onReasonChange(e.target.value)}
          placeholder="Explica por qué rechazas esta solicitud..."
          style={{
            width: "100%",
            minHeight: 100,
            padding: 12,
            borderRadius: 10,
            border: `1px solid ${C.borde}`,
            fontSize: 14,
            resize: "vertical",
            fontFamily: "inherit",
          }}
        />
        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <Btn variant="ghost" onClick={onCancel} disabled={isRejecting}>
            Cancelar
          </Btn>
          <Btn variant="danger" onClick={onConfirm} disabled={isRejecting}>
            {isRejecting ? "Rechazando..." : "Confirmar rechazo"}
          </Btn>
        </div>
      </div>
    </div>
  );
}
