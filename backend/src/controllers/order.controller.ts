import { Response, NextFunction } from 'express';
import { Order } from '../models/Order';
import { Cart } from '../models/Cart';
import { Product } from '../models/Product';
import { AuthRequest } from '../middleware/auth';
import { CustomError } from '../middleware/errorHandler';

export const createOrder = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const {
            shippingAddress,
            billingAddress,
            paymentMethod,
            notes
        } = req.body;

        // Get user's cart
        const cart = await Cart.findOne({ user: req.user.id })
            .populate('items.product');

        if (!cart || cart.items.length === 0) {
            const error: CustomError = new Error('Cart is empty');
            error.statusCode = 400;
            throw error;
        }

        // Validate all products and check stock
        const orderItems = [];
        let subtotal = 0;

        for (const cartItem of cart.items) {
            const product = await Product.findById(cartItem.product)
                .populate('vendor', '_id');

            if (!product || !product.isActive || !product.isApproved) {
                const error: CustomError = new Error(`Product ${cartItem.product} is not available`);
                error.statusCode = 400;
                throw error;
            }

            // Check stock
            if (product.trackQuantity &&
                product.quantity < cartItem.quantity &&
                !product.allowBackorder) {
                const error: CustomError = new Error(`Insufficient stock for ${product.name}`);
                error.statusCode = 400;
                throw error;
            }

            orderItems.push({
                product: product._id,
                vendor: product.vendor,
                name: product.name,
                price: product.price,
                quantity: cartItem.quantity,
                image: product.featuredImage || product.images[0]
            });

            subtotal += product.price * cartItem.quantity;

            // Update product stock
            if (product.trackQuantity) {
                product.quantity -= cartItem.quantity;
                await product.save();
            }
        }

        // Calculate order totals
        const tax = subtotal * 0.1; // 10% tax
        const shipping = subtotal > 50 ? 0 : 10; // Free shipping over $50
        const totalAmount = subtotal + tax + shipping;

        // Create order
        const order = new Order({
            buyer: req.user.id,
            items: orderItems,
            subtotal,
            tax,
            shipping,
            totalAmount,
            shippingAddress,
            billingAddress: billingAddress || shippingAddress,
            paymentMethod,
            notes,
            status: 'pending',
            paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending'
        });

        await order.save();

        // Clear cart
        cart.items = [];
        await cart.save();

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: order
        });
    } catch (error) {
        next(error);
    }
};

export const getOrders = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const query: any = {};

        // Filter by user role
        if (req.user.role === 'buyer') {
            query.buyer = req.user.id;
        } else if (req.user.role === 'vendor') {
            query['items.vendor'] = req.user.id;
        }

        // Filter by status
        if (status) {
            query.status = status;
        }

        const totalItems = await Order.countDocuments(query);
        const totalPages = Math.ceil(totalItems / Number(limit));

        const orders = await Order.find(query)
            .populate('buyer', 'email profile')
            .sort('-createdAt')
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));

        res.json({
            success: true,
            data: {
                orders,
                pagination: {
                    currentPage: Number(page),
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

export const getOrderById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const order:any = await Order.findById(req.params.id)
            .populate('buyer', 'email profile')
            .populate('items.product', 'name slug images');

        if (!order) {
            const error: CustomError = new Error('Order not found');
            error.statusCode = 404;
            throw error;
        }

        // Check access permissions
        if (req.user.role === 'buyer' && order.buyer._id.toString() !== req.user.id) {
            const error: CustomError = new Error('Unauthorized');
            error.statusCode = 403;
            throw error;
        }

        if (req.user.role === 'vendor') {
            const hasVendorItem = order.items.some(
                (item : any) => item.vendor.toString() === req.user.id
            );
            if (!hasVendorItem) {
                const error: CustomError = new Error('Unauthorized');
                error.statusCode = 403;
                throw error;
            }
        }

        res.json({
            success: true,
            data: order
        });
    } catch (error) {
        next(error);
    }
};

export const updateOrderStatus = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            const error: CustomError = new Error('Order not found');
            error.statusCode = 404;
            throw error;
        }

        // Only admin can update order status
        if (req.user.role !== 'admin') {
            const error: CustomError = new Error('Unauthorized');
            error.statusCode = 403;
            throw error;
        }

        // Update status
        order.status = status;

        // Update timestamps based on status
        if (status === 'delivered') {
            order.deliveredAt = new Date();
            order.paymentStatus = 'paid';
        } else if (status === 'cancelled') {
            order.cancelledAt = new Date();
            // Restore product stock
            for (const item of order.items) {
                const product = await Product.findById(item.product);
                if (product && product.trackQuantity) {
                    product.quantity += item.quantity;
                    await product.save();
                }
            }
        }

        await order.save();

        res.json({
            success: true,
            message: 'Order status updated',
            data: order
        });
    } catch (error) {
        next(error);
    }
};

export const cancelOrder = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const { reason } = req.body;
        const order : any = await Order.findById(req.params.id);

        if (!order) {
            const error: CustomError = new Error('Order not found');
            error.statusCode = 404;
            throw error;
        }

        // Check if user can cancel this order
        if (order.buyer.toString() !== req.user.id && req.user.role !== 'admin') {
            const error: CustomError = new Error('Unauthorized');
            error.statusCode = 403;
            throw error;
        }

        // Check if order can be cancelled
        if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
            const error: CustomError = new Error('Order cannot be cancelled');
            error.statusCode = 400;
            throw error;
        }

        // Cancel order
        order.status = 'cancelled';
        order.cancelledAt = new Date();
        order.cancelReason = reason;

        // Restore product stock
        for (const item of order.items) {
            const product = await Product.findById(item.product);
            if (product && product.trackQuantity) {
                product.quantity += item.quantity;
                await product.save();
            }
        }

        await order.save();

        res.json({
            success: true,
            message: 'Order cancelled successfully',
            data: order
        });
    } catch (error) {
        next(error);
    }
};