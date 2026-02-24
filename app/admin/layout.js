import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminLogoutHandler from '@/app/components/AdminLogoutHandler';

export default async function AdminLayout({ children }) {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');

    return (
        <>
            <AdminLogoutHandler />
            {children}
        </>
    );
}
