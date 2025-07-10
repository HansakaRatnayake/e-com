import { api } from '../lib/axios';
import type {LoginCredentials, RegisterData, AuthTokens, User} from '../types/auth.types';

interface AuthResponse {
    success: boolean;
    message: string;
    data: {
        user: User;
        tokens: AuthTokens;
    };
}

export const authService = {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/login', credentials);
        return response.data;
    },

    async register(data: RegisterData): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>('/auth/register', data);
        return response.data;
    },

    async logout(): Promise<void> {
        await api.post('/auth/logout');
    },

    async getProfile(): Promise<User> {
        const response = await api.get<{ success: boolean; data: User }>('/auth/profile');
        return response.data.data;
    },

    async refreshToken(refreshToken: string): Promise<AuthTokens> {
        const response = await api.post<{ success: boolean; data: AuthTokens }>('/auth/refresh', {
            refreshToken
        });
        return response.data.data;
    }
};