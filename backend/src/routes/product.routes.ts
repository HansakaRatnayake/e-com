import { Router } from 'express';
import * as productController from '../controllers/ProductController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createProductSchema, updateProductSchema } from '../utils/ProductValidation';
import { uploadProductImages } from '../utils/multer';

const router = Router();

// Public routes
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.get('/slug/:slug', productController.getProductBySlug);

// Vendor routes
router.post(
    '/',
    authenticate,
    authorize('vendor', 'admin'),
    uploadProductImages,
    validate(createProductSchema),
    productController.createProduct
);

router.get(
    '/vendor/products',
    authenticate,
    authorize('vendor', 'admin'),
    productController.getVendorProducts
);

router.put(
    '/:id',
    authenticate,
    authorize('vendor', 'admin'),
    uploadProductImages,
    validate(updateProductSchema),
    productController.updateProduct
);

router.delete(
    '/:id',
    authenticate,
    authorize('vendor', 'admin'),
    productController.deleteProduct
);

export default router;