import { useState } from 'react';
import { Beef, ChevronLeft, Mail } from 'lucide-react';

interface ForgotPasswordMobileProps {
  onBack: () => void;
  onResetSent: () => void;
}

export function ForgotPasswordMobile({ onBack, onResetSent }: ForgotPasswordMobileProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => { onResetSent(); }, 2000);
  };

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
        {!submitted ? (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Recuperar contraseña</h1>
            <p className="text-gray-500 text-sm mb-8">Ingresá tu email y te enviaremos instrucciones</p>

            <form id="forgot-form" onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tucorreo@ejemplo.com.py"
                  required
                  className="w-full px-4 py-4 text-base border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-[#1E5126]"
                />
              </div>
            </form>
          </>
        ) : (
          <div className="text-center pt-12">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <Mail className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-3">Email enviado</h1>
            <p className="text-gray-600 mb-2">
              Te enviamos instrucciones a <span className="font-semibold">{email}</span>
            </p>
            <p className="text-sm text-gray-400">Si no lo recibís, revisá la carpeta de spam</p>
          </div>
        )}
      </div>

      {!submitted && (
        <div className="px-5 pt-4 pb-8 bg-white border-t border-gray-100">
          <button
            type="submit"
            form="forgot-form"
            className="w-full py-4 text-white font-bold text-base rounded-2xl"
            style={{ backgroundColor: '#1E5126' }}
          >
            Enviar instrucciones
          </button>
        </div>
      )}
    </div>
  );
}
