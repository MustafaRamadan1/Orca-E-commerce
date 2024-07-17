import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategory,
  getFilteredCategories,
  updateCategory,
} from "../controllers/categoryControllers.js";
import isAuth from "../middlewares/authentication.js";
import authorization from "../middlewares/Authorization.js";
import validation from "../middlewares/validation.js";
import { categorySchema } from "../validation/index.js";
const router = Router();

router.get("/", getAllCategories);

router.use(isAuth, authorization("admin"));
router.post("/", validation(categorySchema.createCategory), createCategory);
router.get("/filtered", getFilteredCategories);
router.get("/:id", validation(categorySchema.getCategory), getCategory);
router.put("/:id", validation(categorySchema.updateCategory), updateCategory);
router.delete(
  "/:id",
  validation(categorySchema.deleteCategory),
  deleteCategory
);

export default router;
