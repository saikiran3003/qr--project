"use client";

import React, { useState } from "react";
import { Star, UtensilsCrossed, X, ChevronLeft, Send, Home } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FeedbackModal({ isOpen, onClose, business }) {
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: Stars, 2: Form, 3: Success
    const [rating, setRating] = useState(0);
    const [formData, setFormData] = useState({
        name: "",
        mobileNumber: "",
        comment: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    if (!isOpen) return null;

    const handleNextStep = () => {
        if (rating === 0) {
            setErrors({ rating: "Please select a rating" });
            return;
        }
        setErrors({});
        setStep(2);
    };

    const validateForm = () => {
        let newErrors = {};
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (formData.mobileNumber && !/^\d{10}$/.test(formData.mobileNumber)) {
            newErrors.mobileNumber = "Phone must be 10 digits";
        }
        if (formData.comment.trim().length < 18) {
            newErrors.comment = "Min 18 characters required";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/public/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    businessId: business._id,
                    rating,
                    ...formData
                })
            });

            if (res.ok) {
                setStep(3);
            }
        } catch (error) {
            console.error("Feedback submit error:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        const wasSubmitted = step === 3;
        onClose();

        // If they were on the success screen, take them back to the restaurant home
        if (wasSubmitted && business && business.slug) {
            router.push(`/b/${business.slug}`);
        }

        setTimeout(() => {
            setStep(1);
            setRating(0);
            setFormData({ name: "", mobileNumber: "", comment: "" });
            setErrors({});
        }, 300);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-indigo-950/40 backdrop-blur-sm transition-opacity" onClick={handleClose} />

            <div className="relative w-full max-w-[450px] bg-white rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                <button onClick={handleClose} className="absolute top-6 right-6 p-2 text-gray-300 hover:text-gray-500 z-10">
                    <X size={20} />
                </button>

                {step === 1 && (
                    <div className="p-8 pt-12 text-center">
                        <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg mb-4 mx-auto overflow-hidden text-white">
                            {business.logo ? <img src={business.logo} alt="" className="w-full h-full object-cover" /> : <UtensilsCrossed size={32} />}
                        </div>
                        <h2 className="text-lg font-bold text-indigo-600 mb-1">{business.name}</h2>
                        <h3 className="text-2xl font-black text-gray-800 leading-tight">How was your experience?</h3>

                        <div className="flex justify-center space-x-1 mt-8 mb-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} onClick={() => { setRating(star); setErrors({}); }} className={`transition-all ${rating >= star ? 'text-yellow-400 scale-110' : 'text-gray-200 hover:text-gray-300'}`}>
                                    <Star size={40} fill={rating >= star ? "currentColor" : "none"} strokeWidth={rating >= star ? 0 : 2} />
                                </button>
                            ))}
                        </div>
                        {errors.rating && <p className="text-red-500 text-xs font-bold mb-4">{errors.rating}</p>}

                        <button onClick={handleNextStep} className="w-full py-4 mt-6 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:bg-indigo-700 active:scale-95 transition-all">
                            Submit Rating
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="p-8 pt-12">
                        <div className="flex flex-col items-center text-center mb-8">
                            <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mb-3 overflow-hidden text-white">
                                {business.logo ? <img src={business.logo} alt="" className="w-full h-full object-cover" /> : <UtensilsCrossed size={24} />}
                            </div>
                            <h2 className="text-sm font-bold text-indigo-600 mb-1">{business.name}</h2>
                            <h3 className="text-xl font-black text-gray-800">Help Us Improve</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-1">Your Name *</label>
                                <input
                                    type="text"
                                    placeholder="Enter your name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className={`w-full px-5 py-4 bg-gray-50 border ${errors.name ? 'border-red-200' : 'border-gray-100'} rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 font-bold text-gray-700`}
                                />
                                {errors.name && <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold">{errors.name}</p>}
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-1">Phone Number (10 Digits)</label>
                                <input
                                    type="tel"
                                    maxLength={10}
                                    placeholder="Enter 10 digit number"
                                    value={formData.mobileNumber}
                                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value.replace(/\D/g, '') })}
                                    className={`w-full px-5 py-4 bg-gray-50 border ${errors.mobileNumber ? 'border-red-200' : 'border-gray-100'} rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 font-bold text-gray-700`}
                                />
                                {errors.mobileNumber && <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold">{errors.mobileNumber}</p>}
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1 ml-1">Your Feedback * (Min 18 Chars)</label>
                                <textarea
                                    rows={4}
                                    placeholder="Tell us about your experience..."
                                    value={formData.comment}
                                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                                    className={`w-full px-5 py-4 bg-gray-50 border ${errors.comment ? 'border-red-200' : 'border-gray-100'} rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 font-bold text-gray-700 resize-none`}
                                />
                                <div className="flex justify-between mt-1 px-1">
                                    {errors.comment ? <p className="text-red-500 text-[10px] font-bold">{errors.comment}</p> : <span />}
                                    <span className={`text-[10px] font-bold ${formData.comment.length < 18 ? 'text-gray-400' : 'text-green-500'}`}>{formData.comment.length} characters</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex space-x-3 mt-8">
                            <button onClick={() => setStep(1)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center space-x-2">
                                <ChevronLeft size={16} />
                                <span>Back</span>
                            </button>
                            <button onClick={handleSubmit} disabled={isSubmitting} className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center space-x-2 shadow-lg shadow-indigo-100">
                                {isSubmitting ? 'Sending...' : (
                                    <>
                                        <span>Submit Feedback</span>
                                        <Send size={16} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="p-8 pt-12 text-center animate-in fade-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl mb-6 mx-auto overflow-hidden border-4 border-indigo-50">
                            {business.logo ? <img src={business.logo} alt="" className="w-full h-full object-cover" /> : <UtensilsCrossed size={48} className="text-indigo-600" />}
                        </div>
                        <h2 className="text-2xl font-black text-gray-800 mb-2">{business.name}</h2>

                        <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 mt-4 shadow-lg shadow-green-100">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>

                        <h3 className="text-3xl font-black text-gray-800">Thank You!</h3>
                        <p className="text-sm text-gray-500 font-bold mt-4 px-4 leading-relaxed">
                            Your feedback has been <span className="text-indigo-600">successfully submitted</span>. We appreciate you taking the time to share your experience!
                        </p>

                        <button onClick={handleClose} className="w-full py-4 mt-10 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center space-x-2 shadow-xl shadow-indigo-100">
                            <Home size={16} />
                            <span>Back to Menu</span>
                        </button>
                    </div>
                )}
            </div>

            <style jsx>{`
                .animate-in { animation: modalIn 0.4s ease-out; }
                @keyframes modalIn {
                    from { opacity: 0; transform: scale(0.9) translateY(20px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    );
}
