import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Redirect based on role after login
    if (pathname === '/dashboard' && token) {
      if (token.role === 'staff' || token.role === 'admin') {
        return NextResponse.next()
      } else {
        // Regular users can access dashboard but with limited features
        return NextResponse.next()
      }
    }

    // Protect staff-only routes
    if (pathname.startsWith('/events/create') || 
        pathname.startsWith('/events/edit') ||
        pathname.startsWith('/dashboard/events') ||
        pathname.startsWith('/dashboard/registrations')) {
      
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

        // Allow public routes
        if (pathname === '/' || 
            pathname === '/auth/signin' || 
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
    '/events/create',
    '/events/edit/:path*',
    '/api/events/:path*'
  ]
}