import mongoose from 'mongoose';

const MenuItemSchema = new mongoose.Schema({
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    business: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Business',
    },
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.MenuItem || mongoose.model('MenuItem', MenuItemSchema);
