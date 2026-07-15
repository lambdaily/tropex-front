import { useState } from "react";
import { useIsMobile } from "./ui/use-mobile";
import { useAuth } from "@/features/auth";
import {
  BasicInfoForm,
  EstablishmentForm,
  PaymentForm,
} from "@/features/rancher-signup";
import { buildGanaderoAccountInitialData } from "@/features/account";
import { RancherDashboardMobile } from "./dashboards-mobile/RancherDashboardMobile";
import { EmpresaDashboardMobile } from "./dashboards-mobile/EmpresaDashboardMobile";
import { DriverDashboardMobile } from "./dashboards-mobile/DriverDashboardMobile";
import { OwnerOperatorDashboardMobile } from "./dashboards-mobile/OwnerOperatorDashboardMobile";
import { WelcomeScreen } from "./tropero-v2/WelcomeScreen";
import { LoginScreen } from "./tropero-v2/LoginScreen";
import { ForgotPassword } from "./tropero-v2/ForgotPassword";
import { VerifyEmailPhone } from "./tropero-v2/VerifyEmailPhone";
import { ChooseAccountType } from "./tropero-v2/ChooseAccountType";
import { ProductorSignup1Basic } from "./tropero-v2/ProductorSignup1Basic";
import { ProductorSignup2Documents } from "./tropero-v2/ProductorSignup2Documents";
import { RancherSignup2Ranch } from "./tropero-v2/RancherSignup2Ranch";
import { RancherSignup3Payment } from "./tropero-v2/RancherSignup3Payment";
import { EmpresaSignup1Basic } from "./tropero-v2/EmpresaSignup1Basic";
import { EmpresaSignup2Fleet } from "./tropero-v2/EmpresaSignup2Fleet";
import { EmpresaSignup3Documents } from "./tropero-v2/EmpresaSignup3Documents";
import { EmpresaSignup4Payment } from "./tropero-v2/EmpresaSignup4Payment";
import { EmpresaSignup5PayoutMethod } from "./tropero-v2/EmpresaSignup5PayoutMethod";
import { OwnerOperatorSignup1Basic } from "./tropero-v2/OwnerOperatorSignup1Basic";
import { OwnerOperatorSignup2Vehicle } from "./tropero-v2/OwnerOperatorSignup2Vehicle";
import { OwnerOperatorSignup3Documents } from "./tropero-v2/OwnerOperatorSignup3Documents";
import { OwnerOperatorSignup4Payment } from "./tropero-v2/OwnerOperatorSignup4Payment";
import { OwnerOperatorSignup5PayoutMethod } from "./tropero-v2/OwnerOperatorSignup5PayoutMethod";
import { DriverSignup1Basic } from "./tropero-v2/DriverSignup1Basic";
import { DriverSignup2Company } from "./tropero-v2/DriverSignup2Company";
import { DriverSignup3Documents } from "./tropero-v2/DriverSignup3Documents";
import { DriverAccountPending } from "./tropero-v2/DriverAccountPending";
import { AccountReady } from "./tropero-v2/AccountReady";
import { AccountPending } from "./tropero-v2/AccountPending";
import { AccountRejected } from "./tropero-v2/AccountRejected";
// Versiones móviles de los flujos de registro / autenticación
import { WelcomeScreenMobile } from "./tropero-v2-mobile/WelcomeScreenMobile";
import { LoginScreenMobile } from "./tropero-v2-mobile/LoginScreenMobile";
import { ForgotPasswordMobile } from "./tropero-v2-mobile/ForgotPasswordMobile";
import { VerifyEmailPhoneMobile } from "./tropero-v2-mobile/VerifyEmailPhoneMobile";
import { ProductorSignup1BasicMobile } from "./tropero-v2-mobile/ProductorSignup1BasicMobile";
import { ProductorSignup2DocumentsMobile } from "./tropero-v2-mobile/ProductorSignup2DocumentsMobile";
import { RancherSignup2RanchMobile } from "./tropero-v2-mobile/RancherSignup2RanchMobile";
import { RancherSignup4PaymentMobile } from "./tropero-v2-mobile/RancherSignup4PaymentMobile";
import { EmpresaSignup1BasicMobile } from "./tropero-v2-mobile/EmpresaSignup1BasicMobile";
import { EmpresaSignup2FleetMobile } from "./tropero-v2-mobile/EmpresaSignup2FleetMobile";
import { EmpresaSignup3DocumentsMobile } from "./tropero-v2-mobile/EmpresaSignup3DocumentsMobile";
import { EmpresaSignup4PaymentMobile } from "./tropero-v2-mobile/EmpresaSignup4PaymentMobile";
import { EmpresaSignup5PayoutMethodMobile } from "./tropero-v2-mobile/EmpresaSignup5PayoutMethodMobile";
import { OwnerOperatorSignup1BasicMobile } from "./tropero-v2-mobile/OwnerOperatorSignup1BasicMobile";
import { OwnerOperatorSignup2VehicleMobile } from "./tropero-v2-mobile/OwnerOperatorSignup2VehicleMobile";
import { OwnerOperatorSignup3DocumentsMobile } from "./tropero-v2-mobile/OwnerOperatorSignup3DocumentsMobile";
import { OwnerOperatorSignup4PaymentMobile } from "./tropero-v2-mobile/OwnerOperatorSignup4PaymentMobile";
import { OwnerOperatorSignup5PayoutMethodMobile } from "./tropero-v2-mobile/OwnerOperatorSignup5PayoutMethodMobile";
import { DriverSignup1BasicMobile } from "./tropero-v2-mobile/DriverSignup1BasicMobile";
import { DriverSignup2CompanyMobile } from "./tropero-v2-mobile/DriverSignup2CompanyMobile";
import { DriverSignup3DocumentsMobile } from "./tropero-v2-mobile/DriverSignup3DocumentsMobile";
import { DriverAccountPendingMobile } from "./tropero-v2-mobile/DriverAccountPendingMobile";
import { AccountReadyMobile } from "./tropero-v2-mobile/AccountReadyMobile";
import { AccountPendingMobile } from "./tropero-v2-mobile/AccountPendingMobile";
import { AccountRejectedMobile } from "./tropero-v2-mobile/AccountRejectedMobile";
import { RancherDashboard } from "./dashboards/RancherDashboard";
import { EmpresaDashboard } from "./dashboards/EmpresaDashboard";
import { OwnerOperatorDashboard } from "./dashboards/OwnerOperatorDashboard";
import { DriverDashboard } from "./dashboards/DriverDashboard";
import { AdminDashboard } from "@/features/admin";
import { CasosBordeView } from "./casos-borde/CasosBordeView";
import { ReferralRegistration } from "./dashboards/ReferralRegistration";
import type { SignupData, ReferralParams } from "../types/signup";
import { Toaster } from "./ui/sonner";

