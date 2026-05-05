import Link from 'next/link'
import Image from 'next/image'
import LoginForm from './login-form'

export default function AccesoPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-400/5 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <Link href="/" className="inline-block group">
            <Image 
              src="/logo.png" 
              alt="Crypto College" 
              width={64} 
              height={64} 
              className="mx-auto mb-6 shadow-[0_0_40px_rgba(250,204,21,0.2)] rounded-2xl rotate-3 group-hover:rotate-12 transition-transform duration-300"
            />
          </Link>
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Bienvenido</h1>
          <p className="text-neutral-500 font-medium tracking-tight">Ingresa tu email para recibir tu llave de acceso.</p>
        </div>

        <div className="bg-white/[0.03] border border-white/10 backdrop-blur-xl p-8 rounded-[32px] shadow-2xl">
          <LoginForm />
          
          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-xs font-bold text-neutral-600 uppercase tracking-widest mb-4">¿No tienes una cuenta?</p>
            <a 
              href="https://wa.me/51965413449" 
              target="_blank"
              className="text-sm font-black text-yellow-400 hover:text-yellow-300 transition-colors uppercase tracking-widest"
            >
              Adquirir acceso por Yape
            </a>
          </div>
        </div>

        <p className="mt-10 text-center text-[10px] font-bold text-neutral-700 uppercase tracking-[0.3em]">
          Crypto College Intelligence Protocol v1.0
        </p>
      </div>
    </main>
  )
}
