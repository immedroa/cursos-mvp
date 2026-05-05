import Link from 'next/link'
import Image from 'next/image'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

type Lesson = {
  id: string
  title: string
  description: string | null
  position: number
  video_url: string | null
}

type Course = {
  id: string
  title: string
  slug: string
  description: string | null
  lessons: Lesson[]
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/acceso')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('email, has_access')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/acceso')
  }

  if (!profile.has_access) {
    redirect('/plataforma')
  }

  const { data: course, error } = await supabase
    .from('courses')
    .select(`
      id,
      title,
      slug,
      description,
      lessons (
        id,
        title,
        description,
        position,
        video_url
      )
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error || !course) {
    notFound()
  }

  const lessons = [...(course.lessons ?? [])].sort((a, b) => a.position - b.position)
  
  // Buscar la primera cápsula con video disponible para el botón principal
  const firstPlayableLesson = lessons.find(l => l.video_url !== null)

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-yellow-400 selection:text-black font-sans">
      {/* 1. Encabezado superior simple */}
      <header className="border-b border-white/5 bg-[#080808]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image 
              src="/logo.png" 
              alt="Crypto College" 
              width={32} 
              height={32} 
              className="rounded-lg shadow-[0_0_10px_rgba(250,204,21,0.1)]"
            />
            <h1 className="text-lg font-black tracking-tighter uppercase hidden sm:block">Mi Aula</h1>
          </div>

          <Link
            href="/plataforma"
            className="text-xs font-black uppercase tracking-widest text-neutral-400 hover:text-white border-b-2 border-transparent hover:border-yellow-400 py-1 transition-all"
          >
            ← Volver
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-12">
        {/* 2. Hero del curso */}
        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] p-10 mb-12">
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-400 mb-4">Programa de Especialización</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 leading-none">{course.title}</h2>
            <p className="text-neutral-400 text-lg max-w-2xl mb-8 leading-relaxed">{course.description}</p>

            <div className="flex flex-wrap items-center gap-4 mb-8">
              <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-widest rounded-full border border-white/10 px-4 py-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                {lessons.length} Cápsulas
              </div>
              <div className="text-xs font-bold text-neutral-400 uppercase tracking-widest rounded-full border border-white/10 px-4 py-2">
                Acceso activo
              </div>
            </div>

            {/* 5. Lógica de utilidad real: Acción principal en el hero */}
            {firstPlayableLesson && (
              <a
                href={firstPlayableLesson.video_url!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-white text-black px-8 py-4 rounded-2xl font-black text-sm hover:bg-yellow-400 transition-colors shadow-lg"
              >
                EMPEZAR CURSO
              </a>
            )}
          </div>
        </div>

        {/* 3. Sección principal de contenido */}
        <div className="space-y-6">
          <h3 className="text-2xl font-black tracking-tight uppercase mb-8">Contenido del Curso</h3>
          
          <div className="grid gap-6">
            {lessons.map((lesson) => (
              <article
                key={lesson.id}
                className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 hover:border-yellow-400/40 transition-all group flex flex-col md:flex-row gap-8 items-start md:items-center relative overflow-hidden"
              >
                {/* 3. Número de cápsula, título, descripción */}
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl font-black text-neutral-500 group-hover:text-yellow-400 transition-colors">
                  {lesson.position}
                </div>

                <div className="flex-grow">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-2">Cápsula {lesson.position}</p>
                  <h3 className="text-2xl font-bold mb-3 tracking-tight">{lesson.title}</h3>
                  <p className="text-sm text-neutral-400 leading-relaxed max-w-xl">
                    {lesson.description || 'Contenido disponible dentro de la plataforma.'}
                  </p>
                </div>

                {/* 4. Acción principal por cápsula */}
                <div className="flex-shrink-0 w-full md:w-auto mt-4 md:mt-0">
                  {lesson.video_url ? (
                    <a
                      href={lesson.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center bg-white text-black px-8 py-4 rounded-2xl font-black text-sm hover:bg-yellow-400 transition-colors shadow-lg"
                    >
                      VER CONTENIDO
                    </a>
                  ) : (
                    <button
                      disabled
                      className="block w-full text-center border border-white/10 bg-transparent text-neutral-600 px-8 py-4 rounded-2xl font-black text-sm cursor-not-allowed uppercase tracking-widest"
                    >
                      PRÓXIMAMENTE
                    </button>
                  )}
                </div>
              </article>
            ))}
            
            {lessons.length === 0 && (
              <div className="p-12 text-center rounded-3xl border border-white/10 bg-white/[0.02]">
                <p className="text-neutral-500 font-bold uppercase tracking-widest">Aún no hay cápsulas disponibles para este curso.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
