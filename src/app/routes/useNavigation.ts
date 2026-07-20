import { useState } from "react";
import { useAuth } from "@/features/auth";
import { useIsMobile } from "@/app/components/ui/use-mobile";
import { buildGanaderoAccountInitialData } from "@/features/account";
import type { SignupData, ReferralParams } from "@/app/types/signup";
import type { Screen } from "./types";

export function useNavigation() {
  const isMobile = useIsMobile();
  const { user: authUser, error: authError, login: authLogin, register: authRegister, logout: authLogout } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>(() => {
    if (window.location.pathname === "/reset-password") return "reset-password";
    const params = new URLSearchParams(window.location.search);
    return params.get("trip") ? "referral-registration" : "welcome";
  });
  const [signupData, setSignupData] = useState<SignupData>({});
  const [selectedRole, setSelectedRole] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [referralParams, setReferralParams] = useState<ReferralParams>(() => {
    const params = new URLSearchParams(window.location.search);
    return { tripId: params.get("trip") || "", referrerName: params.get("referrer") || "", remainingHeads: parseInt(params.get("remaining") || "0"), cattleType: params.get("cattleType") || "" };
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
  const handleSignup = () => setCurrentScreen("choose-account");
  const handleLoginClick = () => setCurrentScreen("login");
  const handleLogin = async (email: string, password: string) => {
    setLoginError(null);
    try {
      const user = await authLogin({ email, password });
      if (user.roles.includes("admin")) { setSelectedRole("admin"); setCurrentScreen("admin"); return; }
      if (user.roles.length > 0) { setSelectedRole(user.roles[0]); setSignupData({ firstName: user.first_name, email: user.email, phone: user.phone }); }
      setCurrentScreen("dashboard");
    } catch { setLoginError(authError); }
  };
  const handleEmailPhoneVerified = () => {
    if (authUser) { const primaryRole = authUser.roles[0] || "ganadero"; setSelectedRole(primaryRole); setSignupData({ firstName: authUser.first_name, email: authUser.email, phone: authUser.phone }); }
    else { setSelectedRole("ganadero"); setSignupData({ firstName: "Juan", email: "juan@example.com", phone: "+595 981 123456" }); }
    setCurrentScreen("dashboard");
  };
  const handleForgotPasswordSent = () => setCurrentScreen("login");
  const handleSelectRole = (role: string) => {
    setSelectedRole(role);
    if (role === "ganadero") setCurrentScreen("rancher-step1");
    else if (["frigorifico", "consignataria", "feria-remate", "otro-productor"].includes(role)) setCurrentScreen("productor-step1");
    else if (role === "empresa") setCurrentScreen("empresa-step1");
    else if (role === "owner-operator") setCurrentScreen("owner-operator-step1");
    else if (role === "chofer") setCurrentScreen("driver-step1");
  };
  const handleRancherStep1Next = async (data: Partial<SignupData>) => { setSignupData({ ...signupData, ...data }); setSignupError(null); setCurrentScreen("rancher-step2"); };
  const handleRancherStep2Next = (data: Partial<SignupData>) => { setSignupData({ ...signupData, ...data }); setSignupError(null); setCurrentScreen("rancher-step3"); };
  const handleRancherStep3Next = async (data: Partial<SignupData>) => {
    const allData = { ...signupData, ...data }; setSignupData(allData); setSignupError(null);
    try {
      await authRegister({ email: allData.email || "", password: allData.password || "", password_confirm: allData.passwordConfirm || "", first_name: allData.firstName || "", last_name: allData.lastName || "", phone: allData.phone || "", role_slug: "ganadero", establishment_name: allData.establishmentName, ruc: allData.ruc, legal_name: allData.razonSocial, latitude: allData.latitude, longitude: allData.longitude, department: allData.department, city: allData.city, frequency: allData.frequency, institution_type: allData.institutionType, institution: allData.institution, account_number: allData.accountNumber, account_holder_name: allData.accountHolderName, document_type: allData.documentType, document_number: allData.documentNumber });
      setCurrentScreen("account-ready");
    } catch (error) { setSignupError(getAuthErrorMessage(error)); }
  };
  const handleProductorStep1Next = async (data: Partial<SignupData>) => {
    setSignupData({ ...signupData, ...data }); setSignupError(null);
    const subTypeMap: Record<string, string> = { frigorifico: "frigorifico", consignataria: "consignataria", "feria-remate": "feria", "otro-productor": "otro" };
    try { await authRegister({ email: data.email || "", password: data.password || "", password_confirm: data.passwordConfirm || "", first_name: data.establishmentName || "", last_name: "", phone: data.phone || "", ruc: data.ruc || "", legal_name: data.razonSocial || "", role_slug: "ganadero", sub_type: subTypeMap[selectedRole] || "otro" }); setCurrentScreen("productor-step2"); } catch { setSignupError(authError); }
  };
  const handleProductorStep2Next = () => setCurrentScreen("productor-step3");
  const handleProductorStep3Next = (data: Partial<SignupData>) => { setSignupData({ ...signupData, ...data }); setCurrentScreen("account-ready"); };
  const handleEmpresaStep1Next = async (data: Partial<SignupData>) => {
    setSignupData({ ...signupData, ...data }); setSignupError(null);
    try { await authRegister({ email: data.email || "", password: data.password || "", password_confirm: data.passwordConfirm || "", first_name: data.companyName || "", last_name: "", phone: data.contactPhone || "", ruc: data.ruc || "", legal_name: data.razonSocial || "", role_slug: "empresa" }); setCurrentScreen("empresa-step2"); } catch { setSignupError(authError); }
  };
  const handleEmpresaStep2Next = (data: Partial<SignupData>) => { setSignupData({ ...signupData, ...data }); setCurrentScreen("empresa-step3"); };
  const handleEmpresaStep3Next = () => setCurrentScreen("empresa-step4");
  const handleEmpresaStep4Next = () => setCurrentScreen("empresa-step5");
  const handleEmpresaStep5Next = () => setCurrentScreen("account-ready");
  const registerPerson = async (data: Partial<SignupData>, role_slug: "owner-operator" | "chofer", next: Screen) => {
    setSignupData({ ...signupData, ...data }); setSignupError(null); const nameParts = (data.fullName || "").split(" ");
    try { await authRegister({ email: data.email || "", password: data.password || "", password_confirm: data.passwordConfirm || "", first_name: nameParts[0] || "", last_name: nameParts.slice(1).join(" ") || "", phone: data.phone || "", cedula: data.idNumber || "", ruc: role_slug === "owner-operator" ? data.ruc || "" : undefined, role_slug }); setCurrentScreen(next); } catch { setSignupError(authError); }
  };
  const handleOwnerOperatorStep1Next = (data: Partial<SignupData>) => registerPerson(data, "owner-operator", "owner-operator-step2");
  const handleOwnerOperatorStep2Next = (data: Partial<SignupData>) => { setSignupData({ ...signupData, ...data }); setCurrentScreen("owner-operator-step3"); };
  const handleOwnerOperatorStep3Next = () => setCurrentScreen("owner-operator-step4");
  const handleOwnerOperatorStep4Next = () => setCurrentScreen("owner-operator-step5");
  const handleOwnerOperatorStep5Next = () => setCurrentScreen("account-ready");
  const handleDriverStep1Next = (data: Partial<SignupData>) => registerPerson(data, "chofer", "driver-step2");
  const handleDriverStep2Next = (data: Partial<SignupData>) => { setSignupData({ ...signupData, ...data }); setCurrentScreen("driver-step3"); };
  const handleDriverStep3Next = () => setCurrentScreen("driver-account-pending");
  const handleGoToDashboard = () => setCurrentScreen("dashboard");
  const handleLogout = async () => { await authLogout(); setCurrentScreen("welcome"); setSignupData({}); setSelectedRole(""); };
  const handleSkip = () => setCurrentScreen("account-ready");
  const handleAdminClick = () => { setSelectedRole("admin"); setCurrentScreen("admin"); };
  const handleCasosBordeClick = () => setCurrentScreen("casos-borde");
  const handleDemoAs = (role: string) => { setSelectedRole(role); setSignupData({ firstName: "Demo", fullName: "Demo Usuario", companyName: "Demo Empresa" }); setCurrentScreen("dashboard"); };
  const productorSubTypeLabel = (role: string) => role === "frigorifico" ? "Frigorífico" : role === "consignataria" ? "Consignataria" : role === "feria-remate" ? "Feria / Remate" : role === "otro-productor" ? "Otro Productor" : "Ganadero";
  const dashboardUserName = signupData.firstName || signupData.fullName || signupData.companyName || signupData.establishmentName || authUser?.first_name || "Usuario";
  const ganaderoAccountInitialData = buildGanaderoAccountInitialData({ user: authUser, signupData: { firstName: signupData.firstName, fullName: signupData.fullName, email: signupData.email, phone: signupData.phone, establishmentName: signupData.establishmentName, ruc: signupData.ruc, razonSocial: signupData.razonSocial, department: signupData.department, city: signupData.city, institution: signupData.institution, accountNumber: signupData.accountNumber }, fallbackName: dashboardUserName });

  return { screen: currentScreen, navigate: setCurrentScreen, isMobile, signupData, setSignupData, selectedRole, setSelectedRole, loginError, setLoginError, signupError, setSignupError, referralParams, setReferralParams, authUser, getAuthErrorMessage, handleLogin, handleLogout, handleSignup, handleLoginClick, handleSelectRole, handleRancherStep1Next, handleRancherStep2Next, handleRancherStep3Next, handleProductorStep1Next, handleProductorStep2Next, handleProductorStep3Next, handleEmpresaStep1Next, handleEmpresaStep2Next, handleEmpresaStep3Next, handleEmpresaStep4Next, handleEmpresaStep5Next, handleOwnerOperatorStep1Next, handleOwnerOperatorStep2Next, handleOwnerOperatorStep3Next, handleOwnerOperatorStep4Next, handleOwnerOperatorStep5Next, handleDriverStep1Next, handleDriverStep2Next, handleDriverStep3Next, handleEmailPhoneVerified, handleForgotPasswordSent, handleGoToDashboard, handleSkip, handleAdminClick, handleCasosBordeClick, handleDemoAs, productorSubTypeLabel, dashboardUserName, ganaderoAccountInitialData };
}
