import mongoose from 'mongoose';

const ShareSchema = new mongoose.Schema({
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true,
    },
    platform: {
        type: String,
        required: true,
        enum: ['whatsapp', 'facebook', 'twitter', 'copy_link', 'google_review'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Share || mongoose.model('Share', ShareSchema);
