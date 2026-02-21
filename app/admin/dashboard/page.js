"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from   "../../components/Sidebar";
import {
    FolderTree,
    Eye,
    Settings,
    CheckCircle2,
    Server,
    ShieldCheck
} from "lucide-react";

export default function DashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
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

    useEffect(() => {
        if (typeof window !== "undefined") {
            const isLoggedIn = localStorage.getItem("isLoggedIn");
            if (isLoggedIn !== "true") {
                router.push("/");
                return;
            }

            syncCategories();
            setLoading(false);

            window.addEventListener("categoriesUpdated", syncCategories);
            return () => window.removeEventListener("categoriesUpdated", syncCategories);
        }
    }, [router]);

    if (loading) return null;

    const stats = [
        { label: "Total Categories", value: categories.length.toString(), icon: FolderTree, color: "bg-blue-100 text-blue-600" },
        { label: "Total Views", value: "64", icon: Eye, color: "bg-green-100 text-green-600" },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />

            <main className="flex-1 ml-64 p-10">
                <header className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
                    <p className="text-gray-500 mt-1">Welcome back, admin. Here is what's happening today.</p>
                </header>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                            <div className={`p-3 rounded-xl ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
                            </div>
                        </div>
                    ))}
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <section className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Quick Actions</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button className="flex items-center justify-center space-x-2 py-4 px-6 bg-white border-2 border-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors w-full">
                                    <Settings size={20} />
                                    <span>Manage Sources</span>
                                </button>
                            </div>
                        </div>

                        {/* Dynamic Categories List */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">Manage Categories</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {categories.map((cat) => (
                                    <div key={cat._id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                                        <span className="font-medium text-gray-700">{cat.name}</span>
                                        <div className={`w-2 h-2 rounded-full ${cat.status ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section>
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 h-full">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">System Status</h2>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3 text-gray-600">
                                        <Server size={20} className="text-gray-400" />
                                        <span className="font-medium">Database Status</span>
                                    </div>
                                    <span className="flex items-center space-x-1.5 bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-bold border border-green-100">
                                        <CheckCircle2 size={12} />
                                        <span>Connected</span>
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3 text-gray-600">
                                        <ShieldCheck size={20} className="text-gray-400" />
                                        <span className="font-medium">Next.js Version</span>
                                    </div>
                                    <span className="text-gray-800 font-bold">14+</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3 text-gray-600">
                                        <div className="w-5 h-5 flex items-center justify-center">
                                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                                        </div>
                                        <span className="font-medium">Security</span>
                                    </div>
                                    <span className="text-blue-600 font-bold text-sm bg-blue-50 px-2 py-1 rounded-md">JWT Active</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
