import mongoose from 'mongoose';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8');
const MONGODB_URI = env.match(/MONGODB_URI=(.*)/)[1].trim();

const MasterCategorySchema = new mongoose.Schema({
    name: String,
    slug: String,
    status: Boolean
});

const MasterCategory = mongoose.models.MasterCategory || mongoose.model('MasterCategory', MasterCategorySchema);

async function activatePerfumeStore() {
    try {
        await mongoose.connect(MONGODB_URI);
        const result = await MasterCategory.findOneAndUpdate(
            { slug: 'perfume-store' },
            { status: true },
            { new: true }
        );
        if (result) {
            console.log(`Success: '${result.name}' status is now ${result.status}`);
        } else {
            console.log("Error: 'perfume-store' not found in database.");
        }
    } catch (err) {
        console.error(err);
    }
    process.exit(0);
}
activatePerfumeStore();
