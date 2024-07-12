import { Router } from "express";
import { createReview, getAllReviews} from "../controllers/reviewControllers.js";


const router = Router();

router.post('/',createReview);
router.get('/', getAllReviews);
export default router;