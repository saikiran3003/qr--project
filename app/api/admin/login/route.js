import dbConnect from '@/lib/db';
import Admin from '@/models/Admin';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        await dbConnect();
        const { username, password } = await req.json();

        const admin = await Admin.findOne({ username });
        if (!admin) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const token = jwt.sign({ id: admin._id, username: admin.username }, process.env.JWT_SECRET || 'secret', {
            expiresIn: '1d',
        });

        return NextResponse.json({ token, message: 'Login successful' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
