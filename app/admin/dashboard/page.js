"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import MobileHeader from "../../components/MobileHeader";
import {
    FolderTree,
    Eye
} from "lucide-react";

export default function DashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [stats, setStats] = useState([
        { label: "Total Categories", value: "0", icon: FolderTree, color: "bg-blue-100 text-blue-600" },
        { label: "Total Views", value: "0", icon: Eye, color: "bg-green-100 text-green-600" },
    ]);

    const syncCategories = async () => {
        try {
            const res = await fetch("/api/categories");
            const data = await res.json();
            if (res.ok) {
                setCategories(data);
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    };

    const syncStats = async () => {
        try {
            const res = await fetch("/api/admin/stats");
            const data = await res.json();
            if (res.ok) {
                setStats([
                    { label: "Total Categories", value: data.totalCategories.toString(), icon: FolderTree, color: "bg-blue-100 text-blue-600" },
                    { label: "Total Views", value: data.totalViews.toString(), icon: Eye, color: "bg-green-100 text-green-600" },
                ]);
            }
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        }
    };

    useEffect(() => {
        const init = async () => {
            await Promise.all([syncCategories(), syncStats()]);
            setLoading(false);
        };
        init();

        const handleUpdate = () => {
            syncCategories();
            syncStats();
        };

        window.addEventListener("categoriesUpdated", handleUpdate);
        window.addEventListener("storage", handleUpdate);
        return () => {
            window.removeEventListener("categoriesUpdated", handleUpdate);
            window.removeEventListener("storage", handleUpdate);
        };
    }, []);

    // Removed: if (loading) return null; // Show layout immediately for faster response

    return (
        <div className="flex min-h-screen bg-gray-50 overflow-x-hidden relative">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1 lg:ml-64 min-w-0">
                <MobileHeader onToggleSidebar={() => setIsSidebarOpen(true)} />
                <div className="p-4 sm:p-6 lg:p-10">
                    <div className="max-w-[1600px] mx-auto w-full">
                        <header className="mb-6 sm:mb-10">
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Dashboard Overview</h2>
                            <p className="text-gray-500 mt-1 text-sm sm:text-base">Welcome back, admin. Here is what's happening today.</p>
                        </header>

                        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-10">
                            {loading ? (
                                [1, 2].map((i) => (
                                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4 animate-pulse">
                                        <div className="p-6 bg-gray-100 rounded-xl"></div>
                                        <div className="space-y-2 flex-1">
                                            <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                                            <div className="h-8 bg-gray-100 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                stats.map((stat, index) => (
                                    <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:shadow-md transition-shadow">
                                        <div className={`p-3 rounded-xl ${stat.color}`}>
                                            <stat.icon size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                                            <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
                                        </div>
                                    </div>
                                ))
                            )}
                        </section>

                        <div className="grid grid-cols-1 gap-6">
                            <section className="space-y-6">
                                <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
                                    <h2 className="text-xl font-bold text-gray-800 mb-6">Manage Categories</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {loading ? (
                                            [1, 2, 3].map((i) => (
                                                <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-50 h-[52px] animate-pulse"></div>
                                            ))
                                        ) : categories.length > 0 ? (
                                            categories.map((cat) => (
                                                <div key={cat._id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between hover:border-blue-200 transition-colors">
                                                    <span className="font-medium text-gray-700">{cat.name}</span>
                                                    <div className={`w-2 h-2 rounded-full ${cat.status ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest text-center col-span-full py-4">No categories yet</p>
                                        )}
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
