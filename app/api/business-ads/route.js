import dbConnect from '@/lib/db';
import BusinessAd from '@/models/BusinessAd';
import cloudinary from '@/lib/cloudinary';
import { NextResponse } from 'next/server';

// GET all ads (optionally filter by businessId)
export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const businessId = searchParams.get('businessId');

        const query = businessId ? { business: businessId } : {};
        const ads = await BusinessAd.find(query).sort({ order: 1, createdAt: 1 });
        return NextResponse.json(ads);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST — create a new ad (upload image to cloudinary)
export async function POST(req) {
    try {
        await dbConnect();
        const formData = await req.formData();
        const businessId = formData.get('businessId');
        const imageFile = formData.get('image');
        const order = formData.get('order') || 0;

        if (!businessId || !imageFile) {
            return NextResponse.json({ error: 'businessId and image are required' }, { status: 400 });
        }

        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResponse = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'qr-menu-ads' },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(buffer);
        });

        const ad = await BusinessAd.create({
            business: businessId,
            imageUrl: uploadResponse.secure_url,
            order: Number(order),
        });

        return NextResponse.json(ad, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
