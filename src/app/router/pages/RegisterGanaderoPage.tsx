import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { useSignupStore } from "../signupStore";
import {
  BasicInfoForm,
  EstablishmentForm,
  PaymentForm,
} from "@/features/rancher-signup";

function getAuthErrorMessage(error: unknown, fallback: string | null): string {
  if (typeof error === "object" && error !== null) {
    const err = error as Record<string, unknown>;
    if (typeof err.detail === "string") return err.detail;
    if (Array.isArray(err.non_field_errors)) return err.non_field_errors.join("\n");
    if (Array.isArray(err.detail)) return err.detail.join("\n");
    const firstError = Object.values(err)[0];
    if (Array.isArray(firstError)) return firstError.join("\n");
    if (typeof firstError === "string") return firstError;
  }
  return fallback || "No pudimos completar el registro. Revisá los datos e intentá de nuevo.";
}

export function RegisterGanaderoPage() {
  const { step } = useParams<{ step: string }>();
  const navigate = useNavigate();
  const { register } = useAuth();
  const { signupData, setSignupData, signupError, setSignupError } = useSignupStore();

  const handleSkip = () => navigate("/account/ready");

  if (step === "1") {
    return (
      <BasicInfoForm
        onNext={(data) => {
          setSignupData(data);
          setSignupError(null);
          navigate("/register/ganadero/2");
        }}
        onSkip={handleSkip}
        onBack={() => navigate("/register")}
        initialData={signupData}
        signupError={signupError}
      />
    );
  }

  if (step === "2") {
    return (
      <EstablishmentForm
        onNext={(data) => {
          setSignupData(data);
          setSignupError(null);
          navigate("/register/ganadero/3");
        }}
        onSkip={handleSkip}
        onBack={() => navigate("/register/ganadero/1")}
        initialData={{
          establishmentName: signupData.establishmentName,
          ruc: signupData.ruc,
          razonSocial: signupData.razonSocial,
          latitude: signupData.latitude as string | undefined,
          longitude: signupData.longitude as string | undefined,
          department: signupData.department,
          city: signupData.city,
          frequency: signupData.frequency,
        }}
        signupError={signupError}
      />
    );
  }

  if (step === "3") {
    return (
      <PaymentForm
        onNext={async (data) => {
          const allData = { ...signupData, ...data };
          setSignupData(allData);
          setSignupError(null);
          try {
            await register({
              email: allData.email || "",
              password: allData.password || "",
              password_confirm: allData.passwordConfirm || "",
              first_name: allData.firstName || "",
              last_name: allData.lastName || "",
              phone: allData.phone || "",
              role_slug: "ganadero",
              establishment_name: allData.establishmentName,
              ruc: allData.ruc,
              legal_name: allData.razonSocial,
              latitude: allData.latitude,
              longitude: allData.longitude,
              department: allData.department,
              city: allData.city,
              frequency: allData.frequency,
              institution_type: allData.institutionType,
              institution: allData.institution,
              account_number: allData.accountNumber,
              account_holder_name: allData.accountHolderName,
              document_type: allData.documentType,
              document_number: allData.documentNumber,
            });
            navigate("/account/ready");
          } catch (error) {
            setSignupError(getAuthErrorMessage(error, null));
          }
        }}
        onSkip={handleSkip}
        onBack={() => navigate("/register/ganadero/2")}
        initialData={{
          institutionType: signupData.institutionType,
          institution: signupData.institution,
          accountNumber: signupData.accountNumber,
          accountHolderName: signupData.accountHolderName,
          documentType: signupData.documentType,
          documentNumber: signupData.documentNumber,
        }}
        signupError={signupError}
      />
    );
  }

  // Fallback
  return null;
}
