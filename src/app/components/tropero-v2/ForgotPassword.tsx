import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {Mail} from 'lucide-react';
import { SignupHeader } from './SignupHeader';

interface ForgotPasswordProps {
  onBack: () => void;
  onResetSent: () => void;
}

export function ForgotPassword({ onBack, onResetSent }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Simulación de envío de email
    setTimeout(() => {
      onResetSent();
    }, 2000);
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
            ← Volver al inicio de sesión
          </button>

          {!submitted ? (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Recuperar Contraseña</h1>
                <p className="text-gray-600">
                  Ingresá tu email y te enviaremos instrucciones para restablecer tu contraseña
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tucorreo@ejemplo.com.py"
                    required
                    className="mt-1.5"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base"
                  style={{ backgroundColor: '#1E5126' }}
                >
                  Enviar Instrucciones
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold mb-2">Email Enviado</h1>
              <p className="text-gray-600 mb-6">
                Te enviamos instrucciones para restablecer tu contraseña a{' '}
                <span className="font-medium">{email}</span>
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Si no recibís el email en unos minutos, revisá tu carpeta de spam
              </p>
              <Button
                onClick={onBack}
                variant="outline"
                className="w-full"
              >
                Volver al inicio de sesión
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}