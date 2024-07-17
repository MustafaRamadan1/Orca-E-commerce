import { Router } from "express";
import {
  getAllUsers,
  login,
  signUp,
  forgetPassword,
  resetPassword,
  activateUser,
  updateUserPassword,
  deleteUser,
  getUserById,
} from "../controllers/authControllers.js";
import isAuth from "../middlewares/authentication.js";
import Authorization from "../middlewares/Authorization.js";
import validation from "../middlewares/validation.js";
import {authSchema} from "../validation/index.js";
const router = Router();

router.post("/auth/signup", validation(authSchema.signUp), signUp);
router.post("/auth/login", validation(authSchema.login), login);
router.post(
  "/auth/forgetPassword",
  validation(authSchema.forgetPassword),
  forgetPassword
);
router.patch(
  "/auth/resetPassword/:token",
  validation(authSchema.resetPassword),
  resetPassword
);
router.patch("/auth/Activate", activateUser);
router.patch(
  "/auth/updatePassword",
  isAuth,
  Authorization("user"),
  updateUserPassword
);

// add phoneNumber in user model
//users
router.get("/users", isAuth, Authorization("admin"), getAllUsers);
router.get('/users/:id', isAuth,Authorization('admin'), getUserById);
router.delete('/users/deleteUser', isAuth, Authorization('user'), deleteUser);
//delete user 
export default router;
