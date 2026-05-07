import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StellarDashboard from '@/components/StellarDashboard'

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
    return (
      <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-6 overflow-hidden relative">
        <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-yellow-400/5 blur-[150px] rounded-full"></div>
        <div className="mx-auto max-w-2xl text-center relative z-10">
          <Image 
            src="/logo.png" 
            alt="Crypto College" 
            width={64} 
            height={64} 
            className="mx-auto mb-8 shadow-[0_0_40px_rgba(250,204,21,0.2)] rounded-2xl rotate-3"
          />
          <h1 className="text-5xl font-black tracking-tighter mb-4 uppercase">Acceso Pendiente</h1>
          <p className="text-xl text-neutral-400 mb-8 max-w-md mx-auto">
            Hola, <span className="text-white font-bold">{profile.email}</span>. Tu cuenta está registrada, pero necesitamos validar tu pago para abrir las puertas del aula.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://wa.me/51965413449"
              target="_blank"
              className="w-full sm:w-auto rounded-2xl bg-yellow-400 text-black px-8 py-4 text-sm font-black hover:scale-105 transition-transform shadow-xl shadow-yellow-400/10"
            >
              ACTIVAR POR WHATSAPP
            </a>

            <form action="/auth/signout" method="post" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto rounded-2xl bg-white/5 border border-white/10 px-8 py-4 text-sm font-bold hover:bg-white/10 transition-all">
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </main>
    )
  }

  const { data: coursesData, error: coursesError } = await supabase
    .from('courses')
    .select(`
      id,
      title,
      slug,
      description,
      lessons (
        id,
        title,
        position
      )
    `)
    .eq('is_published', true)
    .order('created_at', { ascending: true })

  if (coursesError) {
    return (
      <main className="min-h-screen bg-[#050505] text-white flex items-center justify-center px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-black uppercase mb-4 text-yellow-400">Error</h1>
          <p className="text-neutral-400 mb-3">Hubo un problema cargando tus cursos.</p>
          <pre className="text-xs text-red-400 whitespace-pre-wrap bg-white/5 p-4 rounded-xl border border-red-400/20">
            {coursesError.message}
          </pre>
        </div>
      </main>
    )
  }

  const courses = ((coursesData ?? []) as Course[]).map((course) => ({
    ...course,
    lessons: [...(course.lessons ?? [])].sort((a, b) => a.position - b.position),
  }))

  const featuredCourse = courses[0] || null

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
            <h1 className="text-sm font-black tracking-[0.2em] uppercase">
              <span className="text-white/40">Crypto College</span>
              <span className="mx-2 text-yellow-400/50">|</span>
              <span className="text-white">Dashboard</span>
            </h1>
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
          featured={
            featuredCourse ? (
              <section className="relative overflow-hidden rounded-[40px] border border-white/10 bg-gradient-to-br from-white/[0.08] to-transparent p-10 group">
                {/* Fondo decorativo sutil */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <Image 
                    src="/fondoflotante.png" 
                    alt="Blockchain background" 
                    fill 
                    className="object-cover object-right opacity-[0.05] group-hover:opacity-[0.08] transition-opacity duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/40 to-transparent"></div>
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

                  <Link href={`/plataforma/${featuredCourse.slug}`} className="inline-block bg-white text-black px-8 py-4 rounded-2xl font-black text-sm hover:bg-yellow-400 transition-colors shadow-lg shadow-white/5">
                    ENTRAR AL CURSO
                  </Link>
                </div>
              </section>
            ) : null
          }
          library={
            <div className="grid gap-6 sm:grid-cols-2">
              {courses.map((course) => (
                <article 
                  key={course.id} 
                  className="p-8 rounded-[32px] border border-white/5 bg-white/[0.01] hover:bg-white/[0.04] transition-all group flex flex-col h-full"
                >
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.2em]">{course.lessons.length} cápsulas</span>
                    <span className="text-[10px] font-black text-yellow-400/40 uppercase tracking-[0.2em]">Disponible</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 tracking-tight group-hover:text-yellow-400 transition-colors">{course.title}</h3>
                  <p className="text-sm text-neutral-500 mb-8 line-clamp-2 flex-grow">{course.description}</p>
                  <Link href={`/plataforma/${course.slug}`} className="inline-block text-xs font-black uppercase tracking-widest border-b border-white/10 hover:border-yellow-400 pb-1 transition-all self-start">Ver curso</Link>
                </article>
              ))}
            </div>
          }
          secondary={
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/40">Status de Acceso</h3>
                <div className="space-y-2">
                  <StatusItem label="Membresía" value="Premium Alpha" active />
                  <StatusItem label="Nivel" value="On-Chain Scout" />
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/40">Soporte</h3>
                <div className="flex gap-4">
                  <a href="https://wa.me/51965413449" target="_blank" className="text-xs font-bold text-neutral-500 hover:text-white transition-colors underline underline-offset-4">WhatsApp Directo</a>
                  <a href="#" className="text-xs font-bold text-neutral-500 hover:text-white transition-colors underline underline-offset-4">Comunidad Discord</a>
                </div>
              </div>
            </div>
          }
        />
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
