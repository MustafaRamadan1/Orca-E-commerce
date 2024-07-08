import { Router } from "express";
import { createCart, deleteCart, getAllCarts, getCart, getCartByUserId } from "../controllers/cartControllers.js";
import validation from '../middlewares/validation.js';
import Schema from '../validation/index.js'
const router = Router();


// create cart get user cart , get all users cart , delete cart , update cart
router.post('/', createCart)
router.get('/', getAllCarts);
router.get('/users/:id', getCartByUserId);
router.delete('/:id',deleteCart);
router.get('/:id', getCart)
export default router;