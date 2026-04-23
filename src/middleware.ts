import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') || ''

  if (host.startsWith('admin.')) {
    const url = req.nextUrl.clone()
    const pathname = url.pathname

    // Rewrite vers /admin/* si pas déjà préfixé
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

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|icons).*)'],
}
