import {api} from '../lib/axios';
import type {Product, ProductFormData, ProductFilters, Category} from '../types/product.types';

interface ProductsResponse {
    success: boolean;
    data: {
        products: Product[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    };
}

interface ProductResponse {
    success: boolean;
    data: Product;
    message?: string;
}

interface CategoriesResponse {
    success: boolean;
    data: Category[];
}

export const productService = {
    // Product methods
    async getProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined) {
                params.append(key, value.toString());
            }
        });

        const response = await api.get<ProductsResponse>(`/products?${params}`);
        return response.data;
    },

    async getProductById(id: string): Promise<Product> {
        const response = await api.get<ProductResponse>(`/products/${id}`);
        return response.data.data;
    },

    async getProductBySlug(slug: string): Promise<Product> {
        const response = await api.get<ProductResponse>(`/products/slug/${slug}`);
        return response.data.data;
    },

    async createProduct(data: ProductFormData, images: File[]): Promise<Product> {
        const formData = new FormData();

        // Append all product data
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined) {
                if (typeof value === 'object') {
                    formData.append(key, JSON.stringify(value));
                } else {
                    formData.append(key, value.toString());
                }
            }
        });

        // Append images
        images.forEach((image) => {
            formData.append('images', image);
        });

        const response = await api.post<ProductResponse>('/products', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data.data;
    },

    async deleteProduct(id: string): Promise<void> {
        await api.delete(`/products/${id}`);
    },

    async getVendorProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined) {
                params.append(key, value.toString());
            }
        });

        const response = await api.get<ProductsResponse>(`/products/vendor/products?${params}`);
        return response.data;
    },

    // Category methods
    async getCategories(params?: { parent?: string; isActive?: boolean }): Promise<Category[]> {
        const queryParams = new URLSearchParams();
        if (params?.parent !== undefined) {
            queryParams.append('parent', params.parent);
        }
        if (params?.isActive !== undefined) {
            queryParams.append('isActive', params.isActive.toString());
        }

        const response = await api.get<CategoriesResponse>(`/categories?${queryParams}`);
        return response.data.data;
    },

    async getCategoryById(id: string): Promise<Category> {
        const response = await api.get<{ success: boolean; data: Category }>(`/categories/${id}`);
        return response.data.data;
    },

    async createCategory(data: Partial<Category>): Promise<Category> {
        const response = await api.post<{ success: boolean; data: Category }>('/categories', data);
        return response.data.data;
    },

    async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
        const response = await api.put<{ success: boolean; data: Category }>(`/categories/${id}`, data);
        return response.data.data;
    },

    async deleteCategory(id: string): Promise<void> {
        await api.delete(`/categories/${id}`);
    },

    async updateProduct(id: string, data: Partial<ProductFormData>, newImages?: File[]): Promise<Product> {
        const formData = new FormData();

        // Append updated data
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined) {
                if (typeof value === 'object') {
                    formData.append(key, JSON.stringify(value));
                } else {
                    formData.append(key, value.toString());
                }
            }

        });

        // Append new images if any
        if (newImages && newImages.length > 0) {
            newImages.forEach((image) => {
                formData.append('images', image);
            });
        }

        const response = await api.put<ProductResponse>(`/products/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return response.data.data;
    }

};