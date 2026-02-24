"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import ShopSidebar from "../../components/ShopSidebar";
import ShopMobileHeader from "../../components/ShopMobileHeader";
import { User, Mail, Phone, MapPin, Save, Upload, X } from "lucide-react";
import { State, City } from 'country-state-city';
import Swal from "sweetalert2";

export default function ShopProfilePage() {
    const router = useRouter();
    const addressInputRef = useRef(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [businessId, setBusinessId] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        userName: "",
        email: "",
        mobileNumber: "",
        address: "",
        city: "",
        state: "",
        logo: null
    });

    useEffect(() => {
        const id = sessionStorage.getItem("businessId");
        if (!id) {
            router.push("/shop/login");
            return;
        }
        setBusinessId(id);
        fetchProfile(id);
    }, []);

    const initAutocomplete = () => {
        if (addressInputRef.current && window.google) {
            const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
                componentRestrictions: { country: "IN" },
                fields: ["formatted_address", "address_components", "geometry"],
                types: ["address"],
            });

            autocomplete.addListener("place_changed", () => {
                const place = autocomplete.getPlace();
                if (place.formatted_address) {
                    setFormData(prev => ({ ...prev, address: place.formatted_address }));

                    // Optional: Auto-fill city and state from place components
                    let cityName = "";
                    let stateName = "";
                    place.address_components.forEach(component => {
                        if (component.types.includes("locality")) cityName = component.long_name;
                        if (component.types.includes("administrative_area_level_1")) stateName = component.long_name;
                    });

                    if (cityName || stateName) {
                        setFormData(prev => ({
                            ...prev,
                            address: place.formatted_address,
                            city: cityName || prev.city,
                            state: stateName || prev.state
                        }));
                    }
                }
            });
        }
    };

    const fetchProfile = async (id) => {
        try {
            const res = await fetch(`/api/shop/profile?id=${id}`);
            const data = await res.json();
            if (res.ok) {
                setFormData({
                    name: data.name || "",
                    userName: data.userName || "",
                    email: data.email || "",
                    mobileNumber: data.mobileNumber || "",
                    address: data.address || "",
                    city: data.city || "",
                    state: data.state || "",
                    logo: data.logo || null
                });
                setImagePreview(data.logo || null);
            }
        } catch (error) {
            console.error("Failed to fetch profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { id, value, files } = e.target;
        if (id === "logo") {
            const file = files[0];
            setFormData(prev => ({ ...prev, logo: file }));
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setImagePreview(reader.result);
                reader.readAsDataURL(file);
            }
        } else {
            setFormData(prev => ({ ...prev, [id]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null) {
                    data.append(key, formData[key]);
                }
            });

            const res = await fetch(`/api/shop/profile?id=${businessId}`, {
                method: "PUT",
                body: data
            });

            if (res.ok) {
                Swal.fire({
                    title: "Profile Updated",
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false
                });
            } else {
                const result = await res.json();
                throw new Error(result.error || "Failed to update profile");
            }
        } catch (error) {
            Swal.fire("Error", error.message, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return null;

    return (
        <div className="flex min-h-screen bg-gray-50 overflow-x-hidden relative">
            <Script
                src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&libraries=places`}
                onLoad={initAutocomplete}
            />
            <ShopSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1 lg:ml-64 min-w-0">
                <ShopMobileHeader onToggleSidebar={() => setIsSidebarOpen(true)} />
                <div className="p-4 sm:p-6 lg:p-10">
                    <div className="max-w-4xl mx-auto">
                        <header className="mb-10">
                            <h1 className="text-3xl font-extrabold text-gray-800">Business Profile</h1>
                            <p className="text-gray-500 mt-1">Update your business details and logo.</p>
                        </header>

                        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                            <form onSubmit={handleSubmit} className="p-8 sm:p-10 space-y-8">
                                {/* Logo Upload Section */}
                                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8 pb-8 border-b border-gray-50">
                                    <div className="w-32 h-32 rounded-3xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center group relative">
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <Upload className="text-gray-300 group-hover:text-indigo-400 transition-colors" size={32} />
                                        )}
                                        <input
                                            id="logo"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleInputChange}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <h3 className="text-lg font-bold text-gray-800">Business Logo</h3>
                                        <p className="text-sm text-gray-400 mt-1">Click the icon to upload a new logo.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Business Name</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                id="name"
                                                type="text"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                id="userName"
                                                type="text"
                                                value={formData.userName}
                                                onChange={handleInputChange}
                                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                id="email"
                                                type="email"
                                                value={formData.email}
                                                readOnly
                                                className="w-full pl-12 pr-4 py-3 bg-gray-100 border border-gray-100 rounded-2xl cursor-not-allowed font-medium text-gray-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number</label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                id="mobileNumber"
                                                type="text"
                                                value={formData.mobileNumber}
                                                onChange={handleInputChange}
                                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Full Address</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-4 text-gray-400" size={18} />
                                            <textarea
                                                id="address"
                                                ref={addressInputRef}
                                                rows="3"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                placeholder="Enter full address"
                                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                                            ></textarea>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                                        <select
                                            id="state"
                                            value={formData.state}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setFormData(prev => ({ ...prev, state: val, city: "" }));
                                            }}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium text-gray-700"
                                        >
                                            <option value="">Select State</option>
                                            {State.getStatesOfCountry('IN').map(state => (
                                                <option key={state.isoCode} value={state.name}>{state.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                                        <select
                                            id="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium text-gray-700"
                                            disabled={!formData.state}
                                        >
                                            <option value="">Select City</option>
                                            {formData.state && City.getCitiesOfState('IN', State.getStatesOfCountry('IN').find(s => s.name === formData.state)?.isoCode || "").map(city => (
                                                <option key={city.name} value={city.name}>{city.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center space-x-2"
                                    >
                                        {isSubmitting ? (
                                            <span>Saving...</span>
                                        ) : (
                                            <>
                                                <Save size={20} />
                                                <span>Update Profile</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
