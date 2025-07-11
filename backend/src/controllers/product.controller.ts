import {Response,Request} from "express";
import {Product} from "../models/Product";

export const addProduct = async (
    req: Request,
    res: Response,
    // next: NextFunction
) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json({ success: true, message: 'Product saved successfully', data: newProduct });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Failed to save product', error });
    }
}

export const getAllProducts = async (_req: Request, res: Response) => {
    console.log("Getting All Products..");
    try{
        const products = await Product.find();
        res.status(200).json({
            success: true,
            data: {
                data: products,
            }
        });
    }catch(err){
        res.status(500).json({
                success: false,
                message: 'Failed To Fetch Products..',
                err
            });
    }
}

export const removeProduct = async (
    req: Request,
    res: Response,
    // next: NextFunction
): Promise<void> => {
    const { _id } = req.body;

    if (!_id) {
        res.status(400).json({ success: false, message: 'Product ID is required for deletion' });
        return;
    }

    try {
        const deletedProduct = await Product.findByIdAndDelete(_id);
        if (!deletedProduct) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }

        res.status(200).json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Failed to delete product', error });
    }
}

export const updateProduct = async (
    req: Request,
    res: Response,
    // next: NextFunction
): Promise<void> => {
    const { _id, ...updateData } = req.body;

    if (!_id) {
        res.status(400).json({ success: false, message: 'Product ID is required for update' });
        return;
    }

    try {
        const updatedProduct = await Product.findByIdAndUpdate(_id, updateData, { new: true });
        if (!updatedProduct) {
            res.status(404).json({ success: false, message: 'Product not found' });
            return;
        }

        res.status(200).json({ success: true, message: 'Product updated successfully', data: updatedProduct });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Failed to update product', error });
    }
}

export const getProductById = async (req: Request, res: Response) => {
    try{
        const {_id} = req.body;
        const product = await Product.findById(_id);
        res.status(200).json({
            success: true,
            data: product,
        })
    }catch(err){
        res.status(500).json({
            success: false,
            message: 'Failed to get product',
        })
    }
}