import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import cloudinary from '@/lib/cloudinary';
import { NextResponse } from 'next/server';

export async function PUT(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const formData = await req.formData();

        const categoryId = formData.get('categoryId');
        const subCategoryId = formData.get('subCategoryId');
        const name = formData.get('name');
        const mrpPrice = formData.get('mrpPrice');
        const salePrice = formData.get('salePrice');
        const description = formData.get('description');
        const status = formData.get('status');
        const imageFiles = formData.getAll('images');
        const currentImages = JSON.parse(formData.get('currentImages') || '[]');

        const updateData = {};
        if (categoryId) updateData.category = categoryId;
        if (subCategoryId) updateData.subCategory = subCategoryId;
        if (name) updateData.name = name;
        if (mrpPrice) updateData.mrpPrice = Number(mrpPrice);
        if (salePrice) updateData.salePrice = Number(salePrice);
        if (description !== null) updateData.description = description;
        if (status !== null) updateData.status = status === 'true';

        const newImageUrls = [...currentImages];
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
                newImageUrls.push(uploadResponse.secure_url);
            }
        }

        if (newImageUrls.length > 0 || imageFiles.length > 0) {
            updateData.images = newImageUrls;
        }

        const product = await Product.findByIdAndUpdate(id, updateData, { new: true });
        if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        return NextResponse.json(product);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        await Product.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Product deleted' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
