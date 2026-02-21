import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import { NextResponse } from 'next/server';

export async function PUT(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const data = await req.json();
        const category = await Category.findByIdAndUpdate(id, data, { new: true });
        return NextResponse.json(category);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        console.log('Received Category DELETE request for ID:', id);
        const deletedCategory = await Category.findByIdAndDelete(id);
        if (!deletedCategory) {
            console.error('Category not found for deletion:', id);
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }
        console.log('Category deleted successfully from DB:', id);
        return NextResponse.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('DELETE /api/categories/[id] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
