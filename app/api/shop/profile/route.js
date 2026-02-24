import dbConnect from '@/lib/db';
import Business from '@/models/Business';
import cloudinary from '@/lib/cloudinary';
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const business = await Business.findById(id).select('-password');
        if (!business) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        return NextResponse.json(business);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const formData = await req.formData();
        const name = formData.get('name');
        const userName = formData.get('userName');
        const mobileNumber = formData.get('mobileNumber');
        const address = formData.get('address');
        const city = formData.get('city');
        const state = formData.get('state');
        const logoFile = formData.get('logo');

        const updateData = {};
        if (name) updateData.name = name;
        if (userName) updateData.userName = userName;
        if (mobileNumber) updateData.mobileNumber = mobileNumber;
        if (address) updateData.address = address;
        if (city) updateData.city = city;
        if (state) updateData.state = state;

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

        const business = await Business.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
        return NextResponse.json(business);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
