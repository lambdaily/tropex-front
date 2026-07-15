import { useState } from "react";
import {
  Download,
  FileText,
  Users,
  DollarSign,
  AlertTriangle,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { useAdminStore } from "@/features/admin/store/adminStore";
import {
  C,
  DISPLAY,
  formatGs,
  SectionHeader,
  Card,
  Btn,
  StatCard,
} from "../kit";

type DatasetId = "users" | "transactions" | "incidents";

export function ReportsSection() {
  const { users, transactions, incidents, kpiSeries } = useAdminStore();
  const [dataset, setDataset] = useState<DatasetId>("transactions");

  const datasets: {
    id: DatasetId;
    label: string;
    icon: typeof Users;
    count: number;
    desc: string;
  }[] = [
    {
      id: "users",
      label: "Usuarios",
      icon: Users,
      count: users.length,
      desc: "Directorio completo con rol, estado y métricas",
    },
    {
      id: "transactions",
      label: "Transacciones",
      icon: DollarSign,
      count: transactions.length,
      desc: "Comisiones, payouts y reembolsos",
    },
    {
      id: "incidents",
      label: "Incidencias",
      icon: AlertTriangle,
      count: incidents.length,
      desc: "Reportes de soporte y su estado",
    },
  ];

  const buildCsv = (): { name: string; rows: (string | number)[][] } => {
    if (dataset === "users") {
      return {
        name: "usuarios",
        rows: [
          [
            "ID",
            "Nombre",
            "Razón social",
            "Rol",
            "Estado",
            "RUC",
            "Departamento",
            "Viajes",
            "GMV",
          ],
          ...users.map((u) => [
            u.id,
            u.name,
            u.legalName,
            u.role,
            u.status,
            u.ruc || "",
            u.department,
            u.metrics.trips,
            u.metrics.gmv,
          ]),
        ],
      };
    }
    if (dataset === "incidents") {
      return {
        name: "incidencias",
        rows: [
          [
            "ID",
            "Título",
            "Tipo",
            "Prioridad",
            "Estado",
            "Viaje",
            "Reportante",
          ],
          ...incidents.map((i) => [
            i.id,
            i.title,
            i.type,
            i.priority,
            i.status,
            i.tripId || "",
            i.reportedBy,
          ]),
        ],
      };
    }
    return {
      name: "transacciones",
      rows: [
        [
          "ID",
          "Tipo",
          "Estado",
          "Viaje",
          "Contraparte",
          "Bruto",
          "Comisión",
          "Neto",
        ],
        ...transactions.map((t) => [
          t.id,
          t.type,
          t.status,
          t.tripId || "",
          t.counterparty,
          t.grossAmount,
          t.commissionAmount,
          t.netAmount,
        ]),
      ],
    };
  };

  const download = () => {
    const { name, rows } = buildCsv();
    const csv = rows
      .map((r) =>
        r
          .map((cell) => {
            const s = String(cell);
            return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
          })
          .join(","),
      )
      .join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tropex-${name}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Reporte de ${name} descargado.`);
  };

  const totalCommission = transactions
    .filter((t) => t.type === "commission")
    .reduce((s, t) => s + t.commissionAmount, 0);
  const totalGmv = kpiSeries.reduce((s, k) => s + k.gmv, 0);

  return (
    <div>
      <SectionHeader
        title="Reportes"
        subtitle="Generá y exportá reportes de la operación"
      />

      {/* Resumen del período */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 14,
          marginBottom: 22,
        }}
      >
        <StatCard
          label="GMV acumulado (6m)"
          value={formatGs(totalGmv).replace("₲ ", "₲")}
          icon={DollarSign}
          accent={C.verde}
        />
        <StatCard
          label="Comisión registrada"
          value={formatGs(totalCommission).replace("₲ ", "₲")}
          icon={Truck}
          accent={C.naranja}
        />
        <StatCard
          label="Usuarios"
          value={users.length}
          icon={Users}
          accent={C.verde}
        />
        <StatCard
          label="Incidencias"
          value={incidents.length}
          icon={AlertTriangle}
          accent={C.naranja}
        />
      </div>

      <h3
        style={{
          fontFamily: DISPLAY,
          fontWeight: 600,
          fontSize: 16,
          color: C.texto,
          margin: "0 0 14px",
        }}
      >
        Exportar dataset
      </h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 20,
        }}
      >
        {datasets.map((ds) => {
          const Icon = ds.icon;
          const on = dataset === ds.id;
          return (
            <Card
              key={ds.id}
              onClick={() => setDataset(ds.id)}
              style={{
                padding: "18px",
                cursor: "pointer",
                border: on ? `1.5px solid ${C.verde}` : `1px solid ${C.borde}`,
                background: on ? `${C.verde}08` : "#fff",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 11,
                    background: `${C.verde}14`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={20} color={C.verde} />
                </div>
                <span
                  style={{
                    fontFamily: DISPLAY,
                    fontWeight: 700,
                    fontSize: 20,
                    color: C.texto,
                  }}
                >
                  {ds.count}
                </span>
              </div>
              <div
                style={{
                  fontFamily: DISPLAY,
                  fontWeight: 600,
                  fontSize: 15,
                  color: C.texto,
                  marginTop: 12,
                }}
              >
                {ds.label}
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  color: C.gris,
                  marginTop: 3,
                  lineHeight: 1.45,
                }}
              >
                {ds.desc}
              </div>
            </Card>
          );
        })}
      </div>

      <Card
        style={{
          padding: "18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 14,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 11,
              background: `${C.naranja}14`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FileText size={20} color={C.naranja} />
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
              Reporte de {datasets.find((d) => d.id === dataset)?.label}
            </div>
            <div style={{ fontSize: 12.5, color: C.gris }}>
              {datasets.find((d) => d.id === dataset)?.count} filas · formato
              CSV (compatible con Excel)
            </div>
          </div>
        </div>
        <Btn variant="primary" icon={Download} onClick={download}>
          Descargar CSV
        </Btn>
      </Card>
    </div>
  );
}
