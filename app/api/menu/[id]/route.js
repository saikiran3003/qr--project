import dbConnect from '@/lib/db';
import MenuItem from '@/models/MenuItem';
import cloudinary from '@/lib/cloudinary';
import { NextResponse } from 'next/server';

export async function PUT(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        const contentType = req.headers.get('content-type') || '';
        let updateData = {};

        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            updateData.name = formData.get('name');
            updateData.price = parseFloat(formData.get('price'));
            updateData.business = formData.get('business') || null;

            const imageFile = formData.get('image');
            if (imageFile && typeof imageFile !== 'string' && imageFile.size > 0) {
                const arrayBuffer = await imageFile.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const uploadResponse = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder: 'qr-menu-items' },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    uploadStream.end(buffer);
                });
                updateData.image = uploadResponse.secure_url;
            }
        } else {
            updateData = await req.json();
        }

        const menuItem = await MenuItem.findByIdAndUpdate(id, updateData, { new: true });
        return NextResponse.json(menuItem);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        await MenuItem.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Menu item deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
