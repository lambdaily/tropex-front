import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { GanaderoAccount, buildGanaderoAccountInitialData } from "@/features/account";
import { useSignupStore } from "../signupStore";

export function AccountPage() {
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

  const subTypeLabel =
    role === "frigorifico"
      ? "Frigorífico"
      : role === "consignataria"
        ? "Consignataria"
        : role === "feria-remate"
          ? "Feria / Remate"
          : role === "otro-productor"
            ? "Otro Productor"
            : "Ganadero";

  return (
    <GanaderoAccount
      userName={dashboardUserName}
      onLogout={() => {
        logout();
        reset();
        navigate("/");
      }}
      onBack={() => navigate("/dashboard")}
      subTypeLabel={subTypeLabel}
      initialData={ganaderoAccountInitialData}
    />
  );
}
