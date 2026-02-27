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
    userName: { type: String, default: "" },
    mobileNumber: { type: String, default: "" },
    email: { type: String, required: true },
    phoneNumber: { type: String, default: "" },
    dob: { type: String, default: "" },
    country: { type: String, default: "" },
    state: { type: String, default: "" },
    city: { type: String, default: "" },
    address: { type: String, default: "" },
    password: { type: String, required: true },
    plainPassword: { type: String, default: "" },
    logo: { type: String, default: "" },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MasterCategory',
        required: true,
    },
    status: { type: Boolean, default: true },
    views: { type: Number, default: 0 },
    qrCode: { type: String, default: "" },
    googleReviewUrl: { type: String, default: "" },
    instagramUrl: { type: String, default: "" },
    facebookUrl: { type: String, default: "" },
    youtubeUrl: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
});

// Force re-compilation of the model to avoid caching old schema versions
if (mongoose.models.Business) {
    delete mongoose.models.Business;
}

const Business = mongoose.model('Business', BusinessSchema);

export default Business;
