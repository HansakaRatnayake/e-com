import { Router } from 'express';
import * as categoryController from '../controllers/CategoryController';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createCategorySchema, updateCategorySchema } from '../utils/ProductValidation';

const router = Router();

// Public routes
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);

// Admin routes
router.post(
    '/',
    authenticate,
    authorize('admin'),
    validate(createCategorySchema),
    categoryController.createCategory
);

router.put(
    '/:id',
    authenticate,
    authorize('admin'),
    validate(updateCategorySchema),
    categoryController.updateCategory
);

router.delete(
    '/:id',
    authenticate,
    authorize('admin'),
    categoryController.deleteCategory
);

export default router;
