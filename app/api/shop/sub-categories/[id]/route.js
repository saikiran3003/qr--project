import dbConnect from '@/lib/db';
import SubCategory from '@/models/SubCategory';
import { NextResponse } from 'next/server';

export async function PUT(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const { name, status } = await req.json();

        const updateData = {};
        if (name) updateData.name = name;
        if (status !== undefined) updateData.status = !!status;

        const subCategory = await SubCategory.findByIdAndUpdate(id, updateData, { new: true });
        if (!subCategory) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        return NextResponse.json(subCategory);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        // TODO: Check if products exist before deleting

        await SubCategory.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Sub-Category deleted' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
