import { useState } from 'react';
import { Beef, ChevronLeft, Mail, Smartphone, CheckCircle } from 'lucide-react';

interface VerifyEmailPhoneMobileProps {
  email?: string;
  phone?: string;
  onVerified: () => void;
  onBack: () => void;
}

export function VerifyEmailPhoneMobile({
  email = 'usuario@ejemplo.com.py',
  phone = '+595 981 123456',
  onVerified,
  onBack,
}: VerifyEmailPhoneMobileProps) {
  const [emailCode, setEmailCode] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  const handleVerifyEmail = () => {
    if (emailCode.length === 6) setEmailVerified(true);
  };

  const handleVerifyPhone = () => {
    if (phoneCode.length === 6) setPhoneVerified(true);
  };

  const bothVerified = emailVerified && phoneVerified;

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#F6F1E8' }}>
      <header className="px-4 py-3 flex items-center gap-3" style={{ backgroundColor: '#1E5126' }}>
        <button onClick={onBack} className="p-1">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <Beef className="w-5 h-5 text-white" />
        <span className="font-bold text-white text-lg">TROPEX</span>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Verificá tu cuenta</h1>
        <p className="text-gray-500 text-sm mb-8">Enviamos códigos a tu email y teléfono</p>

        <div className="space-y-4">
          {/* Email verification */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#1E512615' }}>
                <Mail className="w-5 h-5" style={{ color: '#1E5126' }} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-gray-900">Email</p>
                <p className="text-xs text-gray-500">{email}</p>
              </div>
              {emailVerified && <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />}
            </div>

            {!emailVerified ? (
              <div className="space-y-3">
                <input
                  type="text"
                  inputMode="numeric"
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Código de 6 dígitos"
                  maxLength={6}
                  className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-[#1E5126] text-center tracking-widest font-mono text-lg"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleVerifyEmail}
                    disabled={emailCode.length !== 6}
                    className="flex-1 py-3 text-white font-semibold rounded-xl disabled:opacity-40 text-sm"
                    style={{ backgroundColor: '#1E5126' }}
                  >
                    Verificar
                  </button>
                  <button
                    onClick={() => {}}
                    className="px-4 py-3 text-sm font-medium rounded-xl border border-gray-300 bg-white text-gray-700"
                  >
                    Reenviar
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm font-semibold text-green-600">Verificado</p>
            )}
          </div>

          {/* Phone verification */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#1E512615' }}>
                <Smartphone className="w-5 h-5" style={{ color: '#1E5126' }} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-gray-900">Teléfono</p>
                <p className="text-xs text-gray-500">{phone}</p>
              </div>
              {phoneVerified && <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />}
            </div>

            {!phoneVerified ? (
              <div className="space-y-3">
                <input
                  type="text"
                  inputMode="numeric"
                  value={phoneCode}
                  onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Código de 6 dígitos"
                  maxLength={6}
                  className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-[#1E5126] text-center tracking-widest font-mono text-lg"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleVerifyPhone}
                    disabled={phoneCode.length !== 6}
                    className="flex-1 py-3 text-white font-semibold rounded-xl disabled:opacity-40 text-sm"
                    style={{ backgroundColor: '#1E5126' }}
                  >
                    Verificar
                  </button>
                  <button
                    onClick={() => {}}
                    className="px-4 py-3 text-sm font-medium rounded-xl border border-gray-300 bg-white text-gray-700"
                  >
                    Reenviar
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm font-semibold text-green-600">Verificado</p>
            )}
          </div>
        </div>

        {!bothVerified && (
          <p className="text-center text-xs text-gray-400 mt-5">Verificá ambos métodos para continuar</p>
        )}
      </div>

      <div className="px-5 pt-4 pb-8 bg-white border-t border-gray-100">
        <button
          onClick={onVerified}
          disabled={!bothVerified}
          className="w-full py-4 text-white font-bold text-base rounded-2xl disabled:opacity-40"
          style={{ backgroundColor: '#1E5126' }}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
