import { ChevronLeft } from 'lucide-react';
import logoHorizontalBlanco from '@/assets/logo_horizontal_blanco.png';

interface SignupHeaderProps {
  onBack?: () => void;
  onSkip?: () => void;
  onLogout?: () => void;
}

export function SignupHeader({ onBack, onLogout }: SignupHeaderProps) {
  return (
    <header
      className=" px-4 md:px-6 py-3 md:py-4 flex items-center gap-3"
      style={{ backgroundColor: '#1E5126' }}
    >
      {onBack && (
        <button onClick={onBack} className="p-1 text-white hover:text-gray-200 transition-colors">
          <ChevronLeft className="w-6 h-6 text-white md:hidden" />
          <span className="hidden md:inline">← Volver</span>
        </button>
      )}
      <div className={`flex items-center ${onBack ? 'mx-auto md:mx-0' : 'mx-auto'}`}>
        <img src={logoHorizontalBlanco} alt="TROPEX" className="h-12 md:h-12" />
      </div>

      {onLogout && (
        <button
          onClick={onLogout}
          className="px-3 py-1.5 text-sm font-medium rounded-lg"
          style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#ffffff' }}
        >
          Cerrar Sesión
        </button>
      )}
    </header>
  );
}
