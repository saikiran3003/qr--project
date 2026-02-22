"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../components/Sidebar";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";

export default function CategoriesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

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
        // middleware handles route protection
        syncCategories();
        setLoading(false);

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
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: "Add Category",
            confirmButtonColor: "#2563eb",
            focusConfirm: false,
            showLoaderOnConfirm: true,
            preConfirm: async () => {
                const name = document.getElementById('cat-name').value;
                if (!name || name.trim() === "") {
                    Swal.showValidationMessage('Category name is required');
                    return false;
                }
                const slug = name.trim().toLowerCase().replace(/\s+/g, '-');
                try {
                    const res = await fetch("/api/categories", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name: name.trim(), slug, status: true }),
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
                <div class="space-y-4 pt-4">
                    <div class="text-left">
                        <label class="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                        <input id="cat-edit-name" class="swal2-input !m-0 !w-full border-gray-200 rounded-xl" value="${category.name}">
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
                if (!name || name.trim() === "") {
                    Swal.showValidationMessage('Category name is required');
                    return false;
                }
                const slug = name.trim().toLowerCase().replace(/\s+/g, '-');
                try {
                    const res = await fetch(`/api/categories/${category._id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name: name.trim(), slug }),
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
                    console.log('Deleting category with ID:', id);
                    const res = await fetch(`/api/categories/${id}`, {
                        method: "DELETE",
                    });
                    const responseData = await res.json();
                    if (!res.ok) {
                        throw new Error(responseData.error || "Failed to delete category");
                    }
                    console.log('Delete response:', responseData);
                    return responseData;
                } catch (error) {
                    console.error('Delete Category Error:', error);
                    Swal.showValidationMessage(`Request failed: ${error.message}`);
                    return false;
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                syncCategories();
                window.dispatchEvent(new Event("categoriesUpdated"));
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

    if (loading) return null;

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-gray-50 overflow-x-hidden relative">
            <Sidebar />

            <main className="flex-1 ml-64 p-10 min-w-0">
                <div className="max-w-[1600px] mx-auto w-full">
                    <header className="flex items-center justify-between mb-10">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Categories</h1>
                            <p className="text-gray-500 mt-1">Manage your menu categories here.</p>
                        </div>
                        <button
                            onClick={handleAddCategory}
                            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                        >
                            <Plus size={20} />
                            <span>Add New Category</span>
                        </button>
                    </header>

                    <div className="mb-6 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search category..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-gray-600"
                        />
                    </div>

                    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider text-center">ID</th>
                                        <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Category Name</th>
                                        <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Slug</th>
                                        <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider text-center">Status</th>
                                        <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredCategories.length > 0 ? (
                                        filteredCategories.map((cat, index) => {
                                            return (
                                                <tr key={cat._id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 text-gray-700 font-medium text-center">{index + 1}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-gray-700 font-bold whitespace-nowrap">
                                                            {cat.name}
                                                        </span>
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
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-10 text-center text-gray-500 font-medium">
                                                No categories found matching your search.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
