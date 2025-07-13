import { api } from '../lib/axios';
import type {Cart} from '../types/cart.types';

interface CartResponse {
    success: boolean;
    message?: string;
    data: Cart;
}

export const cartService = {
    async getCart(): Promise<Cart> {
        const response = await api.get<CartResponse>('/cart');
        return response.data.data;
    },

    async addToCart(productId: string, quantity: number = 1): Promise<Cart> {
        const response = await api.post<CartResponse>('/cart/add', {
            productId,
            quantity
        });
        return response.data.data;
    },

    async updateCartItem(productId: string, quantity: number): Promise<Cart> {
        const response = await api.put<CartResponse>(`/cart/items/${productId}`, {
            quantity
        });
        return response.data.data;
    },

    async removeFromCart(productId: string): Promise<Cart> {
        const response = await api.delete<CartResponse>(`/cart/items/${productId}`);
        return response.data.data;
    },

    async clearCart(): Promise<void> {
        await api.delete('/cart/clear');
    }
};