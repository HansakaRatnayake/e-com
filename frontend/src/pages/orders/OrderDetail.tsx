import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '../../services/order.service';
import type {Order} from '../../types/order.types';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { useToast } from '../../components/ui/use-toast';
import {
    Loader2,
    Package,
    Truck,
    CreditCard,
    Calendar,
    MapPin,
    ArrowLeft
} from 'lucide-react';

export const OrderDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (id) {
            loadOrder();
        }
    }, [id]);

    const loadOrder = async () => {
        try {
            const data = await orderService.getOrderById(id!);
            setOrder(data);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load order.' +error,
                variant: 'destructive',
            });
            navigate('/orders');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!order || !window.confirm('Are you sure you want to cancel this order?')) {
            return;
        }

        try {
            const reason = window.prompt('Please provide a reason for cancellation:');
            if (!reason) return;

            await orderService.cancelOrder(order._id, reason);
            toast({
                title: 'Success',
                description: 'Order cancelled successfully',
            });
            loadOrder();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to cancel order',
                variant: 'destructive',
            });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!order) {
        return null;
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const canCancel = ['pending', 'confirmed'].includes(order.status);

    return (
        <div className="container mx-auto px-4 py-8">
            <button
                onClick={() => navigate('/orders')}
                className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to orders
            </button>

            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Order {order.orderNumber}</h1>
                        <p className="text-gray-600 mt-1">
                            Placed on {formatDate(order.createdAt)}
                        </p>
                    </div>
                    {canCancel && (
                        <Button variant="destructive" onClick={handleCancelOrder}>
                            Cancel Order
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Package className="h-5 w-5 mr-2" />
                                    Order Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4">
                                    <Badge className="text-lg px-4 py-1">
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </Badge>
                                    {order.trackingNumber && (
                                        <p className="text-sm text-gray-600">
                                            Tracking: {order.trackingNumber}
                                        </p>
                                    )}
                                </div>
                                {order.estimatedDelivery && (
                                    <p className="mt-2 text-sm text-gray-600">
                                        Estimated delivery: {formatDate(order.estimatedDelivery)}
                                    </p>
                                )}
                                {order.cancelledAt && (
                                    <div className="mt-4 p-4 bg-red-50 rounded">
                                        <p className="text-sm text-red-800">
                                            Cancelled on {formatDate(order.cancelledAt)}
                                        </p>
                                        {order.cancelReason && (
                                            <p className="text-sm text-red-600 mt-1">
                                                Reason: {order.cancelReason}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Order Items */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Items</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {order.items.map((item, index) => (
                                        <div key={index}>
                                            <div className="flex gap-4">
                                                <img
                                                    src={item.image || '/placeholder.png'}
                                                    alt={item.name}
                                                    className="w-20 h-20 object-cover rounded"
                                                />
                                                <div className="flex-1">
                                                    <h4 className="font-medium">{item.name}</h4>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {formatPrice(item.price)} x {item.quantity}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium">
                                                        {formatPrice(item.price * item.quantity)}
                                                    </p>
                                                </div>
                                            </div>
                                            {index < order.items.length - 1 && <Separator className="mt-4" />}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Shipping Address */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <MapPin className="h-5 w-5 mr-2" />
                                    Shipping Address
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <address className="not-italic">
                                    <p>{order.buyer.profile.firstName} {order.buyer.profile.lastName}</p>
                                    <p>{order.shippingAddress.street}</p>
                                    <p>
                                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                                    </p>
                                    <p>{order.shippingAddress.country}</p>
                                </address>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        {/* Payment Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <CreditCard className="h-5 w-5 mr-2" />
                                    Payment Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Payment Method</span>
                                        <span className="font-medium">
                      {order.paymentMethod === 'cod' ? 'Cash on Delivery' :
                          order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1)}
                    </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Payment Status</span>
                                        <Badge variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                                            {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Order Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Subtotal</span>
                                        <span>{formatPrice(order.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Shipping</span>
                                        <span>{formatPrice(order.shipping)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Tax</span>
                                        <span>{formatPrice(order.tax)}</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between font-medium text-lg">
                                        <span>Total</span>
                                        <span>{formatPrice(order.totalAmount)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Order Notes */}
                        {order.notes && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Order Notes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-600">{order.notes}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};