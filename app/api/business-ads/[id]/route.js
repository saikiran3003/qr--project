import dbConnect from '@/lib/db';
import BusinessAd from '@/models/BusinessAd';
import { NextResponse } from 'next/server';

// DELETE a specific ad
export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        await BusinessAd.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Ad deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
