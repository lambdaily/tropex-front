import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import {
  Users,
  Truck,
  DollarSign,
  Wallet,
  ShieldCheck,
  MapPin,
  ArrowRight,
  AlertTriangle,
  UserPlus,
  Package,
  FileWarning,
  CheckCircle2,
} from "lucide-react";
import { MapView, type MapMarker } from "../../../MapView";
import { getEmpresaDrivers } from "../../../../store/demoStore";
import { useAdminStore } from "../../../../data/admin-data";
import {
  C,
  DISPLAY,
  BODY,
  formatGs,
  formatGsShort,
  timeAgo,
  Card,
  StatCard,
  ChartCard,
  SectionHeader,
  StatusBadge,
  incidentStatusMeta,
  priorityMeta,
} from "../kit";
import type { ActivityKind } from "../../../../data/admin-data";

const kindIcon: Record<ActivityKind, typeof Users> = {
  signup: UserPlus,
  trip: Truck,
  offer: Package,
  incident: AlertTriangle,
  payout: Wallet,
  verification: ShieldCheck,
};

export function OverviewSection({
  onNavigate,
}: {
  onNavigate: (s: string) => void;
}) {
  const { users, incidents, kpiSeries, activity } = useAdminStore();
  const drivers = getEmpresaDrivers();

  const last = kpiSeries[kpiSeries.length - 1];
  const prev = kpiSeries[kpiSeries.length - 2];
  const pct = (a: number, b: number) =>
    b ? Math.round(((a - b) / b) * 100) : 0;

  const activeUsers = users.filter((u) => u.status === "active").length;
  const pending = users.filter((u) => u.status === "pending").length;
  const openInc = incidents.filter((i) => i.status !== "resolved");
  const activeTrips = drivers.filter((d) => !d.available).length + 84; // demo: flota en viaje + base

  const mapMarkers: MapMarker[] = drivers.map((d) => ({
    id: d.id,
    lat: d.currentLat,
    lng: d.currentLng,
    type: d.available ? "origin" : "truck",
    label: d.name.split(" ")[0],
  }));

  const tooltipStyle = {
    background: C.noche,
    border: "none",
    borderRadius: 10,
    fontSize: 12,
    color: "#fff",
    fontFamily: BODY,
  };

  return (
    <div>
      <SectionHeader
        title="Resumen operativo"
        subtitle="Estado general de la plataforma en tiempo real"
      />

      {/* KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 14,
          marginBottom: 20,
        }}
      >
        <StatCard
          label="Usuarios activos"
          value={activeUsers}
          icon={Users}
          accent={C.verde}
          trend={kpiSeries.map((k) => k.signups)}
          delta={{ text: `${last.signups} altas`, dir: "up" }}
          onClick={() => onNavigate("users")}
        />
        <StatCard
          label="Viajes activos"
          value={activeTrips}
          icon={Truck}
          accent={C.naranja}
          trend={kpiSeries.map((k) => k.trips)}
          delta={{
            text: `${pct(last.trips, prev.trips)}%`,
            dir: last.trips >= prev.trips ? "up" : "down",
          }}
          onClick={() => onNavigate("trips")}
        />
        <StatCard
          label="GMV del mes"
          value={formatGsShort(last.gmv)}
          icon={DollarSign}
          accent={C.verde}
          trend={kpiSeries.map((k) => k.gmv)}
          delta={{
            text: `${pct(last.gmv, prev.gmv)}%`,
            dir: last.gmv >= prev.gmv ? "up" : "down",
          }}
          onClick={() => onNavigate("finance")}
        />
        <StatCard
          label="Comisión del mes"
          value={formatGsShort(last.revenue)}
          icon={Wallet}
          accent={C.naranja}
          trend={kpiSeries.map((k) => k.revenue)}
          delta={{
            text: `${pct(last.revenue, prev.revenue)}%`,
            dir: last.revenue >= prev.revenue ? "up" : "down",
          }}
          onClick={() => onNavigate("finance")}
        />
        <StatCard
          label="Verificaciones"
          value={pending}
          icon={ShieldCheck}
          accent={pending > 0 ? C.naranja : C.verdeClaro}
          delta={{
            text: pending > 0 ? "pendientes" : "al día",
            dir: pending > 0 ? "flat" : "up",
          }}
          onClick={() => onNavigate("verifications")}
        />
      </div>

      {/* Charts */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 14,
          marginBottom: 20,
        }}
      >
        <ChartCard title="Comisión mensual" subtitle="Ingresos TROPEX (₲)">
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart
              data={kpiSeries}
              margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.verde} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={C.verde} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(0,0,0,0.05)"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: C.gris }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [formatGs(v), "Comisión"]}
                cursor={{ stroke: C.verde, strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={C.verde}
                strokeWidth={2.5}
                fill="url(#gRev)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Viajes por mes" subtitle="Volumen de envíos">
          <ResponsiveContainer width="100%" height={210}>
            <BarChart
              data={kpiSeries}
              margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(0,0,0,0.05)"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: C.gris }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(v: number) => [v, "Viajes"]}
                cursor={{ fill: "rgba(0,0,0,0.03)" }}
              />
              <Bar dataKey="trips" radius={[5, 5, 0, 0]} maxBarSize={38}>
                {kpiSeries.map((_, i) => (
                  <Cell
                    key={i}
                    fill={i === kpiSeries.length - 1 ? C.naranja : "#cde0d2"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Mapa + Actividad + Alertas */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
          gap: 14,
        }}
        className="ov-grid"
      >
        <Card style={{ overflow: "hidden", padding: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <MapPin size={17} color={C.naranja} />
              <h3
                style={{
                  fontFamily: DISPLAY,
                  fontWeight: 600,
                  fontSize: 15,
                  color: C.texto,
                  margin: 0,
                }}
              >
                Flota en vivo
              </h3>
            </div>
            <button
              onClick={() => onNavigate("livemap")}
              style={{
                background: "none",
                border: "none",
                color: C.verde,
                fontWeight: 700,
                fontSize: 12.5,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
              }}
            >
              Ver mapa <ArrowRight size={14} />
            </button>
          </div>
          <MapView height={300} markers={mapMarkers} interactive={true} />
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Alertas */}
          <Card style={{ padding: "16px 16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <h3
                style={{
                  fontFamily: DISPLAY,
                  fontWeight: 600,
                  fontSize: 15,
                  color: C.texto,
                  margin: 0,
                }}
              >
                Alertas abiertas
              </h3>
              <button
                onClick={() => onNavigate("incidents")}
                style={{
                  background: "none",
                  border: "none",
                  color: C.verde,
                  fontWeight: 700,
                  fontSize: 12.5,
                  cursor: "pointer",
                }}
              >
                Ver todas
              </button>
            </div>
            {openInc.length === 0 ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: C.gris,
                  fontSize: 13,
                }}
              >
                <CheckCircle2 size={16} color={C.verdeClaro} /> Sin incidencias
                abiertas
              </div>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                {openInc.slice(0, 3).map((i) => (
                  <button
                    key={i.id}
                    onClick={() => onNavigate("incidents")}
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "flex-start",
                      background: "#FAFAF8",
                      border: `1px solid ${C.borde}`,
                      borderRadius: 11,
                      padding: "10px 12px",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <FileWarning
                      size={16}
                      color={priorityMeta[i.priority].color}
                      style={{ marginTop: 1, flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: C.texto,
                        }}
                      >
                        {i.title}
                      </div>
                      <div
                        style={{ fontSize: 11.5, color: C.gris, marginTop: 2 }}
                      >
                        {i.tripId ?? "—"} · {timeAgo(i.createdAt)}
                      </div>
                    </div>
                    <StatusBadge
                      label={incidentStatusMeta[i.status].label}
                      color={incidentStatusMeta[i.status].color}
                    />
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Actividad */}
          <Card style={{ padding: "16px 16px", flex: 1 }}>
            <h3
              style={{
                fontFamily: DISPLAY,
                fontWeight: 600,
                fontSize: 15,
                color: C.texto,
                margin: "0 0 12px",
              }}
            >
              Actividad reciente
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              {activity.slice(0, 6).map((a) => {
                const Icon = kindIcon[a.kind];
                return (
                  <div
                    key={a.id}
                    style={{
                      display: "flex",
                      gap: 11,
                      alignItems: "flex-start",
                    }}
                  >
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 9,
                        background: `${C.verde}10`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={15} color={C.verde} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          color: C.texto,
                          lineHeight: 1.4,
                        }}
                      >
                        {a.text}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: C.grisClaro,
                          marginTop: 2,
                        }}
                      >
                        {timeAgo(a.at)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
      <style>{`@media (max-width: 900px){ .ov-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
