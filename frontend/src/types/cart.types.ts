import type {Product} from './product.types';

export interface CartItem {
    product: Product;
    quantity: number;
    price: number;
}

export interface Cart {
    _id: string;
    user: string;
    items: CartItem[];
    totalAmount: number;
    createdAt: string;
    updatedAt: string;
}