"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import MobileHeader from "../../components/MobileHeader";
import { Search, Plus, Edit, ImageIcon, Trash2, ChevronLeft } from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";

export default function CategoriesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const syncCategories = async () => {
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
        const loadInitialData = async () => {
            await syncCategories();
            setLoading(false);
        };
        loadInitialData();

        window.addEventListener("categoriesUpdated", syncCategories);
        return () => window.removeEventListener("categoriesUpdated", syncCategories);
    }, []);

    const handleAddCategory = () => {
        Swal.fire({
            title: "Add New Category",
            html: `
                <div class="space-y-4 pt-4">
                    <div class="text-left">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                        <input id="cat-name" class="swal2-input !m-0 !w-full border-gray-200 rounded-xl" placeholder="e.g. Italian">
                    </div>
                    <div class="text-left">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Category Image</label>
                        <input id="cat-image" type="file" accept="image/*" class="swal2-file !m-0 !w-full border-gray-200 rounded-xl">
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: "Add Category",
            confirmButtonColor: "#2563eb",
            focusConfirm: false,
            showLoaderOnConfirm: true,
            preConfirm: async () => {
                const name = document.getElementById('cat-name').value;
                const imageFile = document.getElementById('cat-image').files[0];
                if (!name || name.trim() === "") {
                    Swal.showValidationMessage('Category name is required');
                    return false;
                }
                const slug = name.trim().toLowerCase().replace(/\s+/g, '-');

                const formData = new FormData();
                formData.append('name', name.trim());
                formData.append('slug', slug);
                formData.append('status', 'true');
                if (imageFile) formData.append('image', imageFile);

                try {
                    const res = await fetch("/api/categories", {
                        method: "POST",
                        body: formData,
                    });
                    if (!res.ok) throw new Error("Failed to add category");
                    return await res.json();
                } catch (error) {
                    Swal.showValidationMessage(`Request failed: ${error}`);
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                syncCategories();
                window.dispatchEvent(new Event("categoriesUpdated"));
                localStorage.setItem("categories_sync", Date.now());
                Swal.fire({
                    title: "Added!",
                    text: "Category has been added successfully.",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        });
    };

    const handleEditCategory = (category) => {
        Swal.fire({
            title: "Edit Category",
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
            confirmButtonText: "Update Category",
            confirmButtonColor: "#2563eb",
            focusConfirm: false,
            showLoaderOnConfirm: true,
            preConfirm: async () => {
                const name = document.getElementById('cat-edit-name').value;
                const imageFile = document.getElementById('cat-edit-image').files[0];
                if (!name || name.trim() === "") {
                    Swal.showValidationMessage('Category name is required');
                    return false;
                }
                const slug = name.trim().toLowerCase().replace(/\s+/g, '-');

                const formData = new FormData();
                formData.append('name', name.trim());
                formData.append('slug', slug);
                if (imageFile) formData.append('image', imageFile);

                try {
                    const res = await fetch(`/api/categories/${category._id}`, {
                        method: "PUT",
                        body: formData,
                    });
                    if (!res.ok) throw new Error("Failed to update category");
                    return await res.json();
                } catch (error) {
                    Swal.showValidationMessage(`Request failed: ${error}`);
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                syncCategories();
                window.dispatchEvent(new Event("categoriesUpdated"));
                localStorage.setItem("categories_sync", Date.now());
                Swal.fire({
                    title: "Updated!",
                    text: "Category has been updated successfully.",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        });
    };

    const handleDeleteCategory = (id) => {
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
                    const res = await fetch(`/api/categories/${id}`, {
                        method: "DELETE",
                    });
                    const responseData = await res.json();
                    if (!res.ok) throw new Error(responseData.error || "Failed to delete category");
                    return responseData;
                } catch (error) {
                    Swal.showValidationMessage(`Request failed: ${error.message}`);
                    return false;
                }
            }
        })
            .then((result) => {
                if (result.isConfirmed) {
                    syncCategories();
                    window.dispatchEvent(new Event("categoriesUpdated"));
                    localStorage.setItem("categories_sync", Date.now());
                    Swal.fire({
                        title: "Deleted!",
                        text: "Category has been deleted.",
                        icon: "success",
                        timer: 1500,
                        showConfirmButton: false
                    });
                }
            });
    };

    // Removed: if (loading) return null; // Show layout immediately for faster feel

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-gray-50 overflow-x-hidden relative">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1 lg:ml-64 min-w-0">
                <MobileHeader onToggleSidebar={() => setIsSidebarOpen(true)} />
                <div className="p-4 sm:p-6 lg:p-10">
                    <div className="max-w-[1600px] mx-auto w-full">
                        <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-10 space-y-4 sm:space-y-0 text-center sm:text-left">
                            <div className="flex flex-col sm:flex-row items-center sm:space-x-4 space-y-4 sm:space-y-0">
                                <Link href="/admin/dashboard" className="p-3 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all shadow-sm group">
                                    <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                                </Link>
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Master Categories</h1>
                                    <p className="text-gray-500 mt-1 text-sm sm:text-base">Manage platform-level categories here.</p>
                                </div>
                            </div>
                            <button
                                onClick={handleAddCategory}
                                className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 w-full sm:w-auto"
                            >
                                <Plus size={20} />
                                <span>Add New Master Category</span>
                            </button>
                        </header>

                        <div className="mb-6 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search category..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 sm:py-4 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-600 font-medium shadow-sm"
                            />
                        </div>

                        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[700px]">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider text-center">ID</th>
                                            <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Image</th>
                                            <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Category Name</th>
                                            <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Slug</th>
                                            <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider text-center">Status</th>
                                            <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {loading ? (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-20 text-center">
                                                    <div className="flex flex-col items-center justify-center space-y-4">
                                                        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                                        <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">Loading Categories...</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : filteredCategories.length > 0 ? (
                                            filteredCategories.map((cat, index) => (
                                                <tr key={cat._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 text-gray-700 font-medium text-center">{index + 1}</td>
                                                    <td className="px-6 py-4">
                                                        {cat.image ? (
                                                            <img src={cat.image} className="h-12 w-12 object-cover rounded-xl shadow-sm border border-gray-50" />
                                                        ) : (
                                                            <div className="h-12 w-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                                                                <ImageIcon size={20} />
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-gray-700 font-bold whitespace-nowrap">{cat.name}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-500 font-medium">{cat.slug}</td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${cat.status ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                                                            {cat.status ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-center space-x-2">
                                                            <button
                                                                onClick={() => handleEditCategory(cat)}
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            >
                                                                <Edit size={18} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteCategory(cat._id)}
                                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-10 text-center text-gray-500 font-medium font-bold uppercase tracking-wider text-xs">
                                                    No categories found matching your search.
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
