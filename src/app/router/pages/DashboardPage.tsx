import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/app/components/ui/use-mobile";
import { useAuth } from "@/features/auth";
import { buildGanaderoAccountInitialData } from "@/features/account";
import { useSignupStore } from "../signupStore";
import { RancherDashboard } from "@/app/components/dashboards/RancherDashboard";
import { RancherDashboardMobile } from "@/app/components/dashboards-mobile/RancherDashboardMobile";
import { EmpresaDashboard } from "@/app/components/dashboards/EmpresaDashboard";
import { EmpresaDashboardMobile } from "@/app/components/dashboards-mobile/EmpresaDashboardMobile";
import { OwnerOperatorDashboard } from "@/app/components/dashboards/OwnerOperatorDashboard";
import { OwnerOperatorDashboardMobile } from "@/app/components/dashboards-mobile/OwnerOperatorDashboardMobile";
import { DriverDashboard } from "@/app/components/dashboards/DriverDashboard";
import { DriverDashboardMobile } from "@/app/components/dashboards-mobile/DriverDashboardMobile";

function productorSubTypeLabel(role: string) {
  if (role === "frigorifico") return "Frigorífico";
  if (role === "consignataria") return "Consignataria";
  if (role === "feria-remate") return "Feria / Remate";
  if (role === "otro-productor") return "Otro Productor";
  return "Ganadero";
}

export function DashboardPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user, logout } = useAuth();
  const { signupData, selectedRole, reset } = useSignupStore();

  const role = selectedRole || user?.roles[0] || "";

  const dashboardUserName =
    signupData.firstName ||
    signupData.fullName ||
    signupData.companyName ||
    signupData.establishmentName ||
    user?.first_name ||
    "Usuario";

  const ganaderoAccountInitialData = buildGanaderoAccountInitialData({
    user,
    signupData: {
      firstName: signupData.firstName,
      fullName: signupData.fullName,
      email: signupData.email,
      phone: signupData.phone,
      establishmentName: signupData.establishmentName,
      ruc: signupData.ruc,
      razonSocial: signupData.razonSocial,
      department: signupData.department,
      city: signupData.city,
      institution: signupData.institution,
      accountNumber: signupData.accountNumber,
    },
    fallbackName: dashboardUserName,
  });

  const handleLogout = async () => {
    await logout();
    reset();
    navigate("/");
  };

  // Ganadero y sub-tipos de productor usan el RancherDashboard
  const isGanaderoFlow =
    role === "ganadero" ||
    role === "frigorifico" ||
    role === "consignataria" ||
    role === "feria-remate" ||
    role === "otro-productor";

  if (isGanaderoFlow) {
    const subTypeLabel =
      role === "ganadero" ? undefined : productorSubTypeLabel(role);

    if (isMobile) {
      return (
        <RancherDashboardMobile
          userName={dashboardUserName}
          onLogout={handleLogout}
          subTypeLabel={subTypeLabel}
          accountInitialData={ganaderoAccountInitialData}
        />
      );
    }

    return (
      <RancherDashboard
        userName={dashboardUserName}
        onLogout={handleLogout}
        subTypeLabel={subTypeLabel}
        accountInitialData={ganaderoAccountInitialData}
      />
    );
  }

  if (role === "empresa") {
    return isMobile ? (
      <EmpresaDashboardMobile userName={dashboardUserName} onLogout={handleLogout} />
    ) : (
      <EmpresaDashboard userName={dashboardUserName} onLogout={handleLogout} />
    );
  }

  if (role === "owner-operator") {
    return isMobile ? (
      <OwnerOperatorDashboardMobile userName={dashboardUserName} onLogout={handleLogout} />
    ) : (
      <OwnerOperatorDashboard userName={dashboardUserName} onLogout={handleLogout} />
    );
  }

  if (role === "chofer") {
    return isMobile ? (
      <DriverDashboardMobile userName={dashboardUserName} onLogout={handleLogout} />
    ) : (
      <DriverDashboard userName={dashboardUserName} onLogout={handleLogout} />
    );
  }

  // Sin rol detectado
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-gray-600 mb-4">No se detectó un rol de usuario</p>
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-black text-white rounded-lg"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
