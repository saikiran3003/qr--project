"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
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
    const [editBusinessId, setEditBusinessId] = useState(null); // Track if editing
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState(null); // Form image preview
    const [previewImageUrl, setPreviewImageUrl] = useState(null); // Modal preview
    const [viewBusiness, setViewBusiness] = useState(null); // Business being viewed

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
            if (res.ok) {
                setBusinesses(data);
            }
        } catch (error) {
            console.error("Failed to fetch businesses:", error);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/categories");
            const data = await res.json();
            if (res.ok) {
                setCategories(data);
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    };

    useEffect(() => {
        // middleware handles route protection
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
    }, [router]);

    const handleInputChange = (e) => {
        const { id, value, files } = e.target;
        if (id === 'logo') {
            const file = files[0];
            setFormData(prev => ({ ...prev, logo: file }));
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setImagePreview(reader.result);
                };
                reader.readAsDataURL(file);
            }
        } else if (id === 'mobileNumber') {
            const numericValue = value.replace(/\D/g, '').slice(0, 10);
            setFormData(prev => ({ ...prev, mobileNumber: numericValue }));
        } else {
            setFormData(prev => ({ ...prev, [id]: value }));
        }
        if (errors[id]) {
            setErrors(prev => ({ ...prev, [id]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Required Fields: Business Name, Username, Email, Mobile Number
        if (!formData.name || formData.name.trim() === "") {
            newErrors.name = "This field is required";
        }

        if (!formData.userName || formData.userName.trim() === "") {
            newErrors.userName = "This field is required";
        }

        if (!formData.email || formData.email.trim() === "") {
            newErrors.email = "This field is required";
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                newErrors.email = "Please enter a valid email address";
            }
        }

        if (!formData.mobileNumber || formData.mobileNumber.trim() === "") {
            newErrors.mobileNumber = "This field is required";
        } else if (formData.mobileNumber.length !== 10) {
            newErrors.mobileNumber = "Mobile number must be 10 digits";
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

            const res = await fetch(url, {
                method,
                body: data,
            });

            const result = await res.json();

            if (res.ok) {
                Swal.fire({
                    title: editBusinessId ? "Updated Successfully" : "Added Successfully",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                });
                resetForm();
                syncBusinesses();
            } else {
                throw new Error(result.error || "Failed to save business");
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
        setErrors({});
        setCountrySearch("");
        setStateSearch("");
        setCitySearch("");
    };

    const handleAddBusiness = () => {
        resetForm();
        setIsFormOpen(true);
    };

    const handleEditBusiness = (business) => {
        setEditBusinessId(business._id);
        setFormData({
            name: business.name || "",
            userName: business.userName || "",
            mobileNumber: business.mobileNumber || "",
            email: business.email || "",
            country: business.country || "",
            state: business.state || "",
            city: business.city || "",
            address: business.address || "",
            password: "", // Keep password empty for security, only update if typed
            category: business.category?._id || business.category || "",
            logo: business.logo || null,
            countryCode: business.mobileNumber?.split(' ')[0] || "+91",
            mobileNumber: business.mobileNumber?.split(' ').slice(1).join(' ') || business.mobileNumber || ""
        });
        setImagePreview(business.logo || null);
        setCountrySearch(business.country || "");
        setStateSearch(business.state || "");
        setCitySearch(business.city || "");
        setIsFormOpen(true);
        setErrors({});
    };

    const handleViewBusiness = async (business) => {
        setViewBusiness(business);
        try {
            const res = await fetch(`/api/business/${business._id}/view`, {
                method: "POST",
            });
            if (res.ok) {
                const data = await res.json();
                // Update local state to show incremented views immediately
                setBusinesses(prev => prev.map(b =>
                    b._id === business._id ? { ...b, views: data.views } : b
                ));
            }
        } catch (error) {
            console.error("Failed to increment views:", error);
        }
    };

    const handleDeleteBusiness = (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, delete it!",
            showLoaderOnConfirm: true,
            preConfirm: async () => {
                try {
                    const res = await fetch(`/api/business/${id}`, {
                        method: "DELETE",
                    });
                    if (!res.ok) throw new Error("Failed to delete business");
                    return await res.json();
                } catch (error) {
                    Swal.showValidationMessage(`Request failed: ${error}`);
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                syncBusinesses();
                Swal.fire({
                    title: "Deleted!",
                    text: "Business has been deleted.",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        });
    };

    if (loading) return null;

    const filteredBusinesses = businesses.filter(biz => {
        const matchesSearch = biz.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "" || (biz.category?._id === selectedCategory || biz.category === selectedCategory);
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="flex min-h-screen bg-gray-50 overflow-x-hidden relative">
            <Sidebar />

            <main className="flex-1 ml-64 p-10 min-w-0">
                <div className="max-w-[1600px] mx-auto w-full">
                    {!isFormOpen ? (
                        <>
                            <header className="flex flex-col mb-10">
                                <Link
                                    href="/admin/categories"
                                    className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors mb-4 group w-fit"
                                >
                                    <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
                                    <span className="font-semibold text-sm">Back</span>
                                </Link>
                                <h1 className="text-3xl font-bold text-gray-800">Manage Business</h1>
                                <p className="text-gray-500 mt-1">Manage your business entities here.</p>
                            </header>

                            <div className="mb-6 flex space-x-4 items-center">
                                <div className="relative w-[300px]">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Search business..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-600 font-medium"
                                    />
                                </div>
                                <div className="relative">
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="px-6 py-3 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-600 font-bold cursor-pointer appearance-none min-w-[200px]"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map(cat => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <ChevronDown size={18} />
                                    </div>
                                </div>
                                <button
                                    onClick={handleAddBusiness}
                                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 h-[50px] whitespace-nowrap"
                                >
                                    <Plus size={20} />
                                    <span>Add New</span>
                                </button>
                            </div>

                            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-100">
                                                <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider text-center">ID</th>
                                                <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider text-center">Image</th>
                                                <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Business Name</th>
                                                <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Username</th>
                                                <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Category</th>
                                                <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Phone</th>
                                                <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider text-center">Status</th>
                                                <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {filteredBusinesses.length > 0 ? (
                                                filteredBusinesses.map((biz, index) => (
                                                    <tr key={biz._id} className="hover:bg-gray-50 transition-colors">
                                                        <td className="px-6 py-4 text-gray-700 font-medium text-center">{index + 1}</td>
                                                        <td className="px-6 py-4 text-center">
                                                            <div
                                                                onClick={() => setPreviewImageUrl(biz.logo)}
                                                                className="w-10 h-10 rounded-lg overflow-hidden border border-gray-100 mx-auto bg-gray-50 cursor-zoom-in group"
                                                            >
                                                                {biz.logo ? (
                                                                    <img src={biz.logo} alt={biz.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                                        <Upload size={14} />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-gray-700 font-bold whitespace-nowrap">{biz.name}</td>
                                                        <td className="px-6 py-4 text-gray-500 font-medium">{biz.userName || 'N/A'}</td>
                                                        <td className="px-6 py-4 text-gray-500 font-medium">{biz.category?.name || 'N/A'}</td>
                                                        <td className="px-6 py-4 text-gray-500 font-medium">{biz.mobileNumber || biz.phoneNumber || 'N/A'}</td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${biz.status !== false ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                                                {biz.status !== false ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center justify-center space-x-2">
                                                                <button
                                                                    onClick={() => handleViewBusiness(biz)}
                                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex flex-col items-center group"
                                                                    title="View Details"
                                                                >
                                                                    <Eye size={18} className="group-hover:scale-110 transition-transform" />
                                                                    <span className="text-[10px] font-bold mt-0.5">{biz.views || 0}</span>
                                                                </button>
                                                                <button
                                                                    onClick={() => handleEditBusiness(biz)}
                                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                    title="Edit"
                                                                >
                                                                    <Edit size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteBusiness(biz._id)}
                                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="8" className="px-6 py-10 text-center text-gray-500 font-medium">
                                                        No businesses found matching your search.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </>
                    ) : (
                        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-20 animate-in fade-in slide-in-from-bottom-5 duration-300">
                            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">{editBusinessId ? 'Edit Business' : 'Add New Business'}</h2>
                                    <p className="text-gray-500 mt-1">{editBusinessId ? 'Update business information.' : 'Fill in the details to create a new business.'}</p>
                                </div>
                                <button
                                    onClick={resetForm}
                                    className="p-3 hover:bg-gray-50 rounded-xl transition-colors text-gray-400"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Business Name */}
                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Business Name <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <input
                                            id="name"
                                            type="text"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 bg-gray-50 border ${errors.name ? 'border-red-500' : 'border-gray-100'} rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium`}
                                            placeholder="e.g. Starbucks"
                                        />
                                        {errors.name && <p className="text-red-500 text-xs mt-2 font-semibold">{errors.name}</p>}
                                    </div>

                                    {/* Username */}
                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Username <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <input
                                            id="userName"
                                            type="text"
                                            value={formData.userName}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 bg-gray-50 border ${errors.userName ? 'border-red-500' : 'border-gray-100'} rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium`}
                                            placeholder="e.g. starbucks123"
                                        />
                                        {errors.userName && <p className="text-red-500 text-xs mt-2 font-semibold">{errors.userName}</p>}
                                    </div>

                                    {/* Mobile Number */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Mobile Number <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <div className={`flex items-center bg-gray-50 border ${errors.mobileNumber ? 'border-red-500' : 'border-gray-100'} rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 transition-all`}>
                                            <select
                                                id="countryCode"
                                                value={formData.countryCode}
                                                onChange={handleInputChange}
                                                className="bg-transparent pl-4 pr-1 py-3 text-sm font-bold text-gray-600 focus:outline-none cursor-pointer border-r border-gray-100"
                                            >
                                                <option value="+91">+91 (IN)</option>
                                                <option value="+1">+1 (US)</option>
                                                <option value="+44">+44 (UK)</option>
                                                <option value="+971">+971 (UAE)</option>
                                                <option value="+61">+61 (AU)</option>
                                                <option value="+81">+81 (JP)</option>
                                                <option value="+49">+49 (DE)</option>
                                                <option value="+33">+33 (FR)</option>
                                                <option value="+7">+7 (RU)</option>
                                                <option value="+86">+86 (CN)</option>
                                            </select>
                                            <input
                                                id="mobileNumber"
                                                type="text"
                                                value={formData.mobileNumber}
                                                onChange={handleInputChange}
                                                className="flex-1 px-4 py-3 bg-transparent focus:outline-none font-medium"
                                                placeholder="8374496658"
                                            />
                                        </div>
                                        {errors.mobileNumber && <p className="text-red-500 text-xs mt-2 font-semibold">{errors.mobileNumber}</p>}
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Email <span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className={`w-full px-4 py-3 bg-gray-50 border ${errors.email ? 'border-red-500' : 'border-gray-100'} rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium`}
                                            placeholder="john@example.com"
                                        />
                                        {errors.email && <p className="text-red-500 text-xs mt-2 font-semibold">{errors.email}</p>}
                                    </div>

                                    {/* Location Section */}
                                    <div className="relative" id="country-container">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                                        <input
                                            id="country"
                                            type="text"
                                            value={countrySearch}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setCountrySearch(val);
                                                setFormData(prev => ({ ...prev, country: val }));
                                                if (val.trim()) {
                                                    const suggestions = Country.getAllCountries().filter(c =>
                                                        c.name.toLowerCase().includes(val.toLowerCase())
                                                    ).slice(0, 5);
                                                    setFilteredCountries(suggestions);
                                                    setShowCountrySuggestions(true);
                                                } else {
                                                    setShowCountrySuggestions(false);
                                                }
                                            }}
                                            onFocus={() => {
                                                if (countrySearch.trim()) setShowCountrySuggestions(true);
                                            }}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                                            placeholder="USA"
                                            autoComplete="off"
                                        />
                                        {showCountrySuggestions && filteredCountries.length > 0 && (
                                            <div className="absolute z-[110] w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                                {filteredCountries.map(c => (
                                                    <div
                                                        key={c.isoCode}
                                                        onClick={() => {
                                                            setCountrySearch(c.name);
                                                            setFormData(prev => ({ ...prev, country: c.name, countryIsoCode: c.isoCode, countryCode: `+${c.phonecode}` }));
                                                            setShowCountrySuggestions(false);
                                                            setStateSearch("");
                                                            setCitySearch("");
                                                        }}
                                                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm font-semibold text-gray-700 border-b border-gray-50 last:border-0"
                                                    >
                                                        {c.name} (+{c.phonecode})
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {errors.country && <p className="text-red-500 text-xs mt-2 font-semibold">Required</p>}
                                    </div>

                                    <div className="relative" id="state-container">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                                        <input
                                            id="state"
                                            type="text"
                                            value={stateSearch}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setStateSearch(val);
                                                setFormData(prev => ({ ...prev, state: val }));
                                                if (val.trim() && formData.countryIsoCode) {
                                                    const suggestions = State.getStatesOfCountry(formData.countryIsoCode).filter(s =>
                                                        s.name.toLowerCase().includes(val.toLowerCase())
                                                    ).slice(0, 5);
                                                    setFilteredStates(suggestions);
                                                    setShowStateSuggestions(true);
                                                } else {
                                                    setShowStateSuggestions(false);
                                                }
                                            }}
                                            onFocus={() => {
                                                if (stateSearch.trim() && formData.countryIsoCode) setShowStateSuggestions(true);
                                            }}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                                            placeholder="California"
                                            autoComplete="off"
                                        />
                                        {showStateSuggestions && filteredStates.length > 0 && (
                                            <div className="absolute z-[110] w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                                {filteredStates.map(s => (
                                                    <div
                                                        key={s.isoCode}
                                                        onClick={() => {
                                                            setStateSearch(s.name);
                                                            setFormData(prev => ({ ...prev, state: s.name, stateIsoCode: s.isoCode }));
                                                            setShowStateSuggestions(false);
                                                            setCitySearch("");
                                                        }}
                                                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm font-semibold text-gray-700 border-b border-gray-50 last:border-0"
                                                    >
                                                        {s.name}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {errors.state && <p className="text-red-500 text-xs mt-2 font-semibold">Required</p>}
                                    </div>

                                    <div className="relative" id="city-container">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                                        <input
                                            id="city"
                                            type="text"
                                            value={citySearch}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setCitySearch(val);
                                                setFormData(prev => ({ ...prev, city: val }));
                                                if (val.trim() && formData.countryIsoCode && formData.stateIsoCode) {
                                                    const suggestions = City.getCitiesOfState(formData.countryIsoCode, formData.stateIsoCode).filter(c =>
                                                        c.name.toLowerCase().includes(val.toLowerCase())
                                                    ).slice(0, 5);
                                                    setFilteredCities(suggestions);
                                                    setShowCitySuggestions(true);
                                                } else {
                                                    setShowCitySuggestions(false);
                                                }
                                            }}
                                            onFocus={() => {
                                                if (citySearch.trim() && formData.countryIsoCode && formData.stateIsoCode) setShowCitySuggestions(true);
                                            }}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                                            placeholder="Los Angeles"
                                            autoComplete="off"
                                        />
                                        {showCitySuggestions && filteredCities.length > 0 && (
                                            <div className="absolute z-[110] w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                                {filteredCities.map(c => (
                                                    <div
                                                        key={c.name}
                                                        onClick={() => {
                                                            setCitySearch(c.name);
                                                            setFormData(prev => ({ ...prev, city: c.name }));
                                                            setShowCitySuggestions(false);
                                                        }}
                                                        className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm font-semibold text-gray-700 border-b border-gray-50 last:border-0"
                                                    >
                                                        {c.name}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {errors.city && <p className="text-red-500 text-xs mt-2 font-semibold">Required</p>}
                                    </div>

                                    {/* Category Dropdown */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Business Category</label>
                                        <select
                                            id="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer font-medium"
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(cat => (
                                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                                        <textarea
                                            id="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all h-24 resize-none font-medium"
                                            placeholder="Enter full address..."
                                        />
                                    </div>

                                    {/* Password */}
                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                                        <input
                                            id="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
                                            placeholder="••••••••"
                                        />
                                    </div>

                                    {/* Image Upload */}
                                    <div className="md:col-span-1">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Image Upload</label>
                                        <div className="relative border-2 border-dashed border-gray-100 bg-gray-50 rounded-2xl p-2 transition-all h-[54px]">
                                            <input
                                                id="logo"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleInputChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            />
                                            <div className="flex items-center justify-center h-full">
                                                {imagePreview ? (
                                                    <div className="flex items-center space-x-3 w-full px-2">
                                                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-100 bg-white">
                                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                        </div>
                                                        <span className="text-blue-600 font-bold truncate italic text-xs flex-1">Change Image</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center space-x-2 text-gray-400">
                                                        <Upload size={18} />
                                                        <span className="text-xs font-bold uppercase tracking-wider">Upload Image</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-[0.98] ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {isSubmitting ? 'Saving...' : (editBusinessId ? 'Update Business' : 'Proceed')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </main>

            {/* Image Preview Modal */}
            {previewImageUrl && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                    onClick={() => setPreviewImageUrl(null)}
                >
                    <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300">
                        <button
                            onClick={() => setPreviewImageUrl(null)}
                            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors z-20"
                        >
                            <X size={24} />
                        </button>
                        <img
                            src={previewImageUrl}
                            alt="Preview"
                            className="max-w-full max-h-[90vh] object-contain block"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}

            {/* View Business Details Modal */}
            {viewBusiness && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                    onClick={() => setViewBusiness(null)}
                >
                    <div
                        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 duration-300 pointer-events-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-8 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Business</h2>
                            <button
                                onClick={() => setViewBusiness(null)}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                <div className="space-y-1">
                                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Business Name</p>
                                    <p className="text-lg font-bold text-gray-800">{viewBusiness.name}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Username</p>
                                    <p className="text-lg font-bold text-gray-800 leading-none">{viewBusiness.userName || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Mobile Number</p>
                                    <p className="text-lg font-bold text-gray-800">{viewBusiness.mobileNumber || viewBusiness.phoneNumber || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Email</p>
                                    <p className="text-lg font-bold text-gray-800">{viewBusiness.email}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Category</p>
                                    <p className="text-lg font-bold text-gray-800">{viewBusiness.category?.name || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Country</p>
                                    <p className="text-lg font-bold text-gray-800">{viewBusiness.country || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">State</p>
                                    <p className="text-lg font-bold text-gray-800">{viewBusiness.state || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">City</p>
                                    <p className="text-lg font-bold text-gray-800">{viewBusiness.city || 'N/A'}</p>
                                </div>
                                <div className="md:col-span-2 space-y-1">
                                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Address</p>
                                    <p className="text-lg font-bold text-gray-800">{viewBusiness.address || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Status</p>
                                    <div className="pt-1">
                                        <span className={`inline-flex items-center px-4 py-1 rounded-full text-xs font-bold ${viewBusiness.status !== false ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                            {viewBusiness.status !== false ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </div>
                                <div className="md:col-span-2 space-y-3">
                                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Business Logo</p>
                                    <div className="relative w-32 h-32 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 group">
                                        {viewBusiness.logo ? (
                                            <img
                                                src={viewBusiness.logo}
                                                alt={viewBusiness.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <Upload size={32} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
