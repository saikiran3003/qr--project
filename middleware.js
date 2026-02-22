import { NextResponse } from 'next/server';

export function middleware(request) {
    const { pathname } = request.nextUrl;

    // Log for debugging (this should appear in your terminal)
    console.log(`[Middleware] Processing: ${request.method} ${pathname}`);

    // 1. Identify admin routes
    const isAdminPath = pathname.startsWith('/admin');
    const isLoginPage = pathname === '/admin/login';
    const isSignupPage = pathname === '/admin/signup';
    const isRootAdmin = pathname === '/admin';

    // 2. Get session from cookies
    const session = request.cookies.get('admin_session');

    if (isAdminPath) {
        // If it's the root /admin, allow it to redirect (handled by page.js) 
        // OR handle it here for faster response
        if (isRootAdmin) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }

        // If it's an admin route but NOT the login or signup page
        if (!isLoginPage && !isSignupPage) {
            if (!session) {
                console.log(`[Middleware] Unauthorized access to ${pathname}, redirecting to /admin/login`);
                return NextResponse.redirect(new URL('/admin/login', request.url));
            }
        }

        // Note: Removed redirect from login to dashboard when session exists
        // to allow the auto-logout logic on the login page to trigger.
    }

    return NextResponse.next();
}

// Global matcher to ensure it catches everything
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
