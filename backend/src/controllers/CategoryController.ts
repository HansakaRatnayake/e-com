import { Request, Response, NextFunction } from 'express';
import { Category } from '../models/Category';
import { Product } from '../models/Product';
import { CustomError } from '../middleware/errorHandler';

export const createCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const category = new Category(req.body);
        await category.save();

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: category
        });
    } catch (error) {
        next(error);
    }
};

export const getCategories = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { parent, isActive = true } = req.query;

        const query: any = {};
        if (isActive !== 'all') {
            query.isActive = isActive === 'true';
        }
        if (parent !== undefined) {
            query.parent = parent === 'null' ? null : parent;
        }

        const categories = await Category.find(query)
            .populate('parent', 'name slug')
            .sort('name');

        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        next(error);
    }
};

export const getCategoryById = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const category = await Category.findById(req.params.id)
            .populate('parent', 'name slug');

        if (!category) {
            const error: CustomError = new Error('Category not found');
            error.statusCode = 404;
            throw error;
        }

        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        next(error);
    }
};

export const updateCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!category) {
            const error: CustomError = new Error('Category not found');
            error.statusCode = 404;
            throw error;
        }

        res.json({
            success: true,
            message: 'Category updated successfully',
            data: category
        });
    } catch (error) {
        next(error);
    }
};

export const deleteCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const category = await Category.findById(req.params.id);

        if (!category) {
            const error: CustomError = new Error('Category not found');
            error.statusCode = 404;
            throw error;
        }

        // Check if category has products
        const productCount = await Product.countDocuments({ category: category._id });
        if (productCount > 0) {
            const error: CustomError = new Error('Cannot delete category with existing products');
            error.statusCode = 400;
            throw error;
        }

        // Check if category has subcategories
        const subcategoryCount = await Category.countDocuments({ parent: category._id });
        if (subcategoryCount > 0) {
            const error: CustomError = new Error('Cannot delete category with subcategories');
            error.statusCode = 400;
            throw error;
        }

        await category.deleteOne();

        res.json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};