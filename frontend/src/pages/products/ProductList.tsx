import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../../services/product.service';
import type {Product, Category, ProductFilters} from '../../types/product.types';
import { ProductCard } from '../../components/products/ProductCard';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Loader2, Search, Filter } from 'lucide-react';
import { useToast } from '../../components/ui/use-toast';

export const ProductList: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const { toast } = useToast();

    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        category: searchParams.get('category') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        sort: searchParams.get('sort') || '-createdAt',
        page: parseInt(searchParams.get('page') || '1'),
    });

    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 20,
    });

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        loadProducts();
    }, [filters]);

    const loadCategories = async () => {
        try {
            const data = await productService.getCategories({ isActive: true });
            setCategories(data);
        } catch (error) {
            console.error('Failed to load categories:', error);
        }
    };

    const loadProducts = async () => {
        setLoading(true);
        try {
            const requestFilters: ProductFilters = {
                ...filters,
                minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
                maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
                isActive: true,
                isApproved: true,
            };

            const response = await productService.getProducts(requestFilters);
            setProducts(response.data.products);
            setPagination(response.data.pagination);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load products.'+ error,
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const updateFilter = (key: string, value: string) => {
        const newFilters = { ...filters, [key]: value, page: 1 };
        setFilters(newFilters);

        // Update URL params
        const params = new URLSearchParams();
        Object.entries(newFilters).forEach(([k, v]) => {
            if (v && v !== '-createdAt' && v !== '1') {
                params.set(k, v.toString());
            }
        });
        setSearchParams(params);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        loadProducts();
    };

    const handleAddToCart = (product: Product) => {
        // TODO: Implement cart functionality
        toast({
            title: 'Added to cart',
            description: `${product.name} has been added to your cart`,
        });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Products</h1>

            {/* Filters */}
            <div className="mb-8 space-y-4">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="flex-1">
                        <Input
                            type="text"
                            placeholder="Search products..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="w-full"
                        />
                    </div>
                    <Button type="submit">
                        <Search className="h-4 w-4 mr-2" />
                        Search
                    </Button>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <Label>Category</Label>
                        <Select
                            value={filters.category}
                            onValueChange={(value) => updateFilter('category', value === 'all' ? '' : value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="All categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All categories</SelectItem>
                                {categories.map((category) => (
                                    <SelectItem key={category._id} value={category._id}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Min Price</Label>
                        <Input
                            type="number"
                            placeholder="0"
                            value={filters.minPrice}
                            onChange={(e) => updateFilter('minPrice', e.target.value)}
                        />
                    </div>

                    <div>
                        <Label>Max Price</Label>
                        <Input
                            type="number"
                            placeholder="9999"
                            value={filters.maxPrice}
                            onChange={(e) => updateFilter('maxPrice', e.target.value)}
                        />
                    </div>

                    <div>
                        <Label>Sort By</Label>
                        <Select
                            value={filters.sort}
                            onValueChange={(value) => updateFilter('sort', value)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="-createdAt">Newest First</SelectItem>
                                <SelectItem value="createdAt">Oldest First</SelectItem>
                                <SelectItem value="price">Price: Low to High</SelectItem>
                                <SelectItem value="-price">Price: High to Low</SelectItem>
                                <SelectItem value="-ratings.average">Highest Rated</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500">No products found</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard
                                key={product._id}
                                product={product}
                                onAddToCart={handleAddToCart}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="mt-8 flex justify-center space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => updateFilter('page', (filters.page - 1).toString())}
                                disabled={filters.page === 1}
                            >
                                Previous
                            </Button>
                            <span className="flex items-center px-4">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
                            <Button
                                variant="outline"
                                onClick={() => updateFilter('page', (filters.page + 1).toString())}
                                disabled={filters.page === pagination.totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};