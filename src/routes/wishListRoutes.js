import { Router } from "express";
import {addItemToWishList, deleteItemFromUserWishList, getAllWishLists, getWishListForUser} from '../controllers/wishListControllers.js';
import isAuth from '../middlewares/authentication.js';
import restrictTo  from '../middlewares/Authorization.js'
const router = Router();



// add item to wish list , delete item from wish list , get all wish list , get user wish list ,


router.post('/', isAuth, restrictTo('user'),addItemToWishList);
router.get('/', isAuth, restrictTo('admin'),getAllWishLists);
router.get('/:userId/user', isAuth, restrictTo('admin','user'),getWishListForUser);
router.patch('/', isAuth, restrictTo('user'),deleteItemFromUserWishList);



export default router;