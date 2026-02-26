"use client";

import React, { useState } from "react";
import { X, MessageSquare, Share2, Star, Phone, MapPin, Mail } from "lucide-react";
import FeedbackModal from "./FeedbackModal";
import ShareModal from "./ShareModal";

export default function CustomerSidebar({ isOpen, onClose, business }) {
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [isShareOpen, setIsShareOpen] = useState(false);

    // Prevent crash if business data hasn't loaded yet
    if (!business) return null;

    // Safety for sidebar opening
    // We keep the component mounted for animations and state but only render content based on business existence
    if (!isOpen && !isFeedbackOpen && !isShareOpen) return null;

    const handleFeedbackClick = () => {
        setIsFeedbackOpen(true);
    };

    const handleShareClick = () => {
        setIsShareOpen(true);
    };

    const handleGoogleReviewClick = () => {
        // Fire analytics logging in background
        fetch('/api/public/share', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                businessId: business._id,
                platform: 'google_review'
            })
        }).catch(err => console.error("Log error:", err));

        // Open URL immediately to avoid browser popup blocker
        if (business && business.googleReviewUrl) {
            window.open(business.googleReviewUrl, "_blank", "noopener,noreferrer");
        } else {
            alert("Google Review link not configured for this business in Admin Panel.");
        }
    };

    return (
        <>
            <FeedbackModal
                isOpen={isFeedbackOpen}
                onClose={() => setIsFeedbackOpen(false)}
                business={business}
            />

            <ShareModal
                isOpen={isShareOpen}
                onClose={() => setIsShareOpen(false)}
                business={business}
            />

            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Sidebar */}
            <div className={`fixed top-0 left-0 h-full w-[80%] max-w-[320px] bg-white z-[101] shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>

                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 flex items-center justify-between text-white">
                    <h2 className="text-2xl font-black tracking-tight">eMenu</h2>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Main Menu Items */}
                <div className="p-4 pt-6">
                    <div className="divide-y divide-gray-100">
                        <button
                            onClick={handleFeedbackClick}
                            className="w-full flex items-center space-x-4 py-4 hover:bg-gray-50 transition-colors group"
                        >
                            <div className="w-10 h-10 flex items-center justify-center text-gray-400 group-hover:text-indigo-600">
                                <MessageSquare size={20} />
                            </div>
                            <span className="font-bold text-gray-700">Feedback</span>
                        </button>

                        <button
                            onClick={handleShareClick}
                            className="w-full flex items-center space-x-4 py-4 hover:bg-gray-50 transition-colors group"
                        >
                            <div className="w-10 h-10 flex items-center justify-center text-gray-400 group-hover:text-indigo-600">
                                <Share2 size={20} />
                            </div>
                            <span className="font-bold text-gray-700">Share eMenu</span>
                        </button>

                        <button
                            onClick={handleGoogleReviewClick}
                            className="w-full flex items-center space-x-4 py-4 hover:bg-gray-50 transition-colors group"
                        >
                            <div className="w-10 h-10 flex items-center justify-center text-gray-400 group-hover:text-indigo-600">
                                <Star size={20} />
                            </div>
                            <span className="font-bold text-gray-700">Google Review</span>
                        </button>
                    </div>
                </div>

                {/* Contact Info (Bottom) */}
                <div className="absolute bottom-0 left-0 w-full bg-white border-t border-gray-100 p-4 pb-10 space-y-1">
                    {business.mobileNumber && (
                        <a href={`tel:${business.mobileNumber}`} className="flex items-center space-x-4 p-4 text-gray-500 hover:text-indigo-600 transition-colors group">
                            <div className="text-gray-400 group-hover:text-indigo-600 transition-colors">
                                <Phone size={20} />
                            </div>
                            <span className="text-sm font-bold">{business.mobileNumber}</span>
                        </a>
                    )}

                    {business.address && (
                        <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${business.address}, ${business.city}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start space-x-4 p-4 text-gray-500 hover:text-indigo-600 transition-colors group"
                        >
                            <div className="text-gray-400 group-hover:text-indigo-600 transition-colors">
                                <MapPin size={20} className="mt-0.5" />
                            </div>
                            <span className="text-sm font-bold leading-relaxed">{business.address}, {business.city}</span>
                        </a>
                    )}

                    {business.email && (
                        <a href={`mailto:${business.email}`} className="flex items-center space-x-4 p-4 text-gray-500 hover:text-indigo-600 transition-colors group">
                            <div className="text-gray-400 group-hover:text-indigo-600 transition-colors">
                                <Mail size={20} />
                            </div>
                            <span className="text-sm font-bold truncate">{business.email}</span>
                        </a>
                    )}
                </div>
            </div>
        </>
    );
}
