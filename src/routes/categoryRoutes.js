import { Router } from "express";
import { createCategory, deleteCategory, getAllCategories, getCategory, getFilteredCategories, updateCategory } from "../controllers/categoryControllers.js";
import isAuth from '../middlewares/authentication.js';
import authorization from '../middlewares/Authorization.js'
import validation from '../middlewares/validation.js';
import Schema from '../validation/index.js'
const router = Router();

router.use(isAuth, authorization('admin'));
router.post('/', validation(Schema.categorySchema.createCategory), createCategory);
router.get('/filtered', getFilteredCategories)
router.get('/',getAllCategories);
router.get('/:id', validation(Schema.categorySchema.getCategory),getCategory);
router.put('/:id', validation(Schema.categorySchema.updateCategory),updateCategory);
router.delete('/:id', validation(Schema.categorySchema.deleteCategory), deleteCategory);


export default router;