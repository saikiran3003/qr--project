import mongoose from 'mongoose';

const SubCategorySchema = new mongoose.Schema({
    parentCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BusinessCategory',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    status: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.SubCategory || mongoose.model('SubCategory', SubCategorySchema);
