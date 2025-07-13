import mongoose, { Schema } from 'mongoose';
import { IProduct } from '../types/product.types';

const productSchema = new Schema<IProduct>({
    name: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    compareAtPrice: {
        type: Number,
        min: 0
    },
    cost: {
        type: Number,
        min: 0
    },
    sku: {
        type: String,
        required: true,
        unique: true
    },
    barcode: String,
    trackQuantity: {
        type: Boolean,
        default: true
    },
    quantity: {
        type: Number,
        default: 0,
        min: 0
    },
    allowBackorder: {
        type: Boolean,
        default: false
    },
    images: [{
        type: String
    }],
    featuredImage: String,
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    vendor: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    brand: String,
    weight: Number,
    dimensions: {
        length: Number,
        width: Number,
        height: Number
    },
    tags: [{
        type: String,
        lowercase: true
    }],
    specifications: {
        type: Map,
        of: Schema.Types.Mixed
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    ratings: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        }
    },
    views: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Indexes for better search performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ vendor: 1, createdAt: -1 });
productSchema.index({ category: 1, isActive: 1, isApproved: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'ratings.average': -1 });

// Create slug from name before saving
productSchema.pre('save', function(next) {
    if (this.isModified('name')) {
        this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    // Set featured image to first image if not set
    if (!this.featuredImage && this.images.length > 0) {
        this.featuredImage = this.images[0];
    }
    next();
});

export const Product = mongoose.model<IProduct>('Product', productSchema);