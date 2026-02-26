"use client";

import React from "react";
import { X, Copy, Share2 } from "lucide-react";
import Swal from "sweetalert2";

export default function ShareModal({ isOpen, onClose, business }) {
    if (!isOpen) return null;

    const shareUrl = typeof window !== "undefined" ? window.location.origin + "/b/" + business.slug : "";
    const shareText = `Check out the digital menu for ${business.name}!`;

    const logShare = (platform) => {
        fetch('/api/public/share', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                businessId: business._id,
                platform: platform
            })
        }).catch(err => console.error("Log error:", err));
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        logShare('copy_link');
        Swal.fire({
            title: "Copied!",
            text: "Menu link copied to clipboard.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
            customClass: {
                container: 'z-[9999]'
            }
        });
        onClose();
    };

    const handleWhatsApp = () => {
        logShare('whatsapp');
        const url = `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`;
        window.open(url, "_blank", "noopener,noreferrer");
        onClose();
    };

    const handleFacebook = () => {
        logShare('facebook');
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        window.open(url, "_blank", "noopener,noreferrer");
        onClose();
    };

    const handleTwitter = () => {
        logShare('twitter');
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(url, "_blank", "noopener,noreferrer");
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="relative w-full max-w-[400px] bg-white rounded-[2rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300 p-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight">
                        Share eMenu
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* WhatsApp */}
                    <button
                        onClick={handleWhatsApp}
                        className="flex items-center justify-center space-x-3 bg-gray-50 hover:bg-gray-100 p-5 rounded-2xl transition-all active:scale-95 group"
                    >
                        <span className="text-2xl group-hover:scale-110 transition-transform">📱</span>
                        <span className="font-bold text-gray-700">WhatsApp</span>
                    </button>

                    {/* Facebook */}
                    <button
                        onClick={handleFacebook}
                        className="flex items-center justify-center space-x-3 bg-gray-50 hover:bg-gray-100 p-5 rounded-2xl transition-all active:scale-95 group"
                    >
                        <span className="text-2xl group-hover:scale-110 transition-transform">📘</span>
                        <span className="font-bold text-gray-700">Facebook</span>
                    </button>

                    {/* Twitter */}
                    <button
                        onClick={handleTwitter}
                        className="flex items-center justify-center space-x-3 bg-gray-50 hover:bg-gray-100 p-5 rounded-2xl transition-all active:scale-95 group"
                    >
                        <span className="text-2xl group-hover:scale-110 transition-transform">🦅</span>
                        <span className="font-bold text-gray-700">Twitter</span>
                    </button>

                    {/* Copy Link */}
                    <button
                        onClick={handleCopyLink}
                        className="flex items-center justify-center space-x-3 bg-gray-50 hover:bg-gray-100 p-5 rounded-2xl transition-all active:scale-95 group"
                    >
                        <span className="text-2xl group-hover:scale-110 transition-transform">📋</span>
                        <span className="font-bold text-gray-700">Copy Link</span>
                    </button>
                </div>
            </div>

            <style jsx>{`
                .animate-in {
                    animation: modalScale 0.3s ease-out forwards;
                }
                @keyframes modalScale {
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    );
}
