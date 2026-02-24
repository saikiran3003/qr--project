import { NextResponse } from 'next/server';

export function middleware(request) {
    const { pathname } = request.nextUrl;

    console.log(`[Middleware] Processing: ${request.method} ${pathname}`);

    const isAdminPath = pathname.startsWith('/admin');
    const isLoginPage = pathname === '/admin/login';
    const isSignupPage = pathname === '/admin/signup';
    const isRootAdmin = pathname === '/admin';

    const session = request.cookies.get('admin_session');

    if (isAdminPath) {
        // If already logged in and trying to access login page → clear session and allow (implements Browser Back Logout)
        if (session && (isLoginPage || isSignupPage)) {
            console.log(`[Middleware] Session found on login/signup page. Clearing session for secure logout.`);
            const response = NextResponse.next();
            response.cookies.delete('admin_session');
            // Force no-cache on the login page as well when logging out
            response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate');
            return response;
        }

        // If accessing /admin directly → redirect to login
        if (isRootAdmin) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }

        // If accessing protected admin pages without session
        if (!isLoginPage && !isSignupPage && !session) {
            console.log(`[Middleware] Unauthorized access to ${pathname}, redirecting to /admin/login`);
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    const response = NextResponse.next();

    // Prevent caching for all admin routes strictly
    if (isAdminPath) {
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
    }

    return response;
}

export const config = {
    matcher: ['/admin/:path*'],
};