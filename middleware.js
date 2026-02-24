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

        // If accessing /admin directly → redirect to login
        if (isRootAdmin) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }

        // If accessing protected admin pages without session
        if (!isLoginPage && !isSignupPage && !session) {
            console.log(`[Middleware] Unauthorized access to ${pathname}, redirecting to /admin/login`);
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }

        // If already logged in and trying to access login page → redirect to dashboard
        if (session && (isLoginPage || isSignupPage)) {
            return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};