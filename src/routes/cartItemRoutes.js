import { Router } from "express";
import { createCartItem, deleteCartItem, getCartItemsPerCart, updateCartItem } from "../controllers/cartItemControllers.js";
import validation from '../middlewares/validation.js';
import {cartItemSchema} from '../validation/index.js';
import isAuth from '../middlewares/authentication.js';
import restrictTo from '../middlewares/Authorization.js'
const router = Router();

router.use(isAuth, restrictTo( 'user'))

router.post('/',validation(cartItemSchema.createCartItem),createCartItem)
router.patch('/:id', updateCartItem)
router.get('/cart/:id', getCartItemsPerCart);
router.delete('/:id', deleteCartItem)

export default router;

