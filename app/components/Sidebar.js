"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, List, LogOut, ShieldCheck, Plus, Megaphone } from "lucide-react";
import Swal from "sweetalert2";

export default function Sidebar({ isOpen, onClose }) {
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        // Close sidebar on mobile when route changes
        if (window.innerWidth < 1024 && onClose) {
            onClose();
        }
    }, [pathname]);

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: "Logout",
            text: "Are you sure you want to logout?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#2563eb",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, logout"
        });

        if (result.isConfirmed) {
            try {
                const res = await fetch("/api/admin/logout", { method: "POST" });
                if (res.ok) {
                    localStorage.removeItem('adminToken');
                    sessionStorage.removeItem("isLoggedIn");

                    await Swal.fire({
                        title: "Logout Successful",
                        text: "You have been logged out.",
                        icon: "success",
                        timer: 1500,
                        showConfirmButton: false
                    });

                    router.push('/admin/login');
                } else {
                    throw new Error("Logout failed");
                }
            } catch (error) {
                console.error("Logout error:", error);
                Swal.fire("Error", "Logout failed. Please try again.", "error");
            }
        }
    };

    const navItems = [
        { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { label: "Categories", href: "/admin/categories", icon: List },
        { label: "Manage Business", href: "/admin/manage-business", icon: ShieldCheck },
        { label: "Manage Ads", href: "/admin/ads", icon: Megaphone },
    ];

    return (
        <>
            {/* Backdrop for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity duration-300"
                    onClick={onClose}
                />
            )}

            <div className={`fixed left-0 top-0 h-[100dvh] w-64 bg-white border-r border-gray-100 flex flex-col shadow-sm z-50 transition-transform duration-300 transform ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                }`}>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                                <span className="text-white font-bold text-xl">QR</span>
                            </div>
                            <span className="font-bold text-xl text-gray-800 tracking-tight">Admin</span>
                        </div>
                        {/* Close button for mobile */}
                        <button
                            onClick={onClose}
                            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-400"
                        >
                            <Plus className="rotate-45" size={24} />
                        </button>
                    </div>

                    <nav className="space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                        ? "bg-blue-50 text-blue-600 shadow-sm shadow-blue-100/50"
                                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                                        }`}
                                >
                                    <Icon size={20} className={isActive ? "text-blue-600" : "text-gray-400 group-hover:text-gray-500"} />
                                    <span className="font-bold">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="mt-auto p-6 border-t border-gray-50">
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-3 w-full text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 group"
                    >
                        <LogOut size={20} className="text-red-400 group-hover:text-red-500" />
                        <span className="font-bold">Logout</span>
                    </button>
                </div>
            </div>
        </>
    );
}
