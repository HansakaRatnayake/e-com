import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import type {User, LoginCredentials, RegisterData, AuthContextType} from '../types/auth.types';
import { toast } from '../components/ui/use-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Check if user is authenticated on mount
    useEffect(() => {
        const checkAuth = async () => {
            const accessToken = localStorage.getItem('accessToken');
            if (accessToken) {
                try {
                    const userData = await authService.getProfile();
                    setUser(userData);
                } catch (error) {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = useCallback(async (credentials: LoginCredentials) => {
        try {
            const response = await authService.login(credentials);
            const { user, tokens } = response.data;

            localStorage.setItem('accessToken', tokens.accessToken);
            localStorage.setItem('refreshToken', tokens.refreshToken);

            setUser(user);

            toast({
                title: 'Success',
                description: 'Logged in successfully',
            });

            // Redirect based on role
            switch (user.role) {
                case 'admin':
                    navigate('/admin/dashboard');
                    break;
                case 'vendor':
                    navigate('/vendor/dashboard');
                    break;
                default:
                    navigate('/');
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Login failed',
                variant: 'destructive',
            });
            throw error;
        }
    }, [navigate]);

    const register = useCallback(async (data: RegisterData) => {
        try {
            const response = await authService.register(data);
            const { user, tokens } = response.data;

            localStorage.setItem('accessToken', tokens.accessToken);
            localStorage.setItem('refreshToken', tokens.refreshToken);

            setUser(user);

            toast({
                title: 'Success',
                description: user.role === 'vendor'
                    ? 'Registration successful! Your account is pending approval.'
                    : 'Registration successful!',
            });

            // Redirect based on role
            if (user.role === 'vendor' && !user.isApproved) {
                navigate('/pending-approval');
            } else {
                navigate('/');
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Registration failed',
                variant: 'destructive',
            });
            throw error;
        }
    }, [navigate]);

    const logout = useCallback(async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setUser(null);
            navigate('/login');

            toast({
                title: 'Success',
                description: 'Logged out successfully',
            });
        }
    }, [navigate]);

    const value: AuthContextType = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};