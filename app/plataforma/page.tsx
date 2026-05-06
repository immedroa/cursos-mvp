import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

type Lesson = {
  id: string
  title: string
  position: number
}

type Course = {
  id: string
  title: string
  slug: string
  description: string | null
  lessons: Lesson[]
}

export default async function PlataformaPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/acceso')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('email, has_access, points, stellar_address')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    redirect('/acceso')
  }

  if (!profile.has_access) {
    // ... (keep existing pending access UI)
  }

  // ... (keep existing course fetching logic)

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-yellow-400 selection:text-black">
      {/* Sidebar / Header Combo */}
      <header className="border-b border-white/5 bg-[#080808]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image 
              src="/logo.png" 
              alt="Crypto College" 
              width={32} 
              height={32} 
              className="rounded-lg shadow-[0_0_10px_rgba(250,204,21,0.1)]"
            />
            <h1 className="text-lg font-black tracking-tighter uppercase">Mi Aula</h1>
          </div>

          <div className="flex items-center gap-6">
            <span className="hidden md:block text-xs font-bold text-neutral-500 uppercase tracking-widest">{profile.email}</span>
            <form action="/auth/signout" method="post">
              <button className="text-xs font-black uppercase tracking-widest text-neutral-400 hover:text-white border-b-2 border-transparent hover:border-yellow-400 py-1 transition-all">
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-12">
        
        {/* Nueva Sección Stellar & Puntos */}
        <StellarDashboard 
          initialPoints={profile.points || 0} 
          initialStellarAddress={profile.stellar_address} 
        />

        <div className="grid gap-8 lg:grid-cols-3">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* ... (rest of the course list) */}
            {featuredCourse ? (
              <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-white/[0.05] to-transparent p-10 group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                  <svg className="w-40 h-40" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.45l8.1 14.1H3.9L12 5.45z"/></svg>
                </div>
                
                <div className="relative z-10">
                  <span className="inline-block px-3 py-1 bg-yellow-400 text-black text-[10px] font-black uppercase tracking-widest rounded-full mb-6">Empezar aquí</span>
                  <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 leading-none">{featuredCourse.title}</h2>
                  <p className="text-neutral-400 text-lg mb-8 max-w-xl">{featuredCourse.description}</p>
                  
                  <div className="flex items-center gap-4 mb-8">
                     <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-widest">
                       <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                       {featuredCourse.lessons.length} Lecciones
                     </div>
                     <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                     <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Acceso activo</div>
                  </div>

                  <Link href={`/plataforma/${featuredCourse.slug}`} className="inline-block bg-white text-black px-8 py-4 rounded-2xl font-black text-sm hover:bg-yellow-400 transition-colors shadow-lg">
                    ENTRAR AL CURSO
                  </Link>
                </div>
              </section>
            ) : (
              <section className="rounded-[32px] border border-white/10 bg-white/[0.03] p-10 text-center">
                <div className="w-16 h-16 mx-auto bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                   <svg className="w-8 h-8 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h2 className="text-2xl font-black tracking-tight mb-2 uppercase">Aún no hay cursos</h2>
                <p className="text-neutral-400 max-w-md mx-auto">Pronto publicaremos los primeros cursos. Mantente atento a tu correo.</p>
              </section>
            )}

            <div className="space-y-6">
              <h2 className="text-2xl font-black tracking-tight uppercase">Tu Biblioteca</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {courses.map((course) => (
                  <article 
                    key={course.id} 
                    className="p-6 rounded-3xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-all group flex flex-col h-full"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">{course.lessons.length} cápsulas</span>
                      <span className="text-[10px] font-black text-yellow-400/60 uppercase tracking-[0.2em]">Disponible</span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 tracking-tight group-hover:text-yellow-400 transition-colors">{course.title}</h3>
                    <p className="text-sm text-neutral-500 mb-6 line-clamp-2 flex-grow">{course.description}</p>
                    <Link href={`/plataforma/${course.slug}`} className="inline-block text-xs font-black uppercase tracking-widest border-b border-white/20 hover:border-yellow-400 pb-1 transition-all self-start">Ver curso</Link>
                  </article>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <aside className="space-y-6">
            <div className="p-8 rounded-[32px] border border-white/10 bg-[#0A0A0A] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-400/5 blur-2xl"></div>
              <h3 className="text-xl font-black mb-4 uppercase tracking-tight">Status de Acceso</h3>
              <div className="space-y-4">
                <StatusItem label="Membresía" value="Premium Alpha" active />
                <StatusItem label="Vence en" value="Activo" />
                <StatusItem label="Nivel" value="On-Chain Scout" />
              </div>
            </div>

            <div className="p-8 rounded-[32px] border border-yellow-400/20 bg-yellow-400/5 group">
              <h3 className="text-xl font-black mb-4 uppercase tracking-tight text-yellow-400">¿Necesitas ayuda?</h3>
              <p className="text-sm text-neutral-400 mb-6 leading-relaxed">Si tienes problemas con el contenido o tu acceso, nuestro equipo está listo.</p>
              <a 
                href="https://wa.me/51965413449"
                target="_blank"
                className="block w-full text-center bg-yellow-400 text-black py-4 rounded-2xl font-black text-sm hover:scale-[1.02] transition-transform"
              >
                WHATSAPP DIRECTO
              </a>
            </div>

            <div className="p-8 rounded-[32px] border border-white/10 bg-white/[0.02]">
               <div className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] mb-4 text-center">Crypto College Intelligence</div>
               <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                 <div className="h-full bg-yellow-400 w-1/3 rounded-full shadow-[0_0_10px_#FACC15]"></div>
               </div>
            </div>
          </aside>

        </div>
      </div>
    </main>
  )
}

function StatusItem({ label, value, active = false }: { label: string, value: string, active?: boolean }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">{label}</span>
      <span className={`text-xs font-black uppercase tracking-widest ${active ? 'text-yellow-400' : 'text-white'}`}>{value}</span>
    </div>
  )
}
