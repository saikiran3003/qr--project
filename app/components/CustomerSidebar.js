"use client";

import React from "react";
import { X, MessageSquare, Share2, Star, Phone, MapPin, Mail } from "lucide-react";

export default function CustomerSidebar({ isOpen, onClose, business }) {
    if (!isOpen) return null;

    return (
        <>
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
                        <button className="w-full flex items-center space-x-4 py-4 hover:bg-gray-50 transition-colors group">
                            <div className="w-10 h-10 flex items-center justify-center text-gray-400 group-hover:text-indigo-600">
                                <MessageSquare size={20} />
                            </div>
                            <span className="font-bold text-gray-700">Feedback</span>
                        </button>

                        <button className="w-full flex items-center space-x-4 py-4 hover:bg-gray-50 transition-colors group">
                            <div className="w-10 h-10 flex items-center justify-center text-gray-400 group-hover:text-indigo-600">
                                <Share2 size={20} />
                            </div>
                            <span className="font-bold text-gray-700">Share eMenu</span>
                        </button>

                        <button className="w-full flex items-center space-x-4 py-4 hover:bg-gray-50 transition-colors group">
                            <div className="w-10 h-10 flex items-center justify-center text-gray-400 group-hover:text-indigo-600">
                                <MessageSquare size={20} />
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
                        <div className="flex items-start space-x-4 p-4 text-gray-500 group">
                            <div className="text-gray-400">
                                <MapPin size={20} className="mt-0.5" />
                            </div>
                            <span className="text-sm font-bold leading-relaxed">{business.address}, {business.city}</span>
                        </div>
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
