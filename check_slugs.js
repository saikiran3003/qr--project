import dbConnect from './lib/db.js';
import Business from './models/Business.js';
import dotenv from 'dotenv';
dotenv.config();

async function check() {
    try {
        await dbConnect();
        const businesses = await Business.find({});
        console.log('Valid Slugs in DB:', businesses.map(b => b.slug));
    } catch (err) {
        console.error(err);
    }
    process.exit(0);
}
check();
