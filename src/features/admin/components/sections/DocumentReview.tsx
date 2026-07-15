import { useState } from "react";
import { FileText, CheckCircle2, XCircle, Clock, Eye } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/shared/api/apiClient";
import {
  C,
  SectionHeader,
  Card,
  Btn,
  EmptyState,
  StatusBadge,
} from "../kit";

interface Document {
  id: number;
  user: number;
  user_email: string;
  user_name: string;
  document_type: string;
  public_url: string;
  original_filename: string;
  status: "pending" | "approved" | "rejected";
  rejection_reason: string;
  created_at: string;
}

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  ruc: "Constancia de RUC",
  senacsa: "Registro SENACSA",
  mapa_acceso: "Mapa de acceso",
  cedula: "Cédula de identidad",
  licencia: "Licencia de conducir",
};

const STATUS_META: Record<string, { color: string; bg: string; label: string }> = {
  pending: { color: C.naranja, bg: "#FEF3E2", label: "En revisión" },
  approved: { color: C.verde, bg: "#EAF6EC", label: "Aprobado" },
  rejected: { color: C.rojo, bg: "#FEE2E2", label: "Rechazado" },
};

export function DocumentReviewSection() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["admin-documents", filter],
    queryFn: async () => {
      const params = filter !== "all" ? `?status=${filter}` : "";
      const response = await apiClient.get<{ results: Document[] }>(`/admin/documents/${params}`);
      return response.results;
    },
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) =>
      apiClient.patch(`/admin/documents/${id}/status/`, { status: "approved" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-documents"] });
      toast.success("Documento aprobado");
      setSelectedDoc(null);
    },
    onError: () => {
      toast.error("Error al aprobar el documento");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      apiClient.patch(`/admin/documents/${id}/status/`, {
        status: "rejected",
        rejection_reason: reason,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-documents"] });
      toast.success("Documento rechazado");
      setSelectedDoc(null);
      setShowRejectModal(false);
      setRejectionReason("");
    },
    onError: () => {
      toast.error("Error al rechazar el documento");
    },
  });

  const pendingCount = documents.filter((d) => d.status === "pending").length;
  const approvedCount = documents.filter((d) => d.status === "approved").length;
  const rejectedCount = documents.filter((d) => d.status === "rejected").length;

  if (isLoading) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <Clock size={32} color={C.gris} style={{ margin: "0 auto 12px", display: "block" }} />
        <div style={{ color: C.gris }}>Cargando documentos...</div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader
        title="Revisión de documentos"
        subtitle={`${pendingCount} documento${pendingCount !== 1 ? "s" : ""} pendiente${pendingCount !== 1 ? "s" : ""} de revisión`}
      />

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 20 }}>
        <Card style={{ padding: "14px 16px", cursor: filter === "pending" ? "default" : "pointer" }} onClick={() => setFilter("pending")}>
          <div style={{ fontSize: 12, color: C.gris }}>Pendientes</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: C.naranja, marginTop: 3 }}>{pendingCount}</div>
        </Card>
        <Card style={{ padding: "14px 16px", cursor: filter === "approved" ? "default" : "pointer" }} onClick={() => setFilter("approved")}>
          <div style={{ fontSize: 12, color: C.gris }}>Aprobados</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: C.verde, marginTop: 3 }}>{approvedCount}</div>
        </Card>
        <Card style={{ padding: "14px 16px", cursor: filter === "rejected" ? "default" : "pointer" }} onClick={() => setFilter("rejected")}>
          <div style={{ fontSize: 12, color: C.gris }}>Rechazados</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: C.rojo, marginTop: 3 }}>{rejectedCount}</div>
        </Card>
        <Card style={{ padding: "14px 16px", cursor: filter === "all" ? "default" : "pointer" }} onClick={() => setFilter("all")}>
          <div style={{ fontSize: 12, color: C.gris }}>Total</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: C.texto, marginTop: 3 }}>{documents.length}</div>
        </Card>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {(["pending", "approved", "rejected", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              background: filter === f ? C.verde : "#F3F4F6",
              color: filter === f ? "#fff" : C.texto,
              fontWeight: filter === f ? 700 : 500,
              fontSize: 13,
            }}
          >
            {f === "pending" ? "Pendientes" : f === "approved" ? "Aprobados" : f === "rejected" ? "Rechazados" : "Todos"}
          </button>
        ))}
      </div>

      {documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Sin documentos para revisar"
          description="Cuando un usuario suba un documento, aparecerá aquí para revisión."
        />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              onClick={() => setSelectedDoc(doc)}
            />
          ))}
        </div>
      )}

      {/* Document detail modal */}
      {selectedDoc && (
        <DocumentDetailModal
          document={selectedDoc}
          onClose={() => {
            setSelectedDoc(null);
            setShowRejectModal(false);
            setRejectionReason("");
          }}
          onApprove={() => approveMutation.mutate(selectedDoc.id)}
          onReject={() => setShowRejectModal(true)}
          isApproving={approveMutation.isPending}
          isRejecting={rejectMutation.isPending}
        />
      )}

      {/* Reject modal */}
      {showRejectModal && selectedDoc && (
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
          onClick={() => setShowRejectModal(false)}
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
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Explica por qué rechazas este documento..."
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
              <Btn variant="ghost" onClick={() => setShowRejectModal(false)} disabled={rejectMutation.isPending}>
                Cancelar
              </Btn>
              <Btn
                variant="danger"
                onClick={() => rejectMutation.mutate({ id: selectedDoc.id, reason: rejectionReason })}
                disabled={rejectMutation.isPending}
              >
                {rejectMutation.isPending ? "Rechazando..." : "Confirmar rechazo"}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DocumentCard({ document, onClick }: { document: Document; onClick: () => void }) {
  const statusMeta = STATUS_META[document.status];
  const typeLabel = DOCUMENT_TYPE_LABELS[document.document_type] || document.document_type;

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
          <FileText size={18} color={C.naranja} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: C.texto }}>{typeLabel}</span>
            <StatusBadge label={statusMeta.label} color={statusMeta.color} />
          </div>
          <div style={{ fontSize: 12, color: C.gris, marginBottom: 4 }}>{document.user_email}</div>
          <div style={{ fontSize: 11, color: C.grisClaro, fontFamily: "monospace" }}>
            {new Date(document.created_at).toLocaleString("es-PY", {
              day: "2-digit",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
        <Eye size={16} color={C.grisClaro} />
      </div>
    </Card>
  );
}

function DocumentDetailModal({
  document,
  onClose,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}: {
  document: Document;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  isApproving: boolean;
  isRejecting: boolean;
}) {
  const statusMeta = STATUS_META[document.status];
  const typeLabel = DOCUMENT_TYPE_LABELS[document.document_type] || document.document_type;
  const isImage = document.public_url.match(/\.(jpg|jpeg|png|gif|webp)$/i);

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
          maxWidth: 600,
          background: "#fff",
          height: "100%",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
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
            <div style={{ fontSize: 18, fontWeight: 700, color: C.texto }}>{typeLabel}</div>
            <div style={{ fontSize: 12, color: C.gris, marginTop: 2 }}>{document.original_filename}</div>
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

        {/* Content */}
        <div style={{ padding: 24, flex: 1 }}>
          {/* Status */}
          <div style={{ marginBottom: 20 }}>
            <StatusBadge label={statusMeta.label} color={statusMeta.color} />
          </div>

          {/* User info */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.gris, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Usuario
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.texto }}>{document.user_email}</div>
            <div style={{ fontSize: 11, color: C.grisClaro, marginTop: 4 }}>
              {new Date(document.created_at).toLocaleString("es-PY", {
                day: "2-digit",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>

          {/* Document preview */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.gris, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Documento
            </div>
            {isImage ? (
              <img
                src={document.public_url}
                alt={document.original_filename}
                style={{
                  width: "100%",
                  maxHeight: 400,
                  objectFit: "contain",
                  borderRadius: 10,
                  border: `1px solid ${C.borde}`,
                  background: "#F9FAFB",
                }}
              />
            ) : (
              <a
                href={document.public_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: 12,
                  background: "#F9FAFB",
                  borderRadius: 10,
                  border: `1px solid ${C.borde}`,
                  color: C.verde,
                  textDecoration: "none",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                <FileText size={16} />
                Ver documento
              </a>
            )}
          </div>

          {/* Rejection reason */}
          {document.rejection_reason && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.gris, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Motivo del rechazo
              </div>
              <div
                style={{
                  padding: 12,
                  background: "#FEE2E2",
                  borderRadius: 10,
                  border: `1px solid #FECACA`,
                  color: C.rojo,
                  fontSize: 13,
                }}
              >
                {document.rejection_reason}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {document.status === "pending" && (
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
              {isApproving ? "Aprobando..." : "Aprobar"}
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
}
