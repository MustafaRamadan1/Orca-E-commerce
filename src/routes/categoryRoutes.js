import { Router } from "express";
import { createCategory, deleteCategory, getAllCategories, getCategory, updateCategory } from "../controllers/categoryControllers.js";
import isAuth from '../middlewares/authentication.js';
const router = Router();


router.post('/', createCategory);

router.get('/', isAuth, getAllCategories);
router.get('/:id', getCategory);
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);


export default router;