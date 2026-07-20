import {
  BasicInfoForm,
  EstablishmentForm,
  PaymentForm,
} from "@/features/rancher-signup";
import { RancherDashboardMobile } from "@/app/components/dashboards-mobile/RancherDashboardMobile";
import { EmpresaDashboardMobile } from "@/app/components/dashboards-mobile/EmpresaDashboardMobile";
import { DriverDashboardMobile } from "@/app/components/dashboards-mobile/DriverDashboardMobile";
import { OwnerOperatorDashboardMobile } from "@/app/components/dashboards-mobile/OwnerOperatorDashboardMobile";
import { WelcomeScreen } from "@/app/components/tropero-v2/WelcomeScreen";
import { LoginScreen } from "@/app/components/tropero-v2/LoginScreen";
import { ForgotPassword } from "@/app/components/tropero-v2/ForgotPassword";
import { ResetPasswordScreen } from "@/app/components/tropero-v2/ResetPassword";
import { VerifyEmailPhone } from "@/app/components/tropero-v2/VerifyEmailPhone";
import { ChooseAccountType } from "@/app/components/tropero-v2/ChooseAccountType";
import { ProductorSignup1Basic } from "@/app/components/tropero-v2/ProductorSignup1Basic";
import { ProductorSignup2Documents } from "@/app/components/tropero-v2/ProductorSignup2Documents";
import { RancherSignup3Payment } from "@/app/components/tropero-v2/RancherSignup3Payment";
import { EmpresaSignup1Basic } from "@/app/components/tropero-v2/EmpresaSignup1Basic";
import { EmpresaSignup2Fleet } from "@/app/components/tropero-v2/EmpresaSignup2Fleet";
import { EmpresaSignup3Documents } from "@/app/components/tropero-v2/EmpresaSignup3Documents";
import { EmpresaSignup4Payment } from "@/app/components/tropero-v2/EmpresaSignup4Payment";
import { EmpresaSignup5PayoutMethod } from "@/app/components/tropero-v2/EmpresaSignup5PayoutMethod";
import { OwnerOperatorSignup1Basic } from "@/app/components/tropero-v2/OwnerOperatorSignup1Basic";
import { OwnerOperatorSignup2Vehicle } from "@/app/components/tropero-v2/OwnerOperatorSignup2Vehicle";
import { OwnerOperatorSignup3Documents } from "@/app/components/tropero-v2/OwnerOperatorSignup3Documents";
import { OwnerOperatorSignup4Payment } from "@/app/components/tropero-v2/OwnerOperatorSignup4Payment";
import { OwnerOperatorSignup5PayoutMethod } from "@/app/components/tropero-v2/OwnerOperatorSignup5PayoutMethod";
import { DriverSignup1Basic } from "@/app/components/tropero-v2/DriverSignup1Basic";
import { DriverSignup2Company } from "@/app/components/tropero-v2/DriverSignup2Company";
import { DriverSignup3Documents } from "@/app/components/tropero-v2/DriverSignup3Documents";
import { DriverAccountPending } from "@/app/components/tropero-v2/DriverAccountPending";
import { AccountReady } from "@/app/components/tropero-v2/AccountReady";
import { AccountPending } from "@/app/components/tropero-v2/AccountPending";
import { AccountRejected } from "@/app/components/tropero-v2/AccountRejected";
// Versiones móviles de los flujos de registro / autenticación
import { WelcomeScreenMobile } from "@/app/components/tropero-v2-mobile/WelcomeScreenMobile";
import { LoginScreenMobile } from "@/app/components/tropero-v2-mobile/LoginScreenMobile";
import { ForgotPasswordMobile } from "@/app/components/tropero-v2-mobile/ForgotPasswordMobile";
import { VerifyEmailPhoneMobile } from "@/app/components/tropero-v2-mobile/VerifyEmailPhoneMobile";
import { ProductorSignup1BasicMobile } from "@/app/components/tropero-v2-mobile/ProductorSignup1BasicMobile";
import { ProductorSignup2DocumentsMobile } from "@/app/components/tropero-v2-mobile/ProductorSignup2DocumentsMobile";
import { RancherSignup4PaymentMobile } from "@/app/components/tropero-v2-mobile/RancherSignup4PaymentMobile";
import { EmpresaSignup1BasicMobile } from "@/app/components/tropero-v2-mobile/EmpresaSignup1BasicMobile";
import { EmpresaSignup2FleetMobile } from "@/app/components/tropero-v2-mobile/EmpresaSignup2FleetMobile";
import { EmpresaSignup3DocumentsMobile } from "@/app/components/tropero-v2-mobile/EmpresaSignup3DocumentsMobile";
import { EmpresaSignup4PaymentMobile } from "@/app/components/tropero-v2-mobile/EmpresaSignup4PaymentMobile";
import { EmpresaSignup5PayoutMethodMobile } from "@/app/components/tropero-v2-mobile/EmpresaSignup5PayoutMethodMobile";
import { OwnerOperatorSignup1BasicMobile } from "@/app/components/tropero-v2-mobile/OwnerOperatorSignup1BasicMobile";
import { OwnerOperatorSignup2VehicleMobile } from "@/app/components/tropero-v2-mobile/OwnerOperatorSignup2VehicleMobile";
import { OwnerOperatorSignup3DocumentsMobile } from "@/app/components/tropero-v2-mobile/OwnerOperatorSignup3DocumentsMobile";
import { OwnerOperatorSignup4PaymentMobile } from "@/app/components/tropero-v2-mobile/OwnerOperatorSignup4PaymentMobile";
import { OwnerOperatorSignup5PayoutMethodMobile } from "@/app/components/tropero-v2-mobile/OwnerOperatorSignup5PayoutMethodMobile";
import { DriverSignup1BasicMobile } from "@/app/components/tropero-v2-mobile/DriverSignup1BasicMobile";
import { DriverSignup2CompanyMobile } from "@/app/components/tropero-v2-mobile/DriverSignup2CompanyMobile";
import { DriverSignup3DocumentsMobile } from "@/app/components/tropero-v2-mobile/DriverSignup3DocumentsMobile";
import { DriverAccountPendingMobile } from "@/app/components/tropero-v2-mobile/DriverAccountPendingMobile";
import { AccountReadyMobile } from "@/app/components/tropero-v2-mobile/AccountReadyMobile";
import { AccountPendingMobile } from "@/app/components/tropero-v2-mobile/AccountPendingMobile";
import { AccountRejectedMobile } from "@/app/components/tropero-v2-mobile/AccountRejectedMobile";
import { RancherDashboard } from "@/app/components/dashboards/RancherDashboard";
import { EmpresaDashboard } from "@/app/components/dashboards/EmpresaDashboard";
import { OwnerOperatorDashboard } from "@/app/components/dashboards/OwnerOperatorDashboard";
import { DriverDashboard } from "@/app/components/dashboards/DriverDashboard";
import { AdminDashboard } from "@/features/admin";
import { CasosBordeView } from "@/app/components/casos-borde/CasosBordeView";
import { ReferralRegistration } from "@/app/components/dashboards/ReferralRegistration";
import { Toaster } from "@/app/components/ui/sonner";
import type { useNavigation } from "./useNavigation";

