import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {Mail, Smartphone} from 'lucide-react';

interface VerifyEmailPhoneProps {
  email?: string;
  phone?: string;
  onVerified: () => void;
  onBack: () => void;
}

import { toast } from 'sonner';
import { SignupHeader } from './SignupHeader';
export function VerifyEmailPhone({ 
  email = 'usuario@ejemplo.com.py', 
  phone = '+595 981 123456', 
  onVerified, 
  onBack 
}: VerifyEmailPhoneProps) {
  const [emailCode, setEmailCode] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  const handleVerifyEmail = () => {
    // Simulación de verificación
    if (emailCode.length === 6) {
      setEmailVerified(true);
    }
  };

  const handleVerifyPhone = () => {
    // Simulación de verificación
    if (phoneCode.length === 6) {
      setPhoneVerified(true);
    }
  };

  const handleContinue = () => {
    if (emailVerified && phoneVerified) {
      onVerified();
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
            <h1 className="text-3xl font-bold mb-2">Verificá tu cuenta</h1>
            <p className="text-gray-600">
              Te enviamos códigos de verificación a tu email y teléfono
            </p>
          </div>

          <div className="space-y-6">
            {/* Email Verification */}
            <div className="border border-gray-200 rounded-lg p-5">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-5 h-5" style={{ color: '#1E5126' }} />
                <div className="flex-1">
                  <h3 className="font-medium">Verificación de Email</h3>
                  <p className="text-sm text-gray-500">{email}</p>
                </div>
                {emailVerified && (
                  <span className="text-green-600 text-sm font-medium">✓ Verificado</span>
                )}
              </div>

              {!emailVerified && (
                <div className="space-y-3">
                  <Input
                    type="text"
                    value={emailCode}
                    onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Código de 6 dígitos"
                    maxLength={6}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleVerifyEmail}
                      disabled={emailCode.length !== 6}
                      className="flex-1"
                      style={{ backgroundColor: '#1E5126' }}
                    >
                      Verificar Email
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => toast.success('Código reenviado')}
                    >
                      Reenviar
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Phone Verification */}
            <div className="border border-gray-200 rounded-lg p-5">
              <div className="flex items-center gap-3 mb-4">
                <Smartphone className="w-5 h-5" style={{ color: '#1E5126' }} />
                <div className="flex-1">
                  <h3 className="font-medium">Verificación de Teléfono</h3>
                  <p className="text-sm text-gray-500">{phone}</p>
                </div>
                {phoneVerified && (
                  <span className="text-green-600 text-sm font-medium">✓ Verificado</span>
                )}
              </div>

              {!phoneVerified && (
                <div className="space-y-3">
                  <Input
                    type="text"
                    value={phoneCode}
                    onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Código de 6 dígitos"
                    maxLength={6}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleVerifyPhone}
                      disabled={phoneCode.length !== 6}
                      className="flex-1"
                      style={{ backgroundColor: '#1E5126' }}
                    >
                      Verificar Teléfono
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => toast.success('Código reenviado')}
                    >
                      Reenviar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={handleContinue}
            disabled={!emailVerified || !phoneVerified}
            className="w-full h-12 text-base mt-6"
            style={{ backgroundColor: '#1E5126' }}
          >
            Continuar
          </Button>

          {(!emailVerified || !phoneVerified) && (
            <p className="text-sm text-gray-500 text-center mt-4">
              Verificá ambos métodos para continuar
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
