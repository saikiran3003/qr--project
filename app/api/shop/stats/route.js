import dbConnect from '@/lib/db';
import Category from '@/models/BusinessCategory';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const businessId = searchParams.get('businessId');

        if (!businessId) {
            return NextResponse.json({ error: 'Business ID is required' }, { status: 400 });
        }

        const [categoriesCount, productsCount] = await Promise.all([
            Category.countDocuments({ business: businessId }),
            Product.countDocuments({ business: businessId })
        ]);

        return NextResponse.json({
            categories: categoriesCount,
            products: productsCount
        });
    } catch (error) {
        console.error("GET /api/shop/stats error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
