"use client";

import { useAuth } from "@/lib/auth";
import { changePassword } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { user, tokens, loading, logout } = useAuth();
  const router = useRouter();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwords, setPasswords] = useState({ old: "", new: "", confirm: "" });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    setErr("");

    if (passwords.new !== passwords.confirm) {
      setErr("Las passwords no coinciden");
      return;
    }

    try {
      await changePassword(tokens!.access, passwords.old, passwords.new);
      setMsg("Password cambiado correctamente");
      setPasswords({ old: "", new: "", confirm: "" });
      setShowChangePassword(false);
    } catch (error) {
      setErr(error instanceof Error ? error.message : "Error");
    }
  };

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Tropex</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Mi Perfil</h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Email</span>
              <span className="font-medium">{user.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Nombre</span>
              <span className="font-medium">
                {user.first_name || "-"} {user.last_name || ""}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Rol</span>
              <span className="font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                {user.role}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Miembro desde</span>
              <span className="font-medium">
                {new Date(user.created_at).toLocaleDateString("es-ES")}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Seguridad</h2>
            <button
              onClick={() => setShowChangePassword(!showChangePassword)}
              className="text-sm text-blue-600 hover:underline"
            >
              {showChangePassword ? "Cancelar" : "Cambiar Password"}
            </button>
          </div>

          {showChangePassword && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              {msg && (
                <div className="bg-green-50 text-green-600 text-sm p-3 rounded">
                  {msg}
                </div>
              )}
              {err && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded">
                  {err}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Password Actual</label>
                <input
                  type="password"
                  value={passwords.old}
                  onChange={(e) => setPasswords({ ...passwords, old: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Nuevo Password</label>
                <input
                  type="password"
                  value={passwords.new}
                  onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Confirmar Nuevo Password</label>
                <input
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Cambiar Password
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
