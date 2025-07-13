import { api } from '../lib/axios';
import type {Order, CreateOrderData} from '../types/order.types';

interface OrderResponse {
    success: boolean;
    message?: string;
    data: Order;
}

interface OrdersResponse {
    success: boolean;
    data: {
        orders: Order[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
        };
    };
}

export const orderService = {
    async createOrder(data: CreateOrderData): Promise<Order> {
        const response = await api.post<OrderResponse>('/orders', data);
        return response.data.data;
    },

    async getOrders(params?: {
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<OrdersResponse['data']> {
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.append('status', params.status);
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());

        const response = await api.get<OrdersResponse>(`/orders?${queryParams}`);
        return response.data.data;
    },

    async getOrderById(id: string): Promise<Order> {
        const response = await api.get<OrderResponse>(`/orders/${id}`);
        return response.data.data;
    },

    async cancelOrder(id: string, reason: string): Promise<Order> {
        const response = await api.post<OrderResponse>(`/orders/${id}/cancel`, {
            reason
        });
        return response.data.data;
    }
};
