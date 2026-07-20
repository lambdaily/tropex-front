import { useNavigate } from "react-router-dom";
import { ChooseAccountType } from "@/app/components/tropero-v2/ChooseAccountType";
import { useSignupStore } from "../signupStore";

export function ChooseAccountPage() {
  const navigate = useNavigate();
  const { setSelectedRole } = useSignupStore();

  const handleSelectRole = (role: string) => {
    setSelectedRole(role);
    if (role === "ganadero") {
      navigate("/register/ganadero/1");
    }
    // Los demás roles se migrarán progresivamente
    // Por ahora, solo el flujo ganadero usa React Router
  };

  return (
    <ChooseAccountType
      onSelectRole={handleSelectRole}
      onBack={() => navigate("/")}
    />
  );
}
