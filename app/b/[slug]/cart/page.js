"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, ShoppingBag, Trash2, Plus, Minus, Info } from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";

export default function CartPage() {
    const { slug } = useParams();
    const router = useRouter();
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sharing, setSharing] = useState(false);
    const [customerName, setCustomerName] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");

    useEffect(() => {
        const savedCart = localStorage.getItem(`cart_${slug}`);
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error("Error parsing cart:", e);
            }
        }
        setLoading(false);
    }, [slug]);

    const updateQuantity = (id, delta) => {
        const updatedCart = cart.map(item => {
            if (item._id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        });
        setCart(updatedCart);
        localStorage.setItem(`cart_${slug}`, JSON.stringify(updatedCart));
    };

    const removeItem = (id) => {
        const updatedCart = cart.filter(item => item._id !== id);
        setCart(updatedCart);
        localStorage.setItem(`cart_${slug}`, JSON.stringify(updatedCart));
    };

    const cartTotal = cart.reduce((total, item) => total + (item.salePrice * item.quantity), 0);

    const handleSendOrder = async () => {
        if (cart.length === 0 || sharing) return;

        if (!customerName.trim()) {
            Swal.fire({
                title: 'Name Required',
                text: 'Please enter your name to proceed with the order.',
                icon: 'warning',
                confirmButtonColor: '#4f46e5',
                confirmButtonText: 'OK',
                customClass: {
                    container: 'z-[9999]'
                }
            });
            return;
        }

        if (mobileNumber.length !== 10) {
            Swal.fire({
                title: 'Mobile Number Required',
                text: 'Please enter a valid 10-digit mobile number.',
                icon: 'warning',
                confirmButtonColor: '#4f46e5',
                confirmButtonText: 'OK',
                customClass: {
                    container: 'z-[9999]'
                }
            });
            return;
        }

        setSharing(true);
        const orderLines = cart.map(item =>
            `${item.name} - ${item.quantity}: ${item.salePrice * item.quantity}/-`
        ).join('\n');

        const shareText = `Customer Name : ${customerName || 'N/A'}\nMobile Number : ${mobileNumber || 'N/A'}\n\nOrder Details\n\n${orderLines}\n\nTOTAL AMOUNT : ₹${cartTotal}`;

        try {
            // Store order in database
            const response = await fetch('/api/public/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessSlug: slug,
                    customerName,
                    mobileNumber,
                    items: cart.map(item => ({
                        product: item._id,
                        name: item.name,
                        salePrice: item.salePrice,
                        quantity: item.quantity
                    })),
                    totalAmount: cartTotal
                })
            });

            if (!response.ok) {
                console.error("Failed to save order to DB");
            }

            if (navigator.share) {
                await navigator.share({
                    title: `Order from ${slug}`,
                    text: shareText
                });
            } else {
                // Fallback for browsers that don't support Web Share API
                const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
                window.open(whatsappUrl, '_blank');
            }
        } catch (err) {
            console.error("Order process error:", err);
        } finally {
            // Add a small delay after sharing before allowing again
            setTimeout(() => setSharing(false), 500);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] bg-gray-50 pb-40">
            {/* Header */}
            <header className="bg-white px-6 py-6 sticky top-0 z-40 border-b border-gray-100 flex items-center space-x-4">
                <button
                    onClick={() => router.back()}
                    className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-800 active:scale-95 transition-all"
                >
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-xl font-black text-gray-800 tracking-tight uppercase">My Cart</h1>
            </header>

            <div className="p-6 space-y-4">
                {cart.length > 0 ? (
                    <>
                        <div className="space-y-3">
                            {cart.map((item) => (
                                <div key={item._id} className="bg-white p-4 rounded-3xl flex items-center space-x-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-50">
                                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0">
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-200 uppercase font-black text-[10px]">No Image</div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-800 leading-tight uppercase tracking-tight truncate">{item.name}</h3>
                                        <p className="text-indigo-600 font-black mt-1">₹{item.salePrice}</p>

                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex items-center bg-gray-50 rounded-xl p-0.5">
                                                <button
                                                    onClick={() => updateQuantity(item._id, -1)}
                                                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-800 transition-colors"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="w-8 text-center text-xs font-black text-gray-800">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item._id, 1)}
                                                    className="w-8 h-8 flex items-center justify-center text-gray-800"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item._id)}
                                                className="text-black-300 hover:text-red-500 transition-colors p-2"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                            <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest">Customer Info</h2>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Your Name"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="w-full h-14 px-5 bg-gray-50 rounded-2xl border border-transparent focus:border-indigo-600 focus:bg-white outline-none font-bold text-sm transition-all"
                                />
                                <input
                                    type="tel"
                                    placeholder="Mobile Number"
                                    value={mobileNumber}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, "");
                                        if (value.length <= 10) setMobileNumber(value);
                                    }}
                                    maxLength={10}
                                    className="w-full h-14 px-5 bg-gray-50 rounded-2xl border border-transparent focus:border-indigo-600 focus:bg-white outline-none font-bold text-sm transition-all"
                                />
                            </div>
                        </div>

                        {/* Order Summary Card */}
                        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm mt-8">
                            <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-4">Price Details</h2>
                            <div className="space-y-3">
                                {cart.map(item => (
                                    <div key={item._id} className="flex justify-between text-sm">
                                        <span className="text-gray-500 font-medium">{item.name} (x{item.quantity})</span>
                                        <span className="text-gray-800 font-bold">₹{item.salePrice * item.quantity}</span>
                                    </div>
                                ))}
                                <div className="border-t border-dashed border-gray-100 pt-3 mt-3 flex justify-between items-center">
                                    <span className="text-gray-800 font-black uppercase tracking-tight">Total Amount</span>
                                    <span className="text-2xl font-black text-indigo-600">₹{cartTotal}</span>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="py-20 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <ShoppingBag size={32} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Your cart is empty</h2>
                        <p className="text-gray-500 mt-2 text-sm">Add some delicious items from the menu!</p>
                        <Link href={`/b/${slug}`} className="mt-8 inline-block px-8 py-4 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-indigo-100">
                            Browse Menu
                        </Link>
                    </div>
                )}
            </div>

            {/* Bottom Checkout Action */}
            {cart.length > 0 && (
                <div className="fixed bottom-0 inset-x-0 p-6 z-50 bg-gradient-to-t from-white via-white to-transparent">
                    <button
                        onClick={handleSendOrder}
                        disabled={sharing}
                        className={`w-full max-w-md mx-auto h-16 rounded-[1.5rem] flex items-center justify-center space-x-3 text-white font-black uppercase tracking-widest shadow-xl active:scale-[0.98] transition-all ${sharing ? 'bg-indigo-400 cursor-not-allowed shadow-none' : 'bg-indigo-600 shadow-indigo-100'}`}
                    >
                        <span>{sharing ? 'sending...' : `Send Order • ₹${cartTotal}`}</span>
                    </button>
                </div>
            )}
        </div>
    );
}
