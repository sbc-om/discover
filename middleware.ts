import createIntlMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Protected routes that require authentication
const protectedRoutes = ['/dashboard'];
const publicRoutes = ['/login', '/'];

// Create i18n middleware
const intlMiddleware = createIntlMiddleware({
  locales: ['en', 'ar'],
  defaultLocale: 'en',
  localePrefix: 'always'
});

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if it's a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.includes(route)
  );
  
  const isPublicRoute = publicRoutes.some((route) =>
    pathname === route || pathname.includes(route)
  );

  // Get token from cookie
  const token = request.cookies.get('auth-token')?.value;
  
  if (isProtectedRoute) {
    // Verify token for protected routes
    if (!token) {
      const locale = pathname.split('/')[1] || 'en';
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const payload = verifyToken(token);
    if (!payload) {
      // Invalid token - clear cookie and redirect to login
      const locale = pathname.split('/')[1] || 'en';
      const response = NextResponse.redirect(new URL(`/${locale}/login`, request.url));
      response.cookies.delete('auth-token');
      return response;
    }

    // Add user info to headers for use in route handlers
    const response = intlMiddleware(request);
    response.headers.set('x-user-id', payload.userId);
    response.headers.set('x-user-email', payload.email);
    response.headers.set('x-user-role', payload.roleName);
    return response;
  }

  // Redirect authenticated users away from login page
  if (isPublicRoute && pathname.includes('/login') && token) {
    const payload = verifyToken(token);
    if (payload) {
      const locale = pathname.split('/')[1] || 'en';
      return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
