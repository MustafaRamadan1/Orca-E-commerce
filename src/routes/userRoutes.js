import { Router } from "express";
import { getAllUsers, login, signUp, forgetPassword, resetPassword } from "../controllers/authControllers.js";
import isAuth from '../middlewares/authentication.js';
import Authorization from '../middlewares/Authorization.js';
const router = Router();


router.post('/auth/signup', signUp);
router.post('/auth/login', login);
router.post('/auth/forgetPassword', forgetPassword);
router.patch('/auth/resetPassword/:token', resetPassword)




export default router;