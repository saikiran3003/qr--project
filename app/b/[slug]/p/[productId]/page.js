"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, ShoppingBag, Plus, ImageIcon, Info, Share2, Menu } from "lucide-react";
import Link from "next/link";
import CustomerSidebar from "@/app/components/CustomerSidebar";
import AdsBanner from "@/app/components/AdsBanner";

export default function ProductDetailsPage() {
    const { slug, productId } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [activeImage, setActiveImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [cart, setCart] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (!slug || !productId) return;

        // Load cart for this business
        const savedCart = localStorage.getItem(`cart_${slug}`);
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error("Error parsing cart:", e);
            }
        }

        // Fetch product data
        fetchProductData();
    }, [slug, productId]);

    const addToCart = () => {
        setCart(prevCart => {
            const currentCart = [...prevCart];
            const existingItemIndex = currentCart.findIndex(item => item._id === product._id);

            if (existingItemIndex > -1) {
                currentCart[existingItemIndex] = {
                    ...currentCart[existingItemIndex],
                    quantity: currentCart[existingItemIndex].quantity + quantity
                };
            } else {
                currentCart.push({
                    _id: product._id,
                    name: product.name,
                    salePrice: product.salePrice,
                    image: product.images?.[0],
                    quantity: quantity,
                    businessId: business._id,
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


    const fetchProductData = async () => {
        try {
            // Using the path we'll ensure exists: /api/public/business/[slug]/p/[productId]
            const res = await fetch(`/api/public/business/${slug}/p/${productId}`);
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

    if (!data) return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
            <Info size={48} className="text-gray-300 mb-4" />
            <h1 className="text-xl font-bold text-gray-800">Product Not Found</h1>
            <button onClick={() => router.back()} className="mt-4 text-indigo-600 font-bold">Go Back</button>
        </div>
    );

    const { business, product, relatedProducts } = data;

    return (

        <div className="min-h-[100dvh] bg-white pb-32">
            {/* Ads Banner — auto-scroll, shows only if ads are added in admin panel */}
            <AdsBanner slug={slug} />

            <CustomerSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                business={business}
            />
            {/* Top Bar overlays the image */}
            <div className="fixed top-0 inset-x-0 z-50 px-6 py-6 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => router.back()}
                        className="w-12 h-12 bg-white/80 backdrop-blur-md rounded-2xl flex items-center justify-center text-gray-800 shadow-lg shadow-black/5 active:scale-95 transition-all"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="w-12 h-12 bg-white/80 backdrop-blur-md rounded-2xl flex items-center justify-center text-gray-800 shadow-lg shadow-black/5 active:scale-95 transition-all"
                    >
                        <Menu size={24} />
                    </button>
                </div>
                <div className="flex items-center space-x-3">
                    <button className="w-12 h-12 bg-white/80 backdrop-blur-md rounded-2xl flex items-center justify-center text-gray-800 shadow-lg shadow-black/5 active:scale-95 transition-all">
                        <Share2 size={20} />
                    </button>
                    <Link
                        href={`/b/${slug}/cart`}
                        className="w-12 h-12 bg-white/80 backdrop-blur-md rounded-2xl flex items-center justify-center text-gray-800 shadow-lg shadow-black/5 active:scale-95 transition-all relative"
                    >
                        <ShoppingBag size={20} />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">{cartCount}</span>
                        )}
                    </Link>
                </div>
            </div>

            {/* Product Image Gallery */}
            <div className="relative aspect-square bg-gray-50 overflow-hidden">
                {product.images?.[activeImage] ? (
                    <img
                        src={product.images[activeImage]}
                        alt={product.name}
                        className="w-full h-full object-contain transition-all duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200">
                        <ImageIcon size={120} />
                    </div>
                )}

                {/* Image Dots */}
                {product.images?.length > 1 && (
                    <div className="absolute bottom-10 inset-x-0 flex items-center justify-center space-x-2 z-20">
                        {product.images.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveImage(idx)}
                                className={`h-1.5 rounded-full transition-all duration-300 ${activeImage === idx ? "w-8 bg-indigo-600" : "w-1.5 bg-white shadow-sm"}`}
                            />
                        ))}
                    </div>
                )}

                {/* Gradient bottom overlay */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent z-10"></div>
            </div>

            {/* Detail Content */}
            <div className="px-8 -mt-6 relative z-20 bg-white rounded-t-[3rem]">
                <div className="pt-10 flex flex-col space-y-6">
                    <div className="flex items-start justify-between">
                        <div className="flex-1 pr-4">
                            <div className="flex items-center space-x-2 mb-2">
                                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-lg">
                                    {product.category?.name}
                                </span>
                                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">/</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    {product.subCategory?.name}
                                </span>
                            </div>
                            <h1 className="text-3xl font-black text-gray-800 tracking-tight leading-tight uppercase">
                                {product.name}
                            </h1>
                        </div>
                        <div className="flex flex-col items-end">
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex flex-col">
                            <span className="text-3xl font-black text-indigo-600 tracking-tighter">₹{product.salePrice}</span>
                            {product.mrpPrice > product.salePrice && (
                                <span className="text-sm font-bold text-gray-400 line-through">MRP: ₹{product.mrpPrice}</span>
                            )}
                        </div>
                        {product.mrpPrice > product.salePrice && (
                            <div className="px-3 py-1.5 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-xl">
                                Save {Math.round(((product.mrpPrice - product.salePrice) / product.mrpPrice) * 100)}%
                            </div>
                        )}
                    </div>

                    <div className="border-t border-gray-50 pt-6">
                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-3">About this item</h3>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed">
                            {product.description || 'Our signature dish prepared with hand-picked ingredients and authentic spices. Perfect for sharing or enjoying solo. Experience the true taste of quality and tradition in every bite.'}
                        </p>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-[2rem] flex items-center justify-between border border-gray-100">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white border border-gray-100">
                                {business.logo ? <img src={business.logo} alt={business.name} /> : <div className="text-xs font-black w-full h-full flex items-center justify-center text-gray-300">LOGO</div>}
                            </div>
                            <div>
                                <div className="text-sm font-black text-gray-800">{business.name}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{business.city}</div>
                            </div>
                        </div>
                        <Link href={`/b/${slug}`} className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline">View Store</Link>
                    </div>

                    {/* Related Products */}
                    {relatedProducts?.length > 0 && (
                        <div className="pt-4 pb-10">
                            <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-6">You might also like</h3>
                            <div className="flex overflow-x-auto no-scrollbar space-x-4 pb-4">
                                {relatedProducts.map(rp => (
                                    <Link
                                        key={rp._id}
                                        href={`/b/${slug}/p/${rp._id}`}
                                        className="w-40 flex-shrink-0 bg-gray-50 p-3 rounded-3xl border border-gray-100 active:scale-[0.98] transition-all"
                                    >
                                        <div className="aspect-square rounded-2xl overflow-hidden mb-3">
                                            {rp.images?.[0] ? (
                                                <img src={rp.images[0]} alt={rp.name} className="w-full h-full object-contain duration-300 transition-all" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-200"><ImageIcon size={20} /></div>
                                            )}
                                        </div>
                                        <div className="font-bold text-xs text-gray-800 line-clamp-1 uppercase mb-1">{rp.name}</div>
                                        <div className="font-black text-indigo-600">₹{rp.salePrice}</div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Add to Cart Action */}
            <div className="fixed bottom-0 inset-x-0 p-6 z-50 flex flex-col space-y-4">
                {/* Total Cart Bar (Only shows if cart has items) */}
                {cartCount > 0 && (
                    <div id="cart-bar" className="mx-auto w-fit bg-indigo-950/95 backdrop-blur-md text-white px-4 py-3 md:px-5 md:py-3 rounded-[1.5rem] flex items-center justify-between gap-6 shadow-2xl animate-in slide-in-from-bottom-10 duration-500 border border-white/5 mb-2">
                        <div className="flex items-center space-x-3 md:space-x-4">
                            <div className="w-10 h-10 md:w-11 md:h-11 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                                <ShoppingBag size={18} className="text-white" />
                            </div>
                            <div>
                                <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.15em] mb-0.5 leading-none">ITEMS: {cartCount}</p>
                                <p className="text-lg md:text-xl font-black leading-none text-white tracking-tight">₹{cartTotal}</p>
                            </div>
                        </div>
                        <Link
                            href={`/b/${slug}/cart`}
                            className="bg-white text-indigo-950 px-4 py-2.5 md:px-6 md:py-3 rounded-[0.9rem] font-black uppercase text-[10px] md:text-xs tracking-widest active:scale-95 transition-all shadow-lg flex items-center justify-center whitespace-nowrap"
                        >
                            VIEW CART
                        </Link>
                    </div>
                )}

                <div className="max-w-md mx-auto flex items-center space-x-4 w-full">
                    <div className="flex bg-gray-100 rounded-2xl p-1 shadow-inner">
                        <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-12 h-14 flex items-center justify-center text-gray-400 font-black text-lg active:scale-90 transition-all"
                        >
                            -
                        </button>
                        <div className="w-8 h-14 flex items-center justify-center text-gray-800 font-black">{quantity}</div>
                        <button
                            onClick={() => setQuantity(quantity + 1)}
                            className="w-12 h-14 flex items-center justify-center text-gray-800 font-black text-lg active:scale-90 transition-all"
                        >
                            +
                        </button>
                    </div>
                    <button
                        onClick={addToCart}
                        className="flex-1 bg-indigo-600 h-16 rounded-[1.5rem] flex items-center justify-center space-x-3 text-white font-black uppercase tracking-widest shadow-xl shadow-indigo-100 active:scale-[0.98] transition-all"
                    >
                        <ShoppingBag size={20} />
                        <span>Add to cart</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
