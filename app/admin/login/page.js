"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, ShieldCheck } from "lucide-react";
import Swal from "sweetalert2";
import Link from "next/link";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const performAutoLogout = async () => {
            try {
                sessionStorage.removeItem("isLoggedIn");
                localStorage.removeItem("token");
                await fetch("/api/admin/logout", { method: "POST" });
            } catch (error) {
                console.error("[Login] Auto-logout failed:", error);
            }
        };
        performAutoLogout();
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");
        try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (res.ok) {
                sessionStorage.setItem("isLoggedIn", "true");
                Swal.fire({
                    title: "Login Successful",
                    icon: "success",
                    confirmButtonText: "OK",
                    confirmButtonColor: "#2563eb",
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    router.push("/admin/dashboard");
                });
            } else {
                setError(data.error || "Invalid username or password");
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
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
                            <ShieldCheck className="text-white" size={28} />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-tight">Admin Login</h1>
                        <p className="text-gray-500 mt-2 font-medium text-sm sm:text-base">Authenticate to access the dashboard</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    required
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                                    placeholder="Enter username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
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
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
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
                            className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Logging in...' : 'Login to Dashboard'}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}
