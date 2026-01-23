import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Supported locales
const locales = ['en', 'ar'];
const defaultLocale = 'en';

// Protected routes that require authentication
const protectedRoutes = ['/dashboard'];
const publicRoutes = ['/login', '/'];

// Simple locale middleware
function localeMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if pathname already has a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // Detect locale from Accept-Language header or use default
  const acceptLanguage = request.headers.get('Accept-Language') || '';
  const detectedLocale = locales.find((locale) => acceptLanguage.includes(locale)) || defaultLocale;
  
  // Redirect to locale-prefixed path
  const newUrl = new URL(`/${detectedLocale}${pathname}`, request.url);
  return NextResponse.redirect(newUrl);
}

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
    const response = localeMiddleware(request);
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

  return localeMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
