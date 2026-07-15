import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/authApi";
import { apiClient } from "@/shared/api/apiClient";
import { useAuthStore } from "../stores/authStore";
import type {
  LoginPayload,
  LoginResponse,
  Tokens,
  UserData,
} from "../types/auth.types";

function extractTokens(response: LoginResponse): Tokens | null {
  if ("access" in response && "refresh" in response) {
    return response;
  }

  if (
    "tokens" in response &&
    response.tokens?.access &&
    response.tokens?.refresh
  ) {
    return response.tokens;
  }

  return null;
}

function extractUser(response: LoginResponse): UserData | null {
  if ("user" in response && response.user) {
    return response.user;
  }

  return null;
}

export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const response = await authApi.login(payload);
      const tokens = extractTokens(response);

      if (!tokens) {
        throw { detail: "La respuesta de login no incluyó tokens válidos." };
      }

      apiClient.setTokens(tokens);

      const userFromLogin = extractUser(response);
      if (userFromLogin) {
        return userFromLogin;
      }

      const user = await authApi.me();
      return user;
    },
    onSuccess: (user) => {
      setUser(user);
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}
