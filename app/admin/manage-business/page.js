"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import MobileHeader from "../../components/MobileHeader";
import { Search, Plus, Edit, Trash2, X, Upload, Eye, ChevronDown, ChevronLeft } from "lucide-react";
import { Country, State, City } from 'country-state-city';
import Link from "next/link";
import Swal from "sweetalert2";

export default function ManageBusinessPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [businesses, setBusinesses] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(""); // Filter state
    const [categories, setCategories] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Auto-suggestion States
    const [countrySearch, setCountrySearch] = useState("");
    const [stateSearch, setStateSearch] = useState("");
    const [citySearch, setCitySearch] = useState("");
    const [filteredCountries, setFilteredCountries] = useState([]);
    const [filteredStates, setFilteredStates] = useState([]);
    const [filteredCities, setFilteredCities] = useState([]);
    const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
    const [showStateSuggestions, setShowStateSuggestions] = useState(false);
    const [showCitySuggestions, setShowCitySuggestions] = useState(false);

    // Form State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editBusinessId, setEditBusinessId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [previewImageUrl, setPreviewImageUrl] = useState(null);
    const [viewBusiness, setViewBusiness] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        userName: "",
        mobileNumber: "",
        email: "",
        country: "",
        state: "",
        city: "",
        address: "",
        password: "",
        category: "",
        logo: null,
        countryCode: "+91"
    });
    const [errors, setErrors] = useState({});

    const syncBusinesses = async () => {
        try {
            const res = await fetch("/api/business");
            const data = await res.json();
            if (res.ok) setBusinesses(data);
        } catch (error) {
            console.error("Failed to fetch businesses:", error);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/categories");
            const data = await res.json();
            if (res.ok) setCategories(data);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    };

    useEffect(() => {
        syncBusinesses();
        fetchCategories();
        setLoading(false);

        const handleClickOutside = (e) => {
            if (!e.target.closest('#country-container')) setShowCountrySuggestions(false);
            if (!e.target.closest('#state-container')) setShowStateSuggestions(false);
            if (!e.target.closest('#city-container')) setShowCitySuggestions(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e) => {
        const { id, value, files } = e.target;
        if (id === 'logo') {
            const file = files[0];
            setFormData(prev => ({ ...prev, logo: file }));
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setImagePreview(reader.result);
                reader.readAsDataURL(file);
            }
        } else if (id === 'mobileNumber') {
            const numericValue = value.replace(/\D/g, '').slice(0, 10);
            setFormData(prev => ({ ...prev, mobileNumber: numericValue }));
        } else {
            setFormData(prev => ({ ...prev, [id]: value }));
        }
        if (errors[id]) setErrors(prev => ({ ...prev, [id]: null }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name?.trim()) newErrors.name = "Required";
        if (!formData.userName?.trim()) newErrors.userName = "Required";
        if (!formData.email?.trim()) {
            newErrors.email = "Required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Invalid email";
        }
        if (!formData.mobileNumber?.trim()) {
            newErrors.mobileNumber = "Required";
        } else if (formData.mobileNumber.length !== 10) {
            newErrors.mobileNumber = "Must be 10 digits";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsSubmitting(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && key !== 'countryCode') {
                    if (key === 'mobileNumber') {
                        data.append(key, `${formData.countryCode} ${formData.mobileNumber}`);
                    } else {
                        data.append(key, formData[key]);
                    }
                }
            });

            const url = editBusinessId ? `/api/business/${editBusinessId}` : "/api/business";
            const method = editBusinessId ? "PUT" : "POST";
            const res = await fetch(url, { method, body: data });
            const result = await res.json();

            if (res.ok) {
                Swal.fire({ title: "Saved!", icon: "success", timer: 1500, showConfirmButton: false });
                resetForm();
                syncBusinesses();
            } else {
                throw new Error(result.error || "Failed to save");
            }
        } catch (error) {
            Swal.fire("Error", error.message, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setIsFormOpen(false);
        setEditBusinessId(null);
        setImagePreview(null);
        setFormData({
            name: "", userName: "", mobileNumber: "", email: "", country: "",
            state: "", city: "", address: "", password: "", category: "", logo: null, countryCode: "+91"
        });
        setErrors({});
        setCountrySearch(""); setStateSearch(""); setCitySearch("");
    };

    const handleAddBusiness = () => {
        resetForm();
        setIsFormOpen(true);
    };

    const handleEditBusiness = (biz) => {
        setEditBusinessId(biz._id);
        const parts = biz.mobileNumber?.split(' ') || [];
        setFormData({
            name: biz.name || "", userName: biz.userName || "",
            email: biz.email || "", country: biz.country || "",
            state: biz.state || "", city: biz.city || "",
            address: biz.address || "", password: "",
            category: biz.category?._id || biz.category || "",
            logo: biz.logo || null,
            countryCode: parts[0] || "+91",
            mobileNumber: parts.slice(1).join(' ') || biz.mobileNumber || ""
        });
        setImagePreview(biz.logo || null);
        setCountrySearch(biz.country || "");
        setStateSearch(biz.state || "");
        setCitySearch(biz.city || "");
        setIsFormOpen(true);
        setErrors({});
    };

    const handleViewBusiness = async (biz) => {
        setViewBusiness(biz);
        try {
            const res = await fetch(`/api/business/${biz._id}/view`, { method: "POST" });
            if (res.ok) {
                const data = await res.json();
                setBusinesses(prev => prev.map(b => b._id === biz._id ? { ...b, views: data.views } : b));
            }
        } catch (error) {
            console.error("Failed to increment views:", error);
        }
    };

    const handleDeleteBusiness = (id) => {
        Swal.fire({
            title: "Are you sure?", icon: "warning", showCancelButton: true,
            confirmButtonColor: "#ef4444", confirmButtonText: "Delete",
            showLoaderOnConfirm: true,
            preConfirm: async () => {
                try {
                    const res = await fetch(`/api/business/${id}`, { method: "DELETE" });
                    if (!res.ok) throw new Error("Failed to delete");
                    return await res.json();
                } catch (error) {
                    Swal.showValidationMessage(`Error: ${error}`);
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                syncBusinesses();
                Swal.fire({ title: "Deleted!", icon: "success", timer: 1500, showConfirmButton: false });
            }
        });
    };

    if (loading) return null;

    const filteredBusinesses = businesses.filter(biz => {
        const matchesSearch = biz.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "" || biz.category?._id === selectedCategory || biz.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="flex min-h-screen bg-gray-50 overflow-x-hidden relative">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1 lg:ml-64 min-w-0">
                <MobileHeader onToggleSidebar={() => setIsSidebarOpen(true)} />
                <div className="p-4 sm:p-6 lg:p-10">
                    <div className="max-w-[1600px] mx-auto w-full">
                        {!isFormOpen ? (
                            <>
                                <header className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 sm:mb-10 space-y-4 lg:space-y-0 text-center lg:text-left">
                                    <div className="flex flex-col sm:flex-row items-center sm:space-x-4 space-y-4 sm:space-y-0">
                                        <Link href="/admin/categories" className="p-3 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all shadow-sm group">
                                            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                                        </Link>
                                        <div>
                                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Manage Business</h1>
                                            <p className="text-gray-500 mt-1 text-sm sm:text-base">Manage your business entities here.</p>
                                        </div>
                                    </div>
                                    <button onClick={handleAddBusiness} className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 min-h-[48px] w-full lg:w-auto">
                                        <Plus size={20} />
                                        <span>Add New Business</span>
                                    </button>
                                </header>

                                <div className="mb-6 flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="text" placeholder="Search business..." value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 sm:py-4 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-600 font-medium shadow-sm"
                                        />
                                    </div>
                                    <div className="relative">
                                        <select
                                            value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
                                            className="w-full lg:w-64 px-6 py-3 sm:py-4 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-600 font-bold cursor-pointer appearance-none shadow-sm"
                                        >
                                            <option value="">All Categories</option>
                                            {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <ChevronDown size={18} />
                                        </div>
                                    </div>
                                </div>

                                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse min-w-[1000px]">
                                            <thead>
                                                <tr className="bg-gray-50 border-b border-gray-100">
                                                    <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider text-center">ID</th>
                                                    <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider text-center">Image</th>
                                                    <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Business Name</th>
                                                    <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Username</th>
                                                    <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider text-center">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {filteredBusinesses.length > 0 ? (
                                                    filteredBusinesses.map((biz, index) => (
                                                        <tr key={biz._id} className="hover:bg-gray-50 transition-colors">
                                                            <td className="px-6 py-4 text-gray-700 font-medium text-center">{index + 1}</td>
                                                            <td className="px-6 py-4 text-center">
                                                                <div onClick={() => setPreviewImageUrl(biz.logo)} className="w-10 h-10 rounded-lg overflow-hidden border border-gray-100 mx-auto bg-gray-50 cursor-zoom-in group">
                                                                    {biz.logo ? <img src={biz.logo} alt={biz.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" /> : <Upload size={14} className="text-gray-300 mx-auto" />}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-gray-700 font-bold whitespace-nowrap">{biz.name}</td>
                                                            <td className="px-6 py-4 text-gray-500 font-medium">{biz.userName || 'N/A'}</td>
                                                            <td className="px-6 py-4 text-center">
                                                                <div className="flex items-center justify-center space-x-2">
                                                                    <button onClick={() => handleViewBusiness(biz)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex flex-col items-center group">
                                                                        <Eye size={18} />
                                                                        <span className="text-[10px] font-bold mt-0.5">{biz.views || 0}</span>
                                                                    </button>
                                                                    <button onClick={() => handleEditBusiness(biz)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={18} /></button>
                                                                    <button onClick={() => handleDeleteBusiness(biz._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-500">No businesses found.</td></tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            </>
                        ) : (
                            <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-20">
                                <div className="p-6 sm:p-8 border-b border-gray-100 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">{editBusinessId ? 'Edit Business' : 'Add New Business'}</h2>
                                        <p className="text-gray-500 mt-1 text-sm">{editBusinessId ? 'Update information' : 'Fill details below'}</p>
                                    </div>
                                    <button onClick={resetForm} className="p-3 hover:bg-gray-100 rounded-xl text-gray-400 Transition-colors"><X size={24} /></button>
                                </div>
                                <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-1">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Business Name*</label>
                                            <input id="name" type="text" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                        </div>
                                        <div className="md:col-span-1">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Username*</label>
                                            <input id="userName" type="text" value={formData.userName} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                                            {errors.userName && <p className="text-red-500 text-xs mt-1">{errors.userName}</p>}
                                        </div>
                                        <div className="md:col-span-1">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email*</label>
                                            <input id="email" type="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                        </div>
                                        <div className="md:col-span-1">
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile*</label>
                                            <input id="mobileNumber" type="text" value={formData.mobileNumber} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20" placeholder="10 digits" />
                                            {errors.mobileNumber && <p className="text-red-500 text-xs mt-1">{errors.mobileNumber}</p>}
                                        </div>
                                    </div>
                                    <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-[0.98]">
                                        {isSubmitting ? 'Saving...' : 'Save Business'}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {previewImageUrl && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setPreviewImageUrl(null)}>
                    <div className="relative max-w-4xl max-h-[90vh]">
                        <button onClick={() => setPreviewImageUrl(null)} className="absolute -top-12 right-0 p-2 text-white"><X size={32} /></button>
                        <img src={previewImageUrl} alt="Preview" className="max-w-full max-h-[90vh] rounded-2xl object-contain" onClick={e => e.stopPropagation()} />
                    </div>
                </div>
            )}

            {viewBusiness && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setViewBusiness(null)}>
                    <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 overflow-y-auto max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Business Details</h2>
                            <button onClick={() => setViewBusiness(null)}><X size={24} className="text-gray-400" /></button>
                        </div>
                        <div className="space-y-4">
                            <p className="flex justify-between border-b border-gray-50 pb-2"><strong className="text-gray-600">Name:</strong> <span className="text-gray-800 font-medium">{viewBusiness.name}</span></p>
                            <p className="flex justify-between border-b border-gray-50 pb-2"><strong className="text-gray-600">Username:</strong> <span className="text-gray-800 font-medium">{viewBusiness.userName}</span></p>
                            <p className="flex justify-between border-b border-gray-50 pb-2"><strong className="text-gray-600">Email:</strong> <span className="text-gray-800 font-medium">{viewBusiness.email}</span></p>
                            <p className="flex justify-between border-b border-gray-50 pb-2"><strong className="text-gray-600">Phone:</strong> <span className="text-gray-800 font-medium">{viewBusiness.mobileNumber}</span></p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
