export type Screen =
  // ── Auth ──
  | "welcome" | "login" | "forgot-password" | "reset-password" | "verify-email-phone"
  // ── Account type selection ──
  | "choose-account"
  // ── Rancher / Ganadero signup ──
  | "rancher-step1" | "rancher-step2" | "rancher-step3"
  // ── Productor (non-Ganadero) signup ──
  | "productor-step1" | "productor-step2" | "productor-step3"
  // ── Empresa signup ──
  | "empresa-step1" | "empresa-step2" | "empresa-step3" | "empresa-step4" | "empresa-step5"
  // ── Owner-Operator signup ──
  | "owner-operator-step1" | "owner-operator-step2" | "owner-operator-step3" | "owner-operator-step4" | "owner-operator-step5"
  // ── Driver signup ──
  | "driver-step1" | "driver-step2" | "driver-step3" | "driver-account-pending"
  // ── Account status ──
  | "account-ready" | "account-pending" | "account-rejected"
  // ── Dashboard & admin ──
  | "dashboard" | "admin" | "casos-borde" | "referral-registration";

export interface NavigationState {
  screen: Screen;
  navigate: (screen: Screen) => void;
}

export type { SignupData, ReferralParams } from "@/app/types/signup";
