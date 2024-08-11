import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  filterProducts,
  getAllProducts,
  getAllProductsAdmin,
  getProduct,
  getProductById,
  getProductsColors,
  updateProduct,
} from "../controllers/productControllers.js";
import isAuth from "../middlewares/authentication.js";
import Authorization from "../middlewares/Authorization.js";
import uploadImages from "../middlewares/uploadImages.js";
import resizeProductImg from "../utils/resizeProductsImage.js";
import { PRODUCT_IMAGES } from "../constants/index.js";
const router = Router();

router.get("/:name/:params", (req, res, next) => {
  const { name, params } = req.params;
  if (name === "slug") {
    req.params.slug = params;

    getProduct(req, res, next);
  } else if (name === "id") {
    req.params.id = params;
    getProductById(req, res, next);
  }
});

// router.get("/:name/:slug", getProduct);
// router.get("/:name/:id", getProductById);
router.get("/filtered", filterProducts);
router.post(
  "/",
  isAuth,
  Authorization("admin"),
  uploadImages.array("images", PRODUCT_IMAGES),
  resizeProductImg,
  createProduct
);
router.get("/", getAllProducts);
// router.put('/:id',isAuth, Authorization('admin'), updateProduct);
router.delete("/:id", isAuth, Authorization("admin"), deleteProduct);
router.put(
  "/:id",
  isAuth,
  Authorization("admin"),
  uploadImages.array("images", PRODUCT_IMAGES),
  resizeProductImg,
  updateProduct
);

router.get(
  "/allProductsAdmin",
  // isAuth,
  // Authorization("admin", "user"),
  getAllProductsAdmin
);
router.get("/colors", getProductsColors);
export default router;
