import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext.tsx';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet.tsx';
import { Separator } from '../ui/separator.tsx';
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';

export const CartDrawer: React.FC = () => {
    const { cart, itemCount, updateQuantity, removeFromCart } = useCart();

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
    <ShoppingCart className="h-4 w-4" />
        {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                {itemCount}
                </span>
        )}
    </Button>
    </SheetTrigger>
    <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
            <SheetTitle>Shopping Cart ({itemCount} items)</SheetTitle>
    </SheetHeader>

    {cart && cart.items.length > 0 ? (
        <>
            <ScrollArea className="h-[calc(100vh-280px)] mt-4">
        <div className="space-y-4">
            {cart.items.map((item) => (
                    <div key={item.product._id} className="flex gap-4">
                <img
                    src={item.product.images[0] || '/placeholder.png'}
                alt={item.product.name}
                className="w-20 h-20 object-cover rounded"
                />
                <div className="flex-1">
                <h4 className="font-medium text-sm">{item.product.name}</h4>
                    <p className="text-sm text-gray-600">{formatPrice(item.price)}</p>
    <div className="flex items-center gap-2 mt-2">
    <Button
        size="sm"
        variant="outline"
        className="h-8 w-8 p-0"
        onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
        disabled={item.quantity <= 1}
        >
        <Minus className="h-3 w-3" />
            </Button>
            <span className="text-sm w-8 text-center">{item.quantity}</span>
        <Button
        size="sm"
        variant="outline"
        className="h-8 w-8 p-0"
        onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
    >
        <Plus className="h-3 w-3" />
            </Button>
            <Button
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0 ml-auto"
        onClick={() => removeFromCart(item.product._id)}
    >
        <Trash2 className="h-3 w-3" />
            </Button>
            </div>
            </div>
            </div>
    ))}
        </div>
        </ScrollArea>

        <div className="space-y-4 mt-4">
    <Separator />
    <div className="space-y-2">
    <div className="flex justify-between text-sm">
        <span>Subtotal</span>
        <span>{formatPrice(cart.totalAmount)}</span>
    </div>
    <div className="flex justify-between text-sm text-gray-600">
        <span>Shipping</span>
        <span>Calculated at checkout</span>
    </div>
    </div>
    <Separator />
    <div className="flex justify-between font-medium">
        <span>Total</span>
        <span>{formatPrice(cart.totalAmount)}</span>
    </div>
    <Button className="w-full" asChild>
    <Link to="/checkout">Proceed to Checkout</Link>
    </Button>
    <Button variant="outline" className="w-full" asChild>
    <Link to="/cart">View Cart</Link>
    </Button>
    </div>
    </>
    ) : (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
        <p className="text-gray-500 mb-4">Your cart is empty</p>
    <Button asChild>
    <Link to="/products">Continue Shopping</Link>
    </Button>
    </div>
    )}
    </SheetContent>
    </Sheet>
);
};