import { useState } from "react";
import {
  ShieldCheck,
  Users,
  AlertTriangle,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  FileText,
  GitPullRequest,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useIsMobile } from "@/app/components/ui/use-mobile";
import { useAdminStore } from "@/features/admin/store/adminStore";
import { myChangeRequestsApi } from "@/features/my-change-requests/api/myChangeRequestsApi";
import { C, DISPLAY, BODY } from "./kit";
import { VerificationsSection } from "./sections/Verifications";
import { ChangeRequestsSection } from "./sections/ChangeRequests";
import { DocumentReviewSection } from "./sections/DocumentReview";
import { AccountsManagement } from "@/features/users";
import { UsersSection } from "./sections/Users";
import { IncidentsSection } from "./sections/Incidents";
import { ReportsSection } from "./sections/Reports";
import { SettingsSection } from "./sections/Settings";
import { GanaderoDocsSection } from "./sections/GanaderoDocs";

interface AdminDashboardProps {
  onLogout: () => void;
}

export type AdminSection =
  | "verifications"
  | "document-review"
  | "change-requests"
  | "ganadero-docs"
  | "users"
  | "users-v2"
  | "incidents"
  | "reports"
  | "settings";

interface NavItem {
  id: AdminSection;
  label: string;
  icon: LucideIcon;
  group: string;
}

const NAV: NavItem[] = [
  {
    id: "verifications",
    label: "Aprobaciones",
    icon: ShieldCheck,
    group: "Aprobaciones",
  },
  {
    id: "document-review",
    label: "Documentos",
    icon: FileText,
    group: "Aprobaciones",
  },
  {
    id: "change-requests",
    label: "Solicitudes de cambio",
    icon: GitPullRequest,
    group: "Aprobaciones",
  },
  {
    id: "ganadero-docs",
    label: "Tipos de documentos",
    icon: FileText,
    group: "Gestión",
  },
  {
    id: "users",
    label: "Gestión de cuentas",
    icon: Users,
    group: "Gestión",
  },
  {
    id: "users-v2",
    label: "Usuarios API",
    icon: Users,
    group: "Gestión",
  },
  {
    id: "incidents",
    label: "Gestión de incidencias",
    icon: AlertTriangle,
    group: "Gestión",
  },
  {
    id: "reports",
    label: "Historial y reportes",
    icon: BarChart3,
    group: "Historial",
  },
  {
    id: "settings",
    label: "Parámetros",
    icon: Settings,
    group: "Gestión",
  },
];

