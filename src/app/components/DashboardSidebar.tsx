import { useState } from "react";
import {
  LayoutDashboard,
  Bell,
  Package,
  History,
  BarChart3,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface DashboardSidebarProps {
  userName: string;
  subTypeLabel?: string;
  onLogout: () => void;
  pendingOffersCount?: number;
}

export function DashboardSidebar({
  userName,
  subTypeLabel = "Ganadero",
  onLogout,
  pendingOffersCount = 0,
}: DashboardSidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);

  const navItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Panel Principal", hasDot: false },
    { path: "/dashboard/offers", icon: Bell, label: "Ofertas", hasDot: pendingOffersCount > 0 },
    { path: "/dashboard/shipments", icon: Package, label: "Mis envíos", hasDot: false },
    { path: "/dashboard/history", icon: History, label: "Historial", hasDot: false },
    { path: "/dashboard/reports", icon: BarChart3, label: "Reportes", hasDot: false },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: expanded ? 220 : 60,
        background: "#1E5126",
        transition: "width 250ms ease-in-out",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        padding: "14px 0",
        gap: 4,
        zIndex: 50,
      }}
    >
      {/* Logo row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "0 12px",
          marginBottom: 10,
          minHeight: 36,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 9,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <img
            src="/tropex-isotipo.png"
            alt="TROPEX"
            style={{ width: 26, height: 26, objectFit: "contain" }}
          />
        </div>
        {expanded && (
          <span
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: "#fff",
              whiteSpace: "nowrap",
            }}
          >
            TROPEX
          </span>
        )}
      </div>

      {/* Nav items */}
      {navItems.map(({ path, icon: Icon, label, hasDot }) => {
        const active = isActive(path);
        return expanded ? (
          <button
            key={path}
            onClick={() => {
              navigate(path);
              setExpanded(false);
            }}
            style={{
              width: "calc(100% - 16px)",
              margin: "0 8px",
              height: 38,
              padding: "0 10px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: active ? "rgba(255,255,255,0.18)" : "transparent",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              position: "relative",
            }}
          >
            <Icon
              size={18}
              color={active ? "#fff" : "rgba(255,255,255,0.6)"}
              strokeWidth={active ? 2.2 : 1.8}
              style={{ flexShrink: 0 }}
            />
            <span
              style={{
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                color: active ? "#fff" : "rgba(255,255,255,0.75)",
                whiteSpace: "nowrap",
              }}
            >
              {label}
            </span>
            {hasDot && (
              <span
                style={{
                  position: "absolute",
                  top: 8,
                  left: 24,
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#F58718",
                  border: "1.5px solid #1E5126",
                }}
              />
            )}
          </button>
        ) : (
          <button
            key={path}
            onClick={() => navigate(path)}
            title={label}
            style={{
              width: 36,
              height: 36,
              borderRadius: 9,
              border: "none",
              background: active ? "rgba(255,255,255,0.18)" : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "background 150ms",
              position: "relative",
              margin: "0 auto",
            }}
          >
            <Icon
              size={18}
              color={active ? "#fff" : "rgba(255,255,255,0.55)"}
              strokeWidth={active ? 2.2 : 1.8}
            />
            {hasDot && (
              <span
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#F58718",
                  border: "1.5px solid #1E5126",
                }}
              />
            )}
          </button>
        );
      })}

      {/* Separator */}
      <div
        style={{
          width: expanded ? "calc(100% - 24px)" : 24,
          height: 1,
          background: "rgba(255,255,255,0.15)",
          margin: "8px auto",
        }}
      />

      {/* Account */}
      {expanded ? (
        <button
          onClick={() => {
            navigate("/account");
            setExpanded(false);
          }}
          style={{
            width: "calc(100% - 16px)",
            margin: "0 8px",
            height: 38,
            padding: "0 10px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: isActive("/account") ? "rgba(255,255,255,0.18)" : "transparent",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          <User
            size={18}
            color={isActive("/account") ? "#fff" : "rgba(255,255,255,0.6)"}
            strokeWidth={1.8}
            style={{ flexShrink: 0 }}
          />
          <span
            style={{
              fontSize: 13,
              fontWeight: isActive("/account") ? 700 : 500,
              color: isActive("/account") ? "#fff" : "rgba(255,255,255,0.75)",
              whiteSpace: "nowrap",
            }}
          >
            Mi cuenta
          </span>
        </button>
      ) : (
        <button
          onClick={() => navigate("/account")}
          title="Mi cuenta"
          style={{
            width: 36,
            height: 36,
            borderRadius: 9,
            border: "none",
            background: isActive("/account") ? "rgba(255,255,255,0.18)" : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            margin: "0 auto",
          }}
        >
          <User
            size={18}
            color={isActive("/account") ? "#fff" : "rgba(255,255,255,0.55)"}
            strokeWidth={1.8}
          />
        </button>
      )}

      {/* Support */}
      {expanded ? (
        <button
          onClick={() => {
            navigate("/dashboard/support");
            setExpanded(false);
          }}
          style={{
            width: "calc(100% - 16px)",
            margin: "0 8px",
            height: 38,
            padding: "0 10px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: isActive("/dashboard/support") ? "rgba(255,255,255,0.18)" : "transparent",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          <HelpCircle
            size={18}
            color={isActive("/dashboard/support") ? "#fff" : "rgba(255,255,255,0.6)"}
            strokeWidth={1.8}
            style={{ flexShrink: 0 }}
          />
          <span
            style={{
              fontSize: 13,
              fontWeight: isActive("/dashboard/support") ? 700 : 500,
              color: isActive("/dashboard/support") ? "#fff" : "rgba(255,255,255,0.75)",
              whiteSpace: "nowrap",
            }}
          >
            Soporte
          </span>
        </button>
      ) : (
        <button
          onClick={() => navigate("/dashboard/support")}
          title="Soporte"
          style={{
            width: 36,
            height: 36,
            borderRadius: 9,
            border: "none",
            background: isActive("/dashboard/support") ? "rgba(255,255,255,0.18)" : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            margin: "0 auto",
          }}
        >
          <HelpCircle
            size={18}
            color={isActive("/dashboard/support") ? "#fff" : "rgba(255,255,255,0.55)"}
            strokeWidth={1.8}
          />
        </button>
      )}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Toggle button */}
      {expanded ? (
        <button
          onClick={() => setExpanded(false)}
          style={{
            width: "calc(100% - 16px)",
            margin: "0 8px",
            height: 38,
            padding: "0 10px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "transparent",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          <ChevronLeft size={18} color="rgba(255,255,255,0.6)" style={{ flexShrink: 0 }} />
          <span
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "rgba(255,255,255,0.65)",
              whiteSpace: "nowrap",
            }}
          >
            Colapsar
          </span>
        </button>
      ) : (
        <button
          onClick={() => setExpanded(true)}
          title="Expandir menú"
          style={{
            width: 36,
            height: 36,
            borderRadius: 9,
            border: "none",
            background: "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            margin: "0 auto",
          }}
        >
          <ChevronRight size={18} color="rgba(255,255,255,0.55)" />
        </button>
      )}

      {/* Logout */}
      {expanded ? (
        <button
          onClick={onLogout}
          style={{
            width: "calc(100% - 16px)",
            margin: "0 8px",
            height: 38,
            padding: "0 10px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "transparent",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          <LogOut size={18} color="rgba(255,255,255,0.6)" style={{ flexShrink: 0 }} />
          <span
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "rgba(255,255,255,0.65)",
              whiteSpace: "nowrap",
            }}
          >
            Cerrar sesión
          </span>
        </button>
      ) : (
        <button
          onClick={onLogout}
          title="Cerrar sesión"
          style={{
            width: 36,
            height: 36,
            borderRadius: 9,
            border: "none",
            background: "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            margin: "0 auto",
          }}
        >
          <LogOut size={18} color="rgba(255,255,255,0.55)" strokeWidth={1.8} />
        </button>
      )}

      {/* User avatar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: expanded ? "4px 12px 0" : "4px 0 0",
          justifyContent: expanded ? "flex-start" : "center",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <User size={15} color="#fff" />
        </div>
        {expanded && (
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#fff",
                whiteSpace: "nowrap",
              }}
            >
              {userName}
            </div>
            <div
              style={{
                fontSize: 10,
                color: "rgba(255,255,255,0.55)",
                whiteSpace: "nowrap",
              }}
            >
              {subTypeLabel}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
