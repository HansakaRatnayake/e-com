import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartService } from '../services/cart.service';
import type {Cart} from '../types/cart.types';
import { useAuth } from './AuthContext';
import { useToast } from '../components/ui/use-toast';

interface CartContextType {
    cart: Cart | null;
    loading: boolean;
    itemCount: number;
    addToCart: (productId: string, quantity?: number) => Promise<void>;
    updateQuantity: (productId: string, quantity: number) => Promise<void>;
    removeFromCart: (productId: string) => Promise<void>;
    clearCart: () => Promise<void>;
    refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(false);
    const { isAuthenticated } = useAuth();
    const { toast } = useToast();

    const loadCart = useCallback(async () => {
        if (!isAuthenticated) {
            setCart(null);
            return;
        }

        try {
            setLoading(true);
            const data = await cartService.getCart();
            setCart(data);
        } catch (error) {
            console.error('Failed to load cart:', error);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        loadCart();
    }, [loadCart]);

    const addToCart = async (productId: string, quantity: number = 1) => {
        try {
            const updatedCart = await cartService.addToCart(productId, quantity);
            setCart(updatedCart);
            toast({
                title: 'Success',
                description: 'Product added to cart',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to add to cart',
                variant: 'destructive',
            });
        }
    };

    const updateQuantity = async (productId: string, quantity: number) => {
        try {
            const updatedCart = await cartService.updateCartItem(productId, quantity);
            setCart(updatedCart);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to update cart',
                variant: 'destructive',
            });
        }
    };

    const removeFromCart = async (productId: string) => {
        try {
            const updatedCart = await cartService.removeFromCart(productId);
            setCart(updatedCart);
            toast({
                title: 'Success',
                description: 'Product removed from cart',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to remove from cart',
                variant: 'destructive',
            });
        }
    };

    const clearCart = async () => {
        try {
            await cartService.clearCart();
            setCart(null);
            toast({
                title: 'Success',
                description: 'Cart cleared',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to clear cart',
                variant: 'destructive',
            });
        }
    };

    const itemCount = cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;

    const value: CartContextType = {
        cart,
        loading,
        itemCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: loadCart,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};