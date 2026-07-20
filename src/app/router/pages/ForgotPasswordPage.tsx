import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/app/components/ui/use-mobile";
import { ForgotPassword } from "@/app/components/tropero-v2/ForgotPassword";
import { ForgotPasswordMobile } from "@/app/components/tropero-v2-mobile/ForgotPasswordMobile";

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <ForgotPasswordMobile
        onBack={() => navigate("/login")}
        onResetSent={() => navigate("/login")}
      />
    );
  }

  return (
    <ForgotPassword
      onBack={() => navigate("/login")}
      onResetSent={() => navigate("/login")}
    />
  );
}
