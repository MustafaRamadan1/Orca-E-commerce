import { Router } from "express";
import { createSubCategory, deleteSubCategory, getAllSubCategories, getSubCategory, updateSubCategory } from "../controllers/subCategoryControllers.js";

const router = Router();


router.post('/', createSubCategory);
router.get('/', getAllSubCategories);
router.get('/:id', getSubCategory);
router.put('/:id', updateSubCategory);
router.delete('/:id', deleteSubCategory);

export default router