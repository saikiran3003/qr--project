import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Business from '@/models/Business';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        await dbConnect();
        const data = await req.json();

        const { businessSlug, customerName, mobileNumber, items, totalAmount } = data;

        if (!businessSlug || !customerName || !mobileNumber || !items || !totalAmount) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const business = await Business.findOne({ slug: businessSlug });
        if (!business) {
            return NextResponse.json({ error: 'Business not found' }, { status: 404 });
        }

        const order = await Order.create({
            business: business._id,
            businessSlug,
            customerName,
            mobileNumber,
            items: items.map(item => ({
                ...item,
                itemName: item.name
            })),
            productNames: items.map(item => item.name),
            productSummary: items.map(item => `${item.name} (x${item.quantity})`).join(', '),
            productNamesList: items.map(item => item.name).join(', '),
            totalAmount
        });

        return NextResponse.json({ success: true, orderId: order._id });
    } catch (error) {
        console.error("Order API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
