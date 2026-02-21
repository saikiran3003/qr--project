import { NextResponse } from 'next/server';

export function middleware(request) {
    const { pathname } = request.nextUrl;

    // Log for debugging (this should appear in your terminal)
    console.log(`[Middleware] Processing: ${request.method} ${pathname}`);

    // 1. Identify admin routes
    const isAdminPath = pathname.startsWith('/admin');
    const isLoginPage = pathname === '/admin';
    const isSignupPage = pathname === '/admin/signup';

    // 2. Get session from cookies
    const session = request.cookies.get('admin_session');

    if (isAdminPath) {
        // If it's an admin route but NOT the login or signup page
        if (!isLoginPage && !isSignupPage) {
            if (!session) {
                console.log(`[Middleware] Unauthorized access to ${pathname}, redirecting to /admin`);
                return NextResponse.redirect(new URL('/admin', request.url));
            }
        }

        // If user is ALREADY logged in and tries to go to login page
        if (isLoginPage && session) {
            console.log(`[Middleware] User already logged in, redirecting from /admin to /admin/dashboard`);
            return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }
    }

    return NextResponse.next();
}

// Global matcher to ensure it catches everything
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
