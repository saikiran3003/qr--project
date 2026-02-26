import dbConnect from '@/lib/db';
import Feedback from '@/models/Feedback';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        await dbConnect();
        const { businessId, rating } = await req.json();

        if (!businessId || !rating) {
            return NextResponse.json({ error: 'Missing businessId or rating' }, { status: 400 });
        }

        const feedback = await Feedback.create({
            businessId,
            rating
        });

        return NextResponse.json({ success: true, feedback });
    } catch (error) {
        console.error("Feedback API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
