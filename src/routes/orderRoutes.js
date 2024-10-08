import { Router } from "express";
import {
  getAllOrders,
  getOrder,
  getUserOrders,
  updateOrder,
} from "../controllers/orderControllers.js";
import isAuth from "../middlewares/authentication.js";
import restrictTo from "../middlewares/Authorization.js";

const router = Router();

// router.use(isAuth, restrictTo('admin'))
router.get("/", getAllOrders);
router.get("/:id", getOrder);
router.get("/:id/user", isAuth, restrictTo("admin", "user"), getUserOrders);
router.patch("/:id", updateOrder);
export default router;

/**
 * update order route to be restricted only to admin
 */
