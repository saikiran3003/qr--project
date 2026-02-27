import dbConnect from '@/lib/db';
import Business from '@/models/Business';
import BusinessCategory from '@/models/BusinessCategory';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose'; // Added this import for ObjectId validation

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { slug } = await params;

        if (!slug) {
            return NextResponse.json({ error: "No slug provided" }, { status: 400 });
        }

        const decodedSlug = decodeURIComponent(slug).trim();
        const hyphenatedSlug = decodedSlug.replace(/\s+/g, '-').replace(/-+/g, '-');
        const lowerSlug = hyphenatedSlug.toLowerCase();

        console.log(`Searching for Store: '${slug}' -> Decoded: '${decodedSlug}' -> Normalized: '${lowerSlug}'`);

        // 1. Try exact slug match (Standard)
        let business = await Business.findOne({
            $or: [
                { slug: lowerSlug },
                { slug: decodedSlug },
                { slug: hyphenatedSlug }
            ]
        }).select('-password -plainPassword');

        // 2. Try matching by ID (In case user provides _id instead of slug)
        if (!business && mongoose.Types.ObjectId.isValid(decodedSlug)) {
            business = await Business.findById(decodedSlug).select('-password -plainPassword');
        }

        // 3. Try case-insensitive matching (Most flexible)
        if (!business) {
            business = await Business.findOne({
                $or: [
                    { slug: { $regex: new RegExp(`^${lowerSlug}$`, "i") } },
                    { slug: { $regex: new RegExp(`^${decodedSlug}$`, "i") } },
                    { name: { $regex: new RegExp(`^${decodedSlug}$`, "i") } }
                ]
            }).select('-password -plainPassword');
        }

        if (!business) {
            // Find all businesses to suggest what might be wrong in server logs
            const allStores = await Business.find({}).select('slug name');
            console.log("Store not found. Available Slugs:", allStores.map(b => b.slug));

            return NextResponse.json({
                error: `Store '${decodedSlug}' was not found.`,
                suggestion: "Please try searching for the store name accurately."
            }, { status: 404 });
        }

        if (!business.status) {
            return NextResponse.json({ error: 'Business account is currently disabled' }, { status: 403 });
        }

        const [categories, products] = await Promise.all([
            BusinessCategory.find({ business: business._id, status: true }).sort({ createdAt: 1 }),
            Product.find({ business: business._id, status: true }).sort({ createdAt: -1 })
        ]);

        return NextResponse.json({ business, categories, products });

    } catch (error) {
        console.error("Critical Business API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
