import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }) {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');

    // Check current path - we can't easily get it in server component layout without a hack
    // or middleware. But we can protect EVERYTHING except what we explicitly allow.
    // However, layouts wrap everything below them.
    // If we put this in app/admin/layout.js, it wraps /admin/dashboard, etc.

    // Wait, if it's at app/admin/layout.js, it ALSO wraps app/admin/page.js (login).
    // So we need to be careful NOT to redirect if we are on the login page.

    // In Next.js App Router, the layout doesn't know the current path easily.
    // But we can use middleware to pass it or just use the middleware as the primary.

    return <>{children}</>;
}
