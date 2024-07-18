import {Router} from 'express';

const router = Router();


router.post('/',createFeedBack);
router.get('/',getAllFeedBacks);
router.get('/:id',getFeedBack)



export default router;