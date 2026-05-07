import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const protectedPaths = ['/dashboard', '/plataforma']
  const isProtected = protectedPaths.some(p =>
    request.nextUrl.pathname.startsWith(p)
  )

  // Sin sesión intenta entrar a ruta protegida → /acceso
  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/acceso', request.url))
  }

  // Con sesión va a /acceso → redirige a la plataforma
  if (request.nextUrl.pathname === '/acceso' && user) {
    return NextResponse.redirect(new URL('/plataforma', request.url))
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/plataforma/:path*', '/acceso'],
}
