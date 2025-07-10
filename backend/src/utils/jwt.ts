import * as jwt from 'jsonwebtoken';
import { IUser } from '../types/user.types';

export const generateAccessToken = (user: IUser): string => {
    // @ts-ignore
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET!,
        {
            expiresIn: process.env.JWT_EXPIRE || '15m'
        }
    );
};

export const generateRefreshToken = (user: IUser): string => {
    // @ts-ignore
    return jwt.sign(
        {
            id: user._id
        },
        process.env.JWT_REFRESH_SECRET!,
        {
            expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'
        }
    );
};

export const verifyToken = (token: string, secret: string): any => {
    return jwt.verify(token, secret);
};