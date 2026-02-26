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

async function check() {
    try {
        await mongoose.connect(MONGODB_URI);
        const businesses = await Business.find({});
        console.log('--- ALL BUSINESSES IN DB ---');
        businesses.forEach(b => {
            console.log(`Name: ${b.name} | Slug: ${b.slug} | Status: ${b.status}`);
        });
        console.log('---------------------------');
    } catch (err) {
        console.error(err);
    }
    process.exit(0);
}
check();
