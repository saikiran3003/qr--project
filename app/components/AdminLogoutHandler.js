'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLogoutHandler() {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // 1. Detect Browser Back Button Logout handled by middleware
        // The middleware already clears the cookie if user goes to /admin/login.
        // We just need to make sure the page is actually reloaded or the state is updated.

        const handleBeforeUnload = (event) => {
            // This event fires when the window/tab is closed or refreshed.
            // We use a beacon to call the logout API to ensure it's destroyed on the server.
            navigator.sendBeacon('/api/admin/logout');
        };

        // Adding listener for window close/refresh
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [router, pathname]);

    return null;
}
