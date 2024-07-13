import { Router } from "express";
import { getAllUsers, login, signUp, forgetPassword, resetPassword, activateUser, updateUserPassword } from "../controllers/authControllers.js";
import isAuth from '../middlewares/authentication.js';
import Authorization from '../middlewares/Authorization.js';
import validation from '../middlewares/validation.js';
import Schema from '../validation/index.js';
const router = Router();


router.post('/auth/signup',validation(Schema.authSchema.signUp) ,signUp);
router.post('/auth/login', validation(Schema.authSchema.login), login);
router.post('/auth/forgetPassword', validation(Schema.authSchema.forgetPassword), forgetPassword);
router.patch('/auth/resetPassword/:token', validation(Schema.authSchema.resetPassword), resetPassword)
router.get('/users', isAuth, Authorization('admin') ,getAllUsers)
router.patch('/auth/Activate', activateUser);
router.patch('/updatePassword', isAuth, Authorization('user'),updateUserPassword);


export default router;