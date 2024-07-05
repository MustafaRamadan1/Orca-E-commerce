import { Router } from "express";
import { createCategory, deleteCategory, getAllCategories, getCategory, getFilteredCategories, updateCategory } from "../controllers/categoryControllers.js";
import isAuth from '../middlewares/authentication.js';
import validation from '../middlewares/validation.js';
import Schema from '../validation/index.js'
const router = Router();


router.post('/', validation(Schema.categorySchema.createCategory), createCategory);
router.get('/filtered', getFilteredCategories)
router.get('/',getAllCategories);
router.get('/:id', getCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);


export default router;