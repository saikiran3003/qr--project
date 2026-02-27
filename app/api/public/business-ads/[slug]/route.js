import dbConnect from '@/lib/db';
import BusinessAd from '@/models/BusinessAd';
import Business from '@/models/Business';
import { NextResponse } from 'next/server';

// Public GET — fetch ads for a business by slug
export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { slug } = await params;
        const decodedSlug = decodeURIComponent(slug).trim();

        const business = await Business.findOne({
            $or: [
                { slug: decodedSlug },
                { slug: decodedSlug.toLowerCase().replace(/\s+/g, '-') },
                { name: { $regex: new RegExp(`^${decodedSlug}$`, 'i') } }
            ]
        }).select('_id');

        if (!business) {
            return NextResponse.json({ ads: [] });
        }

        const ads = await BusinessAd.find({ business: business._id, status: true })
            .sort({ order: 1, createdAt: 1 });

        return NextResponse.json({ ads });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
