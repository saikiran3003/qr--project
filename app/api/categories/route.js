import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        await dbConnect();
        const categories = await Category.find({}).sort({ createdAt: -1 });
        return NextResponse.json(categories);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const data = await req.json();
        const category = await Category.create(data);
        return NextResponse.json(category, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
