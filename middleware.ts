import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = ['/dashboard'];

// Routes that should redirect to home if already authenticated
const authRoutes = ['/account/login', '/account/register'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check for accessToken cookie (set by server actions after login)
    const accessToken = request.cookies.get('accessToken')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;

    // User is authenticated if they have an accessToken
    const isAuthenticated = !!accessToken;

    // Log for debugging with full cookie details
    console.log('[Middleware] 🔍', {
        pathname,
        isAuthenticated,
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        accessTokenPreview: accessToken ? `${accessToken.substring(0, 20)}...` : 'NONE',
        allCookies: request.cookies.getAll().map(c => c.name),
    });

    // Protect dashboard routes
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    if (isProtectedRoute && !isAuthenticated) {
        console.log('[Middleware] Redirecting to login - protected route without auth');
        const url = new URL('/account/login', request.url);
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
    }

    // Redirect authenticated users away from auth pages
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
    if (isAuthRoute && isAuthenticated) {
        console.log('[Middleware] Redirecting to home - already authenticated');
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc.)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
