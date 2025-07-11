import mongoose, {Schema} from "mongoose";
import {IProduct} from "../types/product.types";

const ProductSchema = new Schema<IProduct>({
    name: {
        type: String,
        required: true,
        trim: true
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
    discount: {
        type: Number,
        default: 0 // percent discount
    },
    stock: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        required: true
    },
    brand: {
        type: String
    },
    images: [{
        type: String // URLs or filenames
    }],
    vendor: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    ratings: {
        type: Number,
        default: 0
    },

}, {
    timestamps: true
});

export const Product = mongoose.model<IProduct>('Product', ProductSchema);