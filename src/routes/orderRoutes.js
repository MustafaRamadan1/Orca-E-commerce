import {Router} from 'express';
import { getAllOrders, getOrder, getUserOrders } from '../controllers/orderControllers.js';
import isAuth from '../middlewares/authentication.js';
import restrictTo from '../middlewares/Authorization.js';

const router = Router();

// router.use(isAuth, restrictTo('admin'))
router.get('/', getAllOrders);
router.get('/:id',getOrder)
router.get('/:id/user', getUserOrders)
export default router;