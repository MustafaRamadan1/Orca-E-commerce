import { Router } from "express";
import { createReview, deleteReview, getAllReviews, getReviewById, getUserReviews, updateReview} from "../controllers/reviewControllers.js";
import isAuth from '../middlewares/authentication.js';
import restrictTo from '../middlewares/Authorization.js'

const router = Router();

router.post('/', isAuth,restrictTo('user'),createReview);
router.get('/', isAuth,restrictTo('admin'),getAllReviews);
router.get('/:id', isAuth,restrictTo('admin'),getReviewById);
router.get('/:userId/user', isAuth,restrictTo('admin', 'user') ,getUserReviews);
router.patch('/:id', isAuth, restrictTo('admin', 'user'),updateReview);
router.delete('/:id', isAuth, restrictTo('admin', 'user'),deleteReview);
export default router;