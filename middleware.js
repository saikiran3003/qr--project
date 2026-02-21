import { NextResponse } from 'next/server';

export function middleware(request) {
    const { pathname } = request.nextUrl;

    // Define protected admin routes (everything under /admin/ except /admin itself and /admin/signup)
    const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin' && pathname !== '/admin/signup';

    if (isAdminRoute) {
        const session = request.cookies.get('admin_session');

        if (!session) {
            // No session cookie found, redirect to login page
            const loginUrl = new URL('/admin', request.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: ['/admin/:path*'],
};
