import { Router } from "express";
import { createReview, getStuff} from "../controllers/reviewControllers.js";


const router = Router();

router.post('/',createReview);
router.get('/:id', getStuff)
export default router;