import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type {ProductFormData, Category} from '../../types/product.types';
import { productService } from '../../services/product.service';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useToast } from '../ui/use-toast';
import {Badge, Loader2, Upload, X} from 'lucide-react';

const productSchema = z.object({
    name: z.string().min(1, 'Product name is required'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    price: z.number().min(0, 'Price must be positive'),
    compareAtPrice: z.number().min(0).optional().or(z.literal('')),
    cost: z.number().min(0).optional().or(z.literal('')),
    sku: z.string().min(1, 'SKU is required'),
    barcode: z.string().optional(),
    trackQuantity: z.boolean(),
    quantity: z.number().int().min(0),
    allowBackorder: z.boolean(),
    category: z.string().min(1, 'Category is required'),
    brand: z.string().optional(),
    weight: z.number().min(0).optional().or(z.literal('')),
    tags: z.array(z.string()),
    isActive: z.boolean()
});

interface ProductFormProps {
    initialData?: Partial<ProductFormData>;
    onSubmit: (data: ProductFormData, images: File[]) => Promise<void>;
    isLoading?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
                                                            initialData,
                                                            onSubmit,
                                                            isLoading = false
                                                        }) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [images, setImages] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const { toast } = useToast();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors }
    } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            trackQuantity: true,
            quantity: 0,
            allowBackorder: false,
            tags: [],
            isActive: true,
            ...initialData
        }
    });

    const watchedTags = watch('tags');
    const trackQuantity = watch('trackQuantity');

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        // Create preview URLs for selected images
        const urls = images.map(file => URL.createObjectURL(file));
        setPreviewUrls(urls);

        // Cleanup URLs on unmount
        return () => {
            urls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [images]);

    const loadCategories = async () => {
        try {
            const data = await productService.getCategories({ isActive: true });
            setCategories(data);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to load categories',
                variant: 'destructive'
            });
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const validFiles = files.filter(file => {
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                toast({
                    title: 'Invalid file type',
                    description: `${file.name} is not a valid image file`,
                    variant: 'destructive'
                });
                return false;
            }
            if (file.size > 5 * 1024 * 1024) {
                toast({
                    title: 'File too large',
                    description: `${file.name} exceeds 5MB limit`,
                    variant: 'destructive'
                });
                return false;
            }
            return true;
        });

        setImages([...images, ...validFiles]);
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const addTag = () => {
        if (tagInput.trim() && !watchedTags.includes(tagInput.trim())) {
            setValue('tags', [...watchedTags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const removeTag = (tag: string) => {
        setValue('tags', watchedTags.filter(t => t !== tag));
    };

    const onFormSubmit = (data: ProductFormData) => {
        onSubmit(data, images);
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>Add your product details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="name">Product Name</Label>
                        <Input
                            id="name"
                            {...register('name')}
                            className={errors.name ? 'border-red-500' : ''}
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            rows={4}
                            {...register('description')}
                            className={errors.description ? 'border-red-500' : ''}
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="category">Category</Label>
                            <Select
                                value={watch('category')}
                                onValueChange={(value) => setValue('category', value)}
                            >
                                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(category => (
                                        <SelectItem key={category._id} value={category._id}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.category && (
                                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="brand">Brand (Optional)</Label>
                            <Input
                                id="brand"
                                {...register('brand')}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="price">Price</Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                {...register('price', { valueAsNumber: true })}
                                className={errors.price ? 'border-red-500' : ''}
                            />
                            {errors.price && (
                                <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="compareAtPrice">Compare at Price</Label>
                            <Input
                                id="compareAtPrice"
                                type="number"
                                step="0.01"
                                {...register('compareAtPrice', { valueAsNumber: true })}
                            />
                        </div>

                        <div>
                            <Label htmlFor="cost">Cost per Item</Label>
                            <Input
                                id="cost"
                                type="number"
                                step="0.01"
                                {...register('cost', { valueAsNumber: true })}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Inventory</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="sku">SKU</Label>
                            <Input
                                id="sku"
                                {...register('sku')}
                                className={errors.sku ? 'border-red-500' : ''}
                            />
                            {errors.sku && (
                                <p className="mt-1 text-sm text-red-600">{errors.sku.message}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="barcode">Barcode (Optional)</Label>
                            <Input
                                id="barcode"
                                {...register('barcode')}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="trackQuantity"
                                {...register('trackQuantity')}
                                className="rounded border-gray-300"
                            />
                            <Label htmlFor="trackQuantity">Track quantity</Label>
                        </div>

                        {trackQuantity && (
                            <>
                                <div>
                                    <Label htmlFor="quantity">Quantity</Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        {...register('quantity', { valueAsNumber: true })}
                                        className={errors.quantity ? 'border-red-500' : ''}
                                    />
                                    {errors.quantity && (
                                        <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
                                    )}
                                </div>

                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="allowBackorder"
                                        {...register('allowBackorder')}
                                        className="rounded border-gray-300"
                                    />
                                    <Label htmlFor="allowBackorder">Allow backorder when out of stock</Label>
                                </div>
                            </>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="weight">Weight (kg)</Label>
                        <Input
                            id="weight"
                            type="number"
                            step="0.01"
                            {...register('weight', { valueAsNumber: true })}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Images</CardTitle>
                    <CardDescription>Add up to 10 product images</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="images" className="cursor-pointer">
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400">
                                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                    <p className="mt-2 text-sm text-gray-600">
                                        Click to upload or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        PNG, JPG, GIF, WEBP up to 5MB
                                    </p>
                                </div>
                                <Input
                                    id="images"
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </Label>
                        </div>

                        {previewUrls.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {previewUrls.map((url, index) => (
                                    <div key={index} className="relative group">
                                        <img
                                            src={url}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-32 object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Tags</CardTitle>
                    <CardDescription>Add tags to help customers find your product</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addTag();
                                    }
                                }}
                                placeholder="Add a tag"
                            />
                            <Button type="button" onClick={addTag} variant="secondary">
                                Add
                            </Button>
                        </div>

                        {watchedTags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {watchedTags.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="pl-2">
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => removeTag(tag)}
                                            className="ml-2 hover:text-destructive"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Visibility</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            {...register('isActive')}
                            className="rounded border-gray-300"
                        />
                        <Label htmlFor="isActive">Active (Product visible in store)</Label>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline">
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        'Save Product'
                    )}
                </Button>
            </div>
        </form>
    );
};