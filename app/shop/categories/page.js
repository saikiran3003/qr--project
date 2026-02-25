"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ShopSidebar from "../../components/ShopSidebar";
import ShopMobileHeader from "../../components/ShopMobileHeader";
import { Search, Plus, Edit, Trash2, ImageIcon, ChevronLeft } from "lucide-react";
import Swal from "sweetalert2";
import Link from "next/link";

export default function ShopCategoriesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [businessId, setBusinessId] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const loadInitialData = async () => {
            const id = sessionStorage.getItem("businessId");
            if (!id) {
                router.push("/shop/login");
                return;
            }
            setBusinessId(id);
            await fetchCategories(id);
            setLoading(false);
        };
        loadInitialData();
    }, []);

    const fetchCategories = async (bid) => {
        try {
            const res = await fetch(`/api/shop/categories?businessId=${bid}`);
            const data = await res.json();
            if (res.ok) setCategories(data);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = () => {
        Swal.fire({
            title: 'Add New Category',
            html: `
                <div class="space-y-4 pt-4">
                    <div class="text-left">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                        <input id="cat-name" class="swal2-input !m-0 !w-full border-gray-200 rounded-xl" placeholder="e.g. Starters">
                    </div>
                    <div class="text-left">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Category Image</label>
                        <input id="cat-image" type="file" accept="image/*" class="swal2-file !m-0 !w-full border-gray-200 rounded-xl">
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Create Category',
            confirmButtonColor: '#4f46e5',
            preConfirm: async () => {
                const name = document.getElementById('cat-name').value;
                const imageFile = document.getElementById('cat-image').files[0];

                if (!name) {
                    Swal.showValidationMessage('Category name is required');
                    return false;
                }

                const formData = new FormData();
                formData.append('name', name.trim());
                formData.append('businessId', businessId);
                if (imageFile) formData.append('image', imageFile);

                try {
                    const res = await fetch("/api/shop/categories", {
                        method: "POST",
                        body: formData,
                    });
                    if (!res.ok) {
                        const error = await res.json();
                        throw new Error(error.error || "Failed to create category");
                    }
                    return await res.json();
                } catch (error) {
                    Swal.showValidationMessage(`Error: ${error.message}`);
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                fetchCategories(businessId);
                Swal.fire({ title: 'Success!', text: 'Category created', icon: 'success', timer: 1500, showConfirmButton: false });
            }
        });
    };

    const handleEditCategory = (category) => {
        Swal.fire({
            title: 'Edit Category',
            html: `
                <div class="space-y-4 pt-4 text-left">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                        <input id="cat-edit-name" class="swal2-input !m-0 !w-full border-gray-200 rounded-xl" value="${category.name}">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Update Image (Optional)</label>
                        <input id="cat-edit-image" type="file" accept="image/*" class="swal2-file !m-0 !w-full border-gray-200 rounded-xl">
                        ${category.image ? `<div class="mt-2"><img src="${category.image}" class="h-20 w-auto rounded-lg shadow-sm border border-gray-100" /></div>` : ''}
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Save Changes',
            confirmButtonColor: '#4f46e5',
            preConfirm: async () => {
                const name = document.getElementById('cat-edit-name').value;
                const imageFile = document.getElementById('cat-edit-image').files[0];

                if (!name) {
                    Swal.showValidationMessage('Category name is required');
                    return false;
                }

                const formData = new FormData();
                formData.append('name', name.trim());
                if (imageFile) formData.append('image', imageFile);

                try {
                    const res = await fetch(`/api/shop/categories/${category._id}`, {
                        method: "PUT",
                        body: formData,
                    });
                    if (!res.ok) {
                        const error = await res.json();
                        throw new Error(error.error || "Failed to update category");
                    }
                    return await res.json();
                } catch (error) {
                    Swal.showValidationMessage(`Error: ${error.message}`);
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                fetchCategories(businessId);
                Swal.fire({ title: 'Updated!', icon: 'success', timer: 1500, showConfirmButton: false });
            }
        });
    };

    const handleDeleteCategory = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "This will remove this category and all related products!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await fetch(`/api/shop/categories/${id}`, { method: "DELETE" });
                    if (res.ok) {
                        fetchCategories(businessId);
                        Swal.fire({ title: 'Deleted!', icon: 'success', timer: 1500, showConfirmButton: false });
                    }
                } catch (error) {
                    Swal.fire('Error', 'Failed to delete category', 'error');
                }
            }
        });
    };

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Removed: if (loading) return null; // Show layout immediately for faster response

    return (
        <div className="flex min-h-screen bg-gray-50 overflow-x-hidden relative">
            <ShopSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1 lg:ml-64 min-w-0">
                <ShopMobileHeader onToggleSidebar={() => setIsSidebarOpen(true)} />
                <div className="p-4 sm:p-6 lg:p-10">
                    <div className="max-w-[1600px] mx-auto w-full">
                        <header className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 sm:mb-10 space-y-4 lg:space-y-0 text-center lg:text-left">
                            <div className="flex flex-col sm:flex-row items-center sm:space-x-4 space-y-4 sm:space-y-0">
                                <Link href="/shop/dashboard" className="p-3 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all shadow-sm group">
                                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                                </Link>
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-tight">Product Categories</h1>
                                    <p className="text-gray-500 mt-1 text-sm sm:text-base font-medium">Manage categories for your products</p>
                                </div>
                            </div>
                            <button
                                onClick={handleAddCategory}
                                className="flex items-center justify-center space-x-2 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 min-h-[48px] w-full lg:w-auto active:scale-[0.98]"
                            >
                                <Plus size={20} />
                                <span>Add New Category</span>
                            </button>
                        </header>

                        <div className="mb-8">
                            <div className="relative max-w-2xl">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search categories..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-gray-600 font-medium shadow-sm"
                                />
                            </div>
                        </div>

                        <section className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                    <thead>
                                        <tr className="bg-gray-50/50 border-b border-gray-100">
                                            <th className="px-8 py-5 text-sm font-bold text-gray-400 uppercase tracking-widest text-center">ID</th>
                                            <th className="px-8 py-5 text-sm font-bold text-gray-400 uppercase tracking-widest">Image</th>
                                            <th className="px-8 py-5 text-sm font-bold text-gray-400 uppercase tracking-widest">Category Name</th>
                                            <th className="px-8 py-5 text-sm font-bold text-gray-400 uppercase tracking-widest text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {loading ? (
                                            <tr>
                                                <td colSpan="4" className="px-8 py-20 text-center">
                                                    <div className="flex flex-col items-center justify-center space-y-4">
                                                        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                                        <p className="text-gray-400 font-bold animate-pulse uppercase tracking-widest text-xs">Loading Categories...</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : filteredCategories.length > 0 ? (
                                            filteredCategories.map((cat, index) => (
                                                <tr key={cat._id} className="hover:bg-gray-50/50 transition-colors group">
                                                    <td className="px-8 py-6 text-gray-400 font-bold text-center">{index + 1}</td>
                                                    <td className="px-8 py-6">
                                                        {cat.image ? (
                                                            <img src={cat.image} className="h-14 w-14 object-cover rounded-2xl shadow-sm border border-gray-100" />
                                                        ) : (
                                                            <div className="h-14 w-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 border border-gray-100">
                                                                <ImageIcon size={24} />
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className="text-gray-800 font-bold text-lg">{cat.name}</span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center justify-center space-x-3">
                                                            <button
                                                                onClick={() => handleEditCategory(cat)}
                                                                className="p-3 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                                title="Edit Category"
                                                            >
                                                                <Edit size={20} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteCategory(cat._id)}
                                                                className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                                title="Delete Category"
                                                            >
                                                                <Trash2 size={20} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="px-8 py-16 text-center text-gray-500 font-medium bg-gray-50/30">
                                                    <div className="flex flex-col items-center justify-center space-y-3">
                                                        <div className="p-4 bg-white rounded-3xl shadow-sm">
                                                            <Search size={32} className="text-gray-300" />
                                                        </div>
                                                        <p>No categories found matching your search.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
