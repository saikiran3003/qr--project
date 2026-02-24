import dbConnect from '@/lib/db';
import BusinessCategory from '@/models/BusinessCategory';
import cloudinary from '@/lib/cloudinary';
import { NextResponse } from 'next/server';

export async function PUT(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const formData = await req.formData();
        const name = formData.get('name');
        const imageFile = formData.get('image');
        const status = formData.get('status');

        const updateData = {};
        if (name) updateData.name = name;
        if (status !== null) updateData.status = status === 'true';

        if (imageFile && typeof imageFile !== 'string') {
            const arrayBuffer = await imageFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const uploadResponse = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'qr-menu-business-categories' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(buffer);
            });
            updateData.image = uploadResponse.secure_url;
        }

        const category = await BusinessCategory.findByIdAndUpdate(id, updateData, { new: true });
        if (!category) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        return NextResponse.json(category);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        // TODO: Check if subcategories or products exist before deleting

        await BusinessCategory.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Category deleted' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
