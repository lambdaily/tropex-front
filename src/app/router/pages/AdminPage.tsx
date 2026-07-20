import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { useSignupStore } from "../signupStore";
import { AdminDashboard } from "@/features/admin";

export function AdminPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { reset } = useSignupStore();

  const handleLogout = async () => {
    await logout();
    reset();
    navigate("/");
  };

  return <AdminDashboard onLogout={handleLogout} />;
}
