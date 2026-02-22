"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, List, LogOut, ShieldCheck, Plus } from "lucide-react";
import Swal from "sweetalert2";

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [categories, setCategories] = useState(["Food"]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            // Client-side protection fallback (using sessionStorage for tab-close auto-logout)
            const isLoggedIn = sessionStorage.getItem("isLoggedIn");
            if (isLoggedIn !== "true" && pathname !== "/admin/login" && pathname !== "/admin/signup" && pathname !== "/admin") {
                router.push("/admin/login");
                return;
            }

            const saved = localStorage.getItem("categories");
            if (saved) {
                setCategories(JSON.parse(saved));
            } else {
                localStorage.setItem("categories", JSON.stringify(["Food"]));
            }

            const handleUpdate = () => {
                const updated = localStorage.getItem("categories");
                if (updated) setCategories(JSON.parse(updated));
            };

            window.addEventListener("categoriesUpdated", handleUpdate);
            return () => window.removeEventListener("categoriesUpdated", handleUpdate);
        }
    }, [pathname, router]);

    const handleAddCategory = async (e) => {
        e.stopPropagation();
        const { value: newCat } = await Swal.fire({
            title: "Add New Category",
            input: "text",
            inputPlaceholder: "Enter category name",
            showCancelButton: true,
            confirmButtonText: "Add",
            inputValidator: (value) => {
                if (!value || !value.trim()) {
                    return "Category name cannot be empty!";
                }
            }
        });

        if (newCat && newCat.trim()) {
            const updatedCategories = [...categories, newCat.trim()];
            localStorage.setItem("categories", JSON.stringify(updatedCategories));
            window.dispatchEvent(new Event("categoriesUpdated"));
        }
    };

    const handleLogout = async () => {
        try {
            const res = await fetch("/api/admin/logout", {
                method: "POST",
            });

            if (res.ok) {
                Swal.fire({
                    title: "Logout Successful",
                    icon: "success",
                    confirmButtonText: "OK",
                    confirmButtonColor: "#ef4444",
                    timer: 2000,
                    timerProgressBar: true
                }).then(() => {
                    sessionStorage.removeItem("isLoggedIn");
                    localStorage.removeItem("token");
                    router.push("/admin/login");
                });
            }
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const menuItems = [
        { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    ];

    return (
        <div className="fixed left-0 top-0 h-[100dvh] w-64 bg-white border-r border-gray-100 flex flex-col shadow-sm z-50">
            <div className="p-6 border-b border-gray-50 flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <ShieldCheck className="text-white" size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
            </div>

            <nav className="p-4 space-y-2 mt-4">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                ? "bg-blue-50 text-blue-600 font-semibold"
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                                }`}
                        >
                            <Icon size={20} />
                            <span>{item.name}</span>
                        </Link>
                    );
                })}

                {/* Categories Section */}
                <div className="space-y-1">
                    <Link
                        href="/admin/categories"
                        className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${pathname === "/admin/categories" || pathname.startsWith("/admin/categories/")
                            ? "bg-blue-50 text-blue-600 font-semibold"
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                            }`}
                    >
                        <List size={20} />
                        <span>Categories</span>
                    </Link>

                    <div className="space-y-1">
                        <Link
                            href="/admin/manage-business"
                            className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${pathname === "/admin/manage-business"
                                ? "bg-blue-50 text-blue-600 font-semibold"
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                                }`}
                        >
                            <span className="ml-8 text-sm">Manage Business</span>
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="mt-auto p-4 border-t border-gray-50">
                <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200"
                >
                    <LogOut size={20} />
                    <span className="font-semibold">Logout</span>
                </button>
            </div>
        </div>
    );
}
