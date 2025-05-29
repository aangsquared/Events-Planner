import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Redirect staff users to their dashboard after sign-in
    if (pathname === '/dashboard' && token) {
      if (token.role === 'staff' || token.role === 'admin') {
        return NextResponse.redirect(new URL('/staff', req.url))
      } else {
        // Regular users stay on the main dashboard
        return NextResponse.next()
      }
    }

    // Protect staff-only routes
    if (pathname.startsWith('/staff') ||
      pathname.startsWith('/events/create') ||
      pathname.startsWith('/events/edit')) {

      if (token?.role !== 'staff' && token?.role !== 'admin') {
        return NextResponse.redirect(new URL('/unauthorized', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname

        // Allow public routes and auth-related routes
        if (pathname === '/' ||
          pathname.startsWith('/auth/') ||
          pathname.startsWith('/events') && !pathname.includes('/create') && !pathname.includes('/edit')) {
          return true
        }

        // Require authentication for protected routes
        return !!token
      },
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