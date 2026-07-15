import { useState } from "react";
import {
  Phone,
  Mail,
  Star,
  Ban,
  RotateCcw,
  Truck,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import {
  useAdminStore,
  type AdminUser,
  type AdminUserRole,
  type AdminUserStatus,
} from "@/features/admin/store/adminStore";
import {
  C,
  DISPLAY,
  formatGs,
  SectionHeader,
  DataTable,
  StatusBadge,
  DetailSheet,
  Field,
  Btn,
  roleMeta,
  userStatusMeta,
  type Column,
} from "../kit";

export function UsersSection() {
  const { users, suspendUser, reactivateUser } = useAdminStore();
  const [role, setRole] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [sel, setSel] = useState<AdminUser | null>(null);

  const rows = users.filter(
    (u) =>
      (role === "all" || u.role === role) &&
      (status === "all" || u.status === status),
  );

  const columns: Column<AdminUser>[] = [
    {
      key: "name",
      header: "Usuario",
      value: (u) => u.name,
      render: (u) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: roleMeta[u.role].color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: DISPLAY,
              fontWeight: 700,
              fontSize: 12,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            {u.name
              .split(" ")
              .map((w) => w[0])
              .slice(0, 2)
              .join("")}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{u.name}</div>
            <div
              style={{
                fontSize: 12,
                color: C.gris,
                fontFamily: "ui-monospace, monospace",
              }}
            >
              {u.id}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Rol",
      value: (u) => roleMeta[u.role].label,
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
      key: "trips",
      header: "Viajes",
      align: "right",
      value: (u) => u.metrics.trips,
      hideMobile: true,
      render: (u) => u.metrics.trips || "—",
    },
    {
      key: "gmv",
      header: "GMV",
      align: "right",
      value: (u) => u.metrics.gmv,
      hideMobile: true,
      render: (u) => (u.metrics.gmv ? formatGs(u.metrics.gmv) : "—"),
    },
    {
      key: "rating",
      header: "Rating",
      align: "right",
      value: (u) => u.metrics.rating ?? 0,
      hideMobile: true,
      render: (u) =>
        u.metrics.rating ? (
          <span
            style={{ display: "inline-flex", alignItems: "center", gap: 3 }}
          >
            <Star size={12} color={C.naranja} fill={C.naranja} />{" "}
            {u.metrics.rating}
          </span>
        ) : (
          "—"
        ),
    },
    {
      key: "status",
      header: "Estado",
      value: (u) => userStatusMeta[u.status].label,
      render: (u) => (
        <StatusBadge
          label={userStatusMeta[u.status].label}
          color={userStatusMeta[u.status].color}
        />
      ),
    },
  ];

  const filters = [
    {
      id: "role",
      label: "Rol",
      value: role,
      onChange: setRole,
      options: [
        { value: "all", label: "Todos los roles" },
        ...(
          ["ganadero", "empresa", "owner-operator", "chofer"] as AdminUserRole[]
        ).map((r) => ({ value: r, label: roleMeta[r].label })),
      ],
    },
    {
      id: "status",
      label: "Estado",
      value: status,
      onChange: setStatus,
      options: [
        { value: "all", label: "Todos los estados" },
        ...(
          ["active", "pending", "suspended", "rejected"] as AdminUserStatus[]
        ).map((s) => ({ value: s, label: userStatusMeta[s].label })),
      ],
    },
  ];

  const counts = (
    ["ganadero", "empresa", "owner-operator", "chofer"] as AdminUserRole[]
  ).map((r) => ({
    r,
    n: users.filter((u) => u.role === r && u.status === "active").length,
  }));

  return (
    <div>
      <SectionHeader
        title="Usuarios"
        subtitle={`${users.length} cuentas registradas`}
      />

      {/* Mini resumen por rol */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 12,
          marginBottom: 18,
        }}
      >
        {counts.map(({ r, n }) => (
          <button
            key={r}
            onClick={() => {
              setRole(r);
              setStatus("active");
            }}
            style={{
              textAlign: "left",
              background: "#fff",
              border: `1px solid ${C.borde}`,
              borderRadius: 14,
              padding: "13px 15px",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                fontFamily: DISPLAY,
                fontWeight: 700,
                fontSize: 22,
                color: roleMeta[r].color,
              }}
            >
              {n}
            </div>
            <div style={{ fontSize: 12.5, color: C.gris, marginTop: 2 }}>
              {roleMeta[r].label}s activos
            </div>
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(u) => u.id}
        onRowClick={setSel}
        searchKeys={["name", "legalName", "email", "id"]}
        searchPlaceholder="Buscar por nombre, email o ID…"
        filters={filters}
      />

      {sel && (
        <DetailSheet
          open={!!sel}
          onClose={() => setSel(null)}
          title={sel.name}
          subtitle={sel.legalName}
          statusNode={
            <StatusBadge
              label={userStatusMeta[sel.status].label}
              color={userStatusMeta[sel.status].color}
            />
          }
          footer={
            sel.status === "active" ? (
              <Btn
                variant="danger"
                icon={Ban}
                onClick={() => {
                  suspendUser(sel.id);
                  toast(`${sel.name} fue suspendido.`);
                  setSel(null);
                }}
              >
                Suspender
              </Btn>
            ) : sel.status === "suspended" ? (
              <Btn
                variant="primary"
                icon={RotateCcw}
                onClick={() => {
                  reactivateUser(sel.id);
                  toast.success(`${sel.name} reactivado.`);
                  setSel(null);
                }}
              >
                Reactivar
              </Btn>
            ) : undefined
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 12,
              }}
            >
              <MetricBox
                icon={Truck}
                label="Viajes"
                value={String(sel.metrics.trips || 0)}
              />
              <MetricBox
                icon={DollarSign}
                label="GMV"
                value={sel.metrics.gmv ? formatGs(sel.metrics.gmv) : "—"}
              />
              <MetricBox
                icon={Star}
                label="Rating"
                value={sel.metrics.rating ? String(sel.metrics.rating) : "—"}
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }}
            >
              <Field label="Rol" value={roleMeta[sel.role].label} />
              {sel.subType && <Field label="Subtipo" value={sel.subType} />}
              <Field label="RUC" value={sel.ruc || "—"} />
              <Field label="Cédula" value={sel.cedula || "—"} />
              <Field label="Departamento" value={sel.department} />
              <Field label="Dirección" value={sel.address} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <a href={`tel:${sel.phone}`} style={contactBtn(C.verde, true)}>
                <Phone size={15} /> {sel.phone}
              </a>
              <a
                href={`mailto:${sel.email}`}
                style={contactBtn(C.borde, false)}
              >
                <Mail size={15} /> Email
              </a>
            </div>
          </div>
        </DetailSheet>
      )}
    </div>
  );
}

function MetricBox({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Truck;
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${C.borde}`,
        borderRadius: 12,
        padding: "12px",
      }}
    >
      <Icon size={16} color={C.verde} />
      <div
        style={{
          fontFamily: DISPLAY,
          fontWeight: 700,
          fontSize: 16,
          color: C.texto,
          marginTop: 6,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 11.5, color: C.gris }}>{label}</div>
    </div>
  );
}

function contactBtn(color: string, filled: boolean): React.CSSProperties {
  return {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    padding: "10px 0",
    borderRadius: 10,
    border: `1.5px solid ${color}`,
    color: filled ? C.verde : C.texto,
    fontWeight: 700,
    fontSize: 12.5,
    textDecoration: "none",
    whiteSpace: "nowrap",
  };
}
