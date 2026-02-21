import dbConnect from '@/lib/db';
import MenuItem from '@/models/MenuItem';
import cloudinary from '@/lib/cloudinary';
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const categoryId = searchParams.get('categoryId');

        let query = {};
        if (categoryId) {
            query.category = categoryId;
        }

        const menuItems = await MenuItem.find(query).populate('category').populate('business').sort({ createdAt: -1 });
        return NextResponse.json(menuItems);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const formData = await req.formData();

        const category = formData.get('category');
        const business = formData.get('business');
        const name = formData.get('name');
        const price = formData.get('price');
        const imageFile = formData.get('image');

        if (!imageFile) {
            return NextResponse.json({ error: 'Image is required' }, { status: 400 });
        }

        // Convert file to buffer for Cloudinary upload
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Cloudinary
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

        const menuItem = await MenuItem.create({
            category,
            business: business || null,
            name,
            price: parseFloat(price),
            image: uploadResponse.secure_url,
        });

        return NextResponse.json(menuItem, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
