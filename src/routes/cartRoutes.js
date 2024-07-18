import { Router } from "express";
import { createCart, deleteCart, getAllCarts, getCart, getCartByUserId } from "../controllers/cartControllers.js";
import validation from '../middlewares/validation.js';
import {cartSchema} from '../validation/index.js';
import isAuth from '../middlewares/authentication.js';
import restrictTo from '../middlewares/Authorization.js'
const router = Router();


// create cart get user cart , get all users cart , delete cart , update cart
router.post('/', createCart)

router.get('/', isAuth, restrictTo('admin'), getAllCarts);
router.get('/users/:id', isAuth, restrictTo('admin', 'user'), getCartByUserId);
router.delete('/:id',isAuth, restrictTo('admin'),deleteCart);
router.get('/:id', isAuth, restrictTo('admin'),getCart)
export default router;