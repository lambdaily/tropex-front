Reemplazá completamente el contenido del archivo src/app/components/tropero-v2/WelcomeScreen.tsx con el siguiente diseño. Mantené exactamente los mismos props: onSignup, onLogin, onAdminClick. Usá solo íconos de lucide-react ya instalados.
tsximport { Beef, Building2, Truck, UserCheck, Shield, FileText, TrendingUp, MapPin, DollarSign, Headphones } from 'lucide-react';

interface WelcomeScreenProps {
  onSignup: () => void;
  onLogin: () => void;
  onAdminClick?: () => void;
}

export function WelcomeScreen({ onSignup, onLogin, onAdminClick }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f5f0e8' }}>

      {/* HEADER */}
      <header style={{ backgroundColor: '#2D5016' }} className="px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
              <Beef className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Tropero</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onLogin}
              className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
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

      {/* HERO */}
      <section className="px-6 py-24 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-black mb-6 leading-tight">
            Transporte ganadero
            <br />
            <span style={{ color: '#2D5016' }}>sin complicaciones</span>
          </h1>
          <p className="text-xl mb-10 max-w-xl mx-auto leading-relaxed" style={{ color: '#5a5a5a' }}>
            Conectamos ganaderos con transportistas profesionales en todo Paraguay. Cotizá, contratá y rastreá tus traslados en minutos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onSignup}
              className="px-8 py-4 font-semibold rounded-lg text-white transition-colors text-lg"
              style={{ backgroundColor: '#2D5016' }}
            >
              Empezar ahora
            </button>
            <button
              onClick={onLogin}
              className="px-8 py-4 font-semibold rounded-lg border-2 text-black transition-colors text-lg"
              style={{ borderColor: '#2D5016', color: '#2D5016', backgroundColor: 'transparent' }}
            >
              Ya tengo cuenta
            </button>
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="px-6 py-20" style={{ backgroundColor: '#ffffff' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-black text-center mb-16">¿Cómo funciona?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { num: '1', title: 'Publicá tu traslado', desc: 'Ingresá origen, destino, cantidad de ganado y fecha. Solo toma 2 minutos.' },
              { num: '2', title: 'Recibí ofertas', desc: 'Transportistas verificados de todo Paraguay te envían sus cotizaciones.' },
              { num: '3', title: 'Rastreá en tiempo real', desc: 'Seguí tu ganado desde la carga hasta la entrega con documentación digital.' },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 text-white text-xl font-bold"
                  style={{ backgroundColor: '#2D5016' }}
                >
                  {step.num}
                </div>
                <h3 className="text-lg font-bold text-black mb-3">{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6b6b6b' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PARA QUIÉN ES */}
      <section className="px-6 py-20" style={{ backgroundColor: '#f5f0e8' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-black text-center mb-4">Diseñado para cada parte del negocio</h2>
          <p className="text-center mb-12" style={{ color: '#6b6b6b' }}>Una plataforma, cuatro roles, un solo objetivo</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Beef, title: 'Ganadero', desc: 'Publicá traslados y elegí la mejor oferta', featured: true },
              { icon: Building2, title: 'Empresa', desc: 'Gestioná tu flota y aceptá viajes disponibles', featured: false },
              { icon: Truck, title: 'Transportista', desc: 'Encontrá viajes cerca y gestioná tus ingresos', featured: false },
              { icon: UserCheck, title: 'Chofer', desc: 'Recibí asignaciones y manejá tu documentación', featured: false },
            ].map((role) => {
              const Icon = role.icon;
              return (
                <div
                  key={role.title}
                  className="rounded-xl p-6 border-2 transition-all"
                  style={{
                    backgroundColor: role.featured ? '#2D5016' : '#ffffff',
                    borderColor: role.featured ? '#2D5016' : '#e5e7eb',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: role.featured ? 'rgba(255,255,255,0.2)' : '#2D501615' }}
                  >
                    <Icon className="w-6 h-6" style={{ color: role.featured ? '#ffffff' : '#2D5016' }} />
                  </div>
                  <h3 className="font-bold mb-2 text-lg" style={{ color: role.featured ? '#ffffff' : '#111827' }}>{role.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: role.featured ? 'rgba(255,255,255,0.8)' : '#6b7280' }}>{role.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* POR QUÉ TROPERO */}
      <section className="px-6 py-20" style={{ backgroundColor: '#ffffff' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-black text-center mb-16">¿Por qué elegir Tropero?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { icon: Shield, title: 'Transportistas verificados', desc: 'Todos verificados por SENACSA y SITRAP antes de operar en la plataforma' },
              { icon: FileText, title: 'Documentación digital', desc: 'Guía de Traslado y COTA digitalizados, sin papeles ni trámites manuales' },
              { icon: TrendingUp, title: 'Precios transparentes', desc: 'Sin sorpresas ni costos ocultos. Sabés exactamente cuánto pagás antes de contratar' },
              { icon: MapPin, title: 'Rastreo en tiempo real', desc: 'Seguí tu ganado desde la carga hasta la entrega con actualizaciones constantes' },
              { icon: DollarSign, title: 'Pagos en Guaraníes', desc: 'Transacciones seguras en moneda local, sin conversiones ni complicaciones' },
              { icon: Headphones, title: 'Soporte durante el viaje', desc: 'Asistencia disponible por WhatsApp y email durante todo el traslado' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex items-start gap-4 p-5 rounded-xl border border-gray-100" style={{ backgroundColor: '#fafafa' }}>
                  <div
                    className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#2D501615' }}
                  >
                    <Icon className="w-5 h-5" style={{ color: '#2D5016' }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-black mb-1">{item.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="px-6 py-20 text-center" style={{ backgroundColor: '#2D5016' }}>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-4">Empezá hoy mismo</h2>
          <p className="text-lg mb-10" style={{ color: 'rgba(255,255,255,0.8)' }}>
            Registrate gratis y publicá tu primer traslado en minutos.
          </p>
          <button
            onClick={onSignup}
            className="px-10 py-4 font-bold rounded-lg text-lg transition-colors"
            style={{ backgroundColor: '#ffffff', color: '#2D5016' }}
          >
            Registrarte gratis
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 py-8 border-t border-gray-200" style={{ backgroundColor: '#f5f0e8' }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm" style={{ color: '#6b7280' }}>
          <p>© 2026 Tropero. Transporte ganadero en Paraguay.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-black transition-colors">Términos</a>
            <a href="#" className="hover:text-black transition-colors">Privacidad</a>
            <a href="#" className="hover:text-black transition-colors">Ayuda</a>
            {onAdminClick && (
              <button onClick={onAdminClick} className="hover:text-black transition-colors font-medium">
                Admin
              </button>
            )}
          </div>
        </div>
      </footer>

    </div>
  );
}
Reemplazá el archivo completo con este código exacto. No cambies ningún prop ni handler.