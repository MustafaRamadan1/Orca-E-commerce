import { Router } from "express";
import { createReview, deleteReview, getAllReviews, getReviewById, getUserReviews, updateReview} from "../controllers/reviewControllers.js";


const router = Router();

router.post('/',createReview);
router.get('/', getAllReviews);
router.get('/:id', getReviewById);
router.get('/:userId/user', getUserReviews);
router.patch('/:id', updateReview);
router.delete('/:id', deleteReview);
export default router;