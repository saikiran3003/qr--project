"use client";

export default function ShopLoading() {
    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
            <div className="relative">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-indigo-500/10 blur-[100px] rounded-full scale-150 animate-pulse"></div>

                {/* Stylish Spinner */}
                <div className="relative flex items-center justify-center">
                    <div className="w-16 h-16 border-[2px] border-gray-50 rounded-full"></div>
                    <div className="absolute w-16 h-16 border-[2px] border-indigo-600 border-t-transparent rounded-full animate-spin"></div>

                    {/* Pulsing Icon */}
                    <div className="absolute w-8 h-8 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-full animate-pulse shadow-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Minimalist Loading Text */}
            <div className="mt-8 flex flex-col items-center">
                <p className="text-gray-900 font-black text-xs uppercase tracking-[0.3em] ml-1 animate-pulse">Opening Menu</p>
                <div className="mt-4 flex space-x-1">
                    <div className="w-1 h-1 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-1 h-1 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                    <div className="w-1 h-1 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
            </div>
        </div>
    );
}
