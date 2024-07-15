import {Router} from 'express';
import { getAllOrders, getOrder } from '../controllers/orderControllers.js';
import isAuth from '../middlewares/authentication.js';
import restrictTo from '../middlewares/Authorization.js';

const router = Router();

// router.use(isAuth, restrictTo('admin'))
router.get('/', getAllOrders);
router.get('/:id',getOrder)

export default router;