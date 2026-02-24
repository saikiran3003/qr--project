import dbConnect from '@/lib/db';
import SubCategory from '@/models/SubCategory';
import BusinessCategory from '@/models/BusinessCategory';
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const businessId = searchParams.get('businessId');
        const categoryId = searchParams.get('categoryId');

        if (categoryId) {
            const subCategories = await SubCategory.find({ parentCategory: categoryId }).sort({ createdAt: -1 });
            return NextResponse.json(subCategories);
        }

        if (businessId) {
            // Find all categories for this business first
            const categories = await BusinessCategory.find({ business: businessId });
            const categoryIds = categories.map(c => c._id);
            const subCategories = await SubCategory.find({ parentCategory: { $in: categoryIds } }).populate('parentCategory').sort({ createdAt: -1 });
            return NextResponse.json(subCategories);
        }

        return NextResponse.json({ error: 'Business ID or Category ID required' }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const { name, categoryId } = await req.json();

        if (!name || !categoryId) {
            return NextResponse.json({ error: 'Name and Category ID are required' }, { status: 400 });
        }

        const subCategory = await SubCategory.create({
            parentCategory: categoryId,
            name,
            status: true
        });

        return NextResponse.json(subCategory, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
