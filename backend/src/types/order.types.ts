import { Document } from 'mongoose';
import { IUser, IAddress } from './user.types';
import { IProduct } from './product.types';

export interface IOrderItem {
    product: IProduct['_id'];
    vendor: IUser['_id'];
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

export interface IOrder extends Document {
    orderNumber: string;
    buyer: IUser['_id'];
    items: IOrderItem[];
    subtotal: number;
    tax: number;
    shipping: number;
    totalAmount: number;
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    paymentMethod: 'card' | 'paypal' | 'cod';
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    paymentId?: string;
    shippingAddress: IAddress;
    billingAddress?: IAddress;
    notes?: string;
    trackingNumber?: string;
    estimatedDelivery?: Date;
    deliveredAt?: Date;
    cancelledAt?: Date;
    cancelReason?: string;
    createdAt: Date;
    updatedAt: Date;
}