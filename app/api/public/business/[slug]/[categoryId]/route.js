import dbConnect from '@/lib/db';
import Business from '@/models/Business';
import BusinessCategory from '@/models/BusinessCategory';
import SubCategory from '@/models/SubCategory';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        let { slug, categoryId } = await params;
        const normalizedSlug = decodeURIComponent(slug).trim().replace(/\s+/g, '-').replace(/-+/g, '-');

        const business = await Business.findOne({
            slug: { $regex: new RegExp(`^${normalizedSlug}$`, "i") }
        }).select('name logo city mobileNumber address status');

        if (!business) return NextResponse.json({ error: 'Business not found' }, { status: 404 });
        if (!business.status) return NextResponse.json({ error: 'Business is inactive' }, { status: 403 });

        const category = await BusinessCategory.findById(categoryId);
        if (!category) return NextResponse.json({ error: 'Category not found' }, { status: 404 });

        const subCategories = await SubCategory.find({ parentCategory: categoryId, status: true }).sort({ createdAt: 1 });
        const products = await Product.find({ category: categoryId, status: true }).sort({ createdAt: -1 });

        return NextResponse.json({
            business,
            category,
            subCategories,
            products
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
