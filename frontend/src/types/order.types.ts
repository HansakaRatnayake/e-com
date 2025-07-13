import type {Address} from './auth.types';

export interface OrderItem {
    product: string;
    vendor: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

export interface Order {
    _id: string;
    orderNumber: string;
    buyer: {
        _id: string;
        email: string;
        profile: {
            firstName: string;
            lastName: string;
        };
    };
    items: OrderItem[];
    subtotal: number;
    tax: number;
    shipping: number;
    totalAmount: number;
    status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    paymentMethod: 'card' | 'paypal' | 'cod';
    paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
    paymentId?: string;
    shippingAddress: Address;
    billingAddress?: Address;
    notes?: string;
    trackingNumber?: string;
    estimatedDelivery?: string;
    deliveredAt?: string;
    cancelledAt?: string;
    cancelReason?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateOrderData {
    shippingAddress: Address;
    billingAddress?: Address;
    paymentMethod: 'card' | 'paypal' | 'cod';
    notes?: string;
}