import {Router} from 'express';
import {createFeedBack,getAllFeedBacks,getFeedBack} from '../controllers/feedBackControllers.js'
const router = Router();


router.post('/',createFeedBack);
router.get('/',getAllFeedBacks);
router.get('/:id',getFeedBack)



export default router;