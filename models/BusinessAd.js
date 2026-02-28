import mongoose from 'mongoose';

const BusinessAdSchema = new mongoose.Schema({
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true,
    },
    imageUrl: { type: String, required: true },
    link: { type: String, default: "" },
    order: { type: Number, default: 0 },
    status: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.BusinessAd || mongoose.model('BusinessAd', BusinessAdSchema);
