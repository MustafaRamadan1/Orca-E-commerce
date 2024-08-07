import { Router } from "express";
import {
  createCartItem,
  deleteCartItem,
  getCartItemsPerCart,
  updateCartItem,
} from "../controllers/cartItemControllers.js";
import validation from "../middlewares/validation.js";
import { cartItemSchema } from "../validation/index.js";
import isAuth from "../middlewares/authentication.js";
import restrictTo from "../middlewares/Authorization.js";
const router = Router();

// validation(cartItemSchema.createCartItem)
router.post("/", createCartItem);

router.use(isAuth, restrictTo("user"));

router.patch("/:id", updateCartItem);
router.get("/cart/:id", getCartItemsPerCart);
router.delete("/:id", deleteCartItem);

export default router;
