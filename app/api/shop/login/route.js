import dbConnect from '@/lib/db';
import Business from '@/models/Business';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        await dbConnect();
        const { email, password } = await req.json();

        // Find business by email
        const business = await Business.findOne({ email });
        if (!business) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, business.password);
        if (!isMatch) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: business._id, email: business.email, type: 'shop' },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' }
        );

        const response = NextResponse.json({
            token,
            businessId: business._id,
            name: business.name,
            message: 'Login successful'
        }, { status: 200 });

        // Set HTTP-only session cookie
        response.cookies.set('shop_session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
        });

        return response;
    } catch (error) {
        console.error("Shop Login API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
