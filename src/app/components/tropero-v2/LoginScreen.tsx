import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {AlertCircle, Eye, EyeOff} from 'lucide-react';
import { SignupHeader } from './SignupHeader';

interface LoginScreenProps {
  onLogin: (email: string, password: string) => void;
  onForgotPassword: () => void;
  onBack: () => void;
  authError?: string | null;
  onClearError?: () => void;
}

export function LoginScreen({ onLogin, onForgotPassword, onBack, authError, onClearError }: LoginScreenProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
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
    <div className="flex flex-col" style={{ minHeight: '100vh', backgroundColor: '#F6F1E8' }}>
            {/* Header */}
      <SignupHeader onBack={onBack} />

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-md">
          <button
            onClick={onBack}
            className="text-sm hover:text-gray-600 mb-6"
            style={{ color: '#1E5126' }}
          >
            ← Volver
          </button>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Iniciar Sesión</h1>
            <p className="text-gray-600">
              Ingresá tus credenciales para acceder a tu cuenta
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="tucorreo@ejemplo.com.py"
                required
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="password">Contraseña *</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  className="pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 shadow-sm" role="alert">
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                <div>
                  <p className="text-sm font-semibold text-red-800">No pudimos iniciar sesión</p>
                  <p className="mt-0.5 whitespace-pre-line text-sm text-red-700">{authError}</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded" />
                <span className="text-gray-600">Recordarme</span>
              </label>
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-sm hover:underline"
                style={{ color: '#1E5126' }}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base"
              style={{ backgroundColor: '#1E5126' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Iniciando sesion...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿No tenés cuenta?{' '}
              <button
                onClick={onBack}
                className="font-medium hover:underline"
                style={{ color: '#1E5126' }}
              >
                Registrate aquí
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
