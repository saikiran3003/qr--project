"use client";

import { useEffect, useState, useRef } from "react";

export default function AdsBanner({ slug }) {
    const [ads, setAds] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const timerRef = useRef(null);

    useEffect(() => {
        if (!slug) return;
        fetch(`/api/public/business-ads/${slug}`)
            .then(r => r.json())
            .then(data => {
                if (data.ads && data.ads.length > 0) {
                    setAds(data.ads);
                }
            })
            .catch(() => { });
    }, [slug]);

    useEffect(() => {
        if (ads.length <= 1) return;
        timerRef.current = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % ads.length);
        }, 3000);
        return () => clearInterval(timerRef.current);
    }, [ads.length]);

    if (ads.length === 0) return null;

    return (
        <div className="w-full overflow-hidden relative shadow-sm h-48 sm:h-64 lg:h-[350px] bg-black/5">
            {/* Slides */}
            <div
                className="flex transition-transform duration-700 ease-in-out h-full"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {ads.map((ad, i) => (
                    <div key={ad._id} className="min-w-full h-full flex-shrink-0 relative flex justify-center items-center">
                        {/* Atmospheric Blur Background to fill width */}
                        <img
                            src={ad.imageUrl}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-50 scale-125"
                        />
                        {/* Foreground Image - No Cutting (As It Is) */}
                        <img
                            src={ad.imageUrl}
                            alt={`Ad ${i + 1}`}
                            className="relative w-full h-full object-contain z-10 mx-auto"
                        />
                    </div>
                ))}
            </div>

            {/* Dot indicators */}
            {ads.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
                    {ads.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                setCurrentIndex(i);
                                clearInterval(timerRef.current);
                                timerRef.current = setInterval(() => {
                                    setCurrentIndex(prev => (prev + 1) % ads.length);
                                }, 3000);
                            }}
                            className={`rounded-full transition-all duration-300 ${i === currentIndex ? "w-6 h-2 bg-white shadow-md" : "w-2 h-2 bg-white/40 hover:bg-white/60"}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