const SECTION_LABEL: Record<AdminSection, string> = NAV.reduce(
  (acc, n) => {
    acc[n.id] = n.label;
    return acc;
  },
  {} as Record<AdminSection, string>,
);

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const isMobile = useIsMobile();
  const [active, setActive] = useState<AdminSection>("verifications");
  const [navOpen, setNavOpen] = useState(false);
  const { users, incidents } = useAdminStore();

  const { data: changeRequests = [] } = useQuery({
    queryKey: ["admin-change-requests"],
    queryFn: () => myChangeRequestsApi.listAll(),
  });

  const pendingCount = users.filter(
    (u) => u.status === "pending" && u.role === "ganadero",
  ).length;
  const openIncidents = incidents.filter((i) => i.status !== "resolved").length;
  const pendingChangeRequests = changeRequests.filter(
    (r) => r.status === "pending",
  ).length;
  const badgeFor = (id: AdminSection) =>
    id === "verifications"
      ? pendingCount
      : id === "incidents"
        ? openIncidents
        : id === "change-requests"
          ? pendingChangeRequests
          : 0;

  const go = (id: AdminSection) => {
    setActive(id);
    setNavOpen(false);
  };

  const groups = Array.from(new Set(NAV.map((n) => n.group)));

  const Sidebar = (
    <aside
      style={{
        width: 234,
        background: C.noche,
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        height: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "16px 18px",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src="/tropex-isotipo.png"
            alt="TROPEX"
            style={{ width: 24, height: 24, objectFit: "contain" }}
          />
        </div>
        <div>
          <div
            style={{
              fontFamily: DISPLAY,
              fontWeight: 700,
              fontSize: 15,
              color: "#fff",
              lineHeight: 1,
            }}
          >
            TROPEX
          </div>
          <div
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.5)",
              marginTop: 2,
            }}
          >
            Consola interna
          </div>
        </div>
        {isMobile && (
          <button
            onClick={() => setNavOpen(false)}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <X size={20} color="rgba(255,255,255,0.7)" />
          </button>
        )}
      </div>

      <nav style={{ flex: 1, overflowY: "auto", padding: "12px 10px" }}>
        {groups.map((group) => (
          <div key={group} style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "rgba(255,255,255,0.35)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                padding: "0 10px 6px",
              }}
            >
              {group}
            </div>
            {NAV.filter((n) => n.group === group).map(
              ({ id, label, icon: Icon }) => {
                const on = active === id;
                const badge = badgeFor(id);
                return (
                  <button
                    key={id}
                    onClick={() => go(id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 11,
                      width: "100%",
                      padding: "9px 10px",
                      borderRadius: 9,
                      border: "none",
                      cursor: "pointer",
                      background: on ? C.verde : "transparent",
                      marginBottom: 2,
                      textAlign: "left",
                      transition: "background .15s",
                    }}
                  >
                    <Icon
                      size={17}
                      color={on ? "#fff" : "rgba(255,255,255,0.6)"}
                      strokeWidth={on ? 2.3 : 1.9}
                    />
                    <span
                      style={{
                        fontFamily: BODY,
                        fontSize: 13.5,
                        fontWeight: on ? 700 : 500,
                        color: on ? "#fff" : "rgba(255,255,255,0.7)",
                        flex: 1,
                      }}
                    >
                      {label}
                    </span>
                    {badge > 0 && (
                      <span
                        style={{
                          minWidth: 18,
                          height: 18,
                          padding: "0 5px",
                          borderRadius: 99,
                          background: C.naranja,
                          color: "#fff",
                          fontSize: 10.5,
                          fontWeight: 800,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {badge}
                      </span>
                    )}
                  </button>
                );
              },
            )}
          </div>
        ))}
      </nav>

      <button
        onClick={onLogout}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "13px 18px",
          border: "none",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          background: "transparent",
          cursor: "pointer",
          color: "rgba(255,255,255,0.6)",
          fontFamily: BODY,
          fontSize: 13.5,
          fontWeight: 600,
        }}
      >
        <LogOut size={17} /> Cerrar sesión
      </button>
    </aside>
  );

  const SECTION_MAP: Record<AdminSection, React.ReactNode> = {
    verifications: <VerificationsSection />,
    "document-review": <DocumentReviewSection />,
    "change-requests": <ChangeRequestsSection />,
    "ganadero-docs": <GanaderoDocsSection />,
    users: <UsersSection />,
    "users-v2": <AccountsManagement />,
    incidents: <IncidentsSection />,
    reports: <ReportsSection />,
    settings: <SettingsSection />,
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: C.neutro,
        fontFamily: BODY,
      }}
    >
      {/* Sidebar desktop */}
      {!isMobile && Sidebar}

      {/* Drawer mobile */}
      {isMobile && navOpen && (
        <div
          onClick={() => setNavOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 70,
            background: "rgba(0,0,0,0.45)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ height: "100%", width: 234 }}
          >
            {Sidebar}
          </div>
        </div>
      )}

      {/* Columna principal */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* Topbar */}
        <header
          style={{
            height: 56,
            flexShrink: 0,
            background: "#fff",
            borderBottom: `1px solid ${C.borde}`,
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "0 16px",
          }}
        >
          {isMobile && (
            <button
              onClick={() => setNavOpen(true)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
              }}
            >
              <Menu size={22} color={C.texto} />
            </button>
          )}
          <span
            style={{
              fontFamily: DISPLAY,
              fontWeight: 700,
              fontSize: 16,
              color: C.texto,
            }}
          >
            {SECTION_LABEL[active]}
          </span>
          <div style={{ flex: 1 }} />
          {!isMobile && (
            <div style={{ position: "relative", width: 220 }}>
              <Search
                size={15}
                color={C.grisClaro}
                style={{
                  position: "absolute",
                  left: 11,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
              <input
                placeholder="Buscar en la consola…"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "8px 12px 8px 32px",
                  borderRadius: 9,
                  border: `1px solid ${C.borde}`,
                  background: C.neutro,
                  fontSize: 13,
                  fontFamily: BODY,
                  outline: "none",
                }}
              />
            </div>
          )}
          <button
            onClick={() => go("incidents")}
            style={{
              position: "relative",
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: C.neutro,
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Bell size={17} color={C.verde} />
            {openIncidents > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: 7,
                  right: 8,
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: C.naranja,
                }}
              />
            )}
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
                fontSize: 13,
                color: "#fff",
              }}
            >
              TX
            </div>
            {!isMobile && (
              <div style={{ lineHeight: 1.1 }}>
                <div
                  style={{ fontSize: 12.5, fontWeight: 700, color: C.texto }}
                >
                  Equipo TROPEX
                </div>
                <div style={{ fontSize: 10.5, color: C.gris }}>
                  Administrador
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Contenido */}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            padding: isMobile ? "18px 14px 40px" : "26px 28px 48px",
          }}
        >
          {SECTION_MAP[active]}
        </main>
      </div>
    </div>
  );
}
