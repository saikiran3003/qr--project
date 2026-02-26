import dbConnect from '@/lib/db';
import Business from '@/models/Business';
import MasterCategory from '@/models/MasterCategory';
import cloudinary from '@/lib/cloudinary';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        await dbConnect();
        const businesses = await Business.find({}).populate('category').sort({ createdAt: -1 });
        return NextResponse.json(businesses);
    } catch (error) {
        console.error("GET /api/business error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
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
        const googleReviewUrl = formData.get('googleReviewUrl');
        const logoFile = formData.get('logo');

        if (!logoFile) {
            return NextResponse.json({ error: 'Logo is required' }, { status: 400 });
        }

        // Generate slug
        const slug = name.trim().toLowerCase().replace(/\s+/g, '-');

        // Check if slug or email already exists
        const existingBusiness = await Business.findOne({ $or: [{ slug }, { email }] });
        if (existingBusiness) {
            return NextResponse.json({ error: 'Business name or email already exists' }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Upload logo to Cloudinary
        const arrayBuffer = await logoFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const logoUploadResponse = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'qr-menu-logos' },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(buffer);
        });

        // Generate QR Code
        // Generate QR Code with correct host and protocol for Vercel/Production
        // Generate QR Code with correct host and protocol
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL;
        let businessUrl;

        if (baseUrl && baseUrl.trim() !== "") {
            businessUrl = `${baseUrl.trim().replace(/\/$/, '')}/b/${slug}`;
        } else {
            const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000';
            const protocol = req.headers.get('x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https');
            businessUrl = `${protocol}://${host}/b/${slug}`;
        }

        const qrCodeDataUrl = await QRCode.toDataURL(businessUrl, {
            errorCorrectionLevel: 'H',
            margin: 1,
            width: 500,
            color: {
                dark: '#000000',
                light: '#ffffff',
            },
        });

        // Upload QR Code to Cloudinary
        const qrUploadResponse = await cloudinary.uploader.upload(qrCodeDataUrl, {
            folder: 'qr-menu-qrcodes',
            public_id: `qr_${slug}`,
        });

        const business = await Business.create({
            name,
            slug,
            userName,
            mobileNumber,
            email,
            country,
            state,
            city,
            address,
            password: hashedPassword,
            googleReviewUrl,
            logo: logoUploadResponse.secure_url,
            qrCode: qrUploadResponse.secure_url,
            category: categoryId,
            status: true
        });

        return NextResponse.json(business, { status: 201 });
    } catch (error) {
        console.error("POST /api/business error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
