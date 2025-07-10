import { Document } from 'mongoose';

export interface IUser extends Document {
    email: string;
    password: string;
    role: 'buyer' | 'vendor' | 'admin';
    profile: {
        firstName: string;
        lastName: string;
        phone?: string;
        avatar?: string;
    };
    addresses: IAddress[];
    isVerified: boolean;
    isApproved: boolean;
    refreshToken?: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IAddress {
    _id?: string;
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    isDefault: boolean;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}