type NavigationContext = ReturnType<typeof useNavigation>;

export function AppRouter({ nav }: { nav: NavigationContext }) {
  const {
    screen: currentScreen,
    navigate: setCurrentScreen,
    isMobile,
    signupData,
    selectedRole,
    loginError,
    signupError,
    referralParams,
    setSelectedRole,
    setLoginError,
    handleSignup,
    handleLoginClick,
    handleLogin,
    handleEmailPhoneVerified,
    handleForgotPasswordSent,
    handleSelectRole,
    handleRancherStep1Next,
    handleRancherStep2Next,
    handleRancherStep3Next,
    handleProductorStep1Next,
    handleProductorStep2Next,
    handleProductorStep3Next,
    handleEmpresaStep1Next,
    handleEmpresaStep2Next,
    handleEmpresaStep3Next,
    handleEmpresaStep4Next,
    handleEmpresaStep5Next,
    handleOwnerOperatorStep1Next,
    handleOwnerOperatorStep2Next,
    handleOwnerOperatorStep3Next,
    handleOwnerOperatorStep4Next,
    handleOwnerOperatorStep5Next,
    handleDriverStep1Next,
    handleDriverStep2Next,
    handleDriverStep3Next,
    handleGoToDashboard,
    handleLogout,
    handleSkip,
    handleAdminClick,
    handleCasosBordeClick,
    handleDemoAs,
    productorSubTypeLabel,
    dashboardUserName,
    ganaderoAccountInitialData,
  } = nav;

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

      {currentScreen === "reset-password" && (
        <ResetPasswordScreen
          token={new URLSearchParams(window.location.search).get("token")?.trim() || ""}
        />
      )}

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
