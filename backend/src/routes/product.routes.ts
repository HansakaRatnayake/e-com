import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { validate } from '../middleware/validate';
import {productSchema} from '../utils/validation';
import { authenticate } from '../middleware/auth';

const router = Router();
console.log('Product Routes....')
router.get('/getAll', productController.getAllProducts);
router.get('/getProductById', productController.getProductById);
router.post('/save', validate(productSchema), productController.addProduct);
router.post('/update', validate(productSchema), productController.updateProduct);
router.post('/delete', authenticate, productController.removeProduct);

export default router;