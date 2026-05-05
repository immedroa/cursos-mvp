import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'

// --- CONSTANTS ---
const WHATSAPP_URL = "https://wa.me/51965413449?text=Hola!%20%F0%9F%91%8B%20Acabo%20de%20yapear%20S%2F%204.90%20para%20acceder%20a%20Crypto%20College.";

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="bg-[#050505] text-white min-h-screen font-sans selection:bg-yellow-400 selection:text-black overflow-x-hidden">
      {/* Dynamic Background Effects */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-400/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-400/5 blur-[120px] rounded-full"></div>
        <div className="absolute inset-0 opacity-[0.05]" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #FFD700 1px, transparent 0)', backgroundSize: '32px 32px' }}>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex justify-between items-center px-6 md:px-12 py-8 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 group cursor-pointer">
          <Image 
            src="/logo.png" 
            alt="Crypto College" 
            width={48} 
            height={48} 
            className="rounded-xl shadow-[0_0_20px_rgba(250,204,21,0.2)] group-hover:scale-105 transition-transform duration-300"
          />
          <span className="text-xl font-black tracking-tighter uppercase">Crypto College</span>
        </div>
        
        <div className="flex items-center gap-8">
          {user ? (
            <Link href="/plataforma" className="text-sm font-bold hover:text-yellow-400 transition-colors uppercase tracking-widest">
              Mi Aula
            </Link>
          ) : (
            <Link href="/acceso" className="text-sm font-bold hover:text-yellow-400 transition-colors uppercase tracking-widest">
              Ingresar
            </Link>
          )}
          <a 
            href={WHATSAPP_URL}
            target="_blank"
            className="bg-white/5 border border-white/10 px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all backdrop-blur-md"
          >
            Soporte
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 px-6 max-w-7xl mx-auto pt-20 pb-32">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400/10 border border-yellow-400/20 rounded-full mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400"></span>
            </span>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-yellow-400">Acceso Total Web3</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black leading-[0.9] tracking-tighter mb-8">
            TU CARRERA, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">ON-CHAIN.</span>
          </h1>

          <p className="text-3xl md:text-4xl text-gray-400 max-w-3xl mb-12 leading-relaxed font-medium">
            Acortamos tu curva de aprendizaje. <span className="text-white">Web3 no es solo código</span>, es el nuevo estándar para todas las profesiones. Inicia hoy.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 items-center">
            <Link 
              href="/acceso" 
              className="group relative w-full sm:w-auto"
            >
              <div className="absolute -inset-1 bg-yellow-400 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
              <div className="relative bg-yellow-400 text-black px-10 py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3">
                EMPEZAR AHORA
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </div>
            </Link>
            
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-[#050505] bg-neutral-800 flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-neutral-700 to-neutral-900"></div>
                  </div>
                ))}
              </div>
              <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                <span className="text-white">+500 profesionales</span> ya dentro
              </div>
            </div>
          </div>
        </div>

        {/* Floating Cards / Visuals */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>}
            title="Curva Corta"
            desc="Contenido directo al grano para que no pierdas tiempo en teoría vacía."
          />
          <FeatureCard 
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>}
            title="Comunidad"
            desc="Conecta con otros profesionales construyendo en el ecosistema."
          />
          <FeatureCard 
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>}
            title="Certificado"
            desc="Valida tus habilidades con un badge on-chain tras finalizar."
          />
        </div>
      </main>

      {/* Pricing / CTA Section */}
      <section className="relative z-10 py-32 px-6 bg-gradient-to-b from-transparent to-[#0a0a0a]">
        <div className="max-w-5xl mx-auto rounded-[40px] border border-white/10 bg-white/[0.02] p-12 md:p-20 text-center overflow-hidden relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"></div>
          
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">OFERTA DE LANZAMIENTO</h2>
          <div className="flex justify-center items-baseline gap-2 mb-8">
            <span className="text-yellow-400 text-8xl font-black tracking-tighter">S/ 4.90</span>
            <span className="text-gray-500 text-xl font-bold uppercase tracking-widest">/ 6 Meses</span>
          </div>
          
          <p className="text-gray-400 text-2xl md:text-3xl mb-12 max-w-3xl mx-auto leading-relaxed">
            Acceso total a todas las rutas de especialización. Pago único vía Yape. Realiza el pago por yape y solicita la activación de tu cuenta por WhatsApp.
          </p>

          <div className="flex justify-center mb-10">
            <div className="bg-white/[0.05] border border-white/10 p-8 rounded-[40px] shadow-2xl backdrop-blur-sm">
              <div className="bg-white p-3 rounded-3xl mb-6 shadow-[0_0_50px_rgba(255,255,255,0.1)] w-fit mx-auto">
                <Image 
                  src="/yape-qr.png" 
                  alt="Yape QR Code" 
                  width={240} 
                  height={240} 
                  className="rounded-2xl aspect-square object-contain"
                />
              </div>
              <p className="text-xl font-black text-yellow-400 uppercase tracking-[0.3em]">
                Escanea para pagar
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <a 
              href={WHATSAPP_URL}
              target="_blank"
              className="bg-white text-black px-12 py-5 rounded-2xl font-black text-xl hover:bg-yellow-400 transition-colors shadow-[0_0_40px_rgba(255,255,255,0.1)]"
            >
              ACTIVAR POR YAPE
            </a>
            <Link 
              href="/plataforma"
              className="bg-white/5 border border-white/10 px-12 py-5 rounded-2xl font-black text-xl hover:bg-white/10 transition-all"
            >
              VER PROGRAMA
            </Link>
          </div>

          <p className="mt-8 text-3xl md:text-4xl font-black text-white uppercase tracking-[0.1em]">
            Yape: 965 413 449
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 text-center border-t border-white/5">
        <p className="text-gray-600 text-[10px] font-bold uppercase tracking-[0.5em]">
          © 2026 Crypto College • Future Proof Your Career
        </p>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] hover:border-yellow-400/40 transition-all group">
      <div className="w-12 h-12 bg-yellow-400/10 text-yellow-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3 uppercase tracking-tight">{title}</h3>
      <p className="text-gray-500 text-base leading-relaxed">{desc}</p>
    </div>
  )
}