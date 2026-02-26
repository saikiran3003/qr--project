import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
        required: true,
    },
    businessSlug: {
        type: String,
        required: true,
    },
    customerName: {
        type: String,
        required: true,
    },
    mobileNumber: {
        type: String,
        required: true,
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        name: String,
        itemName: String,
        salePrice: Number,
        quantity: Number
    }],
    productNames: [String],
    productSummary: String,
    productNamesList: String,
    totalAmount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
