import dbConnect from '@/lib/db';
import Business from '@/models/Business';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        let { slug, productId } = await params;
        const normalizedSlug = decodeURIComponent(slug).trim().replace(/\s+/g, '-').replace(/-+/g, '-');

        const business = await Business.findOne({
            slug: { $regex: new RegExp(`^${normalizedSlug}$`, "i") }
        }).select('name logo city mobileNumber address status');

        if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 });
        if (!business.status) return NextResponse.json({ error: 'Business is inactive' }, { status: 403 });

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
