import dbConnect from '@/lib/db';
import Business from '@/models/Business';
import BusinessCategory from '@/models/BusinessCategory';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { slug } = await params;

        const business = await Business.findOne({ slug, status: true }).select('-password');
        if (!business) {
            return NextResponse.json({ error: 'Business not found or inactive' }, { status: 404 });
        }

        const categories = await BusinessCategory.find({ business: business._id, status: true }).sort({ createdAt: 1 });
        const products = await Product.find({ business: business._id, status: true }).sort({ createdAt: -1 });

        return NextResponse.json({
            business,
            categories,
            products
        });
    } catch (error) {
        console.error("Public Business API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
