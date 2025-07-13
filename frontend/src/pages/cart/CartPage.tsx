import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Separator } from '../../components/ui/separator';
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft } from 'lucide-react';

export const CartPage: React.FC = () => {
    const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
    const navigate = useNavigate();

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    if (!cart || cart.items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto text-center">
                    <ShoppingCart className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
                    <p className="text-gray-600 mb-8">
                        Looks like you haven't added any items to your cart yet.
                    </p>
                    <Button asChild>
                        <Link to="/products">Continue Shopping</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const shipping = cart.totalAmount > 50 ? 0 : 10;
    const tax = cart.totalAmount * 0.1;
    const total = cart.totalAmount + shipping + tax;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
                <button
                    onClick={() => navigate('/products')}
                    className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Continue Shopping
                </button>

                <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Cart Items ({cart.items.length})</CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        if (window.confirm('Are you sure you want to clear your cart?')) {
                                            clearCart();
                                        }
                                    }}
                                >
                                    Clear Cart
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {cart.items.map((item) => (
                                    <div key={item.product._id}>
                                        <div className="flex gap-4">
                                            <img
                                                src={item.product.images[0] || '/placeholder.png'}
                                                alt={item.product.name}
                                                className="w-24 h-24 object-cover rounded"
                                            />
                                            <div className="flex-1">
                                                <Link
                                                    to={`/products/${item.product.slug}`}
                                                    className="font-medium hover:text-primary"
                                                >
                                                    {item.product.name}
                                                </Link>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {formatPrice(item.price)} each
                                                </p>
                                                <div className="flex items-center gap-4 mt-3">
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() =>
                                                                updateQuantity(item.product._id, item.quantity - 1)
                                                            }
                                                            disabled={item.quantity <= 1}
                                                        >
                                                            <Minus className="h-3 w-3" />
                                                        </Button>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={item.quantity}
                                                            onChange={(e) =>
                                                                updateQuantity(
                                                                    item.product._id,
                                                                    parseInt(e.target.value) || 1
                                                                )
                                                            }
                                                            className="w-16 text-center border rounded"
                                                        />
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 w-8 p-0"
                                                            onClick={() =>
                                                                updateQuantity(item.product._id, item.quantity + 1)
                                                            }
                                                        >
                                                            <Plus className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => removeFromCart(item.product._id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">
                                                    {formatPrice(item.price * item.quantity)}
                                                </p>
                                            </div>
                                        </div>
                                        <Separator className="mt-4" />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Subtotal</span>
                                        <span>{formatPrice(cart.totalAmount)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Shipping</span>
                                        <span>
                      {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                    </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Tax</span>
                                        <span>{formatPrice(tax)}</span>
                                    </div>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-medium text-lg">
                                    <span>Total</span>
                                    <span>{formatPrice(total)}</span>
                                </div>
                                {shipping > 0 && (
                                    <p className="text-sm text-gray-600">
                                        Add {formatPrice(50 - cart.totalAmount)} more for free shipping
                                    </p>
                                )}
                                <Button className="w-full" size="lg" asChild>
                                    <Link to="/checkout">Proceed to Checkout</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};