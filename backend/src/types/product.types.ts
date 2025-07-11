import { Document } from 'mongoose';
import {IUser} from "./user.types";

export interface IProduct extends Document {
    name: string;
    description: string;
    price: number;
    discount?: number;
    stock: number;
    category: string;
    brand?: string;
    images?: string[];
    vendor: IUser;
    isApproved?: boolean;
    ratings?: number;
}

export interface IReview {
    user: IUser;
    comment: string;
    rating: number;
    createdAt: Date;
}