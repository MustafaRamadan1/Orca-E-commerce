import { Router } from "express";
import { createCartItem, deleteCartItem, getCartItemsPerCart, updateCartItem } from "../controllers/cartItemControllers.js";
import validation from '../middlewares/validation.js';
import Schema from '../validation/index.js'
const router = Router();



router.post('/',validation(Schema.cartItemSchema.createCartItem),createCartItem)
router.patch('/:id', updateCartItem)
router.get('/cart/:id', getCartItemsPerCart);
router.delete('/:id', deleteCartItem)

export default router;

