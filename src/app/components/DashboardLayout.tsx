import type { ReactNode } from "react";
import { DashboardSidebar } from "./DashboardSidebar";
import { useAuth } from "@/features/auth";
import { useSignupStore } from "@/app/router/signupStore";
import { useNavigate } from "react-router-dom";

function productorSubTypeLabel(role: string) {
  if (role === "frigorifico") return "Frigorífico";
  if (role === "consignataria") return "Consignataria";
  if (role === "feria-remate") return "Feria / Remate";
  if (role === "otro-productor") return "Otro Productor";
  return "Ganadero";
}

export function DashboardLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { signupData, selectedRole, reset } = useSignupStore();

  const role = selectedRole || user?.roles[0] || "ganadero";

  const dashboardUserName =
    signupData.firstName ||
    signupData.fullName ||
    signupData.companyName ||
    signupData.establishmentName ||
    user?.first_name ||
    "Usuario";

  const subTypeLabel = productorSubTypeLabel(role);

  const handleLogout = async () => {
    await logout();
    reset();
    navigate("/");
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: "#F6F1E8",
        backgroundImage:
          "radial-gradient(circle, rgba(0,0,0,0.07) 1px, transparent 1px)",
        backgroundSize: "22px 22px",
        fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
        position: "relative",
      }}
    >
      <DashboardSidebar
        userName={dashboardUserName}
        subTypeLabel={subTypeLabel}
        onLogout={handleLogout}
      />

      {/* Sidebar overlay (click to collapse) */}

      {/* Main content column */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
          minWidth: 0,
          paddingLeft: 60,
        }}
      >
        <div style={{ padding: "24px 28px", flex: 1, minWidth: 0 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
