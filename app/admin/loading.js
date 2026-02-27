"use client";

export default function AdminLoading() {
    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-50/80 backdrop-blur-sm">
            <div className="relative">
                {/* Outer Glow */}
                <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full scale-150 animate-pulse"></div>

                {/* Main Spinner */}
                <div className="relative flex items-center justify-center">
                    <div className="w-20 h-20 border-[3px] border-gray-100 rounded-2xl"></div>
                    <div className="absolute w-20 h-20 border-[3px] border-blue-600 border-t-transparent rounded-2xl animate-spin shadow-lg shadow-blue-100"></div>

                    {/* Inner Content */}
                    <div className="absolute flex flex-col items-center">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md animate-bounce">
                            <span className="text-white font-black text-xs">QR</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading Text */}
            <div className="mt-8 flex flex-col items-center">
                <h3 className="text-gray-900 font-black text-xl tracking-tight">Loading</h3>
                <div className="flex space-x-1 mt-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
                </div>
            </div>

            <p className="mt-4 text-gray-400 font-bold text-xs uppercase tracking-[0.2em]">Preparing Dashboard</p>
        </div>
    );
}
