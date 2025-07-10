import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../context/AuthContext.tsx';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Loader2 } from 'lucide-react';

const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().optional(),
    role: z.enum(['buyer', 'vendor']),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
    const { register: registerUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState<'buyer' | 'vendor'>('buyer');

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            role: 'buyer',
        },
    });

    const onSubmit = async (data: RegisterFormData) => {
        setIsLoading(true);
        try {
            const { confirmPassword, ...registerData } = data;
            await registerUser(registerData);
        } catch (error) {
            console.error('Registration error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Or{' '}
                        <Link
                            to="/login"
                            className="font-medium text-primary hover:text-primary/90"
                        >
                            sign in to your existing account
                        </Link>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    {/* Role Selection */}
                    <div className="flex justify-center space-x-4">
                        <Button
                            type="button"
                            variant={selectedRole === 'buyer' ? 'default' : 'outline'}
                            onClick={() => {
                                setSelectedRole('buyer');
                                register('role', { value: 'buyer' });
                            }}
                        >
                            I'm a Buyer
                        </Button>
                        <Button
                            type="button"
                            variant={selectedRole === 'vendor' ? 'default' : 'outline'}
                            onClick={() => {
                                setSelectedRole('vendor');
                                register('role', { value: 'vendor' });
                            }}
                        >
                            I'm a Vendor
                        </Button>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="firstName">First name</Label>
                                <Input
                                    id="firstName"
                                    type="text"
                                    {...register('firstName')}
                                    className={errors.firstName ? 'border-red-500' : ''}
                                />
                                {errors.firstName && (
                                    <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="lastName">Last name</Label>
                                <Input
                                    id="lastName"
                                    type="text"
                                    {...register('lastName')}
                                    className={errors.lastName ? 'border-red-500' : ''}
                                />
                                {errors.lastName && (
                                    <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                autoComplete="email"
                                {...register('email')}
                                className={errors.email ? 'border-red-500' : ''}
                            />
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="phone">Phone number (optional)</Label>
                            <Input
                                id="phone"
                                type="tel"
                                {...register('phone')}
                                className={errors.phone ? 'border-red-500' : ''}
                            />
                            {errors.phone && (
                                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                autoComplete="new-password"
                                {...register('password')}
                                className={errors.password ? 'border-red-500' : ''}
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="confirmPassword">Confirm password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                {...register('confirmPassword')}
                                className={errors.confirmPassword ? 'border-red-500' : ''}
                            />
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                            )}
                        </div>
                    </div>

                    {selectedRole === 'vendor' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                            <p className="text-sm text-blue-800">
                                <strong>Note:</strong> Vendor accounts require admin approval before you can start selling.
                            </p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating account...
                            </>
                        ) : (
                            'Create account'
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
};