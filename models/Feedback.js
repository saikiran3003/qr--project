import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    name: String,
    mobileNumber: String,
    comment: String,
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);
