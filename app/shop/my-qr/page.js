"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import ShopSidebar from "../../components/ShopSidebar";
import ShopMobileHeader from "../../components/ShopMobileHeader";
import { Download, Loader2, Share2 } from "lucide-react";
import html2canvas from "html2canvas";

export default function MyQrPage() {
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [business, setBusiness] = useState(null);
    const cardRef = useRef(null);

    useEffect(() => {
        const id = sessionStorage.getItem("businessId");
        if (!id) {
            router.push("/shop/login");
            return;
        }
        fetchProfile(id);
    }, []);

    const toBase64 = async (url) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } catch (e) {
            console.error("Base64 conversion failed", e);
            return url;
        }
    };

    const fetchProfile = async (id) => {
        try {
            const res = await fetch(`/api/shop/profile?id=${id}`);
            const data = await res.json();
            if (res.ok) {
                // Convert images to base64 to ensure capture works
                const updatedData = { ...data };
                if (data.logo) updatedData.logo = await toBase64(data.logo);
                if (data.qrCode) updatedData.qrCode = await toBase64(data.qrCode);
                setBusiness(updatedData);
            }
        } catch (error) {
            console.error("Failed to fetch profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        if (!cardRef.current || isSharing) return;
        setIsSharing(true);

        try {
            // Give a tiny moment for images to settle
            await new Promise(r => setTimeout(r, 800));

            const canvas = await html2canvas(cardRef.current, {
                useCORS: true,
                allowTaint: true,
                scale: 4,
                backgroundColor: "#ffffff",
                onclone: (clonedDoc) => {
                    const clonedElement = clonedDoc.getElementById('qr-card-design');
                    if (clonedElement) {
                        clonedElement.style.height = "600px";
                        clonedElement.style.width = "400px";
                        clonedElement.style.display = "flex";
                        clonedElement.style.flexDirection = "column";
                        clonedElement.style.overflow = "visible";
                    }
                    const innerContainer = clonedDoc.querySelector('#qr-card-design > div');
                    if (innerContainer) {
                        innerContainer.style.flex = "1";
                        innerContainer.style.display = "flex";
                        innerContainer.style.flexDirection = "column";
                        innerContainer.style.height = "590px";
                        innerContainer.style.overflow = "visible";
                    }
                }
            });

            const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
            const file = new File([blob], `QR_${business.name}.png`, { type: 'image/png' });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file]
                });
            } else if (navigator.share) {
                await navigator.share({
                    title: business.name,
                    text: `Check out the digital menu for ${business.name}`,
                    url: `${window.location.origin}/b/${business.slug}`
                });
            } else {
                navigator.clipboard.writeText(`${window.location.origin}/b/${business.slug}`);
                alert("Menu link copied to clipboard!");
            }
        } catch (error) {
            console.error("Share failed:", error);
            // Fallback
            if (navigator.share) {
                await navigator.share({
                    title: business.name,
                    text: `Check out the digital menu for ${business.name}`,
                    url: `${window.location.origin}/b/${business.slug}`
                });
            } else {
                navigator.clipboard.writeText(`${window.location.origin}/b/${business.slug}`);
                alert("Menu link copied to clipboard!");
            }
        } finally {
            setIsSharing(false);
        }
    };

    const handleDownload = async () => {
        if (!cardRef.current || isDownloading) return;
        setIsDownloading(true);

        try {
            // Give a tiny moment for images to settle
            await new Promise(r => setTimeout(r, 800));

            const canvas = await html2canvas(cardRef.current, {
                useCORS: true,
                allowTaint: true,
                scale: 4,
                backgroundColor: "#ffffff",
                logging: false,
                onclone: (clonedDoc) => {
                    const clonedElement = clonedDoc.getElementById('qr-card-design');
                    if (clonedElement) {
                        clonedElement.style.height = "600px";
                        clonedElement.style.width = "400px";
                        clonedElement.style.display = "flex";
                        clonedElement.style.flexDirection = "column";
                        clonedElement.style.overflow = "visible";
                    }
                    const innerContainer = clonedDoc.querySelector('#qr-card-design > div');
                    if (innerContainer) {
                        innerContainer.style.flex = "1";
                        innerContainer.style.display = "flex";
                        innerContainer.style.flexDirection = "column";
                        innerContainer.style.height = "590px";
                        innerContainer.style.overflow = "visible";
                    }
                }
            });

            const image = canvas.toDataURL("image/png", 1.0);
            const link = document.createElement('a');
            link.href = image;
            link.download = `QR_Card_${business.name}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Download failed:", error);
            alert("Full card capture failed. Downloading only QR code as fallback.");
            const link = document.createElement('a');
            link.href = business.qrCode;
            link.download = `QR_Code_${business.name}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } finally {
            setIsDownloading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        </div>
    );

    if (!business) return null;

    return (
        <div className="flex min-h-screen bg-gray-50 overflow-x-hidden relative">
            <ShopSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1 lg:ml-64 min-w-0">
                <ShopMobileHeader onToggleSidebar={() => setIsSidebarOpen(true)} />
                <div className="p-4 sm:p-6 lg:p-10 flex items-center justify-center min-h-[calc(100vh-64px)] lg:min-h-screen">
                    <div className="w-full max-w-[400px] flex flex-col items-center">
                        {/* Styled QR Card */}
                        <div
                            id="qr-card-design"
                            ref={cardRef}
                            className="relative p-[5px] rounded-[10px] shadow-xl overflow-hidden flex flex-col w-full"
                            style={{
                                background: 'linear-gradient(to bottom right, #f87171, #fbbf24, #4ade80, #60a5fa, #c084fc)',
                                aspectRatio: '2/3',
                                maxWidth: '400px'
                            }}
                        >
                            <div className="rounded-[6px] p-6 text-center flex flex-col items-center relative" style={{ backgroundColor: '#ffffff', width: '100%', height: '100%', flex: '1' }}>
                                {/* 1. Business Logo (Top) */}
                                <div className="mb-3 mt-1 h-18 sm:h-14 flex items-center justify-center w-full px-4 text-center">
                                    {business.logo ? (
                                        <img src={business.logo} alt={business.name} crossOrigin="anonymous" className="object-contain" style={{ maxHeight: '100%', maxWidth: '100%', height: '56px' }} />
                                    ) : (
                                        <div className="text-xl font-black uppercase tracking-tighter" style={{ color: '#1f2937' }}>
                                            {business.name}
                                        </div>
                                    )}
                                </div>

                                {/* 2. SCAN ME */}
                                <h1 className="text-3xl sm:text-4xl font-[1000] tracking-tight mb-5 uppercase leading-none" style={{ color: '#000000', flexShrink: 0 }}>SCAN ME</h1>

                                {/* 3. QR Code */}
                                <div className="mb-3 p-3 rounded-[10px] border flex items-center justify-center shadow-sm" style={{ backgroundColor: '#ffffff', borderColor: 'rgba(0, 0, 0, 0.8)' }}>
                                    {business.qrCode ? (
                                        <img src={business.qrCode} alt="QR Code" crossOrigin="anonymous" className="w-40 h-40 sm:w-52 sm:h-52 object-contain" />
                                    ) : (
                                        <div className="w-40 h-40 sm:w-52 sm:h-52 flex items-center justify-center bg-gray-50 rounded-lg font-bold" style={{ color: '#e5e7eb' }}>
                                            No QR Code
                                        </div>
                                    )}
                                </div>

                                {/* 4. TO VIEW OUR MENU */}
                                <h2 className="text-base sm:text-lg font-black tracking-tight mb-1 uppercase" style={{ color: '#000000' }}>TO VIEW OUR MENU</h2>

                                {/* 5. Business Name */}
                                <p className="text-sm sm:text-base font-bold mb-1" style={{ color: '#334155' }}>{business.name}</p>

                                {/* 6. Powered by Colourmoon */}
                                <div className="mt-auto flex items-center justify-center pb-5 w-full" style={{ gap: '8px' }}>
                                    <span className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: '#6b7280', display: 'inline-block' }}>POWERED BY</span>
                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                        <img
                                            src="/assets/cmoon.png"
                                            alt="Colourmoon Logo"
                                            className="object-contain"
                                            style={{ display: 'block', height: '32px', width: '96px' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                            <button
                                onClick={handleDownload}
                                disabled={isDownloading}
                                className="flex items-center justify-center space-x-2 px-8 py-4 bg-black text-white rounded-2xl hover:bg-gray-800 transition-all shadow-xl font-black uppercase text-xs tracking-widest min-w-[200px] disabled:opacity-50"
                            >
                                {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                                <span>{isDownloading ? 'Capturing...' : 'Download QR'}</span>
                            </button>
                            <button
                                onClick={handleShare}
                                disabled={isSharing}
                                className="flex items-center justify-center space-x-2 px-8 py-4 bg-white text-black border-2 border-black rounded-2xl hover:bg-gray-50 transition-all shadow-xl font-black uppercase text-xs tracking-widest min-w-[200px] disabled:opacity-50"
                            >
                                {isSharing ? <Loader2 size={18} className="animate-spin" /> : <Share2 size={18} />}
                                <span>{isSharing ? 'Sharing...' : 'Share Menu'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
