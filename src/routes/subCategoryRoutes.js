import { Router } from "express";
import { createSubCategory, deleteSubCategory, getAllSubCategories, getFilteredSubCategories, getSubCategory, updateSubCategory } from "../controllers/subCategoryControllers.js";
import validation from '../middlewares/validation.js';
import Schema from '../validation/index.js';

const router = Router();


router.post('/', validation(Schema.subCategorySchema.createSubCategory),createSubCategory);
router.get('/', getAllSubCategories)
router.get('/filtered', getFilteredSubCategories);

router.get('/:id', validation(Schema.subCategorySchema.getSubCategory),  getSubCategory);
router.put('/:id', validation(Schema.subCategorySchema.updateSubCategory),updateSubCategory);
router.delete('/:id', validation(Schema.subCategorySchema.deleteSubCategory),deleteSubCategory);

export default router