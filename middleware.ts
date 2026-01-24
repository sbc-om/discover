import { NextRequest, NextResponse } from 'next/server';

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
    // Only check token presence here to avoid edge JWT issues; server will validate.
    if (!token) {
      const locale = pathname.split('/')[1] || 'en';
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return localeMiddleware(request);
  }

  // Redirect authenticated users away from login page
  if (isPublicRoute && pathname.includes('/login') && token) {
    const locale = pathname.split('/')[1] || 'en';
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  return localeMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
