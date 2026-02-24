"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ShopSidebar from "../../components/ShopSidebar";
import ShopMobileHeader from "../../components/ShopMobileHeader";
import { List, Package } from "lucide-react";

export default function ShopDashboard() {
    const router = useRouter();
    const [businessName, setBusinessName] = useState("Loading...");
    const [stats, setStats] = useState({ categories: 0, products: 0 });
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const fetchStats = async (businessId) => {
        try {
            const res = await fetch(`/api/shop/stats?businessId=${businessId}`);
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Failed to fetch shop stats:", error);
        }
    };

    useEffect(() => {
        const isLoggedIn = sessionStorage.getItem("shopLoggedIn");
        const businessId = sessionStorage.getItem("businessId");
        if (!isLoggedIn || !businessId) {
            router.push("/shop/login");
        } else {
            fetchStats(businessId);
        }
    }, [router]);

    return (
        <div className="flex min-h-screen bg-gray-50 overflow-x-hidden relative">
            <ShopSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1 lg:ml-64 min-w-0">
                <ShopMobileHeader onToggleSidebar={() => setIsSidebarOpen(true)} />
                <div className="p-4 sm:p-6 lg:p-10">
                    <h1 className="text-3xl font-extrabold text-gray-800">Welcome to Shop Panel</h1>
                    <p className="text-gray-500 mt-1">Manage your categories, sub-categories, and products from here.</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                                <List size={24} />
                            </div>
                            <div className="text-3xl font-bold text-gray-800">{stats.categories}</div>
                            <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Categories</div>
                        </div>
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                                <Package size={24} />
                            </div>
                            <div className="text-3xl font-bold text-gray-800">{stats.products}</div>
                            <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Products</div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
