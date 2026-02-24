import dbConnect from '@/lib/db';
import MasterCategory from '@/models/MasterCategory';
import cloudinary from '@/lib/cloudinary';
import { NextResponse } from 'next/server';

export async function PUT(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        const contentType = req.headers.get('content-type') || '';
        let data = {};
        let imageUrl = null;

        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            data = {
                name: formData.get('name'),
                slug: formData.get('slug'),
                status: formData.get('status') === 'true',
            };

            const imageFile = formData.get('image');
            // Only upload if it's a new file, not just the existing URL string
            if (imageFile && typeof imageFile !== 'string') {
                const arrayBuffer = await imageFile.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const uploadResponse = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder: 'qr-menu-categories' },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    uploadStream.end(buffer);
                });
                imageUrl = uploadResponse.secure_url;
            }
        } else {
            data = await req.json();
        }

        const updateData = { ...data };
        if (imageUrl) updateData.image = imageUrl;

        const category = await MasterCategory.findByIdAndUpdate(id, updateData, { new: true });
        return NextResponse.json(category);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const deletedCategory = await MasterCategory.findByIdAndDelete(id);
        if (!deletedCategory) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Category deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
