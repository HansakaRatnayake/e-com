import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth';
import { CustomError } from '../middleware/errorHandler';

export const register = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, password, firstName, lastName, role, phone } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            const error: CustomError = new Error('User already exists');
            error.statusCode = 400;
            throw error;
        }

        // Create new user
        const user = new User({
            email,
            password,
            role: role || 'buyer',
            profile: {
                firstName,
                lastName,
                phone
            },
            isApproved: role === 'buyer' // Auto-approve buyers, vendors need admin approval
        });

        await user.save();

        // Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Save refresh token to database
        user.refreshToken = refreshToken;
        await user.save();

        // Send response
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                    profile: user.profile,
                    isApproved: user.isApproved
                },
                tokens: {
                    accessToken,
                    refreshToken
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        console.log('controller....')
        const { email, password } = req.body;

        // Find user and include password
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            const error: CustomError = new Error('Invalid credentials');
            error.statusCode = 401;
            throw error;
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            const error: CustomError = new Error('Invalid credentials');
            error.statusCode = 401;
            throw error;
        }

        // Check if vendor is approved
        if (user.role === 'vendor' && !user.isApproved) {
            const error: CustomError = new Error('Your vendor account is pending approval');
            error.statusCode = 403;
            throw error;
        }

        // Generate tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Save refresh token
        user.refreshToken = refreshToken;
        await user.save();

        // Send response
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    role: user.role,
                    profile: user.profile,
                    isApproved: user.isApproved
                },
                tokens: {
                    accessToken,
                    refreshToken
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

export const refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            const error: CustomError = new Error('Refresh token required');
            error.statusCode = 400;
            throw error;
        }

        // Verify refresh token
        const decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET!);

        // Find user and check refresh token
        const user = await User.findById(decoded.id);
        if (!user || user.refreshToken !== refreshToken) {
            const error: CustomError = new Error('Invalid refresh token');
            error.statusCode = 401;
            throw error;
        }

        // Generate new tokens
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);

        // Update refresh token
        user.refreshToken = newRefreshToken;
        await user.save();

        res.json({
            success: true,
            data: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            }
        });
    } catch (error) {
        next(error);
    }
};

export const logout = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = await User.findById(req.user.id);
        if (user) {
            user.refreshToken = undefined;
            await user.save();
        }

        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        next(error);
    }
};

export const getProfile = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = await User.findById(req.user.id).select('-password -refreshToken');

        if (!user) {
            const error: CustomError = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};