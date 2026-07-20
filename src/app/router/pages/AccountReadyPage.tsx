import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/app/components/ui/use-mobile";
import { AccountReady } from "@/app/components/tropero-v2/AccountReady";
import { AccountReadyMobile } from "@/app/components/tropero-v2-mobile/AccountReadyMobile";

export function AccountReadyPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  if (isMobile) {
    return <AccountReadyMobile onGoToDashboard={() => navigate("/dashboard")} />;
  }

  return <AccountReady onGoToDashboard={() => navigate("/dashboard")} />;
}
