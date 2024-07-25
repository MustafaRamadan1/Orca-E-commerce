import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getAllCategoriesAdmin,
  getCategory,
  getFilteredCategories,
  updateCategory,
} from "../controllers/categoryControllers.js";
import isAuth from "../middlewares/authentication.js";
import authorization from "../middlewares/Authorization.js";
import validation from "../middlewares/validation.js";
import { categorySchema } from "../validation/index.js";
const router = Router();

router.get("/:name/:params", (req, res, next) => {
  const { name, params } = req.params;
  if (name === "id") {
    req.params.id = params;

    getCategory(req, res, next);
  } else if (name === "filtered") {
    getFilteredCategories(req, res, next);
  }
});

router.get("/", getAllCategories);
router.get("/filtered", getFilteredCategories);
router.get('/allCategoriesAdmin',isAuth, authorization('admin'),getAllCategoriesAdmin)
router.get("/:id", validation(categorySchema.getCategory), getCategory);

router.use(isAuth, authorization("admin"));
router.post("/", validation(categorySchema.createCategory), createCategory);
router.put("/:id", validation(categorySchema.updateCategory), updateCategory);
router.delete(
  "/:id",
  validation(categorySchema.deleteCategory),
  deleteCategory
);


export default router;
