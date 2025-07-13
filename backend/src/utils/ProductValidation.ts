import { z } from 'zod';

export const createProductSchema = z.object({
    name: z.string().min(1, 'Product name is required'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    price: z.number().min(0, 'Price must be positive'),
    compareAtPrice: z.number().min(0).optional(),
    cost: z.number().min(0).optional(),
    sku: z.string().min(1, 'SKU is required'),
    barcode: z.string().optional(),
    trackQuantity: z.boolean().default(true),
    quantity: z.number().int().min(0).default(0),
    allowBackorder: z.boolean().default(false),
    category: z.string().min(1, 'Category is required'),
    brand: z.string().optional(),
    weight: z.number().min(0).optional(),
    dimensions: z.object({
        length: z.number().min(0).optional(),
        width: z.number().min(0).optional(),
        height: z.number().min(0).optional()
    }).optional(),
    tags: z.array(z.string()).default([]),
    specifications: z.record(z.any()).default({}),
    isActive: z.boolean().default(true)
});

export const updateProductSchema = createProductSchema.partial();

export const createCategorySchema = z.object({
    name: z.string().min(1, 'Category name is required'),
    description: z.string().optional(),
    parent: z.string().optional(),
    isActive: z.boolean().default(true)
});

export const updateCategorySchema = createCategorySchema.partial();