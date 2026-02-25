"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Search, ChevronLeft, ShoppingBag, Plus, ImageIcon, Info } from "lucide-react";
import Link from "next/link";

export default function CategoryDetailsPage() {
    const { slug, categoryId } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [activeSubCat, setActiveSubCat] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        if (slug && categoryId) fetchCategoryData();
    }, [slug, categoryId]);

    const fetchCategoryData = async () => {
        try {
            const res = await fetch(`/api/public/business/${slug}/${categoryId}`);
            const result = await res.json();
            if (res.ok) {
                setData(result);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!data) return null;

    const { business, category, subCategories, products } = data;

    const filteredProducts = products.filter(prod => {
        const matchesSearch = prod.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSubCat = activeSubCat === "all" || (prod.subCategory?._id || prod.subCategory) === activeSubCat;
        return matchesSearch && matchesSubCat;
    });

    return (
        <div className="min-h-[100dvh] bg-gray-50 pb-24">
            {/* Header */}
            <header className="bg-white px-6 py-6 sticky top-0 z-40 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href={`/b/${slug}`} className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-800 active:scale-95 transition-all">
                        <ChevronLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-xl font-black text-gray-800 tracking-tight uppercase">{category.name}</h1>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{business.name}</p>
                    </div>
                </div>
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center relative shadow-sm border border-gray-100">
                    <ShoppingBag size={20} className="text-gray-800" />
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">0</span>
                </div>
            </header>

            {/* Sticky Search & Tabs */}
            <div className="bg-white px-6 pb-6 sticky top-24 z-30 shadow-sm shadow-black/5 rounded-b-[2rem]">
                <div className="relative mb-6">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search within category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 font-bold text-sm text-gray-700 border-none"
                    />
                </div>

                {/* Sub-Category Tabs */}
                <div
                    ref={scrollContainerRef}
                    className="flex overflow-x-auto no-scrollbar space-x-2 pb-1"
                >
                    <button
                        onClick={() => setActiveSubCat("all")}
                        className={`px-6 py-3 rounded-2xl text-sm font-black whitespace-nowrap transition-all uppercase tracking-tight ${activeSubCat === "all" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-gray-50 text-gray-500"}`}
                    >
                        All Items
                    </button>
                    {subCategories.map(sc => (
                        <button
                            key={sc._id}
                            onClick={() => setActiveSubCat(sc._id)}
                            className={`px-6 py-3 rounded-2xl text-sm font-black whitespace-nowrap transition-all uppercase tracking-tight ${activeSubCat === sc._id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-gray-50 text-gray-500"}`}
                        >
                            {sc.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Product List */}
            <div className="p-6 space-y-4">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map(prod => (
                        <Link
                            key={prod._id}
                            href={`/b/${slug}/p/${prod._id}`}
                            className="bg-white p-4 rounded-3xl flex items-start space-x-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-50 relative overflow-hidden group active:scale-[0.98] transition-all"
                        >
                            <div className="w-28 h-28 rounded-[1.5rem] overflow-hidden flex-shrink-0">
                                {prod.images?.[0] ? (
                                    <img
                                        src={prod.images[0]}
                                        alt={prod.name}
                                        className="w-full h-full object-contain duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <ImageIcon size={24} />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 py-1">
                                <div className="flex items-start justify-between">
                                    <h3 className="font-black text-gray-800 leading-tight uppercase tracking-tight line-clamp-2">{prod.name}</h3>
                                </div>
                                <p className="text-[10px] font-bold text-gray-400 mt-2 line-clamp-2 leading-relaxed">{prod.description || 'Fresh and high-quality ingredients prepared daily.'}</p>
                                <div className="mt-4 flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-lg font-black text-indigo-600">₹{prod.salePrice}</span>
                                        {prod.mrpPrice > prod.salePrice && (
                                            <span className="text-[10px] font-bold text-gray-400 line-through">₹{prod.mrpPrice}</span>
                                        )}
                                    </div>
                                    <button className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all absolute bottom-4 right-4">
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="py-20 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <Info size={32} />
                        </div>
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No products in this section</p>
                    </div>
                )}
            </div>
        </div>
    );
}


