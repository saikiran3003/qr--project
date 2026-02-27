"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import MobileHeader from "../../components/MobileHeader";
import { Plus, Trash2, Upload, X, ImageIcon, ChevronDown, ChevronLeft } from "lucide-react";
import Swal from "sweetalert2";

export default function ManageAdsPage() {
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [businesses, setBusinesses] = useState([]);
    const [selectedBusiness, setSelectedBusiness] = useState("");
    const [ads, setAds] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [loadingAds, setLoadingAds] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchBusinesses();
    }, []);

    useEffect(() => {
        if (selectedBusiness) fetchAds(selectedBusiness);
        else setAds([]);
    }, [selectedBusiness]);

    const fetchBusinesses = async () => {
        try {
            const res = await fetch("/api/business");
            const data = await res.json();
            if (res.ok) setBusinesses(data);
        } catch (e) {
            console.error("Failed to fetch businesses:", e);
        }
    };

    const fetchAds = async (businessId) => {
        setLoadingAds(true);
        try {
            const res = await fetch(`/api/business-ads?businessId=${businessId}`);
            const data = await res.json();
            if (res.ok) setAds(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("Failed to fetch ads:", e);
        } finally {
            setLoadingAds(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedBusiness || !imageFile) {
            Swal.fire("Error", "Please select a business and an image.", "error");
            return;
        }
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("businessId", selectedBusiness);
            formData.append("image", imageFile);
            formData.append("order", ads.length);

            const res = await fetch("/api/business-ads", { method: "POST", body: formData });
            const result = await res.json();
            if (res.ok) {
                Swal.fire({ title: "Ad Uploaded!", icon: "success", timer: 1500, showConfirmButton: false });
                setImageFile(null);
                setImagePreview(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
                fetchAds(selectedBusiness);
            } else {
                throw new Error(result.error || "Upload failed");
            }
        } catch (e) {
            Swal.fire("Error", e.message, "error");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (adId) => {
        const confirm = await Swal.fire({
            title: "Delete Ad?",
            text: "This ad banner will be removed permanently.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, Delete",
        });
        if (!confirm.isConfirmed) return;

        try {
            const res = await fetch(`/api/business-ads/${adId}`, { method: "DELETE" });
            if (res.ok) {
                Swal.fire({ title: "Deleted!", icon: "success", timer: 1200, showConfirmButton: false });
                fetchAds(selectedBusiness);
            }
        } catch (e) {
            Swal.fire("Error", e.message, "error");
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50 overflow-x-hidden relative">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1 lg:ml-64 min-w-0">
                <MobileHeader onToggleSidebar={() => setIsSidebarOpen(true)} />

                <div className="p-4 sm:p-6 lg:p-10">
                    <div className="max-w-[1600px] mx-auto w-full">
                        {/* Page Header */}
                        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0 text-center lg:text-left">
                            <div className="flex flex-col sm:flex-row items-center sm:space-x-4 space-y-4 sm:space-y-0">
                                <button onClick={() => router.back()} className="p-3 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all shadow-sm group">
                                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                                </button>
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Manage Ads</h1>
                                    <p className="text-g-400 font-bold mt-1 text-sm uppercase tracking-widest">Update advertisement banners for business pages</p>
                                </div>
                            </div>
                        </header>

                        {/* Search & Selector Row */}
                        <div className="mb-6 flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
                            <div className="relative flex-1">
                                <label className="block text-xs font-black text-black-400 uppercase tracking-widest mb-2 ml-1">Select Business to Manage Ads</label>
                                <div className="relative">
                                    <select
                                        value={selectedBusiness}
                                        onChange={(e) => setSelectedBusiness(e.target.value)}
                                        className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-600 font-bold cursor-pointer appearance-none shadow-sm"
                                    >
                                        <option value="">-- Choose a business --</option>
                                        {businesses.map(b => (
                                            <option key={b._id} value={b._id}>{b.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <ChevronDown size={18} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                            {/* Left: Upload Section */}
                            <div className="xl:col-span-5">
                                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 space-y-6">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                            <Upload size={20} />
                                        </div>
                                        <h2 className="text-xl font-black text-gray-800">Upload Banner</h2>
                                    </div>

                                    {/* Image upload */}
                                    <div className="space-y-4">
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full border-2 border-dashed border-blue-50 rounded-[2rem] overflow-hidden cursor-pointer hover:border-blue-300 hover:bg-blue-50/10 transition-all group"
                                            style={{ minHeight: "240px" }}
                                        >
                                            {imagePreview ? (
                                                <div className="relative h-full flex items-center justify-center bg-gray-50 p-4">
                                                    <img src={imagePreview} alt="Preview" className="max-w-full max-h-[300px] object-contain rounded-xl shadow-lg" />
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); setImagePreview(null); setImageFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                                                        className="absolute top-4 right-4 w-10 h-10 bg-white text-red-500 rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform z-20"
                                                    >
                                                        <X size={20} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center p-12 text-center">
                                                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                        <ImageIcon size={32} />
                                                    </div>
                                                    <p className="text-black-500 font-bold">Drop your ad banner here</p>
                                                    <p className="text-black-400 text-xs mt-2 uppercase tracking-widest font-black">JPG, PNG, GIF • 1200x400 Recommended</p>
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </div>

                                    <button
                                        onClick={handleUpload}
                                        disabled={uploading || !selectedBusiness || !imageFile}
                                        className="w-full h-16 bg-blue-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-sm flex items-center justify-center space-x-3 hover:bg-white hover:text-black border-2 border-transparent hover:border-blue-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-blue-50"
                                    >
                                        {uploading ? (
                                            <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Plus size={20} strokeWidth={3} />
                                                <span>Publish Banner</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Right: Existing Ads */}
                            <div className="xl:col-span-7">
                                <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 h-full">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                                <ImageIcon size={20} />
                                            </div>
                                            <h2 className="text-xl font-black text-gray-800">Current Banners</h2>
                                        </div>
                                        {selectedBusiness && ads.length > 0 && (
                                            <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full uppercase tracking-widest">
                                                {ads.length} Total Ads
                                            </span>
                                        )}
                                    </div>

                                    {!selectedBusiness ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50/50 rounded-[2rem] border border-dashed border-gray-200">
                                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 text-gray-200 shadow-sm">
                                                <ImageIcon size={32} />
                                            </div>
                                            <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Select a business above</p>
                                        </div>
                                    ) : loadingAds ? (
                                        <div className="flex flex-col items-center justify-center py-20">
                                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                                            <p className="mt-4 text-gray-400 font-black text-xs uppercase tracking-widest animate-pulse">Fetching ads...</p>
                                        </div>
                                    ) : ads.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50/50 rounded-[2rem] border border-dashed border-gray-200">
                                            <ImageIcon size={48} className="text-gray-200 mb-4" />
                                            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No active ads for this business</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-6 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                                            {ads.map((ad, i) => (
                                                <div key={ad._id} className="group relative bg-gray-50 rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm transition-all hover:shadow-md">
                                                    <div className="aspect-[16/6] w-full bg-white flex items-center justify-center p-2 relative">
                                                        <img
                                                            src={ad.imageUrl}
                                                            alt={`Ad ${i + 1}`}
                                                            className="w-full h-full object-contain rounded-xl"
                                                        />
                                                    </div>

                                                    <div className="absolute inset-0 bg-indigo-950/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px]">
                                                        <button
                                                            onClick={() => handleDelete(ad._id)}
                                                            className="px-6 py-3 bg-white text-red-600 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-red-600 hover:text-white transition-all flex items-center space-x-2 translate-y-4 group-hover:translate-y-0 duration-300"
                                                        >
                                                            <Trash2 size={16} />
                                                            <span>Remove Ad</span>
                                                        </button>
                                                    </div>

                                                    <div className="absolute top-4 left-4 flex items-center space-x-2">
                                                        <div className="bg-white/90 backdrop-blur-md text-gray-800 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm border border-black/5">
                                                            Banner #{i + 1}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
