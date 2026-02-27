"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapPin, Search, ChevronRight, ImageIcon, Info, Plus, ShoppingBag, Menu } from "lucide-react";
import Link from "next/link";
import CustomerSidebar from "@/app/components/CustomerSidebar";
import AdsBanner from "@/app/components/AdsBanner";

export default function BusinessLandingPage() {
    const { slug } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [cart, setCart] = useState([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        if (!slug || slug === "[slug]" || slug === "slug") return;

        // Load cart for this business
        const savedCart = localStorage.getItem(`cart_${slug}`);
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error("Error parsing cart:", e);
            }
        }

        // Fetch business data
        fetchBusinessData();
    }, [slug]);

    const addToCart = (product) => {
        setCart(prevCart => {
            const currentCart = [...prevCart];
            const existingItemIndex = currentCart.findIndex(item => item._id === product._id);

            if (existingItemIndex > -1) {
                currentCart[existingItemIndex] = {
                    ...currentCart[existingItemIndex],
                    quantity: currentCart[existingItemIndex].quantity + 1
                };
            } else {
                currentCart.push({
                    _id: product._id,
                    name: product.name,
                    salePrice: product.salePrice,
                    image: product.images?.[0],
                    quantity: 1,
                    businessId: data?.business?._id,
                    businessSlug: slug
                });
            }

            localStorage.setItem(`cart_${slug}`, JSON.stringify(currentCart));

            setTimeout(() => {
                const cartBar = document.getElementById('cart-bar');
                if (cartBar) {
                    cartBar.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);

            return currentCart;
        });
    };

    const cartTotal = cart.reduce((total, item) => total + (item.salePrice * item.quantity), 0);
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

    const fetchBusinessData = async () => {
        try {
            const res = await fetch(`/api/public/business/${encodeURIComponent(slug)}`);
            const result = await res.json();
            if (res.ok) {
                setData(result);
            } else {
                console.error("Business API Error:", result.error || "Unknown Error", "Status:", res.status);
                setData(result.error || "Store not found");
            }
        } catch (error) {
            console.error("Fetch Exception:", error);
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

    if (!data || typeof data === 'string') {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-300">
                    <Info size={48} />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Access Error</h1>
                <p className="text-gray-500 mt-2 font-bold text-indigo-600 tracking-wide px-4">
                    {typeof data === 'string' ? data : "This store is currently unavailable or doesn't exist."}
                </p>
                <div className="mt-8 p-4 bg-gray-50 rounded-2xl text-[10px] text-gray-400 font-mono border border-gray-100 uppercase tracking-widest">
                    PATH: {slug}
                </div>
                <Link href="/" className="mt-8 px-10 py-4 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-100 active:scale-95 transition-all">
                    Go Back Home
                </Link>
            </div>
        );
    }

    const { business, categories = [], products = [] } = data || {};

    const groupedProducts = categories.reduce((acc, cat) => {
        const catProducts = (products || []).filter(p => (p.category?._id || p.category) === cat._id);
        if (catProducts.length > 0) {
            acc[cat._id] = catProducts;
        }
        return acc;
    }, {});

    const matchesSearch = (product, category) => {
        const search = searchTerm.toLowerCase().trim();
        if (!search) return true;
        const productNameMatch = product.name.toLowerCase().includes(search);
        const categoryNameMatch = category.name.toLowerCase().includes(search);
        return productNameMatch || categoryNameMatch;
    };

    return (
        <div className="min-h-[100dvh] bg-white pb-12 relative">
            {business && (
                <CustomerSidebar
                    isOpen={isMenuOpen}
                    onClose={() => setIsMenuOpen(false)}
                    business={business}
                />
            )}

            {/* Ads Banner — auto-scroll, shows only if ads are added in admin panel */}
            <AdsBanner slug={slug} />

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
                <div className="absolute top-6 left-6 z-30">
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/20 shadow-lg active:scale-95 transition-all"
                    >
                        <Menu size={24} />
                    </button>
                </div>
                <div className="absolute top-6 right-6 z-30">
                    <Link
                        href={`/b/${slug}/cart`}
                        className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/20 shadow-lg active:scale-95 transition-all relative"
                    >
                        <ShoppingBag size={20} />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">{cartCount}</span>
                        )}
                    </Link>
                </div>

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
            <div className="px-6 -mt-6 relative z-30 lg:max-w-7xl lg:mx-auto lg:w-full">
                <div className="bg-white rounded-[2.5rem] p-2 shadow-xl shadow-black/5 border border-gray-50 lg:p-4">
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

                        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-8">
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
                <div className="mt-10 space-y-10 lg:space-y-16">
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
                                <div className="space-y-4 lg:grid lg:grid-cols-3 lg:gap-6 lg:space-y-0">
                                    {catProducts.map(prod => (
                                        <Link
                                            key={prod._id}
                                            href={`/b/${slug}/${cat._id}`}
                                            className="bg-white p-4 rounded-3xl flex items-start space-x-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-50 relative overflow-hidden group active:scale-[0.98] transition-all lg:flex-col lg:space-x-0 lg:p-6 lg:text-center"
                                        >
                                            <div className="w-24 h-24 rounded-[1.5rem] overflow-hidden flex-shrink-0 lg:w-full lg:h-48 lg:mb-4">
                                                {prod.images?.[0] ? (
                                                    <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-contain duration-500" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                        <ImageIcon size={20} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 py-1 lg:w-full">
                                                <div className="flex items-start justify-between lg:justify-center">
                                                    <h3 className="font-bold text-gray-800 leading-tight uppercase tracking-tight line-clamp-2 lg:pr-0 lg:text-lg">{prod.name}</h3>
                                                </div>
                                                <p className="text-[10px] font-bold text-gray-400 mt-2 line-clamp-1">{prod.description || 'Details available in category'}</p>
                                                <div className="mt-4 flex items-center justify-between lg:justify-center lg:space-x-4">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-lg font-black text-indigo-600">₹{prod.salePrice}</span>
                                                        {prod.mrpPrice > prod.salePrice && (
                                                            <span className="text-[10px] font-bold text-gray-400 line-through">₹{prod.mrpPrice}</span>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            e.preventDefault();
                                                            addToCart(prod);
                                                        }}
                                                        className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-600 hover:text-white active:scale-95 transition-all lg:absolute lg:bottom-4 lg:right-4 z-40 shadow-sm border border-indigo-100/50"
                                                    >
                                                        <Plus size={22} strokeWidth={3} />
                                                    </button>
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

            {/* Floating Cart Summary Bar */}
            {cartCount > 0 && (
                <div id="cart-bar" className="fixed bottom-6 inset-x-0 z-50 px-6">
                    <div className="mx-auto w-fit bg-indigo-950/95 backdrop-blur-md text-white px-4 py-3 md:px-6 md:py-4 rounded-[1.8rem] flex items-center justify-between gap-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom-10 duration-500 border border-white/5">
                        <div className="flex items-center space-x-3 md:space-x-4">
                            <div className="w-11 h-11 md:w-12 md:h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 shadow-inner">
                                <ShoppingBag size={20} className="text-white" />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.15em] mb-0.5">ITEMS: {cartCount}</p>
                                <p className="text-xl md:text-2xl font-black tracking-tight leading-none text-white">₹{cartTotal}</p>
                            </div>
                        </div>
                        <Link
                            href={`/b/${slug}/cart`}
                            className="bg-white text-indigo-950 px-4 py-2.5 md:px-7 md:py-4 rounded-[1.1rem] font-black uppercase text-[10px] md:text-xs tracking-widest active:scale-95 transition-all shadow-xl hover:bg-gray-50 flex items-center justify-center whitespace-nowrap"
                        >
                            VIEW CART
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
