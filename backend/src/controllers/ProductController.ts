import { Request, Response, NextFunction } from 'express';
import { Product } from '../models/Product';
import { AuthRequest } from '../middleware/auth';
import { CustomError } from '../middleware/errorHandler';
import fs from 'fs/promises';
import path from 'path';

export const createProduct = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const vendorId = req.user.id;
        const images = (req.files as Express.Multer.File[])?.map(file => `/uploads/products/${file.filename}`) || [];

        // Parse numeric fields
        const productData = {
            ...req.body,
            price: parseFloat(req.body.price),
            compareAtPrice: req.body.compareAtPrice ? parseFloat(req.body.compareAtPrice) : undefined,
            cost: req.body.cost ? parseFloat(req.body.cost) : undefined,
            quantity: parseInt(req.body.quantity || '0'),
            weight: req.body.weight ? parseFloat(req.body.weight) : undefined,
            vendor: vendorId,
            images,
            isApproved: false // Products need admin approval
        };

        // Parse dimensions if provided
        if (req.body.dimensions) {
            productData.dimensions = JSON.parse(req.body.dimensions);
        }

        // Parse tags if provided
        if (req.body.tags) {
            productData.tags = JSON.parse(req.body.tags);
        }

        // Parse specifications if provided
        if (req.body.specifications) {
            productData.specifications = JSON.parse(req.body.specifications);
        }

        const product = new Product(productData);
        await product.save();

        res.status(201).json({
            success: true,
            message: 'Product created successfully. Pending admin approval.',
            data: product
        });
    } catch (error) {
        // Delete uploaded images if product creation fails
        if (req.files) {
            const files = req.files as Express.Multer.File[];
            for (const file of files) {
                try {
                    await fs.unlink(file.path);
                } catch (err) {
                    console.error('Error deleting file:', err);
                }
            }
        }
        next(error);
    }
};

export const getProducts = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const {
            page = 1,
            limit = 20,
            sort = '-createdAt',
            category,
            minPrice,
            maxPrice,
            search,
            vendor,
            isActive = true,
            isApproved = true
        } = req.query;

        const query: any = {};

        // Only show active and approved products to buyers
        if (isActive !== 'all') {
            query.isActive = isActive === 'true';
        }
        if (isApproved !== 'all') {
            query.isApproved = isApproved === 'true';
        }

        // Category filter
        if (category) {
            query.category = category;
        }

        // Price range filter
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice as string);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice as string);
        }

        // Vendor filter
        if (vendor) {
            query.vendor = vendor;
        }

        // Search functionality
        if (search) {
            query.$text = { $search: search as string };
        }

        const totalItems = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalItems / Number(limit));
        const currentPage = Number(page);

        const products = await Product.find(query)
            .populate('category', 'name slug')
            .populate('vendor', 'profile.firstName profile.lastName')
            .sort(sort as string)
            .limit(Number(limit))
            .skip((currentPage - 1) * Number(limit));

        res.json({
            success: true,
            data: {
                products,
                pagination: {
                    currentPage,
                    totalPages,
                    totalItems,
                    itemsPerPage: Number(limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

export const getProductById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name slug')
            .populate('vendor', 'profile.firstName profile.lastName email');

        if (!product) {
            const error: CustomError = new Error('Product not found');
            error.statusCode = 404;
            throw error;
        }

        // Increment view count
        product.views += 1;
        await product.save();

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        next(error);
    }
};

export const getProductBySlug = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const product = await Product.findOne({ slug: req.params.slug })
            .populate('category', 'name slug')
            .populate('vendor', 'profile.firstName profile.lastName');

        if (!product) {
            const error: CustomError = new Error('Product not found');
            error.statusCode = 404;
            throw error;
        }

        // Increment view count
        product.views += 1;
        await product.save();

        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        next(error);
    }
};

export const updateProduct = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            const error: CustomError = new Error('Product not found');
            error.statusCode = 404;
            throw error;
        }

        // Check if user is the vendor or admin
        if (product.vendor.toString() !== req.user.id && req.user.role !== 'admin') {
            const error: CustomError = new Error('Unauthorized to update this product');
            error.statusCode = 403;
            throw error;
        }

        // Handle new images
        const newImages = (req.files as Express.Multer.File[])?.map(file => `/uploads/products/${file.filename}`) || [];

        // Parse numeric fields if provided
        const updateData: any = { ...req.body };
        if (req.body.price) updateData.price = parseFloat(req.body.price);
        if (req.body.compareAtPrice) updateData.compareAtPrice = parseFloat(req.body.compareAtPrice);
        if (req.body.cost) updateData.cost = parseFloat(req.body.cost);
        if (req.body.quantity) updateData.quantity = parseInt(req.body.quantity);
        if (req.body.weight) updateData.weight = parseFloat(req.body.weight);

        // Parse complex fields
        if (req.body.dimensions) updateData.dimensions = JSON.parse(req.body.dimensions);
        if (req.body.tags) updateData.tags = JSON.parse(req.body.tags);
        if (req.body.specifications) updateData.specifications = JSON.parse(req.body.specifications);

        // Handle images
        if (newImages.length > 0) {
            updateData.images = [...product.images, ...newImages];
        }

        // Reset approval if vendor updates critical fields
        if (req.user.role === 'vendor' &&
            (req.body.price || req.body.name || req.body.description)) {
            updateData.isApproved = false;
        }

        Object.assign(product, updateData);
        await product.save();

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: product
        });
    } catch (error) {
        next(error);
    }
};

export const deleteProduct = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            const error: CustomError = new Error('Product not found');
            error.statusCode = 404;
            throw error;
        }

        // Check if user is the vendor or admin
        if (product.vendor.toString() !== req.user.id && req.user.role !== 'admin') {
            const error: CustomError = new Error('Unauthorized to delete this product');
            error.statusCode = 403;
            throw error;
        }

        // Delete product images
        for (const image of product.images) {
            try {
                const imagePath = path.join(__dirname, '../../..', image);
                await fs.unlink(imagePath);
            } catch (err) {
                console.error('Error deleting image:', err);
            }
        }

        await product.deleteOne();

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const getVendorProducts = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const vendorId = req.user.id;
        const { page = 1, limit = 20, sort = '-createdAt' } = req.query;

        const query = { vendor: vendorId };

        const totalItems = await Product.countDocuments(query);
        const totalPages = Math.ceil(totalItems / Number(limit));
        const currentPage = Number(page);

        const products = await Product.find(query)
            .populate('category', 'name slug')
            .sort(sort as string)
            .limit(Number(limit))
            .skip((currentPage - 1) * Number(limit));

        res.json({
            success: true,
            data: {
                products,
                pagination: {
                    currentPage,
                    totalPages,
                    totalItems,
                    itemsPerPage: Number(limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};