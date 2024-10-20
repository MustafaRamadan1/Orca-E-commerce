import { Router } from "express";
import {
  createPromoCode,
  deletePromoCode,
  getAllPromos,
  getPromoCode,
  getPromoCodeByCode,
  updatePromoCode,
} from "../controllers/promoCodeControllers.js";
import {
  createPromoCodeSchema,
  updatePromoCodeSchema,
} from "../validation/schema/promoCodeSchema.js";
import validation from "../middlewares/validation.js";
const promoCodeRouter = Router();

promoCodeRouter.post("/", validation(createPromoCodeSchema), createPromoCode);
promoCodeRouter.get("/", getAllPromos);
promoCodeRouter.get("/:id", getPromoCode);
promoCodeRouter.get("/filter/:code", getPromoCodeByCode);
promoCodeRouter.put("/:id", validation(updatePromoCodeSchema), updatePromoCode);
promoCodeRouter.delete("/:id", deletePromoCode);

export default promoCodeRouter;
