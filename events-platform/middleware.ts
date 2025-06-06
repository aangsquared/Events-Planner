import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Allow public routes
    if (pathname === '/' ||
      pathname.startsWith('/auth/') ||
      pathname === '/events' ||
      (pathname.startsWith('/events/') && !pathname.includes('/staff'))) {
      return NextResponse.next()
    }

    // Require authentication for all other routes
    if (!token) {
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }

    // Redirect staff users to their dashboard after sign-in
    if (pathname === '/dashboard' && token.role === 'staff') {
      return NextResponse.redirect(new URL('/staff/dashboard', req.url))
    }

    // Protect staff-only routes
    if (pathname.startsWith('/staff') ||
      pathname.includes('/events/staff')) {
      if (token.role !== 'staff' && token.role !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorised', req.url))
      }
    }

    // Protect user-only routes
    if (pathname.startsWith('/dashboard')) {
      if (token.role === 'staff' || token.role === 'admin') {
        return NextResponse.redirect(new URL('/staff/dashboard', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/staff/:path*',
    '/events/create',
    '/events/edit/:path*',
    '/api/events/:path*'
  ]
}