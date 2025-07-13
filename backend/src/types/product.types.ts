import { Document } from 'mongoose';


export interface ICategory extends Document {
    name: string;
    slug: string;
    description?: string;
    image?: string;
    parent?: ICategory['_id'];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IProduct extends Document {
    name: string;
    slug: string;
    description: string;
    price: number;
    compareAtPrice?: number;
    cost?: number;
    sku: string;
    barcode?: string;
    trackQuantity: boolean;
    quantity: number;
    allowBackorder: boolean;
    images: string[];
    category: ICategory['_id'];
    vendor: Object;
    brand?: string;
    weight?: number;
    dimensions?: {
        length?: number;
        width?: number;
        height?: number;
    };
    tags: string[];
    specifications: Record<string, any>;
    isActive: boolean;
    isApproved: boolean;
    featuredImage?: string;
    ratings: {
        average: number;
        count: number;
    };
    views: number;
    createdAt: Date;
    updatedAt: Date;
}
