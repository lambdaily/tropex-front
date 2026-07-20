import { useSearchParams } from "react-router-dom";
import { ResetPasswordScreen } from "@/app/components/tropero-v2/ResetPassword";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token")?.trim() || "";

  return <ResetPasswordScreen token={token} />;
}
