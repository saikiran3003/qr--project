"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Search, ChevronLeft, ShoppingBag, Plus, ImageIcon, Info, Menu } from "lucide-react";
import Link from "next/link";
import CustomerSidebar from "@/app/components/CustomerSidebar";

export default function CategoryDetailsPage() {
    const { slug, categoryId } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [activeSubCat, setActiveSubCat] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [cart, setCart] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        if (!slug || !categoryId) return;

        // Load cart for this business
        const savedCart = localStorage.getItem(`cart_${slug}`);
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error("Error parsing cart:", e);
            }
        }

        // Fetch category data
        fetchCategoryData();
    }, [slug, categoryId]);

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

            // Scroll to cart bar after it renders
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
            <CustomerSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                business={business}
            />
            {/* Header */}
            <header className="bg-white px-6 py-6 sticky top-0 z-40 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <Link href={`/b/${slug}`} className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-800 active:scale-95 transition-all">
                            <ChevronLeft size={24} />
                        </Link>
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-800 active:scale-95 transition-all"
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-gray-800 tracking-tight uppercase">{category.name}</h1>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{business.name}</p>
                    </div>
                </div>
                <Link href={`/b/${slug}/cart`} className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center relative shadow-sm border border-gray-100 active:scale-95 transition-all">
                    <ShoppingBag size={20} className="text-gray-800" />
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">{cartCount}</span>
                </Link>
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
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            addToCart(prod);
                                        }}
                                        className="w-11 h-11 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center hover:bg-indigo-600 hover:text-white active:scale-95 transition-all absolute bottom-4 right-4 z-40 shadow-sm border border-indigo-100/50"
                                    >
                                        <Plus size={22} strokeWidth={3} />
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


