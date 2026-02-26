"use client";

import React, { useState } from "react";
import { Star, UtensilsCrossed, X } from "lucide-react";
import Swal from "sweetalert2";

export default function FeedbackModal({ isOpen, onClose, business }) {
    const [rating, setRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (rating === 0) {
            Swal.fire({
                title: 'Select Rating',
                text: 'Please select a rating before submitting.',
                icon: 'warning',
                confirmButtonColor: '#171098ff'
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/public/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessId: business._id,
                    rating
                })
            });

            if (res.ok) {
                Swal.fire({
                    title: 'Thank You!',
                    text: 'Your feedback has been submitted successfully.',
                    icon: 'success',
                    confirmButtonColor: '#4f46e5'
                }).then(() => {
                    onClose();
                    setRating(0);
                });
            } else {
                throw new Error("Failed to submit feedback");
            }
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: 'Something went wrong. Please try again.',
                icon: 'error',
                confirmButtonColor: '#4f46e5'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const ratingLabels = [
        { val: 1, label: "Poor" },
        { val: 2, label: "Fair" },
        { val: 3, label: "Good" },
        { val: 4, label: "Very Good" },
        { val: 5, label: "Excellent" }
    ];

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-indigo-950/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="relative w-full max-w-[400px] bg-white rounded-[3rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-gray-300 hover:text-gray-500 transition-colors z-10"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center p-8 pt-12 pb-10 text-center">
                    {/* Top Circle Image/Icon */}
                    <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg mb-6 overflow-hidden">
                        {business.logo ? (
                            <img src={business.logo} alt={business.name} className="w-full h-full object-cover" />
                        ) : (
                            <UtensilsCrossed size={48} className="text-white" />
                        )}
                    </div>

                    {/* Business Name */}
                    <h2 className="text-2xl font-black text-indigo-600 tracking-tight mb-2">
                        {business.name}
                    </h2>

                    <h3 className="text-2xl font-black text-gray-800 tracking-tight leading-tight">
                        How was your experience?
                    </h3>

                    <p className="text-gray-400 font-bold mt-2 text-sm uppercase tracking-widest">
                        We'd love to hear your feedback!
                    </p>

                    {/* Star Rating Section */}
                    <div className="mt-10 w-full">
                        <div className="flex justify-center space-x-1 mb-8">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    className={`transition-all duration-300 transform active:scale-90 ${rating >= star ? 'text-yellow-400 scale-110' : 'text-gray-300 hover:text-gray-400'
                                        }`}
                                >
                                    <Star
                                        size={48}
                                        fill={rating >= star ? "currentColor" : "none"}
                                        strokeWidth={rating >= star ? 0 : 2}
                                    />
                                </button>
                            ))}
                        </div>

                        {/* Labels under stars */}
                        <div className="flex justify-between w-full px-2 mb-10">
                            {ratingLabels.map((item) => (
                                <div key={item.val} className="flex flex-col items-center space-y-1">
                                    <span className={`text-[10px] font-black ${rating === item.val ? 'text-indigo-600' : 'text-indigo-600/40'}`}>
                                        {item.val}
                                    </span>
                                    <span className={`text-[10px] font-black uppercase tracking-tighter ${rating === item.val ? 'text-gray-800' : 'text-gray-400'}`}>
                                        {item.label}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="mb-8">
                            <p className="text-gray-800 font-black text-lg">
                                {rating === 0 ? "Select a rating" : ratingLabels[rating - 1].label}
                            </p>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className={`w-full py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm shadow-xl transition-all active:scale-95 ${isSubmitting
                                ? 'bg-indigo-300 text-white cursor-not-allowed'
                                : 'bg-gradient-to-r from-indigo-900 to-purple-500 text-white hover:shadow-indigo-200/50'
                                }`}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Rating'}
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .animate-in {
                    animation: modalIn 0.4s ease-out;
                }
                @keyframes modalIn {
                    from { opacity: 0; transform: scale(0.9) translateY(20px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    );
}
