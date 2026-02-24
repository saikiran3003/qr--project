"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ShopSidebar from "../../components/ShopSidebar";
import ShopMobileHeader from "../../components/ShopMobileHeader";
import { Search, Plus, Edit, Trash2, ImageIcon, ChevronLeft, Upload, X } from "lucide-react";
import Swal from "sweetalert2";
import Link from "next/link";

export default function ShopProductsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [filteredSubCategories, setFilteredSubCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [businessId, setBusinessId] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Form states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editProductId, setEditProductId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [selectedImages, setSelectedImages] = useState([]);

    const [formData, setFormData] = useState({
        name: "",
        categoryId: "",
        subCategoryId: "",
        mrpPrice: "",
        salePrice: "",
        description: "",
        currentImages: []
    });

    useEffect(() => {
        const id = sessionStorage.getItem("businessId");
        if (!id) {
            router.push("/shop/login");
            return;
        }
        setBusinessId(id);
        fetchInitialData(id);
    }, []);

    const fetchInitialData = async (bid) => {
        try {
            const [prodRes, catRes, subRes] = await Promise.all([
                fetch(`/api/shop/products?businessId=${bid}`),
                fetch(`/api/shop/categories?businessId=${bid}`),
                fetch(`/api/shop/sub-categories?businessId=${bid}`)
            ]);

            const [prodData, catData, subData] = await Promise.all([
                prodRes.json(),
                catRes.json(),
                subRes.json()
            ]);

            if (prodRes.ok) setProducts(prodData);
            if (catRes.ok) setCategories(catData);
            if (subRes.ok) setSubCategories(subData);
        } catch (error) {
            console.error("Failed to fetch initial data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryChange = (catId) => {
        setFormData(prev => ({ ...prev, categoryId: catId, subCategoryId: "" }));
        const filtered = subCategories.filter(sc => (sc.parentCategory?._id || sc.parentCategory) === catId);
        setFilteredSubCategories(filtered);
    };

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        setSelectedImages(prev => [...prev, ...files]);

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeNewImage = (index) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index) => {
        setFormData(prev => ({
            ...prev,
            currentImages: prev.currentImages.filter((_, i) => i !== index)
        }));
    };

    const resetForm = () => {
        setIsFormOpen(false);
        setEditProductId(null);
        setFormData({
            name: "", categoryId: "", subCategoryId: "",
            mrpPrice: "", salePrice: "", description: "", currentImages: []
        });
        setSelectedImages([]);
        setImagePreviews([]);
        setFilteredSubCategories([]);
    };

    const handleAddProduct = () => {
        resetForm();
        setIsFormOpen(true);
    };

    const handleEditProduct = (prod) => {
        resetForm();
        setEditProductId(prod._id);
        setFormData({
            name: prod.name,
            categoryId: prod.category?._id || prod.category,
            subCategoryId: prod.subCategory?._id || prod.subCategory,
            mrpPrice: prod.mrpPrice,
            salePrice: prod.salePrice,
            description: prod.description || "",
            currentImages: prod.images || []
        });

        // Populate sub-categories for the selected category
        const catId = prod.category?._id || prod.category;
        const filtered = subCategories.filter(sc => (sc.parentCategory?._id || sc.parentCategory) === catId);
        setFilteredSubCategories(filtered);

        setIsFormOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const data = new FormData();
            data.append('businessId', businessId);
            data.append('categoryId', formData.categoryId);
            data.append('subCategoryId', formData.subCategoryId);
            data.append('name', formData.name);
            data.append('mrpPrice', formData.mrpPrice);
            data.append('salePrice', formData.salePrice);
            data.append('description', formData.description);

            if (editProductId) {
                data.append('currentImages', JSON.stringify(formData.currentImages));
            }

            selectedImages.forEach(file => {
                data.append('images', file);
            });

            const url = editProductId ? `/api/shop/products/${editProductId}` : "/api/shop/products";
            const method = editProductId ? "PUT" : "POST";

            const res = await fetch(url, { method, body: data });
            if (res.ok) {
                Swal.fire({ title: "Success!", text: `Product ${editProductId ? 'updated' : 'created'}`, icon: "success", timer: 1500, showConfirmButton: false });
                resetForm();
                fetchInitialData(businessId);
            } else {
                const result = await res.json();
                throw new Error(result.error || "Failed to save product");
            }
        } catch (error) {
            Swal.fire("Error", error.message, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteProduct = (id) => {
        Swal.fire({
            title: "Delete Product?",
            text: "This action cannot be undone!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            confirmButtonText: "Yes, delete it!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await fetch(`/api/shop/products/${id}`, { method: "DELETE" });
                    if (res.ok) {
                        fetchInitialData(businessId);
                        Swal.fire({ title: "Deleted!", icon: "success", timer: 1500, showConfirmButton: false });
                    }
                } catch (error) {
                    Swal.fire("Error", "Failed to delete product", "error");
                }
            }
        });
    };

    const filteredProducts = products.filter(prod =>
        prod.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return null;

    return (
        <div className="flex min-h-screen bg-gray-50 overflow-x-hidden relative">
            <ShopSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1 lg:ml-64 min-w-0">
                <ShopMobileHeader onToggleSidebar={() => setIsSidebarOpen(true)} />
                <div className="p-4 sm:p-6 lg:p-10">
                    <div className="max-w-[1600px] mx-auto w-full">
                        {!isFormOpen ? (
                            <>
                                <header className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 sm:mb-10 space-y-4 lg:space-y-0 text-center lg:text-left">
                                    <div className="flex flex-col sm:flex-row items-center sm:space-x-4 space-y-4 sm:space-y-0">
                                        <Link href="/shop/dashboard" className="p-3 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all shadow-sm group">
                                            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                                        </Link>
                                        <div>
                                            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-tight">Product Management</h1>
                                            <p className="text-gray-500 mt-1 text-sm sm:text-base font-medium">Add and manage your menu items</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleAddProduct}
                                        className="flex items-center justify-center space-x-2 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 min-h-[48px] w-full lg:w-auto active:scale-[0.98]"
                                    >
                                        <Plus size={20} />
                                        <span>Add New Product</span>
                                    </button>
                                </header>

                                <div className="mb-8">
                                    <div className="relative max-w-2xl">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="text"
                                            placeholder="Search products..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-gray-600 font-medium shadow-sm"
                                        />
                                    </div>
                                </div>

                                <section className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse min-w-[1000px]">
                                            <thead>
                                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                                    <th className="px-8 py-5 text-sm font-bold text-gray-400 uppercase tracking-widest">Product</th>
                                                    <th className="px-8 py-5 text-sm font-bold text-gray-400 uppercase tracking-widest">Category</th>
                                                    <th className="px-8 py-5 text-sm font-bold text-gray-400 uppercase tracking-widest">Price</th>
                                                    <th className="px-8 py-5 text-sm font-bold text-gray-400 uppercase tracking-widest text-center">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {filteredProducts.length > 0 ? (
                                                    filteredProducts.map((prod) => (
                                                        <tr key={prod._id} className="hover:bg-gray-50/50 transition-colors">
                                                            <td className="px-8 py-6">
                                                                <div className="flex items-center space-x-4">
                                                                    <div className="h-14 w-14 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
                                                                        {prod.images?.[0] ? (
                                                                            <img src={prod.images[0]} className="w-full h-full object-cover" />
                                                                        ) : (
                                                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                                                <ImageIcon size={20} />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-bold text-gray-800">{prod.name}</div>
                                                                        <div className="text-xs text-gray-400 font-medium line-clamp-1">{prod.description || 'No description'}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-6 text-sm font-bold text-gray-600">
                                                                <div>{prod.category?.name}</div>
                                                                <div className="text-[10px] text-indigo-500 uppercase tracking-widest">{prod.subCategory?.name}</div>
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                <div className="flex items-center space-x-2">
                                                                    <span className="font-bold text-gray-800">₹{prod.salePrice}</span>
                                                                    <span className="text-xs text-gray-400 line-through">₹{prod.mrpPrice}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-8 py-6">
                                                                <div className="flex items-center justify-center space-x-3">
                                                                    <button onClick={() => handleEditProduct(prod)} className="p-3 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit size={20} /></button>
                                                                    <button onClick={() => handleDeleteProduct(prod._id)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={20} /></button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="4" className="px-8 py-16 text-center text-gray-500 font-medium bg-gray-50/30">
                                                            No products found.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            </>
                        ) : (
                            <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden mb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="p-8 sm:p-10 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-800">{editProductId ? 'Edit Product' : 'Add New Product'}</h2>
                                        <p className="text-gray-500 mt-1 font-medium">{editProductId ? 'Update your product details' : 'Fill in the information below'}</p>
                                    </div>
                                    <button onClick={resetForm} className="p-3 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors"><X size={24} /></button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-8 sm:p-10 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Product Name*</label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.name}
                                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                                                placeholder="e.g. Traditional Margherita Pizza"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Category*</label>
                                            <select
                                                required
                                                value={formData.categoryId}
                                                onChange={(e) => handleCategoryChange(e.target.value)}
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
                                            >
                                                <option value="">Select Category</option>
                                                {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Sub-Category*</label>
                                            <select
                                                required
                                                disabled={!formData.categoryId}
                                                value={formData.subCategoryId}
                                                onChange={(e) => setFormData(prev => ({ ...prev, subCategoryId: e.target.value }))}
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold disabled:opacity-50"
                                            >
                                                <option value="">Select Sub-Category</option>
                                                {filteredSubCategories.map(sc => <option key={sc._id} value={sc._id}>{sc.name}</option>)}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">MRP Price*</label>
                                            <div className="relative">
                                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                                <input
                                                    type="number"
                                                    required
                                                    value={formData.mrpPrice}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, mrpPrice: e.target.value }))}
                                                    className="w-full pl-10 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Sale Price*</label>
                                            <div className="relative">
                                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                                <input
                                                    type="number"
                                                    required
                                                    value={formData.salePrice}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, salePrice: e.target.value }))}
                                                    className="w-full pl-10 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">Description</label>
                                            <textarea
                                                rows="4"
                                                value={formData.description}
                                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
                                                placeholder="Describe your product briefly..."
                                            ></textarea>
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Product Images (Multi-upload)</label>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
                                                {/* Existing Images */}
                                                {formData.currentImages.map((img, idx) => (
                                                    <div key={`exist-${idx}`} className="aspect-square rounded-2xl overflow-hidden border border-gray-100 relative group shadow-sm bg-gray-50">
                                                        <img src={img} className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeExistingImage(idx)}
                                                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ))}

                                                {/* New Previews */}
                                                {imagePreviews.map((preview, idx) => (
                                                    <div key={`new-${idx}`} className="aspect-square rounded-2xl overflow-hidden border border-indigo-100 relative group shadow-sm bg-indigo-50/30">
                                                        <img src={preview} className="w-full h-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeNewImage(idx)}
                                                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                        <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-indigo-600 text-[8px] text-white font-black rounded uppercase">New</div>
                                                    </div>
                                                ))}

                                                {/* Upload Button */}
                                                <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group">
                                                    <Upload className="text-gray-300 group-hover:text-indigo-400 transition-colors" size={28} />
                                                    <span className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest group-hover:text-indigo-500">Add More</span>
                                                    <input
                                                        type="file"
                                                        multiple
                                                        accept="image/*"
                                                        onChange={handleImageSelect}
                                                        className="hidden"
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-6">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full py-5 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center space-x-2"
                                        >
                                            {isSubmitting ? (
                                                <span>Saving Product Data...</span>
                                            ) : (
                                                <>
                                                    <Plus size={22} />
                                                    <span>{editProductId ? 'Update Product Information' : 'List Product on Menu'}</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
