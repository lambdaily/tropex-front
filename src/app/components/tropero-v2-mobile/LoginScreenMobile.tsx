import { useState } from 'react';
import { AlertCircle, Beef, ChevronLeft, Eye, EyeOff } from 'lucide-react';

interface LoginScreenMobileProps {
  onLogin: (email: string, password: string) => void;
  onForgotPassword: () => void;
  onBack: () => void;
  authError?: string | null;
  onClearError?: () => void;
}

export function LoginScreenMobile({ onLogin, onForgotPassword, onBack, authError, onClearError }: LoginScreenMobileProps) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    onClearError?.();
    try {
      await onLogin(formData.email, formData.password);
    } catch {
      // Error is handled by parent and passed via authError prop
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#F6F1E8' }}>
      {/* Header */}
      <header className="px-4 py-3 flex items-center gap-3" style={{ backgroundColor: '#1E5126' }}>
        <button onClick={onBack} className="p-1">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <Beef className="w-5 h-5 text-white" />
        <span className="font-bold text-white text-lg">TROPEX</span>
      </header>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 pt-8 pb-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Iniciar sesión</h1>
        <p className="text-gray-500 text-sm mb-8">Ingresá tus credenciales para continuar</p>

        <form id="login-form" onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="tucorreo@ejemplo.com.py"
              required
              className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-[#1E5126]"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Contraseña *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                required
                className="w-full px-4 py-4 pr-12 text-base border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-[#1E5126]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm font-medium"
            style={{ color: '#1E5126' }}
          >
            ¿Olvidaste tu contraseña?
          </button>

          {authError && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 shadow-sm" role="alert">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
              <div>
                <p className="text-sm font-semibold text-red-800">No pudimos iniciar sesión</p>
                <p className="mt-0.5 whitespace-pre-line text-sm text-red-700">{authError}</p>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Sticky bottom CTA */}
      <div className="px-5 pt-4 pb-8 bg-white border-t border-gray-100 space-y-3">
        <button
          type="submit"
          form="login-form"
          disabled={isSubmitting}
          className="w-full py-4 text-white font-bold text-base rounded-2xl disabled:opacity-40"
          style={{ backgroundColor: '#1E5126' }}
        >
          {isSubmitting ? 'Iniciando sesion...' : 'Iniciar sesión'}
        </button>
        <p className="text-center text-sm text-gray-500">
          ¿No tenés cuenta?{' '}
          <button onClick={onBack} className="font-semibold" style={{ color: '#1E5126' }}>
            Registrate
          </button>
        </p>
      </div>
    </div>
  );
}
