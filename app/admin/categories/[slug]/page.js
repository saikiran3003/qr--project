"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Search, Plus, Edit, Trash2, ChevronLeft, Image as ImageIcon } from "lucide-react";
import Sidebar from "../../../components/Sidebar";
import Swal from "sweetalert2";

export default function DynamicCategoryPage() {
    const params = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [businesses, setBusinesses] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const slug = params.slug;

    const fetchData = async () => {
        try {
            // 1. Fetch category by slug
            const catRes = await fetch("/api/categories");
            const cats = await catRes.json();
            const currentCat = cats.find(c => c.slug === slug);
            if (!currentCat) {
                router.push("/admin/categories");
                return;
            }
            setCategory(currentCat);

            // 2. Fetch menu items for this category
            const menuRes = await fetch(`/api/menu?categoryId=${currentCat._id}`);
            const menuData = await menuRes.json();
            setMenuItems(menuData);

            // 3. Fetch businesses for the dropdown
            const bizRes = await fetch("/api/business");
            const bizData = await bizRes.json();
            setBusinesses(bizData);

        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // middleware handles route protection
        fetchData();
    }, [slug]);

    const handleAddItem = () => {
        Swal.fire({
            title: "Add New Item",
            html: `
                <div class="space-y-4 pt-4 text-left">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                        <input id="item-name" class="swal2-input !m-0 !w-full border-gray-200 rounded-xl" placeholder="e.g. Pepperoni Pizza">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                        <input id="item-price" type="number" step="0.01" class="swal2-input !m-0 !w-full border-gray-200 rounded-xl" placeholder="0.00">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Business</label>
                        <select id="item-business" class="swal2-input !m-0 !w-full border-gray-200 rounded-xl">
                            <option value="">Select Business</option>
                            ${businesses.map(b => `<option value="${b._id}">${b.name}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Item Image</label>
                        <input id="item-image" type="file" accept="image/*" class="swal2-file !m-0 !w-full border-gray-200 rounded-xl">
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: "Add Item",
            confirmButtonColor: "#2563eb",
            focusConfirm: false,
            showLoaderOnConfirm: true,
            preConfirm: async () => {
                try {
                    const name = document.getElementById('item-name').value;
                    const price = document.getElementById('item-price').value;
                    const businessId = document.getElementById('item-business').value;
                    const imageFile = document.getElementById('item-image').files[0];

                    if (!name || !price) {
                        Swal.showValidationMessage('Name and Price are required');
                        return false;
                    }

                    if (!category || !category._id) {
                        Swal.showValidationMessage('Category ID is missing. Please refresh.');
                        return false;
                    }

                    const formData = new FormData();
                    formData.append('name', name);
                    formData.append('price', price);
                    formData.append('category', category._id);
                    if (businessId) formData.append('business', businessId);
                    if (imageFile) formData.append('image', imageFile);

                    console.log('Sending Add Item request for:', name);

                    const res = await fetch("/api/menu", {
                        method: "POST",
                        body: formData,
                    });

                    const responseData = await res.json();

                    if (!res.ok) {
                        throw new Error(responseData.error || "Failed to add menu item");
                    }

                    return responseData;
                } catch (error) {
                    console.error('handleAddItem Error:', error);
                    Swal.showValidationMessage(`Request failed: ${error.message}`);
                    return false;
                }
            }
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                console.log('Item added successfully, refreshing list...');
                fetchData();
                Swal.fire({
                    title: "Added!",
                    text: "Item has been added successfully.",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        });
    };

    const handleEditItem = (item) => {
        Swal.fire({
            title: "Edit Item",
            html: `
                <div class="space-y-4 pt-4 text-left">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                        <input id="edit-name" class="swal2-input !m-0 !w-full border-gray-200 rounded-xl" placeholder="e.g. Pepperoni Pizza" value="${item.name}">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                        <input id="edit-price" type="number" step="0.01" class="swal2-input !m-0 !w-full border-gray-200 rounded-xl" placeholder="0.00" value="${item.price}">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Business</label>
                        <select id="edit-business" class="swal2-input !m-0 !w-full border-gray-200 rounded-xl">
                            <option value="">Select Business</option>
                            ${businesses.map(b => `<option value="${b._id}" ${b._id === item.business?._id ? 'selected' : ''}>${b.name}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Item Image (Leave blank to keep current)</label>
                        <input id="edit-image" type="file" accept="image/*" class="swal2-file !m-0 !w-full border-gray-200 rounded-xl">
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: "Update Item",
            confirmButtonColor: "#2563eb",
            focusConfirm: false,
            showLoaderOnConfirm: true,
            preConfirm: async () => {
                try {
                    const name = document.getElementById('edit-name').value;
                    const price = document.getElementById('edit-price').value;
                    const businessId = document.getElementById('edit-business').value;
                    const imageFile = document.getElementById('edit-image').files[0];

                    if (!name || !price) {
                        Swal.showValidationMessage('Name and Price are required');
                        return false;
                    }

                    const formData = new FormData();
                    formData.append('name', name);
                    formData.append('price', price);
                    if (businessId) formData.append('business', businessId);
                    if (imageFile) formData.append('image', imageFile);

                    const res = await fetch(`/api/menu/${item._id}`, {
                        method: "PUT",
                        body: formData,
                    });

                    const responseData = await res.json();
                    if (!res.ok) throw new Error(responseData.error || "Failed to update menu item");
                    return responseData;
                } catch (error) {
                    Swal.showValidationMessage(`Request failed: ${error.message}`);
                    return false;
                }
            }
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                fetchData();
                Swal.fire({
                    title: "Updated!",
                    text: "Item has been updated successfully.",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        });
    };

    const handleDeleteItem = (id) => {
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
                    const res = await fetch(`/api/menu/${id}`, { method: "DELETE" });
                    if (!res.ok) throw new Error("Failed to delete item");
                    return await res.json();
                } catch (error) {
                    Swal.showValidationMessage(`Request failed: ${error}`);
                }
            }
        }).then((result) => {
            if (result.isConfirmed) {
                fetchData();
                Swal.fire({
                    title: "Deleted!",
                    text: "Item has been deleted.",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false
                });
            }
        });
    };

    if (loading || !category) return null;

    const filteredItems = menuItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />

            <main className="flex-1 ml-64 p-10">
                <header className="flex items-center justify-between mb-10">
                    <div>
                        <button
                            onClick={() => router.push("/admin/categories")}
                            className="flex items-center text-gray-500 hover:text-blue-600 transition-colors mb-4 group"
                        >
                            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                            <span>Back to Categories</span>
                        </button>
                        <h1 className="text-3xl font-bold text-gray-800">{category.name}</h1>
                        <p className="text-gray-500 mt-1">Manage items for this category.</p>
                    </div>
                    <button
                        onClick={handleAddItem}
                        className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                    >
                        <Plus size={20} />
                        <span>Add New Item</span>
                    </button>
                </header>

                <div className="mb-6 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search items..."
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
                                    <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Image</th>
                                    <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Item Name</th>
                                    <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider">Business</th>
                                    <th className="px-6 py-4 text-sm font-bold text-gray-600 uppercase tracking-wider text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredItems.length > 0 ? (
                                    filteredItems.map((item, index) => (
                                        <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-gray-700 font-medium text-center">{index + 1}</td>
                                            <td className="px-6 py-4">
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden">
                                                    {item.image ? (
                                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            <ImageIcon size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 font-bold whitespace-nowrap">{item.name}</td>
                                            <td className="px-6 py-4 text-gray-700 font-medium">₹{item.price.toFixed(2)}</td>
                                            <td className="px-6 py-4 text-gray-500 font-medium">{item.business?.name || 'N/A'}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center space-x-2">
                                                    <button
                                                        onClick={() => handleEditItem(item)}
                                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteItem(item._id)}
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
                                        <td colSpan="6" className="px-6 py-10 text-center text-gray-500 font-medium">
                                            No items found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
}
