import { Router } from "express";
import { createSubCategory, deleteSubCategory, getAllSubCategories, getFilteredSubCategories, getSubCategory, updateSubCategory } from "../controllers/subCategoryControllers.js";
import validation from '../middlewares/validation.js';
import {subCategorySchema} from '../validation/index.js';
import isAuth from '../middlewares/authentication.js';
import Authorization from '../middlewares/Authorization.js';

// descruct the schema 
const router = Router();

router.use(isAuth, Authorization('admin'));
router.post('/', validation(subCategorySchema.createSubCategory),createSubCategory);
router.get('/', getAllSubCategories)
router.get('/filtered', getFilteredSubCategories);

router.get('/:id', validation(subCategorySchema.getSubCategory),  getSubCategory);
router.put('/:id', validation(subCategorySchema.updateSubCategory),updateSubCategory);
router.delete('/:id', validation(subCategorySchema.deleteSubCategory),deleteSubCategory);

export default router