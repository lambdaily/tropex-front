import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/features/auth";
import { useSignupStore } from "./signupStore";

/**
 * Ruta protegida — requiere autenticación.
 * Permite acceso demo si hay un selectedRole (para el demo switcher).
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isInitialized } = useAuth();
  const selectedRole = useSignupStore((s) => s.selectedRole);
  const location = useLocation();

  if (isInitialized && !isAuthenticated && !selectedRole) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

/**
 * Ruta protegida por rol — requiere que el usuario tenga uno de los roles permitidos.
 */
export function RoleRoute({
  roles,
  children,
}: {
  roles: string[];
  children: ReactNode;
}) {
  const { user, isAuthenticated } = useAuth();
  const selectedRole = useSignupStore((s) => s.selectedRole);

  const hasAccess =
    (isAuthenticated &&
      user?.roles.some((r) => roles.includes(r))) ||
    roles.includes(selectedRole);

  if (!hasAccess) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
