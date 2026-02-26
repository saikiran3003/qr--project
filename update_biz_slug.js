import mongoose from 'mongoose';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8');
const MONGODB_URI = env.match(/MONGODB_URI=(.*)/)[1].trim();

const BusinessSchema = new mongoose.Schema({
    name: String,
    slug: String,
    status: Boolean
});

const Business = mongoose.models.Business || mongoose.model('Business', BusinessSchema);

async function syncSlug() {
    try {
        await mongoose.connect(MONGODB_URI);
        // Find the business that should be 'perfume-store'
        // It's currently named 'Scenzora Perfume Store' with slug 'scenzora-perfume-store'
        const result = await Business.findOneAndUpdate(
            { slug: 'scenzora-perfume-store' },
            { slug: 'perfume-store' },
            { new: true }
        );

        if (result) {
            console.log(`Success: Business '${result.name}' slug is now '${result.slug}'`);
        } else {
            console.log("Error: Business with slug 'scenzora-perfume-store' not found.");
            // Check if it already has the right slug
            const exists = await Business.findOne({ slug: 'perfume-store' });
            if (exists) {
                console.log(`Business 'perfume-store' already exists: ${exists.name}`);
            }
        }
    } catch (err) {
        console.error(err);
    }
    process.exit(0);
}
syncSlug();
