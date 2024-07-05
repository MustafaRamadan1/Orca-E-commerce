import {Router} from 'express';
import {createProduct, deleteProduct, filterProducts, getAllProducts, getProduct, updateProduct} from '../controllers/productControllers.js'
import isAuth from '../middlewares/authentication.js';
import Authorization from '../middlewares/Authorization.js';
import uploadImages from '../middlewares/uploadImages.js';
import resizeProductImg from '../utils/resizeProductsImage.js';
const router = Router();

router.get('/filtered', filterProducts)
router.post('/', isAuth, Authorization('admin'),uploadImages.array('images',3),  resizeProductImg, createProduct);
router.get('/:slug', getProduct)
router.get('/', getAllProducts)
// router.put('/:id',isAuth, Authorization('admin'), updateProduct);
router.delete('/:id', deleteProduct);
router.put('/:id',isAuth, Authorization('admin'), uploadImages.array('images',3),  resizeProductImg, updateProduct);

export default router;