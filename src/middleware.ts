import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
  const host = req.headers.get('host') || ''
  let response = NextResponse.next({ request: req })

  // Rafraîchit la session Supabase sur chaque requête
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          response = NextResponse.next({ request: req })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )
  await supabase.auth.getUser()

  // Rewrite admin subdomain → /admin/*
  if (host.startsWith('admin.')) {
    const url = req.nextUrl.clone()
    const pathname = url.pathname

    if (
      !pathname.startsWith('/admin') &&
      !pathname.startsWith('/login') &&
      !pathname.startsWith('/api') &&
      !pathname.startsWith('/_next') &&
      !pathname.match(/\.\w+$/)
    ) {
      url.pathname = pathname === '/' ? '/admin' : `/admin${pathname}`
      return NextResponse.rewrite(url)
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|icons).*)'],
}
