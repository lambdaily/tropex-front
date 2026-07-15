import { useState } from "react";
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Phone,
  Truck,
  Scale,
  FileWarning,
  Wrench,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  useAdminStore,
  type AdminIncident,
  type IncidentStatus,
  type IncidentType,
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
  incidentStatusMeta,
  priorityMeta,
  type Column,
} from "../kit";

const typeMeta: Record<IncidentType, { label: string; icon: typeof Truck }> = {
  retraso: { label: "Retraso", icon: Clock },
  disputa: { label: "Disputa", icon: Scale },
  documento: { label: "Documento", icon: FileWarning },
  mecanico: { label: "Mecánico", icon: Wrench },
  otro: { label: "Otro", icon: HelpCircle },
};

export function IncidentsSection() {
  const { incidents, updateIncidentStatus, assignIncident } = useAdminStore();
  const [status, setStatus] = useState<string>("all");
  const [sel, setSel] = useState<AdminIncident | null>(null);

  const rows = incidents.filter((i) => status === "all" || i.status === status);
  const open = incidents.filter((i) => i.status !== "resolved").length;

  const columns: Column<AdminIncident>[] = [
    {
      key: "title",
      header: "Incidencia",
      value: (i) => i.title,
      render: (i) => {
        const Icon = typeMeta[i.type].icon;
        return (
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Icon
              size={16}
              color={priorityMeta[i.priority].color}
              style={{ flexShrink: 0 }}
            />
            <div>
              <div style={{ fontWeight: 600 }}>{i.title}</div>
              <div style={{ fontSize: 12, color: C.gris }}>
                {i.id} · {typeMeta[i.type].label}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: "trip",
      header: "Viaje",
      value: (i) => i.tripId || "",
      hideMobile: true,
      render: (i) => (
        <span style={{ fontFamily: "ui-monospace, monospace", color: C.gris }}>
          {i.tripId || "—"}
        </span>
      ),
    },
    {
      key: "priority",
      header: "Prioridad",
      value: (i) => i.priority,
      render: (i) => (
        <StatusBadge
          label={priorityMeta[i.priority].label}
          color={priorityMeta[i.priority].color}
        />
      ),
    },
    {
      key: "created",
      header: "Reportada",
      value: (i) => i.createdAt,
      hideMobile: true,
      render: (i) => (
        <span style={{ color: C.gris }}>{timeAgo(i.createdAt)}</span>
      ),
    },
    {
      key: "status",
      header: "Estado",
      value: (i) => incidentStatusMeta[i.status].label,
      render: (i) => (
        <StatusBadge
          label={incidentStatusMeta[i.status].label}
          color={incidentStatusMeta[i.status].color}
        />
      ),
    },
  ];

  const filters = [
    {
      id: "status",
      label: "Estado",
      value: status,
      onChange: setStatus,
      options: [
        { value: "all", label: "Todas" },
        ...(Object.keys(incidentStatusMeta) as IncidentStatus[]).map((s) => ({
          value: s,
          label: incidentStatusMeta[s].label,
        })),
      ],
    },
  ];

  const setStatusAndToast = (
    i: AdminIncident,
    s: IncidentStatus,
    msg: string,
  ) => {
    updateIncidentStatus(i.id, s);
    toast.success(msg);
    setSel({ ...i, status: s });
  };

  return (
    <div>
      <SectionHeader
        title="Incidencias"
        subtitle={`${open} abierta${open !== 1 ? "s" : ""} de ${incidents.length} en total`}
      />
      {rows.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="Sin incidencias"
          description="No hay incidencias con ese filtro."
        />
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          getRowId={(i) => i.id}
          onRowClick={setSel}
          searchKeys={["title", "id", "reportedBy", "tripId"]}
          searchPlaceholder="Buscar incidencia, viaje o reportante…"
          filters={filters}
        />
      )}

      {sel && (
        <DetailSheet
          open={!!sel}
          onClose={() => setSel(null)}
          title={sel.title}
          subtitle={`${sel.id} · ${typeMeta[sel.type].label}`}
          statusNode={
            <StatusBadge
              label={priorityMeta[sel.priority].label}
              color={priorityMeta[sel.priority].color}
            />
          }
          footer={
            sel.status !== "resolved" ? (
              <>
                {sel.status === "open" && (
                  <Btn
                    variant="outline"
                    icon={Clock}
                    onClick={() =>
                      setStatusAndToast(
                        sel,
                        "in-progress",
                        "Incidencia marcada en curso.",
                      )
                    }
                  >
                    Tomar
                  </Btn>
                )}
                <Btn
                  variant="primary"
                  icon={CheckCircle2}
                  onClick={() =>
                    setStatusAndToast(sel, "resolved", "Incidencia resuelta.")
                  }
                >
                  Resolver
                </Btn>
              </>
            ) : undefined
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div
              style={{
                display: "flex",
                gap: 11,
                background: `${priorityMeta[sel.priority].color}12`,
                border: `1px solid ${priorityMeta[sel.priority].color}33`,
                borderRadius: 12,
                padding: "12px 14px",
              }}
            >
              <AlertTriangle
                size={18}
                color={priorityMeta[sel.priority].color}
                style={{ flexShrink: 0, marginTop: 1 }}
              />
              <div style={{ fontSize: 13.5, color: C.texto, lineHeight: 1.5 }}>
                {sel.description}
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }}
            >
              <Field
                label="Estado"
                value={
                  <StatusBadge
                    label={incidentStatusMeta[sel.status].label}
                    color={incidentStatusMeta[sel.status].color}
                  />
                }
              />
              <Field
                label="Prioridad"
                value={priorityMeta[sel.priority].label}
              />
              <Field label="Viaje" value={sel.tripId || "—"} />
              <Field label="Reportada" value={timeAgo(sel.createdAt)} />
              <Field label="Reportante" value={sel.reportedBy} />
              <Field label="Asignada a" value={sel.assignee || "Sin asignar"} />
            </div>
            {sel.reportedPhone && (
              <a
                href={`tel:${sel.reportedPhone}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "11px 0",
                  borderRadius: 10,
                  border: `1.5px solid ${C.verde}`,
                  color: C.verde,
                  fontWeight: 700,
                  fontSize: 13.5,
                  textDecoration: "none",
                }}
              >
                <Phone size={15} /> Contactar a {sel.reportedBy}
              </a>
            )}
            {sel.status !== "resolved" && !sel.assignee && (
              <Btn
                variant="soft"
                onClick={() => {
                  assignIncident(sel.id, "Vos");
                  toast("Incidencia asignada a vos.");
                  setSel({ ...sel, assignee: "Vos" });
                }}
              >
                Asignármela
              </Btn>
            )}
          </div>
        </DetailSheet>
      )}
    </div>
  );
}
