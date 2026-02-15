'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-lg shadow-xl rounded-3xl mx-4 md:mx-8 my-6 p-4 md:p-6 sticky top-6 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center text-2xl md:text-3xl shadow-lg shadow-blue-500/20">
              🛡️
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-gray-900 leading-tight">Sistema Anticorrupción</h1>
              <p className="text-xs md:text-sm font-bold text-gray-600 uppercase tracking-wider">Sinaloa, México</p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/denuncia" className="px-5 md:px-6 py-2 md:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-blue-500/40 transition-all active:scale-95">
              Reportar Denuncia
            </Link>
            <Link href="/consulta" className="px-5 md:px-6 py-2 md:py-3 bg-white border-2 border-blue-600 text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-all active:scale-95">
              Consultar Estado
            </Link>
            <Link href="/admin/login" className="px-5 md:px-6 py-2 md:py-3 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all active:scale-95">
              Acceso Admin
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="bg-white/95 backdrop-blur-lg rounded-[2.5rem] shadow-2xl p-8 md:p-16 text-center border border-white/20">
          <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-black mb-6 uppercase tracking-widest border border-blue-100">
            Plataforma 100% Segura y Anónima
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight">
            Tú denuncias, <span className="text-blue-600 underline decoration-blue-200 decoration-8 underline-offset-8">nosotros analizamos</span>.<br />
            Sinaloa avanza.
          </h2>
          <p className="text-lg md:text-xl text-gray-700 font-semibold mb-10 max-w-3xl mx-auto leading-relaxed">
            Un sistema inteligente para reportar actos de corrupción con protección total de identidad.
            Utilizamos IA para priorizar los casos más urgentes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/denuncia" className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xl font-black rounded-2xl hover:shadow-2xl hover:shadow-blue-600/50 transition-all hover:-translate-y-1 active:scale-95">
              🔒 Iniciar Denuncia Anónima
            </Link>
            <Link href="/consulta" className="w-full sm:w-auto px-10 py-5 bg-white border-4 border-blue-600 text-blue-700 text-xl font-black rounded-2xl hover:bg-blue-50 transition-all hover:-translate-y-1 active:scale-95">
              🔍 Consultar con Código
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-20">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon="🔒"
            title="Anonimato Total"
            description="Tu identidad está 100% protegida. No almacenamos datos personales, direcciones IP ni metadatos que puedan identificarte."
          />
          <FeatureCard
            icon="🧠"
            title="Análisis Inteligente"
            description="Nuestro sistema utiliza IA para evaluar la verosimilitud de cada reporte en tiempo real, priorizando los casos críticos con evidencia sólida."
          />
          <FeatureCard
            icon="⚖️"
            title="Proceso Transparente"
            description="A pesar de ser anónimo, recibirás un código único para dar seguimiento a las acciones tomadas por las autoridades correspondientes."
          />
          <FeatureCard
            icon="📊"
            title="Filtrado de Spam"
            description="Algoritmos avanzados que detectan y eliminan reportes masivos o de baja veracidad, asegurando que los recursos lleguen a donde más se necesitan."
          />
          <FeatureCard
            icon="🌍"
            title="Alineado con UNCAC"
            description="Cumple estrictamente con los estándares internacionales de la Convención de las Naciones Unidas contra la Corrupción."
          />
          <FeatureCard
            icon="🔑"
            title="Código de Seguridad"
            description="Al finalizar, se genera un código alfanumérico único. Es tu única llave para acceder al reporte. No hay forma de recuperarlo si se pierde."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-8 py-10 text-center border-t border-blue-800/20">
        <p className="text-blue-200 font-bold opacity-80 uppercase tracking-tighter text-sm">
          © {new Date().getFullYear()} Sistema Anticorrupción Sinaloa - Plataforma Ciudadana de Transparencia
        </p>
        <p className="text-blue-300/60 text-xs mt-2 font-medium">
          Desarrollado conforme a estándares internacionales de protección de denunciantes.
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-xl p-8 hover:shadow-2xl hover:shadow-blue-500/10 transition-all hover:-translate-y-2 border border-white/20 group">
      <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <h3 className="text-2xl font-black text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-700 font-bold leading-relaxed text-sm">{description}</p>
    </div>
  );
}
