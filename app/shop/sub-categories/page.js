"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ShopSidebar from "../../components/ShopSidebar";
import ShopMobileHeader from "../../components/ShopMobileHeader";
import { Search, Plus, Edit, Trash2, ChevronLeft, ChevronDown } from "lucide-react";
import Swal from "sweetalert2";
import Link from "next/link";

export default function ShopSubCategoriesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [subCategories, setSubCategories] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [businessId, setBusinessId] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const id = sessionStorage.getItem("businessId");
        if (!id) {
            router.push("/shop/login");
            return;
        }
        setBusinessId(id);
        fetchCategories(id);
        fetchSubCategories(id);
    }, []);

    const fetchCategories = async (bid) => {
        try {
            const res = await fetch(`/api/shop/categories?businessId=${bid}`);
            const data = await res.json();
            if (res.ok) setCategories(data);
        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    };

    const fetchSubCategories = async (bid) => {
        try {
            const res = await fetch(`/api/shop/sub-categories?businessId=${bid}`);
            const data = await res.json();
            if (res.ok) setSubCategories(data);
        } catch (error) {
            console.error("Failed to fetch sub-categories:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSubCategory = () => {
        if (categories.length === 0) {
            Swal.fire("Wait!", "Please create a category first.", "warning");
            return;
        }

        Swal.fire({
            title: 'Add Sub-Category',
            html: `
                <div class="space-y-4 pt-4">
                    <div class="text-left">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                        <select id="sub-cat-parent" class="swal2-input !m-0 !w-full border-gray-200 rounded-xl">
                            ${categories.map(cat => `<option value="${cat._id}">${cat.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="text-left">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Sub-Category Name</label>
                        <input id="sub-cat-name" class="swal2-input !m-0 !w-full border-gray-200 rounded-xl" placeholder="e.g. Pasta">
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Create Sub-Category',
            confirmButtonColor: '#4f46e5',
            preConfirm: async () => {
                const name = document.getElementById('sub-cat-name').value;
                const categoryId = document.getElementById('sub-cat-parent').value;

                if (!name) {
                    Swal.showValidationMessage('Name is required');
                    return false;
                }

                try {
                    const res = await fetch("/api/shop/sub-categories", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name: name.trim(), categoryId }),
                    });
                    if (!res.ok) {
                        const error = await res.json();
                        throw new Error(error.error || "Failed to create sub-category");
                    }
                    return await res.json();
                } catch (error) {
                    Swal.showValidationMessage(`Error: ${error.message}`);
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                fetchSubCategories(businessId);
                Swal.fire({ title: 'Success!', icon: 'success', shadow: false, timer: 1500, showConfirmButton: false });
            }
        });
    };

    const handleEditSubCategory = (sub) => {
        Swal.fire({
            title: 'Edit Sub-Category',
            html: `
                <div class="space-y-4 pt-4 text-left">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Sub-Category Name</label>
                        <input id="sub-cat-edit-name" class="swal2-input !m-0 !w-full border-gray-200 rounded-xl" value="${sub.name}">
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Save Changes',
            confirmButtonColor: '#4f46e5',
            preConfirm: async () => {
                const name = document.getElementById('sub-cat-edit-name').value;
                if (!name) {
                    Swal.showValidationMessage('Name is required');
                    return false;
                }

                try {
                    const res = await fetch(`/api/shop/sub-categories/${sub._id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name: name.trim() }),
                    });
                    if (!res.ok) {
                        const error = await res.json();
                        throw new Error(error.error || "Failed to update sub-category");
                    }
                    return await res.json();
                } catch (error) {
                    Swal.showValidationMessage(`Error: ${error.message}`);
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                fetchSubCategories(businessId);
                Swal.fire({ title: 'Updated!', icon: 'success', timer: 1500, showConfirmButton: false });
            }
        });
    };

    const handleDeleteSubCategory = (id) => {
        Swal.fire({
            title: 'Delete Sub-Category',
            text: "This will remove this sub-category and all its products!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Yes, delete it!'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const res = await fetch(`/api/shop/sub-categories/${id}`, { method: "DELETE" });
                    if (res.ok) {
                        fetchSubCategories(businessId);
                        Swal.fire({ title: 'Deleted!', icon: 'success', timer: 1500, showConfirmButton: false });
                    }
                } catch (error) {
                    Swal.fire('Error', 'Failed to delete sub-category', 'error');
                }
            }
        });
    };

    const filteredSubCategories = subCategories.filter(sub => {
        const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "" || sub.parentCategory._id === selectedCategory || sub.parentCategory === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    if (loading) return null;

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
                                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-tight">Sub-Categories</h1>
                                    <p className="text-gray-500 mt-1 text-sm sm:text-base font-medium">Create nested categories for your menu</p>
                                </div>
                            </div>
                            <button
                                onClick={handleAddSubCategory}
                                className="flex items-center justify-center space-x-2 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 min-h-[48px] w-full lg:w-auto active:scale-[0.98]"
                            >
                                <Plus size={20} />
                                <span>Add Sub-Category</span>
                            </button>
                        </header>

                        <div className="mb-8 flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
                            <div className="relative flex-1 max-w-2xl">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search sub-categories..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-gray-600 font-medium shadow-sm"
                                />
                            </div>
                            <div className="relative">
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full lg:w-64 px-6 py-4 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-gray-600 font-bold cursor-pointer appearance-none shadow-sm"
                                >
                                    <option value="">All Categories</option>
                                    {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                    <ChevronDown size={18} />
                                </div>
                            </div>
                        </div>

                        <section className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                    <thead>
                                        <tr className="bg-gray-50/50 border-b border-gray-100">
                                            <th className="px-8 py-5 text-sm font-bold text-gray-400 uppercase tracking-widest text-center">ID</th>
                                            <th className="px-8 py-5 text-sm font-bold text-gray-400 uppercase tracking-widest">Sub-Category Name</th>
                                            <th className="px-8 py-5 text-sm font-bold text-gray-400 uppercase tracking-widest">Parent Category</th>
                                            <th className="px-8 py-5 text-sm font-bold text-gray-400 uppercase tracking-widest text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {filteredSubCategories.length > 0 ? (
                                            filteredSubCategories.map((sub, index) => (
                                                <tr key={sub._id} className="hover:bg-gray-50/50 transition-colors group">
                                                    <td className="px-8 py-6 text-gray-400 font-bold text-center">{index + 1}</td>
                                                    <td className="px-8 py-6">
                                                        <span className="text-gray-800 font-bold text-lg">{sub.name}</span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <span className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase tracking-wider">
                                                            {sub.parentCategory?.name || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center justify-center space-x-3">
                                                            <button
                                                                onClick={() => handleEditSubCategory(sub)}
                                                                className="p-3 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                                title="Edit"
                                                            >
                                                                <Edit size={20} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteSubCategory(sub._id)}
                                                                className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                                title="Delete"
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
                                                    <p>No sub-categories found.</p>
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
