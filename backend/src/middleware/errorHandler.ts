import { Request, Response, NextFunction } from 'express';

export interface CustomError extends Error {
    statusCode?: number;
    errors?: any;
}

export const errorHandler = (
    err: CustomError,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        message,
        errors: err.errors,
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
    });
};