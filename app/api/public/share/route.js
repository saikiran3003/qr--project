import dbConnect from '@/lib/db';
import Share from '@/models/Share';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        await dbConnect();
        const { businessId, platform } = await req.json();

        if (!businessId || !platform) {
            return NextResponse.json({ error: 'Missing businessId or platform' }, { status: 400 });
        }

        const share = await Share.create({
            businessId,
            platform
        });

        return NextResponse.json({ success: true, share });
    } catch (error) {
        console.error("Share API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
