const mongoose = require('mongoose');
require('dotenv').config();
const MONGODB_URI = process.env.MONGODB_URI;

async function test() {
    console.log('Testing final connection to:', MONGODB_URI);
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected successfully!');

        const hello = await mongoose.connection.db.admin().command({ hello: 1 });
        console.log('Replica Set name:', hello.setName);

        const db = mongoose.connection.db;
        const admins = await db.collection('admins').find({}).toArray();
        console.log('Admins count:', admins.length);
        if (admins.length > 0) {
            console.log('Admins usernames:', admins.map(a => a.username));
        } else {
            console.log('NO ADMINS FOUND. You need to register one first.');
        }
    } catch (err) {
        console.error('Connection error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

test();
