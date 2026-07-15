Aplicá los siguientes cambios manteniendo todos los props, handlers y funcionalidades existentes.

1. Reemplazar el hero del WelcomeScreen.tsx
En el archivo src/app/components/tropero-v2/WelcomeScreen.tsx, reemplazá únicamente la sección <header> y <main> por lo siguiente. Mantené las secciones de "¿Cómo funciona?", "Para quién es", "¿Por qué Tropero?", el CTA final y el footer exactamente como están.
Nuevo header:
jsx<header style={{ backgroundColor: '#2D5016' }} className="px-6 py-4">
  <div className="max-w-6xl mx-auto flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
        <Beef className="w-5 h-5 text-white" />
      </div>
      <span className="text-xl font-bold text-white">Tropero</span>
    </div>
    <div className="flex items-center gap-3">
      <button
        onClick={onLogin}
        className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
        style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#ffffff' }}
      >
        Iniciar sesión
      </button>
      <button
        onClick={onSignup}
        className="px-4 py-2 text-sm font-semibold rounded-lg transition-colors"
        style={{ backgroundColor: '#ffffff', color: '#2D5016' }}
      >
        Registrarte
      </button>
    </div>
  </div>
</header>
Nuevo hero (reemplaza el <main> actual):
jsx<section
  className="relative overflow-hidden flex items-center justify-center px-6 py-24"
  style={{ backgroundColor: '#2D5016', minHeight: '520px' }}
>
  {/* Patrón de fondo SVG */}
  <svg
    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06 }}
    viewBox="0 0 800 520"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff" strokeWidth="0.8" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)" />
    <circle cx="120" cy="80" r="180" fill="#ffffff" opacity="0.04" />
    <circle cx="680" cy="440" r="220" fill="#ffffff" opacity="0.04" />
  </svg>

  <div className="relative z-10 text-center max-w-3xl mx-auto">
    {/* Badge */}
    <div
      className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full"
      style={{ backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
    >
      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#a3e635' }}></div>
      <span className="text-sm font-medium text-white">Plataforma de transporte ganadero en Paraguay</span>
    </div>

    {/* Título */}
    <h1 className="font-bold text-white mb-6 leading-tight" style={{ fontSize: '52px', letterSpacing: '-1px' }}>
      Transporte ganadero
      <br />
      <span style={{ color: '#a3e635' }}>sin complicaciones</span>
    </h1>

    {/* Subtítulo */}
    <p className="mb-10 mx-auto leading-relaxed" style={{ fontSize: '18px', color: 'rgba(255,255,255,0.75)', maxWidth: '520px' }}>
      Conectamos ganaderos con transportistas profesionales en todo Paraguay.
      Cotizá, contratá y rastreá tus traslados en minutos.
    </p>

    {/* Botones */}
    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
      <button
        onClick={onSignup}
        className="px-8 py-4 font-bold rounded-lg text-lg transition-colors"
        style={{ backgroundColor: '#ffffff', color: '#2D5016' }}
      >
        Empezar ahora
      </button>
      <button
        onClick={onLogin}
        className="px-8 py-4 font-semibold rounded-lg text-lg transition-colors"
        style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)' }}
      >
        Ya tengo cuenta
      </button>
    </div>

    {/* Datos clave */}
    <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
      <div className="text-center">
        <div className="font-bold text-white mb-1" style={{ fontSize: '20px' }}>Todo el país</div>
        <div className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Cobertura nacional</div>
      </div>
      <div className="hidden sm:block w-px h-10" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}></div>
      <div className="text-center">
        <div className="font-bold text-white mb-1" style={{ fontSize: '20px' }}>SENACSA</div>
        <div className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Transportistas verificados</div>
      </div>
      <div className="hidden sm:block w-px h-10" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}></div>
      <div className="text-center">
        <div className="font-bold text-white mb-1" style={{ fontSize: '20px' }}>Ubicación en vivo</div>
        <div className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Rastreo en tiempo real</div>
      </div>
    </div>
  </div>
</section>

2. Unificar el header verde en todos los flujos de registro
En los siguientes archivos, el header actual usa un ícono suelto (Building2, Truck, UserCircle) con color verde sin fondo. Reemplazalo en cada uno por el header verde oscuro unificado:
Archivos a modificar:

src/app/components/tropero-v2/LoginScreen.tsx
src/app/components/tropero-v2/ForgotPassword.tsx
src/app/components/tropero-v2/VerifyEmailPhone.tsx
src/app/components/tropero-v2/EmpresaSignup1Basic.tsx
src/app/components/tropero-v2/EmpresaSignup2Fleet.tsx
src/app/components/tropero-v2/EmpresaSignup3Documents.tsx
src/app/components/tropero-v2/EmpresaSignup4Payment.tsx
src/app/components/tropero-v2/EmpresaSignup5PayoutMethod.tsx
src/app/components/tropero-v2/OwnerOperatorSignup1Basic.tsx
src/app/components/tropero-v2/OwnerOperatorSignup2Vehicle.tsx
src/app/components/tropero-v2/OwnerOperatorSignup3Documents.tsx
src/app/components/tropero-v2/OwnerOperatorSignup4Payment.tsx
src/app/components/tropero-v2/OwnerOperatorSignup5PayoutMethod.tsx
src/app/components/tropero-v2/DriverSignup1Basic.tsx
src/app/components/tropero-v2/DriverSignup2Company.tsx
src/app/components/tropero-v2/DriverSignup3Documents.tsx
src/app/components/tropero-v2/AccountReady.tsx
src/app/components/tropero-v2/AccountPending.tsx
src/app/components/tropero-v2/AccountRejected.tsx
src/app/components/tropero-v2/ChooseAccountType.tsx

En cada archivo, reemplazá el elemento <header> o <div className="border-b border-gray-200 bg-white"> del nav por:
jsx<header style={{ backgroundColor: '#2D5016' }} className="px-6 py-4">
  <div className="max-w-3xl mx-auto flex items-center justify-between">
    <div className="flex items-center gap-3">
      {/* Botón volver si existe en ese archivo — mantenelo, solo cambiá el color */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
          <Beef className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-white">Tropero</span>
      </div>
    </div>
    {/* Botón de acción derecha (Omitir / Guardar para después / Subir después) — mantenelo, cambiá el color */}
    {/* El botón de acción derecha debe quedar: */}
    {/* className="px-3 py-1.5 text-sm font-medium rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#ffffff' }} */}
  </div>
</header>
El botón de volver ← Volver en los archivos que lo tienen debe quedar text-white con hover:text-gray-200.
Importá Beef desde lucide-react en los archivos donde no esté importado.
Eliminá los imports de Building2, Truck, UserCircle si ya no se usan en ningún otro lugar del archivo.
No cambies ninguna otra funcionalidad, datos, lógica ni diseño fuera del header.