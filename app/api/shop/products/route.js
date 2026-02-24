import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import cloudinary from '@/lib/cloudinary';
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const businessId = searchParams.get('businessId');

        if (!businessId) return NextResponse.json({ error: 'Business ID required' }, { status: 400 });

        const products = await Product.find({ business: businessId })
            .populate('category')
            .populate('subCategory')
            .sort({ createdAt: -1 });

        return NextResponse.json(products);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const formData = await req.formData();

        const businessId = formData.get('businessId');
        const categoryId = formData.get('categoryId');
        const subCategoryId = formData.get('subCategoryId');
        const name = formData.get('name');
        const mrpPrice = formData.get('mrpPrice');
        const salePrice = formData.get('salePrice');
        const description = formData.get('description');
        const imageFiles = formData.getAll('images');

        if (!businessId || !categoryId || !subCategoryId || !name || !mrpPrice || !salePrice) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const imageUrls = [];
        for (const file of imageFiles) {
            if (typeof file !== 'string') {
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                const uploadResponse = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder: 'qr-menu-products' },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    uploadStream.end(buffer);
                });
                imageUrls.push(uploadResponse.secure_url);
            }
        }

        const product = await Product.create({
            business: businessId,
            category: categoryId,
            subCategory: subCategoryId,
            name,
            mrpPrice: Number(mrpPrice),
            salePrice: Number(salePrice),
            description,
            images: imageUrls,
            status: true
        });

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
