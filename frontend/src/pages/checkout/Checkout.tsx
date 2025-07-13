import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/order.service';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Textarea } from '../../components/ui/textarea';
import { useToast } from '../../components/ui/use-toast';
import { Loader2, CreditCard, Truck, ShoppingBag } from 'lucide-react';
import {Separator} from "@radix-ui/react-select";
import type {CreateOrderData} from "../../types/order.types.ts";
import type {Address} from "../../types/auth.types.ts";

const checkoutSchema = z.object({
    shippingAddress: z.object({
        street: z.string().min(1, 'Street address is required'),
        city: z.string().min(1, 'City is required'),
        state: z.string().min(1, 'State is required'),
        country: z.string().min(1, 'Country is required'),
        postalCode: z.string().min(1, 'Postal code is required'),
    }),
    sameAsBilling: z.boolean(),
    billingAddress: z.object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        postalCode: z.string().optional(),
    }),
    paymentMethod: z.enum(['card', 'paypal', 'cod']),
    notes: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export const Checkout: React.FC = () => {
    const navigate = useNavigate();
    const { cart, clearCart } = useCart();
    const { user } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<CheckoutFormData>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            sameAsBilling: true,
            paymentMethod: 'card',
        },
    });

    const sameAsBilling = watch('sameAsBilling');
    const paymentMethod = watch('paymentMethod');

    if (!cart || cart.items.length === 0) {
        navigate('/cart');
        return null;
    }

    const shipping = cart.totalAmount > 50 ? 0 : 10;
    const tax = cart.totalAmount * 0.1;
    const total = cart.totalAmount + shipping + tax;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    const onSubmit = async (data: CheckoutFormData) => {
        setIsLoading(true);
        try {
            const orderData : CreateOrderData = {
                shippingAddress: data.shippingAddress as Address,
                billingAddress: sameAsBilling ? data.shippingAddress as Address : data.billingAddress as Address,
                paymentMethod: data.paymentMethod,
                notes: data.notes,
            };

            const order = await orderService.createOrder(orderData);

            toast({
                title: 'Order placed successfully!',
                description: `Your order #${order.orderNumber} has been placed.`,
            });

            clearCart();
            navigate(`/orders/${order._id}`);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to place order',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Checkout</h1>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Shipping Address */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Truck className="h-5 w-5 mr-2" />
                                        Shipping Address
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="street">Street Address</Label>
                                        <Input
                                            id="street"
                                            {...register('shippingAddress.street')}
                                            className={errors.shippingAddress?.street ? 'border-red-500' : ''}
                                        />
                                        {errors.shippingAddress?.street && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {errors.shippingAddress.street.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="city">City</Label>
                                            <Input
                                                id="city"
                                                {...register('shippingAddress.city')}
                                                className={errors.shippingAddress?.city ? 'border-red-500' : ''}
                                            />
                                            {errors.shippingAddress?.city && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.shippingAddress.city.message}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="state">State</Label>
                                            <Input
                                                id="state"
                                                {...register('shippingAddress.state')}
                                                className={errors.shippingAddress?.state ? 'border-red-500' : ''}
                                            />
                                            {errors.shippingAddress?.state && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.shippingAddress.state.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="country">Country</Label>
                                            <Input
                                                id="country"
                                                {...register('shippingAddress.country')}
                                                className={errors.shippingAddress?.country ? 'border-red-500' : ''}
                                            />
                                            {errors.shippingAddress?.country && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.shippingAddress.country.message}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <Label htmlFor="postalCode">Postal Code</Label>
                                            <Input
                                                id="postalCode"
                                                {...register('shippingAddress.postalCode')}
                                                className={errors.shippingAddress?.postalCode ? 'border-red-500' : ''}
                                            />
                                            {errors.shippingAddress?.postalCode && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors.shippingAddress.postalCode.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="sameAsBilling"
                                            {...register('sameAsBilling')}
                                            className="rounded"
                                        />
                                        <Label htmlFor="sameAsBilling">
                                            Billing address same as shipping
                                        </Label>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Billing Address */}
                            {!sameAsBilling && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Billing Address</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label htmlFor="billingStreet">Street Address</Label>
                                            <Input
                                                id="billingStreet"
                                                {...register('billingAddress.street')}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="billingCity">City</Label>
                                                <Input
                                                    id="billingCity"
                                                    {...register('billingAddress.city')}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="billingState">State</Label>
                                                <Input
                                                    id="billingState"
                                                    {...register('billingAddress.state')}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="billingCountry">Country</Label>
                                                <Input
                                                    id="billingCountry"
                                                    {...register('billingAddress.country')}
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="billingPostalCode">Postal Code</Label>
                                                <Input
                                                    id="billingPostalCode"
                                                    {...register('billingAddress.postalCode')}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Payment Method */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <CreditCard className="h-5 w-5 mr-2" />
                                        Payment Method
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <RadioGroup
                                        value={paymentMethod}
                                        onValueChange={(value) => register('paymentMethod').onChange({ target: { value } })}
                                    >
                                        <div className="flex items-center space-x-2 p-4 border rounded-lg">
                                            <RadioGroupItem value="card" id="card" />
                                            <Label htmlFor="card" className="flex-1 cursor-pointer">
                                                <div>
                                                    <p className="font-medium">Credit/Debit Card</p>
                                                    <p className="text-sm text-gray-600">Pay securely with your card</p>
                                                </div>
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2 p-4 border rounded-lg">
                                            <RadioGroupItem value="paypal" id="paypal" />
                                            <Label htmlFor="paypal" className="flex-1 cursor-pointer">
                                                <div>
                                                    <p className="font-medium">PayPal</p>
                                                    <p className="text-sm text-gray-600">Pay with your PayPal account</p>
                                                </div>
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2 p-4 border rounded-lg">
                                            <RadioGroupItem value="cod" id="cod" />
                                            <Label htmlFor="cod" className="flex-1 cursor-pointer">
                                                <div>
                                                    <p className="font-medium">Cash on Delivery</p>
                                                    <p className="text-sm text-gray-600">Pay when you receive your order</p>
                                                </div>
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </CardContent>
                            </Card>

                            {/* Order Notes */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Order Notes (Optional)</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Textarea
                                        {...register('notes')}
                                        placeholder="Add any special instructions for your order..."
                                        rows={3}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <ShoppingBag className="h-5 w-5 mr-2" />
                                        Order Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        {cart.items.map((item) => (
                                            <div key={item.product._id} className="flex justify-between text-sm">
                        <span className="flex-1">
                          {item.product.name} x {item.quantity}
                        </span>
                                                <span>{formatPrice(item.price * item.quantity)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <Separator />
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Subtotal</span>
                                            <span>{formatPrice(cart.totalAmount)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Shipping</span>
                                            <span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
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
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        size="lg"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            'Place Order'
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};