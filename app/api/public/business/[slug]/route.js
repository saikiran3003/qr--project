import dbConnect from '@/lib/db';
import Business from '@/models/Business';
import BusinessCategory from '@/models/BusinessCategory';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        let { slug } = await params;

        // Normalize slug: remove accidental spaces and handle common typos
        const normalizedSlug = decodeURIComponent(slug).trim().replace(/\s+/g, '-').replace(/-+/g, '-');
        console.log(`API Request: original='${slug}', normalized='${normalizedSlug}'`);

        const businessCount = await Business.countDocuments({});
        console.log("DB Stats: Total businesses in DB =", businessCount);

        // Try exact match with normalized slug
        let business = await Business.findOne({ slug: normalizedSlug }).select('-password');

        if (!business) {
            console.log("API: Exact slug match failed, trying case-insensitive regex for:", normalizedSlug);
            business = await Business.findOne({
                slug: { $regex: new RegExp(`^${normalizedSlug}$`, "i") }
            }).select('-password');
        }

        if (!business) {
            console.log("API: Slug match failed entirely. Checking all businesses...");
            const all = await Business.find({}).select('slug name');
            console.log("API: Available slugs in DB:", all.map(b => b.slug));
            return NextResponse.json({ error: `Store with slug '${slug}' not found.` }, { status: 404 });
        }

        if (!business.status) {
            console.warn(`API: Business found but is inactive for slug: ${slug}`);
            return NextResponse.json({ error: 'Business is currently inactive' }, { status: 403 });
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
