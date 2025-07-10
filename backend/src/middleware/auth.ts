import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { User } from '../models/User';

export interface AuthRequest extends Request {
    user?: any;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            res.status(401).json({
                success: false,
                message: 'No token provided'
            });
            return;
        }

        const decoded = verifyToken(token, process.env.JWT_SECRET!);
        const user = await User.findById(decoded.id).select('-password -refreshToken');

        if (!user) {
             res.status(401).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        req.user = user;
        next();
    } catch (error) {
         res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
        return;
    }
};

export const authorize = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
             res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }

        if (!roles.includes(req.user.role)) {
             res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
            return;
        }

        next();
    };
};