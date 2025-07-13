export interface User {
    id: string;
    email: string;
    role: 'buyer' | 'vendor' | 'admin';
    profile: {
        firstName: string;
        lastName: string;
        phone?: string;
        avatar?: string;
    };
    isApproved: boolean;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'buyer' | 'vendor';
    phone?: string;
}

export interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

export interface Address {
    _id?: string;
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    isDefault: boolean;
}