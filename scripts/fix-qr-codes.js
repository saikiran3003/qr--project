const mongoose = require('mongoose');
const QRCode = require('qrcode');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Business Schema
const BusinessSchema = new mongoose.Schema({
    name: String,
    slug: String,
    qrCode: String,
    status: { type: Boolean, default: true }
});

const Business = mongoose.models.Business || mongoose.model('Business', BusinessSchema);

async function fixQRCodes() {
    const domain = process.argv[2];

    if (!domain) {
        console.error('Error: Please provide your Vercel domain as an argument.');
        console.log('Usage: node scripts/fix-qr-codes.js https://your-domain.vercel.app');
        process.exit(1);
    }

    const cleanDomain = domain.replace(/\/$/, '');

    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected successfully!');

        const businesses = await Business.find({});
        console.log(`Found ${businesses.length} businesses to process.`);

        for (const business of businesses) {
            console.log(`Processing: ${business.name} (${business.slug})...`);

            const businessUrl = `${cleanDomain}/b/${business.slug}`;
            console.log(`  Target URL: ${businessUrl}`);

            // Generate new QR Code
            const qrCodeDataUrl = await QRCode.toDataURL(businessUrl, {
                errorCorrectionLevel: 'H',
                margin: 1,
                width: 500,
                color: { dark: '#000000', light: '#ffffff' },
            });

            // Upload to Cloudinary
            const qrUploadResponse = await cloudinary.uploader.upload(qrCodeDataUrl, {
                folder: 'qr-menu-qrcodes',
                public_id: `qr_${business.slug}`,
                overwrite: true,
            });

            // Update database
            business.qrCode = qrUploadResponse.secure_url;
            await business.save();

            console.log(`  Done! Updated QR: ${qrUploadResponse.secure_url}`);
        }

        console.log('\nAll QR codes have been successfully updated!');
        process.exit(0);
    } catch (error) {
        console.error('Error during update:', error);
        process.exit(1);
    }
}

fixQRCodes();
