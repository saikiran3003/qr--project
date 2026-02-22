"use client";

import { Menu } from "lucide-react";

export default function MobileHeader({ onToggleSidebar }) {
    return (
        <header className="lg:hidden h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sticky top-0 z-40">
            <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xs">QR</span>
                </div>
                <h1 className="text-lg font-bold text-gray-800">Admin Panel</h1>
            </div>
            <button
                onClick={onToggleSidebar}
                className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-600"
                aria-label="Toggle Sidebar"
            >
                <Menu size={24} />
            </button>
        </header>
    );
}
