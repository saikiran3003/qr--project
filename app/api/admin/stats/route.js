import dbConnect from '@/lib/db';
import Business from '@/models/Business';
import MasterCategory from '@/models/MasterCategory';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        await dbConnect();

        const [totalCategories, viewStats] = await Promise.all([
            MasterCategory.countDocuments({ status: true }),
            Business.aggregate([
                {
                    $group: {
                        _id: null,
                        totalViews: { $sum: { $ifNull: ["$views", 0] } }
                    }
                }
            ])
        ]);

        const totalViews = viewStats.length > 0 ? viewStats[0].totalViews : 0;

        return NextResponse.json({
            totalCategories,
            totalViews
        });
    } catch (error) {
        console.error("GET /api/admin/stats error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
