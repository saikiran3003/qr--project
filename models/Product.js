import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BusinessCategory',
        required: true,
    },
    subCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubCategory',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    mrpPrice: {
        type: Number,
        required: true,
    },
    salePrice: {
        type: Number,
        required: true,
    },
    images: [{
        type: String,
    }],
    description: {
        type: String,
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

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
