import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProductForm } from '../../components/products/ProductForm.tsx';
import { productService } from '../../services/product.service.ts';
import type {Product, ProductFormData} from '../../types/product.types.ts';
import { useToast } from '../../components/ui/use-toast.tsx';
import { Loader2, ArrowLeft } from 'lucide-react';

export const EditProduct: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        if (id) {
            loadProduct();
        }
    }, [id]);

    const loadProduct = async () => {
        try {
            const data = await productService.getProductById(id!);
            setProduct(data);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load product',
                variant: 'destructive',
            });
            navigate('/vendor/products');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (data: ProductFormData, images: File[]) => {
        try {
            await productService.updateProduct(id!, data, images);
            toast({
                title: 'Success',
                description: 'Product updated successfully',
            });
            navigate('/vendor/products');
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update product',
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

    if (!product) {
        return null;
    }

    const formData: ProductFormData = {
        name: product.name,
        description: product.description,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        cost: product.cost,
        sku: product.sku,
        barcode: product.barcode,
        trackQuantity: product.trackQuantity,
        quantity: product.quantity,
        allowBackorder: product.allowBackorder,
        category: typeof product.category === 'string' ? product.category : product.category._id,
        brand: product.brand,
        weight: product.weight,
        dimensions: product.dimensions,
        tags: product.tags,
        specifications: product.specifications,
        isActive: product.isActive,
    };

    return (
        <div className="max-w-4xl mx-auto">
        <div className="mb-6">
        <button
            onClick={() => navigate('/vendor/products')}
    className="flex items-center text-sm text-gray-600 hover:text-gray-900"
    >
    <ArrowLeft className="h-4 w-4 mr-1" />
        Back to products
    </button>
    <h1 className="text-3xl font-bold mt-2">Edit Product</h1>
    </div>

    <ProductForm initialData={formData} onSubmit={handleSubmit} />
    </div>
);
};