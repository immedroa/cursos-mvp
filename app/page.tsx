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
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-yellow-400/10 blur-[180px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-yellow-400/5 blur-[150px] rounded-full"></div>
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #FFD700 1px, transparent 0)', backgroundSize: '48px 48px' }}>
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
      <section className="relative z-10 px-6 max-w-7xl mx-auto pt-20 pb-20 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-400/10 border border-yellow-400/20 rounded-full mb-10 animate-in fade-in slide-in-from-top-4 duration-1000">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400"></span>
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-400">Aprende • Demuestra • Desbloquea</span>
        </div>

        <h1 className="text-5xl md:text-8xl font-black leading-[0.95] tracking-tighter mb-8 max-w-5xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          NO SOLO ESTUDIAS WEB3: <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-200 uppercase">DEMUESTRAS TU AVANCE.</span>
        </h1>

        <p className="text-xl md:text-2xl text-neutral-400 max-w-3xl mb-12 leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
          Crypto College combina formación práctica, gamificación, mentorías y <span className="text-white">recompensas registradas en blockchain</span> para que aprender Web3 se sienta útil, visible y motivador.
        </p>

        <div className="flex flex-col sm:flex-row gap-8 items-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 mb-20">
          <Link href="/acceso" className="group relative w-full sm:w-auto">
            <div className="absolute -inset-1 bg-yellow-400 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
            <div className="relative bg-yellow-400 text-black px-12 py-6 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-transform hover:scale-[1.02]">
              EMPEZAR AHORA
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-[#050505] bg-neutral-800 overflow-hidden relative">
                  <Image src={`/avatars/student-${i}.png`} alt={`Student ${i}`} fill className="object-cover" />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-[#050505] bg-yellow-400 flex items-center justify-center text-[10px] font-black text-black relative z-10">
                +500
              </div>
            </div>
            <div className="text-[10px] font-black text-neutral-500 uppercase tracking-widest text-left leading-tight">
              <span className="text-white block">PROFESIONALES</span> 
              YA ESTÁN DENTRO
            </div>
          </div>
        </div>

        {/* Video Embed Section */}
        <div className="w-full max-w-5xl aspect-video rounded-[40px] overflow-hidden border border-white/10 bg-white/[0.02] shadow-[0_0_80px_rgba(250,204,21,0.05)] relative group">
          <iframe 
            width="100%" 
            height="100%" 
            src="https://www.youtube.com/embed/Qxdi_x5WOuw?rel=0&modestbranding=1" 
            title="Crypto College - Aprende Web3" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowFullScreen
            loading="lazy"
            className="grayscale-[0.5] group-hover:grayscale-0 transition-all duration-700"
          ></iframe>
          <div className="absolute inset-0 pointer-events-none border-[1px] border-white/5 rounded-[40px]"></div>
        </div>
      </section>

      {/* How it Works - The Loop */}
      <section className="relative z-10 px-6 max-w-7xl mx-auto py-32 border-t border-white/5">
        <div className="text-center mb-20">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-yellow-400 mb-4">El Método</p>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">CÓMO FUNCIONA EL LOOP</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StepCard 
            num="01"
            title="Aprende"
            desc="Rutas claras sobre Blockchain, UX y Estrategia sin perderte en tecnicismos irrelevantes."
          />
          <StepCard 
            num="02"
            title="Gana Puntos"
            desc="Demuestra tu avance completando retos y lecciones. Tu esfuerzo tiene valor medible."
          />
          <StepCard 
            num="03"
            title="Desbloquea"
            desc="Canjea tus puntos por mentorías 1:1, merch exclusivo o entradas a eventos privados."
          />
          <StepCard 
            num="04"
            title="On-Chain"
            desc="Recibe recompensas en XLM y registra tus logros de forma verificable en la red Stellar."
          />
        </div>
      </section>

      {/* Differentiator Section */}
      <section className="relative z-10 py-32 bg-white/[0.02] border-y border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-center">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-yellow-400 mb-6">EL DIFERENCIAL</p>
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-none mb-12 uppercase">
              NO ES OTRO <br />
              <span className="text-neutral-700">CURSO MÁS.</span>
            </h2>
            <div className="space-y-10">
              <DiffItem 
                title="Visible y Verificable"
                desc="Tu avance no se queda en una base de datos privada; se registra en la red Stellar para que el mundo vea tu compromiso real."
              />
              <DiffItem 
                title="Foco en Ejecución"
                desc="Hecho para estudiantes, founders y profesionales que quieren entrar a Web3 sin perder meses en teoría vacía."
              />
              <DiffItem 
                title="Conexión Directa"
                desc="Aprender solo es difícil. El sistema te empuja a conectar con expertos reales mediante el canje de tus logros."
              />
            </div>
          </div>
          
          <div className="relative">
            {/* Manifest-Style Statement Block */}
            <div className="relative z-10 p-12 md:p-16 rounded-[60px] bg-gradient-to-br from-yellow-400 to-yellow-600 text-black shadow-2xl shadow-yellow-400/20 rotate-2 hover:rotate-0 transition-transform duration-500">
               <div className="text-6xl mb-8">💎</div>
               <h3 className="text-3xl md:text-4xl font-black uppercase leading-tight mb-6">
                 TRANSFORMAMOS EL <br /> APRENDIZAJE EN <br /> ACTIVO DIGITAL.
               </h3>
               <p className="text-black/80 font-bold text-lg leading-relaxed">
                 En Crypto College no solo consumes contenido; construyes una identidad profesional verificable on-chain mientras desbloqueas el ecosistema.
               </p>
               <div className="mt-10 pt-10 border-t border-black/10 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border-2 border-black/20 flex items-center justify-center font-black">CC</div>
                  <span className="text-xs font-black uppercase tracking-widest">Future Proof Your Career</span>
               </div>
            </div>
            {/* Decorative background glow */}
            <div className="absolute -inset-10 bg-yellow-400/20 blur-[100px] rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Pricing / CTA Section */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-5xl mx-auto rounded-[60px] border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-12 md:p-24 text-center overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-50"></div>
          
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-[0.2em] text-yellow-400 mb-6">OFERTA DE LANZAMIENTO</h2>
          <div className="inline-block px-8 py-3 bg-white/5 border border-white/10 rounded-full mb-10 text-[10px] font-black uppercase tracking-[0.4em] text-neutral-400">
            Únete a la comunidad fundadora
          </div>

          <h3 className="text-6xl md:text-9xl font-black mb-10 tracking-tighter leading-none flex flex-col md:flex-row items-center justify-center gap-4">
            <span className="line-through text-neutral-700 text-4xl md:text-6xl">S/ 4.90</span>
            <span className="text-yellow-400">ACCESO GRATIS</span>
          </h3>
          
          <p className="text-neutral-400 text-xl md:text-2xl mb-16 max-w-2xl mx-auto leading-relaxed">
            Acceso total al BETA. Gamificación activa, recompensas en XLM y mentorías 1:1 incluidas.
          </p>

          <div className="flex flex-col items-center gap-12">
            <div className="bg-white/5 border border-white/10 p-12 rounded-[50px] backdrop-blur-sm relative group shadow-2xl overflow-hidden">
              {/* Cruz encima del cuadro de pago */}
              <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
                <div className="relative w-full h-full">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-2 bg-red-500/80 rotate-45"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-2 bg-red-500/80 -rotate-45"></div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-[40px] mb-8 shadow-[0_0_60px_rgba(255,255,255,0.05)] transition-transform group-hover:scale-[1.02] opacity-40 grayscale">
                <Image 
                  src="/yape-qr.png" 
                  alt="Yape QR Code" 
                  width={240} 
                  height={240} 
                  className="rounded-3xl aspect-square object-contain"
                />
              </div>
              <p className="text-3xl md:text-5xl font-black text-white/30 uppercase tracking-tight mb-2">965 413 449</p>
              <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em] relative z-30 bg-black/80 px-2 py-1 rounded">No requerido para el BETA</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl">
              <a 
                href={WHATSAPP_URL}
                target="_blank"
                className="flex-[1.5] bg-white text-black px-12 py-7 rounded-[28px] font-black text-xl hover:bg-yellow-400 transition-all hover:scale-[1.02] shadow-2xl shadow-white/5 uppercase tracking-widest flex items-center justify-center gap-3"
              >
                Activar por WhatsApp
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .004 5.408 0 12.044c0 2.123.554 4.197 1.608 6.037L0 24l6.105-1.602a11.834 11.834 0 005.937 1.604h.005c6.631 0 12.046-5.408 12.05-12.044a11.813 11.813 0 00-3.542-8.509z"/></svg>
              </a>
              <Link 
                href="/acceso"
                className="flex-1 bg-white/5 border border-white/10 px-12 py-7 rounded-[28px] font-black text-xl hover:bg-white/10 hover:border-white/30 transition-all uppercase tracking-widest flex items-center justify-center gap-2 group"
              >
                Crear mi cuenta
                <svg className="w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
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