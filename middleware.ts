import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Supported locales
const locales = ['en', 'ar'];
const defaultLocale = 'en';

// Protected routes that require authentication
const protectedRoutes = ['/dashboard'];
const publicRoutes = ['/login', '/'];

// Verify JWT token
async function verifyToken(token: string): Promise<boolean> {
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'
    );
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

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

export default async function middleware(request: NextRequest) {
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
  
  // Verify token if it exists
  const isValidToken = token ? await verifyToken(token) : false;
  
  if (isProtectedRoute) {
    if (!token || !isValidToken) {
      const locale = pathname.split('/')[1] || 'en';
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set('redirect', pathname);
      
      // Clear invalid token
      const response = NextResponse.redirect(loginUrl);
      if (token && !isValidToken) {
        response.cookies.delete('auth-token');
      }
      return response;
    }

    return localeMiddleware(request);
  }

  // Redirect authenticated users away from login page
  if (isPublicRoute && pathname.includes('/login') && isValidToken) {
    const locale = pathname.split('/')[1] || 'en';
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }
  
  // Clear invalid token on public routes
  if (token && !isValidToken) {
    const response = localeMiddleware(request);
    response.cookies.delete('auth-token');
    return response;
  }

  return localeMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
