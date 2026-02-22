import mongoose from 'mongoose';

const BusinessSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
    },
    userName: String,
    mobileNumber: String,
    email: {
        type: String,
        required: true,
    },
    phoneNumber: String, // Keeping this for backwards compatibility if any
    dob: String,
    country: String,
    state: String,
    city: String,
    address: String,
    password: {
        type: String,
        required: true,
    },
    logo: String,
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    status: {
        type: Boolean,
        default: true,
    },
    views: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Business || mongoose.model('Business', BusinessSchema);
