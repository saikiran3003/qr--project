"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, Store } from "lucide-react";
import Swal from "sweetalert2";

export default function ShopLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Clear previous shop session
        sessionStorage.removeItem("shopLoggedIn");
        sessionStorage.removeItem("businessId");
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");
        try {
            const res = await fetch("/api/shop/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                sessionStorage.setItem("shopLoggedIn", "true");
                sessionStorage.setItem("businessId", data.businessId);
                Swal.fire({
                    title: "Login Successful",
                    text: `Welcome, ${data.name}`,
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    router.push("/shop/dashboard");
                });
            } else {
                setError(data.error || "Invalid email or password");
            }
        } catch (err) {
            setError("An error occurred during login");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-10 bg-gray-50 overflow-hidden">
            <div className="w-full max-w-md bg-white rounded-[2rem] shadow-xl shadow-blue-100/20 overflow-hidden border border-gray-100">
                <div className="p-8 sm:p-10">
                    <div className="text-center mb-10">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
                            <Store className="text-white" size={28} />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-tight">Shop Admin Login</h1>
                        <p className="text-gray-500 mt-2 font-medium text-sm sm:text-base">Manage your business & products</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="password"
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium text-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Logging in...' : 'Login to Shop Panel'}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}
