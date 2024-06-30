import crypto from "crypto";
import User from "../Db/models/user.model.js";
import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import jwt from "jsonwebtoken";
import { signToken } from "../utils/helperFunc.js";
import sendEmail from "../utils/sendEmail.js";

export const signUp = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!email || !name || !password)
    return next(new AppError(`Please Provide Required Fields`, 404));

  const newUser = await User.create({
    name,
    email,
    password,
  });

  if (!newUser) return next(new AppError(`Couldn't create new User`, 400));

  const token = signToken({ id: newUser._id });

  res.status(200).json({
    status: "success",
    token,
    data: newUser,
  });
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(
      new AppError("Please Provide Required Fields : Email and Password", 404)
    );

  const user = await User.findOne({ email });

  if (!user)
    return next(new AppError(`Invalid email or password`, 404));

  if (!(await user.CheckPassword(password)))
    return next(new AppError(`Invalid email or password`, 404));

  const token = signToken({ id: user._id });

  res.status(200).json({
    status: "success",
    token,
    data: user,
  });
});

export const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: "success",
    data: users,
  });
});

export const forgetPassword = catchAsync(async (req, res , next)=>{

          const {email} = req.body;
          if(!email) return next(new AppError(`Please Provide Email`, 404));

          const user = await User.findOne({email});
          if(!user) return next(new AppError(`No User with This Email`, 404));

         const token =  user.createResetPasswordToken();

         await user.save();

         await sendEmail({
          to: user.email,
          subject : 'Forget Your Password , Please Check Email to reset it again',
          text : `If you forget your Password Please click on the link below\n
          ${req.protocol}://${req.get('host')}/auth/resetPassword/${token}`
         });

         res.status(200).json({
          status: 'success',
          message: 'Email Sent Successfully'
         })

});

export const resetPassword = catchAsync(async (req, res , next)=>{

  const {token} = req.params; 
  const {newPassword} = req.body;
  
  if (!token || !newPassword)
    return next(new AppError(`Please provide a token and a new password`, 400));

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

      const user = await User.findOne({passwordResetToken: hashedToken, passwordResetExpires: {$gte: Date.now()}});
       
      if(!user) return next(new AppError(`Expired or Invalid Reset Token , Please Try again`, 400));

      user.password = newPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      res.status(200).json({
        status: 'success',
        message: 'Password Reset Successfully'
      })
});