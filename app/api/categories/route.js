import dbConnect from '@/lib/db';
import MasterCategory from '@/models/MasterCategory';
import cloudinary from '@/lib/cloudinary';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        await dbConnect();
        const categories = await MasterCategory.find({}).sort({ createdAt: -1 });
        return NextResponse.json(categories);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();

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

        const categoryData = { ...data };
        if (imageUrl) categoryData.image = imageUrl;

        const category = await MasterCategory.create(categoryData);
        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
