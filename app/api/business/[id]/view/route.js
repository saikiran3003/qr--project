import dbConnect from '@/lib/db';
import Business from '@/models/Business';
import { NextResponse } from 'next/server';

export async function POST(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;

        const business = await Business.findByIdAndUpdate(
            id,
            { $inc: { views: 1 } },
            { new: true }
        );

        if (!business) {
            return NextResponse.json({ error: 'Business not found' }, { status: 404 });
        }

        return NextResponse.json({ views: business.views });
    } catch (error) {
        console.error("POST /api/business/[id]/view error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
