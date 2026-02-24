import dbConnect from '@/lib/db';
import Business from '@/models/Business';
import BusinessCategory from '@/models/BusinessCategory';
import SubCategory from '@/models/SubCategory';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { slug, categoryId } = await params;

        const business = await Business.findOne({ slug, status: true }).select('name logo city mobileNumber address');
        if (!business) return NextResponse.json({ error: 'Not found' }, { status: 404 });

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
