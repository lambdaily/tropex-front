import { useNavigate } from "react-router-dom";
import { useSignupStore } from "./signupStore";

export function DemoSwitcher() {
  const navigate = useNavigate();
  const { selectedRole, setSelectedRole, setSignupData } = useSignupStore();

  const handleDemoAs = (role: string) => {
    setSelectedRole(role);
    setSignupData({ firstName: "Demo", fullName: "Demo Usuario", companyName: "Demo Empresa" });
    navigate("/dashboard");
  };

  const handleAdmin = () => {
    setSelectedRole("admin");
    navigate("/admin");
  };

  const isAdmin = selectedRole === "admin" && window.location.pathname === "/admin";
  const isDashboard = window.location.pathname === "/dashboard";

  return (
    <div
      className="fixed bottom-4 right-4 z-[2000] flex flex-col items-end gap-1.5"
      style={{ pointerEvents: "auto" }}
    >
      <div className="bg-black text-white text-xs px-2 py-0.5 rounded-full font-bold opacity-70">
        Demo
      </div>
      {(["ganadero", "empresa", "owner-operator", "chofer"] as const).map(
        (role) => (
          <button
            key={role}
            onClick={() => handleDemoAs(role)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg transition-opacity ${
              selectedRole === role && isDashboard
                ? "opacity-100 text-white"
                : "opacity-70 hover:opacity-100 bg-white text-gray-800"
            }`}
            style={
              selectedRole === role && isDashboard
                ? { backgroundColor: "#1E5126" }
                : {}
            }
          >
            {role === "ganadero"
              ? "Ganadero"
              : role === "empresa"
                ? "Empresa"
                : role === "owner-operator"
                  ? "Owner-Op."
                  : "Chofer"}
          </button>
        ),
      )}
      <button
        onClick={handleAdmin}
        className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg transition-opacity ${
          isAdmin
            ? "opacity-100 text-white"
            : "opacity-70 hover:opacity-100 bg-white text-gray-800"
        }`}
        style={isAdmin ? { backgroundColor: "#08221A" } : {}}
      >
        Admin TROPEX
      </button>
    </div>
  );
}
