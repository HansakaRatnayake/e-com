import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../services/product.service';
import type {Product} from '../../types/product.types';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../components/ui/use-toast';
import {
    Loader2,
    Plus,
    Edit,
    Trash2,
    Eye,
    Package,
    DollarSign,
    TrendingUp
} from 'lucide-react';

export const VendorProducts: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalProducts: 0,
        activeProducts: 0,
        pendingApproval: 0,
        outOfStock: 0,
    });
    const { toast } = useToast();

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const response = await productService.getVendorProducts();
            setProducts(response.data.products);

            // Calculate stats
            const stats = response.data.products.reduce(
                (acc, product) => ({
                    totalProducts: acc.totalProducts + 1,
                    activeProducts: acc.activeProducts + (product.isActive ? 1 : 0),
                    pendingApproval: acc.pendingApproval + (!product.isApproved ? 1 : 0),
                    outOfStock: acc.outOfStock + (product.trackQuantity && product.quantity === 0 ? 1 : 0),
                }),
                { totalProducts: 0, activeProducts: 0, pendingApproval: 0, outOfStock: 0 }
            );

            setStats(stats);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load products',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await productService.deleteProduct(id);
                toast({
                    title: 'Success',
                    description: 'Product deleted successfully',
                });
                loadProducts();
            } catch (error) {
                toast({
                    title: 'Error',
                    description: 'Failed to delete product',
                    variant: 'destructive',
                });
            }
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(price);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">My Products</h1>
                <Button asChild>
                    <Link to="/vendor/products/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Product
                    </Link>
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalProducts}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeProducts}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.pendingApproval}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.outOfStock}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Products Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Products</CardTitle>
                </CardHeader>
                <CardContent>
                    {products.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500 mb-4">You haven't added any products yet</p>
                            <Button asChild>
                                <Link to="/vendor/products/new">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Your First Product
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                <tr className="border-b">
                                    <th className="text-left p-4">Product</th>
                                    <th className="text-left p-4">Price</th>
                                    <th className="text-left p-4">Stock</th>
                                    <th className="text-left p-4">Status</th>
                                    <th className="text-left p-4">Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {products.map((product) => (
                                    <tr key={product._id} className="border-b">
                                        <td className="p-4">
                                            <div className="flex items-center space-x-3">
                                                <img
                                                    src={product.featuredImage || product.images[0] || '/placeholder.png'}
                                                    alt={product.name}
                                                    className="w-12 h-12 object-cover rounded"
                                                />
                                                <div>
                                                    <p className="font-medium">{product.name}</p>
                                                    <p className="text-sm text-gray-500">{product.sku}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p>{formatPrice(product.price)}</p>
                                            {product.compareAtPrice && (
                                                <p className="text-sm text-gray-500 line-through">
                                                    {formatPrice(product.compareAtPrice)}
                                                </p>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            {product.trackQuantity ? (
                                                <div>
                                                    <p className={product.quantity === 0 ? 'text-red-600' : ''}>
                                                        {product.quantity} in stock
                                                    </p>
                                                    {product.allowBackorder && product.quantity === 0 && (
                                                        <p className="text-sm text-yellow-600">Backorder allowed</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-gray-500">Not tracked</p>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="space-y-1">
                                                {!product.isApproved && (
                                                    <Badge variant="secondary">Pending Approval</Badge>
                                                )}
                                                {product.isActive ? (
                                                    <Badge variant="default">Active</Badge>
                                                ) : (
                                                    <Badge variant="outline">Inactive</Badge>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex space-x-2">
                                                <Button size="sm" variant="outline" asChild>
                                                    <Link to={`/products/${product.slug}`}>
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button size="sm" variant="outline" asChild>
                                                    <Link to={`/vendor/products/${product._id}/edit`}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleDelete(product._id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};