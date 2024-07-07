import { Router } from "express";
import { createCart } from "../controllers/cartControllers.js";
import validation from '../middlewares/validation.js';
import Schema from '../validation/index.js'
const router = Router();


// create cart get user cart , get all users cart , delete cart , update cart
router.post('/', createCart)

export default router;