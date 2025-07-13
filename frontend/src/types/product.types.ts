export interface Category {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    parent?: Category;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Product {
    _id: string;
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
    featuredImage?: string;
    category: Category | string;
    vendor: {
        _id: string;
        profile: {
            firstName: string;
            lastName: string;
        };
    } | string;
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
    ratings: {
        average: number;
        count: number;
    };
    views: number;
    createdAt: string;
    updatedAt: string;
}

export interface ProductFormData {
    name: string;
    description: string;
    price: number;
    compareAtPrice?: number;
    cost?: number;
    sku: string;
    barcode?: string;
    trackQuantity: boolean;
    quantity: number;
    allowBackorder: boolean;
    category: string;
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
}

export interface ProductFilters {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    vendor?: string;
    isActive?: boolean;
    isApproved?: boolean;
    sort?: string;
    page?: number;
    limit?: number;
}