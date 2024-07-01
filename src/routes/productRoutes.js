import {Router} from 'express';
import {createProduct, getAllProducts, getProduct} from '../controllers/productControllers.js'
const router = Router();


router.post('/', createProduct);
router.get('/:slug', getProduct)
router.get('/', getAllProducts)


export default router;