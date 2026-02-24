"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Phone, MapPin, Search, ChevronRight, ImageIcon, Info, Heart, Star, Plus } from "lucide-react";
import Link from "next/link";

export default function BusinessLandingPage() {
    const { slug } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (slug) fetchBusinessData();
    }, [slug]);

    const fetchBusinessData = async () => {
        try {
            const res = await fetch(`/api/public/business/${slug}`);
            const result = await res.json();
            if (res.ok) {
                setData(result);
            } else {
                console.error("Business not found");
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

    if (!data) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
                    <Info size={48} />
                </div>
                <h1 className="text-2xl font-bold text-gray-800">Store Not Found</h1>
                <p className="text-gray-500 mt-2">The store you're looking for doesn't exist or is currently inactive.</p>
                <Link href="/" className="mt-8 px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg">Go Back Home</Link>
            </div>
        );
    }

    const { business, categories, products } = data;

    // Group products by category
    const groupedProducts = categories.reduce((acc, cat) => {
        const catProducts = (products || []).filter(p => (p.category?._id || p.category) === cat._id);
        if (catProducts.length > 0) {
            acc[cat._id] = catProducts;
        }
        return acc;
    }, {});

    // Search logic: matches product name OR category name
    const matchesSearch = (product, category) => {
        const search = searchTerm.toLowerCase().trim();
        if (!search) return true;

        const productNameMatch = product.name.toLowerCase().includes(search);
        const categoryNameMatch = category.name.toLowerCase().includes(search);

        return productNameMatch || categoryNameMatch;
    };

    return (
        <div className="min-h-[100dvh] bg-white pb-24">
            {/* Header / Hero */}
            <div className="relative h-64 bg-indigo-600 overflow-hidden">
                {/* Background Pattern/Gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60 z-10"></div>
                {business.logo && (
                    <img
                        src={business.logo}
                        alt={business.name}
                        className="absolute inset-0 w-full h-full object-cover blur-sm opacity-50 scale-110"
                    />
                )}

                <div className="absolute inset-0 z-20 flex flex-col items-center justify-end p-8 text-center text-white">
                    <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-white shadow-2xl mb-4 bg-white">
                        {business.logo ? (
                            <img src={business.logo} alt={business.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-indigo-600 bg-indigo-50 font-black text-2xl">
                                {business.name.substring(0, 2).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <h1 className="text-3xl font-black tracking-tight">{business.name}</h1>
                    <div className="flex items-center space-x-4 mt-2 text-white/80 text-sm font-bold uppercase tracking-widest">
                        <span className="flex items-center"><MapPin size={14} className="mr-1" /> {business.city}</span>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="px-6 -mt-6 relative z-30">
                <div className="bg-white rounded-[2.5rem] p-2 shadow-xl shadow-black/5 border border-gray-50">
                    <div className="relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search products or categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-14 pr-6 py-6 bg-gray-50/50 rounded-[2rem] focus:outline-none focus:ring-2 focus:ring-indigo-500/10 font-bold text-gray-700 placeholder:text-gray-400 border-none"
                        />
                    </div>
                </div>

                {/* Categories Grid (Visible when NOT searching) */}
                {searchTerm === "" && (
                    <div className="mt-10">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-gray-800 tracking-tight">Browse Categories</h2>
                            <span className="text-xs font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-full">
                                {categories.length} Total
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {categories.map((cat) => (
                                <Link
                                    key={cat._id}
                                    href={`/b/${slug}/${cat._id}`}
                                    className="group relative h-48 rounded-[2rem] overflow-hidden bg-gray-100 shadow-sm active:scale-[0.98] transition-all"
                                >
                                    {cat.image ? (
                                        <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-gray-300">
                                            <ImageIcon size={32} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
                                    <div className="absolute bottom-0 inset-x-0 p-5 z-20">
                                        <div className="text-white font-black text-lg leading-tight uppercase tracking-tight">{cat.name}</div>
                                        <div className="flex items-center text-white/70 text-[10px] font-bold mt-1 uppercase tracking-widest group-hover:text-white transition-colors">
                                            <span>Explore</span>
                                            <ChevronRight size={12} className="ml-0.5" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Products List (Grouped by Category) */}
                <div className="mt-10 space-y-10">
                    {categories.map(cat => {
                        const catProducts = (groupedProducts[cat._id] || []).filter(p => matchesSearch(p, cat));
                        if (catProducts.length === 0) return null;

                        return (
                            <div key={cat._id}>
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-black text-gray-800 tracking-tight uppercase">{cat.name}</h2>
                                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-full">
                                        {catProducts.length} Items
                                    </span>
                                </div>
                                <div className="space-y-4">
                                    {catProducts.map(prod => (
                                        <Link
                                            key={prod._id}
                                            href={`/b/${slug}/${cat._id}`}
                                            className="bg-white p-4 rounded-3xl flex items-start space-x-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-50 relative overflow-hidden group active:scale-[0.98] transition-all"
                                        >
                                            <div className="w-24 h-24 rounded-[1.5rem] overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-100">
                                                {prod.images?.[0] ? (
                                                    <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                        <ImageIcon size={20} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 py-1">
                                                <div className="flex items-start justify-between">
                                                    <h3 className="font-bold text-gray-800 leading-tight pr-4 uppercase tracking-tight line-clamp-2">{prod.name}</h3>
                                                    <div className="flex items-center text-amber-500">
                                                        <Star size={12} fill="currentColor" />
                                                        <span className="text-[10px] font-black ml-1">4.5</span>
                                                    </div>
                                                </div>
                                                <p className="text-[10px] font-bold text-gray-400 mt-2 line-clamp-1">{prod.description || 'Details available in category'}</p>
                                                <div className="mt-4 flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-lg font-black text-indigo-600">₹{prod.salePrice}</span>
                                                        {prod.mrpPrice > prod.salePrice && (
                                                            <span className="text-[10px] font-bold text-gray-400 line-through">₹{prod.mrpPrice}</span>
                                                        )}
                                                    </div>
                                                    <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                        <Plus size={16} />
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {Object.keys(groupedProducts).length === 0 && !loading && (
                        <div className="py-20 text-center text-gray-400 bg-gray-50/50 rounded-[2.5rem] border border-dashed border-gray-200 font-bold">
                            No products found in this store
                        </div>
                    )}

                    {searchTerm !== "" && categories.every(cat => (groupedProducts[cat._id] || []).filter(p => matchesSearch(p, cat)).length === 0) && (
                        <div className="py-20 text-center text-gray-400 bg-gray-50/50 rounded-[2.5rem] border border-dashed border-gray-200 font-bold">
                            No matching items found for "{searchTerm}"
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Contact Tab */}
            <div className="fixed bottom-0 inset-x-0 p-6 z-40">
                <div className="max-w-md mx-auto bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl shadow-black/10 rounded-[2.5rem] p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                            <Phone size={20} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Call Orders</div>
                            <div className="text-sm font-bold text-gray-800">{business.mobileNumber}</div>
                        </div>
                    </div>
                    <button className="w-12 h-12 bg-pink-50 text-pink-500 rounded-2xl flex items-center justify-center hover:bg-pink-100 transition-colors">
                        <Heart size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
