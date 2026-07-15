import { apiClient } from "@/shared/api/apiClient";
import type {
  UserData,
  Tokens,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  AuthResponse,
  RucVerification,
  RucVerificationReal,
  RoleOption,
} from "../types/auth.types";

export const authApi = {
  login: (payload: LoginPayload): Promise<LoginResponse> =>
    apiClient.post<LoginResponse>("/auth/login/", payload),

  register: (payload: RegisterPayload): Promise<AuthResponse> =>
    apiClient.post<AuthResponse>("/auth/register/", payload),

  logout: (refreshToken: string): Promise<void> =>
    apiClient.post<void>("/auth/logout/", { refresh: refreshToken }),

  me: (): Promise<UserData> => apiClient.get<UserData>("/auth/me/"),

  changePassword: (
    oldPassword: string,
    newPassword: string,
  ): Promise<{ detail: string }> =>
    apiClient.post<{ detail: string }>("/auth/me/change-password/", {
      old_password: oldPassword,
      new_password: newPassword,
    }),

  changePasswordRequest: (): Promise<{ detail: string }> =>
    apiClient.post<{ detail: string }>("/auth/me/change-password-request/", {}),

  passwordReset: (token: string, password: string): Promise<{ detail: string }> =>
    apiClient.post<{ detail: string }>("/auth/password-reset/", { token, password }),

  changeEmailRequest: (newEmail: string): Promise<{ detail: string }> =>
    apiClient.post<{ detail: string }>("/auth/me/change-email-request/", { new_email: newEmail }),

  changeEmailConfirm: (code: string): Promise<{ detail: string }> =>
    apiClient.post<{ detail: string }>("/auth/me/change-email-confirm/", { code }),

  verifyRuc: (ruc: string): Promise<RucVerification> =>
    apiClient.get<RucVerification>(
      `/auth/verify-ruc/${encodeURIComponent(ruc)}/`,
    ),

  verifyRucReal: (ruc: string): Promise<RucVerificationReal> =>
    apiClient.get<RucVerificationReal>(
      `/auth/verify-ruc-real/?ruc=${encodeURIComponent(ruc)}`,
    ),

  getRoles: (): Promise<RoleOption[]> => apiClient.get<RoleOption[]>("/roles/"),
};
