import { useMemo, useState } from "react";
import { FileText, Plus, Save } from "lucide-react";
import { toast } from "sonner";
import {
  useAdminStore,
  type GanaderoDocumentType,
} from "@/features/admin/store/adminStore";
import {
  C,
  SectionHeader,
  Card,
  Btn,
  DataTable,
  DetailSheet,
  Field,
  StatusBadge,
  type Column,
} from "../kit";

export function GanaderoDocsSection() {
  const {
    ganaderoDocumentTypes,
    createGanaderoDocumentType,
    updateGanaderoDocumentType,
  } = useAdminStore();

  const [isCreating, setIsCreating] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newRequired, setNewRequired] = useState(true);
  const [selected, setSelected] = useState<GanaderoDocumentType | null>(null);

  const activeCount = ganaderoDocumentTypes.filter((d) => d.active).length;
  const requiredCount = ganaderoDocumentTypes.filter(
    (d) => d.active && d.required,
  ).length;

  const columns: Column<GanaderoDocumentType>[] = [
    {
      key: "label",
      header: "Documento",
      value: (d) => d.label,
      render: (d) => (
        <div>
          <div style={{ fontWeight: 700 }}>{d.label}</div>
          <div
            style={{
              fontSize: 11.5,
              color: C.gris,
              fontFamily: "ui-monospace, monospace",
            }}
          >
            {d.code}
          </div>
        </div>
      ),
    },
    {
      key: "required",
      header: "Regla",
      value: (d) => (d.required ? "required" : "optional"),
      render: (d) => (
        <StatusBadge
          label={d.required ? "Obligatorio" : "Opcional"}
          color={d.required ? C.verde : C.grisClaro}
        />
      ),
    },
    {
      key: "active",
      header: "Estado",
      value: (d) => (d.active ? "active" : "inactive"),
      render: (d) => (
        <StatusBadge
          label={d.active ? "Activo" : "Inactivo"}
          color={d.active ? C.verdeClaro : C.grisClaro}
        />
      ),
    },
    {
      key: "updatedAt",
      header: "Actualizado",
      align: "right",
      value: (d) => d.updatedAt,
      render: (d) => (
        <span style={{ color: C.gris }}>
          {new Date(d.updatedAt).toLocaleDateString("es-PY")}
        </span>
      ),
    },
  ];

  const sortedRows = useMemo(
    () => [...ganaderoDocumentTypes].sort((a, b) => a.order - b.order),
    [ganaderoDocumentTypes],
  );

  const createType = () => {
    const clean = newLabel.trim();
    if (!clean) {
      toast.error("El nombre del documento es obligatorio.");
      return;
    }

    createGanaderoDocumentType({
      label: clean,
      required: newRequired,
      active: true,
    });

    toast.success("Tipo de documento creado.");
    setNewLabel("");
    setNewRequired(true);
    setIsCreating(false);
  };

  const updateSelected = (
    patch: Partial<Pick<GanaderoDocumentType, "label" | "required" | "active">>,
  ) => {
    if (!selected) return;

    if ("label" in patch && !patch.label?.trim()) {
      toast.error("El nombre del documento no puede estar vacío.");
      return;
    }

    updateGanaderoDocumentType(selected.id, patch);
    setSelected({ ...selected, ...patch });
    toast.success("Tipo de documento actualizado.");
  };

  return (
    <div>
      <SectionHeader
        title="Documentos · Ganadero"
        subtitle="Definí qué documentos se piden para aprobar cuentas ganaderas"
        actions={
          <Btn
            variant="primary"
            icon={Plus}
            onClick={() => setIsCreating((v) => !v)}
          >
            {isCreating ? "Cancelar" : "Nuevo tipo"}
          </Btn>
        }
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <Card style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 12, color: C.gris }}>Tipos activos</div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: C.texto,
              marginTop: 3,
            }}
          >
            {activeCount}
          </div>
        </Card>
        <Card style={{ padding: "14px 16px" }}>
          <div style={{ fontSize: 12, color: C.gris }}>Obligatorios</div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: C.texto,
              marginTop: 3,
            }}
          >
            {requiredCount}
          </div>
        </Card>
      </div>

      {isCreating && (
        <Card style={{ padding: "16px", marginBottom: 16 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto auto",
              gap: 10,
              alignItems: "end",
            }}
          >
            <div>
              <label style={{ fontSize: 12, color: C.gris, fontWeight: 700 }}>
                Nombre del documento
              </label>
              <input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Ej: Constancia impositiva"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  marginTop: 6,
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: `1px solid ${C.borde}`,
                }}
              />
            </div>
            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                fontSize: 13,
                color: C.texto,
                fontWeight: 600,
              }}
            >
              <input
                type="checkbox"
                checked={newRequired}
                onChange={(e) => setNewRequired(e.target.checked)}
              />
              Obligatorio
            </label>
            <Btn variant="primary" icon={Save} onClick={createType}>
              Guardar
            </Btn>
          </div>
        </Card>
      )}

      <DataTable
        columns={columns}
        rows={sortedRows}
        getRowId={(d) => d.id}
        onRowClick={setSelected}
        searchKeys={["label", "code"]}
        searchPlaceholder="Buscar tipo de documento…"
      />

      {selected && (
        <DetailSheet
          open={!!selected}
          onClose={() => setSelected(null)}
          title={selected.label}
          subtitle={`Código interno: ${selected.code}`}
          statusNode={
            <StatusBadge
              label={selected.active ? "Activo" : "Inactivo"}
              color={selected.active ? C.verdeClaro : C.grisClaro}
            />
          }
          footer={
            <>
              <Btn
                variant={selected.active ? "danger" : "soft"}
                onClick={() => updateSelected({ active: !selected.active })}
              >
                {selected.active ? "Desactivar" : "Activar"}
              </Btn>
            </>
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Código" value={selected.code} />

            <div>
              <div
                style={{
                  fontSize: 10.5,
                  color: C.grisClaro,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                Nombre visible
              </div>
              <input
                value={selected.label}
                onChange={(e) =>
                  setSelected({ ...selected, label: e.target.value })
                }
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: `1px solid ${C.borde}`,
                }}
              />
              <div style={{ marginTop: 8 }}>
                <Btn
                  variant="primary"
                  icon={Save}
                  onClick={() => updateSelected({ label: selected.label })}
                >
                  Guardar nombre
                </Btn>
              </div>
            </div>

            <label
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13.5,
                color: C.texto,
                fontWeight: 600,
              }}
            >
              <input
                type="checkbox"
                checked={selected.required}
                onChange={(e) => updateSelected({ required: e.target.checked })}
              />
              Documento obligatorio para aprobación
            </label>

            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                background: "#fff",
                border: `1px solid ${C.borde}`,
                borderRadius: 10,
                padding: "11px 12px",
              }}
            >
              <FileText size={16} color={C.verde} style={{ marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.texto }}>
                  Impacto
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: C.gris,
                    marginTop: 2,
                    lineHeight: 1.5,
                  }}
                >
                  Este catálogo se usa en la revisión de cuentas ganaderas en la
                  sección de Verificaciones.
                </div>
              </div>
            </div>
          </div>
        </DetailSheet>
      )}
    </div>
  );
}
