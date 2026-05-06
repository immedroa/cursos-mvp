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
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-yellow-400/10 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-400/5 blur-[120px] rounded-full"></div>
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #FFD700 1px, transparent 0)', backgroundSize: '40px 40px' }}>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 flex justify-between items-center px-6 md:px-12 py-8 max-w-7xl mx-auto backdrop-blur-sm">
        <div className="flex items-center gap-3 group cursor-pointer">
          <Image 
            src="/logo.png" 
            alt="Crypto College" 
            width={40} 
            height={40} 
            className="rounded-xl shadow-[0_0_20px_rgba(250,204,21,0.2)] group-hover:scale-105 transition-transform duration-300"
          />
          <span className="text-xl font-black tracking-tighter uppercase hidden sm:block">Crypto College</span>
        </div>
        
        <div className="flex items-center gap-8">
          {user ? (
            <Link href="/plataforma" className="text-[10px] font-black hover:text-yellow-400 transition-colors uppercase tracking-[0.3em]">
              Mi Aula
            </Link>
          ) : (
            <Link href="/acceso" className="text-[10px] font-black hover:text-yellow-400 transition-colors uppercase tracking-[0.3em]">
              Ingresar
            </Link>
          )}
          <a 
            href={WHATSAPP_URL}
            target="_blank"
            className="bg-white/5 border border-white/10 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all backdrop-blur-md"
          >
            Soporte
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 max-w-7xl mx-auto pt-20 pb-32 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400/10 border border-yellow-400/20 rounded-full mb-10 animate-in fade-in slide-in-from-top-4 duration-1000">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400"></span>
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-400">Aprende • Gana • Canjea</span>
        </div>

        <h1 className="text-5xl md:text-8xl font-black leading-[0.95] tracking-tighter mb-8 max-w-5xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          APRENDE WEB3 CON UNA <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-200 uppercase">RUTA CLARA.</span>
        </h1>

        <p className="text-xl md:text-2xl text-neutral-400 max-w-3xl mb-12 leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          Crypto College combina formación práctica, gamificación, mentorías y <span className="text-white">recompensas registradas en blockchain</span> para que aprender Web3 se sienta útil y motivador.
        </p>

        <div className="flex flex-col sm:flex-row gap-8 items-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
          <Link href="/acceso" className="group relative w-full sm:w-auto">
            <div className="absolute -inset-1 bg-yellow-400 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
            <div className="relative bg-yellow-400 text-black px-12 py-6 rounded-2xl font-black text-lg flex items-center justify-center gap-3">
              EMPEZAR AHORA
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#050505] bg-neutral-800 overflow-hidden relative">
                  <Image src={i === 1 ? '/avatars/marcelo.png' : `/mentors/mentora-ux.png`} alt="User" fill className="object-cover" />
                </div>
              ))}
            </div>
            <div className="text-[10px] font-black text-neutral-500 uppercase tracking-widest text-left">
              <span className="text-white block">+500 profesionales</span> ya están dentro
            </div>
          </div>
        </div>
      </section>

      {/* Product Preview Section */}
      <section className="relative z-10 px-6 max-w-7xl mx-auto mb-32">
        <div className="relative rounded-[40px] border border-white/10 bg-white/[0.02] p-4 md:p-8 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-t from-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          <Image 
            src="/dashboard-preview.png" 
            alt="Dashboard Preview" 
            width={1200} 
            height={800} 
            className="rounded-[32px] w-full shadow-2xl transition-transform duration-700 group-hover:scale-[1.01]"
          />
        </div>
      </section>

      {/* How it Works - The Loop */}
      <section className="relative z-10 px-6 max-w-7xl mx-auto py-32 border-t border-white/5">
        <div className="text-center mb-20">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-400 mb-4">El Método</p>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">Cómo funciona el loop</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StepCard 
            num="01"
            title="Aprende"
            desc="Cursos directos al grano sobre Blockchain, UX y Estrategia Web3."
          />
          <StepCard 
            num="02"
            title="Gana Puntos"
            desc="Cada lección y reto completado te otorga puntos de experiencia."
          />
          <StepCard 
            num="03"
            title="Canjea"
            desc="Usa tus puntos para desbloquear mentorías 1:1 con expertos."
          />
          <StepCard 
            num="04"
            title="On-Chain"
            desc="Recibe recompensas reales en XLM y registra tu progreso."
          />
        </div>
      </section>

      {/* Differentiator Section */}
      <section className="relative z-10 py-32 bg-white/[0.02] border-y border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-400 mb-4">Diferenciación</p>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-10 uppercase">
              NO ES OTRO CURSO <br />
              <span className="text-neutral-600">DE TEORÍA VACÍA.</span>
            </h2>
            <div className="space-y-8">
              <DiffItem 
                title="Visible y Verificable"
                desc="Tu avance no se queda en una base de datos privada; se registra en la red Stellar para que el mundo vea tu compromiso."
              />
              <DiffItem 
                title="Foco en Ejecución"
                desc="Hecho para estudiantes, founders y profesionales que quieren entrar a Web3 sin perder meses en tecnicismos."
              />
              <DiffItem 
                title="Acceso a Mentores"
                desc="Aprender solo es difícil. El sistema te empuja a conectar con mentores reales mediante el canje de tus logros."
              />
            </div>
          </div>
          <div className="relative">
             <div className="aspect-square bg-gradient-to-br from-yellow-400/20 to-transparent rounded-[60px] border border-yellow-400/10 flex items-center justify-center p-12">
                <div className="text-center">
                   <div className="text-8xl mb-6">🚀</div>
                   <h3 className="text-2xl font-black uppercase tracking-widest mb-4">Acelera tu entrada</h3>
                   <p className="text-neutral-500 text-sm max-w-xs mx-auto">Crypto College convierte el aprendizaje en una experiencia práctica y gamificada.</p>
                </div>
             </div>
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-400/10 blur-3xl rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Pricing / CTA Section */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-5xl mx-auto rounded-[60px] border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-12 md:p-24 text-center overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-50"></div>
          
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-yellow-400 mb-8">Oferta de Lanzamiento</p>
          <h2 className="text-5xl md:text-8xl font-black mb-10 tracking-tighter leading-none">ÚNETE POR <br /> S/ 4.90</h2>
          
          <p className="text-neutral-400 text-xl md:text-2xl mb-16 max-w-2xl mx-auto leading-relaxed">
            Acceso total por 6 meses. Gamificación activa, recompensas en XLM y mentorías 1:1 incluidas.
          </p>

          <div className="flex flex-col items-center gap-12">
            <div className="bg-white/5 border border-white/10 p-10 rounded-[50px] backdrop-blur-sm relative group">
              <div className="bg-white p-4 rounded-[40px] mb-8 shadow-[0_0_60px_rgba(255,255,255,0.05)] transition-transform group-hover:scale-[1.02]">
                <Image 
                  src="/yape-qr.png" 
                  alt="Yape QR Code" 
                  width={240} 
                  height={240} 
                  className="rounded-3xl aspect-square object-contain"
                />
              </div>
              <p className="text-xs font-black text-yellow-400 uppercase tracking-[0.4em]">965 413 449</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl">
              <a 
                href={WHATSAPP_URL}
                target="_blank"
                className="flex-1 bg-white text-black px-12 py-6 rounded-[24px] font-black text-lg hover:bg-yellow-400 transition-all hover:scale-[1.02] shadow-2xl shadow-white/5 uppercase tracking-widest"
              >
                Activar por WhatsApp
              </a>
              <Link 
                href="/acceso"
                className="flex-1 bg-white/5 border border-white/10 px-12 py-6 rounded-[24px] font-black text-lg hover:bg-white/10 transition-all uppercase tracking-widest"
              >
                Crear mi cuenta
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-20 px-6 text-center border-t border-white/5">
        <div className="flex justify-center gap-4 mb-10 opacity-30">
           <div className="w-8 h-8 rounded-full border border-white/20"></div>
           <div className="w-8 h-8 rounded-full border border-white/20"></div>
           <div className="w-8 h-8 rounded-full border border-white/20"></div>
        </div>
        <p className="text-neutral-600 text-[9px] font-black uppercase tracking-[0.6em]">
          © 2026 Crypto College • Future Proof Your Career on Stellar
        </p>
      </footer>
    </div>
  )
}

function StepCard({ num, title, desc }: { num: string, title: string, desc: string }) {
  return (
    <div className="p-10 rounded-[40px] border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all group relative overflow-hidden">
      <span className="block text-4xl font-black text-white/5 mb-6 group-hover:text-yellow-400/10 transition-colors">{num}</span>
      <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">{title}</h3>
      <p className="text-neutral-500 text-sm leading-relaxed">{desc}</p>
      <div className="absolute bottom-0 left-0 w-0 h-1 bg-yellow-400 group-hover:w-full transition-all duration-500"></div>
    </div>
  )
}

function DiffItem({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="flex gap-6">
      <div className="flex-shrink-0 w-1 bg-yellow-400/20 rounded-full overflow-hidden">
        <div className="w-full h-1/3 bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]"></div>
      </div>
      <div>
        <h4 className="text-xl font-black uppercase tracking-tight mb-2">{title}</h4>
        <p className="text-neutral-500 text-base leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}