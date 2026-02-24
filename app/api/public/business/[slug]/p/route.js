import dbConnect from '@/lib/db';
import Business from '@/models/Business';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { slug, productId } = await params;

        const business = await Business.findOne({ slug, status: true }).select('name logo city mobileNumber address');
        if (!business) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const product = await Product.findById(productId).populate('category').populate('subCategory');
        if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

        const relatedProducts = await Product.find({
            category: product.category._id,
            _id: { $ne: productId },
            status: true
        }).limit(6);

        return NextResponse.json({
            business,
            product,
            relatedProducts
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
