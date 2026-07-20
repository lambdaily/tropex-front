import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/app/components/ui/use-mobile";
import { useAuth } from "@/features/auth";
import { useSignupStore } from "../signupStore";
import { LoginScreen } from "@/app/components/tropero-v2/LoginScreen";
import { LoginScreenMobile } from "@/app/components/tropero-v2-mobile/LoginScreenMobile";

export function LoginPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { login } = useAuth();
  const { loginError, setLoginError, setSelectedRole, setSignupData } = useSignupStore();

  const handleLogin = async (email: string, password: string) => {
    setLoginError(null);
    try {
      const user = await login({ email, password });
      if (user.roles.includes("admin")) {
        setSelectedRole("admin");
        navigate("/admin", { replace: true });
        return;
      }
      if (user.roles.length > 0) {
        setSelectedRole(user.roles[0]);
        setSignupData({
          firstName: user.first_name,
          email: user.email,
          phone: user.phone,
        });
      }
      navigate("/dashboard", { replace: true });
    } catch {
      setLoginError(loginError);
    }
  };

  if (isMobile) {
    return (
      <LoginScreenMobile
        onBack={() => navigate("/")}
        onForgotPassword={() => navigate("/forgot-password")}
        onLogin={handleLogin}
        authError={loginError}
        onClearError={() => setLoginError(null)}
      />
    );
  }

  return (
    <LoginScreen
      onBack={() => navigate("/")}
      onForgotPassword={() => navigate("/forgot-password")}
      onLogin={handleLogin}
      authError={loginError}
      onClearError={() => setLoginError(null)}
    />
  );
}