type Screen =
  | "welcome"
  | "login"
  | "forgot-password"
  | "verify-email-phone"
  | "choose-account"
  | "admin"
  | "casos-borde"
  | "referral-registration"
  // Rancher/Ganadero flow
  | "rancher-step1"
  | "rancher-step2"
  | "rancher-step3"
  | "rancher-step4"
  | "shipments-test"
  // Productor (non-Ganadero) flow
  | "productor-step1"
  | "productor-step2"
  | "productor-step3"
  // Empresa flow
  | "empresa-step1"
  | "empresa-step2"
  | "empresa-step3"
  | "empresa-step4"
  | "empresa-step5"
  // Owner-Operator flow
  | "owner-operator-step1"
  | "owner-operator-step2"
  | "owner-operator-step3"
  | "owner-operator-step4"
  | "owner-operator-step5"
  // Driver flow
  | "driver-step1"
  | "driver-step2"
  | "driver-step3"
  | "driver-account-pending"
  | "account-ready"
  | "account-pending"
  | "account-rejected"
  | "dashboard";

export function TroperoApp() {
  const isMobile = useIsMobile();
  const {
    user: authUser,
    error: authError,
    login: authLogin,
    register: authRegister,
    logout: authLogout,
  } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>(() => {
    // Check if we have referral params in URL
    const params = new URLSearchParams(window.location.search);
    if (params.get("trip")) {
      return "referral-registration";
    }
    return "welcome";
  });
  const [signupData, setSignupData] = useState<SignupData>({});
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [referralParams, setReferralParams] = useState<ReferralParams>(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      tripId: params.get("trip") || "",
      referrerName: params.get("referrer") || "",
      remainingHeads: parseInt(params.get("remaining") || "0"),
      cattleType: params.get("cattleType") || "",
    };
  });

  const getAuthErrorMessage = (error: unknown) => {
    if (typeof error === "object" && error !== null) {
      const err = error as Record<string, unknown>;
      if (typeof err.detail === "string") return err.detail;
      if (Array.isArray(err.non_field_errors)) return err.non_field_errors.join("\n");
      if (Array.isArray(err.detail)) return err.detail.join("\n");
      const firstError = Object.values(err)[0];
      if (Array.isArray(firstError)) return firstError.join("\n");
      if (typeof firstError === "string") return firstError;
    }
    return authError || "No pudimos completar el registro. Revisá los datos e intentá de nuevo.";
  };

  const handleSignup = () => {
    setCurrentScreen("choose-account");
  };

  const handleLoginClick = () => {
    setCurrentScreen("login");
  };

  const handleLogin = async (email: string, password: string) => {
    setLoginError(null);
    try {
      const user = await authLogin({ email, password });
      if (user.roles.includes("admin")) {
        setSelectedRole("admin");
        setCurrentScreen("admin");
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
      setCurrentScreen("dashboard");
    } catch {
      setLoginError(authError);
    }
  };

  const handleEmailPhoneVerified = () => {
    if (authUser) {
      const primaryRole = authUser.roles[0] || "ganadero";
      setSelectedRole(primaryRole);
      setSignupData({
        firstName: authUser.first_name,
        email: authUser.email,
        phone: authUser.phone,
      });
    } else {
      setSelectedRole("ganadero");
      setSignupData({
        firstName: "Juan",
        email: "juan@example.com",
        phone: "+595 981 123456",
      });
    }
    setCurrentScreen("dashboard");
  };

  const handleForgotPasswordSent = () => {
    setCurrentScreen("login");
  };

  const handleSelectRole = (role: string) => {
    setSelectedRole(role);
    if (role === "ganadero") {
      setCurrentScreen("rancher-step1");
    } else if (
      role === "frigorifico" ||
      role === "consignataria" ||
      role === "feria-remate" ||
      role === "otro-productor"
    ) {
      setCurrentScreen("productor-step1");
    } else if (role === "empresa") {
      setCurrentScreen("empresa-step1");
    } else if (role === "owner-operator") {
      setCurrentScreen("owner-operator-step1");
    } else if (role === "chofer") {
      setCurrentScreen("driver-step1");
    }
  };

  // Rancher handlers
  const handleRancherStep1Next = async (data: Partial<SignupData>) => {
    setSignupData({ ...signupData, ...data });
    setSignupError(null);
    setCurrentScreen("rancher-step2");
  };

  const handleRancherStep2Next = (data: Partial<SignupData>) => {
    setSignupData({ ...signupData, ...data });
    setSignupError(null);
    setCurrentScreen("rancher-step3");
  };

  const handleRancherStep3Next = async (data: Partial<SignupData>) => {
    const allData = { ...signupData, ...data };
    setSignupData(allData);
    setSignupError(null);
    try {
      await authRegister({
        email: allData.email || "",
        password: allData.password || "",
        password_confirm: allData.passwordConfirm || "",
        first_name: allData.firstName || "",
        last_name: allData.lastName || "",
        phone: allData.phone || "",
        role_slug: "ganadero",
        // Establishment data (step 2)
        establishment_name: allData.establishmentName,
        ruc: allData.ruc,
        legal_name: allData.razonSocial,
        latitude: allData.latitude,
        longitude: allData.longitude,
        department: allData.department,
        city: allData.city,
        frequency: allData.frequency,
        // Payment data (step 3)
        institution_type: allData.institutionType,
        institution: allData.institution,
        account_number: allData.accountNumber,
        account_holder_name: allData.accountHolderName,
        document_type: allData.documentType,
        document_number: allData.documentNumber,
      });
      setCurrentScreen("account-ready");
    } catch (error) {
      setSignupError(getAuthErrorMessage(error));
    }
  };

  // Productor (non-Ganadero) handlers
  const handleProductorStep1Next = async (data: Partial<SignupData>) => {
    setSignupData({ ...signupData, ...data });
    setSignupError(null);
    const subTypeMap: Record<string, string> = {
      frigorifico: "frigorifico",
      consignataria: "consignataria",
      "feria-remate": "feria",
      "otro-productor": "otro",
    };
    try {
      await authRegister({
        email: data.email || "",
        password: data.password || "",
        password_confirm: data.passwordConfirm || "",
        first_name: data.establishmentName || "",
        last_name: "",
        phone: data.phone || "",
        ruc: data.ruc || "",
        legal_name: data.razonSocial || "",
        role_slug: "ganadero",
        sub_type: subTypeMap[selectedRole] || "otro",
      });
      setCurrentScreen("productor-step2");
    } catch {
      setSignupError(authError);
    }
  };

  const handleProductorStep2Next = () => {
    setCurrentScreen("productor-step3");
  };

  const handleProductorStep3Next = (data: Partial<SignupData>) => {
    setSignupData({ ...signupData, ...data });
    setCurrentScreen("account-ready");
  };

  // Empresa handlers
  const handleEmpresaStep1Next = async (data: Partial<SignupData>) => {
    setSignupData({ ...signupData, ...data });
    setSignupError(null);
    try {
      await authRegister({
        email: data.email || "",
        password: data.password || "",
        password_confirm: data.passwordConfirm || "",
        first_name: data.companyName || "",
        last_name: "",
        phone: data.contactPhone || "",
        ruc: data.ruc || "",
        legal_name: data.razonSocial || "",
        role_slug: "empresa",
      });
      setCurrentScreen("empresa-step2");
    } catch {
      setSignupError(authError);
    }
  };

  const handleEmpresaStep2Next = (data: Partial<SignupData>) => {
    setSignupData({ ...signupData, ...data });
    setCurrentScreen("empresa-step3");
  };

  const handleEmpresaStep3Next = () => {
    setCurrentScreen("empresa-step4");
  };

  const handleEmpresaStep4Next = () => {
    setCurrentScreen("empresa-step5");
  };

  const handleEmpresaStep5Next = () => {
    setCurrentScreen("account-ready");
  };

  // Owner-Operator handlers
  const handleOwnerOperatorStep1Next = async (data: Partial<SignupData>) => {
    setSignupData({ ...signupData, ...data });
    setSignupError(null);
    const nameParts = (data.fullName || "").split(" ");
    try {
      await authRegister({
        email: data.email || "",
        password: data.password || "",
        password_confirm: data.passwordConfirm || "",
        first_name: nameParts[0] || "",
        last_name: nameParts.slice(1).join(" ") || "",
        phone: data.phone || "",
        cedula: data.idNumber || "",
        ruc: data.ruc || "",
        role_slug: "owner-operator",
      });
      setCurrentScreen("owner-operator-step2");
    } catch {
      setSignupError(authError);
    }
  };

  const handleOwnerOperatorStep2Next = (data: Partial<SignupData>) => {
    setSignupData({ ...signupData, ...data });
    setCurrentScreen("owner-operator-step3");
  };

  const handleOwnerOperatorStep3Next = () => {
    setCurrentScreen("owner-operator-step4");
  };

  const handleOwnerOperatorStep4Next = () => {
    setCurrentScreen("owner-operator-step5");
  };

  const handleOwnerOperatorStep5Next = () => {
    setCurrentScreen("account-ready");
  };

  // Driver handlers
  const handleDriverStep1Next = async (data: Partial<SignupData>) => {
    setSignupData({ ...signupData, ...data });
    setSignupError(null);
    const nameParts = (data.fullName || "").split(" ");
    try {
      await authRegister({
        email: data.email || "",
        password: data.password || "",
        password_confirm: data.passwordConfirm || "",
        first_name: nameParts[0] || "",
        last_name: nameParts.slice(1).join(" ") || "",
        phone: data.phone || "",
        cedula: data.idNumber || "",
        role_slug: "chofer",
      });
      setCurrentScreen("driver-step2");
    } catch {
      setSignupError(authError);
    }
  };

  const handleDriverStep2Next = (data: Partial<SignupData>) => {
    setSignupData({ ...signupData, ...data });
    setCurrentScreen("driver-step3");
  };

  const handleDriverStep3Next = () => {
    setCurrentScreen("driver-account-pending");
  };

  const handleGoToDashboard = () => {
    setCurrentScreen("dashboard");
  };

  const handleLogout = async () => {
    await authLogout();
    setCurrentScreen("welcome");
    setSignupData({});
    setSelectedRole("");
  };

  const handleSkip = () => {
    setCurrentScreen("account-ready");
  };

  const handleAdminClick = () => {
    setSelectedRole("admin");
    setCurrentScreen("admin");
  };

  const handleCasosBordeClick = () => {
    setCurrentScreen("casos-borde");
  };

  const handleDemoAs = (role: string) => {
    setSelectedRole(role);
    setSignupData({
      firstName: "Demo",
      fullName: "Demo Usuario",
      companyName: "Demo Empresa",
    });
    setCurrentScreen("dashboard");
  };

  const productorSubTypeLabel = (role: string) => {
    if (role === "frigorifico") return "Frigorífico";
    if (role === "consignataria") return "Consignataria";
    if (role === "feria-remate") return "Feria / Remate";
    if (role === "otro-productor") return "Otro Productor";
    return "Ganadero";
  };

  const dashboardUserName =
    signupData.firstName ||
    signupData.fullName ||
    signupData.companyName ||
    signupData.establishmentName ||
    authUser?.first_name ||
    "Usuario";

  const ganaderoAccountInitialData = buildGanaderoAccountInitialData({
    user: authUser,
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

  return (
    <>
      <Toaster theme="light" position="top-center" richColors closeButton />
      {/* Demo role switcher — floating pill, always visible for testing (z alto: nunca tapado) */}
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
                selectedRole === role && currentScreen === "dashboard"
                  ? "opacity-100 text-white"
                  : "opacity-70 hover:opacity-100 bg-white text-gray-800"
              }`}
              style={
                selectedRole === role && currentScreen === "dashboard"
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
          onClick={handleAdminClick}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg transition-opacity ${
            currentScreen === "admin"
              ? "opacity-100 text-white"
              : "opacity-70 hover:opacity-100 bg-white text-gray-800"
          }`}
          style={
            currentScreen === "admin" ? { backgroundColor: "#08221A" } : {}
          }
        >
          Admin TROPEX
        </button>
      </div>
      {currentScreen === "referral-registration" && (
        <ReferralRegistration
          tripId={referralParams.tripId}
          referrerName={referralParams.referrerName}
          remainingHeads={referralParams.remainingHeads}
          cattleType={referralParams.cattleType}
          onComplete={() => {
            setSelectedRole("owner-operator");
            setCurrentScreen("dashboard");
          }}
        />
      )}


      {currentScreen === "welcome" &&
        (isMobile ? (
          <WelcomeScreenMobile
            onSignup={handleSignup}
            onLogin={handleLoginClick}
          />
        ) : (
          <WelcomeScreen
            onSignup={handleSignup}
            onLogin={handleLoginClick}
            onAdminClick={handleAdminClick}
            onCasosBordeClick={handleCasosBordeClick}
          />
        ))}

      {currentScreen === "login" &&
        (isMobile ? (
          <LoginScreenMobile
            onBack={() => setCurrentScreen("welcome")}
            onForgotPassword={() => setCurrentScreen("forgot-password")}
            onLogin={handleLogin}
            authError={loginError}
            onClearError={() => setLoginError(null)}
          />
        ) : (
          <LoginScreen
            onBack={() => setCurrentScreen("welcome")}
            onForgotPassword={() => setCurrentScreen("forgot-password")}
            onLogin={handleLogin}
            authError={loginError}
            onClearError={() => setLoginError(null)}
          />
        ))}

      {currentScreen === "forgot-password" &&
        (isMobile ? (
          <ForgotPasswordMobile
            onBack={() => setCurrentScreen("login")}
            onResetSent={handleForgotPasswordSent}
          />
        ) : (
          <ForgotPassword
            onBack={() => setCurrentScreen("login")}
            onResetSent={handleForgotPasswordSent}
          />
        ))}

      {currentScreen === "verify-email-phone" &&
        (isMobile ? (
          <VerifyEmailPhoneMobile
            email={signupData.email}
            phone={signupData.phone}
            onBack={() => setCurrentScreen("login")}
            onVerified={handleEmailPhoneVerified}
          />
        ) : (
          <VerifyEmailPhone
            email={signupData.email}
            phone={signupData.phone}
            onBack={() => setCurrentScreen("login")}
            onVerified={handleEmailPhoneVerified}
          />
        ))}

      {currentScreen === "choose-account" &&
        <ChooseAccountType
          onSelectRole={handleSelectRole}
          onBack={() => setCurrentScreen("welcome")}
        />}

      {/* Rancher/Ganadero Flow */}
      {currentScreen === "rancher-step1" && (
        <BasicInfoForm
          onNext={handleRancherStep1Next}
          onSkip={handleSkip}
          onBack={() => setCurrentScreen("choose-account")}
          initialData={signupData}
          signupError={signupError}
        />
      )}

      {currentScreen === "rancher-step2" && (
        <EstablishmentForm
          onNext={handleRancherStep2Next}
          onSkip={handleSkip}
          onBack={() => setCurrentScreen("rancher-step1")}
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
      )}

      {currentScreen === "rancher-step3" && (
        <PaymentForm
          onNext={handleRancherStep3Next}
          onSkip={handleSkip}
          onBack={() => setCurrentScreen("rancher-step2")}
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
      )}

      {/* Productor (non-Ganadero) Flow */}
      {currentScreen === "productor-step1" &&
        (isMobile ? (
          <ProductorSignup1BasicMobile
            onNext={handleProductorStep1Next}
            onSkip={handleSkip}
            onBack={() => setCurrentScreen("choose-account")}
            subTypeLabel={productorSubTypeLabel(selectedRole)}

          />
        ) : (
          <ProductorSignup1Basic
            onNext={handleProductorStep1Next}
            onSkip={handleSkip}
            onBack={() => setCurrentScreen("choose-account")}
            subTypeLabel={productorSubTypeLabel(selectedRole)}

          />
        ))}

      {currentScreen === "productor-step2" &&
        (isMobile ? (
          <ProductorSignup2DocumentsMobile
            onNext={handleProductorStep2Next}
            onSkip={handleSkip}
            onBack={() => setCurrentScreen("productor-step1")}
            subTypeLabel={productorSubTypeLabel(selectedRole)}
          />
        ) : (
          <ProductorSignup2Documents
            onNext={handleProductorStep2Next}
            onSkip={handleSkip}
            onBack={() => setCurrentScreen("productor-step1")}
            subTypeLabel={productorSubTypeLabel(selectedRole)}
          />
        ))}

      {currentScreen === "productor-step3" &&
        (isMobile ? (
          <RancherSignup4PaymentMobile
            onNext={() => handleProductorStep3Next({})}
            onSkip={handleSkip}
            onBack={() => setCurrentScreen("productor-step2")}
          />
        ) : (
          <RancherSignup3Payment
            onNext={handleProductorStep3Next}
            onSkip={handleSkip}
            onBack={() => setCurrentScreen("productor-step2")}
          />
        ))}

      {/* Empresa Flow */}
      {currentScreen === "empresa-step1" &&
        (isMobile ? (
          <EmpresaSignup1BasicMobile
            onNext={handleEmpresaStep1Next}
            onSkip={handleSkip}
            onBack={() => setCurrentScreen("choose-account")}

          />
        ) : (
          <EmpresaSignup1Basic
            onNext={handleEmpresaStep1Next}
            onSkip={handleSkip}
            onBack={() => setCurrentScreen("choose-account")}

          />
        ))}

      {currentScreen === "empresa-step2" &&
        (isMobile ? (
          <EmpresaSignup2FleetMobile
            onNext={handleEmpresaStep2Next}
            onSkip={handleSkip}
            onBack={() => setCurrentScreen("empresa-step1")}
          />
        ) : (
          <EmpresaSignup2Fleet
            onNext={handleEmpresaStep2Next}
            onSkip={handleSkip}
            onBack={() => setCurrentScreen("empresa-step1")}
          />
        ))}

      {currentScreen === "empresa-step3" &&
        (isMobile ? (
          <EmpresaSignup3DocumentsMobile
            onNext={handleEmpresaStep3Next}
            onSkip={handleSkip}
            onBack={() => setCurrentScreen("empresa-step2")}
          />
        ) : (
          <EmpresaSignup3Documents
            onNext={handleEmpresaStep3Next}
            onSkip={handleSkip}
            onBack={() => setCurrentScreen("empresa-step2")}
          />
        ))}

      {currentScreen === "empresa-step4" &&
        (isMobile ? (
          <EmpresaSignup4PaymentMobile
            onNext={handleEmpresaStep4Next}
            onSkip={handleSkip}
            onBack={() => setCurrentScreen("empresa-step3")}
          />
        ) : (
          <EmpresaSignup4Payment
            onNext={handleEmpresaStep4Next}
            onSkip={handleSkip}
            onBack={() => setCurrentScreen("empresa-step3")}
          />
        ))}

      {currentScreen === "empresa-step5" &&
        (isMobile ? (
          <EmpresaSignup5PayoutMethodMobile
            onNext={handleEmpresaStep5Next}
            onSkip={handleSkip}
            onBack={() => setCurrentScreen("empresa-step4")}
          />
        ) : (
          <EmpresaSignup5PayoutMethod
            onNext={handleEmpresaStep5Next}
            onSkip={handleSkip}
            onBack={() => setCurrentScreen("empresa-step4")}
          />
        ))}

      {/* Owner-Operator Flow */}
      {currentScreen === "owner-operator-step1" &&
        (isMobile ? (
          <OwnerOperatorSignup1BasicMobile
            onNext={handleOwnerOperatorStep1Next}
            onSkip={handleSkip}
            onBack={() => setCurrentScreen("choose-account")}

          />
        ) : (
          <OwnerOperatorSignup1Basic
            onNext={handleOwnerOperatorStep1Next}
            onSkip={handleSkip}
            onBack={() => setCurrentScreen("choose-account")}
            signupError={signupError}
          />
        ))}

      {currentScreen === "owner-operator-step2" &&
        (isMobile ? (
          <OwnerOperatorSignup2VehicleMobile
            onNext={handleOwnerOperatorStep2Next}
            onSkip={handleSkip}
            onBack={() => setCurrentScreen("owner-operator-step1")}
          />
        ) : (
          <OwnerOperatorSignup2Vehicle
            onNext={handleOwnerOperatorStep2Next}
            onSkip={handleSkip}
            onBack={() => setCurrentScreen("owner-operator-step1")}
          />
        ))}

      {currentScreen === "owner-operator-step3" &&
        (isMobile ? (
          <OwnerOperatorSignup3DocumentsMobile
            onNext={handleOwnerOperatorStep3Next}
            onSkip={handleSkip}
            onBack={() => setCurrentScreen("owner-operator-step2")}
          />
        ) : (
          <OwnerOperatorSignup3Documents
            onNext={handleOwnerOperatorStep3Next}
            onSkip={handleSkip}
            onBack={() => setCurrentScreen("owner-operator-step2")}
          />
        ))}

      {currentScreen === "owner-operator-step4" &&
        (isMobile ? (
          <OwnerOperatorSignup4PaymentMobile
            onNext={handleOwnerOperatorStep4Next}
            onSkip={handleSkip}
            onBack={() => setCurrentScreen("owner-operator-step3")}
          />
        ) : (
          <OwnerOperatorSignup4Payment
            onNext={handleOwnerOperatorStep4Next}
            onSkip={handleSkip}
            onBack={() => setCurrentScreen("owner-operator-step3")}
          />
        ))}

      {currentScreen === "owner-operator-step5" &&
        (isMobile ? (
          <OwnerOperatorSignup5PayoutMethodMobile
            onNext={handleOwnerOperatorStep5Next}
            onSkip={handleSkip}
            onBack={() => setCurrentScreen("owner-operator-step4")}
          />
        ) : (
          <OwnerOperatorSignup5PayoutMethod
            onNext={handleOwnerOperatorStep5Next}
            onSkip={handleSkip}
            onBack={() => setCurrentScreen("owner-operator-step4")}
          />
        ))}

      {/* Driver Flow */}
      {currentScreen === "driver-step1" &&
        (isMobile ? (
          <DriverSignup1BasicMobile
            onNext={handleDriverStep1Next}
            onSkip={handleSkip}
            onBack={() => setCurrentScreen("choose-account")}

          />
        ) : (
          <DriverSignup1Basic
            onNext={handleDriverStep1Next}
            onSkip={handleSkip}
            onBack={() => setCurrentScreen("choose-account")}
            signupError={signupError}
          />
        ))}

      {currentScreen === "driver-step2" &&
        (isMobile ? (
          <DriverSignup2CompanyMobile
            onNext={handleDriverStep2Next}
            onSkip={handleSkip}
            onBack={() => setCurrentScreen("driver-step1")}
          />
        ) : (
          <DriverSignup2Company
            onNext={handleDriverStep2Next}
            onSkip={handleSkip}
            onBack={() => setCurrentScreen("driver-step1")}
          />
        ))}

      {currentScreen === "driver-step3" &&
        (isMobile ? (
          <DriverSignup3DocumentsMobile
            onNext={handleDriverStep3Next}
            onSkip={handleSkip}
            onBack={() => setCurrentScreen("driver-step2")}
          />
        ) : (
          <DriverSignup3Documents
            onNext={handleDriverStep3Next}
            onSkip={handleSkip}
            onBack={() => setCurrentScreen("driver-step2")}
          />
        ))}

      {currentScreen === "driver-account-pending" &&
        (isMobile ? (
          <DriverAccountPendingMobile onGoToDashboard={handleGoToDashboard} />
        ) : (
          <DriverAccountPending onGoToDashboard={handleGoToDashboard} />
        ))}

      {currentScreen === "account-ready" &&
        (isMobile ? (
          <AccountReadyMobile onGoToDashboard={handleGoToDashboard} />
        ) : (
          <AccountReady onGoToDashboard={handleGoToDashboard} />
        ))}

      {currentScreen === "account-pending" &&
        (isMobile ? (
          <AccountPendingMobile
            userName={
              signupData.firstName ||
              signupData.fullName ||
              signupData.companyName ||
              "Usuario"
            }
            userRole={selectedRole}
            onLogout={handleLogout}
          />
        ) : (
          <AccountPending
            userName={
              signupData.firstName ||
              signupData.fullName ||
              signupData.companyName ||
              "Usuario"
            }
            userRole={selectedRole}
            onLogout={handleLogout}
          />
        ))}

      {currentScreen === "account-rejected" &&
        (isMobile ? (
          <AccountRejectedMobile
            userName={
              signupData.firstName ||
              signupData.fullName ||
              signupData.companyName ||
              "Usuario"
            }
            userRole={selectedRole}
            rejectionReason="Los documentos proporcionados no son legibles. Por favor, subí imágenes más claras."
            onResubmit={() => {
              if (selectedRole === "ganadero")
                setCurrentScreen("rancher-step3");
              else if (selectedRole === "empresa")
                setCurrentScreen("empresa-step3");
              else if (selectedRole === "owner-operator")
                setCurrentScreen("owner-operator-step3");
              else if (selectedRole === "chofer")
                setCurrentScreen("driver-step3");
            }}
            onLogout={handleLogout}
          />
        ) : (
          <AccountRejected
            userName={
              signupData.firstName ||
              signupData.fullName ||
              signupData.companyName ||
              "Usuario"
            }
            userRole={selectedRole}
            rejectionReason="Los documentos proporcionados no son legibles. Por favor, subí imágenes más claras."
            onResubmit={() => {
              // Volver al paso de documentos según el rol
              if (selectedRole === "ganadero")
                setCurrentScreen("rancher-step3");
              else if (selectedRole === "empresa")
                setCurrentScreen("empresa-step3");
              else if (selectedRole === "owner-operator")
                setCurrentScreen("owner-operator-step3");
              else if (selectedRole === "chofer")
                setCurrentScreen("driver-step3");
            }}
            onLogout={handleLogout}
          />
        ))}

      {currentScreen === "dashboard" && (
        <>
          {selectedRole === "ganadero" &&
            (isMobile ? (
              <RancherDashboardMobile
                userName={dashboardUserName}
                onLogout={handleLogout}
                accountInitialData={ganaderoAccountInitialData}
              />
            ) : (
              <RancherDashboard
                userName={dashboardUserName}
                onLogout={handleLogout}
                accountInitialData={ganaderoAccountInitialData}
              />
            ))}
          {(selectedRole === "frigorifico" ||
            selectedRole === "consignataria" ||
            selectedRole === "feria-remate" ||
            selectedRole === "otro-productor") &&
            (isMobile ? (
              <RancherDashboardMobile
                userName={dashboardUserName}
                onLogout={handleLogout}
                subTypeLabel={productorSubTypeLabel(selectedRole)}
                accountInitialData={ganaderoAccountInitialData}
              />
            ) : (
              <RancherDashboard
                userName={dashboardUserName}
                onLogout={handleLogout}
                subTypeLabel={productorSubTypeLabel(selectedRole)}
                accountInitialData={ganaderoAccountInitialData}
              />
            ))}
          {selectedRole === "empresa" &&
            (isMobile ? (
              <EmpresaDashboardMobile
                userName={dashboardUserName}
                onLogout={handleLogout}
              />
            ) : (
              <EmpresaDashboard
                userName={dashboardUserName}
                onLogout={handleLogout}
              />
            ))}
          {selectedRole === "owner-operator" &&
            (isMobile ? (
              <OwnerOperatorDashboardMobile
                userName={dashboardUserName}
                onLogout={handleLogout}
              />
            ) : (
              <OwnerOperatorDashboard
                userName={dashboardUserName}
                onLogout={handleLogout}
              />
            ))}
          {selectedRole === "chofer" &&
            (isMobile ? (
              <DriverDashboardMobile
                userName={dashboardUserName}
                onLogout={handleLogout}
              />
            ) : (
              <DriverDashboard
                userName={dashboardUserName}
                onLogout={handleLogout}
              />
            ))}
          {!selectedRole && (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  No se detectó un rol de usuario
                </p>
                <button
                  onClick={() => setCurrentScreen("welcome")}
                  className="px-4 py-2 bg-black text-white rounded-lg"
                >
                  Volver al inicio
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {currentScreen === "admin" && <AdminDashboard onLogout={handleLogout} />}

      {currentScreen === "casos-borde" && (
        <CasosBordeView onBack={handleLogout} />
      )}
    </>
  );
}
