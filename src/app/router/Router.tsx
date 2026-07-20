import { createBrowserRouter, RouterProvider, Outlet, Navigate } from "react-router-dom";
import { Toaster } from "@/app/components/ui/sonner";
import { DemoSwitcher } from "./DemoSwitcher";
import { ProtectedRoute, RoleRoute } from "./guards";
import { DashboardLayout } from "@/app/components/DashboardLayout";

// Páginas
import { WelcomePage } from "./pages/WelcomePage";
import { LoginPage } from "./pages/LoginPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { ChooseAccountPage } from "./pages/ChooseAccountPage";
import { RegisterGanaderoPage } from "./pages/RegisterGanaderoPage";
import { AccountReadyPage } from "./pages/AccountReadyPage";
import { AccountPage } from "./pages/AccountPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AdminPage } from "./pages/AdminPage";
import { TransportRequestPage } from "./pages/TransportRequestPage";
import { TransportMarketplacePage } from "./pages/TransportMarketplacePage";

/**
 * Layout con Toaster + DemoSwitcher globales.
 */
function AppLayout() {
  return (
    <>
      <Toaster theme="light" position="top-center" richColors closeButton />
      <DemoSwitcher />
      <Outlet />
    </>
  );
}

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      // ── Públicas ──
      { path: "/", element: <WelcomePage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/reset-password", element: <ResetPasswordPage /> },

      // ── Registro: elección de tipo de cuenta ──
      { path: "/register", element: <ChooseAccountPage /> },

      // ── Registro Ganadero (3 pasos) ──
      { path: "/register/ganadero/:step", element: <RegisterGanaderoPage /> },

      // ── Account status ──
      { path: "/account/ready", element: <AccountReadyPage /> },

      // ── Dashboard (ya tiene su propio sidebar embebido en RancherDashboard) ──
      {
        path: "/dashboard",
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },

      {
        path: "/transport-requests/new",
        element: (
          <ProtectedRoute>
            <TransportRequestPage />
          </ProtectedRoute>
        ),
      },

      {
        path: "/transport-marketplace",
        element: (
          <ProtectedRoute>
            <TransportMarketplacePage />
          </ProtectedRoute>
        ),
      },

      // ── Mi cuenta (usando DashboardLayout para tener el sidebar) ──
      {
        path: "/account",
        element: (
          <ProtectedRoute>
            <DashboardLayout>
              <AccountPage />
            </DashboardLayout>
          </ProtectedRoute>
        ),
      },

      // ── Admin (protegido por rol admin) ──
      {
        path: "/admin",
        element: (
          <RoleRoute roles={["admin"]}>
            <AdminPage />
          </RoleRoute>
        ),
      },

      // ── Fallback ──
      { path: "*", element: <Navigate to="/" replace /> },
    ],
  },
]);

export function AppRouterProvider() {
  return <RouterProvider router={router} />;
}
