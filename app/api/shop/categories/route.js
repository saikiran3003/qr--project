import dbConnect from '@/lib/db';
import BusinessCategory from '@/models/BusinessCategory';
import cloudinary from '@/lib/cloudinary';
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const businessId = searchParams.get('businessId');

        if (!businessId) return NextResponse.json({ error: 'Business ID required' }, { status: 400 });

        const categories = await BusinessCategory.find({ business: businessId }).sort({ createdAt: -1 });
        return NextResponse.json(categories);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const formData = await req.formData();
        const businessId = formData.get('businessId');
        const name = formData.get('name');
        const imageFile = formData.get('image');

        if (!businessId || !name) {
            return NextResponse.json({ error: 'Business ID and Name are required' }, { status: 400 });
        }

        let imageUrl = null;
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
            imageUrl = uploadResponse.secure_url;
        }

        const category = await BusinessCategory.create({
            business: businessId,
            name,
            image: imageUrl,
            status: true
        });

        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
