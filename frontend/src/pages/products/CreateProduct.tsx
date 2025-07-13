import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductForm } from '../../components/products/ProductForm.tsx';
import { productService } from '../../services/product.service.ts';
import type {ProductFormData} from '../../types/product.types.ts';
import { useToast } from '../../components/ui/use-toast.tsx';
import { ArrowLeft } from 'lucide-react';

export const CreateProduct: React.FC = () => {
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSubmit = async (data: ProductFormData, images: File[]) => {
        try {
            await productService.createProduct(data, images);
            toast({
                title: 'Success',
                description: 'Product created successfully. It will be visible after admin approval.',
            });
            navigate('/vendor/products');
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to create product.' + error,
                variant: 'destructive',
            });
        }
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
                <h1 className="text-3xl font-bold mt-2">Create New Product</h1>
            </div>

            <ProductForm onSubmit={handleSubmit} />
        </div>
    );
};