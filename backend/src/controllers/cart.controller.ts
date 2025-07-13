import { Response, NextFunction } from 'express';
import { Cart } from '../models/Cart';
import { Product } from '../models/Product';
import { AuthRequest } from '../middleware/auth';
import { CustomError } from '../middleware/errorHandler';

export const getCart = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        let cart = await Cart.findOne({ user: req.user.id })
            .populate('items.product', 'name price images slug');

        if (!cart) {
            cart = await Cart.create({
                user: req.user.id,
                items: []
            });
        }

        res.json({
            success: true,
            data: cart
        });
    } catch (error) {
        next(error);
    }
};

export const addToCart = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { productId, quantity = 1 } = req.body;

        // Validate product
        const product = await Product.findById(productId);
        if (!product || !product.isActive || !product.isApproved) {
            const error: CustomError = new Error('Product not available');
            error.statusCode = 400;
            throw error;
        }

        // Check stock
        if (product.trackQuantity && product.quantity < quantity && !product.allowBackorder) {
            const error: CustomError = new Error('Insufficient stock');
            error.statusCode = 400;
            throw error;
        }

        // Get or create cart
        let cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            cart = new Cart({
                user: req.user.id,
                items: []
            });
        }

        // Check if product already in cart
        const existingItemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (existingItemIndex > -1) {
            // Update quantity
            cart.items[existingItemIndex].quantity += quantity;
            cart.items[existingItemIndex].price = product.price;
        } else {
            // Add new item
            cart.items.push({
                product: productId,
                quantity,
                price: product.price
            });
        }

        await cart.save();
        await cart.populate('items.product', 'name price images slug');

        res.json({
            success: true,
            message: 'Product added to cart',
            data: cart
        });
    } catch (error) {
        next(error);
    }
};

export const updateCartItem = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        if (quantity < 0) {
            const error: CustomError = new Error('Invalid quantity');
            error.statusCode = 400;
            throw error;
        }

        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            const error: CustomError = new Error('Cart not found');
            error.statusCode = 404;
            throw error;
        }

        if (quantity === 0) {
            // Remove item from cart
            cart.items = cart.items.filter(
                item => item.product.toString() !== productId
            );
        } else {
            // Update quantity
            const itemIndex = cart.items.findIndex(
                item => item.product.toString() === productId
            );

            if (itemIndex === -1) {
                const error: CustomError = new Error('Product not in cart');
                error.statusCode = 404;
                throw error;
            }

            // Check stock
            const product = await Product.findById(productId);
            if (product && product.trackQuantity &&
                product.quantity < quantity && !product.allowBackorder) {
                const error: CustomError = new Error('Insufficient stock');
                error.statusCode = 400;
                throw error;
            }

            cart.items[itemIndex].quantity = quantity;
        }

        await cart.save();
        await cart.populate('items.product', 'name price images slug');

        res.json({
            success: true,
            message: 'Cart updated',
            data: cart
        });
    } catch (error) {
        next(error);
    }
};

export const removeFromCart = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { productId } = req.params;

        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            const error: CustomError = new Error('Cart not found');
            error.statusCode = 404;
            throw error;
        }

        cart.items = cart.items.filter(
            item => item.product.toString() !== productId
        );

        await cart.save();
        await cart.populate('items.product', 'name price images slug');

        res.json({
            success: true,
            message: 'Product removed from cart',
            data: cart
        });
    } catch (error) {
        next(error);
    }
};

export const clearCart = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id });
        if (cart) {
            cart.items = [];
            await cart.save();
        }

        res.json({
            success: true,
            message: 'Cart cleared'
        });
    } catch (error) {
        next(error);
    }
};