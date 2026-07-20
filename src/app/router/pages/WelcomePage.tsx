import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/app/components/ui/use-mobile";
import { WelcomeScreen } from "@/app/components/tropero-v2/WelcomeScreen";
import { WelcomeScreenMobile } from "@/app/components/tropero-v2-mobile/WelcomeScreenMobile";

export function WelcomePage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <WelcomeScreenMobile
        onSignup={() => navigate("/register")}
        onLogin={() => navigate("/login")}
      />
    );
  }

  return (
    <WelcomeScreen
      onSignup={() => navigate("/register")}
      onLogin={() => navigate("/login")}
      onAdminClick={() => navigate("/admin")}
      onCasosBordeClick={() => navigate("/casos-borde")}
    />
  );
}
