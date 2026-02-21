import dbConnect from '@/lib/db';
import Business from '@/models/Business';
import cloudinary from '@/lib/cloudinary';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function PUT(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const formData = await req.formData();

        const name = formData.get('name');
        const userName = formData.get('userName');
        const mobileNumber = formData.get('mobileNumber');
        const email = formData.get('email');
        const country = formData.get('country');
        const state = formData.get('state');
        const city = formData.get('city');
        const address = formData.get('address');
        const password = formData.get('password');
        const categoryId = formData.get('category');
        const logoFile = formData.get('logo');

        const updateData = {};
        if (name) {
            updateData.name = name;
            updateData.slug = name.trim().toLowerCase().replace(/\s+/g, '-');
        }
        if (userName) updateData.userName = userName;
        if (mobileNumber) updateData.mobileNumber = mobileNumber;
        if (email) updateData.email = email;
        if (country) updateData.country = country;
        if (state) updateData.state = state;
        if (city) updateData.city = city;
        if (address) updateData.address = address;
        if (categoryId) updateData.category = categoryId;

        // Hash password if provided
        if (password && password.trim() !== "" && !password.startsWith('$2a$')) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        // Handle logo update if a new file is provided
        if (logoFile && typeof logoFile !== 'string') {
            const arrayBuffer = await logoFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const uploadResponse = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: 'qr-menu-logos' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(buffer);
            });
            updateData.logo = uploadResponse.secure_url;
        }

        const business = await Business.findByIdAndUpdate(id, updateData, { new: true });
        if (!business) {
            return NextResponse.json({ error: 'Business not found' }, { status: 404 });
        }
        return NextResponse.json(business);
    } catch (error) {
        console.error("PUT /api/business/[id] error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        await Business.findByIdAndDelete(id);
        return NextResponse.json({ message: 'Business deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
