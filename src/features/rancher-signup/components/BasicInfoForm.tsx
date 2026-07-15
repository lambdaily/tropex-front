import { useState } from "react";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { useRancherSignupForm } from "../hooks/useRancherSignupForm";
import type { BasicInfoFormProps } from "../types/rancher-signup.types";

import logoHorizontalBlanco from "@/assets/logo_horizontal_blanco.png";
import { SignupHeader } from '@/app/components/tropero-v2/SignupHeader';

export function BasicInfoForm({
  onNext,
  onSkip,
  onBack,
  initialData,
  signupError,
}: BasicInfoFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const {
    formData,
    setFormData,
    errors,
    isValid,
    handleBlur,
    showError,
    markAllTouched,
  } = useRancherSignupForm(initialData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    markAllTouched();

    if (isValid) {
      onNext(formData);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F1E8]">
      {/* Header */}
      <header className="bg-[#1E5126] px-4 py-3 md:px-6 md:py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="text-white hover:text-gray-200 transition-colors"
            >
              ← Volver
            </button>
            <div className="flex items-center gap-2">
              <img src={logoHorizontalBlanco} alt="TROPEX" className="h-12 w-auto" />
            </div>
          </div>

        </div>
      </header>

      {/* Progress */}
      <div className="px-4 py-4 md:px-6 md:py-6 border-b border-gray-100">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-900">
              Paso 1 de 3
            </span>
            <span className="text-sm text-gray-500">Información básica</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full bg-[#1E5126]"
              style={{ width: "33.33%" }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-4 py-6 md:px-6 md:py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-black mb-2">
            Información básica
          </h1>
          <p className="text-gray-600 mb-6 md:mb-8">Completa tus datos principales</p>

          {signupError && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 shadow-sm" role="alert">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
              <div>
                <p className="text-sm font-semibold text-red-800">No pudimos crear tu cuenta</p>
                <p className="mt-0.5 whitespace-pre-line text-sm text-red-700">{signupError}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            {/* Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  onBlur={() => handleBlur("firstName")}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1E5126] focus:border-[#1E5126] ${
                    showError("firstName")
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Juan"
                />
                {showError("firstName") && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Apellido
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  onBlur={() => handleBlur("lastName")}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1E5126] focus:border-[#1E5126] ${
                    showError("lastName") ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="González"
                />
                {showError("lastName") && (
                  <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  onBlur={() => handleBlur("phone")}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1E5126] focus:border-[#1E5126] ${
                    showError("phone") ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="+595 981 234 567"
                />
                {showError("phone") && (
                  <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  onBlur={() => handleBlur("email")}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1E5126] focus:border-[#1E5126] ${
                    showError("email") ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="juan@ejemplo.com"
                />
                {showError("email") && (
                  <p className="text-xs text-red-600 mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Contraseña *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    onBlur={() => handleBlur("password")}
                    className={`w-full px-4 py-3 pr-11 border rounded-lg focus:ring-2 focus:ring-[#1E5126] focus:border-[#1E5126] ${
                      showError("password")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Mínimo 8 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {showError("password") && (
                  <p className="text-xs text-red-600 mt-1">{errors.password}</p>
                )}
                <ul className="mt-2 space-y-1 text-xs text-gray-500 list-disc pl-4">
                  <li>Mínimo 8 caracteres.</li>
                  <li>No puede ser completamente numérica.</li>
                </ul>
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Confirmar Contraseña *
                </label>
                <div className="relative">
                  <input
                    type={showPasswordConfirm ? "text" : "password"}
                    value={formData.passwordConfirm}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        passwordConfirm: e.target.value,
                      })
                    }
                    onBlur={() => handleBlur("passwordConfirm")}
                    className={`w-full px-4 py-3 pr-11 border rounded-lg focus:ring-2 focus:ring-[#1E5126] focus:border-[#1E5126] ${
                      showError("passwordConfirm")
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="Repetir contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswordConfirm ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {showError("passwordConfirm") && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.passwordConfirm}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-8 py-4 text-white font-semibold rounded-lg transition-colors bg-[#1E5126]"
              >
                Continuar
              </button>

            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
