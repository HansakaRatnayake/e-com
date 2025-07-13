import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../services/order.service';
import type {Order} from '../../types/order.types';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../components/ui/use-toast';
import { Loader2, Package, Calendar, DollarSign } from 'lucide-react';

export const OrderList: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('');
    const { toast } = useToast();

    useEffect(() => {
        loadOrders();
    }, [statusFilter]);

    const loadOrders = async () => {
        try {
            const data = await orderService.getOrders({ status: statusFilter || undefined });
            setOrders(data.orders);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load orders.' + error,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'secondary';
            case 'confirmed':
            case 'processing':
                return 'default';
            case 'shipped':
                return 'default';
            case 'delivered':
                return 'default';
            case 'cancelled':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">My Orders</h1>

            {/* Filters */}
            <div className="mb-6 flex gap-2">
                <Button
                    variant={statusFilter === '' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('')}
                >
                    All
                </Button>
                <Button
                    variant={statusFilter === 'pending' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('pending')}
                >
                    Pending
                </Button>
                <Button
                    variant={statusFilter === 'processing' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('processing')}
                >
                    Processing
                </Button>
                <Button
                    variant={statusFilter === 'shipped' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('shipped')}
                >
                    Shipped
                </Button>
                <Button
                    variant={statusFilter === 'delivered' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setStatusFilter('delivered')}
                >
                    Delivered
                </Button>
            </div>

            {orders.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-12">
                        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No orders found</p>
                        <Button className="mt-4" asChild>
                            <Link to="/products">Start Shopping</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <Card key={order._id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg">
                                            Order {order.orderNumber}
                                        </CardTitle>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(order.createdAt)}
                      </span>
                                            <span className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                                                {formatPrice(order.totalAmount)}
                      </span>
                                        </div>
                                    </div>
                                    <Badge variant={getStatusColor(order.status)}>
                                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {order.items.slice(0, 2).map((item, index) => (
                                        <div key={index} className="flex items-center gap-2 text-sm">
                                            <span className="font-medium">{item.name}</span>
                                            <span className="text-gray-600">x {item.quantity}</span>
                                        </div>
                                    ))}
                                    {order.items.length > 2 && (
                                        <p className="text-sm text-gray-600">
                                            and {order.items.length - 2} more items...
                                        </p>
                                    )}
                                </div>
                                <div className="mt-4 flex justify-between items-center">
                                    <Button variant="outline" size="sm" asChild>
                                        <Link to={`/orders/${order._id}`}>View Details</Link>
                                    </Button>
                                    {order.trackingNumber && (
                                        <p className="text-sm text-gray-600">
                                            Tracking: {order.trackingNumber}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};