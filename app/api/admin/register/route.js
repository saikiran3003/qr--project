import dbConnect from '@/lib/db';
import Admin from '@/models/Admin';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        await dbConnect();
        const { username, email, password } = await req.json();
        console.log('Registering admin:', username, email);

        const existingAdmin = await Admin.findOne({
            $or: [{ username }, { email }]
        });

        if (existingAdmin) {
            const field = existingAdmin.username === username ? 'Username' : 'Email';
            return NextResponse.json({ error: `${field} already exists` }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = await Admin.create({
            username,
            email,
            password: hashedPassword,
        });

        return NextResponse.json({ message: 'Admin registered successfully' }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
