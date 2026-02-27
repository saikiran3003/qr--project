'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLogoutHandler() {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // We rely on HTTP-only Session Cookies (admin_session)
        // Session cookies are automatically cleared by the browser when the tab/window is closed,
        // but remain active during page refreshes. This is the standard and correct behavior.
        // There is no need for beforeunload listeners which incorrectly trigger on refreshes.
    }, [router, pathname]);

    return null;
}
