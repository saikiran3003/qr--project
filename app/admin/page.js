"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Lock } from "lucide-react";
import Swal from "sweetalert2";
import Link from "next/link";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== "undefined") {
            const isLoggedIn = localStorage.getItem("isLoggedIn");
            if (isLoggedIn === "true") {
                router.push("/admin/dashboard");
            }
        }
    }, [router]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (res.ok) {
                if (typeof window !== "undefined") {
                    localStorage.setItem("isLoggedIn", "true");
                    localStorage.setItem("token", data.token);
                    Swal.fire({
                        title: "Login Successful",
                        icon: "success",
                        confirmButtonText: "OK",
                        confirmButtonColor: "#2563eb",
                        timer: 2000,
                        timerProgressBar: true
                    }).then(() => {
                        router.push("/admin/dashboard");
                    });
                }
            } else {
                setError(data.error || "Invalid username or password");
            }
        } catch (err) {
            setError("An error occurred during login");
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center p-4 bg-gray-100">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                <div className="p-8">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-gray-800">QR Menu</h1>
                        <p className="text-gray-500 mt-2">Authenticate to access the dashboard</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User size={20} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="admin"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock size={20} className="text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <p className="text-red-500 text-sm text-center font-medium animate-shake">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transform transition-all active:scale-[0.98]"
                        >
                            Login to Dashboard
                        </button>

                        <div className="text-center mt-6">
                            <p className="text-gray-500 text-sm">
                                Don't have an account?{" "}
                                <Link href="/admin/signup" className="text-blue-600 font-semibold hover:underline">
                                    Sign Up
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}
